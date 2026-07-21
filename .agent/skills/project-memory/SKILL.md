---
name: project-memory
description: "Anti-amnesia: AI wajib baca PROJECT_MEMORY.md di awal sesi dan update di akhir fase. Menjaga kontinuitas lintas sesi, hari, dan device."
---

# Project Memory — Anti-Amnesia untuk AI

> **One-liner:** Setiap kali selesai kerja, AI WAJIB nulis catatan ke file memori. Setiap kali mulai kerja, AI WAJIB baca file memori dulu. Hasilnya: AI nggak pernah lupa konteks project walau beda hari, beda sesi, atau beda device.

## When to Use

- SETIAP kali menyelesaikan sebuah fase (dari `phased-delivery`).
- SETIAP kali memulai sesi baru di project yang sudah pernah dikerjakan.
- SETIAP kali user bilang "lanjutin", "terusin", atau "kemarin sampai mana".

## Why This Exists

AI itu amnesia. Setiap sesi baru, konteksnya kereset. Tanpa catatan tertulis, AI akan:
- Lupa arsitektur yang sudah disepakati
- Lupa keputusan desain yang sudah dibuat
- Bikin ulang hal yang sudah ada
- Pakai teknologi/nama yang beda dari sesi sebelumnya
- Minta user jelasin dari awal (menyebalkan)

Skill ini memaksa AI untuk menulis dan membaca "diary project" sehingga kontinuitas terjaga lintas sesi, lintas hari, bahkan lintas device.

## ALWAYS DO THIS

## NEVER DO THIS (Yang Dilarang / Anti-patterns to Avoid)

- ❌ **JANGAN menuliskan secret, password, atau credential mentah di berkas memori.** **Why fails:** Jika berkas memori dikomit ke Git, credential tersebut akan terekspos di riwayat Git secara permanen. **Instead:** Cukup catat nama variabel lingkungannya saja (misal: `API_KEY`) dan atur nilainya di berkas `.env`.
- ❌ **JANGAN mengabaikan berkas `PROJECT_MEMORY.md` di awal sesi koding baru.** **Why fails:** Menyebabkan AI mengalami amnesia dan lupa kemajuan, pilihan teknologi, atau batasan project saat ini, sehingga mengajukan pertanyaan berulang. **Instead:** Selalu baca berkas memori di awal sesi untuk mengembalikan pemahaman konteks.
- ❌ **JANGAN menulis ulang atau menimpa seluruh berkas memori dengan informasi usang.** **Why fails:** Menghapus riwayat keputusan desain penting dan catatan fase-fase yang sudah selesai. **Instead:** Perbarui tabel kemajuan dan daftar rincian progres secara bertahap (inkremental).
- ❌ **JANGAN membuat catatan progres yang terlalu umum (misalnya "selesai merapikan kode").** **Why fails:** Tidak memberikan informasi yang jelas bagi agen koding berikutnya untuk melanjutkan pekerjaan. **Instead:** Tulis secara spesifik berkas apa saja yang diubah beserta hasil pengujiannya.

### Saat MULAI Sesi Baru

Sebelum ngapa-ngapain, cek apakah ada file memori:

1. Cari `PROJECT_MEMORY.md` di root folder project.
2. Kalau ADA → Baca isinya, lalu beri ringkasan ke user:
```
📖 MEMORI PROJECT DITEMUKAN
─────────────────────────────────
📂 Project: [nama project]
🔧 Stack: [teknologi yang dipakai]
📍 Terakhir dikerjakan: [tanggal + fase terakhir]
✅ Sudah jadi: [daftar singkat]
❌ Belum jadi: [daftar singkat]
─────────────────────────────────
Mau lanjut dari sini, atau ada yang mau diubah dulu?
```
3. Kalau TIDAK ADA → Lanjut normal (ini project baru).

### Saat SELESAI Setiap Fase

Setelah menyelesaikan sebuah fase (atau di akhir sesi kalau user mau berhenti), UPDATE file `PROJECT_MEMORY.md` dengan format:

```markdown
# Project Memory — [Nama Project]

> File ini ditulis otomatis oleh AI. JANGAN dihapus.
> Fungsinya: biar AI bisa ingat konteks project ini di sesi berikutnya.
> Terakhir diupdate: [tanggal dan waktu]

## Ringkasan Project
- **Apa ini:** [deskripsi 1-2 kalimat]
- **Dibuat untuk:** [target user]
- **Style/nuansa:** [deskripsi visual]

## Teknologi yang Dipakai
- Frontend: [nama + versi]
- Backend: [nama + versi]  
- Database: [nama]
- Hosting: [nama, kalau sudah ditentukan]
- Package manager: [npm/yarn/pnpm/bun]

## Struktur Folder
```
[tree sederhana dari folder utama, maks 15 baris]
```

## Keputusan Desain yang Sudah Disepakati
- [keputusan 1: alasannya]
- [keputusan 2: alasannya]
- [keputusan 3: alasannya]

## Progress Fase
| Fase | Status | Catatan |
|------|--------|---------|
| 1. Fondasi | ✅ Selesai | Layout, navigasi, responsive |
| 2. Katalog | ✅ Selesai | List produk, filter, detail |
| 3. Checkout | 🔄 Sedang | Form checkout sudah, payment belum |
| 4. Backend | ⏳ Belum | — |
| 5. Polish | ⏳ Belum | — |

## Yang Sudah Jadi (Detail)
- [fitur 1]: [status, file utama]
- [fitur 2]: [status, file utama]

## Yang Belum Jadi / Known Issues
- [ ] [fitur/bug yang belum selesai]
- [ ] [fitur/bug yang belum selesai]

## Environment & Credential
- Port dev server: [port]
- Database URL: [di .env, variabel apa]
- API keys yang dibutuhkan: [nama variabel, BUKAN nilainya]

## Catatan untuk Sesi Berikutnya
- [hal penting yang harus diingat]
- [warning atau gotcha]
```

### Aturan Penting

1. **JANGAN tulis credential/API key/password di file ini.** Cukup tulis nama variabel environment-nya.
2. **UPDATE, jangan timpa.** Setiap fase baru, tambahkan ke tabel progress, jangan hapus catatan fase sebelumnya.
3. **File ini HARUS di-commit ke Git** supaya kalau pindah device, memorinya ikut.
4. **Satu file per project.** Kalau di dalam repo ada sub-project, masing-masing punya `PROJECT_MEMORY.md` sendiri di root foldernya.

## Validation Steps — Memory Integrity Check

Setelah update PROJECT_MEMORY.md, agent WAJIB validate:

### Check 1: File Exists and Readable
```bash
# Verify file exists
test -f PROJECT_MEMORY.md && echo "MEMORY_FILE_EXISTS" || echo "MEMORY_FILE_MISSING"

# Expected: MEMORY_FILE_EXISTS
```

### Check 2: No Secrets Leaked
```bash
# Scan for hardcoded secrets in memory file
grep -E "(api[_-]?key|password|secret|token|bearer).*[:=].*['\"][a-zA-Z0-9]{20,}" PROJECT_MEMORY.md

# Expected: exit 1 (no matches = safe)
# If exit 0: CRITICAL ERROR, secrets in memory file, remove immediately
```

### Check 3: Structure Completeness
```bash
# Check required sections exist
grep -c "## Ringkasan Project" PROJECT_MEMORY.md
grep -c "## Teknologi yang Dipakai" PROJECT_MEMORY.md
grep -c "## Progress Fase" PROJECT_MEMORY.md

# Expected: 1 for each (sections present)
```

### Check 4: Git Tracking
```bash
# Verify file is tracked by Git
git ls-files PROJECT_MEMORY.md

# Expected: PROJECT_MEMORY.md (file is tracked)
# If empty: run `git add PROJECT_MEMORY.md`
```

## Code Examples — Memory Patterns

### Pattern: Session Start with Memory

**Scenario:** User returns after 2 days, says "lanjut"

**Agent workflow:**
```bash
# 1. Check for memory file
$ test -f PROJECT_MEMORY.md && cat PROJECT_MEMORY.md

# 2. Parse key info
PROJECT_NAME="E-commerce Toko Sepatu"
TECH_STACK="Next.js 14, Supabase, TailwindCSS"
LAST_PHASE="Fase 3: Checkout (70% done)"
PENDING="Payment gateway integration, order confirmation email"

# 3. Present to user
```

