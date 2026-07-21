---
name: codebase-audit-pre-push
description: Deep audit before GitHub push - removes junk files, dead code, security holes, and optimization issues.
risk: high (requires file deletion operations, git config adjustments, security checks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Pre-Push Codebase Audit

> **One-liner:** Guidelines for performing line-by-line codebase audits to eliminate credentials leaks, remove build artifacts/junk files, clean dead code, and verify production build stability.

## When to Use

- When auditing the repository before pushing to a remote target (e.g. GitHub).
- When converting a private repository to public access.
- When performing a final clean-up cycle at the end of a milestone release.

## Why This Exists

Committing junk files (like `.DS_Store` or `npm-debug.log`) bloats the repository, while hardcoded credentials can lead to immediate security breaches. Additionally, leaving debugging leftovers (like `test.only` focus hooks or active `console.log` statements) inside code bases pollutes execution logs. Running a systematic pre-push audit guarantees that only clean, secure, and production-ready code is pushed to production.

## ALWAYS DO THIS

- **Verify `.gitignore` boundaries** — Ensure build outputs (`dist/`, `.next/`), local config overrides (`.env`), and dependencies (`node_modules/`) are listed inside `.gitignore`.
- **Remove all dead and commented code** — Delete obsolete functions, unused imports, and commented blocks of code to keep the source clean.
- **Scan commits for secrets** — Execute regex searches to locate hardcoded passwords, tokens, or private key blocks before pushing.
- **Clean test hooks** — Verify that no test focus tags (like `test.only` or `fdescribe`) remain inside test files, preventing skipped tests in CI suites.
- **Provide configuration examples** — Maintain a complete `.env.example` file listing all required environment keys with blank values.

## NEVER DO THIS

- ❌ **DO NOT** push code containing hardcoded secret values to a remote repository. **Why fails:** The secret becomes part of the permanent git history; even if you remove it in the next commit, anyone can retrieve it from the git log, compromising credentials. **Instead:** Add `.env` to `.gitignore` and rotate the exposed credentials immediately.
- ❌ **DO NOT** commit temporary log files, OS artifacts, or local backup files (e.g., `*.log`, `.DS_Store`, `app_backup.js`). **Why fails:** Bloats the repository size, pollutes file trees, and creates merge conflicts. **Instead:** Exclude them using `.gitignore` patterns and delete local copies.
- ❌ **DO NOT** leave active testing limits (`test.only` or `it.only`) in test suites. **Why fails:** Prevents other tests in the suite from running in CI/CD pipelines, giving a false sense of security. **Instead:** Use standard `test` commands.
- ❌ **DO NOT** use wildcard selectors (like `SELECT *` in database calls or `import *` in JavaScript). **Why fails:** Increases database and network payload sizes, potentially breaking code when new columns/modules are added. **Instead:** Specify exact fields or module names.

---

## Pre-Push Audit Checklist

### 1. Junk Files (Delete Immediately)
- OS files: `.DS_Store`, `Thumbs.db`
- Local logs: `*.log`, `npm-debug.log*`
- Build folders: `dist/`, `.next/`, `node_modules/`

### 2. Clean Code Audit
- Commented code: Remove all commented blocks.
- Unused code: Delete unused imports, variables, and functions.
- Formatting: Ensure ESLint/Prettier checks pass without errors.

---

## Examples

### ✅ Good — Clean Git Config, Secure Env Template, and Specific Imports

```typescript
// 1. Import only the specific functions needed instead of wildcard modules
import { format } from "date-fns";

interface UserProfile {
  id: string;
  name: string;
}

// 2. Perform actions using typed parameters and robust error handles
export async function fetchProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Profile fetch failed: ${response.statusText}`);
  }
  return response.json();
}
```

Why this passes: Limits imports to specific functions, defines clear interfaces, handles network errors, and uses relative path mappings.

### ❌ Bad — Staging Build Artifacts, Wildcards, and Hardcoded Credentials

```javascript
// ERROR 1: Wildcard imports inflate bundle sizes
import * as _ from "lodash"; 

// ERROR 2: Hardcoding credentials directly in source files
const API_SECRET_KEY = "sk_live_xyz123"; 

export function processOldWay(data) {
  // ERROR 3: Commented-out dead code blocks left in codebase
  // console.log("Debugging user payload:", data);
  // if (data.status === 'active') {
  //   return data;
  // }
  
  // ERROR 4: Using loose equality comparison and vague naming
  if (data == "active") {
    return data;
  }
}
```

Why this fails: Imports wildcard modules, hardcodes sensitive credentials, leaves dead code comments, and uses loose equality checks.

---

## Failure Modes

- **Silent CI/CD Success:** Leaving `test.only` in test suites passes CI checks while skipping the rest of the test suite.
- **Accidental Build Artifact Commits:** Pushing `node_modules` or `.next/` folders to GitHub, slow-loading git clones due to huge payload sizes.

## Validation

Cara memverifikasi kepatuhan penggunaan `codebase-audit-pre-push`:

1. **Verify git status for ignored files:**
   Ensure no `.env` or build folders are tracked:
   ```bash
   git status --ignored
   # Expected: .env and node_modules appear in ignored directories
   ```
2. **Scan for test focus hooks:**
   Verify no `test.only` hooks remain:
   ```bash
   grep -rn "test.only" tests/
   # Expected: no matches found
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan pembersihan pre-push:

> "Use the skill `codebase-audit-pre-push`. Read `.agent/skills/codebase-audit-pre-push/SKILL.md` before proceeding. Never push build output folders or hardcoded credentials. Always clean up commented-out blocks, delete focus testing hooks, and verify git ignore files."

## Related

- [code-reviewer](../code-reviewer/SKILL.md) — Code review checklist.
- [self-review-gate](../self-review-gate/SKILL.md) — Pre-delivery gate.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Success checks.
