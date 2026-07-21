---
name: prompt-amplifier
description: "Jangan langsung ngoding. Tanya dulu (maks 5 pertanyaan), jelaskan rencana, minta persetujuan, baru eksekusi. Ubah permintaan sederhana jadi brief profesional."
---

# Prompt Amplifier — Ubah Permintaan Sederhana Jadi Brief Profesional

> **One-liner:** Jangan langsung ngoding. Tanya dulu, jelaskan, minta persetujuan, baru eksekusi dengan prompt internal yang 10x lebih detail dari permintaan asli user.

## When to Use

- SETIAP kali user meminta pembuatan project baru, fitur baru, atau perubahan besar.
- SETIAP kali permintaan user kurang dari 3 kalimat atau ambigu.
- TIDAK berlaku untuk: fix bug kecil, pertanyaan pengetahuan, atau percakapan biasa.

## Why This Exists

User (terutama pemula) sering memberikan permintaan pendek seperti "bikin web toko online" — tapi di kepala mereka ada gambaran yang jauh lebih spesifik yang belum terucap. Tanpa elicitation (penggalian), agent akan menebak dan hasilnya sering meleset dari ekspektasi. Skill ini memaksa agent untuk menggali dulu, menjelaskan rencana, dan mendapat persetujuan sebelum menulis satu baris kode pun.

## ALWAYS DO THIS

### Fase 1: GALI (Tanya Maksimal 5 Pertanyaan Kunci)

Ketika user memberi permintaan, JANGAN langsung ngoding. Tanyakan pertanyaan yang paling berdampak pada arsitektur dan hasil akhir. Format:

```
🎯 PROMPT AMPLIFIER — Saya mau pastiin hasilnya sesuai ekspektasi kamu.

Sebelum saya mulai, boleh saya tanya beberapa hal penting:

1. 🎨 **Tampilan & Nuansa**
   Mau stylenya gimana? (contoh: minimalis clean, colorful playful, dark & premium, mirip situs X?)

2. 👥 **Target Pengguna**
   Siapa yang bakal pake ini? (contoh: pelanggan umum, admin internal, anak muda, profesional?)

3. 🛠️ **Fitur Utama**
   Sebutin 3-5 fitur paling penting yang HARUS ada. (contoh: login, keranjang belanja, dashboard admin)

4. 📱 **Platform**
   Utamanya diakses dari mana? (HP, laptop, atau dua-duanya?)

5. 🔗 **Integrasi**
   Ada service lain yang harus disambungin? (contoh: payment gateway, WhatsApp, Google Maps?)
```

**Aturan bertanya:**
- Gunakan bahasa yang SAMA dengan user (kalau user pakai bahasa Indonesia casual, ikuti).
- Berikan CONTOH di setiap pertanyaan biar user nggak bingung.
- Maksimal 5 pertanyaan. Jangan bikin user capek.
- Kalau user bilang "terserah" atau "yang bagus aja", agent WAJIB memilihkan opsi terbaik dan menyebutkan pilihannya.
- Kalau user bilang "langsung aja", skip ke Fase 2 dengan asumsi terbaik dan SEBUTKAN asumsinya.

### Fase 2: JELASKAN (Presentasikan Rencana)

Setelah dapat jawaban (atau asumsi), susun rencana dalam format yang mudah dipahami pemula:

```
📋 RENCANA PROJECT

🏗️ **Apa yang akan saya buat:**
   [Jelaskan dalam 2-3 kalimat sederhana, tanpa jargon]

🧱 **Teknologi yang dipakai:**
   - Frontend: [nama] — [penjelasan 1 kalimat kenapa]
   - Backend: [nama] — [penjelasan 1 kalimat kenapa]  
   - Database: [nama] — [penjelasan 1 kalimat kenapa]

📄 **Halaman / Fitur yang akan dibuat:**
   1. [Nama halaman] — [fungsinya apa]
   2. [Nama halaman] — [fungsinya apa]
   3. ...

🔒 **Keamanan yang otomatis diterapkan:**
   - [Sebutkan 3-4 poin utama dalam bahasa sederhana]

🔍 **SEO yang otomatis diterapkan:**
   - [Sebutkan 3-4 poin utama dalam bahasa sederhana]

⏱️ **Estimasi kompleksitas:** [Ringan / Sedang / Berat]

⚠️ **Yang TIDAK termasuk (biar ekspektasinya jelas):**
   - [Sebutkan hal yang mungkin user kira termasuk tapi sebenarnya tidak]
```

**Aturan menjelaskan:**
- JANGAN pakai istilah teknis tanpa penjelasan.
- Kalau harus menyebut istilah teknis, SELALU kasih penjelasan di sebelahnya.
  - ❌ "Saya akan pakai SSR dengan ISR dan edge middleware"
  - ✅ "Saya akan bikin halaman yang langsung muncul isinya saat dibuka (bukan loading putih dulu), supaya Google bisa baca dan pengunjung nggak kabur"
- Sebutkan apa yang TIDAK termasuk, supaya user nggak kecewa di akhir.

