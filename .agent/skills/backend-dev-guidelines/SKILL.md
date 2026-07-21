---
name: backend-dev-guidelines
description: Senior backend engineer operating guidelines for production-grade services under strict architectural and reliability constraints.
risk: medium (unhandled promise rejections, console logs leaks, configuration drifts)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Backend Development Guidelines

> **One-liner:** Guidelines for constructing production-grade Express and TypeScript backend architectures, enforcing async error wrappers, and centralizing environment configurations.

## When to Use

- When writing routes, controllers, middleware, or repository layers in Express/TypeScript backend projects.
- When configuring error-capturing filters (e.g. Sentry error tracers) or centralized config loaders.
- When setting up logging and performance monitoring inside backend services.

## Why This Exists

If asynchronous routes in Express lack centralized error catch wrappers, unhandled promise rejections will crash the application server or hang request sockets. Furthermore, accessing raw environment variables (`process.env.VAR`) directly inside application files makes config verification difficult and leads to silent runtime errors. Standardizing on route wrappers, centralized configurations, and structured log handlers ensures uptime and observability.

## ALWAYS DO THIS

- **Wrap async route handlers** — Always wrap asynchronous routes inside an error catcher (like `asyncErrorWrapper`) to forward runtime exceptions to the Express error middleware.
- **Access variables via centralized configs** — Import properties from a centralized config object (e.g. `unifiedConfig.ts`) rather than querying `process.env` directly.
- **Extend controllers from a base class** — Use a `BaseController` class to standardize HTTP responses (`handleSuccess`, `handleError`) and log events.
- **Log exceptions to central trackers** — Send runtime exceptions to dedicated error monitoring services (such as Sentry) instead of printing raw stack traces with `console.log`.
- **Implement request validation middleware** — Validate request headers, bodies, and parameters before passing control to backend controller functions.

## NEVER DO THIS

- ❌ **DO NOT** execute async operations in route definitions without a try/catch wrapper or async error middleware. **Why fails:** If an error is thrown inside a promise, the server will either crash due to an unhandled rejection or hang the socket indefinitely, leaking memory. **Instead:** Wrap route definitions inside `asyncErrorWrapper` middleware.
- ❌ **DO NOT** query raw `process.env` variables directly in your application files. **Why fails:** Missing variables are not detected on startup, which can cause unexpected runtime crashes when a function attempts to read a missing key. **Instead:** Parse variables into a centralized config object on startup.
- ❌ **DO NOT** use `console.log` or `console.error` to record backend server errors. **Why fails:** Log streams lack structured metadata (like trace IDs, timestamps, or request scopes) and are difficult to monitor at scale. **Instead:** Use a structured logger (like Winston or Pino) and forward exceptions to Sentry.
- ❌ **DO NOT** skip layers in your backend architecture (e.g., calling repositories directly from controllers). **Why fails:** Bypasses business validation rules, tightly couples transport structures to database logic, and limits codebase reusability. **Instead:** Always route requests through the Service layer.

---

## Express Error Propagation Flow

Routing exceptions through wrappers protects the main server thread from crashing:

```
[Express Route] ──> [asyncErrorWrapper] ──> [Exception Raised] ──> [Next(error)] ──> [Error Middleware] ──> [Sentry]
```

---

## Examples

### ✅ Good — Express BaseController, Async Wrapper, and Centralized Configs

#### 1. Centralized Configuration (`src/config/unifiedConfig.ts`)
```typescript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  port: z.string().transform((v) => parseInt(v, 10)).default("3000"),
  env: z.enum(["development", "production", "test"]).default("development"),
  db: z.object({
    url: z.string().url()
  }),
  sentry: z.object({
    dsn: z.string().optional()
  })
});

const parsed = configSchema.safeParse({
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  db: { url: process.env.DATABASE_URL },
  sentry: { dsn: process.env.SENTRY_DSN }
});

if (!parsed.success) {
  console.error("❌ Config validation failed:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
```

#### 2. Async Error Wrapper (`src/middleware/asyncWrapper.ts`)
```typescript
import { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncErrorWrapper(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

#### 3. Base Controller (`src/controllers/base.controller.ts`)
```typescript
import { Response } from "express";
import * as Sentry from "@sentry/node";

export abstract class BaseController {
  protected handleSuccess(res: Response, data: any, statusCode = 200) {
    res.status(statusCode).json({ success: true, data });
  }

  protected handleError(res: Response, error: any, contextMsg: string) {
    console.error(`❌ [${contextMsg}] Error:`, error);
    
    // Capture exception in Sentry for monitoring
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }

    res.status(error.status || 500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}
```

#### 4. Route Registration (`src/routes/user.routes.ts`)
```typescript
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncErrorWrapper } from "../middleware/asyncWrapper";

const router = Router();
const userController = new UserController();

// Wrap route handler to catch errors automatically
router.get("/users/:id", asyncErrorWrapper(async (req, res) => {
  await userController.getUser(req, res);
}));

export default router;
```

Why this passes: Centralizes config schemas, implements async error wrappers, routes uncaught promises through Express middleware, standardizes controller response methods, and catches errors using tracking utilities.

### ❌ Bad — Direct process.env, Missing Wrappers, and Raw console.logs

```typescript
import { Router } from "express";
import { Pool } from "pg";

const router = Router();
const db = new Pool();

// ERROR 1: Missing asyncErrorWrapper - crashes the server if the database query fails
router.get("/users/:id", async (req, res) => {
  // ERROR 2: Direct database access from the routing layer without a controller
  // ERROR 3: Direct use of process.env in code logic
  if (process.env.DEBUG === "true") {
    // ERROR 4: Using console.log instead of a structured logging utility
    console.log("Fetching user: ", req.params.id); 
  }

  const result = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  res.json(result.rows[0]);
});

export default router;
```

Why this fails: Lacks async error wrappers, writes query statements inside route definitions, queries process.env directly, and relies on console logs for tracking.

---

## Failure Modes

- **The Unhandled Rejection Crash:** Fetching data from a service that fails, crashing the server process due to missing async wrappers.
- **The Missing Key Crash:** Deploying an app with a missing production database variable that was not verified on startup.
- **The Silent Request Freeze:** Forgetting to call `next(error)` in an async catch block, leaving the client connection hanging indefinitely.

## Validation

Cara memverifikasi kepatuhan penggunaan `backend-dev-guidelines`:

1. **Verify that async routes are wrapped in asyncErrorWrapper:**
   Verify code files for route wrapper registrations:
   ```bash
   grep -rn "asyncErrorWrapper" src/routes/
   # Confirm routes are wrapped securely
   ```
2. **Verify no direct access to process.env:**
   Confirm variables are accessed via the unified config:
   ```bash
   grep -rn "process.env" src/
   # Verify that process.env only appears in config or validation files
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengimplementasikan backend routes:

> "Use the skill `backend-dev-guidelines`. Read `.agent/skills/backend-dev-guidelines/SKILL.md` before coding. Never write async routes without wrapping them in asyncErrorWrapper or query process.env directly inside controllers. Always use unifiedConfig objects, standard base controllers, and verify variables on startup."

## Related

- [backend-architect](../backend-architect/SKILL.md) — Layered code separation.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Express boilerplate setups.
- [env-fortress](../env-fortress/SKILL.md) — Zod startup schemas.
