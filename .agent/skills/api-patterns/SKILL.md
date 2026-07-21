---
name: api-patterns
description: API design principles. REST vs GraphQL vs tRPC, standard response formats, versioning, rate limiting.
risk: low (safe structural patterns, validation boundaries)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# API Patterns

> **One-liner:** Guidelines for structuring consistent API patterns, comparing REST vs GraphQL vs tRPC, securing route endpoints with rate-limiting maps, and enforcing versioned contracts.

## When to Use

- When selecting between REST, GraphQL, or tRPC for client-server communication channels.
- When configuring global API response headers, versioned route selectors, or request rate limiters.
- When documenting integration contracts (e.g. OpenAPI/Swagger specifications) for frontend teams.

## Why This Exists

If an API lacks structured response envelopes, the frontend code has to handle different JSON formats for success and error conditions. Additionally, leaving auth endpoints (like `/login` or `/reset-password`) without rate limiting exposes them to brute-force attacks, while missing API versioning numbers leads to breaking changes when the database schema changes. Enforcing uniform wrappers, versioned endpoints, and rate-limiting middleware secures APIs and ensures stable client integrations.

## ALWAYS DO THIS

- **Version all API endpoints** — Include a clear version indicator in the URL path (e.g., `/api/v1/users`) or in the request headers.
- **Enforce standardized JSON response envelopes** — Wrap API responses in an object containing top-level properties like `success`, `data` (for successful payloads), and `error` (for failures).
- **Apply rate limiting on authentication routes** — Configure rate-limiting middleware (using Redis or in-memory token buckets) on public, authentication, and heavy write routes.
- **Select the appropriate API paradigm** — Match the communication style to your needs: tRPC for type-safe TypeScript integrations, GraphQL for client-defined queries, and REST for standard public endpoints.
- **Document contracts before coding** — Draft the OpenAPI or tRPC schemas first to align client and server structures before implementation.

## NEVER DO THIS

- ❌ **DO NOT** modify, update, or write data to databases inside GET route handlers. **Why fails:** Browsers, search engines, and CDN proxies pre-fetch and cache GET requests, which can trigger accidental database mutations. **Instead:** Use `POST`, `PUT`, or `DELETE` requests for database writes.
- ❌ **DO NOT** return success and failure responses with inconsistent root JSON schemas. **Why fails:** Forces frontend developers to write complex error checking logic to handle different payload shapes, leading to UI rendering bugs. **Instead:** Wrap all responses in a standard envelope structure.
- ❌ **DO NOT** expose internal database IDs directly in URLs or public responses. **Why fails:** Allows attackers to guess IDs sequentially (e.g., `/api/v1/users/1`, `/api/v1/users/2`) to scrape data. **Instead:** Use UUIDv4 or randomized hash identifiers (like Hashids).
- ❌ **DO NOT** deploy public API endpoints without rate limiters. **Why fails:** Exposes the server to denial of service (DoS) attacks and brute-force hacks on login routes. **Instead:** Implement rate-limiting middleware with Redis backups.

---

## API Paradigm Selection Matrix

Choose the paradigm that fits your development environment:

```
[Project Type] ── TypeScript Fullstack? ──> YES ──> [tRPC (Zero-API boilerplate)]
                └── Mixed / Public API? ──> YES ──> [REST / GraphQL]
```

---

## Examples

### ✅ Good — Standard Envelopes, Versioned Routing, and Redis Rate Limiting

```typescript
import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());

// 1. Versioned route prefixing
const v1Router = express.Router();

// 2. Configure rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    // 3. Return a standardized error envelope
    res.status(429).json({
      success: false,
      data: null,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please try again after 15 minutes."
      }
    });
  }
});

v1Router.post("/auth/login", authLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(420).json({
      success: false,
      data: null,
      error: {
        code: "MISSING_CREDENTIALS",
        message: "Email and password are required."
      }
    });
  }

  // 4. Return a standardized success envelope
  res.status(200).json({
    success: true,
    data: {
      user: { id: "usr_12345", email },
      token: "jwt_token_payload..."
    },
    error: null
  });
});

// Register versioned router
app.use("/api/v1", v1Router);
```

