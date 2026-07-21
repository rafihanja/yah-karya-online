# 🗃️ Indexing Strategy & Normalization

*(Dokumen ini merupakan intisari gabungan dari file pedoman lama yang telah di-deprecate)*

## 1. Kapan Harus Menggunakan Index?
Sebuah `INDEX` berfungsi seperti daftar isi pada buku tebal. Ia mempercepat proses baca (`SELECT`), namun memperlambat proses tulis (`INSERT/UPDATE/DELETE`).
- **Wajib Index**: Kolom yang sering muncul di dalam klausa `WHERE` atau `ORDER BY`.
- **Wajib Index**: Semua kolom `Foreign Key` (misal: `user_id`, `company_id`).
- **Haram Index**: Kolom yang memiliki nilai ganda yang sangat umum (misal kolom `gender` berjenis L/P). Index pada kolom *low-cardinality* justru menghabiskan memori tanpa banyak peningkatan kecepatan.

## 2. Normalisasi
- Standar minimum adalah bentuk **3NF (Third Normal Form)** untuk meminimalisasi duplikasi data (tidak ada data yang bergantung transitif).
- Pengecualian (*Denormalization*): Diizinkan HANYA JIKA sistem sedang dioptimasi untuk kecepatan baca ekstrem di mana `JOIN` SQL menjadi terlalu lambat.

## 3. ORM vs Raw Query
- Gunakan ORM (Prisma/Drizzle) untuk kemudahan tipe data dan pengembangan fitur cepat sehari-hari.
- Gunakan Raw Query SQL murni hanya untuk laporan analitik berat yang memanipulasi ratusan ribu baris data.
