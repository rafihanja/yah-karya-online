# MASTER FLOW: Agent Lifecycle & Skill Orchestration

Dokumen ini mendefinisikan alur wajib (flow dari awal) kapan menggunakan seluruh skill di `.agent/skills/`. Seluruh AI Agent WAJIB mengikuti siklus ini untuk setiap interaksi, memastikan pola pikir mendalam, berurutan, dan terstruktur maksimal.

## ZERO-WASTE CONTRACT

<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->
<!-- FAIL_CLOSED_GOVERNANCE -->
<!-- MANDATORY_SKILL_INDEX -->

Setiap skill yang dipakai WAJIB menghasilkan minimal satu dari empat hal berikut:

1. **Keputusan**: memilih arah kerja, scope, skill teknis, atau validasi yang tepat.
2. **Bukti**: file/command/output yang benar-benar diperiksa dan bisa diaudit ulang.
3. **Proteksi**: mencegah regresi, aksi destruktif, kebocoran secret, over-scope, atau asumsi liar.
4. **Artefak**: patch, brief, phase plan, test result, memory update, atau laporan risiko.

Jika sebuah skill tidak mengubah keputusan, tidak menambah bukti, tidak memberi proteksi, dan tidak menghasilkan artefak, skill itu dianggap **sia-sia untuk task tersebut** dan tidak boleh diklaim sebagai "dipakai". Agent boleh membaca skill governance wajib, tetapi hanya mencantumkan skill sebagai applied jika aturan skill itu benar-benar memengaruhi output.

### Skill Ledger Wajib

Untuk task substantif, agent harus bisa menjelaskan ledger internal ini sebelum deliver:

| Skill | Fungsi di task ini | Evidence/Output |
|---|---|---|
| `session-boot` | Membuka laporan berbasis bukti | header berisi file, validasi, risiko |
| `project-memory` | Mengambil konteks historis | keputusan/constraint dari `PROJECT_MEMORY.md` |
| `expert-reasoning-operator` | Always-on untuk setiap task substantif; mengunci scope, evidence ledger, risk budget, dan validasi tanpa menunggu user bilang "1000x lipat" | scope statement, opsi yang dibandingkan, risiko konkret, command validasi |
| `[skill teknis]` | Mengarahkan implementasi | aturan/anti-pattern yang diterapkan |
| `self-review-gate` | Menahan output cacat | command validasi + risiko sisa |

Ledger tidak harus selalu ditampilkan penuh ke user, tetapi isi final answer harus mencerminkan tiga hal: **skill yang benar-benar dipakai, file/bukti yang dicek, dan validasi nyata**.

## PHASE 0: PRE-FLIGHT (Initialization)
Setiap sesi atau pesan baru WAJIB melewati gate ini sebelum menulis kode apa pun.

<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->
<!-- FAIL_CLOSED_GOVERNANCE -->

### Every-Output Disclosure Gate

- Setiap output agent harus menyebut `Skill dipakai:` sebelum konten lain.
- Output substantif memakai full `I AM CRAZY` header.
- Output trivial/status/klarifikasi/error memakai minimal brand line `🔥 I AM CRAZY`.
- Tidak ada output yang exempt dari disclosure ini.

### Fail-Closed Violation Gate

- Pelanggaran pre-flight, routing, skill read, approval gate, disclosure, atau required validation adalah hard stop.
- Agent WAJIB menulis `GOVERNANCE VIOLATION DETECTED`, menyebut gate yang terlewat, menarik klaim yang belum terverifikasi, lalu pulih dari checkpoint terakhir yang terbukti.
- Agent tidak boleh self-bypass karena task kecil, prompt lengkap, urgensi, keterbatasan waktu/token, atau klaim agent sebelumnya.
- Completion gate tetap tertutup sampai recovery dan validation rerun lulus.

### Mandatory Pre-Flight Bundle (Tidak Boleh Di-skip)

Sebelum task substantif apa pun, agent WAJIB membaca bundle ini secara berurutan:

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
11. `.agent/skills/INDEX.md` — katalog SEMUA skill; scan penuh, jangan cuma andalkan match keyword router
12. `.agent/active-skills.json`
13. `.agent/official-reference-map.json`
14. `.agent/memory/lessons-learned.md`

Setelah bundle di atas dibaca, agent WAJIB men-scan katalog penuh `.agent/skills/INDEX.md` (semua skill repo ada di sana, tidak ada yang disembunyikan) lalu membaca `SKILL.md` teknis yang match dari router/index sebelum menulis kode, review, deployment, atau konten substantif. Kalau INDEX.md stale/hilang, jalankan `node .agent/scripts/generate-skill-index.mjs` dulu.

### Output Pre-Flight

