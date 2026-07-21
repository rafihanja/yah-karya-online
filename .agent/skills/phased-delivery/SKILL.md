---
name: phased-delivery
description: "Pecah project jadi fase kecil, jelaskan hasil tiap fase, cek di browser, minta persetujuan sebelum lanjut. Anti 'ngoding semua sekaligus lalu bilang selesai'."
---

# Phased Delivery — Bangun Bertahap, Cek Setiap Langkah

> **One-liner:** Jangan selesaikan project dalam 1 kali jalan. Pecah jadi fase-fase kecil, jelaskan hasilnya tiap fase, cek di browser, dan minta persetujuan sebelum lanjut ke fase berikutnya.

## When to Use

- SETIAP kali membangun project baru (web, app, API, fitur besar).
- SETIAP kali scope pekerjaan lebih dari 1 file atau 1 komponen.
- TIDAK berlaku untuk: fix bug kecil, edit 1 baris, atau pertanyaan pengetahuan.

## Why This Exists

AI punya kebiasaan buruk: dikasih tugas besar, dia langsung ngoding semua sekaligus dalam 1 tembakan, lalu bilang "selesai". Hasilnya? Kode yang panjang, belum dicek, penuh bug tersembunyi, dan user nggak ngerti apa yang terjadi. 

Project yang berkualitas dibangun BERTAHAP — sama seperti cara engineer profesional bekerja. Setiap fase kecil dicek, diperbaiki, lalu dilanjut. Ini menghasilkan output yang jauh lebih solid dan user selalu tahu posisi progress-nya.

## ALWAYS DO THIS

### Aturan Utama: Pecah Jadi Fase

Setiap project WAJIB dipecah menjadi fase-fase kecil. Jumlah fase tergantung kompleksitas:

| Kompleksitas | Contoh | Jumlah Fase |
|---|---|---|
| Ringan | Landing page 1 halaman | 2-3 fase |
| Sedang | Web portfolio multi-halaman | 3-5 fase |
| Berat | Fullstack app + auth + database | 5-8 fase |

### Format Setiap Fase

Setiap fase WAJIB mengikuti pola ini:

```
═══════════════════════════════════════════
📍 FASE [nomor] dari [total]: [nama fase]
═══════════════════════════════════════════

🎯 Tujuan fase ini:
   [Jelaskan dalam 1-2 kalimat apa yang dikerjakan di fase ini]

📁 File yang dibuat/diubah:
   - [nama file] — [fungsinya]
   - [nama file] — [fungsinya]

✅ Yang sudah selesai di fase ini:
   - [fitur/komponen yang sudah jadi]
   - [fitur/komponen yang sudah jadi]

❌ Yang BELUM dikerjakan (dijadwalkan di fase berikutnya):
   - [fitur yang belum ada]
   - [fitur yang belum ada]

🔍 Cara cek hasil fase ini:
   - [instruksi spesifik untuk user mengecek, misal: "buka localhost:3000"]
   - [atau: "buka file index.html di browser"]

⏭️ Fase berikutnya: [preview singkat fase selanjutnya]

👉 Cek dulu hasilnya, kalau oke bilang "lanjut".
   Kalau ada yang mau diubah, sebutin aja.
═══════════════════════════════════════════
```

### Contoh Pembagian Fase (Web Toko Online)

```
FASE 1: Fondasi & Layout
  → Setup project, struktur folder, layout utama, navigasi, responsive shell
  → User cek: tampilan dasar sudah muncul di browser

FASE 2: Halaman Produk & Katalog  
  → Daftar produk, kartu produk, halaman detail, filter/search
  → User cek: bisa lihat daftar produk, klik masuk detail

FASE 3: Keranjang & Checkout
  → Tambah ke keranjang, ubah jumlah, form checkout, validasi input
  → User cek: bisa tambah barang, isi form, lihat ringkasan

FASE 4: Keamanan & Backend
  → API endpoint, autentikasi, database, rate limiting, input sanitization
  → User cek: login berfungsi, data tersimpan

FASE 5: SEO, Performa & Polish
  → Meta tags, sitemap, schema markup, lazy loading, animasi, dark mode
  → User cek: lighthouse score, mobile responsive, loading speed

FASE 6: Testing & Final Review
  → Cek semua form, edge cases, error handling, cross-browser
  → User cek: coba pakai seperti user asli, cari yang error
```

### Pengecekan di Browser

Agent WAJIB memastikan user bisa mengecek hasil setiap fase:

**Untuk project web/frontend:**
- Jalankan dev server (`npm run dev`, `npx live-server`, atau buka file langsung)
- Berikan URL yang bisa dibuka (`localhost:3000`, `localhost:5173`, dll)
- Sebutkan apa yang harus dicek: "Coba resize browser ke ukuran HP, pastiin layoutnya nggak berantakan"

**Untuk project backend/API:**
- Berikan contoh curl command atau instruksi Postman
- Atau buat halaman test sederhana

**Untuk project fullstack:**
- Jalankan backend + frontend bersamaan
- Berikan instruksi step-by-step cara testnya

### Gate Antar Fase

- Agent TIDAK BOLEH lanjut ke fase berikutnya tanpa persetujuan user.
- Kalau user minta revisi, perbaiki di fase saat ini dulu sebelum lanjut.
- Kalau user bilang "lanjut", "gas", "oke", "next" — baru boleh ke fase berikutnya.
- Kalau user bilang "skip ke fase X" — boleh, tapi sebutkan risiko yang mungkin muncul.

### Laporan Akhir

Setelah fase terakhir selesai, agent WAJIB memberikan laporan ringkasan:

```
═══════════════════════════════════════════
🏁 PROJECT SELESAI — LAPORAN AKHIR
═══════════════════════════════════════════

📊 Total fase: [X] fase
📁 Total file: [X] file dibuat/diubah
🔧 Skill dipakai: [daftar skill]

✅ Fitur yang sudah jadi:
   - [daftar lengkap]

🔒 Keamanan yang diterapkan:
   - [daftar]

🔍 SEO yang diterapkan:
   - [daftar]

⚡ Performa yang diterapkan:
   - [daftar]

⚠️ Limitasi / yang bisa ditingkatkan nanti:
   - [jujur sebutkan apa yang belum perfect]

🧪 Cara testing menyeluruh:
   - [instruksi untuk user]
═══════════════════════════════════════════
```

## NEVER DO THIS

- JANGAN kerjakan seluruh project dalam 1 fase tanpa checkpoint.
- JANGAN lanjut ke fase berikutnya tanpa izin user.
- JANGAN sembunyikan apa yang belum selesai — SELALU sebutkan di bagian "Yang BELUM dikerjakan".
- JANGAN skip pengecekan browser/visual — kalau ada UI, user HARUS bisa lihat hasilnya.
- JANGAN bilang "selesai" kalau belum ada laporan akhir.
- JANGAN bikin fase yang terlalu besar (1 fase = maksimal 3-4 file utama yang diubah).
- JANGAN bikin fase yang terlalu kecil dan sepele (misal: 1 fase cuma buat bikin 1 variabel).

## Validation Steps — Proof of Phase Quality

Setiap fase WAJIB divalidasi SEBELUM minta approval user:

### Build Validation (Jika Applicable)
```bash
# For web projects
npm run build
# Expected: exit 0, no errors

# For type-checked projects
npm run typecheck
# Expected: 0 type errors
```

### Visual Validation (For Frontend)
```bash
# Start dev server
npm run dev
# Expected: server starts without errors

# Manual check:
# 1. Open localhost:[port] in browser
# 2. Check console: 0 errors
# 3. Resize to mobile (375px): layout tidak berantakan
# 4. Test interactivity: semua button/link berfungsi
```

### API Validation (For Backend)
```bash
# Test endpoint dengan curl
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected: proper JSON response, no 500 errors
```

### Security Validation (Every Phase)
```bash
# Check for hardcoded secrets
grep -r "api_key\|password\|secret" --include="*.js" --exclude-dir=node_modules .
# Expected: no matches (secrets in .env)
```

## Code Examples — Phase Patterns

### Pattern: Phase 1 Foundation (Next.js)

**BAD (All-at-once):**
```bash
# Agent creates 20 files at once
pages/index.js, pages/products.js, pages/checkout.js, 
components/Header.js, components/Footer.js, components/ProductCard.js,
lib/db.js, lib/auth.js, api/products.js, api/cart.js...
# User overwhelmed, can't verify anything
```

**GOOD (Phased):**
```bash
# FASE 1: Foundation only
├── pages/
│   └── _app.js          # Global layout
│   └── index.js         # Home page shell
├── components/
│   └── Layout.js        # Header + Footer shell
│   └── Navigation.js    # Basic nav
├── styles/
│   └── globals.css      # Base styles + responsive grid
└── public/
    └── logo.svg

# Validation:
npm run dev → localhost:3000 shows layout
Resize to 375px → nav collapses to hamburger
Check console → 0 errors

# User approval checkpoint:
"Layout sudah responsive, nav berfungsi. Lanjut ke content?"
```

