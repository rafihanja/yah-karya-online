---
name: auth-implementation-patterns
description: Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.
risk: critical (session hijacking, credential leaks, brute-force access, token signature bypass)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Authentication & Authorization Implementation Patterns

> **One-liner:** Guidelines for implementing secure authentication and authorization systems, configuring HttpOnly cookies, validating JWT signatures, hashing credentials using Argon2/bcrypt, and setting up RBAC gates.

## When to Use

- When implementing user registration, login endpoints, session stores, or token verifications.
- When configuring Single Sign-On (SSO), OAuth2 providers (Google, GitHub), or client keys.
- When designing role-based access control (RBAC) gates in API routers.

## Why This Exists

Auth pipelines are high-risk entry points. If developers store session JSON Web Tokens (JWTs) in the browser's `localStorage`, script injection vulnerabilities (XSS) can read and steal them, compromising user accounts. Additionally, saving raw passwords without strong cryptographic hashes (like bcrypt or Argon2 with high cost factors) allows attackers to decrypt them if a database leak occurs. Enforcing HttpOnly secure cookies, token signature checks, rate-limiting, and strict password hashing secures user identity boundaries.

## ALWAYS DO THIS

- **Secure cookie parameters** — Save session identifiers in cookies configured with `HttpOnly`, `Secure`, and `SameSite=Strict` (or `Lax`) flags.
- **Hash passwords using strong algorithms** — Encrypt passwords before database writes using bcrypt (with a cost factor >= 12) or Argon2.
- **Verify JWT signatures on backend queries** — Verify the cryptographic signature and expiration claims of incoming tokens on every API route handler.
- **Rate-limit auth endpoints** — Apply strict rate limit constraints (e.g. max 5 login requests per IP per minute) on identity routes.
- **Validate input schemas** — Sanitize and validate inputs on login and registration endpoints to prevent injection attacks.

## NEVER DO THIS

- ❌ **DO NOT** save access or session JSON Web Tokens (JWTs) in the browser's `localStorage` or `sessionStorage`. **Why fails:** Any active Cross-Site Scripting (XSS) script can read these storage namespaces and steal user tokens. **Instead:** Write session tokens to `HttpOnly` cookies.
- ❌ **DO NOT** log passwords, session tokens, or authentication credentials to telemetry logs or terminal outputs. **Why fails:** Exposed logs leak credentials to logs collectors, developers, and third parties, leading to security breaches. **Instead:** Redact credentials from log payloads.
- ❌ **DO NOT** write custom session validation logic or cryptographic token algorithms from scratch in production systems. **Why fails:** Homegrown auth code often has security vulnerabilities (like timing attacks or incorrect padding checks). **Instead:** Use audited libraries (such as Passport.js, NextAuth, or Clerk).
- ❌ **DO NOT** hardcode JWT secret keys, public keys, or OAuth client credentials in source files. **Why fails:** Secrets committed to source control leak to developers and attackers. **Instead:** Inject values through environment variables.

---

## Secure Session Cookie Architecture

HttpOnly flags restrict script access to keep cookies secure against XSS:

```
[Browser Client] ──(Cannot Read HttpOnly Cookie)──> [JavaScript Namespace (Protected from XSS)]
       │
(Passes automatically via HTTP Header)
       │
       ▼
[Backend API Gateway] ──(Validates Cookie Signature)──> [Authenticates User Session]
```

---

## Examples

### ✅ Good — Express Login Controller with Bcrypt Hashing and HttpOnly Cookies

```typescript
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}

// 1. Enforce strict validation schemas on identity input data
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // Fetch user from database
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Validate password hashes securely using bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate token with explicit expiration claims
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    // 4. Save session token in HttpOnly secure cookies
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour in milliseconds
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: "Invalid request payload" });
  }
});
```

Why this passes: Uses strict input schemas, runs secure bcrypt validation checks, assigns session tokens to `HttpOnly` secure cookies, and uses environment variables for secrets.

### ❌ Bad — Storing JWTs in LocalStorage, Low Hashing Costs, and Exposed Secrets

```typescript
import express from "express";
const router = express.Router();

// ERROR 1: Using hardcoded authentication secrets
const JWT_SECRET_UNSAFE = "superSecretKey12345"; 

router.post("/login-unsafe", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUserByEmail(email);

  // ERROR 2: Storing raw md5 password hashes (vulnerable to lookup tables)
  const isMatch = md5(password) === user.md5Hash;
  if (!isMatch) return res.sendStatus(401);

  // ERROR 3: Direct JWT generation with no expiry limits
  const token = jwt.sign({ userId: user.id }, JWT_SECRET_UNSAFE);

  // ERROR 4: Sending token in JSON body, prompting frontend to save it in LocalStorage (XSS Risk)
  res.json({ token }); 
});
```

Why this fails: Hardcodes sensitive secrets, uses weak password hashes, generates tokens without expiration claims, and returns tokens in JSON bodies for local storage.

---

## Failure Modes

- **The XSS Session Theft:** Saving tokens in LocalStorage, allowing injected scripts to read and leak sessions.
- **The Rainbow Table Decryption:** Hashing database passwords using weak algorithms (like MD5 or SHA1), allowing attackers to decrypt them.
- **The JWT Signature Bypass:** Failing to verify signatures on API endpoints, allowing users to impersonate accounts by modifying payloads.
- **The Telemetry Key Leak:** Logging password inputs to diagnostic files or APM tracing dashboards.
- **The Brute-Force Lockout lack:** Exposing login interfaces without rate limits, allowing attackers to guess passwords.
- **The Hardcoded Key Leak:** Committing authentication secrets to git repositories, compromising the application.

## Validation

Audit authentication headers, session cookie configurations, and password policies:

1. **Verify that session tokens are not saved in LocalStorage:**
   Check client-side storage writes:
   ```bash
   grep -rn "localStorage.setItem(" src/ 2>/dev/null
   # expected: zero matches for token namespaces in LocalStorage writes.
   ```
2. **Verify secure cookie configuration parameters in controllers:**
   Verify cookie attributes in code:
   ```bash
   grep -rn "httpOnly:" src/ | grep -v "httpOnly: false"
   # expected: All session cookie assignments set 'httpOnly: true' and 'secure: true'.
   ```
3. **Verify password hashing configurations in registration modules:**
   ```bash
   grep -rn "bcrypt.hash(" src/ | grep -rnE "([0-9]|1[0-1])\)"
   # expected: cost factor is set to >= 12.
   ```
4. **Identify rate-limiting middlewares on auth routes:**
   ```bash
   grep -rn "rateLimit" src/routes/auth/ 2>/dev/null
   # expected: Auth routers mount rate limiter middlewares.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengimplementasikan authentication:

> "Use the skill `auth-implementation-patterns`. Read `.agent/skills/auth-implementation-patterns/SKILL.md` before coding. Never store access tokens in localStorage or log passwords. Always use HttpOnly secure cookies, verify JWT signatures, rate-limit routes, and use strong hashing algorithms."

## Related

- [clerk-auth](../clerk-auth/SKILL.md) — Managed authentication setups.
- [backend-security-coder](../backend-security-coder/SKILL.md) — General security coding patterns.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Secure endpoints design.