**Output to user:**
```
📖 MEMORI PROJECT DITEMUKAN
─────────────────────────────────
📂 Project: E-commerce Toko Sepatu
🔧 Stack: Next.js 14, Supabase, TailwindCSS
📍 Terakhir dikerjakan: 2026-06-26, Fase 3 (Checkout - 70%)
✅ Sudah jadi: Layout, Katalog produk + filter, Keranjang belanja
❌ Belum jadi: Payment gateway integration, email konfirmasi order
─────────────────────────────────
Mau lanjut ke payment gateway integration?
```

### Pattern: Phase Completion Update

**After completing Fase 3:**
```bash
# Read current memory
CURRENT_MEMORY=$(cat PROJECT_MEMORY.md)

# Update progress table
# BEFORE:
| 3. Checkout | 🔄 Sedang | Form checkout sudah, payment belum |

# AFTER:
| 3. Checkout | ✅ Selesai | Form + validation + Midtrans integration done |
| 4. Backend | 🔄 Sedang | Starting database schema design |

# Write back to file
```

### Pattern: Decision Documentation

**When making architectural decision:**
```markdown
## Keputusan Desain yang Sudah Disepakati

- **State management:** Zustand, bukan Redux
  - Alasan: project kecil-menengah, Redux overkill, Zustand lebih simple
  - File: src/store/cartStore.ts
  
- **Auth provider:** NextAuth.js with Google OAuth
  - Alasan: user prefer social login vs email/password
  - Credential stored: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  
- **Image storage:** Supabase Storage
  - Alasan: terintegrasi dengan database, CDN built-in
  - Bucket name: product-images (public)
```

## Failure Modes — Why Memory Matters

### Failure: No Memory File
**Scenario:** User says "lanjut" 3 days later. Agent has no memory file.
**Result:** 
- Agent asks "lanjut apa?" (user frustrated: "kan kemarin udah bikin!")
- Agent guesses wrong stack (was Next.js, agent uses Vite)
- Agent recreates components that already exist
- 1 hour wasted re-explaining context
**Prevention:** ALWAYS write PROJECT_MEMORY.md after each phase.

### Failure: Outdated Memory
**Scenario:** Agent writes memory once at start, never updates.
**Result:**
- Memory says "Fase 1 done", but actually at Fase 4
- User returns, agent thinks still at Fase 1
- Agent suggests redoing work that's done
**Prevention:** UPDATE memory after EVERY phase completion.

### Failure: Secrets in Memory
**Scenario:** Agent writes `STRIPE_KEY=sk_live_abc123` in memory file.
**Result:**
- Memory file committed to Git
- Secret pushed to GitHub public repo
- Stripe key compromised within hours
**Prevention:** ALWAYS scan memory for secrets before writing.

### Failure: Inconsistent Stack Choice
**Scenario:** Session 1 uses Supabase. Memory not updated. Session 2 agent suggests Firebase.
**Result:**
- User confused: "Tapi kemarin pake Supabase kan?"
- Wasted time discussing why changed
- Potential refactor if user already set up Supabase
**Prevention:** Document tech stack decisions in memory with reasons.

## Evidence Gates — Proof of Memory Integrity

Agent CANNOT claim "memory updated" until:

1. **File Written Successfully**
   ```bash
   $ test -f PROJECT_MEMORY.md && wc -l PROJECT_MEMORY.md
   124 PROJECT_MEMORY.md  # File exists with content
   ```

2. **No Secrets Present**
   ```bash
   $ grep -E "secret.*=.*sk_" PROJECT_MEMORY.md
   $ echo $?
   1  # Exit 1 = no secrets found = PASS
   ```

3. **All Sections Present**
   - ✅ Ringkasan Project
   - ✅ Teknologi yang Dipakai
   - ✅ Progress Fase (table format)
   - ✅ Yang Sudah Jadi
   - ✅ Yang Belum Jadi
   - ✅ Keputusan Desain

4. **Git Tracked**
   ```bash
   $ git ls-files PROJECT_MEMORY.md
   PROJECT_MEMORY.md  # File is tracked
   ```

**Format laporan:**
```
📝 PROJECT MEMORY UPDATED
─────────────────────────────────
✅ File written: PROJECT_MEMORY.md (128 lines)
✅ Secret scan: passed (no credentials found)
✅ Structure: 6/6 required sections present
✅ Git tracking: file tracked (ready for commit)
✅ Last phase: Fase 3 marked as ✅ Selesai
✅ Next phase: Fase 4 marked as 🔄 Sedang
─────────────────────────────────
```

