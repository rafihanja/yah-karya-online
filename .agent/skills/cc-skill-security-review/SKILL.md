---
name: cc-skill-security-review
description: "Code-level security review checklist for 10 critical areas (secrets, inputs, SQL, auth, XSS, CSRF, rate limits, sensitive data, blockchain, and dependencies) for pre-merge and pre-deploy audits."
risk: medium
source: community
date_added: "2026-02-27"
date_updated: "2026-06-29"
---

# Security Review Skill

> **One-liner:** Code-level security checklist for 10 critical areas — executed every time you implement authentication, handle user input, or create new endpoints.

## When to Use

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Why This Exists

The `security-audit` skill is a comprehensive audit workflow (7 phases: reconnaissance → reporting). This skill is different: a code-level checklist to be used PR-by-PR — not a massive audit, but a guardrail per feature. Without this skill, developers tend to overlook small, accumulative details: tokens stored in localStorage (XSS-vulnerable), error messages leaking stack traces, file uploads without extension whitelists, or string-concatenated SQL queries. A single oversight acts as an entry point for attackers. The 10-area checklist forces a structured check, where each area has concrete verification steps and ready-to-use ❌/✅ examples.

## ALWAYS DO THIS

1. **Run the checklist BEFORE merging, not after deployment** — A security finding post-deployment is an incident; post-merge, it is a revert. Check during PR reviews.
2. **Validate input using a schema library** (Zod / Joi / Yup) at all user-input boundaries — do not rely on manual `if/else` checks.
3. **Always use parameterized queries** — use an ORM (Prisma, Drizzle, Supabase client) or prepared statements. Zero exceptions for string concatenation.
4. **Store JWT in httpOnly cookies, not localStorage** — localStorage is XSS-readable. Set `HttpOnly; Secure; SameSite=Strict`.
5. **Rate-limit all endpoints before production** — a default minimum of 100 requests per 15 minutes; apply stricter limits for authentication (5 requests per minute) and expensive operations (search, AI, export).

## NEVER DO THIS

- ❌ **DO NOT hardcode secrets in source code, even in `.example` files.** **Why fails:** Once committed, Git history is permanent — rotating the secret is not enough; the secret remains exposed in cloned historical repositories. **Instead:** Use `process.env.X` + verify-on-boot (`if (!apiKey) throw`), add `.env` to `.gitignore`, and configure production secrets via platform environment variables (Vercel, Railway).
- ❌ **DO NOT store JWTs in localStorage or sessionStorage.** **Why fails:** Any script running on the domain (including XSS payloads or compromised CDNs) can execute `localStorage.getItem('token')` → leading to account takeover. **Instead:** Use `httpOnly` cookies with `Secure; SameSite=Strict; Max-Age` — JavaScript cannot read them, and the browser automatically attaches them to requests.
- ❌ **DO NOT expose `error.stack` or `error.message` to the client in 500 responses.** **Why fails:** Stack traces leak filesystem paths, framework versions, and database table names — which attackers use to fingerprint vulnerabilities. **Instead:** Log the full error on the server (`console.error`), and send a generic message to the client (`{ error: 'An internal server error occurred' }`).
- ❌ **DO NOT trust file extensions from user uploads.** **Why fails:** A file named `evil.jpg.exe` will bypass simple `.endsWith('.jpg')` checks. The MIME type can also be easily spoofed in headers. **Instead:** Combine a MIME whitelist + magic-byte verification + max size limits + rename files to UUIDs + store in isolated storage (S3, not the public web root folder).
- ❌ **DO NOT skip CSRF tokens in state-changing endpoints (POST/PUT/DELETE), even with cookie-based authentication.** **Why fails:** Browsers automatically attach cookies to cross-site requests — allowing attackers to trigger actions like `<form action="/api/delete-account">` from external domains. **Instead:** Implement the double-submit cookie pattern or enforce `SameSite=Strict` cookies + explicit CSRF token header validation.

## Security Checklist

### 1. Secrets Management

#### ❌ NEVER Do This
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### ✅ ALWAYS Do This
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### Verification Steps
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history
- [ ] Production secrets in hosting platform (Vercel, Railway)

### 2. Input Validation

