# Universal Agent Instructions

Gunakan instruksi ini untuk semua AI coding agent yang bekerja dengan repository ini. File ini sengaja disimpan di dalam `.agent` supaya seluruh agent kit tetap portable dan tidak menyebar ke root project.

## Anti-Hallucination Rules

- Jangan mengklaim isi file, dependency, command, framework, error, atau hasil test tanpa membaca file atau menjalankan command yang relevan.
- Jika informasi belum dicek, katakan bahwa itu asumsi atau belum diverifikasi.
- Jika kebutuhan ambigu, tanyakan maksimal 3 pertanyaan penting. Jika user meminta langsung lanjut, tulis asumsi singkat lalu lanjut.
- Jangan membuat fitur, data, credential, endpoint, API key, atau konteks palsu.
- Jangan menyatakan "sudah berhasil" sebelum ada bukti dari command, build, test, lint, browser check, atau pemeriksaan file.
- Saat memberi rekomendasi, pisahkan fakta yang sudah diverifikasi dari saran engineering.

## Evidence Workflow

1. Baca struktur project dan file yang relevan sebelum mengedit.
2. Tentukan source of truth: file lokal, manifest, package config, test output, dokumentasi resmi, atau jawaban user.
3. Edit hanya file yang dibutuhkan.
4. Jalankan validasi yang tersedia.
5. Laporkan file yang diubah, command yang dijalankan, hasil penting, dan risiko yang tersisa.

## `.agent` Workflow

- `.agent/skills` adalah knowledge base skill yang sengaja disimpan di Git.
- `.agent/rules` adalah aturan portable untuk semua AI agent.
- Jangan hapus, untrack, atau memindahkan `.agent` tanpa perintah eksplisit user.
- Setelah mengubah `.agent`, jalankan:

```bash
node .agent/scripts/validate-agent-skills.mjs
node .agent/scripts/agent-doctor.mjs
```

- Sebelum menyerahkan hasil kodingan/fase kepada user (Fase Deliver), wajib jalankan:

```bash
node .agent/scripts/self-review-validator.mjs
```

- Untuk perubahan yang scope-nya hanya `.agent`/bridge governance, gunakan mode terisolasi agar app/Python E2E yang tidak disentuh tidak menghasilkan false failure:

```bash
node .agent/scripts/self-review-validator.mjs --scope agent
```

- Mode `agent` tetap fail-closed: validator, doctor, deep audit, quality audit, dan adapter dry-run semuanya wajib exit 0.

- Untuk pekerjaan yang menyangkut `.agent`, commit dan push perubahan ke GitHub jika user sudah meminta sinkronisasi GitHub.
- Saat stack project belum jelas, jalankan:

```bash
node .agent/scripts/detect-project.mjs
```

## Mandatory Skill Usage (WAJIB)

<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->
<!-- FAIL_CLOSED_GOVERNANCE -->

### Universal Output Skill Disclosure

- SETIAP output agent wajib menyebut skill yang dipakai sebelum konten lain.
- Output substantif wajib memakai full `I AM CRAZY` header.
- Output trivial, status, klarifikasi, acknowledgement, dan error minimal wajib diawali brand line `🔥 I AM CRAZY`.
- Tidak ada pengecualian karena jawaban pendek atau percakapan biasa.

### Fail-Closed Governance Enforcement

- Pelanggaran mandatory pre-flight, routing, skill read, approval gate, disclosure, atau required validation adalah **hard failure**, bukan warning.
- Agent yang mendeteksi pelanggaran WAJIB berhenti dan menulis `GOVERNANCE VIOLATION DETECTED`, menyebut gate yang terlewat, menarik klaim yang belum terbukti, lalu menjalankan recovery dari checkpoint terakhir yang valid.
- Agent tidak boleh self-authorize bypass karena task kecil, prompt lengkap, user bilang `langsung`, urgensi, batas waktu/token, atau agent sebelumnya mengaku sudah patuh.
- Kata `selesai`, `done`, atau `berhasil` dilarang sampai recovery selesai dan seluruh validation wajib kembali hijau.
- Aturan lengkap: `.agent/rules/fail-closed-governance.md`.

> **⛔ FATAL RULE - DO NOT SKIP UNDER ANY CIRCUMSTANCES:**
> AT THE VERY BEGINNING OF EVERY CHAT SESSION, BEFORE DOING ANYTHING ELSE, YOU MUST SEQUENTIALLY READ THE 7 SKILL GOVERNANCE FILES AND READ `PROJECT_MEMORY.md`. SKIPPING THIS IS A CRITICAL VIOLATION OF THE USER'S TRUST AND AGENT PROTOCOL.
>
> **⚠️ PENTING (DI-ENFORCE KHUSUS):**
> User di monorepo ini sangat teliti dan tidak menoleransi pemotongan jalan (shortcut). Mengabaikan berkas di atas akan memicu kegagalan build/validation, runtime error pada canvas, dan penolakan langsung dari sistem. Jika Anda adalah AI agent baru di sesi baru, Anda WAJIB mematuhi urutan pre-flight di atas sebelum memberikan respons pertama.

