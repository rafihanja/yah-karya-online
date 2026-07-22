---
name: lessons-capture
description: >
  Lessons Capture - disiplin biar pengetahuan numpuk lintas-project (compounding).
  Gunakan di akhir project/fase, saat retrospektif, atau saat ketemu pola/bug
  yang kemungkinan bakal berulang, serta setiap kali user mengoreksi jawaban teknis.
  Catat pelajaran ke .agent/memory/lessons-learned.md, dan kalau pola berulang >= 3x,
  angkat jadi skill baru. Output utama Bahasa Indonesia.
---

# Lessons Capture — Anti-Amnesia Lintas-Project

> **One-liner:** Model AI ga belajar dari kamu. Yang bisa numpuk cuma memori eksternal.
> Skill ini maksa pelajaran tiap project dicatat, dan pola berulang dinaikkan jadi skill.

## Why This Exists

Skill ini menjaga pelajaran lintas-project tetap bisa dipakai ulang. Tanpa pencatatan eksplisit, bug yang sama, keputusan arsitektur yang sama, dan pola validasi yang sama akan ditemukan ulang dari nol di sesi berikutnya. `project-memory` menyimpan konteks satu repo; skill ini menyimpan pola yang layak diwariskan ke repo lain atau dipromosikan menjadi skill baru.

## Kenapa Ini Ada

Model AI itu beku — project ke-100 ga bikin dia lebih pinter dari project ke-1. Satu-satunya
cara pengetahuan "numpuk" adalah lewat memori eksternal yang **ditulis** dan **dibaca ulang**.
`project-memory` nyimpen konteks PER-project. Skill ini nutup celah berikutnya: **pelajaran
LINTAS-project** dan promosi pola berulang jadi kemampuan reusable.

## When to Use

- Di AKHIR setiap project atau fase besar (barengan `self-review-gate` / laporan akhir).
- Saat ketemu bug, gotcha, atau keputusan arsitektur yang kemungkinan berulang di project lain.
- Saat user bilang "retrospektif", "pelajaran", "kenapa kemarin gini", atau review pasca-project.
- Saat user mengoreksi kesalahan agent pada topik di `.agent/official-reference-map.json`
  (hard gate, section 4) atau pada topik lain yang berpotensi berulang (kebijakan
  wajib, section 5).

## ALWAYS DO THIS

### 1. Catat pelajaran di akhir project/fase

Tambahkan entry ke `.agent/memory/lessons-learned.md` dengan format:

```
## YYYY-MM-DD — <nama-project>
**Lesson:** <pelajaran konkret, 1-3 kalimat, actionable>
**Tags:** tag-a, tag-b
**Promote?:** yes | no | maybe
```

Atau pakai helper:
```bash
node .agent/scripts/capture-lesson.mjs --add "<project>" "<lesson>" "<tag1,tag2>"
```

Aturan nulis lesson:
- Konkret dan actionable, bukan basa-basi ("pakai parameterized query buat cegah SQL injection", BUKAN "hati-hati security").
- Sebut konteks: project apa, masalah apa, solusi/aturannya apa.
- Kasih `tags` yang konsisten (mis: `security`, `gsap`, `nextjs`, `deploy`, `governance`) — tag ini yang dipakai deteksi pola berulang.

### 2. Cek pola berulang & promosikan jadi skill

```bash
node .agent/scripts/capture-lesson.mjs --review
```

Kalau satu `tag` muncul **>= 3x**, itu sinyal pola berulang. Pertimbangkan:
- Bikin skill baru di `.agent/skills/<nama>/SKILL.md` yang merangkum pola itu.
- Daftarkan ke manifest + wire ke `active-skills.json` & `skill-router.json`.
- Jalankan `node .agent/scripts/agent-doctor.mjs` buat verifikasi (0 orphan).

### 3. Baca di awal sesi/project baru

Sebelum mulai project sejenis, baca `lessons-learned.md` (filter tag relevan) biar ga ngulang
kesalahan yang sama. Ini melengkapi `project-memory` (yang fokus 1 project).

### 4. Correction Gate - Update Sebelum Lanjut

Jika user mengoreksi agent pada topik yang terdaftar di
`.agent/official-reference-map.json`, agent WAJIB:

1. Hentikan eksekusi teknis berikutnya.
2. Tambahkan entry yang menyebut kesalahan, koreksi yang benar, dan pola pemicunya.
3. Gunakan tag topik yang konsisten ditambah `user-correction`.
4. Jalankan `node .agent/scripts/capture-lesson.mjs --list` untuk memastikan entry
   tersimpan.
5. Baru lanjut memperbaiki jawaban atau kode.

Correction gate ini tidak menunggu akhir fase karena tujuannya mencegah kesalahan
yang sama terulang pada langkah berikutnya.

### 5. Correction Gate — Kesalahan Teknis Agent Sendiri (Bukan Hanya Official-Reference)

Section 4 di atas hanya wajib untuk topik yang terdaftar di
`official-reference-map.json`. Itu meninggalkan celah: kesalahan biasa agent
(bug yang ditulis sendiri, keputusan arsitektur yang salah, asumsi yang meleset)
di luar 33 topik itu tidak punya gate yang sama, sehingga bisa lolos tanpa pernah
tercatat. Untuk menutup celah ini:

Jika user mengoreksi kode, keputusan, atau klaim agent — pada topik APAPUN, bukan
cuma yang terdaftar — dan koreksi itu mengungkap kesalahan yang masuk akal terjadi
lagi di project lain (bukan typo sepele atau salah paham satu-off), agent WAJIB:

1. Tambahkan entry ke `lessons-learned.md` sebelum mengklaim fase/task selesai
   (boleh ditunda sampai akhir fase, TIDAK boleh dilewatkan sepenuhnya).
2. Tag dengan domain yang relevan (`gsap`, `nextjs`, dst) ditambah `self-correction`
   supaya beda dari `user-correction` (yang khusus official-reference).
3. Sebutkan: apa yang salah, kenapa salah, aturan konkret apa yang mencegahnya
   terulang.

Bedanya dengan section 4: section 4 = hard gate + wajib untuk 33 topik terdaftar
(divalidasi otomatis oleh `validate-agent-skills.mjs`). Section 5 ini = wajib
secara kebijakan tapi tidak (belum) divalidasi oleh script — agent tidak boleh
memakai ketiadaan validator otomatis sebagai alasan untuk skip.

## NEVER DO THIS

- JANGAN nulis lesson generik tanpa konteks/aksi ("kode harus bagus").
- JANGAN nyimpen credential/secret di lessons-learned.md.
- JANGAN bikin skill baru dari pola yang baru muncul 1x (over-engineering). Tunggu >= 3x atau jelas reusable.
- JANGAN lupa update manifest + wire kalau bikin skill baru (nanti jadi orphan, ke-flag doctor).
- JANGAN melanjutkan task setelah koreksi user sebelum lesson terkait tersimpan.

## Hubungan dengan Skill Lain

- `project-memory` → memori PER-project (PROJECT_MEMORY.md). Skill ini → memori LINTAS-project.
- `self-review-gate` → di akhir fase, sekalian catat lesson kalau ada yang layak.
- `phased-delivery` → di laporan akhir project, review lessons-learned.
- `mandatory-skill-usage` → kalau pola dipromosikan jadi skill, dia masuk router dan dipakai otomatis.

## Quality Gate

Sebelum nutup project, cek:
- [ ] Ada minimal 1 lesson dicatat (kalau emang ada yang dipelajari).
- [ ] Tag konsisten dengan yang sudah ada.
- [ ] Pola berulang (>= 3x) udah dipertimbangkan buat jadi skill.
- [ ] Ga ada secret di entry.

## Failure Modes

- **Lesson Terlalu Umum:** Entry seperti "kode harus rapi" tidak membantu agent berikutnya. Mitigasi: tulis konteks, pemicu masalah, dan tindakan konkret.
- **Secret Tercatat di Memory:** Token, password, atau URL credential masuk ke lessons dan ikut ter-commit. Mitigasi: catat nama env var saja, lalu jalankan secret scan sebelum commit.
- **Tag Tidak Konsisten:** Satu pola dicatat sebagai `security`, `secure`, dan `sec`, sehingga review pola berulang gagal. Mitigasi: pakai tag yang sudah ada di `.agent/memory/lessons-learned.md`.
- **Skill Prematur:** Pola yang baru muncul sekali langsung dijadikan skill baru, menambah noise library. Mitigasi: tunggu pola >=3x kecuali ada risiko tinggi yang jelas.
- **Manifest Lupa Diupdate:** Skill baru dibuat tapi tidak masuk router/manifest, lalu menjadi orphan. Mitigasi: jalankan `agent-doctor` setelah promosi skill.
- **Correction Gate Terlewat:** Jawaban langsung diperbaiki tetapi pola salah tidak
  dicatat. Mitigasi: update lesson dan verifikasi dengan `capture-lesson --list`
  sebelum melanjutkan.


## Validation

Validation for `lessons-capture`:

1. **Verify lesson log updates:**
   Periksa apakah berkas `.agent/memory/lessons-learned.md` telah diperbarui setelah fase selesai:
   ```bash
   git diff --name-only | grep lessons-learned.md
   ```
2. **Verify helper script functionality:**
   Jalankan script pembantu untuk memeriksa daftar pelajaran:
   ```bash
   node .agent/scripts/capture-lesson.mjs --list
   ```
3. **Review repeated patterns before promotion:**
   Jalankan review tag untuk melihat kandidat skill baru:
   ```bash
   node .agent/scripts/capture-lesson.mjs --review
   ```
4. **Verify doctor check passes:**
   Pastikan tidak ada skill yatim piatu (*orphan skills*) di repositori:
   ```bash
   node .agent/scripts/agent-doctor.mjs
   ```
5. **Verify correction entries before resuming:**
   Setelah user mengoreksi topik terdaftar, pastikan entry baru terlihat:
   ```bash
   node .agent/scripts/capture-lesson.mjs --list
   ```

## Sub-Agent Propagation

Saat mengirim sub-agent untuk retrospektif atau penutupan fase, sertakan instruksi ini:

> "Use `lessons-capture`. Read `.agent/skills/lessons-capture/SKILL.md` first. Record only concrete reusable lessons in `.agent/memory/lessons-learned.md`, avoid secrets, reuse existing tags, run `capture-lesson.mjs --review`, and do not promote a new skill unless the pattern is repeated or clearly high-risk."
