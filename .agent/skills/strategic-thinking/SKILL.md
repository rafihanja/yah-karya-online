---
name: strategic-thinking
description: >
  Library of 15 named mental models with trigger questions for structured
  reasoning about architecture, product, and engineering decisions. Use when
  evaluating trade-offs, making design decisions, assessing risk, or when
  explicit multi-perspective analysis is needed. Complements deep-thinking-enforcer
  (slow thinking) and expert-reasoning-operator (evidence/risk) with a reusable
  model toolkit.
---

# Strategic Thinking — Mental Model Library

> One-liner: Pilih minimal 2 mental model yang relevan untuk setiap keputusan substantif, sebutkan namanya secara eksplisit, dan gunakan trigger question-nya untuk menggali lebih dalam.

## When to Use

- Saat ada keputusan arsitektur atau desain yang punya beberapa opsi valid.
- Saat mengevaluasi trade-off antara pendekatan A vs B (bukan hanya coding, tapi juga product decision, pricing, scope).
- Saat user bertanya "bagaimana sebaiknya..." atau "mana yang lebih baik...".
- Saat pre-mortem atau risk assessment diperlukan sebelum eksekusi besar.
- Saat task `request:strategy`, `request:architecture`, `request:tradeoff`, `request:decision`, `request:pre-mortem`.
- Saat `arsitek-pikiran` memerlukan analisis lebih dalam sebelum membuat 5-phase plan.

## Why This Exists

`deep-thinking-enforcer` memaksa slow thinking tapi tidak memberi toolkit model yang bisa dipanggil bernama. `expert-reasoning-operator` memaksa evidence ledger dan risk budget tapi tidak punya kerangka untuk *cara berpikir* tentang masalah. Skill ini mengisi gap itu: 15 mental model yang masing-masing punya nama, definisi, trigger question, dan konteks kapan harus dipakai — supaya reasoning agent bukan hanya "terlihat dalam" tapi benar-benar terstruktur.

## ALWAYS DO THIS

- Gunakan **minimal 2 mental model** untuk setiap analisis substantif. Sebutkan namanya secara eksplisit di output.
- Pilih model berdasarkan **trigger question** yang paling relevan dengan situasi, bukan berdasarkan urutan daftar.
- Tunjukkan **jalan pikiran** — bukan hanya kesimpulan akhir. User harus bisa melihat model mana yang menghasilkan insight mana.
- Kalau dua model menghasilkan konklusi yang bertentangan, **tunjukkan ketegangan itu secara eksplisit** — jangan sembunyikan di balik kalimat yang terdengar mulus.
- Tandai eksplisit mana yang **fakta dari evidence lokal**, mana **estimasi berbasis pola**, dan mana **asumsi yang perlu divalidasi**.
- Setiap insight harus bisa diterjemahkan ke **tindakan konkret** — bukan hanya observasi.

## NEVER DO THIS

- Jangan menyebut nama model tanpa benar-benar menggunakannya. Why fails: itu name-dropping, bukan reasoning. Instead: tunjukkan bagaimana model mengubah analisis.
- Jangan pakai lebih dari 4 model dalam satu jawaban. Why fails: diminishing returns, output jadi encer. Instead: pilih 2-4 yang paling leverage.
- Jangan gunakan mental model sebagai pengganti evidence lokal. Why fails: model memberi kerangka, bukan bukti. Instead: model → hipotesis → cek evidence → konklusi.
- Jangan pakai mental model untuk task trivia (rename variable, typo fix). Why fails: overhead tidak proporsional. Instead: simpan untuk keputusan yang benar-benar substantif.

---

## Mental Model Library

### 1. First Principles Thinking

**Definisi:** Urai masalah sampai fakta paling dasar yang tidak bisa dipecah lagi, lalu bangun solusi dari situ — bukan dari asumsi industri atau "cara orang biasa melakukan ini."

**Trigger Question:** *"Kalau saya lupakan cara orang biasa melakukan ini, dari mana saya mulai?"*

**Kapan dipakai:**
- Memilih tech stack: jangan ikut tren, tanyakan "apa constraint sebenarnya dari problem ini?"
- Refactor besar: jangan asumsi arsitektur lama benar, bongkar dari requirement fundamental.
- Product decision: apa yang user benar-benar butuhkan, bukan apa yang kompetitor buat.

