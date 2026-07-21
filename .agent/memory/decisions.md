# Agent Kit Decisions

This file records durable decisions so future AI agents do not reverse them accidentally.

## 2026-06-01

- Keep the canonical agent kit inside `.agent`.
- Do not keep root `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, or `.agents/rules` unless the user explicitly asks to export adapters.
- Use `.agent/START_HERE.md` as the universal manual entrypoint.
- Use `.agent/scripts/export-agent-adapters.mjs` for adapter export; it must stay dry-run by default.
- Keep `.agent/skills` in Git so moving devices does not require rebuilding the skill library.
- Do not run scripts from `.agent/skills` automatically.
- Every `.agent` change should pass:

```bash
node .agent/scripts/validate-agent-skills.mjs
node .agent/scripts/agent-doctor.mjs
node .agent/scripts/export-agent-adapters.mjs --dry-run
```

- For device bootstrap, prefer:

```bash
node .agent/scripts/bootstrap-agent.mjs
```

- Treat TypeUI as an optional external UI design source, not an installed dependency, until the user explicitly asks to install or import it.

## 2026-06-23

- Established 7 governance skills that form the "Exodia System" — all are in `defaultSet` and universal route:
  1. `mandatory-skill-usage` — Wajib baca SKILL.md sebelum ngoding.
  2. `session-boot` — Format header wajib di setiap jawaban substantif.
  3. `auto-pro-standards` — Otomatis terapkan keamanan/SEO/performa/aksesibilitas.
  4. `prompt-amplifier` — Ubah permintaan sederhana jadi brief profesional via 4 fase (gali, jelaskan, minta izin, eksekusi).
  5. `phased-delivery` — Pecah project jadi fase kecil, cek di browser, minta persetujuan tiap fase.
  6. `project-memory` — Tulis PROJECT_MEMORY.md di akhir setiap fase, baca di awal sesi baru.
  7. `self-review-gate` — Checklist audit internal sebelum deliver hasil ke user.
- Created `audit-skill-quality.mjs` script to scan SKILL.md quality across the library.
- User is a beginner who demands professional output — governance skills handle the gap by injecting standards automatically without jargon.
- All governance skills are committed to Git for device portability.

## 2026-06-23 (sesi cleanup skill library)

- **Audit & prune skill library besar-besaran.** Library awalnya 1.545 skill, ternyata 96.9% orphan (ga dirujuk router/active-skills).
- Wire ~78 skill relevan ke `active-skills.json` (task-sets baru: `animation-3d`, `frontend-ui`, `accessibility`, `seo`, `performance`, `node-api`, `ai-llm`, `serverless`, `testing-quality`, `security-coding`, `bot-automation`) + 14 route baru di `skill-router.json`. `defaultSet` sengaja TIDAK digembungkan biar konteks harian tetap ramping.
- Fix broken reference `typeui-fundamentals` di router (diganti skill UI nyata, URL externalSources dipertahankan).
- **Prune 1.419 orphan skill** (cloud/devops, pentest, hukum, medis, finance, bahasa off-stack, SaaS automation). Hapus juga meta-docs koleksi upstream TAPI simpan `skills/docs/sources/` (LICENSE-MICROSOFT + atribusi).
- Hasil: 1.545 → 126 skill, 0 orphan, 0 broken reference. Semua recoverable via git (commit pre-prune: c5fc4080).
- **Script baru:**
  - `audit-orphan-skills.mjs` — laporan orphan + broken ref ke `memory/orphan-skills-report.md`.
  - `prune-orphan-skills.mjs` — hapus orphan (dry-run default, `--confirm` untuk eksekusi; melindungi wired + governance + GSAP wajib).
- **Hardening `agent-doctor.mjs`:** broken reference (termasuk `optionalSkills`) sekarang FAIL; orphan ke-flag sebagai warning otomatis. Mencegah penumpukan orphan di masa depan.
- Catatan: kalau nambah skill baru, wajib wire ke router/active-skills atau bakal muncul sebagai orphan warning di doctor.

## 2026-06-23 (celah mikroskopis: unit-testing + mobile)

- **Unit testing (kebutuhan nyata):** restore `javascript-testing-patterns` + `test-driven-development` dari git (c5fc4080), wire ke task-set `testing-quality` + route testing (trigger: vitest/jest/tdd/unit-test). Alasan: ranja-digital-store (React/Next) aktif tapi cuma punya playwright E2E, belum ada unit test komponen.
- **Mobile (kebutuhan spekulatif):** TIDAK diinstall biar ga jadi orphan. Didefinisikan sebagai `onDemandBundles.mobile` di active-skills.json (10 skill: react-native-architecture, mobile-developer, expo-*, dll). Restore sekali command: `node .agent/scripts/restore-skill-bundle.mjs mobile` (auto git checkout + update manifest + auto-wire task-set & route).
- **Script baru:** `restore-skill-bundle.mjs` — restore + auto-wire bundle on-demand dari git history.
- Pola ini = jaga library ramping (0 orphan) tapi kebutuhan masa depan tetap 1 command jauhnya. Total skill: 126 → 128 (unit testing).

## 2026-06-23 (integrasi prompt-pipeline + rapikan root)

- **Rapikan file root:** 5 file bridge/brain (AGENTS.md, CLAUDE.md, README.md, restore-brain.bat, antigravity_brain_backup.zip) WAJIB tetap di root (auto-load). File scratch lokal dipindah ke `_scratch/` (matrix_rain.cpp, payload.json, test_vexo.js, upload.js); `vexo_docs.html` (kosong) dihapus.
- **Integrasi 3 skill standalone ke .agent:** `arsitek-pikiran`, `prd-architect-pro`, `dewa-prompter-v2` (pipeline ide->PRD->master-prompt, output Bahasa Indonesia) dipindah dari root ke `.agent/skills/<nama>/SKILL.md`, masuk manifest, di-wire ke task-set `planning-prd` + route baru (trigger: strategy/roadmap/prd/mvp/master-prompt). Skill: 128 -> 131.
- **`.gitignore` root dibuat:** ignore `_scratch/` + `test_image.jpg` biar scratch (termasuk test_vexo.js yang ada API key) ga ke-commit ga sengaja.
- Catatan keamanan: `_scratch/test_vexo.js` ada API key hardcoded (DZBwiSWhssKMiX_R) — sengaja di-gitignore, jangan di-commit.

## 2026-06-23 (perkuat bridge lintas-agent)

- **Masalah:** sub-agent (mis. Kiro General Task Execution) dispatch tanpa bawa governance → app dibuat tanpa prompt-amplifier/SESSION BOOT/phased-delivery. Bridge Antigravity (`.agents/rules/agent-kit.md`) juga jauh lebih lemah dari bridge lain.
- **Fix di SUMBER (generator `export-agent-adapters.mjs`)** biar ga ke-overwrite saat regenerate. Semua bridge sekarang punya: gate `⛔ MANDATORY PRE-FLIGHT`, daftar 7 skill governance, **SUB-AGENT PROPAGATION (wajib teruskan governance ke sub-agent)**, dan **no-skip clause** (prompt lengkap TIDAK membebaskan dari SESSION BOOT + auto-pro-standards + phased-delivery).
- Regenerate 4 bridge: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-kit.mdc` (frontmatter alwaysApply:true preserved), `.agents/rules/agent-kit.md`.
- **Plafon jujur:** ini naikin kepatuhan lintas-agent (lapisan 1 & 2: bridge kebaca + dimengerti), TAPI lapisan 3 (model mau nurut) ga akan pernah 100% — itu properti runtime/model, bukan repo. Tool tanpa konvensi bridge (AGENTS/CLAUDE/.cursor/.agents) tetap ga akan liat aturan kecuali di-paste manual.

