---
name: sentry-automation
description: Automate Sentry tasks via Rube MCP (Composio) to triage issues, configure alert rules, track releases, and monitor crons.
risk: high (alert fatigue, webhook loops, missing source maps, credentials leakage)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Sentry Automation

> **One-liner:** Guidelines for automating error triaging via Sentry MCP endpoints, registering releases, uploading source maps, and monitoring cron job parameters.

## When to Use

- When using Rube MCP (Composio Sentry toolkit) to query, resolve, or assign error issues programmatically.
- When configuring automated alert rules, metric triggers, or Slack webhooks.
- When tracking project releases, deployments, and cron check-ins.

## Why This Exists

Triaging thousands of production errors manually is slow and leads to service outages. However, if automated scripts query Sentry endpoints without specific query bounds (such as scanning unresolved errors without date limits), the API hits rate limits (HTTP 429) and gets blocked. Additionally, if source map uploads are omitted during builds, stack traces remain obfuscated, preventing root-cause identification. Enforcing non-blocking cursor queries, Svix webhook signature checks, and automated source maps upload secures error monitoring pipelines.

## ALWAYS DO THIS

- **Verify Rube MCP status** — Run tool searches (`RUBE_SEARCH_TOOLS`) to confirm the Sentry toolkit is connected and authenticated before running workflows.
- **Use organization slugs, not names** — Pass URL-safe organization and project slugs (e.g. `my-org-slug`) rather than their display names to Sentry API calls.
- **Implement cursor pagination** — Iterate over paginated issue lists using the `cursor` property returned in response headers.
- **Upload source maps during builds** — Upload JS source maps (`sentry-cli sourcemaps upload`) during deployment builds to enable readable stack traces.
- **Configure cron job grace margins** — Set a check-in margin (in minutes) for cron monitors to prevent temporary latency spikes from triggering false alarms.

## NEVER DO THIS

- ❌ **DO NOT** query Sentry issues using empty query strings or without date limits. **Why fails:** Returns thousands of legacy resolved issues, causing high latency, token bloat, and hitting rate limits. **Instead:** Query with specific bounds (e.g., `is:unresolved status:unassigned`).
- ❌ **DO NOT** use event IDs (UUIDs) when querying issue details endpoints that require numeric issue IDs. **Why fails:** The Sentry API returns a 404 error because issue IDs are numeric, whereas event IDs are hex strings. **Instead:** Retrieve the correct numeric issue ID from listing endpoints.
- ❌ **DO NOT** register alert rule actions without checking project notification bounds. **Why fails:** Causes duplicate alert rules that flood Slack/PagerDuty, resulting in on-call alert fatigue. **Instead:** Check existing rules using `SENTRY_RETRIEVE_PROJECT_RULES` first.
- ❌ **DO NOT** commit raw auth tokens or credentials inside Sentry configuration files. **Why fails:** Exposes credentials to public source code repositories, compromising Sentry access. **Instead:** Inject the token via `SENTRY_AUTH_TOKEN` environment variables.

---

## Sentry Triaging Pipeline

Triaging issues using automated tools isolates failures and assigns resolution routes:

```
[Sentry Issue Triggered] ──> [Fetch Details via Numeric ID] ──> [Check Tag Distributions]
                                                                        │
                                [Assign to Team / Alert Slack] ◄────────┘ (Non-blocking updates)
```

---

## Examples

### ✅ Good — Programmatic Triage and Cron Monitor Setup

#### 1. Checking Issues via Rube MCP Tool Schema
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function triageActiveSentryErrors() {
  // Query unresolved, high-frequency Sentry issues using specific search bounds
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find all unresolved Sentry issues in 'my-org' with more than 100 events seen in the last 24h.",
    config: {
      systemInstruction: `
      You are an SRE assistant. Use the Composio Sentry toolkit via Rube MCP to gather telemetry data.
      Always check organization slugs and run queries using:
      SENTRY_LIST_AN_ORGANIZATIONS_ISSUES(organization_id_or_slug='my-org', query='is:unresolved times-seen:>100')
      `
    }
  });

  return response.text;
}
```

#### 2. Creating a Cron Job Monitor Configuration
```typescript
// Sentry CLI cron job check-in wrapper
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1
});

