# 🚀 Panduan Migrasi Cepat: Tailwind CSS v4

Versi 4 merombak total cara Tailwind beroperasi. Baca ini sebelum melakukan *styling*.

## 1. Zero Configuration (CSS-First)
- **Dulu (v3)**: Anda harus membuka `tailwind.config.js` untuk menambahkan warna atau font khusus.
- **Sekarang (v4)**: File JS dihilangkan. Semuanya didefinisikan langsung di file CSS root menggunakan `@theme`. Cek folder `examples/` untuk polanya.

## 2. Peningkatan Kecepatan (Rust Engine)
- Mesin pembangun (*engine*) kini ditulis ulang menggunakan Rust (Oxide). Proses pembangunan aset CSS instan dan *hot-reload* tanpa jeda.

## 3. Dinamic Utilities (Arbitrary Values)
- Anda masih bisa menggunakan `w-[500px]`, tapi **SANGAT DILARANG** digunakan untuk warna `bg-[#ff0000]`. Jika warna itu muncul lebih dari sekali di desain, masukkan ke dalam *Design Tokens* di `@theme`.

## 4. Hilangnya `@apply` yang Berlebihan
- Meskipun `@apply` masih ada, penggunaannya sangat ditekan. Jika Anda merasa butuh mengekstrak kumpulan *utility* menjadi satu *class*, lebih baik pisahkan elemen tersebut menjadi **Komponen UI** (seperti React Component). 
- *Rule of thumb*: CSS ditujukan untuk token sistem, HTML/JSX ditujukan untuk *utility classes*.
