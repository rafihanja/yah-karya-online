# ⏱️ Panduan Profiling Performa

Jangan main tebak-tebakan saat mencari tahu kenapa web lambat. Gunakan alat bedah (*surgical tools*)!

## 1. Chrome DevTools (Tab Performance)
Tekan `Ctrl+Shift+I`, pindah ke tab **Performance**.
1. Klik tombol **Bulat Hitam** (Record).
2. Lakukan aktivitas yang patah-patah/laggy (misal: *scroll* panjang atau klik tombol yang lambat).
3. Klik **Stop**.
4. Perhatikan balok kuning bergaris merah berlabel **Long Task**. Ini artinya JavaScript mengambil kendali CPU lebih dari 50ms, membuat layar membeku sementara. Itulah target optimasi Anda.

## 2. Lighthouse Audit
Pindah ke tab **Lighthouse** dan jalankan laporan untuk "Performance".
*Metrics* yang harus dikejar hijau (skor > 90):
- **LCP (Largest Contentful Paint)**: Seberapa cepat konten terbesar dirender (Target: < 2.5 detik).
- **INP (Interaction to Next Paint)**: Seberapa cepat tombol merespons saat diklik.

## 3. Bundle Analyzer
Gunakan `webpack-bundle-analyzer` atau alat serupa (`@next/bundle-analyzer` di Next.js) untuk memvisualisasikan ukuran library Anda. Singkirkan yang berwarna ungu raksasa jika bisa digantikan kode *vanilla*.