## 2026-06-23 (mekanisme compounding lintas-project)

- **Konteks:** model AI ga belajar dari user (weights beku). Satu-satunya "compounding" = memori eksternal yang ditulis + dibaca ulang.
- **Dibuat:** sistem lessons-learned lintas-project:
  - `.agent/memory/lessons-learned.md` — log pelajaran (format: project, lesson, tags, promote?).
  - `.agent/skills/lessons-capture/SKILL.md` — disiplin: catat lesson di akhir project, kalau tag muncul >=3x angkat jadi skill baru. Masuk `defaultSet` (governance always-on).
  - `.agent/scripts/capture-lesson.mjs` — helper `--add` / `--review` (deteksi pola berulang) / `--list`.
- Route baru: project:complete/retrospective/postmortem -> lessons-capture + project-memory.
- Skill: 131 -> 132, tetap 0 orphan / 0 broken.
- Catatan: ini compounding manual-terstruktur, BUKAN model self-improve. Pola berulang harus diangkat manual jadi skill biar masuk router.

## 2026-07-11 (1000x lipat = max-capability protocol, bukan hype)

- **Masalah:** frasa user seperti `1000x`, `1000x lipat`, `1000 kali lipat`, dan `gas total` hanya jelas di sebagian governance. Agent lain bisa menafsirkannya sebagai perintah hype atau rewrite besar-besaran.
- **Keputusan:** frasa tersebut sekarang dinormalisasi menjadi protokol kerja: scope statement, evidence ledger, risk budget, alternatif pendekatan, validasi kuat, dan remaining risk.
- **Fix di SUMBER:** patch canonical `.agent` rules/skills/router, bridge auto-load (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-kit.mdc`, `.agents/rules/agent-kit.md`), dan generator `.agent/scripts/export-agent-adapters.mjs` agar regenerate tidak menghapus aturan ini.

## 2026-07-11 (max-capability always-on untuk semua task substantif)

- **Masalah:** user tidak mau harus mengetik `1000x lipat` terus-menerus agar agent bekerja ketat.
- **Keputusan:** `max-capability-protocol` dan `expert-reasoning-operator` menjadi always-on untuk setiap task substantif. Frasa `1000x lipat` sekarang hanya penegas, bukan syarat aktivasi.
- **Acceptance signal:** task substantif wajib menunjukkan scope, evidence, risk budget, alternatif saat relevan, validasi command/result, dan risiko sisa tanpa diminta ulang.

## 2026-07-15 (official reference verification + correction memory)

- **Masalah:** instruksi "cek dokumentasi resmi" yang hanya berupa teks tidak menjamin
  daftar sumber tetap utuh, agent membaca lesson sebelum task, atau koreksi user
  benar-benar dicatat sebelum pekerjaan dilanjutkan.
- **Alternatif yang ditolak:** menambah daftar 33 sumber langsung ke setiap bridge.
  Duplikasi tersebut mudah drift saat satu file diregenerasi atau diedit terpisah.
- **Keputusan:** gunakan `.agent/official-reference-map.json` sebagai source map
  tunggal, route melalui `official-reference-verifier`, dan enforce marker, topic
  count, source mapping, correction gate, active set, serta generated bridge melalui
  `validate-agent-skills.mjs`.
- **Batas scope:** policy hanya mengatur workflow agent. Kode aplikasi dan pilihan
  teknologi project tidak berubah.

## 2026-07-20 (rebrand SESSION BOOT → 🔥 I AM CRAZY + refresh fakta 2026)

- **Masalah:** user minta ganti identitas output "SESSION BOOT" jadi "I AM CRAZY"
  (brain/.../upgrade_prompt.md) dan menaikkan currency ke standar terbaru.
- **Alternatif yang ditolak:** (1) mass-rewrite 162 skill yang sudah Excellent —
  ditolak karena melanggar lessons-learned 2026-07-10 (churn kosmetik, risiko regresi,
  0 nilai baru). (2) rebrand cuma di skill tanpa update hook — ditolak karena
  `.agents/scripts/stop-gate.mjs` me-reject output tanpa string header; rebrand harus
  atomik dengan hook + generator.
- **Keputusan:** rebrand DISPLAY identity di 5 skill + 3 hook/script + docs + 4 bridge
  regenerasi. Folder skill `session-boot` TIDAK di-rename (dipakai router/validator).
  Marker governance (`EVERY_OUTPUT_SKILL_DISCLOSURE`, `FAIL_CLOSED_GOVERNANCE`,
  `GOVERNANCE VIOLATION DETECTED`) dipertahankan agar validator tetap hijau.
  stop-gate menerima `I AM CRAZY|SESSION BOOT` (transisi 1 turn, anti-trap).
- **Koreksi fakta (anti-halusinasi):** prompt minta "OWASP 2026" — TIDAK ADA. Edisi
  resmi = OWASP Top 10:2025 (final Jan 2026). WCAG tetap 2.2 (3.0 masih draft).
  Core Web Vitals pakai INP, bukan FID (sejak 2024-03-12). Diperbaiki di 2 SEO
  checklist + core standards + anti-hallucination pattern baru.
- **Batas scope:** identitas + currency governance. Tidak menyentuh 150 skill sehat,
  tidak mengubah kode aplikasi.

## 2026-07-20 (open-source research: allowed → MANDATORY harvest)

- **Masalah:** user mau tiap project agent DIPAKSA cari contoh eksternal + AMBIL
  kodenya, bukan cuma "boleh". Aturan lama: `openSourceResearch.allowed=true`
  (opsional), `mandatory-skill-usage` cuma wajib untuk "complex patterns", dan
  semua file bilang "Adapt, don't dump / never paste verbatim".
- **Alternatif yang ditolak:** (1) izinkan copy verbatim mentah — ditolak karena
  melanggar lisensi (MIT/Apache wajib atribusi), bikin AI slop, dan lubang security
  dari kode belum direview; user setuju setelah dijelaskan. (2) tetap "wajib cari
  tapi jangan ambil kode" — bukan yang user minta.
- **Keputusan:** naikkan ke `required=true` +
  `policyId=MANDATORY_OPEN_SOURCE_HARVEST`, `mustHarvestCode=true`,
  `appliesTo=every-substantive-task` dengan `exemptTasks` (trivial edit, percakapan,
  glue tanpa prior art). Model: HARVEST kode nyata dari lisensi aman → ADAPTASI ke
  konvensi repo → audit log "Source & License Audit" wajib. Verbatim mass-paste tetap
  dilarang; snippet idiomatik kecil boleh near-verbatim asal diatribusi. LGPL
  ditambahkan ke blockedLicenses.
- **File diubah:** `.agent/skill-router.json` (openSourceResearch block),
  `.agent/AGENTS.md` (section jadi WAJIB), `.agent/rules/mandatory-skill-usage.md`
  (Harvest section). CLAUDE.md/bridge tidak perlu regen (import by reference).
- **Batas scope:** hanya policy riset/harvest. Tidak mengubah kode aplikasi atau
  skill teknis.