**Contoh teknis:**
```
Pertanyaan: "Harusnya pakai Next.js atau vanilla HTML?"
First Principles:
- Fakta dasar: halaman ini statis, tidak ada SSR, tidak ada API route.
- Fakta dasar: user butuh load time < 1 detik di mobile.
- Konklusi: vanilla HTML + minimal JS lebih cocok. Next.js overhead tidak justified.
```

### 2. Second-Order Thinking

**Definisi:** Setiap tindakan memicu tindakan lain, dan seterusnya. Jangan berhenti di efek langsung — ikuti rantai dampaknya.

**Trigger Question:** *"Lalu apa yang terjadi setelah itu terjadi? Dan setelah itu lagi?"*

**Kapan dipakai:**
- Dependency management: menambah library X → bundle size naik → load time turun → conversion turun.
- Architecture decision: memilih monorepo → butuh workspace tooling → onboarding tim lebih lama.
- Feature addition: menambah fitur Y → user expect fitur Z yang melengkapi → scope creep.

**Contoh teknis:**
```
Keputusan: "Tambahkan Redis cache untuk API response."
1st order: Response time turun dari 200ms ke 20ms. ✓
2nd order: Cache invalidation complexity naik. Stale data risk.
3rd order: Butuh monitoring cache hit ratio. Ops burden bertambah.
4th order: Kalau Redis down, fallback ke direct DB? Atau app crash?
Konklusi: Worth it kalau ada fallback strategy. Tanpa fallback, risiko lebih besar dari benefit.
```

### 3. Leverage Thinking

**Definisi:** Cari titik dorong terkecil dengan dampak terbesar. Bukan "apa yang bisa dilakukan" tapi "apa yang kalau berhasil, otomatis menyelesaikan beberapa masalah lain sekaligus."

**Trigger Question:** *"Tindakan apa yang kalau berhasil, otomatis menyelesaikan beberapa masalah lain sekaligus?"*

**Kapan dipakai:**
- Prioritasi sprint: mana task yang unblock task lain?
- Bug triage: fix mana yang resolve paling banyak issue?
- Refactor: perubahan struktural mana yang menyederhanakan banyak file?

**Contoh teknis:**
```
Masalah: 15 component punya duplicated API call logic.
Low leverage: Copy-paste fix ke 15 file.
High leverage: Buat 1 custom hook `useApi()` → semua 15 component otomatis terfix + future component dapat pattern yang sama.
Leverage ratio: 1 hook vs 15 file edits, dan mencegah duplikasi masa depan.
```

### 4. Systems Thinking

**Definisi:** Lihat hubungan dan feedback loop antar bagian, bukan bagian yang berdiri sendiri. Perubahan di satu node mempengaruhi seluruh sistem.

**Trigger Question:** *"Siapa lagi yang terdampak kalau ini dijalankan?"*

**Kapan dipakai:**
- API design: bagaimana perubahan endpoint mempengaruhi semua consumer?
- State management: perubahan di store A bagaimana efeknya ke component B, C, D?
- Team process: kalau ubah branching strategy, siapa yang workflow-nya terganggu?

### 5. Inversion Thinking

**Definisi:** Bayangkan kegagalan total, lalu mundur cari penyebabnya. Lebih mudah menghindari kebodohan daripada mencari kegeniusan.

**Trigger Question:** *"Kalau ini gagal total dalam 6 bulan, apa 3 alasan paling mungkin?"*

**Kapan dipakai:**
- Pre-mortem arsitektur sebelum refactor besar.
- Product launch: kenapa user TIDAK akan pakai produk ini?
- Migration: kenapa migrasi database ini bisa gagal?

**Contoh teknis:**
```
Keputusan: "Migrasi dari REST ke GraphQL."
Inversion — 3 alasan gagal:
1. Tim tidak punya pengalaman GraphQL → learning curve > deadline.
2. Existing REST consumer (mobile app v1) tidak bisa diupdate → harus maintain dual API.
3. N+1 query problem di resolver → performance lebih buruk dari REST.
Mitigasi: mulai dari 1 endpoint non-kritis sebagai pilot.
```

