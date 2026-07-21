# 🛡️ Pull Request (PR) Elite Checklist

Sebelum menekan tombol "MERGE", pastikan daftar ini terpenuhi:

## 1. Keamanan (Security)
- [ ] Tidak ada kunci rahasia (*Secret/API Key*) yang ter-hardcode.
- [ ] Endpoint baru sudah dilindungi oleh autentikasi (JWT/Session).
- [ ] Data input dari klien (*body/params*) sudah tervalidasi oleh skema (Zod/Joi).

## 2. Kinerja (Performance)
- [ ] Tidak ada pemanggilan API atau *Query Database* di dalam perulangan (Anti N+1).
- [ ] Daftar panjang di-render menggunakan paginasi (*Pagination/Infinite Scroll*).
- [ ] *Image* Docker masih sekecil mungkin (Menggunakan Multi-stage).

## 3. Kebersihan (Clean Code)
- [ ] Tidak ada file/variabel bernama `test1`, `dataFinal`, atau `asdf`.
- [ ] *Console.log* sisa *debugging* telah dibersihkan.
- [ ] Kode logika bisnis berada di `Service`, BUKAN `Controller`.

## 4. Keandalan (Reliability)
- [ ] Skrip pengujian otomatis (Unit Test) lulus warna hijau (*Green*).
- [ ] Kesalahan (*Error*) tidak menyebabkan aplikasi *Crash* (Sudah ditangkap oleh `try/catch`).
