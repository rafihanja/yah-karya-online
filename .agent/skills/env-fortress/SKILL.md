---
name: env-fortress
description: Configuration security and secrets management for all development environments, covering Zod schema validation, Git exclusion configs, and leak preventions.
risk: critical (compromised access keys, public secrets exposure, start failures)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Env Fortress

> **One-liner:** Guidelines for managing environment variables and application secrets, configuring Zod startup validations, securing gitignore rules, and preventing key exposures.

## When to Use

- When starting a new project requiring API keys, database credentials, or third-party web tokens.
- When validating required environment variables on server boot to prevent runtime errors.
- When configuring project environment boundaries in monorepo structures.

## Why This Exists

Committing real `.env` files to source repositories exposes access keys to automated scanners, compromising cloud resources in seconds. Similarly, checking for environment variables inside runtime handlers instead of at startup causes applications to fail silently, making debugging difficult. Enforcing early startup validation checks and secure gitignore patterns protects credentials and improves reliability.

## ALWAYS DO THIS

- **Verify environment variables at startup** — Validate all required keys using Zod schemas during the boot phase, crashing early if any are missing.
- **Maintain a public template file** — Provide a `.env.example` file in the root of each project listing required keys without actual values.
- **Exclude secret files in `.gitignore`** — Add `.env` and `.env.*` (excluding `.env.example`) to the global and local `.gitignore` files.
- **Configure individual environments** — Separate credentials for development, staging, and production; never reuse development keys in production.
- **Enforce safe fallback handlers** — Raise a clear configuration error if a required environment variable is missing rather than falling back to dummy values.

## NEVER DO THIS

- ❌ **DO NOT** commit `.env` files containing active credentials to the Git repository. **Why fails:** Git preserves the commit history, making the keys visible to anyone who clones the repository, even if the file is deleted in a later commit. **Instead:** Exclude `.env` files from Git using `.gitignore` and distribute values through secure password managers.
- ❌ **DO NOT** hardcode fallback credentials directly inside your code logic (e.g., `const key = process.env.API_KEY || "sk_live_xyz"`). **Why fails:** Fallbacks bypass environment isolation, leaving active keys in source files and exposing them to the public. **Instead:** Throw a configuration error at startup if the required variable is missing.
- ❌ **DO NOT** use a single global `.env` file in the root of a monorepo workspace. **Why fails:** Shares credentials across projects, increasing exposure and complicating container deployments. **Instead:** Maintain individual `.env` files within each project's subfolder.
- ❌ **DO NOT** print raw environment variables or process secrets to console logs or error outputs. **Why fails:** Exposes credentials in monitoring tools, log files, and error trackers. **Instead:** Sanitize log outputs and hide credentials.

---

## Startup Environment Validation Loop

Checking variable structures on startup prevents errors during execution:

```
[Server Boot] ──> [Zod Schema Validation] ── YES (valid) ──> [Launch Application]
                                         └── NO (missing) ──> [Exit 1 (Print Missing Keys)]
```

---

## Examples

### ✅ Good — Zod Validation Schema, Dotenv Config, and Exits

```typescript
import dotenv from "dotenv";
import { z } from "zod";

// 1. Load environment variables on startup
dotenv.config();

// 2. Define schema to validate expected variables
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => parseInt(val, 10)).default("3000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  OPTIONAL_DEBUG_MODE: z.preprocess((val) => val === "true", z.boolean()).default(false)
});

function validateEnvironmentVariables() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Invalid environment configuration:");
    result.error.issues.forEach((issue) => {
      console.error(`   - [${issue.path.join(".")}] ${issue.message}`);
    });
    console.error("\n📋 Please verify your .env file matches .env.example");
    // 3. Exit process early to prevent invalid runtime execution
    process.exit(1);
  }
  
  console.log("✅ Environment configuration validated successfully.");
  return result.data;
}

// 4. Export validated environment variables
export const env = validateEnvironmentVariables();
```

Why this passes: Loads dotenv at startup, validates variables using Zod schemas, transforms port values to integers, exits early with detailed error messages if validation fails, and hides credentials.

### ❌ Bad — Hardcoded Fallbacks, No Validation, and Unsafe Imports

```typescript
// ERROR 1: Missing environment validation logic at startup

// ERROR 2: Hardcoding credentials directly in source files
const dbUrl = process.env.DATABASE_URL || "postgres://admin:super_secret_pass@localhost:5432/db";

export function callGeminiService() {
  // ERROR 3: Accessing variables dynamically in logic blocks without validation
  const apiKey = process.env.GEMINI_API_KEY; 
  if (!apiKey) {
     // ERROR 4: Soft fallback using dummy values that fail at runtime
     return "mock-response"; 
  }
  
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini?key=${apiKey}`);
}
```

Why this fails: Lacks startup validation checks, hardcodes credentials in fallbacks, accesses variables dynamically in functions, and uses unsafe default values.

---

## Failure Modes

- **The Git History Exposure:** Committing a `.env` file, leaving the keys visible in the repository history even after deleting the file.
- **The Boot Fail Crash:** Deploying an application to production with missing variables, causing it to crash repeatedly on startup.
- **The Logs Data Leak:** Logging the `process.env` object for debugging purposes, exposing credentials in application logs.

## Validation

Cara memverifikasi kepatuhan penggunaan `env-fortress`:

1. **Verify that .env files are excluded from Git:**
   Confirm `.env` matches in `.gitignore`:
   ```bash
   git status --ignored
   # Ensure .env files are listed as ignored
   ```
2. **Verify Zod schema validation exists:**
   Ensure validation schema is imported:
   ```bash
   grep -rn "envSchema" src/
   # Confirm validation runs on start
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengelola environment:

> "Use the skill `env-fortress`. Read `.agent/skills/env-fortress/SKILL.md` before coding. Never commit `.env` files or hardcode credentials in code logic. Always validate required keys using Zod schemas at startup and verify `.env` is listed in your `.gitignore` file."

## Related

- [secrets-management](../secrets-management/SKILL.md) — Secrets auditing strategies.
- [monorepo-multi-bot](../monorepo-multi-bot/SKILL.md) — Monorepo setup patterns.
- [codebase-audit-pre-push](../codebase-audit-pre-push/SKILL.md) — Commit safety checks.
