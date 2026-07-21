---
name: self-review-gate
description: "Audit internal wajib sebelum deliver. Checklist kode, keamanan, UI/UX, SEO, performa, dan file. Kalau ada yang gagal, perbaiki dulu — jangan kirim hasil setengah jadi."
---

# Self Review Gate — Audit Diri Sebelum Deliver

<!-- FAIL_CLOSED_GOVERNANCE -->

> **One-liner:** Sebelum bilang "selesai" ke user, AI WAJIB menjalankan checklist audit internal. Kalau ada yang gagal, PERBAIKI dulu. Jangan pernah kirim hasil setengah jadi.

## When to Use

- Di AKHIR setiap fase (sebelum minta persetujuan user).
- Di AKHIR project (sebelum laporan akhir).
- Setelah setiap revisi yang diminta user.

## Why This Exists

AI sering bilang "selesai" padahal:
- Ada console error yang nggak dicek
- Ada halaman yang belum responsive
- Ada form tanpa validasi
- Ada hardcoded credential
- Ada file yang lupa di-save
- Ada fitur yang cuma jalan di 1 browser

Skill ini adalah "satpam" terakhir sebelum hasil kerja sampai ke user. Kalau satpamnya nemu masalah, hasil kerja DITAHAN dan diperbaiki dulu.

## ALWAYS DO THIS

## NEVER DO THIS (Yang Dilarang / Anti-patterns to Avoid)

- ❌ **JANGAN melewatkan proses pengujian otomatis (seperti `npm run build` atau `npm run lint`).** **Why fails:** Mengklaim pekerjaan selesai tanpa verifikasi build nyata berisiko merilis kode yang rusak ke pengguna. **Instead:** Jalankan perintah uji dan pastikan hasilnya bebas error.
- ❌ **JANGAN asal mencentang checklist kriteria tanpa verifikasi objektif di browser.** **Why fails:** Membuat gerbang pemeriksaan kualitas tidak berfungsi, sehingga masalah tata letak visual atau celah keamanan bisa lolos. **Instead:** Lakukan pemeriksaan mandiri secara skeptis dan catat bukti ujinya.
- ❌ **JANGAN menyembunyikan atau menutupi risiko yang tersisa.** **Why fails:** Menghalangi pengguna mengetahui keterbatasan sistem yang belum diuji secara optimal (misalnya pengujian di browser Safari). **Instead:** Tulis semua risiko sisa secara jujur dan transparan.

### Checklist Wajib (Jalankan di Akhir Setiap Fase)

Agent WAJIB memeriksa checklist berikut secara internal SEBELUM menyerahkan hasil ke user. Format:

```
🔍 SELF REVIEW GATE
─────────────────────────────────

🧱 KODE
  [✅/❌] Tidak ada syntax error
  [✅/❌] Tidak ada console.log yang seharusnya dihapus
  [✅/❌] Tidak ada TODO/FIXME yang seharusnya diselesaikan di fase ini
  [✅/❌] Nama variabel/fungsi jelas dan konsisten
  [✅/❌] Tidak ada kode yang di-copy-paste tanpa dipahami

🔒 KEAMANAN
  [✅/❌] Tidak ada hardcoded credential/API key/password
  [✅/❌] Input dari user di-validasi sebelum diproses
  [✅/❌] Query database pakai parameterized/prepared statement
  [✅/❌] Environment variable dipakai untuk config sensitif

🎨 UI/UX (kalau ada frontend)
  [✅/❌] Responsive di mobile (min-width 320px)
  [✅/❌] Responsive di tablet (768px)
  [✅/❌] Responsive di desktop (1024px+)
  [✅/❌] Ada loading state untuk operasi async
  [✅/❌] Ada error state yang user-friendly
  [✅/❌] Warna kontras cukup untuk teks
  [✅/❌] Semua link/button bisa diklik dan berfungsi

🔍 SEO (kalau ada halaman web)
  [✅/❌] Setiap halaman punya <title> yang unik
  [✅/❌] Setiap halaman punya meta description
  [✅/❌] Heading hierarchy benar (h1 > h2 > h3)
  [✅/❌] Gambar punya alt text
  [✅/❌] Semantic HTML dipakai

⚡ PERFORMA
  [✅/❌] Tidak ada infinite loop atau memory leak yang obvious
  [✅/❌] Gambar besar di-lazy load
  [✅/❌] Tidak ada fetch/API call yang berulang tanpa perlu

📁 FILE & PROJECT
  [✅/❌] Semua file baru sudah di-save
  [✅/❌] Tidak ada file sementara/test yang seharusnya dihapus
  [✅/❌] PROJECT_MEMORY.md sudah di-update (kalau pakai project-memory)
  [✅/❌] .env.example ada kalau project pakai env variable

─────────────────────────────────
```