## Sub-Agent Propagation

## Sub-Agent Memory Access

When dispatching sub-agent:

```
"Read PROJECT_MEMORY.md first to understand project context.
Key info you need:
- Tech stack: [from memory]
- Design decisions: [from memory]
- Current phase: [from memory]

DO NOT deviate from documented tech choices.
DO NOT ask user to re-explain what's in memory.
AFTER your work, UPDATE the memory file with your changes."
```

## Advanced Patterns

### Pattern: Multi-Project Memory

For monorepo with multiple projects:

```
repo-root/
├── PROJECT_MEMORY.md              # Root-level project overview
├── apps/
│   ├── web/
│   │   └── PROJECT_MEMORY.md      # Web app specific memory
│   └── api/
│       └── PROJECT_MEMORY.md      # API specific memory
└── packages/
    └── ui/
        └── PROJECT_MEMORY.md      # UI library specific memory
```

Agent determines which memory to read based on `pwd` (working directory).

### Pattern: Decision Changelog

Track WHY decisions changed:

```markdown
## Keputusan Desain yang Sudah Disepakati

- **Database:** ~~MongoDB~~ → PostgreSQL (changed 2026-06-26)
  - Alasan awal: flexible schema
  - Alasan ganti: perlu relational joins, Supabase support
  - Migration: ran migration script, data preserved
```

### Pattern: Known Issues Tracking

```markdown
## Yang Belum Jadi / Known Issues

- [ ] Payment gateway: Midtrans sandbox works, need production key for go-live
- [ ] Email: using console.log now, need Resend API key setup
- [ ] Mobile nav: hamburger menu works but close animation janky (low priority)
- [x] ~~Product images: broken links~~ (fixed 2026-06-25, using Supabase CDN)
```

## Integration dengan Governance

```
Session Start
  ↓
Check if PROJECT_MEMORY.md exists
  ↓
  YES → Read + parse + present summary to user
  NO → Continue normal (new project)
  ↓
User approves direction
  ↓
Work on phase...
  ↓
Phase completed
  ↓
[self-review-gate] → quality checks pass
  ↓
[project-memory] → UPDATE memory file:
  - Mark current phase as ✅
  - Update "Yang Sudah Jadi"
  - Document any decisions made
  - Add known issues if any
  - Update timestamp
  ↓
Validate memory integrity (secret scan, structure check)
  ↓
  PASS → Continue
  FAIL → Fix issues → Re-validate
  ↓
Present phase results to user (phased-delivery format)
  ↓
Wait for approval for next phase
```

## Memory File Template (Complete)