### Fase 3: MINTA PERSETUJUAN

Setelah menjelaskan rencana, WAJIB tanya:

```
Gimana, rencana di atas sudah sesuai sama yang kamu bayangin?
- Kalau oke, bilang "gas" atau "lanjut" dan saya langsung kerjain.
- Kalau ada yang mau diubah, sebutin aja bagian mana.
```

**JANGAN mulai ngoding sebelum user bilang setuju.** Ini non-negotiable.

### Fase 4: EKSEKUSI dengan Internal Prompt yang Diperkaya

Setelah user setuju, agent secara INTERNAL (di dalam pikiran, tidak perlu ditampilkan ke user) menyusun prompt yang diperkaya. Prompt internal ini menggabungkan:
1. Permintaan asli user
2. Jawaban dari pertanyaan Fase 1
3. Standar dari `auto-pro-standards` (keamanan, SEO, performa, aksesibilitas)
4. Skill teknis yang relevan dari `.agent/skills/`
5. Constraint dan anti-pattern dari skill yang dibaca

Lalu eksekusi dengan kualitas maksimal, mengikuti `session-boot` header format.

## NEVER DO THIS

- JANGAN langsung ngoding begitu user minta sesuatu yang besar/ambigu.
- JANGAN tanya lebih dari 5 pertanyaan (user bukan di interview kerja).
- JANGAN pakai jargon teknis saat menjelaskan ke user pemula.
- JANGAN mulai eksekusi tanpa persetujuan eksplisit.
- JANGAN abaikan jawaban user dan tetap pakai asumsi sendiri.
- JANGAN jelaskan internal prompt ke user (itu dapur AI, bukan urusan user).
- JANGAN skip Fase 2 (jelaskan rencana). User BERHAK tahu apa yang akan dikerjakan.

## Contoh Alur Lengkap

**User:** "bikin web jualan sepatu"

**Agent (Fase 1):**
> 🎯 Sebelum saya mulai, boleh saya tanya beberapa hal:
> 1. Mau stylenya gimana? Minimalis kayak Nike.com, atau colorful kayak marketplace?
> 2. Siapa yang beli? Anak muda, orang dewasa, atau semua umur?
> 3. Fitur paling penting apa aja? Misal: katalog produk, keranjang, checkout, login member?
> 4. Utamanya dibuka dari HP atau laptop?
> 5. Mau terima pembayaran online? (Midtrans, GoPay, transfer manual?)

**User:** "yang premium kayak nike, buat anak muda, harus bisa checkout, kebanyakan dari hp, pake midtrans"

**Agent (Fase 2):**
> 📋 RENCANA PROJECT
> 🏗️ Saya akan bikin web toko sepatu bergaya premium...
> [rencana lengkap]
> Gimana, udah sesuai? Bilang "gas" kalau oke.

**User:** "gas"

**Agent (Fase 4):**
> 🔥 I AM CRAZY
> 🧠 Skill aktif: prompt-amplifier, auto-pro-standards, nextjs-best-practices, frontend-design...
> [mulai ngoding]

## Validation Steps — Proof of Amplification

Setelah Fase 2 (jelaskan rencana), agent WAJIB membuktikan bahwa prompt sudah di-amplify:

**Check 1: Token Count Ratio**
```bash
# Original user request: ~50 tokens
# Internal amplified prompt: ~500+ tokens
# Ratio: 10x minimum
```

**Check 2: Completeness Score**
- [ ] Target audience defined
- [ ] Style/design direction defined
- [ ] Core features listed (3-5 items)
- [ ] Platform/device preference defined
- [ ] Integration requirements captured
- [ ] Tech stack justified (not arbitrary)
- [ ] Security standards referenced
- [ ] SEO standards referenced
- [ ] Out-of-scope items stated

**Passing score: 7/9 minimum**

## Code Examples — Pattern Extraction

### Pattern: E-commerce Request
**Original:** "bikin web toko online"

**Amplified (internal):**
```
Build Next.js 14 e-commerce site with:
- Target: millennials, mobile-first (375px baseline)
- Style: premium minimalist (Nike.com inspired)
- Core features: product catalog with filters, cart, Midtrans checkout, order tracking
- Auth: NextAuth.js with email/Google OAuth
- Database: Supabase PostgreSQL with Drizzle ORM
- Security: OWASP input validation, rate limiting, CSRF protection
- SEO: dynamic meta tags per product, sitemap.xml, schema.org Product markup
- Performance: Next.js Image optimization, code splitting, edge caching
- Accessibility: WCAG 2.2 AA keyboard navigation, ARIA labels
- Excluded: inventory management (phase 2), multi-vendor (not requested)
```

### Pattern: Landing Page Request
**Original:** "buatin landing page untuk SaaS saya"

