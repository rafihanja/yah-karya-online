# Official Reference Verification Rule

<!-- OFFICIAL_REFERENCE_VERIFICATION -->

Aturan ini berlaku untuk semua agent dan sub-agent yang mengerjakan repository ini.
Daftar sumber kanonis ada di `../official-reference-map.json`; jangan membuat daftar
alternatif yang terpisah atau mengubah sumber tanpa instruksi user.

## Tujuan

Mencegah jawaban teknis yang terlihat yakin tetapi memakai sintaks, API, versi, atau
praktik yang sudah berubah. Sumber dalam map adalah referensi utama yang ditetapkan
user untuk 33 topik teknis di repository ini.

## ALWAYS DO THIS

1. Sebelum task baru, baca `.agent/memory/lessons-learned.md`. Jika topik task cocok
   dengan lesson lama, gunakan koreksi tersebut sebagai constraint tambahan.
2. Cocokkan task dengan `official-reference-map.json`.
3. Jika task menyentuh topik terdaftar dan mengandung sintaks spesifik, API,
   perilaku versi, best practice, security, cloud, deploy, atau fakta yang mungkin
   berubah, buka sumber yang dipetakan melalui web search/fetch runtime sebelum
   menjawab atau mengedit.
4. Untuk framework, library, cloud, security, dan API yang cepat berubah, anggap
   training data bisa basi dan verifikasi lebih dulu.
5. Sebelum delivery, bandingkan draf jawaban atau implementasi dengan sumber yang
   dibaca. Jika bukti belum cukup atau ada gap, tulis persis:
   `ini masih perlu dicek ulang`.
6. Jika user mengoreksi jawaban pada salah satu topik terdaftar, update
   `.agent/memory/lessons-learned.md` dengan kesalahan, koreksi, dan pola pemicu
   sebelum melanjutkan task.
7. Pisahkan bukti lokal, bukti sumber eksternal, dan asumsi. Jangan mengklaim
   sumber sudah dicek jika tool web tidak benar-benar dijalankan.

## NEVER DO THIS

- Jangan menebak syntax/API terbaru dari ingatan saat perilakunya mungkin berubah.
- Jangan memakai blog acak sebagai pengganti sumber yang dipetakan jika sumber utama
  dapat diakses.
- Jangan menunda pencatatan koreksi sampai akhir sesi; correction gate harus lewat
  sebelum pekerjaan teknis berikutnya.
- Jangan menyimpan credential, token, atau data privat di lessons file.
- Jangan menyebut semua 33 sumber di jawaban user jika hanya satu atau dua yang
  relevan; proses ini harus kuat tetapi tidak berisik.

## Alur Operasional

```text
task masuk
  -> baca lessons-learned yang relevan
  -> cocokkan topic/source map
  -> tentukan apakah claim spesifik, current, atau berisiko
  -> search/fetch sumber utama bila wajib
  -> implementasi/jawaban
  -> cross-check sebelum delivery
  -> jika user mengoreksi: update lesson sebelum lanjut
```

## Evidence Gate

Agent tidak boleh menyatakan verifikasi sumber berhasil tanpa bisa menyebut:

1. Topik yang cocok.
2. Sumber dari `official-reference-map.json`.
3. Fakta/API/sintaks yang diperiksa.
4. Dampaknya terhadap jawaban atau patch.
5. Gap yang tersisa, bila ada.

## Sub-Agent Propagation

Saat mendelegasikan task yang menyentuh topik terdaftar, sertakan:

> "Read `.agent/rules/official-reference-verification.md`,
> `.agent/official-reference-map.json`, and relevant entries in
> `.agent/memory/lessons-learned.md`. Use the mapped source before making
> version-sensitive or uncertain claims. If corrected, update lessons before
> continuing. Report the source checked and any remaining gap."

## Validasi

```powershell
node .agent\scripts\validate-agent-skills.mjs
node .agent\scripts\agent-doctor.mjs
node .agent\scripts\export-agent-adapters.mjs --dry-run
```

Expected: seluruh command exit 0 dan validator melaporkan policy referensi lengkap.