1. **`session-boot`**: Wajib dijalankan PERTAMA KALI di awal respons. Output berguna: daftar skill applied, file yang benar-benar diperiksa, validasi yang sudah/akan dijalankan, dan risiko sisa.
2. **`mandatory-skill-usage`**: Menghasilkan keputusan routing. Agent WAJIB mencocokkan task ke `skill-router.json` dan `active-skills.json`; jangan menebak dari nama skill.
3. **`project-memory`**: Menghasilkan konteks historis. Agent WAJIB membaca `PROJECT_MEMORY.md`, lalu mengambil constraint yang relevan saja. Jangan menyalin seluruh memori ke jawaban kalau tidak diperlukan.
4. **`deep-thinking-enforcer`**: Menghasilkan risk model. Agent WAJIB memetakan akar masalah, minimal 3 risiko konkret, mitigasi, dan validation command untuk task substantif.
5. **`expert-reasoning-operator`**: Untuk setiap task substantif, agent WAJIB membuat scope statement, evidence ledger, risk budget, alternatif saat relevan, dan validation plan. Frasa seperti "1000x", "1000x lipat", atau "1000 kali lipat" hanya mempertegas kewajiban ini, bukan syarat aktivasi.
6. **Zero-waste gate**: Sebelum lanjut ke planning/execution, agent harus tahu jawaban dari: "Skill mana yang mengubah keputusan saya? Bukti apa yang sudah saya lihat? Validasi apa yang akan membuktikan hasilnya?"
<!-- OFFICIAL_REFERENCE_VERIFICATION -->

7. **Official-reference gate**: Cocokkan task dengan
   `.agent/official-reference-map.json`. Jika cocok, gunakan
   `official-reference-verifier`, baca lesson relevan, dan tentukan apakah web
   verification wajib sebelum menjawab.

## PHASE 1: UNDERSTANDING & PLANNING
Jika ini adalah permintaan fitur baru, bug rumit, atau perombakan arsitektur:

1. **`prompt-amplifier`**: Jika prompt user pendek/ambigu, agent WAJIB bertanya balik untuk memperjelas kebutuhan. Pertanyaan harus decision-changing; jangan tanya hal yang bisa ditemukan dari repo.
2. **`arsitek-pikiran`** & **`prd-architect-pro`**: Gunakan hanya jika scope butuh blueprint/PRD. Output wajib berupa keputusan arsitektur dan acceptance criteria, bukan esai.
3. **`phased-delivery`**: Agent WAJIB memecah pekerjaan menjadi fase kecil jika scope besar. Tiap fase harus punya output terverifikasi, command validasi, dan stop condition.

## PHASE 2: EXECUTION & ENGINEERING
Pilih skill teknis spesifik berdasarkan router — jumlah pasti selalu berubah, cek
total terkini di `.agent/skills/INDEX.md` (jangan hardcode angka di sini lagi).

1. **Routing Framework & Language**: Contoh `react-nextjs-development`, `gsap-core`, `python-expert`, `laravel-expert`, dll. Gunakan sesuai stack yang terdeteksi dari file/command.
2. **`auto-pro-standards`**: Saat ngoding, otomatis injeksi best practices untuk performa, SEO, aksesibilitas, dan keamanan. Output harus terlihat sebagai kode/validasi, bukan hanya klaim.
3. **`frontend-dev-guidelines` / `backend-dev-guidelines`**: Terapkan guideline sesuai area kerja dan sebutkan anti-pattern yang dihindari jika relevan.
4. **`systematic-debugging`**: Jika menemui error, JANGAN asal tebak. Output minimal: gejala, hipotesis, bukti, fix, dan re-test.
5. **`official-reference-verifier`**: Untuk topik terdaftar, verifikasi
   syntax/API/version/best-practice yang uncertain atau cepat berubah dengan sumber
   map. Jangan mengandalkan training data saja.

## PHASE 3: QUALITY ASSURANCE & GATEKEEPING
Sebelum mengklaim sebuah tugas "selesai", agent WAJIB melewati check ini.

1. **`self-review-gate`**: Audit internal mandiri. Output wajib berupa command validasi, hasil, dan risiko sisa. Kalau gagal, perbaiki dulu.
2. **`code-reviewer`** / **`security-audit`**: Jalankan lensa kritis pada kode yang baru ditulis jika blast radius menyangkut data, auth, API, atau shared behavior.
3. **`baseline-ui`** / **`accessibility-compliance-accessibility-audit`**: Verifikasi estetika dan inklusivitas UI jika ada perubahan visual.
4. **Source cross-check**: Sebelum delivery, bandingkan jawaban/patch dengan sumber
   yang dibaca. Jika gap masih ada, nyatakan `ini masih perlu dicek ulang`.

## PHASE 4: WRAP UP & KNOWLEDGE COMPOUNDING
Setelah tugas (atau satu fase) benar-benar tuntas disetujui user:

1. **`lessons-capture`**: Catat pelajaran hanya kalau ada pola reusable, bug yang mungkin berulang, atau keputusan lintas-project. Jangan membuat lesson generik.
   Koreksi user pada topik official-reference adalah pengecualian: lesson wajib
   diperbarui segera sebelum task dilanjutkan.
2. **Update `PROJECT_MEMORY.md`**: Rekam status terkini jika ada perubahan project/fase yang akan berguna di sesi berikutnya.
3. **`skill-excellence-ratchet`** & **`skill-upgrader`** (Jika diminta atau menyentuh skill): Upgrade library skill berdasarkan bukti, lalu jalankan ratchet validation.

---
**ATURAN EMAS:** 
*Master Flow* ini bukanlah saran, melainkan **HUKUM**. Semua agen harus "berpikir mendalam secara maksimal", memecah masalah, dan TIDAK PERNAH memberikan output instan yang berpotensi merusak codebase.