export async function runCronJob() {
  // 1. Start a cron check-in transaction
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "daily-database-backup",
    status: "in_progress"
  });

  try {
    await database.backup();
    
    // 2. Report success check-in
    Sentry.captureCheckIn({
      monitorSlug: "daily-database-backup",
      status: "ok",
      checkInId
    });
  } catch (error) {
    // 3. Report fail check-in
    Sentry.captureCheckIn({
      monitorSlug: "daily-database-backup",
      status: "error",
      checkInId
    });
    Sentry.captureException(error);
    throw error;
  }
}
```

Why this passes: Queries Sentry using specific search boundaries via the MCP, initializes cron job transactions, reports execution check-in states, and handles errors.

### ❌ Bad — Hardcoded Identifiers, Empty Queries, and Unmonitored Crons

```typescript
// ERROR 1: Querying Sentry without limits or filters (token bloat & rate limits)
export async function badSentryQuery(client: any) {
  const result = await client.listIssues({
    org: "My Org Display Name", // ERROR 2: Using org name instead of slug
    query: "" // Empty query returns everything
  });
  return result;
}

// ERROR 3: Running a cron task without check-in boundaries
export async function badCronRun() {
  try {
    await database.backup();
  } catch (error) {
    // Missing backup alert checks
    console.log(error); 
  }
}
```

Why this fails: Queries without limits, passes display names instead of slugs, and runs cron tasks without check-in monitors.

---

## Failure Modes

- **The Slug Mismatch 404:** Passing org names (e.g. `My Company Inc`) to Sentry APIs instead of URL-safe slugs, causing query failures.
- **The Empty Filter Rate Limit:** running issue queries without filters, hitting Sentry rate limit limits.
- **The Obfuscated Trace Outage:** Forgetting to upload source maps during build pipelines, leaving trace logs unreadable.
- **The Alert Flood Fatigue:** Configuring duplicate alerts with short check intervals, causing high alert noise.
- **The Token leak vulnerability:** Storing the `SENTRY_AUTH_TOKEN` value in cleartext files.
- **The Silent Cron Failure:** Running cron jobs without check-in hooks, leaving backups to fail silently.

## Validation

Audit Sentry integration variables, alert configurations, and release files:

1. **Verify that Sentry auth tokens are loaded from environment variables:**
   Check code and workflow files:
   ```bash
   grep -rn "SENTRY_AUTH_TOKEN" .github/workflows/ 2>/dev/null
   # expected: Tokens are bound from secrets (e.g. secrets.SENTRY_AUTH_TOKEN).
   ```
2. **Verify Sentry SDK initialization parameters:**
   Check initialization files:
   ```bash
   grep -rn "Sentry.init" src/
   # expected: Setup includes DSN configs and error handler parameters.
   ```
3. **Verify Sentry CLI source map configurations:**
   Check package build files:
   ```bash
   grep -rn "sentry-cli sourcemaps" package.json 2>/dev/null
   # expected: Build or post-build scripts upload source maps to Sentry.
   ```
4. **Inspect active alert rules list:**
   Check alert rules configurations to verify there are no duplicate triggers or excessive alerts.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Sentry:

> "Use the skill `sentry-automation`. Read `.agent/skills/sentry-automation/SKILL.md` before coding. Never run queries without limits or expose auth tokens. Always check organization slugs, implement pagination, upload source maps in build files, and configure cron check-ins."

## Related

- [observability-engineer](../observability-engineer/SKILL.md) — Production log tracing.
- [github-actions-templates](../github-actions-templates/SKILL.md) — Build deployment pipelines.
- [nodejs-best-practices](../nodejs-best-practices/SKILL.md) — Runtime error logs.
