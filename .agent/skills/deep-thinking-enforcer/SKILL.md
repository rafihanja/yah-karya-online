---
name: deep-thinking-enforcer
description: Wajib digunakan untuk memaksa agent berpikir mendalam, perlahan, dan detail sebelum bertindak. Mencegah eksekusi prematur dan asumsi dangkal.
---

# Deep Thinking Enforcer

Skill ini **AKTIF SECARA PERMANEN UNTUK SEMUA TASK**. Tidak peduli seberapa sederhana permintaan user, agent WAJIB menggunakan skill ini secara default tanpa harus diminta. Seluruh tindakan harus melalui filter berpikir mendalam ini.

## When to Use

- Saat task bersifat substantif: coding, review, audit, desain UI, security, deployment, debugging, atau perubahan konfigurasi.
- Saat request terlihat kecil tetapi bisa menyentuh perilaku lintas-file, misalnya CSS global, timeline GSAP, router skill, atau script build.
- Saat agent perlu memilih skill, membaca file, membuat rencana, atau menjalankan validasi sebelum memberi jawaban final.
- Saat user meminta kualitas lebih tinggi, analisis lebih dalam, atau ingin menghindari jawaban generik.

## ALWAYS DO THIS

- Mulai dari bukti lokal: sebut file, command, atau konfigurasi yang benar-benar diperiksa sebelum menyimpulkan.
- Enumerasi minimal 3 risiko konkret yang relevan dengan repo, bukan risiko generik seperti "bisa error".
- Turunkan risiko menjadi mitigasi dan validation command yang bisa diulang, misalnya `node .agent/scripts/agent-doctor.mjs` atau test project terkait.
- Jika governance repo mewajibkan header lain seperti `I AM CRAZY`, letakkan header governance lebih dulu lalu lanjutkan blok deep-thinking di bawahnya.

## ⛔ MANDATORY PROTOCOL

Saat skill ini aktif, Anda WAJIB mengubah mode operasi menjadi **Sistem 2 (Slow Thinking)**:

### 1. Stop & Analyze (Jangan Langsung Koding)
- Dilarang keras langsung memproduksi kode atau file final.
- Baca semua file terkait dan dokumentasi arsitektur.
- Petakan dependensi: jika saya mengubah A, apa dampaknya ke B, C, dan D?

### 2. Edge Case Enumeration
- Buat daftar minimal 3 *edge cases* atau potensi kegagalan dari pendekatan yang Anda pikirkan.
- Bagaimana jika data kosong? Bagaimana jika user melakukan spam klik? Bagaimana jika network lambat?

### 3. Detail-Oriented Planning
- Rencanakan setiap perubahan secara granular.
- Jangan gunakan istilah ambigu seperti "memperbaiki fungsi". Tuliskan secara eksak: "mengubah return type fungsi X dari Array ke Object untuk mencegah time complexity O(N^2)".

### 4. Master Flow Alignment
- Pastikan rencana Anda sejalan dengan `.agent/MASTER_FLOW.md`.
- Verifikasi fase mana yang sedang Anda kerjakan dan skill apa yang wajib diaktifkan pada fase tersebut.

## Why This Exists

Tanpa paksaan eksplisit, agent cenderung **respon cepat = respon dangkal**. Pola yang muncul tanpa skill ini:
- Klaim "sudah dicek" padahal cuma baca 1 file dari 5 yang relevan.
- Lompat ke implementasi tanpa enumerate edge case → bug muncul di production.
- Estimasi optimis ("gampang, 5 menit") tanpa hitung dependency.
- Salah pilih trade-off karena gak banding lebih dari 1 opsi.

Skill ini bikin "thinking visible" — kalau outputnya kurang dari 4 bagian, langsung ketahuan agent skip protokol.

## OUTPUT FORMAT

Jika Anda menggunakan skill ini, respons Anda WAJIB diawali dengan:

```markdown
🧠 **DEEP THINKING MODE ENGAGED**
1. **Analisis Akar Masalah:** [Penjelasan mendalam]
2. **Potensi Kegagalan (Edge Cases):** [Daftar 3 hal yang bisa salah]
3. **Strategi Mitigasi:** [Bagaimana mencegah kegagalan di atas]
4. **Rencana Eksekusi Granular:** [Langkah demi langkah yang sangat detail]
```

Dilarang melewati format ini jika skill ini dipanggil.

## NEVER DO THIS

- ❌ **Jangan tulis "Saya akan berpikir mendalam"** tanpa benar-benar enumerasi edge case. Itu performative thinking.
- ❌ **Jangan kasih edge case generik** ("network bisa lambat") tanpa kaitkan ke kasus konkret di repo ini.
- ❌ **Jangan loncat ke implementation plan** sebelum bagian 1-3 selesai. Urutan wajib: root cause → failures → mitigation → plan.
- ❌ **Jangan singkat protokol** untuk task "kecil" — yang kelihatan kecil sering punya dampak besar (mis. ubah CSS variable bisa break 10 komponen).
- ❌ **Jangan duplikasi konten** antar 4 bagian. Tiap bagian harus tambah informasi baru, bukan rephrasing.

## When to SKIP This Skill (Exempt Tasks)

Skill ini "always-on" untuk task substantif, tapi 3 kategori eksplisit **EXEMPT**:

1. **Pertanyaan klarifikasi murni** — "Maksudnya yang mana?" / "Path-nya di mana?" tidak butuh deep thinking.
2. **Reply percakapan trivial** — "OK", "siap", "lanjut", "thanks".
3. **One-line lookup** — "Tunjukin isi file X" tanpa modifikasi atau analisis.

Kalau ragu antara substantif vs trivial → default ke substantif, pakai skill ini.

## Example

### ✅ Good — Real depth, repo-specific

User: *"Refactor parallax-sawah/main.js biar gak laggy di mobile"*

```
🧠 DEEP THINKING MODE ENGAGED

1. Analisis Akar Masalah:
   Lag di mobile biasanya bukan satu sebab. Dari git history (commit fd9e85e9 "stabilize
   scaling calculations to prevent url bar scroll jitter") project ini punya history masalah
   scaling vs scroll di mobile. Akar potensial: (a) GSAP timeline yang animate properti
   layout (top/left), bukan transform; (b) ScrollTrigger tanpa scrub atau dengan refresh
   yang dipanggil saat resize/orientationchange; (c) gambar background tidak punya
   `will-change` / GPU layer; (d) reflow karena ubah `height` dari JS pas URL bar muncul.

2. Potensi Kegagalan (Edge Cases):
   - URL bar iOS muncul-hilang → viewport height berubah → ScrollTrigger.refresh() loop.
   - Landscape rotation → asset 16:9 stretch → invalidate semua trigger position.
   - Low-end Android (60fps susah) → GSAP autoSleep belum aktif → CPU pegang RAF.

3. Strategi Mitigasi:
   - Ganti animasi `top/left` ke `transform: translate3d()` (skill: gsap-core line "NEVER
     animate top/left").
   - Pasang `ScrollTrigger.config({ ignoreMobileResize: true })` untuk URL bar.
   - Tambah `will-change: transform` di asset hot path; hapus setelah animasi selesai.

4. Rencana Eksekusi Granular:
   Step 1: baca parallax-sawah/main.js → cari semua `gsap.to(..., { top: ..., left: ... })`.
   Step 2: convert ke `xPercent/yPercent`. Step 3: tambah ignoreMobileResize. Step 4: test
   di Chrome DevTools mobile emu (iPhone 14, Pixel 5) → cek FPS panel ≥ 55fps.
```

### ❌ Bad — Performative, generic, skips edge cases

```
🧠 DEEP THINKING MODE ENGAGED
1. Saya akan menganalisis masalah dengan mendalam.
2. Potensi kegagalan: bug, error, lag.
3. Mitigasi: akan saya perbaiki.
4. Rencana: lihat file, ubah kode, test.
```

Ini ditolak: tidak ada nama file, tidak ada konkret edge case, tidak ada nama skill, tidak ada validation command.

## Failure Modes

- Agent langsung mengedit file tanpa menyebut file yang dibaca, route skill, atau alasan perubahan.
- Bagian edge case berisi kata umum seperti "bug", "error", atau "lag" tanpa konteks repo, browser, viewport, data state, atau command.
- Rencana eksekusi memakai kata luas seperti "rapikan", "optimalkan", atau "perbaiki" tanpa menyebut fungsi, selector, file, atau validation target.
- Agent mengklaim "sudah dicek" tetapi final answer tidak menyebut command, screenshot, diff, atau file evidence yang bisa diulang.
- Agent memakai banyak skill di header, tetapi output tidak menunjukkan aturan skill mana yang benar-benar mengubah keputusan.
- Agent menulis mitigasi yang tidak bisa diuji, misalnya "akan lebih hati-hati" tanpa command, browser check, atau acceptance criteria.

## Validation

Cara verifikasi agent benar-benar pakai skill ini, bukan cuma nempel header:

1. **Cek 4 bagian harus ada dan diisi nyata** — bukan placeholder.
2. **Bagian 1 (Akar Masalah)** wajib sebut minimal 1 file path atau commit hash spesifik dari repo.
3. **Bagian 2 (Edge Cases)** wajib minimal 3 case, masing-masing dengan konteks (browser/device/data state) — bukan kata sifat ("ada error").
4. **Bagian 4 (Rencana)** wajib ada validation command yang bisa di-rerun dan sesuai repo, misalnya `node .agent/scripts/agent-doctor.mjs`, `python test_parallax.py`, atau Playwright screenshot diff.
5. **Cross-check dengan output akhir** — kalau rencana bilang "ubah parallax-sawah/main.js" tapi diff malah ke file lain, skill ini di-skip.

Validation otomatis: skill `self-review-gate` punya checklist yang nge-flag deep-thinking output yang terlalu pendek (<30 baris) atau tidak menyebut file/skill.

## Sub-Agent Propagation

Saat dispatch sub-agent (Task, Workflow, parallel agent), sertakan:

> "Pakai skill `deep-thinking-enforcer`. Baca `.agent/skills/deep-thinking-enforcer/SKILL.md` dulu. Mulai response dengan blok 🧠 DEEP THINKING MODE ENGAGED 4 bagian. Tanpa header itu, output ditolak."

## Related

- `prompt-amplifier` — tanya dulu kalau ambigu; deep-thinking tetap pakai meski sudah jelas.
- `phased-delivery` — deep-thinking di Rencana Eksekusi harus break down ke fase.
- `self-review-gate` — verifikasi setelah kerja; deep-thinking sebelum kerja. Pasangan.
- `.agent/MASTER_FLOW.md` — flow lifecycle yang skill ini wajib align dengan.