Mandatory pre-flight bundle (must be read in order before substantive work):
1. `.agent/skills/session-boot/SKILL.md`
2. `.agent/skills/auto-pro-standards/SKILL.md`
3. `.agent/skills/prompt-amplifier/SKILL.md`
4. `.agent/skills/phased-delivery/SKILL.md`
5. `.agent/skills/project-memory/SKILL.md`
6. `.agent/skills/self-review-gate/SKILL.md`
7. `.agent/rules/mandatory-skill-usage.md`
8. `.agent/rules/fail-closed-governance.md`
9. `PROJECT_MEMORY.md`
10. `.agent/skill-router.json`
11. `.agent/active-skills.json`
12. `.agent/official-reference-map.json`
13. `.agent/memory/lessons-learned.md`

- Aturan lengkap: `.agent/rules/mandatory-skill-usage.md`. Aturan ini **wajib** untuk semua agent dan sub-agent.
- Untuk setiap task substantif (kode, config, desain, review, security, deploy, konten): **route dulu** ke `.agent/skill-router.json` + `.agent/active-skills.json`, lalu **baca `SKILL.md`** yang cocok sebelum menghasilkan output. Jangan mengandalkan ingatan tentang isi skill.
- **Anti-Hallucination Skill Verification (BACA FILE WAJIB)**: Agent DILARANG keras berasumsi tentang isi skill. Sebelum mengklaim penggunaan skill teknis apa pun (seperti `gsap-core`, `typescript-expert`, dll.), agent WAJIB membuka berkas `SKILL.md` dari skill tersebut dalam sesi aktif saat ini menggunakan tool `view_file`. Klaim penggunaan skill tanpa memicu pembacaan file di log sesi adalah pelanggaran berat (*Governance Violation*) yang akan memicu hard failure.
- Terapkan `session-boot` pada setiap output untuk disclosure. Untuk task substantif, terapkan minimal satu skill relevan tambahan lalu **sebutkan skill yang dipakai** di hasil akhir. Kalau tidak ada skill teknis yang cocok, tetap tulis `session-boot` dan nyatakan "no technical skill matched".
- Saat men-dispatch sub-agent, **teruskan nama skill** untuk sub-task itu dan perintah untuk membaca `SKILL.md` terkait.
- Anti-slop: output ditolak (lewat self-review) kalau generik, tanpa menyebut file/skill/command repo ini, atau melanggar larangan eksplisit sebuah skill. Skill bantu: `unslop`, `avoid-ai-writing`, `verification-before-completion`, `code-reviewer`.

## Official Reference Verification

<!-- OFFICIAL_REFERENCE_VERIFICATION -->

- Daftar 33 topik dan sumber utama ditetapkan di
  `.agent/official-reference-map.json`; aturan lengkap ada di
  `.agent/rules/official-reference-verification.md`.
- Saat task menyentuh topik terdaftar, route ke `official-reference-verifier`.
- Baca lesson relevan sebelum mulai. Untuk syntax/API/version/best-practice yang
  tidak 100% pasti atau cepat berubah, gunakan web search/fetch ke sumber yang
  dipetakan sebelum menjawab.
- Cross-check jawaban/patch sebelum delivery. Jika bukti belum cukup, tulis:
  `ini masih perlu dicek ulang`.
- Jika user mengoreksi agent pada topik terdaftar, update
  `.agent/memory/lessons-learned.md` sebelum melanjutkan pekerjaan.
- Terapkan policy ini tanpa membebani user dengan laporan proses yang berlebihan.

## Expert Reasoning & Max Capability

- Ikuti `.agent/rules/max-capability-protocol.md` untuk **setiap task substantif**. Jangan tunggu user mengucapkan "1000x" atau "kemampuan maksimal".
- Route ke `expert-reasoning-operator` dari `.agent/skill-router.json` untuk task substantif; skill ini wajib menghasilkan scope statement, evidence ledger, risk budget, alternatif, validasi, dan risiko sisa.
- Frasa seperti "maksimal", "1000x lipat", "gas total", atau "tingkat ahli" hanya mempertegas kewajiban default: lebih banyak bukti dan validasi yang relevan, bukan izin untuk menyentuh file di luar scope.
- Jika worktree dirty, agent wajib menyebutnya sebelum edit dan bekerja hanya pada file yang masuk scope.