Why this passes: Versions the URL path (`/api/v1/auth/login`), configures rate limits on the authentication route, wraps success and error responses in a standard JSON envelope, and uses clear error codes.

### ❌ Bad — Unversioned Routes, Unwrapped Schemas, and Missing Rate Limits

```typescript
import express from "express";

const app = express();
app.use(express.json());

// ERROR 1: Unversioned route endpoint - prone to breaking changes
// ERROR 2: Mutating database or authentication state inside a GET request
app.get("/loginUser", (req, res) => {
  const { email, password } = req.query;

  if (email === "admin@db.com" && password === "123") {
    // ERROR 3: Returning a flat JSON response with a different schema than the error payload
    return res.status(200).json({
      userId: 1,
      role: "admin",
      token: "secret"
    });
  }

  // ERROR 4: Returning raw string errors instead of structured JSON objects
  res.status(400).send("Login failed!"); 
});

// ERROR 5: No rate limiter on authentication endpoints
```

Why this fails: Uses unversioned routing, modifies authentication state via GET, returns inconsistent JSON schemas, sends raw text error responses, and lacks rate limiting.

---

## Failure Modes

- **The Version Lock:** Releasing updates to public endpoints without versioning, breaking client apps that depend on the old schema.
- **The Success/Error mismatch:** Returning a list array on success, but a nested error object on failure, which crashes client parsers.
- **The Authentication Flooding:** Leaving login routes exposed to brute-force attacks because of missing rate limiters.
- **Offset-Pagination Drift:** Pakai `?page=N` ketika data sering diubah → user scroll halaman 2 dapat duplikat / skip karena row baru insert di halaman 1. Cursor-based stabil.
- **Missing Idempotency Key di POST:** Mobile client retry POST karena timeout → server proses 2x, duplicate charge / duplicate order. Mitigasi: `Idempotency-Key` header + Redis dedup.
- **Inconsistent Error Status Code:** Validation error kadang 400, kadang 422, kadang 500 — client handler bingung. Pilih satu konvensi (400 = malformed, 422 = semantic invalid, 500 = server bug) dan konsisten.

## Validation

Audit API design terhadap versioning, response consistency, rate limit, dan idempotency:

1. **Route prefix versioning:**
   ```bash
   grep -rnE "Router\(|app\.use\(['\"]/api/v" src/routes/ src/app/api/ 2>/dev/null
   # expected: setiap public endpoint di-mount under /v1/, /v2/, dst.
   ```
2. **Rate limit di auth/login route:**
   ```bash
   grep -rnE "(rateLimit|rate-limit|express-rate-limit)" src/ | grep -iE "login|auth|signup|password"
   # expected: ada middleware di setiap auth-sensitive endpoint.
   ```
3. **Idempotency-Key untuk POST yang state-changing:**
   ```bash
   grep -rnE "['\"]Idempotency-Key['\"]" src/ lib/ 2>/dev/null
   # expected: minimum di payment/order endpoints.
   ```
4. **Consistent error response shape:**
   ```bash
   grep -rnE "res\.status\([45][0-9][0-9]\)" src/ | sort | uniq -c | head
   # expected: pattern shape konsisten — semua error pakai `{ error: { code, message } }` atau standard format pilihan project.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan API patterns:

> "Use the skill `api-patterns`. Read `.agent/skills/api-patterns/SKILL.md` before coding. Never write unversioned routes or mutate database models inside GET requests. Always use standardized JSON envelopes, apply rate limiters to authentication paths, and verify contract schemas first."

## Related

- [api-design-principles](../api-design-principles/SKILL.md) — RESTful resource rules.
- [backend-architect](../backend-architect/SKILL.md) — Layered code separation.
- [env-fortress](../env-fortress/SKILL.md) — Config setups.