### Aturan Eksekusi

1. **Kalau semua ✅** → Lanjut serahkan hasil ke user.
2. **Kalau ada ❌ yang bisa diperbaiki** → PERBAIKI DULU sebelum serahkan. Jangan bilang ke user "ini belum sempurna tapi ya udahlah". Perbaiki aja langsung.
3. **Kalau ada ❌ yang memang di luar scope fase ini** → Boleh dilewat, tapi WAJIB sebutkan di bagian "Yang BELUM dikerjakan" dan masukkan ke fase berikutnya.
4. **Kalau governance gate terlewat** → STOP, tulis `GOVERNANCE VIOLATION DETECTED`, pulihkan gate dari checkpoint terakhir yang terbukti, lalu ulangi self-review. Jangan menurunkan item menjadi warning agar bisa mengklaim selesai.
5. **Checklist ini TIDAK ditampilkan ke user** (kecuali user secara eksplisit minta lihat). Ini adalah audit internal AI.

### Kapan Harus Tampilkan ke User

Tampilkan checklist ke user HANYA kalau:
- User bertanya "udah dicek belum?" atau "quality-nya gimana?"
- Ada item ❌ yang benar-benar di luar kemampuan AI (misal: "perlu dicek di Safari tapi saya nggak bisa buka Safari")
- Di laporan akhir project (ringkasan singkat)

### Integrasi dengan Skill Lain

Urutan eksekusi lengkap di akhir setiap fase:
```
AI selesai ngoding fase X
  ↓
self-review-gate: jalankan checklist internal
  ↓
[ada ❌?] → perbaiki dulu → ulangi checklist
  ↓
[semua ✅?] → update PROJECT_MEMORY.md (project-memory)
  ↓
Tampilkan hasil fase ke user (phased-delivery format)
  ↓
Tunggu persetujuan user
```

## Validation Steps — Automated Quality Checks

Agent WAJIB menjalankan command ini SEBELUM checklist manual:

### Build & Type Safety
```bash
# Exit code MUST be 0 for all
npm run build
npm run typecheck  # if TypeScript
npm run lint
```

### Security Scan
```bash
# Check for hardcoded secrets
grep -rE "(api[_-]?key|password|secret|token|bearer)\s*[:=]\s*['\"][a-zA-Z0-9]+" \
  --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" .

# Expected: exit 1 (no matches found)
# If exit 0: FAIL, secrets detected, move to .env
```

### SQL Injection Check
```bash
# Check for dangerous SQL patterns
grep -rE "(WHERE|SET|INSERT|UPDATE|DELETE).*(\$\{|\+\s*(req\.|params\.|query\.)|concat\()" \
  --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules .

# Expected: exit 1 (no dangerous patterns)
# If exit 0: FAIL, use parameterized queries
```

