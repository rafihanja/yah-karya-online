---
name: skill-upgrader
description: >
  Meta-skill untuk meng-upgrade skill library dari Good ke Excellent secara sistematis.
  Gunakan saat ada perintah "upgrade skill", "perbaiki skill", "maksimalin skill",
  atau saat quality audit menunjukkan skill masih di level Good.
  Referensi struktur: addyosmani/agent-skills (MIT license).
---

# Skill Upgrader — Mesin Peng-Upgrade Skill ke Excellent

> **One-liner:** Skill ini bertugas KHUSUS untuk menaikkan skill dari Good → Excellent secara sistematis, dengan referensi dari repo open-source berlisensi aman.

## Why This Exists

Dari 145 skill di library, 111 masih "Good" (punya isi yang cukup tapi belum punya section ALWAYS DO / NEVER DO / When to Use yang lengkap). Tanpa skill khusus ini, upgrade dilakukan secara ad-hoc tanpa standar dan tanpa prioritas. Skill ini memastikan proses upgrade berjalan **sistematis, terukur, dan berkualitas**.

## When to Use

- Saat user meminta "upgrade skill", "perbaiki skill", "maksimalin skill", atau "naikin kualitas".
- Saat `node .agent/scripts/audit-skill-quality.mjs` menunjukkan ada skill yang masih "Good".
- Saat ingin menambahkan section yang hilang ke skill yang sudah ada.
- Saat mereview skill library secara berkala.

## ALWAYS DO THIS

### 1. Diagnosa Dulu, Baru Operasi

Sebelum menyentuh skill apa pun, jalankan:

```bash
# Lihat status keseluruhan
node .agent/scripts/audit-skill-quality.mjs

# Lihat skill mana yang perlu di-upgrade, diurutkan berdasarkan prioritas
node .agent/scripts/list-good-skills.mjs --priority

# Lihat detail satu skill
node .agent/scripts/upgrade-skill-batch.mjs --skill <nama-skill>

# Generate template upgrade untuk satu skill
node .agent/scripts/upgrade-skill-batch.mjs --template <nama-skill>
```

### 2. Urutan Prioritas Upgrade (WAJIB diikuti)

Upgrade skill secara bertahap, dari yang paling kritis:

| Prioritas | Kategori | Contoh Skill | Alasan |
|-----------|----------|-------------|--------|
| 🔴 1 | Governance | session-boot, self-review-gate | Fondasi — kalau ini jelek, semua skill lain ikut rusak |
| 🟠 2 | Security | auth-patterns, env-fortress | Keamanan tidak boleh setengah-setengah |
| 🟡 3 | GSAP (Core Project) | gsap-timeline, gsap-scrolltrigger | Ini skill utama project aktif kita |
| 🟢 4 | Frontend | react-best-practices, nextjs-patterns | Sering dipakai di project |
| 🔵 5 | Quality | code-reviewer, verification | Memastikan output berkualitas |
| ⚪ 6 | Other | ai-engineer, database-admin | Upgrade saat ada waktu |

### 3. Format Upgrade yang Benar (Section Wajib)

Setiap skill yang di-upgrade WAJIB menambahkan section berikut (jika belum ada):

#### `## When to Use`
- Minimal 3 poin kondisi spesifik (bukan generik).
- Sebutkan kata kunci trigger yang biasa dipakai user.
- Contoh BAIK: "Saat membuat animasi scroll-driven dengan GSAP ScrollTrigger."
- Contoh JELEK: "Saat membuat animasi." (terlalu generik!)

#### `## ALWAYS DO THIS`
- Minimal 3 aturan actionable.
- Setiap aturan harus punya contoh kode atau contoh konkret.
- Sebutkan referensi resmi jika ada (link dokumentasi/repo).
- Contoh BAIK: "**Selalu register plugin:** `gsap.registerPlugin(ScrollTrigger)` harus dipanggil sebelum membuat instance ScrollTrigger mana pun."
- Contoh JELEK: "Selalu tulis kode yang bagus." (ini sampah, bukan aturan!)

#### `## NEVER DO THIS`
- Minimal 2 larangan tegas.
- Setiap larangan harus jelaskan KENAPA berbahaya.
- Contoh BAIK: "JANGAN animasi `width`/`height` — ini menyebabkan layout thrashing. Gunakan `transform: scaleX/scaleY` sebagai gantinya."
- Contoh JELEK: "Jangan bikin bug." (ini bukan larangan, ini harapan!)

### 4. Cari Referensi Eksternal yang Aman

Untuk setiap skill yang di-upgrade:

1. **Cek dokumentasi resmi** library/framework yang bersangkutan.
2. **Cek repo open-source berlisensi aman** (MIT/Apache/BSD/ISC/CC0):
   - `addyosmani/agent-skills` — MIT, contoh skill engineering kelas dunia.
   - `ciembor/agent-rules-books` — MIT, aturan universal Clean Code/DDD.
   - Dokumentasi resmi GSAP: https://gsap.com/docs/
   - Dokumentasi resmi React: https://react.dev
   - Dokumentasi resmi Next.js: https://nextjs.org/docs
   - OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
3. **ADAPTASI** ke konvensi repo ini, JANGAN copy-paste mentah.
4. **SEBUTKAN** URL sumber di SKILL.md jika meminjam pendekatan non-trivial.