### 6. Behavioral Analysis

**Definisi:** Pahami motivasi dan insentif nyata di balik perilaku, bukan yang diucapkan. Orang jarang bertindak murni rasional — pertimbangkan ego, loss aversion, status sosial, dan kenyamanan.

**Trigger Question:** *"Apa insentif yang sebenarnya menggerakkan orang ini?"*

**Kapan dipakai:**
- User research: kenapa user tidak pakai fitur yang "jelas berguna"?
- Team dynamics: kenapa developer menolak refactor yang "jelas lebih baik"?
- Stakeholder management: kenapa PM terus minta fitur baru padahal tech debt menumpuk?

### 7. Strategic Prioritization (Impact × Ease)

**Definisi:** Pilih berdasarkan dampak dikali kemudahan, bukan yang paling gampang dikerjakan duluan atau yang paling keras teriak.

**Trigger Question:** *"Opsi mana yang effort-nya kecil tapi impact-nya besar?"*

**Kapan dipakai:**
- Bug triage: mana yang user-facing dan fix-nya 1 baris?
- Feature backlog: mana yang unlock revenue dan cuma butuh 1 sprint?
- Technical debt: mana yang memperlambat setiap PR dan fix-nya 1 hari?

### 8. Pattern Recognition

**Definisi:** Kenali pola serupa dari konteks atau industri lain. Masalah yang terasa baru sering sudah punya solusi di domain berbeda.

**Trigger Question:** *"Situasi ini mirip pola apa yang pernah terjadi di tempat lain?"*

**Kapan dipakai:**
- Debugging: "error ini mirip kasus X yang pernah saya temukan..."
- Architecture: "pattern ini mirip dengan bagaimana Netflix menangani..."
- Product: "onboarding problem ini mirip dengan yang dipecahkan oleh..."

### 9. Opportunity Gap Analysis

**Definisi:** Cari celah yang dilewatkan orang lain. Apa yang semua orang di industri/domain ini anggap benar, padahal belum tentu?

**Trigger Question:** *"Apa yang semua orang di industri ini anggap benar, padahal belum tentu?"*

**Kapan dipakai:**
- Architecture: "semua orang pakai microservice untuk scale — tapi kalau scale kita masih monorepo-level?"
- Tooling: "semua orang pakai TypeScript — tapi untuk script internal 50 baris, overhead-nya worth it?"
- Product: "semua kompetitor punya fitur X — tapi apakah user benar-benar butuh?"

### 10. Risk-Reward / Asymmetric Bet

**Definisi:** Evaluasi rasio downside vs upside. Cari taruhan dengan downside kecil tapi upside besar — dan hindari yang sebaliknya.

**Trigger Question:** *"Kalau ini salah, semahal apa? Kalau benar, sebesar apa?"*

**Kapan dipakai:**
- Technology choice: pakai framework baru yang belum mature → kalau berhasil, dev speed naik 2x; kalau gagal, rewrite 2 bulan.
- Feature scope: build fitur A yang butuh 1 minggu → kalau berhasil, 10% conversion lift; kalau gagal, cuma buang 1 minggu.
- Architecture: pakai caching layer → kalau berhasil, response time turun 10x; kalau salah, stale data + debugging complexity.

### 11. Probabilistic Thinking

**Definisi:** Berpikir dalam persentase kemungkinan, bukan biner benar/salah. Dunia nyata adalah distribusi probabilitas, bukan certainty.

**Trigger Question:** *"Seberapa yakin saya dalam persen, dan apa yang bisa mengubah keyakinan itu?"*

**Kapan dipakai:**
- Estimasi: "80% yakin ini bisa selesai dalam 2 sprint, tapi kalau dependency X delay, turun ke 40%."
- Risk assessment: "60% kemungkinan cache invalidation strategy ini work, 40% butuh fallback."
- Decision: "kalau confidence > 70%, lanjut; kalau < 70%, perlu spike/POC dulu."

### 12. Pre-Mortem Analysis

**Definisi:** Sebelum eksekusi, anggap proyek sudah gagal, lalu cari sebabnya. Ini berbeda dari Inversion: Pre-Mortem spesifik ke proyek yang akan dimulai, Inversion bisa untuk keputusan umum.