```markdown
# Project Memory — [Nama Project]

> File ini ditulis otomatis oleh AI. JANGAN dihapus.
> Fungsinya: biar AI bisa ingat konteks project ini di sesi berikutnya.
> Terakhir diupdate: 2026-06-28 15:45:30

## Ringkasan Project
- **Apa ini:** E-commerce toko sepatu premium untuk anak muda
- **Dibuat untuk:** Gen Z, mobile-first users
- **Style/nuansa:** Minimalis premium, inspired by Nike.com

## Teknologi yang Dipakai
- Frontend: Next.js 14.2.3 (App Router)
- Backend: Next.js API Routes + Supabase Edge Functions
- Database: Supabase PostgreSQL (hosted)
- UI Library: TailwindCSS 3.4.1 + shadcn/ui
- State: Zustand 4.5.2
- Auth: NextAuth.js 4.24.5 with Google OAuth
- Payment: Midtrans Snap (sandbox for now)
- Hosting: Vercel (production), localhost:3000 (dev)
- Package manager: npm

## Struktur Folder
```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── products/
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── cart/
│   └── checkout/
├── components/
│   ├── ui/           # shadcn components
│   ├── ProductCard.tsx
│   ├── Navigation.tsx
│   └── Layout.tsx
├── lib/
│   ├── supabase.ts
│   └── midtrans.ts
├── store/
│   └── cartStore.ts
└── PROJECT_MEMORY.md (this file)
```

## Keputusan Desain yang Sudah Disepakati

- **State management:** Zustand, bukan Redux
  - Alasan: project kecil-menengah, Redux overkill
  - File: store/cartStore.ts
  
- **Auth provider:** NextAuth.js with Google OAuth only (no email/password)
  - Alasan: user prefer social login, less friction
  - Env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
  
- **Image storage:** Supabase Storage bucket "product-images" (public)
  - Alasan: terintegrasi dengan database, CDN built-in, free tier cukup
  
- **Payment flow:** Redirect to Midtrans Snap (bukan embedded)
  - Alasan: lebih secure, PCI compliance handled by Midtrans
  - Env vars: MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY

## Progress Fase

| Fase | Status | Catatan |
|------|--------|---------|
| 1. Fondasi | ✅ Selesai | Layout, navigation, responsive shell (2026-06-25) |
| 2. Katalog | ✅ Selesai | Product list, filters, detail page (2026-06-26) |
| 3. Checkout | ✅ Selesai | Cart + form + Midtrans integration (2026-06-27) |
| 4. Backend | 🔄 Sedang | Starting database schema + API routes |
| 5. Polish | ⏳ Belum | SEO, animations, dark mode |
| 6. Testing | ⏳ Belum | E2E tests, cross-browser |

## Yang Sudah Jadi (Detail)

- **Layout & Navigation (Fase 1)**
  - Responsive header with hamburger menu on mobile
  - Footer with links
  - Files: components/Layout.tsx, components/Navigation.tsx
  
- **Product Catalog (Fase 2)**
  - Grid layout with filters (brand, size, price)
  - Product card component with image + price + CTA
  - Detail page with image gallery + add to cart
  - Files: app/products/page.tsx, app/products/[id]/page.tsx, components/ProductCard.tsx
  
- **Cart & Checkout (Fase 3)**
  - Cart state management with Zustand
  - Cart page with quantity adjustment + remove item
  - Checkout form with validation (zod schema)
  - Midtrans Snap integration (sandbox mode)
  - Files: store/cartStore.ts, app/cart/page.tsx, app/checkout/page.tsx, lib/midtrans.ts

## Yang Belum Jadi / Known Issues

- [ ] Database schema: products, orders, order_items tables need to be created in Supabase
- [ ] Auth: Google OAuth works locally, need production credentials for Vercel
- [ ] Payment: Midtrans sandbox works, need production server key for go-live
- [ ] Email: order confirmation email not implemented (need Resend API)
- [ ] Mobile nav: close animation on hamburger menu is janky (low priority)
- [ ] SEO: meta tags only on homepage, other pages need unique descriptions
- [ ] Dark mode: not implemented yet (Fase 5)

## Environment & Credential

**Port dev server:** 3000 (npm run dev)

**Required env vars (.env.local):**
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `NEXTAUTH_SECRET` — NextAuth.js secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` — http://localhost:3000 (dev), https://example.com (prod)
- `MIDTRANS_SERVER_KEY` — Midtrans server key (sandbox for now)
- `MIDTRANS_CLIENT_KEY` — Midtrans client key (sandbox for now)

**Supabase details:**
- Project ID: xyzabc123
- Database: PostgreSQL 15
- Storage bucket: product-images (public, 50MB limit)

## Catatan untuk Sesi Berikutnya

- **Next priority:** Create database schema (products, orders, order_items tables) in Supabase
- **Important:** Midtrans callback URL must be configured in Midtrans dashboard before production
- **Warning:** Google OAuth redirect URI must match exactly (including trailing slash) or auth will fail
- **Performance note:** Product images are large (~800KB each), need optimization script before launch
- **Accessibility note:** Focus indicators on cart buttons are barely visible, need higher contrast
```

## Quality Checklist (Memory Gate)

Before claiming "memory updated":

- [ ] File PROJECT_MEMORY.md exists and is readable
- [ ] No secrets/credentials/API keys in file (grep scan passed)
- [ ] All 6 required sections present (Ringkasan, Teknologi, Progress, etc.)
- [ ] Progress table updated with current phase status
- [ ] "Yang Sudah Jadi" section reflects latest completions
- [ ] "Yang Belum Jadi" section updated with new known issues
- [ ] Timestamp updated to current date/time
- [ ] File is Git tracked (not in .gitignore)
- [ ] File size reasonable (<200 lines, stay concise)
- [ ] Tech stack decisions documented with reasons (not arbitrary)

**Jika ada yang TIDAK, PERBAIKI sebelum proceed.**