### Accessibility Audit
```bash
# Check for images without alt
grep -rE '<img(?![^>]*alt=)' \
  --include="*.html" --include="*.jsx" --include="*.tsx" \
  --exclude-dir=node_modules .

# Expected: exit 1 (all images have alt)

# Check for inputs without labels
grep -rE '<input(?![^>]*aria-label)(?![^>]*(id=["'\''][^"'\'']+["'\''].*<label[^>]*for=))' \
  --include="*.html" --include="*.jsx" --include="*.tsx" \
  --exclude-dir=node_modules .

# Expected: exit 1 (all inputs labeled)
```

### Performance Check
```bash
# Check for large unoptimized images
find . -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) \
  -size +500k ! -path "*/node_modules/*" ! -path "*/.next/*"

# Expected: no output (all images <500KB)
```

## Code Examples — Review Patterns

### Security Review Pattern

**❌ FAIL (Hardcoded Secret):**
```typescript
const API_KEY = "sk_live_abc123def456789";
await fetch(`https://api.stripe.com/v1/charges`, {
  headers: { Authorization: `Bearer ${API_KEY}` }
});
```

**✅ PASS (Environment Variable):**
```typescript
const API_KEY = process.env.STRIPE_SECRET_KEY;
if (!API_KEY) throw new Error("STRIPE_SECRET_KEY not set");
await fetch(`https://api.stripe.com/v1/charges`, {
  headers: { Authorization: `Bearer ${API_KEY}` }
});
```

### Input Validation Review Pattern

**❌ FAIL (No Validation):**
```typescript
app.post('/api/user', (req, res) => {
  const { email, age } = req.body;
  db.insert({ email, age }); // Accepts ANY input!
});
```

**✅ PASS (Validated with Schema):**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  age: z.number().int().min(0).max(120)
});

app.post('/api/user', async (req, res) => {
  const data = userSchema.parse(req.body); // Throws if invalid
  await db.insert(data);
  res.json({ success: true });
});
```

### Responsive Design Review Pattern

**❌ FAIL (Fixed Width):**
```css
.container {
  width: 1200px; /* Breaks on mobile! */
}
```

**✅ PASS (Responsive):**
```css
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
}
```

### SEO Review Pattern

**❌ FAIL (Missing Meta Tags):**
```tsx
export default function Page() {
  return <div>Content</div>;
}
```

**✅ PASS (Complete Meta):**
```tsx
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Specific Page Title | Brand</title>
        <meta name="description" content="Clear description under 155 chars" />
        <meta property="og:title" content="Specific Page Title" />
        <meta property="og:description" content="Clear description" />
        <link rel="canonical" href="https://example.com/page" />
      </Head>
      <main>
        <h1>Page Heading</h1>
        <div>Content</div>
      </main>
    </>
  );
}
```

## Failure Modes — Real Incidents

### Failure: Skip Security Check
**Real incident:** Delivered code with `API_KEY = "sk_live_..."` visible in GitHub.
**Impact:** Key rotated by Stripe within 4 hours, $500 in API calls from bots.
**Prevention:** ALWAYS run secret scan before deliver.

### Failure: No Mobile Test
**Real incident:** Delivered "responsive" site, but horizontal scroll on iPhone.
**Impact:** 60% mobile bounce rate, user frustrated, had to refactor.
**Prevention:** ALWAYS test at 375px, 768px, 1440px before claiming responsive.

### Failure: Missing Alt Text
**Real incident:** Delivered e-commerce site, all product images missing alt.
**Impact:** Google Image Search didn't index products, lost 30% organic traffic.
**Prevention:** ALWAYS run accessibility checks before deliver.

### Failure: Infinite Loop in useEffect
**Real incident:** Delivered React component with missing dependency in useEffect.
**Impact:** Browser froze, user thought site broken, closed tab.
**Prevention:** ALWAYS run lint with exhaustive-deps rule before deliver.

## Evidence Gates — Proof of Quality

Agent CANNOT claim "selesai" until ALL these proofs exist:

### 1. Build Proof
```bash
$ npm run build
✓ Compiled successfully
Build completed in 12.3s

$ echo $?
0  # Exit code 0 = success
```