#### Always Validate User Input
```typescript
import { z } from 'zod'

// Define validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// Validate before processing
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### File Upload Validation
```typescript
function validateFileUpload(file: File) {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // Type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### Verification Steps
- [ ] All user inputs validated with schemas
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Whitelist validation (not blacklist)
- [ ] Error messages don't leak sensitive info

### 3. SQL Injection Prevention

#### ❌ NEVER Concatenate SQL
```typescript
// DANGEROUS - SQL Injection vulnerability
const query = \`SELECT * FROM users WHERE email = '${userEmail}'\`
await db.query(query)
```

#### ✅ ALWAYS Use Parameterized Queries
```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Or with raw SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### Verification Steps
- [ ] All database queries use parameterized queries
- [ ] No string concatenation in SQL
- [ ] ORM/query builder used correctly
- [ ] Supabase queries properly sanitized

### 4. Authentication & Authorization

#### JWT Token Handling
```typescript
// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// ✅ CORRECT: httpOnly cookies
res.setHeader('Set-Cookie',
  \`token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600\`)
```

#### Authorization Checks
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // ALWAYS verify authorization first
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Proceed with deletion
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security (Supabase)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### Verification Steps
- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Authorization checks before sensitive operations
- [ ] Row Level Security enabled in Supabase
- [ ] Role-based access control implemented
- [ ] Session management secure

### 5. XSS Prevention

#### Sanitize HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: \`
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    \`.replace(/\\s{2,}/g, ' ').trim()
  }
]
```

#### Verification Steps
- [ ] User-provided HTML sanitized
- [ ] CSP headers configured
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS protection used

### 6. CSRF Protection

#### CSRF Tokens
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  \`session=${sessionId}; HttpOnly; Secure; SameSite=Strict\`)
```

#### Verification Steps
- [ ] CSRF tokens on state-changing operations
- [ ] SameSite=Strict on all cookies
- [ ] Double-submit cookie pattern implemented

### 7. Rate Limiting

#### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
})

// Apply to routes
app.use('/api/', limiter)
```

#### Expensive Operations
```typescript
// Aggressive rate limiting for searches
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### Verification Steps
- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations
- [ ] IP-based rate limiting
- [ ] User-based rate limiting (authenticated)

### 8. Sensitive Data Exposure

#### Logging
```typescript
// ❌ WRONG: Logging sensitive data
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ CORRECT: Redact sensitive data
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### Error Messages
```typescript
// ❌ WRONG: Exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ CORRECT: Generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### Verification Steps
- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Detailed errors only in server logs
- [ ] No stack traces exposed to users

### 9. Blockchain Security (Solana)

#### Wallet Verification
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### Transaction Verification
```typescript
async function verifyTransaction(transaction: Transaction) {
  // Verify recipient
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Verify amount
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Verify user has sufficient balance
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### Verification Steps
- [ ] Wallet signatures verified
- [ ] Transaction details validated
- [ ] Balance checks before transactions
- [ ] No blind transaction signing

### 10. Dependency Security

#### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

#### Lock Files
```bash
# ALWAYS commit lock files
git add package-lock.json

# Use in CI/CD for reproducible builds
npm ci  # Instead of npm install
```

#### Verification Steps
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (npm audit clean)
- [ ] Lock files committed
- [ ] Dependabot enabled on GitHub
- [ ] Regular security updates

## Security Testing

### Automated Security Tests
```typescript
// Test authentication
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// Test authorization
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// Test input validation
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// Test rate limiting
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded secrets, all in env vars
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized
- [ ] **CSRF**: Protection enabled
- [ ] **Authentication**: Proper token handling
- [ ] **Authorization**: Role checks in place
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **HTTPS**: Enforced in production
- [ ] **Security Headers**: CSP, X-Frame-Options configured
- [ ] **Error Handling**: No sensitive data in errors
- [ ] **Logging**: No sensitive data logged
- [ ] **Dependencies**: Up to date, no vulnerabilities
- [ ] **Row Level Security**: Enabled in Supabase
- [ ] **CORS**: Properly configured
- [ ] **File Uploads**: Validated (size, type)
- [ ] **Wallet Signatures**: Verified (if blockchain)

## Examples

### ✅ Good — PR review with checklist sign-off

```markdown
PR #142: Add `/api/users/[id]/avatar` upload endpoint

Security review (cc-skill-security-review):
- [x] #1 Secrets: no hardcoded, AWS_SECRET via env ✓
- [x] #2 Input: Zod schema validates file metadata ✓
- [x] #2 File upload: 5MB max, JPEG/PNG only, magic-byte verified ✓
- [x] #3 SQL: Prisma parameterized ✓
- [x] #4 Auth: requires session cookie, owner-only via Prisma where clause ✓
- [x] #5 XSS: N/A (no HTML render)
- [x] #6 CSRF: SameSite=Strict cookie ✓
- [x] #7 Rate limit: 5 uploads/min/user via Upstash Redis ✓
- [x] #8 Sensitive: filename UUID-randomized, originalName not logged ✓
- [x] #10 Dependency: npm audit clean ✓
Approve ✓
```

