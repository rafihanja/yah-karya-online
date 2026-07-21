---
name: skill-excellence-ratchet
description: >
  Quality ratchet — skill library hanya boleh naik kualitasnya, tidak boleh turun.
  Mewajibkan deep thinking, objektivitas, belajar dari contoh eksternal yang aman,
  dan pertumbuhan skill yang terus-menerus (compounding). Gunakan saat menambah,
  mengedit, atau me-review skill. Wajib di-enforce di akhir setiap sesi yang
  menyentuh .agent/skills.
---

# Skill Excellence Ratchet — Kualitas Cuma Boleh Naik

> **One-liner:** Skill library ini adalah aset permanen. Kualitasnya HANYA boleh naik, TIDAK pernah turun. Setiap sentuhan ke skill harus membuat library lebih kuat dari sebelumnya.

## Why This Exists

Tanpa mekanisme ratchet, kualitas skill bisa diam-diam turun:
- Skill baru ditulis asal-asalan (generik, tanpa ALWAYS/NEVER).
- Skill lama diedit tanpa pengecekan, kehilangan section penting.
- Tidak ada baseline — jadi tidak tahu apakah library makin bagus atau makin jelek.
- AI tidak belajar dari contoh nyata — hanya mengandalkan ingatan yang bisa salah.

Skill ini memastikan **4 prinsip wajib** dijalankan setiap kali menyentuh skill library:

1. **Deep Thinking** — Jangan asal tulis. Pikirkan edge case, kapan skill ini gagal, apa yang bisa salah.
2. **Objektivitas** — Semua klaim harus berdasarkan bukti (file, command, dokumentasi). Bukan opini.
3. **Belajar dari Contoh Eksternal yang Aman** — Cari referensi dari sumber open-source berlisensi aman (MIT/Apache/BSD/ISC/CC0). Jangan mengarang sendiri kalau ada best practice yang sudah terbukti.
4. **Selalu Bertambah (Compounding)** — Setiap sesi harus meninggalkan library dalam kondisi lebih baik dari sebelumnya. Diukur secara kuantitatif via baseline.

## When to Use

- Saat **membuat skill baru** di `.agent/skills/`.
- Saat **mengedit skill yang sudah ada**.
- Saat **melakukan audit/review** terhadap skill library.
- Di **akhir setiap sesi** yang menyentuh file di `.agent/skills/`.
- Saat user bilang "maksimalin skill", "sempurnain", "perbaiki kualitas", "skill jelek", atau "audit skill".

## ALWAYS DO THIS

### 1. Setiap Skill Baru/Edit WAJIB Punya Section Ini

Sebelum commit skill baru atau hasil edit, pastikan SKILL.md mengandung:

| Section | Wajib? | Penjelasan |
|---------|--------|------------|
| `## When to Use` | ✅ WAJIB | Kapan skill ini dipanggil. Harus spesifik. |
| `## ALWAYS DO THIS` | ✅ WAJIB | Aturan yang harus selalu diikuti. Minimal 3 poin actionable. |
| `## NEVER DO THIS` | ✅ WAJIB | Larangan keras. Minimal 2 poin. |
| YAML frontmatter (`name`, `description`) | ✅ WAJIB | Harus ada di baris pertama file. |
| Contoh kode/config | 🟡 Sangat disarankan | Kalau skill menyangkut kode, HARUS ada contoh. |
| Referensi eksternal | 🟡 Sangat disarankan | Link ke dokumentasi resmi atau repo berlisensi aman. |

Kalau section wajib tidak ada → **JANGAN commit. Lengkapi dulu.**

### 2. Deep Thinking Checklist (Internal, Sebelum Menulis)

Sebelum menulis/mengedit SKILL.md, jawab pertanyaan ini secara internal:

- [ ] **Problem:** Masalah apa yang skill ini selesaikan? (Bukan "bikin kode bagus" — itu terlalu generik.)
- [ ] **Edge Case:** Kapan skill ini TIDAK berlaku atau malah berbahaya?
- [ ] **Overlap:** Apakah sudah ada skill lain yang menangani ini? Kalau iya, apa bedanya?
- [ ] **Evidence:** Dari mana kamu tahu pendekatan ini benar? (Dokumentasi resmi? Pengalaman di project ini? Repo open-source?)
- [ ] **Measurable:** Bagaimana cara mengukur apakah skill ini berhasil diterapkan?

### 3. Mandatory External Reference

