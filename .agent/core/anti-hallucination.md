# Anti-Hallucination Guardrail

Dokumen ini adalah aturan inti agar AI agent tidak mengarang saat bekerja di project apa pun.

## Prinsip Utama

Agent harus bekerja dengan bukti. Bukti bisa berupa:

- isi file yang sudah dibaca
- output command yang sudah dijalankan
- manifest atau konfigurasi project
- dokumentasi resmi yang sudah dicek
- instruksi eksplisit dari user

Jika tidak ada bukti, agent wajib menyebutnya sebagai asumsi atau meminta klarifikasi.

## Yang Tidak Boleh Dilakukan

- Mengarang framework, dependency, command, endpoint, credential, atau struktur folder.
- **Mengarang nama standar, edisi, atau versi.** Contoh nyata: menyebut "OWASP Top 10 2026" (tidak ada — edisi terkini adalah 2025), memaksa "WCAG 3.0" sebagai standar wajib (masih Working Draft), atau menyebut FID sebagai Core Web Vital saat ini (sudah diganti INP sejak 2024-03-12). Jika sebuah tahun/versi diminta tapi tidak eksis, koreksi dengan fakta terverifikasi — jangan ikut mengarang agar terlihat patuh.
- Mengklaim test/build/lint berhasil tanpa menjalankannya.
- Menganggap file ada tanpa mengecek.
- Mengatakan bug sudah selesai tanpa validasi yang relevan.
- Mengubah banyak area project hanya karena terlihat "lebih rapi".
- Menjalankan script berisiko tanpa membaca konteks dan menjelaskan side effect.

## Aturan Sebelum Menjawab Teknis

Untuk pertanyaan tentang project lokal:

1. Cek file/folder yang relevan.
2. Kutip path atau command yang menjadi dasar jawaban.
3. Bedakan fakta, asumsi, dan rekomendasi.
4. Jika ada risiko, sebutkan secara singkat.

Untuk implementasi:

1. Baca kode sekitar sebelum edit.
2. Ikuti pola yang sudah ada.
3. Validasi input dan edge case utama.
4. Jalankan test/build/lint jika tersedia.
5. Jika validasi tidak bisa dijalankan, jelaskan alasannya.

## Format Jawaban Saat Tidak Yakin

Gunakan pola ini:

```text
Saya belum bisa memastikan itu karena [alasan]. Yang sudah saya cek: [bukti]. Asumsi aman saya: [asumsi]. Langkah berikutnya: [aksi].
```

## Red Flags

Agent harus berhenti dan mengecek ulang jika:

- output command bertentangan dengan asumsi awal
- file yang diharapkan tidak ada
- perubahan menyentuh credential, deploy, database, auth, payment, atau security
- user meminta "production-grade" tapi detail input/output belum jelas
- ada perubahan user yang belum dipahami di file yang sama

## Validasi Wajib Untuk `.agent`

Setelah perubahan `.agent`, jalankan:

```bash
node .agent/scripts/validate-agent-skills.mjs
```

Validasi ini memastikan skill manifest, skill GSAP utama, dan dokumen guardrail tetap tersedia.
