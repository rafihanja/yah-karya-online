# 🛠️ AGENT SCRIPTS CATALOG (.agent/scripts/)

Dokumentasi lengkap seluruh 18 skrip pembantu (.mjs) di dalam folder `.agent/scripts/`:

1. `agent-doctor.mjs` — Penguji kesehatan ekosistem agen, kelengkapan berkas, dan pemindai secret.
2. `audit-orphan-skills.mjs` — Pemindai skill yatim yang ada di disk tetapi tidak dirujuk router.
3. `audit-skill-quality.mjs` — Audit kualitas penulisan berkas `SKILL.md` (panjang baris & seksi wajib).
4. `bootstrap-agent.mjs` — Inisialisasi awal lingkungan workspace agen baru.
5. `capture-lesson.mjs` — Pencatat pembelajaran baru dari koreksi user ke `lessons-learned.md`.
6. `deep-skill-audit.mjs` — Audit mendalam sintaks Markdown, broken links, dan path file.
7. `detect-project.mjs` — Pendeteksi otomatis stack teknologi project (React, Next.js, Python, dll.).
8. `enforce-skill-quality.mjs` — Penegak batas minimal kualitas skill agar bebas dari slop.
9. `export-agent-adapters.mjs` — Penulis 4 file bridge luaran (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-kit.mdc`, `.agents/rules/agent-kit.md`).
10. `generate-skill-index.mjs` — Generator katalog idempoten `INDEX.md` untuk 162 skill.
11. `list-good-skills.mjs` — Pengelompok skill kategori Good yang siap di-upgrade.
12. `prune-orphan-skills.mjs` — Pembersih & penghapus skill yatim yang tidak terpakai.
13. `restore-skill-bundle.mjs` — Pemulih bundle skill on-demand (seperti Expo / Mobile).
14. `self-review-validator.mjs` — Validator utama delivery gate sebelum menyerahkan hasil ke user.
15. `setup-new-device.mjs` — Skrip pembantu setup dan konfigurasi agen pada perangkat/laptop baru.
16. `update-skill-baseline.mjs` — Pembaru metadata baseline statistik kualitas skill.
17. `upgrade-skill-batch.mjs` — Skrip utilitas upgrade batch pilihan skill.
18. `validate-agent-skills.mjs` — Validator utama struktur `.agent/` dan pencegah kebocoran/drift.

> **Riwayat:** `auto-upgrade-good-skills.mjs`, `upgrade-final-13.mjs`, dan `upgrade-remaining-27.mjs`
> dihapus 2026-07-22 — skrip migrasi sekali-jalan yang tugasnya sudah tuntas (semua 162 skill
> sekarang berstatus Excellent, terverifikasi `audit-skill-quality.mjs`). Riwayatnya tetap ada
> di Git log kalau perlu dirujuk lagi.