Untuk setiap skill yang menyangkut teknologi/framework/library:

1. **CARI** dokumentasi resmi atau repo open-source berlisensi aman (MIT/Apache-2.0/BSD/ISC/CC0).
2. **SEBUTKAN** URL sumber di dalam SKILL.md (section "References" atau inline).
3. **ADAPTASI** ke konvensi repo ini — jangan copy-paste blok besar mentah-mentah.
4. **JANGAN** gunakan sumber GPL/AGPL/proprietary/lisensi tidak jelas.

### 4. Quality Ratchet — Jalankan Setelah Setiap Perubahan

```bash
node .agent/scripts/audit-skill-quality.mjs
```

Bandingkan hasilnya dengan baseline di `.agent/memory/skill-quality-baseline.json`:

- **Excellent count** HANYA boleh naik atau tetap, TIDAK boleh turun.
- **Good count** boleh turun (artinya skill-nya naik ke Excellent).
- **Weak/Empty count** HARUS tetap 0. Kalau naik → PERBAIKI sebelum commit.

Setelah perbaikan, update baseline:
```bash
node .agent/scripts/update-skill-baseline.mjs
```

### 5. Upgrade Path — Cara Menaikkan Skill dari Good ke Excellent

Skill yang masuk kategori "Good" (111 saat ini) bisa dinaikkan ke "Excellent" dengan menambahkan:

1. Section `## ALWAYS DO THIS` dengan minimal 3 poin actionable.
2. Section `## NEVER DO THIS` dengan minimal 2 poin.
3. Section `## When to Use` yang spesifik (bukan generik).

Prioritas upgrade:
1. Skill yang paling sering dipakai di project aktif (cek `skill-router.json`).
2. Skill yang menyangkut keamanan (security, auth, env).
3. Skill yang menyangkut kualitas kode (review, testing, performance).

## NEVER DO THIS

- JANGAN commit skill baru tanpa YAML frontmatter + 3 section wajib.
- JANGAN menurunkan jumlah "Excellent" di audit. Kalau turun, ada yang salah — perbaiki.
- JANGAN menulis skill generik tanpa contoh kode/config ("selalu bikin kode bagus" = SAMPAH).
- JANGAN mengklaim fakta teknis tanpa referensi (dokumentasi/repo/command output).
- JANGAN copy-paste dari sumber berlisensi GPL/AGPL/proprietary.
- JANGAN skip deep thinking checklist karena "kayaknya udah jelas".
- JANGAN bikin skill duplikat — cek overlap dengan skill yang sudah ada dulu.

## Hubungan dengan Skill Lain

- `self-review-gate` → Gate terakhir sebelum deliver. Ratchet ini adalah gate khusus untuk skill library.
- `lessons-capture` → Kalau pola berulang >= 3x, dinaikkan jadi skill baru (yang harus lolos ratchet ini).
- `mandatory-skill-usage` → Memastikan skill dipakai. Ratchet ini memastikan skill yang dipakai berkualitas.
- `code-reviewer` → Review kode. Ratchet ini review skill.

## Quality Gate

Sebelum menutup sesi yang menyentuh skill:
- [ ] `agent-doctor` passed (0 orphan, manifest sinkron).
- [ ] `audit-skill-quality` Excellent count >= baseline.
- [ ] Weak/Empty count tetap 0.
- [ ] Setiap skill baru punya 3 section wajib.
- [ ] Setiap skill yang diedit tidak kehilangan section yang sudah ada.

## Validation

Jalankan setelah menyentuh skill mana pun. Semua WAJIB exit 0:

```bash
node .agent/scripts/validate-agent-skills.mjs   # struktur + marker governance
node .agent/scripts/agent-doctor.mjs            # 0 orphan, manifest sinkron
node .agent/scripts/audit-skill-quality.mjs     # Excellent count >= baseline
node .agent/scripts/deep-skill-audit.mjs        # kedalaman section (ALWAYS/NEVER/Validation/contoh)
```

Bukti lulus:
1. `audit-skill-quality` melaporkan Excellent count **>=** angka di `.agent/memory/skill-quality-baseline.json`, Weak/Empty tetap 0.
2. `deep-skill-audit` tidak menandai skill yang baru diedit sebagai thin/incomplete.
3. Jika salah satu turun di bawah baseline → ratchet dilanggar; perbaiki sebelum deliver, jangan turunkan baseline untuk "menghijaukan" hasil.