**Trigger Question:** *"Andaikan 1 tahun lagi ini gagal total, laporan post-mortem-nya bilang apa?"*

**Kapan dipakai:**
- Sebelum refactor besar: "gagal karena scope creep — mulai dari ubah 3 file, akhirnya ubah 50."
- Sebelum launch: "gagal karena onboarding terlalu rumit — user baru tidak tahu harus mulai dari mana."
- Sebelum migrasi: "gagal karena tidak ada rollback plan — data corrupt di production."

### 13. Pareto Principle (80/20)

**Definisi:** Cari 20% aktivitas yang menghasilkan 80% hasil. Ini bukan aturan pasti, tapi heuristik yang sangat berguna untuk prioritasi.

**Trigger Question:** *"Kalau cuma boleh kerjakan 20% dari rencana ini, bagian mana yang tetap menghasilkan sebagian besar hasil?"*

**Kapan dipakai:**
- MVP scope: fitur mana yang 20% tapi menangani 80% use case?
- Performance optimization: optimasi mana yang paling signifikan?
- Code review: file mana yang paling berisiko?

### 14. Constraint Theory (Theory of Constraints)

**Definisi:** Sebuah sistem hanya secepat bottleneck-nya. Perbaikan di luar bottleneck adalah pemborosan.

**Trigger Question:** *"Apa satu hal yang membatasi segalanya di sini?"*

**Kapan dipakai:**
- Performance: API lambat bukan karena kode, tapi karena DB query yang N+1.
- Team velocity: bottleneck bukan di coding, tapi di code review yang hanya 1 orang.
- Build pipeline: build cepat tapi deploy manual 2 jam.

**Contoh teknis:**
```
Observasi: Sprint velocity turun 40% bulan ini.
Constraint analysis:
- Coding speed: tidak berubah (bukan bottleneck).
- Code review: 1 reviewer, queue 3-5 PR, rata-rata tunggu 2 hari. ← BOTTLENECK
- Testing: automated, cepat (bukan bottleneck).
Solusi: tambah 1 reviewer ATAU auto-approve untuk PR < 50 lines dengan passing tests.
```

### 15. OODA Loop (Observe–Orient–Decide–Act)

**Definisi:** Siklus keputusan cepat untuk lingkungan yang berubah cepat. Observasi → Orientasi (interpretasi data) → Keputusan → Aksi → ulangi.

**Trigger Question:** *"Informasi apa yang berubah sejak asumsi terakhir dibuat, dan apakah keputusan perlu di-update?"*

**Kapan dipakai:**
- Incident response: sistem down, perlu observe data terbaru, bukan pakai plan lama.
- Sprint planning: kalau user feedback berubah mid-sprint, apakah prioritas perlu di-rotate?
- Production monitoring: kalau metric berubah drastis, apakah ada yang perlu di-rollback?

---

## Examples

### Good — Architecture decision dengan 2 model

```markdown
🧠 **STRATEGIC THINKING**

**Keputusan:** Pilih antara monorepo vs polyrepo untuk 3 microservice.

**Model 1: Second-Order Thinking**
- 1st order: Monorepo → shared code lebih mudah, single CI/CD.
- 2nd order: Butuh workspace tooling (Turborepo/Nx) → learning curve untuk tim.
- 3rd order: Kalau tim grow > 10 orang, merge conflict frequency naik → butuh CODEOWNERS.
- Konklusi: Monorepo bagus untuk sekarang (3 service, 2 dev), tapi perlu re-evaluate di 5+ service.

**Model 2: Constraint Theory**
- Bottleneck saat ini: bukan di repo structure, tapi di deployment pipeline yang manual.
- Solusi monorepo tidak menyelesaikan bottleneck aktual.
- Prioritas: automasi deploy dulu, baru pikirkan repo structure.

**Konklusi:** Tetap monorepo sekarang (effort rendah, cocok untuk tim kecil), tapi fokus utama ke automasi deploy karena itu bottleneck sesungguhnya.
```

### Bad — Name-dropping tanpa substance

```markdown
Saya menggunakan First Principles dan Systems Thinking untuk menganalisis masalah ini.
Pertama, mari kita lihat dari first principles. Masalahnya adalah...
```