### 2. Security Scan Proof
```bash
$ grep -r "api_key.*=.*\"sk_" .
$ echo $?
1  # Exit 1 = no matches = PASS
```

### 3. Visual Test Proof (Frontend)
- Screenshot at 375px (mobile)
- Screenshot at 768px (tablet)
- Screenshot at 1440px (desktop)
- Console screenshot showing 0 errors

### 4. Functionality Test Proof
- Manual test: all buttons clicked, all forms submitted
- Result: no broken interactions
- Documentation: which flows were tested

**Format laporan self-review:**
```
🔍 SELF REVIEW GATE — QUALITY PROOF
─────────────────────────────────
✅ Build: npm run build → exit 0
✅ TypeCheck: npm run typecheck → 0 errors
✅ Lint: npm run lint → 0 errors, 0 warnings
✅ Security: no hardcoded secrets found (grep exit 1)
✅ SQL Safety: no unsafe query patterns (grep exit 1)
✅ Accessibility: all images have alt (grep exit 1)
✅ Accessibility: all inputs labeled (grep exit 1)
✅ Performance: no images >500KB (find returned empty)
✅ Responsive: tested 375px, 768px, 1440px - all layouts intact
✅ Functionality: all 5 interactive flows tested manually
✅ Console: 0 errors, 0 warnings in browser console
✅ SEO: all 3 pages have meta description
⚠️ Known limitation: tidak ditest di Safari (hanya Chrome/Firefox)
─────────────────────────────────
GATE STATUS: PASS - Ready to deliver
```

## Automated Self-Review Script

Agent dapat menjalankan script ini untuk otomasi checks:

```bash
#!/bin/bash
# .agent/scripts/self-review-validator.mjs dipanggil seperti ini:

node .agent/scripts/self-review-validator.mjs

# Untuk perubahan khusus .agent / generated bridge
node .agent/scripts/self-review-validator.mjs --scope agent

# Output example:
# ✅ Build passed
# ✅ Security scan passed
# ❌ Accessibility: 3 images missing alt text
# ❌ Performance: 2 images >500KB found
# 
# GATE STATUS: FAIL
# Fix issues above before delivery.
```

Jika ada ❌, agent WAJIB fix dulu sebelum deliver.

## Sub-Agent Propagation

## Sub-Agent Self-Review

Sub-agent yang di-dispatch WAJIB menjalankan self-review sebelum report back:

```
"Before reporting completion:
1. Run self-review-gate checks
2. Fix any failures
3. Report back with validation proof

Read .agent/skills/self-review-gate/SKILL.md for checklist."
```

## Quality Checklist — Expanded (Internal Gate)

Checklist lengkap yang WAJIB dijalankan sebelum deliver:

### 🧱 KODE
- [ ] Build successful (npm run build → exit 0)
- [ ] No TypeScript errors (npm run typecheck → 0 errors)
- [ ] No lint errors (npm run lint → 0 errors)
- [ ] No console.log/console.error left in production code
- [ ] No TODO/FIXME that should be done in this phase
- [ ] Variable/function names are clear and consistent
- [ ] No dead code or unused imports

### 🔒 KEAMANAN
- [ ] No hardcoded credentials/API keys (grep scan passed)
- [ ] All user input validated with schema (zod/yup/joi)
- [ ] Database queries use parameterized statements (grep scan passed)
- [ ] Environment variables used for config (.env.example exists)
- [ ] CSRF protection enabled for forms
- [ ] Rate limiting implemented on API endpoints
- [ ] Error messages don't leak sensitive info

### 🎨 UI/UX (if frontend)
- [ ] Responsive at 375px (mobile)
- [ ] Responsive at 768px (tablet)
- [ ] Responsive at 1440px (desktop)
- [ ] Loading states for all async operations
- [ ] Error states are user-friendly (not raw error messages)
- [ ] Success feedback for user actions
- [ ] Color contrast meets WCAG 4.5:1 ratio
- [ ] All buttons/links work (manual test passed)
- [ ] No horizontal scroll at any breakpoint
- [ ] Focus indicators visible for keyboard navigation

