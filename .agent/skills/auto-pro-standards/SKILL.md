---
name: auto-pro-standards
description: "Otomatis terapkan standar keamanan OWASP, SEO, performa Core Web Vitals, dan aksesibilitas WCAG ke setiap project — tanpa user perlu minta."
---

# Auto Pro Standards — Zero-Jargon Quality Boost

> **One-liner:** Otomatis terapkan standar keamanan, SEO, performa, dan aksesibilitas ke SETIAP project, bahkan kalau user cuma bilang "bikin web".

## When to Use

- **SETIAP kali** user minta bikin project baru (web, app, API, landing page, dll).
- **SETIAP kali** user minta fitur baru yang melibatkan frontend atau backend.
- User TIDAK perlu menyebut istilah teknis. Skill ini yang menerjemahkan.

## Why This Exists

User pemula tidak tahu (dan tidak perlu tahu) istilah seperti OWASP, CSRF, helmet, schema markup, Core Web Vitals, atau rate limiting. Tapi mereka tetap berhak mendapat output berkualitas profesional. Skill ini menjadi "penerjemah otomatis" yang menyuntikkan standar tinggi ke setiap project tanpa membebani user dengan jargon.

## ALWAYS DO THIS

### 🔒 Keamanan (Otomatis, Tanpa Diminta)
Untuk SETIAP project yang melibatkan backend/API/database:
- Input validation di setiap form dan endpoint (cegah SQL injection, XSS)
- Sanitasi semua data dari user sebelum masuk database
- Environment variables untuk credential (JANGAN hardcode API key/password)
- Rate limiting di API endpoint (cegah spam/brute force)
- CORS configuration yang ketat (hanya izinkan domain yang dibutuhkan)
- HTTP security headers (helmet atau equivalent)
- CSRF protection untuk form
- Password hashing (bcrypt/argon2, JANGAN simpan plain text)
- Prepared statements / parameterized queries untuk database

### 🔍 SEO (Otomatis, Tanpa Diminta)
Untuk SETIAP project yang punya halaman web:
- Title tag yang unik dan deskriptif di setiap halaman (maks 60 karakter)
- Meta description di setiap halaman (maks 155 karakter)
- Satu `<h1>` per halaman, heading hierarchy yang benar (h1 > h2 > h3)
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`)
- Open Graph tags (og:title, og:description, og:image) untuk sharing di sosmed
- Canonical URL untuk mencegah duplicate content
- Alt text di semua gambar
- Sitemap.xml
- robots.txt
- Structured data / Schema.org markup (minimal Organization atau WebSite)
- Mobile-friendly / responsive design

### ⚡ Performa (Otomatis, Tanpa Diminta)
- Lazy loading untuk gambar dan komponen berat
- Code splitting / dynamic imports untuk bundle yang besar
- Image optimization (format WebP, ukuran responsif)
- Minifikasi CSS/JS di production
- Caching strategy yang sesuai (static assets, API responses)
- Loading states untuk semua operasi async (jangan blank screen)
- Error boundaries / error handling yang user-friendly

### ♿ Aksesibilitas (Otomatis, Tanpa Diminta)
- Warna kontras yang cukup (rasio minimal 4.5:1 untuk teks normal)
- Semua interactive element bisa diakses via keyboard (tab, enter, escape)
- Label yang jelas untuk semua form input
- Focus indicator yang visible
- Skip navigation link
- aria-label untuk elemen yang tidak punya teks visible
- Responsive: bisa dipakai di mobile, tablet, desktop

### 🎨 Desain (Otomatis, Tanpa Diminta)
- Dark mode support (atau minimal color scheme yang tidak bikin mata sakit)
- Consistent spacing dan typography
- Responsive layout (mobile-first)
- Loading skeleton / placeholder (bukan blank putih)
- Micro-interactions dan hover effects
- Proper error states, empty states, dan success states

## Cara Kerja untuk Agent

Ketika user memberikan perintah sederhana seperti:
- "Bikin web toko online" 
- "Buatin portfolio"
- "Bikin API untuk aplikasi chat"
- "Buatin landing page"

Agent WAJIB:
1. Baca skill ini
2. Secara DIAM-DIAM (tanpa menjelaskan jargon ke user) terapkan SEMUA standar di atas
3. Di I AM CRAZY header, sebutkan "auto-pro-standards" sebagai skill yang dipakai
4. JANGAN tanya user "mau pakai OWASP?" atau "mau SEO-ready?" — LANGSUNG terapkan

## NEVER DO THIS

- JANGAN tanya user apakah mereka mau keamanan/SEO/performa — SELALU terapkan
- JANGAN skip standar hanya karena user tidak menyebutkannya
- JANGAN jelaskan jargon teknis panjang lebar ke user pemula kecuali mereka tanya
- JANGAN bikin form tanpa validasi
- JANGAN bikin API tanpa rate limiting
- JANGAN bikin halaman tanpa meta tags
- JANGAN hardcode credential di source code
- JANGAN kirim response API tanpa proper error handling
- JANGAN bikin UI yang cuma bagus di desktop tapi hancur di mobile

## Pengecualian

Skill ini TIDAK berlaku untuk:
- Script one-off / scratch file untuk testing
- Percakapan biasa / tanya jawab
- File konfigurasi internal (.agent, .env.example, dll)

## Validation Steps — WAJIB

Sebelum menyerahkan hasil ke user, agent HARUS menjalankan validasi ini:

### 🔒 Security Validation
```bash
# Check for hardcoded secrets
grep -rE '(api[_-]?key|password|secret|token)\s*=\s*["\047]' --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules .

# Expected: no matches (secrets harus di .env)
```

```bash
# Check for SQL injection vulnerability patterns
grep -rE "(WHERE|SET|INSERT).*(\$\{|\+\s*req\.|concat\()" --include="*.js" --include="*.ts" --exclude-dir=node_modules .

# Expected: no matches (use parameterized queries)
```

### 🔍 SEO Validation
```bash
# Check for missing meta tags in HTML/JSX
grep -L 'meta.*description' $(find . -name "*.html" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules)

# Expected: empty result (all pages have meta description)
```

```bash
# Check for images without alt text
grep -rE '<img(?![^>]*alt=)' --include="*.html" --include="*.jsx" --include="*.tsx" --exclude-dir=node_modules .

# Expected: no matches (all images have alt text)
```

### ⚡ Performance Validation
```bash
# Check for unoptimized large images (>500KB)
find . -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) -size +500k ! -path "*/node_modules/*"

# Expected: no matches (optimize large images)
```

### ♿ Accessibility Validation
```bash
# Check for missing form labels
grep -rE '<input(?![^>]*aria-label)(?![^>]*id=)' --include="*.html" --include="*.jsx" --include="*.tsx" --exclude-dir=node_modules .

# Expected: no matches (all inputs have labels/aria-label)
```

## Code Examples — Real Implementation

### Security: Input Validation (Next.js API Route)
```typescript
// ❌ NEVER DO THIS (vulnerable to injection)
app.get('/user', (req, res) => {
  const userId = req.query.id;
  db.query(`SELECT * FROM users WHERE id = ${userId}`); // SQL INJECTION!
});

// ✅ ALWAYS DO THIS (parameterized query)
app.get('/user', async (req, res) => {
  const userId = z.string().uuid().parse(req.query.id); // Validate input
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return res.json(user);
});
```

### Security: Environment Variables
```typescript
// ❌ NEVER DO THIS
const API_KEY = "sk_live_abc123def456"; // Hardcoded secret!

// ✅ ALWAYS DO THIS
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY not configured');
```

### SEO: Meta Tags (Next.js)
```tsx
// ❌ NEVER DO THIS (missing meta tags)
export default function Page() {
  return <div>Content</div>;
}

