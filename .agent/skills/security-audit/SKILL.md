---
name: security-audit
description: "Comprehensive security auditing workflow covering web application testing, API security, penetration testing, vulnerability scanning, and security hardening."
category: workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
date_updated: "2026-06-29"
---

# Security Auditing Workflow Bundle

> **One-liner:** End-to-end audit security web app + API: dari reconnaissance, scanning, OWASP testing, pentesting, hardening, sampai reporting — 7 fase systematic.

## When to Use

- Saat melakukan security audit sebelum production launch
- Saat menjalankan penetration testing pada API atau web app
- Saat conducting vulnerability scanning rutin (per release atau quarterly)
- Saat security hardening sebelum compliance assessment (SOC2, ISO 27001, PCI-DSS)
- Saat user explicit minta "audit codebase keamanan" atau "review security"
- Saat sebelum first push ke GitHub public

## Why This Exists

Audit ad-hoc tanpa workflow standar gampang miss area kritis seperti dependency vulnerability, broken access control, atau security misconfiguration. Tanpa skill ini, audit jadi cherry-pick area familiar — auditor fokus ke XSS karena familiar, lupa cek IDOR, lupa scan secret leak di git history, lupa verifikasi rate limiting. Skill ini memaksa 7-fase systematic coverage: **reconnaissance → scanning → web testing → API testing → pentesting → hardening → reporting**. Hasil akhir: gak ada blind spot yang bisa dieksploitasi.

## ALWAYS DO THIS

1. **Jalankan dependency audit sebelum deploy** — `npm audit`, `yarn audit`, atau `pnpm audit` untuk mendeteksi vulnerability di package. Untuk Python: `pip-audit`. Untuk PHP/Laravel: `composer audit`.
2. **Periksa OWASP Top 10 secara checklist** — Setiap audit harus mencakup: Injection, Broken Auth, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfig, XSS, Insecure Deserialization, Vulnerable Components, Insufficient Logging.
3. **Scan HTTP security headers** — Gunakan https://securityheaders.com atau `curl -I` untuk memverifikasi CSP, HSTS, X-Frame-Options, dan X-Content-Type-Options sudah terpasang.
4. **Review `.gitignore`** — Pastikan `.env`, `node_modules`, build artifacts, credential, dan `*.pem`/`*.key` tidak masuk repository.
5. **Document each finding lengkap** — Sertakan severity (Critical/High/Medium/Low), file:line, reproduction step, root cause, dan remediation recommendation. Tanpa repro step, finding gak actionable.

## NEVER DO THIS

- ❌ **JANGAN anggap audit selesai hanya karena `npm audit` clean.** **Why fails:** Custom code logic (auth, input handling, file upload, RBAC) tetap bisa punya celah yang scanner gak detect. **Instead:** Manual code review per area kritis tetap wajib, scanner adalah pelengkap bukan pengganti.
- ❌ **JANGAN abaikan warning "moderate" di dependency audit.** **Why fails:** Satu moderate vulnerability bisa naik jadi critical kalau dikombinasikan dengan vuln lain (chain exploit) atau bila package itu reachable dari unauthenticated endpoint. **Instead:** Patch atau document mitigation untuk semua warning ≥ moderate.
- ❌ **JANGAN simpan hasil audit di folder publik atau Git repo.** **Why fails:** Laporan berisi detail vulnerability yang bisa dieksploitasi attacker. Public exposure = blueprint serangan. **Instead:** Simpan di vault internal, encrypted storage, atau private wiki — bukan di README atau Notion public.
- ❌ **JANGAN audit sekali doang.** **Why fails:** New CVE muncul tiap minggu di dependency, codebase juga berubah cepat. Audit Juni gak valid lagi di September. **Instead:** Jadwalkan audit per release major + minimum quarterly + selalu re-run setelah dependency upgrade major.
- ❌ **JANGAN test di production tanpa authorization tertulis.** **Why fails:** Bisa dianggap unauthorized attack secara hukum (UU ITE pasal 30 di Indonesia, CFAA di US). **Instead:** Test di staging environment yang menyerupai production, atau dapatkan written consent dulu.

## Workflow Phases

### Phase 1: Reconnaissance

#### Skills to Invoke
- `scanning-tools` - Security scanning
- `shodan-reconnaissance` - Shodan searches
- `top-web-vulnerabilities` - OWASP Top 10

#### Actions
1. Identify target scope
2. Gather intelligence
3. Map attack surface
4. Identify technologies
5. Document findings

