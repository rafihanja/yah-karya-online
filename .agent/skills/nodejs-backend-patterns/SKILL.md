---
name: nodejs-backend-patterns
description: Comprehensive guidance for building scalable, maintainable, and production-ready Node.js backend applications with modern frameworks, architectural patterns, and best practices.
risk: medium (Express config leaks, memory consumption overloads, transport security failures)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Node.js Backend Patterns

> **One-liner:** Guidelines for setting up secure Express servers, configuring middleware stack security rules, managing payload constraints, and implementing global error middlewares.

## When to Use

- When instantiating new Node.js server frameworks (Express, Fastify) or configuring app entry points.
- When applying security middleware headers (e.g. Helmet, CORS limits) and content compression rules.
- When configuring payload limits to defend against Denial of Service (DoS) attacks.

## Why This Exists

By default, standard Express configurations do not include security headers or body payload limits. Attackers can exploit this to send massive JSON structures that exhaust server memory, leading to a crash. Additionally, missing CORS configurations can expose internal APIs to unauthorized domains. Enforcing secure middleware setups, request throttling, and payload boundaries guarantees backend infrastructure stability.

## ALWAYS DO THIS

- **Secure HTTP response headers** — Mount `helmet()` middleware early in the Express application pipeline to configure secure HTTP headers (e.g., XSS filters, clickjacking blocks).
- **Configure payload size limit restrictions** — Enforce explicit payload constraints on parser middleware (e.g., `express.json({ limit: "10kb" })`) to prevent memory overload.
- **Enforce strict CORS origin filters** — Restrict API access using standard CORS middleware configured with explicit domain allowlists.
- **Implement a global error handler** — Register a centralized error-handling middleware `(err, req, res, next)` at the end of the Express middleware stack.
- **Support Gzip compression** — Compress HTTP payloads using standard `compression` middleware to optimize transfer speeds and lower bandwidth costs.

## NEVER DO THIS

- ❌ **DO NOT** register default, unbounded parser middleware (`app.use(express.json())` without parameters). **Why fails:** Allows attackers to send large payloads (several megabytes or gigabytes) in a single request, which exhausts server RAM and crashes the Node.js process. **Instead:** Define explicit body limits, such as `app.use(express.json({ limit: "10kb" }))`.
- ❌ **DO NOT** configure permissive wildcard CORS policies (`origin: "*"`) on internal API endpoints. **Why fails:** Allows unauthorized third-party scripts to access protected API endpoints, leading to potential data leaks. **Instead:** Enforce explicit domain allowlists in your CORS configuration.
- ❌ **DO NOT** print raw internal database schemas or runtime stack traces directly in API error responses. **Why fails:** Exposes server path details, database engines, and code structures, making it easier for attackers to identify vulnerabilities. **Instead:** Log the detailed error internally and return generic messages to the client.
- ❌ **DO NOT** start the Node.js process directly using `node server.js` in production environments. **Why fails:** If the process encounters an unhandled exception, it exits immediately and leaves the application offline. **Instead:** Run the server using process managers like PM2 or container schedulers that automatically restart crashed instances.

---

## Express Middleware Processing Order

Structuring middleware correctly ensures requests are validated and secured before controllers execute:

```
[HTTP Request] ──> [Helmet / CORS] ──> [Body Parser (10kb Limit)] ──> [Route Handlers] ──> [Central Error Handler]
```

---

## Examples

### ✅ Good — Production-Ready Express Boilerplate Setup

```typescript
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

const app = express();

// 1. Mount security headers early in the pipeline
app.use(helmet());

// 2. Configure strict CORS origin limits
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["https://my-app.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: domain not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 3. Mount payload compression
app.use(compression());

// 4. Enforce strict body parsing limit parameters to prevent DoS attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Mount structured HTTP logging middleware
app.use(morgan("combined"));

// Application Route
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 6. Centralized error handling middleware registered at the end of the stack
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ System Error Captured:", err.message);

  // In production, return sanitized error responses
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "An internal error occurred" : err.message
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
});

// 7. Handle graceful shutdown signals
const shutdown = () => {
  console.log("Shutting down server connection pools...");
  server.close(() => {
    console.log("HTTP server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
```

Why this passes: Mounts Helmet early in the pipeline, configures domain-specific CORS limits, enforces size parameters on parsers, includes compression, registers centralized error handlers, and implements graceful shutdown hooks.

### ❌ Bad — Permissive CORS, Unbounded Parsers, and Missing Error Middleware

```typescript
import express from "express";
import cors from "cors";

const app = express();

// ERROR 1: Permissive wildcard CORS config - exposes the API to all origins
app.use(cors({ origin: "*" }));

// ERROR 2: Unbounded body parsing limit (vulnerable to DoS payload attacks)
app.use(express.json());

// Application Route
app.get("/api/v1/data", (req, res) => {
  try {
    const data = fetchSomeData();
    res.json(data);
  } catch (error: any) {
    // ERROR 3: Leaking raw system stack trace details directly to client responses
    res.status(500).json({ error: error.stack }); 
  }
});

// ERROR 4: Missing centralized Express error handler at the end of the file

// ERROR 5: Bare startup without system shutdown listeners
app.listen(3000);
```

Why this fails: Exposes the API to all domains, allows unrestricted payload sizes, leaks stack trace details, lacks error-handling middleware, and misses process shutdown hooks.

---

## Failure Modes

- **The Payload Memory Exhaustion:** Flooding unbounded parsing endpoints with large JSON bodies, crashing the container.
- **Cross-Origin Information Leak:** Enabling wildcard CORS headers, allowing external sites to read protected cookie profiles.
- **The Raw Error Reveal:** Exposing SQL syntax errors or database file names in response bodies, revealing database structural layouts.

## Validation

Cara memverifikasi kepatuhan penggunaan `nodejs-backend-patterns`:

1. **Verify that body parser limits are configured:**
   Confirm limit constraints in Express initialization files:
   ```bash
   grep -rn "limit:" src/
   # Expected: Explicit limit parameters (e.g., '10kb') are defined on json/urlencoded
   ```
2. **Verify CORS rules configuration:**
   Verify that wildcard origin stars are not configured:
   ```bash
   grep -rn "origin: \"\*\"" src/
   # Expected: No matches in production API routes.
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Express server:

> "Use the skill `nodejs-backend-patterns`. Read `.agent/skills/nodejs-backend-patterns/SKILL.md` before coding. Never register unbounded JSON parsers or wildcard CORS policies. Always define explicit payload limits, mount Helmet security headers early, and register centralized error handling middleware at the end of the stack."

## Related

- [backend-architect](../backend-architect/SKILL.md) — Architectural pattern guidelines.
- [backend-dev-guidelines](../backend-dev-guidelines/SKILL.md) — Express route conventions.
- [env-fortress](../env-fortress/SKILL.md) — Variable validation schemas.
