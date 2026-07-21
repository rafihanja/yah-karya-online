# 🗺️ Alur Berpikir Detektif Bug (Debugging Flowchart)

Gunakan daftar periksa ini saat pikiran buntu menghadapi layar merah.

## Fase 1: Identifikasi (Jangan sentuh kode!)
- [ ] Apakah saya bisa membuat *error* ini muncul lagi? (Tuliskan langkah 1-2-3 nya).
- [ ] Apa pesan error spesifik yang muncul di layar/log? (*Copy-paste* pesan aslinya).
- [ ] Apakah *error* ini selalu terjadi, atau hanya sesekali (Intermiten)?

## Fase 2: Isolasi (Divide and Conquer)
- [ ] Apakah *error* ada di Front-End (Browser) atau Back-End (Server)?
  - *Cek tab Network di browser. Jika API mengembalikan 500, salah server. Jika API mengembalikan 200 tapi UI rusak, salah Front-End.*
- [ ] Mundurkan versi kode (*Git Checkout*) ke versi kemarin. Apakah *error* ini sudah ada sejak kemarin? Jika tidak, *bug* baru saja dibuat hari ini.

## Fase 3: Tracing (Pencarian Akar)
- [ ] Pasang `console.log` atau *Breakpoint* di titik SEBELUM *error* terjadi. Apakah datanya sudah rusak dari sana?
- [ ] Telusuri fungsi mundur ke belakang sampai menemukan titik awal di mana variabel menjadi `undefined` atau `null`.

## Fase 4: Eksekusi & Pembersihan
- [ ] Tulis skenario pengujian (Unit Test) yang secara khusus memicu *error* ini.
- [ ] Perbaiki kodenya sampai tes berwarna hijau (Lulus).
- [ ] Hapus semua `console.log` sisa *debugging*.
