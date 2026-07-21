---
name: api-security-best-practices
description: Implement secure API design patterns including authentication, authorization, input validation, rate limiting, and protection against common API vulnerabilities.
risk: high (session compromise, broken access-control paths, rate limiting bypasses)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# API Security Best Practices

> **One-liner:** Guidelines for implementing robust API authorization logic, input validation schemas, Redis-backed rate limiting, and secure JWT handling.

## When to Use

- When designing RESTful, GraphQL, or WebSocket backend endpoints.
- When configuring user session authorization tokens (JWT) and refresh cycles.
- When protecting critical business logic (e.g. logins, file uploads) against DDoS.

## Why This Exists

API gateways act as the direct entry point to database servers. Unlike client applications, APIs are exposed to automated brute-forcing scripts, parameter tampering, and request floods. When developers design API endpoints without strict role-based access checks (RBAC) or fail to validate schemas at query entries, attackers can bypass client logic, perform unauthorized data extractions, or flood servers, crashing the system.

## ALWAYS DO THIS

- **Verify resource ownership on every query** — Perform authorization checks comparing the session's authenticated ID against the targeted record's owner ID.
- **Enforce strict JWT signatures** — Use a minimum 256-bit secure secret key stored in environment variables, setting access token lifetimes to under 1 hour.
- **Validate requests using strict Zod schemas** — Parse all request query parameters, body parameters, and URL inputs before executing database tasks.
- **Implement rate limiting on auth gateways** — Restrict login and password-reset attempts to a maximum of 5 actions per 15 minutes using an in-memory or Redis-based store.
- **Sanitize error outputs** — Capture database connection or execution failures and log them internally, returning generic client error messages.

## NEVER DO THIS

- ❌ **DO NOT** authorize requests based solely on user IDs passed directly inside request bodies or query parameters. **Why fails:** Attackers can tamper with the ID (e.g., swapping `?userId=101` to `?userId=102`) to edit other accounts. **Instead:** Read user IDs directly from validated JWT claims or session contexts.
- ❌ **DO NOT** store sensitive data (like user passwords, roles, or credit card info) inside plain JWT payloads. **Why fails:** JWT signatures only verify authenticity; the payload itself is base64-encoded and can be read by anyone. **Instead:** Store only non-sensitive resource IDs (e.g. `userId`, `tenantId`).
- ❌ **DO NOT** configure wildcard origins `Access-Control-Allow-Origin: *` alongside `Access-Control-Allow-Credentials: true`. **Why fails:** Allows unauthorized sites to read credentials, enabling CSRF-based data exfiltration. **Instead:** Declare exact whitelist origins.
- ❌ **DO NOT** query database tables using raw SQL string concatenations or templated variables. **Why fails:** Exposes the backend to SQL injection payloads that can dump entire tables. **Instead:** Utilize parameterized values.

---

## Examples

### ✅ Good — Secure JWT Verification, Schema Parsing, and RBAC Checks

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is missing");

const deletePostSchema = z.object({
  id: z.string().uuid()
});

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "user" | "admin";
  };
}

// 1. JWT verification middleware checking signatures and formats
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, jwtSecret, (err, decoded: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  });
}

// 2. Route handler validating request schemas and enforcing resource ownership
export async function deletePostHandler(req: AuthRequest, res: Response) {
  try {
    const { id: postId } = deletePostSchema.parse(req.params);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    // 3. Confirm resource ownership (or check if user is an admin)
    if (post.authorId !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await db.post.delete({ where: { id: postId } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid request payload" });
  }
}
```

Why this passes: Encapsulates auth logic inside signature-verified middlewares, parses inputs with strict schemas, checks resource ownership, and restricts database fields.

### ❌ Bad — Insecure Direct ID Checks and Vulnerable String Injections

```typescript
import { Request, Response } from "express";

// ERROR 1: Authorizing actions based solely on user IDs passed directly inside request bodies
export async function deletePostUnsafe(req: Request, res: Response) {
  const { postId, userId } = req.body; // Vulnerable to parameter tampering

  // ERROR 2: Direct string interpolation into query commands (SQL Injection)
  const query = `SELECT * FROM posts WHERE id = '${postId}'`;
  const post = await db.query(query);

  if (post.rows.length > 0) {
    const postRecord = post.rows[0];

    // ERROR 3: Direct matching without signature verification
    if (postRecord.authorId === userId) {
      await db.query(`DELETE FROM posts WHERE id = '${postId}'`);
      return res.json({ success: true });
    }
  }
  res.status(403).json({ error: "Unauthorized" });
}
```

Why this fails: Accepts user authorization parameters directly from client bodies, runs string-interpolated query commands, and lacks signature verification.

---

## Failure Modes

- **Broken Object Level Authorization (BOLA):** Trusting client-supplied IDs without comparing session context permissions, permitting cross-account edits.
- **SQL Injection (SQLi):** Direct string interpolation in database commands allowing remote hackers to bypass auth walls.
- **Rate-Limiting Exhaustion:** Leaving public registration/login endpoints unprotected by rate limits, allowing server resource exhaustion.

## Validation

Cara memverifikasi kepatuhan penggunaan `api-security-best-practices`:

1. **Verify rate limiter integration on auth endpoints:**
   Ensure rate limiting middleware wraps registration and login gateways:
   ```bash
   grep -rn "rateLimit" src/
   # Verify that limits are configured
   ```
2. **Scan for raw query executions:**
   Confirm database queries do not use direct string concatenations:
   ```bash
   grep -rn "query(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk merancang API:

> "Use the skill `api-security-best-practices`. Read `.agent/skills/api-security-best-practices/SKILL.md` before coding. Never authorize requests using client-supplied IDs without checking session contexts. Always validate schemas, restrict permissions via RBAC, and run parameterized queries."

## Related

- [security-audit](../security-audit/SKILL.md) — Security audits.
- [web-security-testing](../web-security-testing/SKILL.md) — Active exploit testing.
- [secrets-management](../secrets-management/SKILL.md) — Credentials management.