Why this passes: Every checklist area is addressed, results are explicit, and inapplicable findings are tagged as N/A instead of being omitted. Subsequent reviewers can easily audit the trail.

### ❌ Bad — "LGTM" without a security trace

```markdown
PR #142: Add avatar upload endpoint
LGTM, deploy ✓
```

Why this fails: The reviewer did not verify the extension whitelist, rate limits, or ownership checks. An unconstrained upload endpoint introduces potential Remote Code Execution (RCE) via web shells or storage abuse. "LGTM" without a checklist leaves no audit trail if a breach occurs.

## Failure Modes

- **Checklist Theater:** Checking all boxes without actually verifying the implementation — allowing vulnerabilities to slip through. **Mitigation:** Every checkbox must be accompanied by concrete evidence (file:line, command output, or code snippet).
- **Cherry-Pick Bias:** Reviewers checking only familiar areas (e.g., XSS, SQL) while skipping unfamiliar domains (e.g., blockchain, CSRF). **Mitigation:** All 10 checklist areas must be explicitly answered — tag as `N/A` if genuinely irrelevant.
- **Frontend-Only Review:** Auditing only UI files while skipping API routes. **Mitigation:** All state-changing endpoints (POST/PUT/DELETE) must be thoroughly covered.
- **Local-Only Test:** Running validations in development without accounting for differing production environments (e.g., Vercel headers, Supabase RLS policies). **Mitigation:** Perform secondary validations in staging environments that mirror production.
- **Old Dependency Drift:** Bypassing security checks because `npm audit` was clean at merge time, but new CVEs emerge later. **Mitigation:** Enable Dependabot and run scheduled weekly security audits.
- **Logging Leak:** Developers assuming `console.log` is harmless, unaware that log aggregation tools store and distribute these logs. **Mitigation:** Audit codebase using grep for sensitive keyword patterns prior to merging.
- **Error Body Leak:** Server error handlers broadcasting raw stack traces or database logs directly to public notification channels. **Mitigation:** Sanitize and redact sensitive fields in centralized error handlers before re-throwing.

## Validation

How to verify the security review was actually conducted (not rubber-stamped):

1. **Grep hardcoded secrets:**
   ```bash
   grep -rE "(api[_-]?key|password|secret|token|bearer)\s*[:=]\s*[\"'][^\"']{12,}[\"']" \
     --include="*.ts" --include="*.tsx" --include="*.js" src/
   # Expected: zero matches. Any match acts as a BLOCKER.
   ```

2. **Grep localStorage token storage:**
   ```bash
   grep -rn "localStorage.setItem.*\(token\|jwt\|auth\)" --include="*.ts" --include="*.tsx" src/
   # Expected: zero matches. Any match constitutes a high-severity finding.
   ```

3. **Grep raw SQL string-concat:**
   ```bash
   grep -rnE "\\`SELECT.*\\\\$\\{|query\\(.*\\+ " --include="*.ts" --include="*.js" src/
   # Expected: zero matches. Any match indicates a SQL injection vulnerability.
   ```

4. **Dependency audit:**
   ```bash
   npm audit --audit-level=moderate
   # Expected: "found 0 vulnerabilities" or only low-severity alerts.
   ```

5. **CSP header check:**
   ```bash
   curl -sI https://staging.app.com | grep -iE "content-security-policy|strict-transport-security|x-frame-options"
   # Expected: All 3 security headers present in staging/production.
   ```

## Sub-Agent Propagation

When dispatching sub-agents for security code reviews:

> "Use the `cc-skill-security-review` skill. Read `.agent/skills/cc-skill-security-review/SKILL.md` before starting. Follow the 10-area checklist (Secrets, Input Validation, SQL Injection, Authentication/Authorization, XSS, CSRF, Rate Limiting, Sensitive Data Exposure, Blockchain, and Dependencies). Each area must be addressed explicitly — tag as `N/A` if irrelevant, do not skip. Attach evidence for every verified item (file:line, command output). Execute all 5 validation steps from the Validation section before approval. Reject any PR containing hardcoded secrets, localStorage tokens, raw SQL string concatenations, or unmitigated security vulnerabilities (npm audit >= moderate)."

## Related

- `security-audit` — Full 7-phase audit workflow (this skill serves as a code-level checklist within the Web Testing & Hardening phase)
- `backend-security-coder` — Practical backend security coding patterns
- `frontend-security-coder` — Practical frontend security coding and client-side protection
- `secrets-management` — Vault integrations, environment management, and secret rotation
- `api-security-best-practices` — JWT configurations, rate limiting, and OAuth2 for API endpoints
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) (CC BY 4.0)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

**Remember**: Security is not optional. One vulnerability can compromise the entire platform. When in doubt, err on the side of caution.