### 🔍 SEO (if web pages)
- [ ] Every page has unique <title> (max 60 chars)
- [ ] Every page has meta description (max 155 chars)
- [ ] Heading hierarchy correct (single h1, proper h2/h3)
- [ ] All images have descriptive alt text (grep scan passed)
- [ ] Semantic HTML used (<header>, <main>, <footer>, etc.)
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Canonical URLs set

### ⚡ PERFORMA
- [ ] No infinite loops or obvious memory leaks
- [ ] Large images lazy loaded
- [ ] No unnecessary re-renders (React DevTools checked)
- [ ] No blocking operations on main thread
- [ ] Bundle size reasonable (<250KB for critical path)
- [ ] Images optimized (<500KB, WebP format if possible)

### ♿ AKSESIBILITAS
- [ ] All images have alt text (grep scan passed)
- [ ] All inputs have labels (grep scan passed)
- [ ] Keyboard navigation works (Tab/Enter/Escape tested)
- [ ] Focus order is logical
- [ ] Skip navigation link present
- [ ] ARIA labels used where needed

### 📁 FILE & PROJECT
- [ ] All files saved (no unsaved changes)
- [ ] No temporary/test files left (.tmp, test-*.js, etc.)
- [ ] PROJECT_MEMORY.md updated (if using project-memory skill)
- [ ] .env.example present (if project uses env variables)
- [ ] .gitignore includes .env and node_modules
- [ ] README.md updated with setup instructions

### 🧪 TESTING
- [ ] Manual test: all user flows work end-to-end
- [ ] Browser console: 0 errors, 0 critical warnings
- [ ] Network tab: no failed requests (except expected 404s)
- [ ] Tested in 2+ browsers (Chrome + Firefox/Safari)

**ATURAN:** Jika ada item yang ❌:
1. Kalau bisa diperbaiki sekarang → PERBAIKI dulu
2. Kalau di luar scope fase ini → catat di "Yang BELUM dikerjakan"
3. Kalau di luar kemampuan AI → laporkan ke user dengan jujur

## Integration dengan Governance Workflow

```
Agent selesai coding fase X
  ↓
[AUTO] Run automated checks:
  - npm run build
  - npm run typecheck
  - npm run lint
  - grep security scans
  - grep accessibility scans
  ↓
[AUTO] Parse results → any failures?
  ↓
  YES → [AUTO] Attempt to fix common issues
        ↓
        Re-run checks → still failing?
        ↓
        YES → STOP, report to user with details
        NO → continue
  ↓
  NO → continue
  ↓
[MANUAL] Run expanded quality checklist (internal)
  ↓
  Any ❌ that should be fixed now?
  ↓
  YES → FIX → re-run checklist
  NO → continue
  ↓
[AUTO] Update PROJECT_MEMORY.md (if project-memory active)
  ↓
[AUTO] Generate validation proof report
  ↓
[DELIVER] Show results to user with phased-delivery format
  ↓
Wait for user approval
```

## When to Show Checklist to User

**DON'T show by default** — this is internal quality gate.

**DO show when:**
- User asks: "udah dicek belum?" or "quality-nya gimana?"
- There's a ❌ outside AI capability (e.g., "needs Safari test")
- Final project report (summary version, not full checklist)
- User explicitly requests audit report

**Format for user (if shown):**
```
Quality audit passed with [X]/[Y] checks green.
Key highlights:
✅ Security: no secrets in code, all inputs validated
✅ Performance: bundle size 180KB, all images optimized
✅ Accessibility: keyboard navigation works, all images have alt text
⚠️ Not tested on Safari (tested on Chrome + Firefox)
```