### Pattern: Phase 2 Feature Implementation

```bash
# FASE 2: Product Catalog
├── pages/
│   └── products/
│       └── index.js     # Product list page
│       └── [id].js      # Product detail page
├── components/
│   └── ProductCard.js   # Product card component
│   └── ProductGrid.js   # Grid layout
│   └── ProductFilter.js # Filter sidebar
└── lib/
    └── products.js      # Mock data (API comes later)

# Validation:
npm run build → exit 0
Open /products → grid displays 12 products
Click product → detail page loads
Test filter → products filter correctly
Mobile check → grid becomes 1 column

# User approval checkpoint:
"Katalog sudah bisa browsing + filter. Lanjut ke keranjang?"
```

## Failure Modes — Why Phasing Matters

### Failure: All-at-once Delivery
**Scenario:** Agent creates full e-commerce (20 files) in 1 shot.
**Result:** 
- User opens site, layout broken on mobile
- Agent says "selesai" but hasn't tested
- User finds 10 bugs, agent has to refactor everything
- 5 hours wasted vs 2 hours phased approach
**Prevention:** ALWAYS break into phases with validation gates.

### Failure: No Visual Checks
**Scenario:** Agent creates UI but never asks user to open browser.
**Result:** 
- CSS typo makes everything white-on-white
- Discovered only at end, after 3 more phases built on broken foundation
**Prevention:** EVERY frontend phase requires browser check + user confirmation.

### Failure: Skipping Validation
**Scenario:** Agent moves to Phase 3 without running `npm run build`.
**Result:**
- TypeScript errors accumulate
- Phase 5 can't build at all
- Must backtrack and fix phases 2-4
**Prevention:** Run validation commands BEFORE requesting phase approval.

### Failure: Giant Phases
**Scenario:** Phase 2 includes "all features" (auth + database + API + UI).
**Result:**
- Agent works 30 minutes, user can't verify incrementally
- One bug blocks everything
- Hard to isolate which part failed
**Prevention:** Max 3-4 files per phase, single clear objective.

## Evidence Gates — Proof Before Moving Forward

Agent CANNOT proceed to next phase until ALL these exist:

1. **Build Success Proof**
   ```bash
   npm run build && echo "BUILD_PASSED"
   # Must see: BUILD_PASSED
   ```

2. **Visual Confirmation (Frontend)**
   - Screenshot saved to `.agent/temp/phase-[N]-screenshot.png`
   - OR user explicitly says "sudah saya cek, oke"

3. **Validation Command Output**
   ```bash
   # Example for Phase 3 (API)
   npm run test:api
   # Output: 5/5 tests passed
   ```

4. **User Approval Quote**
   - Literal text: "lanjut", "gas", "oke", "next"
   - OR specific feedback addressed and re-validated

**Format laporan per fase:**
```
📋 PHASE [N] VALIDATION
─────────────────────────────────
✅ Build: npm run build → exit 0
✅ TypeCheck: 0 errors
✅ Visual: tested at 375px, 768px, 1440px
✅ Functionality: all buttons work, no console errors
✅ Security: no hardcoded secrets found
✅ User approval: "lanjut" (received 2026-06-28 14:32:10)
─────────────────────────────────
Ready for Phase [N+1]
```

## Sub-Agent Propagation

When dispatching sub-agent for a specific phase:

```
"You are working on PHASE [N] of an approved multi-phase project.

SCOPE OF THIS PHASE: [specific objective]
FILES TO MODIFY: [list]
VALIDATION REQUIRED: [commands]

DO NOT work on features from other phases.
DO NOT skip validation steps.
REPORT BACK with validation proof + request user approval before claiming done.

Read phased-delivery skill for format."
```

## Quality Checklist (Per-Phase Gate)

Before requesting user approval for ANY phase:

- [ ] Apakah build berhasil tanpa error? (npm run build → exit 0)
- [ ] Apakah semua type errors resolved? (jika pakai TypeScript)
- [ ] Apakah UI sudah dicek di browser pada 3 breakpoints? (mobile/tablet/desktop)
- [ ] Apakah console browser 0 errors dan 0 warnings critical?
- [ ] Apakah semua interaksi berfungsi? (button click, form submit, navigation)
- [ ] Apakah tidak ada hardcoded secrets di code?
- [ ] Apakah file yang dibuat sesuai objective fase ini (tidak melebar ke fase lain)?
- [ ] Apakah saya punya bukti validasi (output command atau user confirmation)?
- [ ] Apakah saya sudah jelaskan apa yang BELUM dikerjakan?
- [ ] Apakah saya sudah kasih instruksi jelas cara user cek hasilnya?

**Jika ada yang TIDAK, PERBAIKI sebelum minta approval.**

## Final Report Template (After Last Phase)

```
═══════════════════════════════════════════
🏁 PROJECT COMPLETED — COMPREHENSIVE REPORT
═══════════════════════════════════════════

📊 **Delivery Metrics:**
   - Total phases: [X]
   - Total files created/modified: [X]
   - Total build time: [X] minutes
   - Total lines of code: [X]

📁 **File Structure:**
[tree output of main directories]

✅ **Features Delivered:**
   1. [Feature name] — [status: working, tested]
   2. [Feature name] — [status: working, tested]
   ...

🔧 **Skills Applied:**
   - [skill-name]: [what it contributed]
   - [skill-name]: [what it contributed]
   ...

🔒 **Security Implementation:**
   ✅ Input validation on all forms (zod schemas)
   ✅ Environment variables for secrets (.env.local)
   ✅ Rate limiting on API routes (10 req/min)
   ✅ CSRF protection enabled
   ✅ SQL injection prevention (parameterized queries)

🔍 **SEO Implementation:**
   ✅ Unique meta description on [X] pages
   ✅ Schema.org markup (Product, Organization)
   ✅ Sitemap.xml generated
   ✅ robots.txt configured
   ✅ Open Graph tags for social sharing

⚡ **Performance Metrics:**
   ✅ Bundle size: [X] KB (target: <250KB)
   ✅ First Contentful Paint: [X]s (target: <1s)
   ✅ Images optimized: WebP format, lazy loaded
   ✅ Code splitting: [X] route chunks

♿ **Accessibility Compliance:**
   ✅ WCAG 2.2 AA keyboard navigation
   ✅ Form labels and ARIA attributes
   ✅ Color contrast ratio: 4.5:1+ on all text
   ✅ Focus indicators visible

✅ **Validation Proof:**
   npm run build → exit 0
   npm run lint → 0 errors
   npm run typecheck → 0 errors
   Manual test: all features work on Chrome/Safari/Firefox

⚠️ **Known Limitations:**
   - [Honest list of what's not perfect]
   - [Technical debt or future improvements]
   - [Browser/device compatibility notes]

🧪 **Testing Checklist for User:**
   1. Run: npm run dev
   2. Open: http://localhost:3000
   3. Test these flows:
      - [Flow 1]: [expected result]
      - [Flow 2]: [expected result]
      - [Flow 3]: [expected result]
   4. Check mobile: resize to 375px width
   5. Check console: should be 0 errors

📚 **Documentation:**
   - README.md: setup and run instructions
   - .env.example: required environment variables
   - [Other docs if created]

═══════════════════════════════════════════
```

## Hubungan dengan Skill Lain

Workflow lengkap dengan skill governance:

```
User: "bikin web toko"
  ↓
[session-boot] → emit I AM CRAZY header
  ↓
[prompt-amplifier] → tanya 5 pertanyaan, jelaskan rencana, minta approval
  ↓
[phased-delivery] → pecah jadi 5-6 fase, jelaskan fase plan
  ↓
FASE 1: Foundation
  ├─ [session-boot] → header untuk fase ini
  ├─ [auto-pro-standards] → inject security/SEO/perf
  ├─ [skill-router] → route ke nextjs-best-practices, frontend-design
  ├─ Execute → create files
  ├─ Validate → npm run build, visual check
  └─ Gate → minta approval user
  ↓
FASE 2: Features
  ├─ [session-boot] → header untuk fase ini
  ├─ [auto-pro-standards] → inject standards
  ├─ [skill-router] → route ke react-best-practices, gsap-core
  ├─ Execute → implement features
  ├─ Validate → test interactions
  └─ Gate → minta approval user
  ↓
... (ulangi untuk fase 3-N)
  ↓
FASE N: Final Polish
  ├─ [self-review-gate] → comprehensive check
  └─ Final Report → deliver dengan evidence
```