// ✅ ALWAYS DO THIS
import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Precise Page Title - Brand Name</title>
        <meta name="description" content="Clear, compelling description under 155 chars" />
        <meta property="og:title" content="Precise Page Title" />
        <meta property="og:description" content="Clear description" />
        <meta property="og:image" content="/og-image.jpg" />
        <link rel="canonical" href="https://example.com/page" />
      </Head>
      <div>Content</div>
    </>
  );
}
```

### Performance: Image Optimization (Next.js)
```tsx
// ❌ NEVER DO THIS (unoptimized, no lazy load)
<img src="/large-image.jpg" />

// ✅ ALWAYS DO THIS
import Image from 'next/image';

<Image 
  src="/large-image.jpg" 
  alt="Descriptive alt text"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### Accessibility: Form Labels
```tsx
// ❌ NEVER DO THIS (no label, no keyboard access)
<input type="text" placeholder="Email" />

// ✅ ALWAYS DO THIS
<label htmlFor="email" className="sr-only">Email Address</label>
<input 
  id="email"
  type="email" 
  placeholder="Email"
  aria-label="Email Address"
  required
/>
```

## Failure Modes — Why Standards Matter

### Security Failure: Hardcoded API Key
**Real incident:** API key leaked in GitHub → $10,000 AWS bill in 24 hours.
**Prevention:** ALWAYS use environment variables, NEVER commit .env to Git.

### SEO Failure: Missing Meta Description
**Real impact:** Google shows random text from page → low click-through rate → lost traffic.
**Prevention:** EVERY page needs unique meta description.

### Performance Failure: Unoptimized Images
**Real impact:** 5MB image on mobile → 30 second load time → 80% bounce rate.
**Prevention:** Optimize images to <200KB, use WebP, lazy load.

### Accessibility Failure: No Keyboard Navigation
**Real impact:** Blind user cannot submit form → legal complaint → lawsuit.
**Prevention:** Test EVERY interactive element with Tab/Enter/Escape.

## Evidence Gates — Proof Before Delivery

Agent MUST provide evidence for EACH standard:

1. **Security:** Output dari `grep` command showing no hardcoded secrets
2. **SEO:** Screenshot atau HTML source showing meta tags present
3. **Performance:** Bundle size report or Lighthouse score
4. **Accessibility:** Manual keyboard test result (Tab through all inputs)

**Format laporan:**
```
✅ Security: No hardcoded secrets found (grep exit 1)
✅ SEO: 5/5 pages have meta description
✅ Performance: Bundle size 180KB (target <250KB)
✅ Accessibility: All forms keyboard-accessible (tested manually)
⚠️ Risiko tersisa: Belum test screen reader compatibility
```

## Sub-Agent Propagation

When dispatching sub-agents:

```
"Apply the auto-pro-standards skill. Do NOT ask user about security/SEO/performance - 
AUTOMATICALLY implement OWASP input validation, meta tags, image optimization, 
and accessibility labels. Read .agent/skills/auto-pro-standards/SKILL.md for exact patterns."
```

## Quality Checklist (Self-Review Gate)

Sebelum deliver, agent harus dapat menjawab YA untuk semua:

- [ ] Apakah semua form punya input validation dengan library seperti zod/yup?
- [ ] Apakah credential disimpan di .env dan .env ada di .gitignore?
- [ ] Apakah setiap halaman punya title + meta description unik?
- [ ] Apakah layout tested di mobile viewport (375px)?
- [ ] Apakah ada loading state untuk semua fetch/mutation?
- [ ] Apakah error ditangani dengan try-catch dan user-friendly message?
- [ ] Apakah gambar punya alt text deskriptif (bukan "image")?
- [ ] Apakah warna kontras tested dengan tool (mis. WebAIM Contrast Checker)?
- [ ] Apakah API endpoints punya rate limiting?
- [ ] Apakah database query menggunakan parameterized statements?

**Jika ada yang TIDAK, PERBAIKI dulu sebelum deliver.**
