---
name: web-security-testing
description: Hands-on web app security testing workflow — 7 fase OWASP Top 10 (recon, injection, XSS, auth, access control, headers, reporting). Untuk pentest dan bug bounty.
risk: high (requires explicit environment authorization, executing active exploits, scanning tools overhead)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Security Testing Workflow

> **One-liner:** Systematic 7-phase active testing workflow against OWASP Top 10 vulnerabilities covering reconnaissance, injection, XSS, auth, access control, security headers, and reporting.

## When to Use

- When conducting quarterly security assessments or pre-release penetration tests.
- When validating resolved vulnerability patches to verify that security controls are effective.
- When performing compliance security audits (e.g., SOC2, PCI-DSS) to identify vulnerabilities.

## Why This Exists

While a code-level security audit reviews static files (`security-audit`), active web security testing probes live HTTP endpoints to verify runtime configurations and identify logic flaws. Without a structured active testing workflow, engineers often overlook insecure direct object references (IDOR) or rate-limiting bypasses, which are highly exploitable in production. Standardizing a 7-phase coverage ensures that testers systematically check all attack surfaces rather than cherry-picking familiar bugs.

---

## 7-Phase Testing Workflow

### Phase 1: Reconnaissance (Information Gathering)
- Map the application's attack surface using passive subdomain listing, directory brute-forcing, and technology detection.
- **Actions:** Use tools like `nmap` or `nslookup` to gather server IPs and DNS records. Run path listing to locate hidden admin pages.

### Phase 2: Injection Testing
- Probe for SQL, NoSQL, and Command injection vulnerabilities on input bounds.
- **Actions:** Test query parameters with single quotes `'`, comments `--`, and mathematical payloads (e.g., `1+1`).

### Phase 3: Cross-Site Scripting (XSS)
- Identify reflected, stored, or DOM-based XSS entry points where user data is returned in HTML templates.
- **Actions:** Inject safe payloads like `<script>console.log(1)</script>` or `javascript:void(0)` to check for unescaped characters.

### Phase 4: Authentication & Session Verification
- Test password strength controls, session lifetime limits, token storage safety, and brute-force protections.
- **Actions:** Attempt credential brute-forcing, verify if sessions are invalidated on logout, and check if cookies lack safety flags.

### Phase 5: Access Control & Privilege Escalation (IDOR)
- Verify if users can access other accounts or execute actions above their authorized tier.
- **Actions:** Perform parameter tampering by changing resource IDs (e.g., swapping `/api/user/101` to `/api/user/102`).

### Phase 6: Security Configuration & Headers
- Scan HTTP responses to confirm security headers are present.
- **Actions:** Verify that HSTS, CSP, X-Frame-Options, and X-Content-Type-Options are configured correctly to block attacks.

### Phase 7: Reporting & Mitigation Setup
- Document discovered vulnerabilities, specify their risk level (CVSS), and outline actionable remediation steps.

---

## ALWAYS DO THIS

- **Obtain written authorization before testing** — Only scan or attack environments you own or have explicit written permission to test (e.g., bug bounty scopes).
- **Test against realistic staging environments** — Perform active vulnerability scanning on dedicated staging setups that copy production databases.
- **Escalate access levels systematically** — Verify both horizontal privilege escalation (same role, different user) and vertical escalation (lower role to admin).
- **Fuzz inputs using boundary inputs** — Test all form inputs and query params with empty values, extreme lengths, and special character strings.
- **Verify cookie security flags** — Check that session cookies include `Secure`, `HttpOnly`, and `SameSite=Lax` (or `Strict`) attributes.

## NEVER DO THIS