#### Copy-Paste Prompts
```
Use @scanning-tools to perform initial reconnaissance
```

```
Use @shodan-reconnaissance to find exposed services
```

### Phase 2: Vulnerability Scanning

#### Skills to Invoke
- `vulnerability-scanner` - Vulnerability analysis
- `security-scanning-security-sast` - Static analysis
- `security-scanning-security-dependencies` - Dependency scanning

#### Actions
1. Run automated scanners
2. Perform static analysis
3. Scan dependencies
4. Identify misconfigurations
5. Document vulnerabilities

#### Copy-Paste Prompts
```
Use @vulnerability-scanner to scan for OWASP Top 10 vulnerabilities
```

```
Use @security-scanning-security-dependencies to audit dependencies
```

### Phase 3: Web Application Testing

#### Skills to Invoke
- `top-web-vulnerabilities` - OWASP vulnerabilities
- `sql-injection-testing` - SQL injection
- `xss-html-injection` - XSS testing
- `broken-authentication` - Authentication testing
- `idor-testing` - IDOR testing
- `file-path-traversal` - Path traversal
- `burp-suite-testing` - Burp Suite testing

#### Actions
1. Test for injection flaws
2. Test authentication mechanisms
3. Test session management
4. Test access controls
5. Test input validation
6. Test security headers

#### Copy-Paste Prompts
```
Use @sql-injection-testing to test for SQL injection vulnerabilities
```

```
Use @xss-html-injection to test for cross-site scripting
```

```
Use @broken-authentication to test authentication security
```

### Phase 4: API Security Testing

#### Skills to Invoke
- `api-fuzzing-bug-bounty` - API fuzzing
- `api-security-best-practices` - API security

#### Actions
1. Enumerate API endpoints
2. Test authentication/authorization
3. Test rate limiting
4. Test input validation
5. Test error handling
6. Document API vulnerabilities

#### Copy-Paste Prompts
```
Use @api-fuzzing-bug-bounty to fuzz API endpoints
```

### Phase 5: Penetration Testing

#### Skills to Invoke
- `pentest-commands` - Penetration testing commands
- `pentest-checklist` - Pentest planning
- `ethical-hacking-methodology` - Ethical hacking
- `metasploit-framework` - Metasploit

#### Actions
1. Plan penetration test
2. Execute attack scenarios
3. Exploit vulnerabilities
4. Document proof of concept
5. Assess impact

#### Copy-Paste Prompts
```
Use @pentest-checklist to plan penetration test
```

```
Use @pentest-commands to execute penetration testing
```

### Phase 6: Security Hardening

#### Skills to Invoke
- `security-scanning-security-hardening` - Security hardening
- `auth-implementation-patterns` - Authentication
- `api-security-best-practices` - API security

#### Actions
1. Implement security controls
2. Configure security headers
3. Set up authentication
4. Implement authorization
5. Configure logging
6. Apply patches

#### Copy-Paste Prompts
```
Use @security-scanning-security-hardening to harden application security
```

### Phase 7: Reporting

#### Skills to Invoke
- `reporting-standards` - Security reporting

#### Actions
1. Document findings
2. Assess risk levels
3. Provide remediation steps
4. Create executive summary
5. Generate technical report

## Security Testing Checklist

### OWASP Top 10
- [ ] Injection (SQL, NoSQL, OS, LDAP)
- [ ] Broken Authentication
- [ ] Sensitive Data Exposure
- [ ] XML External Entities (XXE)
- [ ] Broken Access Control
- [ ] Security Misconfiguration
- [ ] Cross-Site Scripting (XSS)
- [ ] Insecure Deserialization
- [ ] Using Components with Known Vulnerabilities
- [ ] Insufficient Logging & Monitoring

### API Security
- [ ] Authentication mechanisms
- [ ] Authorization checks
- [ ] Rate limiting
- [ ] Input validation
- [ ] Error handling
- [ ] Security headers

## Examples

### ✅ Good — Audit finding lengkap, actionable

```markdown
[FINDING-001] SQL Injection di endpoint /api/users/search

**Severity:** High
**File:** src/api/users.js:42
**Reproduction:**
  curl 'https://app.local/api/users/search?q=test%27%20OR%20%271%27=%271'
  → HTTP 200, returns ALL users instead of filtered match
**Root cause:**
  String concatenation di SQL query (line 42):
    const query = `SELECT * FROM users WHERE name LIKE '%${q}%'`
**Remediation:**
  Replace dengan parameterized query:
    db.query('SELECT * FROM users WHERE name LIKE $1', [`%${q}%`])
**Validated fix:**
  Re-run reproduction command → only matched users returned, payload tidak diinterpretasi sebagai SQL.
**Owner:** @backend-team
**Due:** 2026-07-05
```

