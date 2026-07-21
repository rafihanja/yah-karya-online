---
name: official-reference-verifier
description: "Wajib untuk task yang menyentuh 33 topik pada official-reference-map.json; memaksa pengecekan sumber utama, pre-flight lessons, cross-check sebelum delivery, dan pencatatan koreksi user sebelum lanjut."
---

# Official Reference Verifier

<!-- OFFICIAL_REFERENCE_VERIFICATION -->

> **One-liner:** Gunakan referensi yang ditetapkan user sebagai source of truth,
> lalu ubah koreksi menjadi memori yang dapat dipakai ulang.

## Why This Exists

Kualitas pengerjaan sering menurun ketika AI agent berhalusinasi tentang sintaks, versi library yang cepat berubah, atau standar keamanan terbaru. Dengan memaksakan penggunaan referensi resmi (official reference) yang sudah terverifikasi oleh user, memori agent terbebas dari bias data latihan yang usang, dan setiap koreksi dari user dapat langsung dipersistensikan sebagai pelajaran berharga lintas sesi.

## When to Use

- Saat task cocok dengan salah satu topik atau signal di
  `.agent/official-reference-map.json`.
- Saat jawaban memerlukan syntax spesifik, API, perilaku versi, best practice,
  cloud/deploy, atau security guidance.
- Saat user meminta informasi terbaru atau saat ada kemungkinan training data basi.
- Saat user mengoreksi jawaban agent tentang salah satu topik terdaftar.

## ALWAYS DO THIS

1. Baca `.agent/memory/lessons-learned.md` sebelum mulai dan cari lesson dengan tag
   yang relevan.
2. Baca `.agent/official-reference-map.json`, pilih topik yang cocok, lalu gunakan
   source yang dipetakan sebagai referensi utama.
3. Jalankan web search/fetch sebelum menjawab bila klaim bersifat version-sensitive,
   syntax-specific, API-specific, security-sensitive, atau agent tidak 100% yakin.
4. Catat evidence ringkas: topik, sumber, claim yang dicek, dan keputusan yang
   berubah karena pengecekan tersebut.
5. Cross-check draf jawaban/patch sebelum delivery. Jika masih ada gap, tulis:
   `ini masih perlu dicek ulang`.
6. Jika user mengoreksi agent, update lesson sebelum melakukan edit, jawaban teknis,
   atau fase lanjutan. Entry harus memuat kesalahan, koreksi, dan pola pemicu.

Contoh correction entry:

```markdown
## 2026-07-15 - koreksi TypeScript
**Lesson:** Saya memakai API yang sudah berubah. Koreksi: cek dokumentasi TypeScript
yang dipetakan sebelum memberi contoh syntax version-specific.
**Tags:** typescript, official-reference, user-correction
**Promote?:** no
```

## NEVER DO THIS

- Jangan menganggap hafalan model sebagai bukti untuk API atau best practice terbaru.
- Jangan mengklaim "sudah dicek" tanpa tool output atau halaman sumber yang benar-benar
  dibaca.
- Jangan mengganti sumber map secara diam-diam dengan situs lain.
- Jangan meneruskan pekerjaan setelah koreksi user sebelum lessons file diperbarui.
- Jangan memenuhi jawaban dengan laporan proses; sebut sumber hanya jika relevan untuk
  akurasi, audit, atau diminta user.

## Failure Modes

- **Map tidak dibaca:** agent memilih sumber dari ingatan dan melewatkan preferensi
  user. Mitigasi: route skill ini dan validasi policy marker.
- **Dokumentasi pasif:** aturan ada tetapi adapter agent tidak membawanya. Mitigasi:
  wire marker ke exporter dan scan generated bridge.
- **Koreksi hilang:** agent memperbaiki jawaban tetapi tidak mencatat pola. Mitigasi:
  correction gate wajib sebelum lanjut.
- **Over-reporting:** agent menampilkan seluruh proses browsing untuk jawaban kecil.
  Mitigasi: simpan evidence ledger internal dan tampilkan hanya sumber/gap relevan.
- **Fakta Temporal Tanpa Web Search:** Agent menjawab fakta temporal (misalnya tanggal rilis atau versi library baru setelah pertengahan 2024) menggunakan ingatan alih-alih search_web. Mitigasi: Selalu jalankan search_web untuk pertanyaan temporal fakta.

## Validation

1. Verifikasi map memiliki tepat 33 pasangan topik/sumber:

   ```powershell
   node .agent\scripts\validate-agent-skills.mjs
   ```

2. Verifikasi skill terhubung ke router, active set, dan manifest:

   ```powershell
   node .agent\scripts\agent-doctor.mjs
   ```

3. Verifikasi bridge membawa correction/reference gate:

   ```powershell
   node .agent\scripts\export-agent-adapters.mjs --dry-run
   ```

4. Setelah koreksi user, verifikasi lesson tercatat:

   ```powershell
   node .agent\scripts\capture-lesson.mjs --list
   ```

## Sub-Agent Propagation

> "Use `official-reference-verifier`. Read its full `SKILL.md`,
> `.agent/official-reference-map.json`, the official-reference rule, and relevant
> lessons before acting. Verify uncertain/current claims with the mapped source,
> cross-check before delivery, and update lessons before continuing after a user
> correction."

## Related

- `.agent/rules/official-reference-verification.md`
- `lessons-capture`
- `mandatory-skill-usage`
- `self-review-gate`