**Amplified (internal):**
```
Build conversion-optimized SaaS landing page with:
- Target: B2B decision makers (desktop primary, mobile responsive)
- Style: professional trust-building (light mode, blue accent)
- Core sections: hero with CTA, features (3 columns), social proof, pricing, FAQ, footer
- Tech: Astro + React islands (optimal Lighthouse score)
- Forms: Waitlist capture → Supabase → Resend email notification
- Security: rate limiting on form submission, honeypot spam protection
- SEO: schema.org SoftwareApplication, Open Graph tags, meta description
- Performance: < 1s First Contentful Paint, lazy load below-fold images
- Accessibility: skip nav link, form labels, focus indicators
- Excluded: blog (use separate subdomain), dashboard (separate app)
```

## Failure Modes — Why Amplification Matters

### Failure: Skip Amplification
**Scenario:** User says "bikin API". Agent langsung bikin REST API tanpa tanya.
**Result:** User ternyata butuh WebSocket real-time, harus refactor total.
**Prevention:** Tanya "data perlu real-time atau request-response biasa?" di Fase 1.

### Failure: Over-Engineering
**Scenario:** User minta "form kontak". Agent bikin dengan microservices, Kafka, Redis.
**Result:** 3 hari kerja untuk fitur 30 menit. User frustrasi.
**Prevention:** Estimasi kompleksitas di Fase 2, pilih solusi paling simple yang satisfy requirements.

### Failure: Jargon Overload
**Scenario:** Agent jelaskan "pakai SSR dengan ISR, edge middleware, dan RSC architecture".
**Result:** User pemula bingung, kehilangan kepercayaan.
**Prevention:** Translate ke bahasa user: "halaman langsung muncul isinya, nggak perlu loading".

### Failure: Assumption Mismatch
**Scenario:** User bilang "toko online". Agent asumsi B2C. User ternyata butuh B2B wholesale.
**Result:** Pricing model salah, checkout flow salah, harus refactor 70%.
**Prevention:** Tanya "siapa yang beli? pelanggan umum atau bisnis/reseller?" di Fase 1.

## Evidence Gates — Proof Before Execution

Agent TIDAK BOLEH mulai coding sampai semua ini terpenuhi:

1. **User Approval Documented**
   - Literal quote dari user: "gas", "lanjut", "oke", "approved"
   - Timestamp approval
   - Snapshot dari jawaban Fase 1

2. **Internal Brief Exists**
   - File: `.agent/temp/amplified-brief-[timestamp].md`
   - Contains: original request + answers + tech decisions + constraints
   - Minimum 500 tokens (10x original)

3. **Skill Routing Done**
   - List of skills to be applied (from skill-router.json)
   - Validation commands identified
   - Anti-patterns loaded

**Format laporan sebelum mulai coding:**
```
📋 AMPLIFICATION PROOF
─────────────────────────────────
✅ User approval: "gas" (received 2026-06-28 10:23:45)
✅ Brief created: .agent/temp/amplified-brief-20260628-102345.md
✅ Token ratio: 50 → 650 (13x amplification)
✅ Completeness: 9/9 checklist items
✅ Skills routed: nextjs-best-practices, frontend-design, auto-pro-standards, vercel-deployment
✅ Validation plan: npm run build + npm run lint + manual responsive check
─────────────────────────────────
```

## Sub-Agent Propagation

Jika men-dispatch sub-agent untuk bagian dari project yang sudah di-approve:

```
"This task is part of an approved project. Read the amplified brief at 
.agent/temp/amplified-brief-[timestamp].md for full context.

DO NOT re-run Fase 1-3 (prompt-amplifier). The requirements are already locked.

APPLY these skills: [list skills from routing]
VALIDATE with: [list validation commands]
AVOID these anti-patterns: [list from skills]"
```

Sub-agent WAJIB:
1. Baca amplified brief (jangan tanya ulang ke user)
2. Follow tech stack yang sudah dipilih (jangan ganti arbitrary)
3. Apply skills yang sudah di-route
4. Report back dengan I AM CRAZY header

## Quality Checklist (Self-Review Gate)

Sebelum deliver hasil Fase 4 (eksekusi), agent harus dapat menjawab YA untuk semua:

- [ ] Apakah saya sudah tanya maksimal 5 pertanyaan di Fase 1? (ATAU user bilang "langsung aja")
- [ ] Apakah saya sudah jelaskan rencana dalam bahasa yang user pahami?
- [ ] Apakah saya dapat literal approval dari user? ("gas", "lanjut", "oke")
- [ ] Apakah internal brief saya 10x lebih detail dari request asli?
- [ ] Apakah semua jawaban user saya incorporate ke dalam brief?
- [ ] Apakah saya sudah sebutkan apa yang TIDAK termasuk (out of scope)?
- [ ] Apakah tech stack saya pilih sesuai dengan jawaban Fase 1, bukan arbitrary?
- [ ] Apakah saya sudah route ke skill yang tepat berdasarkan brief?
- [ ] Apakah amplified brief tersimpan di .agent/temp untuk sub-agent?
- [ ] Apakah saya mulai eksekusi dengan I AM CRAZY header?

**Jika ada yang TIDAK, STOP. Kembali ke fase yang terlewat.**
