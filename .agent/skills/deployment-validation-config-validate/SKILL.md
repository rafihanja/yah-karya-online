---
name: deployment-validation-config-validate
description: Create validation schemas, verify environment variables consistency, and validate configurations at application startup.
risk: critical (missing env variables, unvalidated configurations, runtime database connection failures)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Configuration Validation

> **One-liner:** Guidelines for establishing Zod-based validation schemas, implementing environment overrides checks, and validating configuration schemas at application startup.

## When to Use

- When validating environment configuration parameters (`.env`, config schemas) in node, python, or go applications.
- When configuring deployment validation scripts inside build or CI/CD pipelines.
- When creating schema mappings for microservices parameters and API secrets.

## Why This Exists

Missing or malformed configuration variables (such as incorrect port integers, invalid connection URLs, or missing keys) are a major source of production startup crashes. If an application reads environment parameters at runtime without initial validation, code execution proceeds with invalid parameters, resulting in database query failures or authentication errors deep within the lifecycle. Enforcing strict Zod validation schemas, startup fail-fast gates, and format checks protects applications from configuration-related outages.

## ALWAYS DO THIS

- **Validate configurations at startup** — Parse and validate all required environment variables and parameters before launching the HTTP server.
- **Implement schema-based parsing** — Use robust validation libraries (e.g. Zod, Joi, or Pydantic) to enforce types, formats, and defaults.
- **Fail fast on validation errors** — Terminate the process immediately with an exit code of `1` if validation fails at startup, printing the invalid keys (redacting values).
- **Configure schema validation tests** — Add unit tests that verify configuration validation behavior against mock invalid configurations.
- **Redact secrets in validation logs** — Ensure that validation error messages print key names and validation rules but never cleartext values.

## NEVER DO THIS

- ❌ **DO NOT** read environment keys (like `process.env.DB_URL`) directly in deep business logic modules without upfront schema validation. **Why fails:** Missing variables trigger silent runtime crashes (e.g., `TypeError: Cannot read property of undefined`) hours or days after deploying. **Instead:** Parse variables via a central configuration schema at startup.
- ❌ **DO NOT** allow the application to boot if configuration checks fail. **Why fails:** Running in an invalid state leads to partial functionality, data corruption, or authentication loops. **Instead:** Exit immediately using `process.exit(1)`.
- ❌ **DO NOT** print sensitive API keys or database passwords in configuration verification log outputs. **Why fails:** Compromises credentials by exposing passwords to centralized log dashboards. **Instead:** Print key names and format rules only.
- ❌ **DO NOT** use different validation formats across environments. **Why fails:** Causes mismatch errors when configurations pass checks in development but crash in production. **Instead:** Use a unified schema with environment-specific overrides.

---

## Startup Configuration Verification Flow

Parsing environment properties at startup blocks service launches when errors are found:

```
[Service Boot] ──> [Load process.env Variables] ──> [Run Zod Schema Parse()]
                                                            ├── VALID   ──> [Initialize HTTP Server]
                                                            └── INVALID ──> [Print Error & process.exit(1)]
```

---

## Examples

### ✅ Good — Startup Zod Validation Schema and Fail-Fast Configurations

#### 1. Configuration Validation Schema Module (`src/config/env.ts`)
```typescript
import { z } from "zod";

// 1. Establish strict schema validation layout using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  API_SECRET_KEY: z.string().min(32, "API secret key must be at least 32 characters long")
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

export function validateConfig(): EnvConfig {
  if (config) return config;

  // 2. Parse process.env inputs against the validation schema
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment configuration parameters:");
    // 3. Print key names and validation errors, ensuring values are never logged
    parsed.error.issues.forEach((issue) => {
      console.error(` - Key: ${issue.path.join(".")}, Error: ${issue.message}`);
    });
    // 4. Fail fast by terminating the process immediately
    process.exit(1);
  }

  config = parsed.data;
  return config;
}
```

#### 2. Entry point Configuration Validation (`src/index.ts`)
```typescript
import { validateConfig } from "./config/env";

// Validate configurations before starting the server
const env = validateConfig();

console.log(`🚀 Service running on port ${env.PORT} in ${env.NODE_ENV} mode`);
```

Why this passes: Configures a schema using Zod, handles defaults, prevents deep code runtime checks, logs key issues without revealing values, and terminates execution on failures.

### ❌ Bad — Unvalidated Runtime Calls and Exposing Secrets in Logs

```typescript
import express from "express";

const app = express();

// ERROR 1: Reading configuration parameters directly without schema parsing
const PORT = process.env.PORT || 3000; 

app.get("/items", (req, res) => {
  // ERROR 2: Reading DB connections deep inside routing files.
  // If undefined, this triggers unhandled database connection failures at runtime.
  const dbUrl = process.env.DATABASE_URL;
  connect(dbUrl);
  res.send([]);
});

// ERROR 3: Printing raw environment variables (including passwords) to stdout logs
console.log(`Connecting to: ${process.env.DATABASE_URL}`); 

app.listen(PORT);
```

Why this fails: Reads configurations deep within route callbacks, lacks fail-fast startup checks, and logs raw connection strings containing passwords.

---

## Failure Modes

- **The Silent Runtime Crash:** Postponing configuration checks until code execution reaches database modules, causing delayed crashes.
- **The Exposed Password Log:** Logging raw invalid values during verification checks, exposing secrets to aggregators.
- **The Config Schema Drift:** Using divergent config schemas across development and staging environments.
- **The Silently Ignored Port Error:** Running on fallback ports instead of crashing when custom ports are invalid.
- **The Missing Exit Code:** Catching verification errors and continuing to run the service with invalid parameters.
- **The Zod Coercion Loophole:** Using default string parsers for numeric keys (like `PORT`), failing to enforce integer constraints.

## Validation

Audit application configurations validation, startup checks, and verification schemas:

1. **Verify that Zod/Pydantic schemas validate configurations at startup:**
   Check code entry points:
   ```bash
   grep -rn "safeParse(" src/ 2>/dev/null || grep -rn "parse(" src/ 2>/dev/null
   # expected: Config validators parse env parameters at application startup.
   ```
2. **Verify fail-fast termination on check failures:**
   Verify exit status configs:
   ```bash
   grep -rn "process.exit(1)" src/ 2>/dev/null
   # expected: Invalid configuration parameters trigger a process exit status.
   ```
3. **Verify that raw config secrets are never printed:**
   Verify logs inside config packages:
   ```bash
   grep -rn "console.error(process.env" src/ 2>/dev/null
   # expected: zero matches. Logs redact values and print key paths only.
   ```
4. **Identify config validation schema test coverage:**
   Check testing files for configuration parsing mocks (e.g. `env.test.ts`).

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi validasi deployment:

> "Use the skill `deployment-validation-config-validate`. Read `.agent/skills/deployment-validation-config-validate/SKILL.md` before coding. Never read env variables deep in logic or print values in logs. Always schema-parse parameters at startup, exit on validation failures, and hide secrets."

## Related

- [vercel-deployment](../vercel-deployment/SKILL.md) — Environments parameters.
- [environment-setup-guide](../environment-setup-guide/SKILL.md) — Tool configs templates.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Endpoint verifications.