### 5. Validasi Setelah Upgrade

Setelah mengupgrade skill, WAJIB jalankan:

```bash
# Pastikan doctor tetap hijau
node .agent/scripts/agent-doctor.mjs

# Pastikan Excellent naik, Weak/Empty tetap 0
node .agent/scripts/update-skill-baseline.mjs
```

Kalau ratchet menolak (Excellent turun) → ada yang salah, perbaiki dulu.

### 6. Batch Processing — Upgrade Efisien

Untuk upgrade massal, kerjakan dalam batch 5-10 skill per sesi:

1. Ambil 5 skill prioritas tertinggi yang belum Excellent.
2. Baca SKILL.md masing-masing.
3. Tambahkan section yang hilang (When to Use / ALWAYS / NEVER).
4. Jalankan audit + baseline update.
5. Catat progress di artifact atau task.md.

## NEVER DO THIS

- JANGAN upgrade skill tanpa membaca isinya terlebih dahulu — pahami konteksnya.
- JANGAN menulis section ALWAYS/NEVER yang generik tanpa contoh kode (ini yang bikin skill tetap "Good" bukan "Excellent").
- JANGAN copy-paste dari sumber berlisensi GPL/AGPL/proprietary.
- JANGAN mengubah logika inti skill yang sudah ada — hanya TAMBAHKAN section yang hilang.
- JANGAN upgrade lebih dari 10 skill sekaligus tanpa validasi — risiko regresi tinggi.
- JANGAN skip validasi (`agent-doctor` + `update-skill-baseline.mjs`) setelah batch upgrade.
- JANGAN bilang "sudah diupgrade" tanpa bukti bahwa angka Excellent di audit benar-benar naik.

## Failure Modes

- **Upgrade Kosmetik:** Agent hanya menambah heading tanpa aturan actionable, sehingga skill lolos bentuk tetapi tidak membantu tugas nyata. Mitigasi: setiap tambahan harus mengubah keputusan, validasi, atau anti-pattern.
- **Regresi Marker Hook:** Skill terlihat baik di audit umum tetapi gagal pre-commit karena marker literal kurang. Mitigasi: jalankan commit hook atau `deep-skill-audit` sebelum mengklaim selesai.
- **Copy-Paste Berlisensi Salah:** Contoh dari repo GPL/proprietary dimasukkan ke SKILL.md. Mitigasi: gunakan sumber resmi atau lisensi aman, lalu adaptasi dengan kata sendiri.
- **Batch Terlalu Besar:** Puluhan skill diedit sekaligus dan sulit mengisolasi file yang merusak hook. Mitigasi: batch 5-10 skill dan commit scoped.
- **Validation Filler:** Menambahkan `npm run build` ke skill non-code hanya untuk menambah jumlah langkah. Mitigasi: validasi harus relevan dengan skill library, manifest, audit, atau usage proof.

## Hubungan dengan Skill Lain

- `skill-excellence-ratchet` → Menetapkan aturan bahwa kualitas hanya boleh naik. Skill ini adalah PELAKSANA aturan tersebut.
- `self-review-gate` → Setelah upgrade, jalankan self-review untuk memastikan tidak ada regresi.
- `lessons-capture` → Catat pola upgrade yang berhasil sebagai lesson untuk batch berikutnya.

## Referensi Eksternal (Lisensi Aman)

| Repo / Sumber | Lisensi | Apa yang Dipelajari |
|---------------|---------|---------------------|
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Struktur SKILL.md kelas dunia: 5-axis review, anti-rationalization tables, verification gates |
| [ciembor/agent-rules-books](https://github.com/ciembor/agent-rules-books) | MIT | Aturan universal Clean Code dan DDD untuk AI agent |
| [GSAP Official Docs](https://gsap.com/docs/) | - | Sumber kebenaran untuk semua skill GSAP |
| [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/) | CC-BY-SA 4.0 | Standar keamanan untuk skill security |
| [React Official Docs](https://react.dev) | CC-BY 4.0 | Standar React untuk skill frontend |


## Validation

Validation for `skill-upgrader`:

1. **Verify doctor check passes:**
   Jalankan script dokter untuk memastikan repositori bebas dari error:
   ```bash
   node .agent/scripts/agent-doctor.mjs
   ```
2. **Verify skill format compliance:**
   Pindai seluruh skill menggunakan script audit otomatis untuk mendeteksi gap:
   ```bash
   node .agent/scripts/deep-skill-audit.mjs
   ```
3. **Verify baseline quality metrics:**
   Jalankan update baseline untuk memverifikasi peningkatan jumlah skill berstatus Excellent:
   ```bash
   node .agent/scripts/update-skill-baseline.mjs
   ```
4. **Verify staged skill changes only include intended files:**
   Pastikan commit upgrade tidak membawa artefak debug atau proyek lain:
   ```bash
   git diff --cached --name-status
   ```

## Sub-Agent Propagation

Saat mengirim sub-agent untuk upgrade skill, sertakan instruksi ini:

> "Use `skill-upgrader`. Read `.agent/skills/skill-upgrader/SKILL.md` before editing. Upgrade only the assigned skill files, add non-generic ALWAYS/NEVER/Failure/Validation/Sub-Agent sections, avoid unsafe license copying, and validate with agent doctor, deep skill audit, baseline update, and staged diff review."
