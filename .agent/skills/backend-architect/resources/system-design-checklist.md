# 🛡️ Panduan Sistem & Desain Backend

Sebelum menulis satu baris kode pun untuk fitur *backend* skala menengah hingga besar, periksa daftar berikut:

## 1. Skalabilitas & *Statelessness*
- [ ] Apakah API yang Anda buat *Stateless*? (Dapat di-*deploy* di 5 *server* berbeda di balik *Load Balancer* tanpa merusak aliran aplikasi).
- [ ] Apakah penyimpanan *file* / sesi mengandalkan layanan eksternal? (seperti AWS S3 untuk *file*, Redis untuk sesi/cache).

## 2. Keamanan & Pembatasan Beban
- [ ] Apakah fitur ini dilindungi oleh mekanisme *Rate Limiting*? (Mencegah *DDoS* sederhana atau pengikisan data / *scraping*).
- [ ] Apakah data rahasia (*password*, *token*) di-*hash* sebelum menyentuh *database* atau dicetak ke *logger* terminal?

## 3. Asynchrony & Queue
- [ ] Jika fitur ini melibatkan pengiriman Email, manipulasi gambar, atau pemanggilan API lambat ke pihak ketiga, APAKAH Anda sudah memindahkannya ke *Background Job* (RabbitMQ, BullMQ, Kafka) alih-alih memaksa pengguna menunggu proses *loading HTTP*?

## 4. Pelacakan Error (*Observability*)
- [ ] Apakah Anda melempar pesan *error* mentah dari *database* ke pengguna? (TIDAK BOLEH! Ini mengekspos struktur tabel Anda ke peretas). Selalu saring pesan kegagalan.
