---
name: secrets-management
description: Secure secrets management practices for CI/CD pipelines using Vault, AWS Secrets Manager, and other tools.
risk: extreme (credentials exposure, cloud account compromises, database wipes)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Secrets Management

> **One-liner:** Guidelines for keeping API keys, database credentials, and certificates secure by preventing code repository exposure and validating runtime environment configurations.

## When to Use

- When configuring API keys (e.g. Stripe, OpenAI) or database credentials.
- When creating environment variable templates (`.env.example`) or configuring local `.env` files.
- When configuring secrets injection setups for CI/CD deployment pipelines (e.g. GitHub Actions, Vercel).

## Why This Exists

Committing raw API keys or database passwords to public repositories is one of the most common causes of security breaches. Automated bots scan code commits constantly; a leaked AWS key can be exploited within minutes, resulting in thousands of dollars in billing charges. Standardizing on zero-hardcoding rules, local git ignores, and strict schema-based environment validation ensures that secrets are kept out of source code and only injected dynamically into running application containers.

## ALWAYS DO THIS

- **Track `.env` in gitignore templates** — Ensure all `.env` variant files are listed inside `.gitignore` files to prevent accidental commits.
- **Provide `.env.example` templates** — Maintain a mock template containing all required environment variable names (without values) to help developers configure setups.
- **Validate environment schemas on boot** — Verify environment variables on application startup using validation schemas (e.g., Zod) and throw descriptive errors if variables are missing.
- **Inject secrets via target providers** — Use secure vaults (like GitHub Secrets, HashiCorp Vault, or AWS Secrets Manager) to inject variables at runtime.
- **Implement automated secret scanners** — Run scanning hooks (like `git-secrets` or Trufflehog) on repositories to identify leaked keys.

## NEVER DO THIS

- ❌ **DO NOT** commit real credentials or private keys directly to any Git repository. **Why fails:** Git history keeps records of all commits; even if a key is deleted in a later commit, it remains retrievable in the git logs. **Instead:** Revoke the key immediately and add it to `.gitignore`.
- ❌ **DO NOT** output raw `process.env` structures or credentials inside application logs or debugging panels. **Why fails:** Leaks API tokens to monitoring consoles and logs aggregator files, where unauthorized staff or intruders can view them. **Instead:** Log anonymized or masked strings (e.g., `sk_live_...4567`).
- ❌ **DO NOT** pass production secrets via chat services, emails, or public documents. **Why fails:** These channels lack proper access controls, raising the risk of unauthorized access. **Instead:** Share variables using encrypted password managers (e.g. 1Password, Bitwarden).
- ❌ **DO NOT** use default admin passwords in staging or production systems. **Why fails:** Port-scanning bots probe database endpoints with default credentials constantly, leading to database compromise. **Instead:** Generate long, random passwords.

---

## Examples

### ✅ Good — Boot-Time Environment Schema Validation and Safe Usage

```typescript
import { z } from "zod";

// 1. Establish strict environment validation schema
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(10),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});

// 2. Validate environment values on boot
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment configuration:", result.error.format());
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();

// Usage
export async function getStripeCharges() {
  // Use strictly typed safe environment variables
  const apiKey = env.STRIPE_SECRET_KEY;
  // Mask key in logging scripts
  console.log(`Connecting to Stripe with API key: ${apiKey.slice(0, 8)}...`);
  // Perform actions...
}
```

Why this passes: Validates required variables on boot, exits immediately on missing keys, and masks secrets in console logs.

### ❌ Bad — Hardcoded Keys and Log Expositions

```typescript
// ERROR 1: Hardcoding sensitive Stripe API keys directly in source code
const STRIPE_SECRET = "sk_live_51NzABC123xyzXYZabc..."; 

export async function processPayment() {
  // ERROR 2: Logging raw credentials to console
  console.log("Processing payment using key:", STRIPE_SECRET); 

  const res = await fetch("https://api.stripe.com/v1/charges", {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET}`
    }
  });
  return res.json();
}
```

Why this fails: Hardcodes keys directly in code, logs raw credentials to console, and lacks boot-time checks.

---

## Failure Modes

- **Git Leak Expositions:** Accidentally adding a `.env` file containing database credentials to a public commit, which compromise the server in minutes.
- **Log Aggregator Exploitation:** Storing full request contexts (including `Authorization` headers or credentials) in monitoring systems, leaking tokens.
- **Default Database Wipes:** Deploying default passwords on open ports, allowing automated ransomware bots to wipe the database.

## Validation

Cara memverifikasi kepatuhan penggunaan `secrets-management`:

1. **Scan for hardcoded secret patterns:**
   Check for potential password/key assignments in code files:
   ```bash
   grep -rE "(api_key|password|secret|token)\s*=\s*['\"][a-zA-Z0-9]+" --exclude-dir=node_modules .
   # Expected: no production credentials are found
   ```
2. **Verify gitignore checks:**
   Confirm that `.env` files are ignored:
   ```bash
   git status --ignored
   # Expected: .env files appear under Ignored files
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengelola credentials:

> "Use the skill `secrets-management`. Read `.agent/skills/secrets-management/SKILL.md` before coding. Never write raw keys inside source files. Always list `.env` inside `.gitignore` files, provide a `.env.example` template, and validate environment variables on boot."

## Related

- [env-fortress](../env-fortress/SKILL.md) — Multi-environment configuration.
- [git-survival-guide](../git-survival-guide/SKILL.md) — Disaster recovery.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — API transport protection.