Why this passes: Punya severity rating, file:line spesifik, reproduction command yang bisa di-copy-paste, root cause analysis, concrete fix dengan code snippet, re-validation step, dan owner+due date.

### ❌ Bad — Audit finding vague, gak actionable

```markdown
Ada SQL injection di backend. Tolong di-fix segera.
```

Why this fails: Gak ada file location, gak ada line number, gak ada reproduction step, gak ada severity (Critical? Low?), gak ada remediation recommendation, gak ada owner. Developer harus tebak-tebak mana yang dimaksud — atau worse: ignore karena gak ada bukti. End result: vuln gak diperbaiki.

## Failure Modes

- Agent klaim "audit selesai" tanpa output dependency scan + manual review report.
- Hanya jalanin `npm audit`, skip manual review custom auth/RBAC logic.
- Findings tanpa severity rating atau reproduction step (vague findings).
- Skip Phase 6 (Hardening) — cuma report vuln tanpa fix recommendation atau code patch.
- Skip Phase 7 (Reporting) — fix individual file tapi gak ada executive summary buat stakeholder.
- Commit hasil audit ke public Git repo (laporan vulnerability sebagai blueprint serangan).
- Audit dilakukan di production tanpa authorization tertulis — risk legal.

## Validation

Cara verifikasi audit beneran komprehensif:

1. **Cek output dependency audit:**
   ```bash
   npm audit --audit-level=moderate
   # expected: list vulnerability dengan severity + advisory link, atau "found 0 vulnerabilities"
   ```

2. **Verifikasi security headers:**
   ```bash
   curl -sI https://your-app.com | grep -iE "strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy"
   # expected: minimum 4 dari 5 headers harus ada
   ```

3. **Grep hardcoded secrets di repo:**
   ```bash
   grep -rE "(api[_-]?key|password|secret|token|bearer)\s*[:=]\s*[\"'][^\"']{8,}[\"']" \
     --include="*.js" --include="*.ts" --include="*.py" --include="*.env*" .
   # expected: no match. Kalau ada → CRITICAL BLOCKER
   ```

4. **Verify `.gitignore` mencakup secrets:**
   ```bash
   grep -E "^\.env|^node_modules|^\*\.pem|^\*\.key" .gitignore
   # expected: keempat pattern ditemukan
   ```

5. **Validate report completeness:**
   - File audit-report.md harus punya: Executive Summary, Findings (each with severity + repro + fix), Quality Gates checklist.
   - Setiap finding harus punya field: severity, file:line, reproduction, root cause, remediation, owner.

## Quality Gates

- [ ] All planned tests executed
- [ ] Vulnerabilities documented
- [ ] Proof of concepts captured
- [ ] Risk assessments completed
- [ ] Remediation steps provided
- [ ] Report generated

## Sub-Agent Propagation

Saat dispatch sub-agent untuk security audit:

> "Gunakan skill `security-audit`. Sebelum mulai, baca `.agent/skills/security-audit/SKILL.md` dan ikuti 7-phase workflow (Reconnaissance → Scanning → Web Testing → API Testing → Pentesting → Hardening → Reporting). Wajib jalankan dependency audit (`npm audit`), security headers scan (`curl -I`), dan grep hardcoded secrets. Setiap finding wajib sertakan: severity, file:line, reproduction command, root cause, dan remediation. Output akhir: structured report dengan executive summary. Jangan klaim selesai sebelum 5 validation command di section Validation dijalankan dan hasilnya dilampirkan."

## Related Workflow Bundles

- `cc-skill-security-review` — Detailed code-level security checklist (10 area: secrets, input validation, SQL injection, auth, XSS, CSRF, rate limit, dll)
- `backend-security-coder` — Hands-on secure backend coding patterns
- `frontend-security-coder` — XSS prevention dan client-side security
- `secrets-management` — Vault, env management, secret rotation
- `web-security-testing` — OWASP Top 10 testing workflow lebih detail
- `api-security-best-practices` — JWT, rate limiting, input validation untuk API
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Reference resmi web vulnerabilities (license: CC BY 4.0)
- [securityheaders.com](https://securityheaders.com) — Online tool scan HTTP security headers
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — Application Security Verification Standard untuk compliance