- ❌ **DO NOT** run active vulnerability scans directly on production environments. **Why fails:** Risk of overloading databases, corrupting user data, or triggering firewalls that block legitimate traffic. **Instead:** Perform active scans on identical staging setups.
- ❌ **DO NOT** write custom shell commands by concatenating string inputs directly into execution statements. **Why fails:** Opens the door to command injection, allowing attackers to execute commands on the server. **Instead:** Use parameterized arguments or array parameters.
- ❌ **DO NOT** configure permissive Wildcard CORS origins (`Access-Control-Allow-Origin: *`) alongside authorization credentials. **Why fails:** Allows any malicious website to read sensitive user session data via CSRF attacks. **Instead:** Specify exact, trusted origin domains.
- ❌ **DO NOT** return raw, unescaped user inputs directly in server error messages or page templates. **Why fails:** Introduces Reflected XSS vulnerabilities, enabling scripts to run in the user's browser. **Instead:** Escape all data outputs.

---

## Examples

### ✅ Good — Parameterized Database Queries and Strict Content Security Policy

```typescript
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const app = express();

// 1. Enforce strict HTTP security headers using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'trusted-cdn.com'"],
        styleSrc: ["'self'", "'trusted-styles.com'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

// 2. Validate input schema using Zod
const userIdSchema = z.string().uuid();

app.get("/api/user/:id", async (req, res) => {
  try {
    const userId = userIdSchema.parse(req.params.id);

    // 3. Prevent SQL injection using parameterized queries
    const user = await db.query("SELECT id, name, email FROM users WHERE id = $1", [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    // Avoid leaking raw database errors
    res.status(400).json({ error: "Invalid request payload" });
  }
});
```

Why this passes: Sanitizes inputs with validation schemas, isolates database queries using parameterized values, avoids raw database error exposure, and uses helmet to configure strict security headers.

### ❌ Bad — Dangerous Command Injection and Missing Security Headers

```typescript
import express from "express";
import { exec } from "child_process";

const app = express();

// ERROR 1: Missing security headers and CORS protection limits (raw default Express setup)

app.get("/api/ping", (req, res) => {
  const targetHost = req.query.host;

  // ERROR 2: Direct string concatenation into shell commands (causes severe Command Injection)
  exec(`ping -c 3 ${targetHost}`, (err, stdout, stderr) => {
    if (err) {
      // ERROR 3: Leaking raw system execution errors back to client
      return res.status(500).json({ error: err.message, details: stderr });
    }
    res.json({ output: stdout });
  });
});
```

Why this fails: Concatenates user input parameters directly into shell execution paths, leaks execution errors, and leaves CORS and HTTP security headers unconfigured.

---

## Failure Modes

- **SQL Injection (SQLi):** Direct interpolation of query input fields inside database strings allows attackers to dump or wipe tables.
- **Insecure Direct Object References (IDOR):** Failing to verify user ownership of resources when querying items by ID lets any authenticated user fetch or edit private data.
- **Command Injection:** Passing unsanitized query parameters directly to system shells (e.g., `exec`) allows remote command execution.
- **Cross-Site Scripting (XSS):** Injecting unescaped text inputs directly into JSX or HTML allows attackers to steal session cookies.
- **CSRF Bypasses:** Processing database mutations (like changing passwords) via GET endpoints without CSRF tokens allows malicious link clicks to change user details.

## Validation

Cara memverifikasi kepatuhan penggunaan `web-security-testing`:

1. **Verify security headers configuration:**
   Send a request and check header attributes:
   ```bash
   curl -I http://localhost:3000/
   # Expected output: Strict-Transport-Security, Content-Security-Policy, and X-Content-Type-Options headers are present
   ```
2. **Scan for unsafe command executions:**
   Ensure `exec` calls do not use direct string templates:
   ```bash
   grep -rn "exec(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan pengujian keamanan:

> "Use the skill `web-security-testing`. Read `.agent/skills/web-security-testing/SKILL.md` before starting active tests. Never execute queries or shell commands using concatenated strings. Always obtain authorization, map access-control levels, validate parameters, and configure secure cookies."

## Related

- [security-audit](../security-audit/SKILL.md) — Source code auditing.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — API configurations.
- [secrets-management](../secrets-management/SKILL.md) — Credentials safety.
