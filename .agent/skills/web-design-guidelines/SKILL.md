---
name: web-design-guidelines
description: Review files for compliance with Web Interface Guidelines.
risk: safe
source: "Elite Agent Operations - Batch 3E (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Interface Guidelines Review

> **One-liner:** Guidelines for fetching Web Interface Guidelines from source repositories and running visual audits using standardized formatting.

## When to Use

- When auditing stylesheets, templates, or HTML structures for visual compliance.
- When validating color token mappings, typography line-heights, and interactive outlines.
- When generating systematic error logs listing design guide deviations in components.

## Why This Exists

Frontend layouts easily diverge from design specs when multiple developers edit the same files. Bypassing line-height scales, hardcoding custom border radii, or writing inline sizes leads to a messy UI. Fetching the official guidelines dynamically and outputting violations in a structured format (such as `file:line`) allows developers to locate and resolve visual inconsistencies quickly.

## ALWAYS DO THIS

- **Fetch the latest guidelines from the source repository** — Fetch fresh guidelines from the official Vercel Labs repository: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` before starting audits.
- **Output violations in standard file:line format** — Format all findings cleanly using the pattern: `[FilePath]:[LineNumber] - [GuidelineRule] (Details)`.
- **Review spacing tokens against base scale** — Cross-reference padding, margins, and gaps against standard spacing configurations to flag arbitrary overrides.
- **Verify responsive image wrapper configurations** — Ensure all media elements map explicit width/height aspects to avoid layout shifts.
- **Audit form validation outline states** — Validate that all inputs apply distinct focus styles and descriptive keyboard accessibility wrappers.

## NEVER DO THIS

- ❌ **DO NOT** use cached or stale copies of the guidelines files. **Why fails:** Rules, contrast ratios, and recommended typography packages change over time, leading to outdated audit recommendations. **Instead:** Always fetch the guidelines dynamically using network tools.
- ❌ **DO NOT** perform automated styling fixes directly on audited files without user confirmation. **Why fails:** Can break custom component logic or trigger hydration errors. **Instead:** Output the findings first and let the user approve fixes.
- ❌ **DO NOT** run visual guideline checks on non-interface files (such as database configs, build scripts, or backend routing functions = ❌). **Why fails:** Generates false positives and slows down execution. **Instead:** Restrict the audit scope to frontend files (e.g., TSX, JSX, CSS).
- ❌ **DO NOT** report subjective design critiques as strict rule violations. **Why fails:** Dilutes the authority of the guide. **Instead:** Distinguish hard rule violations from optional layout suggestions.

---

## Web Interface Audit & Reporting Pipeline

Fetching rules, scanning codebase, and generating structured reports:

```
[Fetch raw guidelines] ──> [Scan Frontend Files (TSX/CSS)] ──> [Apply Rules checklist] ──> [Output file:line violations]
```

---

## Examples

### ✅ Good — Dynamic Fetching, Scoped Scans, and Structured Reporting

#### 1. Audit Script to Verify Interface Compliance (`scripts/auditUi.js`)
```javascript
const fs = require("fs");
const path = require("path");

// 1. Target check function applying fetched rule bounds
function checkFileForArbitrarySpacing(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // 2. Identify arbitrary width configurations violating spacing tokens
    if (line.includes("w-[") || line.includes("p-[") || line.includes("m-[")) {
      // Avoid flagging image aspect ratio overrides or complex translations
      if (!line.includes("aspect-") && !line.includes("translate")) {
        const lineNumber = index + 1;
        // 3. Output findings using the standardized file:line format
        console.log(`${filePath}:${lineNumber} - [RULE: Spacing Token Override] Found arbitrary layout configuration.`);
      }
    }
  });
}

// Scoping audit exclusively to frontend files
const targetFile = path.join(__dirname, "../src/components/Button.tsx");
if (fs.existsSync(targetFile)) {
  checkFileForArbitrarySpacing(targetFile);
}
```

Why this passes: Fetches guidelines dynamically (simulated in step), scopes audits exclusively to frontend component code, checks for specific spacing rules, and outputs violations using the standardized `file:line` format.

### ❌ Bad — Static Cached Check, Auto-fixes without approval, and Generic Logs

```javascript
// ERROR 1: Reading from static cached rules file (can easily become stale)
const cachedRules = require("../config/cached-rules.json");

function badAutoFix(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  
  // ERROR 2: Auto-fixing arbitrary sizing values without developer approval
  content = content.replace(/p-\[\d+px\]/g, "p-4"); 
  fs.writeFileSync(filePath, content);
  
  // ERROR 3: Printing generic, non-standardized logs lacking file:line markers
  console.log("Successfully fixed visual spacing errors inside files.");
}
```

Why this fails: Relies on static cached rules instead of fetching them dynamically, applies automatic layout alterations without developer confirmation, and outputs generic logs lacking `file:line` indicators.

---

## Failure Modes

- **The Stale Cache Lock:** Auditing with cached guidelines, missing updated system requirements.
- **The Code Break Auto-Fix:** Overwriting component markup automatically, causing build compilation errors.
- **The Scoping Clutter:** Running visual rules checks on backend modules, generating false positives.
- **The Vague Alert Output:** Printing generic logs without `file:line` markers, making violations hard to locate.
- **The Subjective Deviation:** Flagging creative layout overrides as absolute violations, blocking normal deploys.

## Validation

Verify guidelines fetch, scope rules, and formatting structures:

1. **Verify that guidelines are fetched dynamically:**
   Check audit scripts for source URL references:
   ```bash
   grep -rn "vercel-labs/web-interface-guidelines" scripts/ 2>/dev/null
   # expected: Audit scripts reference the official raw github source.
   ```
2. **Scan for correct log formatting:**
   Ensure outputs use the `file:line` structure:
   ```bash
   grep -rn "console.log" scripts/ | grep ":" 2>/dev/null
   # expected: Output statements log findings in the file:line format.
   ```
3. **Verify audit file type limits:**
   Ensure checks target only UI files:
   ```bash
   grep -rn "\.tsx\|\.css\|\.html" scripts/ 2>/dev/null
   # expected: Scan targets are restricted to frontend paths.
   ```
4. **Identify layout-level database calls:**
   Ensure components don't include backend database queries.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan audit desain web:

> "Use the skill `web-design-guidelines`. Read `.agent/skills/web-design-guidelines/SKILL.md` before coding. Never audit using static files or apply auto-fixes without approval. Always fetch rules dynamically, restrict scope to UI files, and format reports in the file:line pattern."

## Related

- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Visual alignment guidelines.
- [baseline-ui](../baseline-ui/SKILL.md) — Component compliance audits.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Manual layout verification.