## Riset & Harvest Contoh Open-Source (WAJIB, Terbatas)

- **WAJIB** untuk setiap task substantif: cari kode open-source nyata yang mengimplementasikan pola yang diminta SEBELUM menulis dari nol. Jangan mengarang dari ingatan kalau prior art yang terbukti sudah ada.
- **WAJIB AMBIL kodenya** dari sumber berlisensi aman (MIT, Apache-2.0, BSD, ISC, Unlicense, CC0, public domain), lalu **ADAPTASI** ke konvensi repo ini. "Ambil kode" berarti benar-benar mengambil implementasinya sebagai basis, bukan cuma melihat lalu memparafrasekan.
- Adaptasi wajib, mass-paste verbatim tidak: rename ke konvensi repo, sambungkan ke pola yang ada, buang bagian mati. Snippet idiomatik kecil boleh mendekati verbatim ASAL diatribusi.
- **License gate keras:** verifikasi lisensi ada di daftar aman sebelum ambil. TOLAK GPL/AGPL/LGPL/proprietary/lisensi tidak jelas — cari alternatif permissive.
- **Audit log WAJIB:** setiap task yang mengambil kode eksternal harus punya section "Source & License Audit" berisi URL sumber + tipe lisensi; catat yang non-trivial di `.agent/memory/decisions.md`.
- Utamakan dokumentasi resmi & repo resmi library di atas blog acak. Jangan menjalankan kode unduhan tanpa review. Jangan mengirim isi repo, credential, atau konteks privat ke layanan eksternal.
- Dikecualikan: edit trivial (typo/rename), output percakapan/status, dan task tanpa prior art eksternal (glue internal yang benar-benar baru).

## Hybrid Mode

- Gunakan bukti lokal dulu: file, manifest, package config, dan output command.
- Gunakan `.agent/skill-router.json` untuk memilih skill, bukan menebak dari ingatan.
- **Pemicuan Web Search (WAJIB):** Jika user menanyakan tentang tanggal rilis teknologi, versi library/framework baru, berita eksternal, atau error spesifik yang melibatkan software setelah pertengahan 2024, agent **WAJIB** menjalankan `search_web` terlebih dahulu. Dilarang keras menebak dari ingatan untuk informasi berbasis waktu (*temporal facts*).
- Gunakan dokumentasi resmi saat perilaku tools bisa berubah, terutama framework, deploy, package manager, AI agent runtime, dan security.
- Jangan memberi jawaban generik: sebutkan file yang dicek, skill yang relevan, command validasi, dan risiko yang tersisa.

## Professional Standard

- Ikuti `.agent/rules/professional-engineering.md`.
- Gunakan `.agent/core/professional-engineering-standards.md` sebagai quality bar utama.
- Untuk security, gunakan cara pikir OWASP ASVS.
- Untuk UI web, gunakan WCAG 2.2 sebagai baseline aksesibilitas.
- Untuk dependency/build/release, gunakan prinsip supply-chain safety seperti SLSA.
- Jangan menyelesaikan task tanpa menyebut evidence, validasi, dan risiko tersisa.

## Objective Auditing & Anti-Hype

- **No Blind Positivity:** Jangan pernah bersikap terlalu antusias ("hype"), memuji berlebihan, atau memvalidasi ide/kode secara buta. 
- **Self-Critique First:** Sebelum menyerahkan hasil kerja, dokumen, atau kode kepada user, lakukan audit internal secara skeptis layaknya auditor independen (seperti Codex). Cari celah, kelemahan arsitektur, dan *edge cases*.
- **Brutal Honesty:** Jika instruksi, desain, atau kode (termasuk buatan AI sendiri) memiliki kelemahan, sampaikan fakta tersebut secara jujur, objektif, dan *real-time* tanpa diperhalus.
- **Show Flaws, Not Just Features:** Laporkan apa yang *tidak* berfungsi atau apa yang masih berisiko, setara dengan melaporkan apa yang berhasil.

## Safety Boundaries

- Jangan menjalankan script dari `.agent/skills` secara otomatis. Baca `SKILL.md` dan script terkait dulu.
- Jangan commit credential, `.env` asli, token, private key, atau output build/cache yang tidak perlu.
- Jangan menyentuh folder untracked atau perubahan user yang tidak terkait dengan task.
- Untuk project yang belum dipercaya, gunakan command review, workspace isolation, dan mode ketat jika agent mendukungnya.

## Master Flow Enforcer

- Seluruh agent WAJIB mengikuti alur siklus hidup di .agent/MASTER_FLOW.md dari awal hingga akhir.
- Untuk task berisiko atau instruksi yang menuntut pemikiran mendalam, aktifkan skill deep-thinking-enforcer secara proaktif.
