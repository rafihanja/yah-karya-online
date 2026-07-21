# 🚀 SEO & Core Web Vitals Checklist

Jangan pernah *deploy* ke produksi sebelum semua kotak ini dicentang!

## 1. Tag Dasar & Semantik
- [ ] **Ya**: Terdapat tepat SATU tag `<h1>` per halaman.
- [ ] **Ya**: Meta Title antara 50-60 karakter.
- [ ] **Ya**: Meta Description antara 150-160 karakter.
- [ ] **Ya**: Layout dikonstruksi menggunakan tag `<main>`, `<article>`, `<nav>`, dll.

## 2. Core Web Vitals (Kecepatan & UX)
- [ ] **LCP (Largest Contentful Paint)**: Gambar terbesar di layar awal di-*preload* (`<link rel="preload">`) dan TIDAK menggunakan `loading="lazy"`.
- [ ] **CLS (Cumulative Layout Shift)**: Semua gambar (`<img>`) memiliki atribut `width` dan `height` eksplisit agar *layout* tidak bergeser saat gambar dimuat.
- [ ] **INP (Interaction to Next Paint)** — Core Web Vital sejak 12 Mar 2024, menggantikan FID. Target "Good" < 200ms. Tidak ada pemblokiran *main thread* oleh eksekusi JavaScript yang terlalu berat.

## 3. Aksesibilitas (A11y) yang Mempengaruhi SEO
- [ ] **Ya**: Semua `<img>` memiliki atribut `alt`.
- [ ] **Ya**: Semua link `<a>` memiliki teks jangkar (*anchor text*) yang deskriptif. JANGAN gunakan teks seperti "Klik di sini".
- [ ] **Ya**: Rasio kontras warna teks dan latar belakang mematuhi standar WCAG (mudah dibaca).