Why this fails: nama model disebut tapi tidak ada trigger question yang dijawab, tidak ada jalan pikiran yang terlihat, tidak ada bukti bahwa model mengubah analisis.

### Edge Case — Dua model konflik

```markdown
🧠 **STRATEGIC THINKING**

**Keputusan:** Apakah rewrite service auth dari Express ke Fastify?

**Model 1: Leverage Thinking** → Kalau berhasil, 3x throughput, latency turun 60%.
**Model 2: Pre-Mortem** → Kalau gagal, auth service down 2 hari, semua dependent service terdampak.

**Ketegangan:** Leverage tinggi, tapi risk juga tinggi karena auth adalah critical path.

**Resolusi:** Jalankan dual-run — Fastify handle 10% traffic dulu selama 2 minggu. Kalau stabil, ramp ke 100%. Ini mengubah asymmetric bet: downside jadi kecil (10% traffic risk), upside tetap besar.
```

Why this passes: dua model menghasilkan konflik, ketegangan ditunjukkan eksplisit, dan resolusi menggabungkan insight dari keduanya.

---

## Failure Modes

- **Model shopping:** Memilih model yang mendukung konklusi yang sudah dibuat, bukan menggunakan model untuk menemukan konklusi. Mitigasi: tulis trigger question dulu, baru pilih model.
- **Analysis paralysis:** Terlalu banyak model diterapkan ke masalah kecil. Mitigasi: maksimal 2 model untuk task biasa, 3-4 untuk keputusan besar.
- **Name-dropping tanpa substance:** Menyebut nama model tanpa menunjukkan jalan pikiran. Mitigasi: tunjukkan bagaimana model mengubah analisis — kalau dihapus, apakah konklusinya berubah?
- **Mengabaikan ketegangan antar model:** Dua model menghasilkan konklusi berbeda tapi agent memilih satu dan mengabaikan yang lain. Mitigasi: tunjukkan ketegangan, cari resolusi yang menggabungkan keduanya.
- **Menggunakan model untuk justifikasi, bukan discovery:** Agent sudah punya jawaban lalu mencari model yang cocok untuk mendukungnya, bukan menggunakan model untuk menemukan jawaban baru. Mitigasi: gunakan model SEBELUM menyimpulkan — kalau urutan dibalik, model hanya jadi hiasan retoris.

## Validation

Cara memverifikasi skill ini benar-benar dipakai:

1. **Route terdaftar:**
   ```powershell
   Select-String -Path .agent\skill-router.json -Pattern "strategic-thinking"
   ```
   Expected: minimal 1 match.

2. **Skill file ada dan valid:**
   ```powershell
   Test-Path .agent\skills\strategic-thinking\SKILL.md
   ```
   Expected: `True`.

3. **Audit tetap bersih:**
   ```powershell
   node .agent\scripts\validate-agent-skills.mjs
   node .agent\scripts\agent-doctor.mjs
   ```
   Expected: kedua command exit 0.

4. **Output memuat minimal 1 nama model** yang benar-benar digunakan (bukan hanya disebut).

## Sub-Agent Propagation

Saat dispatch sub-agent untuk task yang butuh analisis keputusan, sertakan:

> "Use `strategic-thinking`. Read `.agent/skills/strategic-thinking/SKILL.md`. Select minimal 2 mental models based on trigger questions. Show reasoning path explicitly — which model produced which insight. If models conflict, show the tension and resolve it."

## Related

- `deep-thinking-enforcer` — memaksa slow thinking, edge case enumeration. Skill ini memberi toolkit model yang bisa digunakan dalam slow thinking tersebut.
- `expert-reasoning-operator` — evidence ledger, risk budget, alternatives. Skill ini memberi kerangka berpikir untuk memilih alternatif mana yang dibandingkan.
- `arsitek-pikiran` — 5-phase strategic planning. Skill ini bisa digunakan sebelum `arsitek-pikiran` untuk analisis lebih dalam sebelum phase planning dimulai.
- `reasoning-modes` — mode operasi (Brutal, Red Team, War) yang mengubah *cara* model diterapkan.
- `.agent/rules/max-capability-protocol.md` — rule portable untuk mode kemampuan maksimal.
