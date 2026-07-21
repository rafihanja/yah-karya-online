# Project Memory — GSAP Creative Coding Monorepo

> File ini ditulis otomatis oleh AI. JANGAN dihapus.
> Fungsinya: Menjaga kesinambungan memori dan konteks proyek lintas sesi di repositori `d:\gsap`.
> Terakhir diupdate: 2026-07-20T21:19:00+07:00

---

## 10. Pilar 6: AutoApply-Stealth Hub (`/apply-bot`) — FASE 5 SELESAI (100% MVP COMPLETE)
- **Deskripsi**: Aplikasi web localhost berbasis Next.js 15, React 19, TypeScript, SQLite, dan Puppeteer untuk mengotomatiskan pencarian lowongan kerja secara semi-otomatis di berbagai platform (LinkedIn, Jobstreet, Indeed) dengan CV yang disesuaikan secara dinamis oleh AI (ATS-friendly).
- **PRD**: Dokumen spesifikasi resmi tersimpan di [apply-bot/PRD.md](file:///d:/gsap/apply-bot/PRD.md).
- **Status Terkini**:
  - **Fase 1 (Profile & CV Engine)**: **100% Selesai & Terverifikasi**.
    - Next.js 15/16 boilerplate diinisialisasi dan diuji lolos `npm run build`.
    - CV engine berhasil membaca berkas dasar [ats-cv.html](file:///d:/gsap/portfolio-rafih/ats-cv.html).
    - API route `/api/cv/generate-pdf` berhasil meluncurkan Puppeteer headless browser.
    - Dashboard editor visual premium (glassmorphism) terpasang di localhost.
  - **Fase 2 (Multi-Platform Finder & SQLite)**: **100% Selesai & Terverifikasi**.
    - Inisialisasi SQLite lokal (`apply-bot/database.sqlite`) dengan tabel `jobs` dan `cv_variations`.
    - Integrasi scraper Puppeteer untuk LinkedIn Guest API dan Jobstreet.
    - Ditambahkan `serverExternalPackages: ["sqlite3"]` pada `next.config.ts`.
    - Ditambahkan mode simulasi dan fallback database otomatis.
  - **Fase 3 (AI Resume Tailor & Gemini API)**: **100% Selesai & Terverifikasi**.
    - Mengintegrasikan SDK `@google/generative-ai` dengan model `gemini-2.5-flash` menggunakan structured JSON output.
    - Membangun API `/api/cv/tailor` untuk penyesuaian summary dinamis (menghubungkan logika Hukum Syariah dengan logika koding frontend) dan menyimpan variasi ke SQLite.
    - Menambahkan modal perbandingan summary Original vs. Tailored dan cincin persentase skor ATS di UI.
  - **Fase 4 (Application Draft Manager & Tracker)**: **100% Selesai & Terverifikasi**.
    - Menambahkan kolom `cover_letter` (TEXT) ke tabel `cv_variations` dengan mekanisme migrasi `ALTER TABLE` otomatis yang aman di `lib/db.ts`.
    - Memperluas API `/api/cv/tailor` agar otomatis memformulasikan surat lamaran kustom 3 paragraf buatan Gemini.
    - Membangun API `/api/drafts` (GET/POST) untuk memanipulasi draf kustomisasi langsung dari SQLite.
    - Merombak UI Jobs Board dengan tombol **"Review Draft (AI)"** untuk mengedit teks summary, tag keahlian dinamis, surat lamaran kustom, dan memperbarui status pipeline lamaran kerja (`Found` -> `Tailored` -> `Draft Ready` -> `Applied` -> `Interview` -> `Rejected`).
    - Tombol "Terapkan ke Pratinjau" berhasil mengupdate template A4 iframe secara instan untuk diunduh sebagai PDF.
  - **Fase 5 (Stealth Application Deliverer)**: **100% Selesai & Terverifikasi**.
    - Membangun API `/api/submit` untuk memicu generasi PDF CV kustom baru dengan teks summary dan core competencies yang dinamis dari basis data.
    - Mengintegrasikan koneksi otomatis ke browser Chrome lokal pengguna via Chrome Remote Debugging di port `9222`.
    - Mengotomatiskan pembukaan tab baru berisi halaman lamaran kerja dan mengklik tombol Apply.
    - Menampilkan panel status di UI modal draf yang berisi petunjuk konfigurasi debugging port 9222, tombol salin perintah eksekusi Chrome, dan tautan unduhan PDF kustom langsung sebagai opsi pengiriman manual.
    - Memperbarui status pelacakan lamaran di basis data SQLite lokal secara otomatis ke status `Applied`.

## 9. Pilar 5: MicroStudio (`/microstudio`) — FASE 0 SELESAI
- **Deskripsi**: Aplikasi web localhost ("pabrik produksi" aset microstock) berbasis Next.js 15, SQLite, dan TypeScript untuk memproduksi aset (SVG/Raster/Video), mengelola metadata UMR universal, dan mengekspor CSV legal 4 platform (Shutterstock, Adobe Stock, Pond5, Vecteezy).
- **Masterplan**: Dokumen blueprint resmi tersimpan di [microstudio-masterplan.md](file:///d:/gsap/microstudio-masterplan.md).
- **Status Terkini**:
  - **Fase 0 (Setup & Fondasi App)**: **100% Selesai & Terverifikasi**.
  - **Fase 1A (M2 Prompt Studio & Compliance)**: **100% Selesai & Terverifikasi** (T1–T4).
  - **Fase 1B (M3 Produksi Kode SVG & Live Preview Canvas)**: **100% Selesai & Terverifikasi** (T5–T8).
  - **Fase 1C (M4 Metadata Engine & Multi-Platform CSV Exporter)**: **100% Selesai & Terverifikasi** (T9–T13).
  - **Fase 1D (GenWHITE Auto-Pilot Engine & Advanced Preset Suite)**: **100% Selesai & Terverifikasi** (T14–T17).
  - **Fase 2 (Motion Studio Pro - Video Module Integration)**: **100% Selesai & Terverifikasi** (Fase 1–3).
    - Memindahkan pembuat video offline 60/120 FPS murni ke Next.js (`/motion`).
    - Menghubungkan AI Code Generator dengan fallback provider pool (Groq, Gemini, GitHub Models).
    - Mengintegrasikan renderer langsung ke database SQLite & Metadata Engine (menghasilkan metadata UMR khusus video secara dinamis dan redirect ke editor metadata).
  - 22+ Premium Art Style Presets (`lib/style-presets.ts`): Monoline, Flat Vector, Isometric, BOLD Icon, Glossy/Matte 3D, Watercolor, Silhouette, dll.
  - Mode SET & Mode ACTIVITY Engine (`lib/mode-engine.ts`): Mode bundle grid objek & pose variasi kegiatan karakter.
  - Solid Background Selector: Solid White (`#FFFFFF`), Green Screen (`#00FF00`), Transparent Vector, & Custom HEX.
  - Auto-Pilot Batch Dashboard UI (`/autopilot` & `lib/autopilot-service.ts`): Antrean otomatis batch objek multi-line, auto-generate SVG, auto-audit QC, & auto-export CSV 4 Platform.
  - Unit test `tests/task14-autopilot.test.mjs` (29/29 pass total) & `tsc` typecheck (0 error) terverifikasi.
  - **🎉 FASE 1 MVP + GENWHITE AUTO-PILOT ENGINE + MOTION STUDIO PRO FULLY COMPLETED!**


## 1. Ringkasan Ekosistem Monorepo
Repositori ini adalah workspace pengembangan kreatif (creative coding) milik **Rafi Hanja** yang berfokus pada visualisasi spasial, manipulasi SVG, dan orkestrasi animasi berkinerja tinggi menggunakan **GSAP (GreenSock Animation Platform)** dan **Lenis Scroll**.

Monorepo ini menampung dua pilar proyek utama:
1. **Pilar 1: The Parallax Masterpiece (`/parallax-sawah`)**
   - Animasi parallax horizontal-vertikal kontinu yang menceritakan perjalanan karakter melintasi 3 Dimensi: Sawah (Sepeda) $\rightarrow$ Hutan Misterius (Depth Tunnel 3D) $\rightarrow$ Samudra/Laut (Vertical deep-dive dengan diver & fauna laut).
   - Menggunakan generator Python di root (`build_*.py`) sebagai asset pipeline untuk merender penempatan objek laut secara dinamis ke berkas HTML.
2. **Pilar 2: Interactive Benchmarks (`/tes`)**
   - Halaman uji coba mandiri untuk membandingkan kemampuan logika dan UI/UX model-model AI (Claude vs Gemini).
   - Memuat landing page e-commerce premium "Veloce" (dengan konfigurator warna dan audio synth) dan stepper interaktif (`stepper.html` dengan Undo/Redo timeline GSAP).

---

## 2. Struktur Repositori & File Penting
```
d:\gsap
├── .agent/                    # Konfigurasi tata tertib & skill khusus AI
├── apply-bot/                 # Folder Pilar 6 (AutoApply-Stealth Hub)
│   ├── app/                   # Next.js pages & API routes
│   ├── components/            # React UI components
│   ├── lib/                   # Utility helpers (CV reader)
│   └── PRD.md                 # Dokumen spesifikasi fase
├── parallax-sawah/            # Folder Pilar 1 (Parallax Utama)
│   ├── assets_3d/             # Aset SVG & PNG hasil pemrosesan Python
│   ├── index.html             # Halaman utama penggabungan 3 dimensi
│   └── ocean.html             # File pengujian dimensi samudra
├── portfolio-rafih/           # Folder Pilar 3 (Portofolio Rafih - ats-cv.html base)
├── tes/                       # Folder Pilar 2 (Benchmarking AI)
│   ├── claude-sonnet-4-6/     # Halaman landing page mewah buatan Claude Sonnet
│   └── gemini-3-5-flash high/ # Landing page interaktif & Stepper Undo/Redo buatan Flash High
├── build_color_final.py       # Generator HTML samudra penuh warna (Python)
├── png_to_svg.py              # Script penyederhana siluet PNG menjadi SVG path (Python)
├── finger_blur.py             # Script pendeteksi jari (Peace) & blur otomatis (Python)
└── PROJECT_MEMORY.md          # File Memori Tunggal (Root)
```

---

## 3. Keputusan Teknis & Arsitektur Utama
- **Zero Regression Rule:** Dilarang merusak koordinat scroll dan transisi sawah/hutan yang sudah berjalan stabil di `parallax-sawah/index.html`.
- **GSAP Animation Separation:** Untuk mencegah tabrakan animasi (*clash transform*), properti posisi/translasi dari keyframe CSS (seperti `.anim-hover` atau `.anim-swim`) harus diterapkan pada elemen *wrapper div*, sedangkan properti transform statis (seperti `scaleX` flip atau `rotate` arah hadap) diterapkan langsung pada tag `img` di dalamnya.
- **Portabilitas Script Python:** Semua script generator di root wajib menggunakan *relative path* (`os.path.dirname`) agar portabel dan bisa dijalankan langsung di environment mana pun tanpa hardcoded path lokal.
- **Rancangan Dimensi 4 (Galaksi):** 
  - Transisi: Wormhole white flash / portal silau putih saat meninggalkan laut.
  - Alur Kamera: Meluncur naik vertikal (Vertical Ascend) dari atmosfer Bumi ke antariksa dalam.
  - Karakter: Astronot melayang lambat (zero-gravity), rotasi tubuh 360° dinamis terikat scroll, menghadap ke atas.
  - Kecepatan: Warp speed effect (bintang memanjang) saat scroll cepat.
  - Aset & Posisi:
    - Latar Awal: Lengkungan atmosfer Bumi menjauh di bagian bawah layar.
    - Sabuk Asteroid: Menyebar bebas di layar untuk efek depth parallax (karakter melayang di antara mereka).
    - Planet Utama: Gaya semi-realistis 2.5D dengan shading halus.
    - Satelit/Probe: Satelit buatan (ISS) di awal dekat Bumi, Voyager probe di bagian luar angkasa dalam.
    - Black Hole: Di tengah perjalanan (efek distorsi & hisapan gravitasi terhadap bintang).
    - Rasi Bintang: Garis rasi zodiak tipis di latar belakang, dengan Easter Egg rasi bintang lucu berbentuk Kucing.
    - Jejak Cahaya: Debu kosmik berkelap-kelip warna neon teal/purple di belakang astronot.
  - Tinggi Scroll: Tambahan tinggi 6000px (Total scroll dari 11000px ke 17000px).
  - Performa: Canvas partikel bintang untuk background (kerapatan dinamis makin padat di atas), DOM untuk planet resolusi tinggi.
  - Audio: Ditunda.

---

## 4. Progress Status & Milestone
- [x] **Pilar 1 (Parallax):** Penggabungan Sawah $\rightarrow$ Hutan $\rightarrow$ Laut selesai. Visualisasi samudera penuh warna sukses diintegrasikan.
- [x] **Pilar 2 (Benchmarking):** Audit visual di browser lokal selesai. Gemini 3.5 Flash High dikunci sebagai model andalan.
- [x] **Optimasi Performa:** GSAP ScrollTrigger digabungkan menjadi master timeline (obs turun dari 47 ke 8), dan keyframe transform clash diselesaikan.
- [x] **Automated Testing & CI/CD:** Membuat pipeline Playwright `test_parallax.py` dan alur GitHub Actions CI/CD `.github/workflows/parallax-ci.yml`.
- [x] **Optimasi Performa Lanjutan:** Migrasi partikel padat (marine snow) di laut dari CSS/DOM ke Canvas/WebGL untuk mencegah penurunan FPS di peranti berspesifikasi rendah.
- [x] **Dimensi 4 (Galaksi 3D ke 2D Zoom & Perbaikan Kompatibilitas GPU):** 
  - Merefaktor transisi spaceTl dari koordinat transform 3D Z-axis (`translate3d`) ke representasi **2D scale zoom** dan rotasi 2D untuk kompatibilitas penuh dengan sistem/browser yang mematikan akselerasi GPU perangkat keras (menghilangkan rendering crash black screen).
  - Memperbaiki bug nesting HTML parah di mana `#universe-galaxy` bersarang di dalam `#universe-ocean` karena kurangnya tag penutup `</div>` untuk `.scroll-wrapper`, `#universe-laut`, dan `#universe-ocean`. Masalah ini menyebabkan seluruh galaksi memudar menjadi hitam/hilang ketika Ocean disembunyikan di scroll Y >= 12000px.
  - Memindahkan default style `opacity: 0` milik `#universe-ocean` ke dalam berkas `style.css` agar aman saat override inline dihapus oleh scroll listener.
  - **Penyempurnaan Tahap 3 (Zona Aman & GPU Fix):** Mengeliminasi `backdrop-filter` pada overlay dan memigrasikannya ke filter CSS planet langsung untuk memperbaiki bug layar abu-abu Chrome. Mengatur batas aman koordinat (`vw`/`vh`) pada ISS, Saturnus, Jupiter, dan membatasi skala Lubang Hitam menjadi `2.0` untuk mencegah cacat visual terpotong (*clipping*). Ketinggian HUD kini naik dinamis dari `0 km` sejak transisi `11000px`.
  - **Pengayaan Estetika Galaksi (Anti-Sepi):** Menambahkan 4 fitur visual baru di ruang angkasa: awan nebula berwarna ungu-cyan (`.nebula-bg`) dengan rotasi lambat, efek hujan meteor/bintang jatuh (`shootingStars`) interaktif pada canvas, aset Teleskop Luar Angkasa James Webb (JWST) yang melayang megah di atas Saturnus, dan sebuah kunci inggris melayang berputar (`.lost-wrench`) sebagai easter egg detail di dekat astronot.
  - [x] **Pilar 2 (Benchmarking):** Membuat berkas prompt benchmark super kompleks `tes/quantum_test_prompt.md` untuk menguji model-model AI lainnya pada dashboard Quantum Circuit Simulator & Audio-Visualizer.
  - [x] **Pilar 2 (Benchmarking):** Gemini 3.1 Pro (High) telah menyelesaikan dan men-generate single-file `tes/gemini-3-1-pro-high/index.html` Cybernetic Quantum Circuit Simulator.
  - [x] **Pilar 2 (Benchmarking):** Gemini 3.5 Flash (High) telah menyelesaikan dan men-generate single-file `tes/gemini-3-5-flash high/index.html` Cybernetic Quantum Circuit Simulator.
  - [x] **Pilar 2 (Benchmarking):** Melakukan audit komparatif mendalam antara Gemini 3.5 Flash (High) vs Gemini 3.1 Pro (High) dan menyimpannya di `tes/quantum_benchmark_audit.md`.
  - [x] **Revert Mobile Scaling & Aktifkan Landscape Warning:** Mengembalikan eksperimen Cover scaling ke mode default Contain scaling (Math.min) agar layout, proporsi, HUD, dan batas potong visual kembali normal 100% seperti semula. Mengaktifkan kembali media query warning `#landscape-warning` untuk memaksa layar berotasi ke mode Landscape pada perangkat mobile.
  - [x] **Resolusi SVG Seams & Transisi Ringan (Cover Mode):** Menggunakan kembali Cover scaling mode atas permintaan user. Memperbaiki bug garis-garis halus transparan vertikal (hairlines) pada ubin SVG Sawah menggunakan `shape-rendering: crispEdges` di CSS. Memangkas durasi transisi antar-dimensi (crossfade) dari 1000px ke 200px scroll (Sawah $\rightarrow$ Hutan: 3400px-3600px, Hutan $\rightarrow$ Ocean: 7400px-7600px, Ocean $\rightarrow$ Galaxy: 11400px-11600px) serta menyelaraskan pemicu scroll animasinya untuk mereduksi beban rendering layer SVG ganda di GPU dan mengeliminasi visual freeze/crash.
  - [x] **Pilar 2 (Benchmarking) - 3D City Experience:** Membangun simulasi kota 3D prosedural performa tinggi menggunakan InstancedMesh (~10 draw calls), lengkap dengan inersia drone kamera (WASD + mouse look), tinggi bergradasi alami, pendar jendela berpendar dinamis, aliran lalu lintas, bintang gemerlap (twinkling starfield), menu dropdown kendali waktu (Day, Sunset, Night, Sunrise), perbaikan bug scope AmbientLight, penghapusan mesh matahari/bulan visual, serta penambahan 560 lampu jalan instanced yang memproyeksikan kerucut cahaya transparan ke aspal untuk vibes jalanan malam yang dramatis dan realistis.
  - [x] **Pilar 2 (Benchmarking) - Skripsi Keuangan PT Japfa (2015-2025):** Menyelesaikan revisi total skripsi kuantitatif untuk PT Japfa Comfeed Indonesia Tbk dengan variabel QR, NPM, dan ETO. Melakukan OLS regresi linier berganda nyata dan mengisi Bab II, III, IV, dan V secara komprehensif di berkas `BISMILLAH YA REVISI MODS terbaru hari ini_REVISI_TOTAL.docx`.
  - [x] **Pilar 2 (Benchmarking) - Skripsi Keuangan & Fiqih Muamalah PT Japfa / Ameliya:** Dokumen skripsi Ameliya (`skripsi amel hoaam.docx` yang merupakan hasil revisi terbaru) telah diselesaikan 100% dari Fase 0 s.d Fase 6:
    - **Fase 0 (Footnotes Bab I):** Perbaikan format dan typo (Subairi, Siah Khosi'ah, Abdul Helim, Kemenag).
    - **Fase 1 (Bab II Sub-bab A):** Penomoran konsep umum, pembersihan lafal/tata letak Hadis lafal Bukhari, pembatasan 3x sitasi, sitasi penuh di awal Bab II.
    - **Fase 2 (Bab II Sub-bab B):** Restrukturisasi rukun & syarat, perbaikan kutipan 2022-2023, perbaikan tautan ID footnote 43/44/45.
    - **Fase 3 (Bab II Sub-bab C):** Penggabungan Mekanisme Operasional dan Berakhirnya Gadai menjadi Sub-bab C, pemindahan posisi paragraf agar menyatu, pemformatan list a-e & penjelasan, dan substitusi rujukan. (Fase 3 SELESAI).
    - **Fase 4 (Bab II Sub-bab D):** Penyesuaian nama sub-bab D menjadi Pemanfaatan Barang Gadai (Marhun) menurut Ulama Mazhab, struktur penomoran 1-4 untuk masing-masing mazhab, pelarasan layout manual (Double Spacing, left=851 dxa, firstLine=720 dxa), dan penggantian rujukan Wahbah az-Zuhaili dengan Imam Mustofa & Ismail Nawawi. (Fase 4 SELESAI).
    - **Fase 5 (Bab II Sub-bab E - Gadai Sawah):** Menambahkan Sub-bab E baru berisi 3 paragraf teoretis gadai sawah (rahn al-ardh) dan alternatif akad ijarah/muzara'ah beserta 3 catatan kaki akademik baru (Ismail Nawawi, Imam Mustofa, Hendi Suhendi) tepat sebelum page break BAB III. (Fase 5 SELESAI).
    - **Fase 6 (Otomasi Italic & Pembersihan Redaksional):** Menjalankan otomatisasi pemiringan (italicization) istilah-istilah Arab/asing (seperti *rahn*, *murtahin*, *rahin*, *marhun*, *tabarru'*, *qardh*, *ijarah*, *muzara'ah*, *fiqih*, *muamalah*, *hadis*, *ijma'*, *syariat*, *riba*, dll.) di seluruh 57 paragraf BAB II (Sub-bab A s.d E) secara aman tanpa merusak footnote atau data layout lainnya. (Fase 6 SELESAI).
  - [x] **Pilar 7 (Python Live Blur):** Membuat file `finger_blur.py` untuk mendeteksi pose tanda peace/V dan secara dinamis mengaburkan tampilan live video webcam menggunakan OpenCV dan MediaPipe Hands.
    - *Update 2026-07-20*: Menambahkan mekanisme fallback inisialisasi kamera (memprioritaskan CAP_DSHOW), memutakhirkan logika deteksi pose V/peace menjadi berbasis jarak (rotation-invariant), menurunkan ambang batas deteksi MediaPipe menjadi 0.5 (menaikkan sensitivitas deteksi tangan), melunakkan intensitas blur ke kernel 35x35, serta mengimplementasikan otomatisasi pengunduhan lagu 'Foto Kita Blur' oleh Sal Priadi dari YouTube sebagai file audio `.m4a` secara asinkron menggunakan pustaka `yt-dlp` tanpa perlu *post-processing* eksternal (ffmpeg), lalu memutarnya secara otomatis menggunakan Windows MCI API.
  - **Pedoman Penulisan Skripsi & Akademik Banten:**
  - **Penempatan Catatan Kaki (Footnote):** Penanda catatan kaki tidak boleh diletakkan secara generik/seragam di akhir paragraf. Penanda harus diletakkan secara presisi langsung di akhir frasa, istilah, atau kutipan langsung yang dirujuk (meskipun berada di tengah kalimat atau sebelum tanda baca akhir paragraf) agar gaya penulisan tidak terlihat kaku/otomatisasi AI.


---

## 5. Instruksi Pemulihan Konteks untuk Sesi Berikutnya
- Gunakan model **Gemini 3.5 Flash (High)** sebagai andalan koding.
- Pastikan setiap ada perubahan pada asset generator Python, jalankan script terkait (misal `python build_color_final.py`) untuk memvalidasi perubahan di browser secara instan.
- Pipeline testing Playwright otomatis dapat dipicu kapan saja dengan perintah: `python test_parallax.py` atau `node .agent/scripts/self-review-validator.mjs`.
- **Codex CLI (@openai/codex):** Telah diinstal secara global dan dikonfigurasi menggunakan FreeModel API (`api.freemodel.dev`) di direktori `C:\Users\infinix\.codex` dengan model `gpt-5.5` dan mode `apikey`.
- **Claude Code CLI (@anthropic-ai/claude-code):** Telah diinstal secara global dan dikonfigurasi menggunakan FreeModel API (`cc.freemodel.dev`) di direktori `C:\Users\infinix\.claude\settings.json` dengan API Key bantuan.

---

## 6. Skill Library Revolution — COMPLETED (2026-06-29)
- **Progress**: **100% Selesai (0 Issues)**.
- **Audit Deep-Skill**: Terverifikasi bersih dengan **0 total issues** melalui skrip `deep-skill-audit.mjs` terhadap seluruh 151 skill yang terpindai.

---

## 7. Pilar 3: Portofolio Rafih (`/portfolio-rafih`) — FASE 1-5 SELESAI
- **Deskripsi**: Web portofolio statis interaktif dengan visual premium (Vanilla JS, GSAP, Three.js WebGL background shader, dan Web Audio API).
- **Keputusan Teknis**:
  - **SEO & Structured Data**: Metadata lengkap, Robots, Sitemap.xml, dan JSON-LD Person Schema terpasang bersih.
  - **Anti-Pattern Cleaned**: Progress bar persentase diganti dengan daftar klasifikasi keahlian (Expertise Groups) minimalis-modern.
  - **Performance Mode**: Tombol sakelar ikon petir mengaktifkan/menonaktifkan rendering WebGL Three.js untuk menghemat daya baterai dan penggunaan CPU.
  - **Efek Suara Sci-Fi**: Synthesizer audio web native yang dipicu saat menu navigasi atau kartu proyek disorot/diklik mouse.
  - **3D Card Hover Tilt**: Seluruh kartu proyek memiliki kemiringan spasial 3D dinamis menggunakan GSAP transform.
  - **Scramble Code Matrix**: Kartu Proyek ke-3 (YT Shorts Bot) memiliki visual biner bergaya peretas yang teracak menggunakan interval dynamic.
  - **Pop-up Modal Detail (Fase 4)**: Dialog overlay glassmorphism ungu elektrik yang memuat case study proyek (Tantangan, Solusi, Fitur, dan Tautan Kode/Live) lengkap dengan dwi-bahasa (ID/EN) dan penguncian scroll Lenis.
  - **Cyber-Aesthetic & Neon glows (Fase 5)**: Ditambahkan background grid matrix, CRT scanline, ornamen bracket sudut, cursor spark trails menggunakan Canvas API, dan border kartu proyek SVG yang ter-draw dinamis saat di-hover.
  - **Premium Canvas Background Upgrade (Hybrid WebGL/2D)**: Mengintegrasikan Three.js WebGL (dengan shader noise 3D kosmik nebula) dan Canvas 2D (untuk partikel interaktif magnetis dengan garis konstelasi) yang disinkronkan dengan scroll velocity (Lenis) dan cursor position.

---

## 8. Pilar 4: Motion Studio Pro (`/motion-renderer`)
- **Deskripsi**: Aplikasi berbasis Canvas API interaktif yang memproses kompilasi kode animasi secara dinamis dan merekamnya menjadi video WebM (VP9 60FPS). Dilengkapi dengan panel editor CodeMirror dan asisten AI Prompt Builder.
- **Keputusan Teknis**:
  - **Custom Searchable Select**: Mengganti select native browser dengan daftar popover glassmorphism (`backdrop-filter`) untuk menyingkirkan kesan AI-slop.
  - **Zero-Shift Stepper**: Opsi scenes diganti menjadi numeric stepper (1 - 50 scene) kompak dengan validasi boundaries agar layout tidak bergeser saat interaksi.
  - **Premium Toast Overlay**: Mengeliminasi seluruh popup dialog native `alert()` browser dengan floating toast notification yang bersinar bergaya glassmorphic.
  - **Master Prompt Compiler**: Mengembangkan generator prompt cerdas (`compileMasterPrompt`) yang menyisipkan pembagian durasi per scene secara matematis, visual warna HSL, pembatasan Math.min, dan fungsi easing kustom sehingga model target AI menghasilkan kode canvas yang menakjubkan.
  - **Clean Header Navigation**: Menghilangkan tombol navigasi berlebih di bar atas, menyisakan hanya tombol *Setelan API* agar fokus antarmuka tetap bersih.
  - **DOMContentLoaded Timing Safety**: Melakukan inisialisasi default tombol resolusi saat dokumen siap untuk mencegah null selector runtime crash.
  - **Visual Concept Briefs Panel**: Menambahkan panel kapsul info visual dinamis di bawah dropdown tema (`💡 Konsep Visual`) dan gaya (`🎨 Estetika Gaya`) yang menampilkan rangkuman konsep visual dari basis data presets.js yang telah diperluas hingga **80+ pilihan premium**.
  - **Two-Way Synchronization**: Menghubungkan parameter input Left Column (AI Prompt Builder) dan Right Column (Preview & Export Config) secara reaktif (perubahan durasi, aspek rasio, dan FPS langsung tersinkronisasi dua arah).
  - **Frame-by-Frame WebCodecs Exporter (WebM & MP4)**: Meninggalkan perekaman real-time `MediaRecorder` yang rentan lag dan ketidaksesuaian framerate/durasi. Memigrasikan ekspor WebM ke VideoEncoder (VP9) offline dengan pustaka `webm-muxer` sehingga baik format WebM maupun MP4 berjalan secara presisi frame-demi-frame dengan konstanta framerate (FPS) dan durasi (detik) yang matematis-sempurna.
  - **Success Export Dialog Overlay**: Menghentikan proses pengunduhan langsung secara otomatis setelah ekspor selesai. Menggantinya dengan jendela modal `#renderOverlay` dwi-kondisi (active rendering vs complete state) lengkap dengan informasi format/ukuran file, tombol "Unduh Hasil Ekspor", dan tombol penutup manual untuk revokasi memori objek URL secara andal.
  - **Premium UI Preview Indicators**: Menambahkan label visual resolusi internal aktif (misalnya `1920x1080`) dan sinkronisasi label FPS di bar preview atas.
  - **100x Upgraded Master Prompt (2-Step Interactive Flow)**: Memperkuat instruksi prompt ke model AI dengan format alur interaktif 2-Step (Langkah 1: Pembuatan 10 Konsep Visual komersial, Langkah 2: Kode Canvas 2D murni responsif). Menyertakan aturan layout dinamis berdasarkan aspek rasio (16:9 landscape vs 9:16 portrait stack) dan panduan formula matematika harmonik (`Math.sin`/`Math.cos`) untuk menjamin looping yang benar-benar mulus (*seamless*).
  - **Premium Presets Expansion**: Memperluas basis data preset (`presets.js`) menjadi **140+ tema** dan **90+ gaya visual** yang masing-masing dikelompokkan ke dalam 9 kategori utama lengkap dengan deskripsi storyboard *brief* dinamis.
  - **Interactive Multi-line Error Screen**: Mengganti pelapor eror standar dengan overlay glassmorphic merah gelap yang responsif (`minS`), lengkap dengan ikon warning besar ⚠️, pemisah baris otomatis (*text wrapping*) untuk pesan eror yang panjang, dan teks anjuran perbaikan terarah.
  - **Copyable Text Error Overlay**: Menambahkan overlay HTML `#errorOverlay` yang melayang di atas preview kanvas saat terjadi runtime crash. Menyediakan text block `<pre>` berselektibilitas penuh (`select-text`) serta tombol "Salin Eror" bawaan yang memicu helper `copyErrorMessage()` dan toast sukses untuk memudahkan penyalinan stack trace.
  - **E2E Polling Test Refactor**: Mengganti penundaan durasi statis `time.sleep(1.5)` di `test_parallax.py` dengan fungsi asinkron polling cerdas `assert_opacity_eventually` (batas waktu 4.0 detik) untuk mengeliminasi kegagalan pengujian (*flakiness*) di lingkungan pengujian yang memiliki beban CPU/thread tinggi.
  - **Mp4Muxer Codec Mismatch Resolution & 4K Export**: Memperbaiki bug di mana rendering format MP4 tidak berjalan dengan mengoreksi parameter `video.codec` menjadi `'avc'` generic dan `fastStart` ke `'in-memory'` (diperlukan oleh `mp4-muxer` v5). Menambahkan dukungan penuh untuk resolusi **4K (3840x2160)** pada antarmuka preview dan penanganan dimensi kanvas agar hasil ekspor video loop memiliki nilai jual komersial premium yang tinggi untuk microstock.
  - **Anti-Monotony Prompt Compiler & Microstock Presets**: Mengganti fallback storyboard offline yang sebelumnya monoton (`Intro/Core/Outro`) menjadi generator lokal berbasis act, role, camera behavior, layout archetype, motion verb, dan transition untuk mendukung hingga **50 scene** tanpa repetisi dangkal. Prompt online API kini memakai brief terstruktur, kontrak anti-monoton, sanitasi input, `maxOutputTokens/max_tokens: 8192`, dan aturan kode final **600+ baris jika model sanggup** atau tetap padat/non-placeholder jika model lebih kecil. `presets.js` ditambah kategori tema **Microstock Commercial Sellers** dan gaya **Microstock Seller Styles** agar pilihan tema/gaya lebih nyambung untuk Adobe Stock, Shutterstock, Pond5, Storyblocks, dan Vecteezy.
  - **E-Commerce Playful Flat Alerts Generation**: Men-generate visual code Canvas 2D untuk notifikasi promo belanja di `motion-renderer/hasil generate kode taro sini woi agent.md`. Mendukung 6 scene (Success, Warning, Error, Multi-Feed, Progress, Loop Return) dengan custom easings (`easeOutElastic`, `easeOutBounce`, `easeOutBack`), transisi globalAlpha blending, confettis bergradasi acak-deterministik, siber HUD borders, dan flat shadow offset non-blur (anti GPU leak).
  - **Perbaikan Overlap Teks & Ikon**: Mengoreksi pergeseran koordinat horizontal (`textX`) dan menyempurnakan proporsi `iconBoxSize` serta lebar `drawProgressBar` pada `drawSingleCard` dan `drawCascadeCards` di berkas `hasil generate kode taro sini woi agent.md`. Ini melenyapkan tabrakan teks visual (overlap/nabrak) pada seluruh scene notifikasi belanja.
  - **Auto-Appended Microstock Metadata CSV**: Membuat dan memelihara file spreadsheet `motion-renderer/shutterstock_content_upload.csv` dengan kolom pemetaan Shutterstock (`Filename`, `Description`, `Keywords`, `Categories`, `Editorial`, `Mature content`, `illustration`). Setiap agen pada sesi berikutnya **WAJIB** secara otomatis menambahkan data baris video baru ke dalam file CSV ini setiap kali selesai men-generate kode visual baru di `hasil generate kode taro sini woi agent.md` agar data siap pakai untuk pengunggahan massal (*bulk upload*).
  - **Ivory Monolith Generation**: Men-generate visual code Canvas 2D untuk Konsep 1 (Ivory Monolith: High-Contrast Glassmorphic Drift) di `motion-renderer/hasil generate kode taro sini woi agent.md` dengan 4 scene (Introduction, Expansion, Contrast, Reconnection) yang terikat waktu loop 15s seamless, serta mengupdate `shutterstock_content_upload.csv`.
  - **Stock Pipeline Phase 1 Execution (Dual Stock CSV & Tracker)**: Membuat spesifikasi [STOCK_PIPELINE_PRD.md](file:///d:/gsap/STOCK_PIPELINE_PRD.md) resmi, mengimplementasikan modul Dual CSV Exporter di `motion-renderer/renderer.js` & `index.html` (`exportAdobeStockCSV()` & `exportShutterstockCSV()`), serta membuat struktur basis data pelacakan aset `stock_tracker.json` dengan audit 5 aset awal yang accepted di Shutterstock.
  - **Stock Pipeline Phase 2 Execution (Market Radar Panel)**: Menambahkan tombol `📡 Market Radar` di Navbar `motion-renderer/index.html` dan modal popup `#marketRadarModal` berisi 5 Niche Komersial Laris (E-Commerce, Tech/HUD, Corporate/Finance, Social Media, Abstract Drift) dengan sistem 1-Klik auto-fill Tema, Gaya Visual, Durasi, dan 35 Keywords komersial.
  - **Stock Pipeline Phase 3 Execution (Visual Stock Tracker UI)**: Menambahkan tombol `📊 Stock Tracker` di Navbar `motion-renderer/index.html` dan modal popup `#stockTrackerModal` berisi badge metrik utama (Total Aset, Approved, Rejection Rate, Est. Sales), tabel interaktif pelacakan status (`Generated ➔ Uploaded ➔ Approved ➔ Rejected ➔ Sold`), dan sinkronisasi otomatis ke `localStorage` browser.
  - **Stock Pipeline Phase 4 Execution (Batch Production Manager)**: Menambahkan tombol `🚀 BATCH RENDER (5 Variasi Unik)` di `motion-renderer/index.html` dan fungsi `startBatchRender(count)` di `renderer.js` untuk meregistrasikan batch variasi video terkurasi secara otomatis ke `stock_tracker.json` tanpa risiko *similar content rejection*.
  - **Textless & Clean Modular Prompting Rule (Aturan Baru)**: Seluruh agen AI yang men-generate kode Canvas 2D di repositori ini **WAJIB** mematuhi 2 aturan emas: (1) **TANPA TEKS HARDCODED (`ctx.fillText` dilarang untuk huruf/kata)** — gunakan bentuk geometris, badge, ikon, atau negative space agar pembeli stock bisa menaruh teks sendiri di video editor; (2) **STRUKTUR KODE SIMPEL TAPI TETAP DETAIL** — buat fungsi modular bersih (`drawBackground`, `drawMainVisual`, `drawParticles`) tanpa kode spaghetti rumit.

---

## 9. Pilar Monorepo Customizations (Fase 10) — COMPLETED (2026-07-07)
- **Deskripsi**: Penambahan modul pengemasan platform ZIP massal, panel tinjauan detail Quality Control (QC) aset, dan kalender visual tren pasar musiman (*Market Radar*).
- **Keputusan Teknis**:
  - **ZIP Exporter Endpoint (`/api/assets/zip`)**: API dinamis menggunakan pustaka `adm-zip` untuk secara otomatis mengemas semua file media terekspor (EPS, SVG, JPG, MP4, WebM) ke dalam file ZIP siap-unggah per platform (Shutterstock, Adobe Stock, Vecteezy, Pond5), dengan mengecualikan file CSV dari file ZIP.
  - **Auto Platform CSV Downloader Integration**: Menyesuaikan router pengunduh file (`/api/assets/file`) untuk mendukung parameter `?csv=platform_name` guna mengunduh CSV metadata komersial langsung dari folder target eksportir lokal.
  - **Detailed Quality Control Panel (UI & Interface)**: Memperluas interface internal `AssetRecord` untuk mencakup field `qc_score` dan `qc_json`. Menambahkan tombol interaktif **🔍 QC** di setiap kartu aset galeri yang dapat di-expand/collapse untuk menyajikan status detail audit (seperti kebersihan open-path, outline teks, format artboard viewBox, dan ketiadaan gambar raster tertanam).
  - **Market Radar Seasonal Calendar**: Menambahkan tabel visual kalender tren musim dunia di halaman `/gallery` lengkap dengan tanggal acara, status urgensi target, dan deadline rilis produksi (8-12 minggu sebelum hari H) untuk menjamin optimasi indeks pencarian platform stock.

---

## 10. FTP/FTPS Bulk Uploader & Credentials Manager (Fase 11) — COMPLETED (2026-07-10)
- **Deskripsi**: Implementasi modul transfer FTP/FTPS massal terintegrasi dan panel pengelola kredensial platform agensi microstock.
- **Keputusan Teknis**:
  - **FTP Configurations Table (`ftp_configs`)**: Menambahkan tabel database SQLite baru untuk menyimpan informasi host, port, username, password terenkripsi lokal, dan mode aktif (simulated/live) per agensi microstock.
  - **Live FTPS Transfer Core (`basic-ftp`)**: Mengintegrasikan pustaka `basic-ftp` untuk transfer file sekuensial yang aman menggunakan protokol FTPS (Explicit TLS) dengan opsi penanganan fallback TLS dan pengabaian error sertifikat agensi (`rejectUnauthorized: false`).
  - **Simulated Mode Controller**: Menyediakan mode simulasi transfer (offline testing delay) yang memproses loop antrean file di backend tanpa koneksi internet, sangat berguna untuk pengujian visual/E2E lokal.
  - **Interactive Credentials & Upload Modal Overlay**: Membuat pop-up overlay modern glassmorphic di halaman `/gallery` saat mengklik tombol **🚀 FTP Upload** di setiap kartu agensi. Menampilkan form input setelan kredensial, tombol simpan lokal, progress log transfer dinamis, dan tombol kirim berkas terpadu.

---

## 11. High-Resolution Preview Compiler & SVG Sanitizer (Fase 12) — COMPLETED (2026-07-10)
- **Deskripsi**: Sistem rasterisasi pratinjau gambar 25 Megapixel (5000x5000px) sisi klien dan pembersihan layout SVG secara dinamis.
- **Keputusan Teknis**:
  - **Offscreen Canvas Rasterizer (`compileHighResJpg`)**: Melakukan konversi gambar vektor SVG menjadi bitmap JPEG 5000x5000px di browser sebelum diekspor. Menggunakan isi latar belakang putih solid (`ctx.fillRect`) untuk mencegah distorsi transparansi kompresi JPEG.
  - **viewBox Auto-Sanitization (`sanitizeSvg`)**: Melakukan ekstraksi properti lebar/tinggi SVG secara dinamis dan menyuntikkan atribut `viewBox` baru jika tidak ditemukan untuk mencegah pergeseran letak aset saat proses rasterisasi.
  - **Target Directory Saver**: Menyimpan berkas `.jpg` resolusi tinggi di folder platform (seperti Shutterstock) mendampingi file EPS.

---

## 12. AI Metadata Translator & Localization Engine (Fase 13) — COMPLETED (2026-07-10)
- **Deskripsi**: Penerjemah metadata berbasis AI fallback chain dan eksportir lembar CSV agensi terlokalisasi multibahasa.
- **Keputusan Teknis**:
  - **Structured Translation Helper (`lib/translator-service.ts`)**: Menerjemahkan dan mengoptimalkan judul serta kata kunci aset ke **5 bahasa target** (Spanyol, Jerman, Prancis, Jepang, Mandarin) menggunakan provider fallback Groq/Gemini/GitHub.
  - **Localized CSV Exporter**: Menyesuaikan `/api/metadata/export` untuk menghasilkan berkas CSV terpisah per bahasa (seperti `adobe_stock_content_upload_es.csv`) berdampingan dengan berkas ekspor standar.
  - **Translation Dashboard UI**: Mengintegrasikan panel control interaktif di halaman `/metadata` untuk memilih bahasa, memicu proses AI, dan meninjau hasil terjemahan dalam tampilan grid interaktif.

---

## 13. AI Vector QC Auditor & Artboard Sanitizer (Fase 14) — COMPLETED (2026-07-10)
- **Deskripsi**: Detektor kepatuhan teknis SVG microstock (terkait text nodes, embedded images, strokes) dan pembersih otomatis (auto-sanitize).
- **Keputusan Teknis**:
  - **XML Compliance Audit Service (`lib/svg-qc-service.ts`)**: Mengintegrasikan `auditSvgQuality` untuk mendeteksi font tersemat, gambar raster, stroke non-expanded, dan ketiadaan viewBox.
  - **Auto-Sanitize Core**: Mengimplementasikan `sanitizeSvgContent` menggunakan pembersihan string XML/Regex dinamis untuk menyingkirkan tag `<text>`, `<image>`, dan mereparasi dimensi artboard.
  - **Instant State Updater API (`api/assets/qc-sanitize`)**: Menyediakan endpoint POST untuk memperbarui file SVG fisik di server dan merekam status barunya secara reaktif pada UI halaman `/gallery`.

---

## 14. AI Vision Captioner & Keywording Assistant (Fase 15) — COMPLETED (2026-07-10)
- **Deskripsi**: Pendeskripsi metadata microstock otomatis berbasis Vision AI multimodal dan editor persistensi database SQLite.
- **Keputusan Teknis**:
  - **Multimodal Vision Service (`lib/vision-service.ts`)**: Menggunakan Vision API (Gemini/GPT) untuk menganalisis Base64 JPG pratinjau resolusi tinggi dan merumuskan deskripsi microstock.
  - **Direct/Canvas Hybrid Loader**: Backend `/api/metadata/vision-describe` mendukung pembacaan berkas JPG lokal maupun penerimaan string Base64 dari Canvas sisi client (sebagai fallback).
  - **UMR SQLite Writer API (`api/metadata/save`)**: Menyediakan API POST untuk mempersistensikan draf UMR terbaru yang diubah di UI kembali ke SQLite DB.
  - **UI Integration Dashboard**: Menambahkan tombol **👁️ AI Vision Captioner** dan tombol **💾 Simpan Perubahan** di dalam kartu editor halaman `/metadata`.

---

## 15. Agent Governance Max Capability Upgrade - COMPLETED (2026-07-10)
- **Deskripsi**: Penguatan aturan dan skill `.agent` agar permintaan "gunakan kemampuan maksimal / expert reasoning" menjadi protokol kerja yang terukur, transparan, dan bisa divalidasi.
- **Keputusan Teknis**:
  - **Skill Baru (`expert-reasoning-operator`)**: Menambahkan skill governance yang mewajibkan scope statement, evidence ledger, risk budget, alternatif pendekatan, validation command, dan remaining risk untuk task berisiko atau lintas-file.
  - **Rule Baru (`max-capability-protocol.md`)**: Menambahkan aturan portable yang menegaskan bahwa "maksimal" berarti bukti dan validasi lebih kuat, bukan izin menyentuh file di luar scope.
  - **Router & Active Skill Wiring**: Menambahkan `expert-reasoning-operator` ke manifest, default active skill set, quality task set, anti-slop skill list, dan route always-on untuk task substantif setelah user mengaktifkan mode expert/max-capability.
  - **Master Flow & Standards Update**: Memperkuat `.agent/MASTER_FLOW.md`, `.agent/AGENTS.md`, `.agent/rules/mandatory-skill-usage.md`, `.agent/core/professional-engineering-standards.md`, `.agent/START_HERE.md`, dan `.agent/README.md` agar agent berikutnya membaca dan menerapkan protokol transparansi ini.
  - **Max-Capability Always-On + 1000x Lipat Normalization (2026-07-11)**: Memperluas jalur aktivasi max-capability di canonical `.agent`, bridge tool (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-kit.mdc`, `.agents/rules/agent-kit.md`), dan generator adapter agar protokol scope statement, evidence ledger, risk budget, perbandingan alternatif, validasi kuat, dan risiko sisa berlaku otomatis untuk setiap task substantif tanpa menunggu user mengetik `1000x lipat`. Frasa `1000x`, `1000x lipat`, `1000 kali lipat`, dan `gas total` hanya mempertegas kewajiban default, bukan izin hype atau perubahan di luar scope.
  - **Validation Proof**: `validate-agent-skills` pass, `agent-doctor` pass, `deep-skill-audit` 0 issue, `audit-skill-quality` naik menjadi 151 Excellent / 0 Good / 0 Weak / 0 Empty, `export-agent-adapters --dry-run` pass, `bootstrap-agent` pass, baseline diperbarui ke 151 Excellent.

---

## 16. Visual Parameter Matrix & Batch Variation Generator (Fase 16) — COMPLETED (2026-07-10)
- **Deskripsi**: Alat pembuat batch variasi visual orisinal dengan pengacakan warna HSL harmonis dan render video otomatis ke SQLite database.
- **Keputusan Teknis**:
  - **HSL Harmonious Palette Logic**: Generator di `app/builder/page.tsx` menghasilkan 5 variasi visual cerdas (kecepatan, ketebalan, dan kepadatan) berbasis palet komplementer/analog.
  - **Interactive Matrix Cards**: Membangun antarmuka pratinjau kartu mini di kolom configurator kiri halaman `/builder` untuk pengujian parameter click-to-preview secara real-time.
  - **Sequential Render Queue**: Menambahkan pemicu `handleBatchRender` untuk merender kelima visual video secara berurutan dan mendaftarkannya langsung ke database SQLite via `/api/motion/save`.

---

## 17. AI Seasonal Prompt & Niche Expander (Fase 17) — COMPLETED (2026-07-10)
- **Deskripsi**: Jembatan kecerdasan buatan antara kalender tren musiman (M1) dan editor Prompt Studio (M2) untuk mempermudah perumusan ide konten musiman orisinal.
- **Keputusan Teknis**:
  - **Structured Seasonal Suggestion API (`api/radar/generate-ideas`)**: Menggunakan AI Fallback Chain untuk menganalisis event musiman (seperti Ramadan, Imlek, Natal) dan menyusun 3 rekomendasi aset kreatif (niche, warna HEX, komposisi, rationale).
  - **Embedded UI Radar Drawer**: Menyediakan antarmuka panel detail pratinjau ide hasil AI secara real-time di bawah tabel Market Radar halaman `/gallery`.
  - **Search Parameter Binder**: Merefaktor form utama [app/prompts/composer.tsx](file:///d:/gsap/microstudio/app/prompts/composer.tsx) agar mampu mendeteksi search parameters URL pada saat mount, sehingga pengguna dapat mengisi prompt secara otomatis melalui navigasi satu klik.

---

## 18. AI Semantic Keywords Enhancer & Interactive Tag Manager (Fase 18) — COMPLETED (2026-07-10)
- **Deskripsi**: Penyunting kata kunci interaktif (tambah/hapus tag) dan asistenasan pengisi kuota tag semantik microstock berbasis AI.
- **Keputusan Teknis**:
  - **AI Keyword Expander API (`api/metadata/expand-keywords`)**: Membuat endpoint POST untuk memperluas array kata kunci masukan menjadi 35-50 kata kunci relevan dan populer di Shutterstock/Adobe Stock menggunakan Gemini/GPT.
  - **Interactive Chip deletion**: Mengintegrasikan tombol silang `×` di setiap chip kata kunci di dashboard `/metadata` untuk menghapus tag yang kurang relevan secara real-time.
  - **Manual keyword insertion Form**: Menyediakan input teks baru di formulir agar pengguna dapat mengetik dan memasukkan tag baru buatan sendiri secara instan dengan menekan Enter.

---

## 19. Live FTP/FTPS Upload Queue Monitor & Connection Diagnostics (Fase 19) — COMPLETED (2026-07-11)
- **Deskripsi**: Terminal logs diagnostik koneksi real-time overlay dan panel status antrean berkas unggahan massal ke server FTP/FTPS agensi microstock.
- **Keputusan Teknis**:
  - **Manifest Retrieval API (`api/ftp/manifest`)**: Membuat endpoint untuk membaca berkas media terekspor di folder tujuan platform secara dinamis.
  - **Single-File Post upload**: Mengembangkan parameter opsional `filename` pada POST `/api/ftp/upload` agar client-side loop dapat memicu pengiriman berkas satu per satu.
  - **Interactive split-panel Modal (`app/gallery/page.tsx`)**: Mendesain ulang modal setelan FTP menjadi lebar ganda (950px); sisi kiri memuat parameter kredensial, sisi kanan memuat antrean berkas (`uploadQueue`) lengkap dengan badge status (`Pending`, `Uploading`, `Success`, `Failed`) dan konsol terminal monospace hijau (`ftpLogs`) untuk menampilkan diagnosis baris per baris lengkap dengan speed benchmarks transfer data (MB/s).



---

## 20. Agent Skill Library Mobile Bundle Ratchet - COMPLETED (2026-07-14)
- **Deskripsi**: Upgrade terfokus pada bundle skill mobile/Expo yang baru diinstall agar seluruh skill `.agent` kembali memenuhi quality ratchet.
- **Keputusan Teknis**:
  - **Scope**: Hanya sistem `.agent` dan catatan memori; app code tidak disentuh.
  - **Mobile Skill Upgrade**: Menambahkan section operasional `When to Use`, `ALWAYS DO THIS`, `NEVER DO THIS`, `Validation`, dan contoh/pola konkret pada 10 skill mobile/Expo yang masih `Good`.
  - **Skill yang dinaikkan**: `expo-api-routes`, `expo-deployment`, `expo-dev-client`, `expo-tailwind-setup`, `frontend-mobile-development-component-scaffold`, `mobile-design`, `mobile-developer`, `mobile-security-coder`, `react-native-architecture`, dan `upgrading-expo`.
  - **Baseline Ratchet**: `.agent/memory/skill-quality-baseline.json` diperbarui dari 151 Excellent menjadi 161 Excellent, dengan Good/Weak/Empty = 0.
  - **Bootstrap Inventory**: `node .agent/scripts/bootstrap-agent.mjs` dijalankan dan memperbarui `.agent/projects/index.json`.
  - **Validation Proof**: `validate-agent-skills` pass, `agent-doctor` pass, `deep-skill-audit` 0 issue, `audit-skill-quality` 161 Excellent / 0 Good / 0 Weak / 0 Empty, `list-good-skills --priority` 0 total, `export-agent-adapters --dry-run` pass.

---

## 21. Universal Output Skill Disclosure Enforcement - COMPLETED (2026-07-15)
- **Deskripsi**: Setiap output agent wajib menyebut skill yang dipakai, termasuk jawaban trivial, status, klarifikasi, acknowledgement, dan laporan error.
- **Aturan Format**:
  - Output substantif wajib memakai full `SESSION BOOT`.
  - Output non-substantif minimal wajib dimulai dengan `Skill dipakai: session-boot`.
  - Tidak ada exemption berdasarkan panjang atau jenis percakapan.
- **Canonical Wiring**: Policy diterapkan di `.agent/skills/session-boot/SKILL.md`, `.agent/rules/mandatory-skill-usage.md`, `.agent/AGENTS.md`, `.agent/MASTER_FLOW.md`, dan `.agent/skill-router.json`.
- **Automated Enforcement**: `.agent/scripts/validate-agent-skills.mjs` kini gagal jika policy marker hilang, router memiliki exemption, atau kalimat trivial-output exemption muncul kembali.
- **Cross-Agent Export**: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/agent-kit.mdc`, dan `.agents/rules/agent-kit.md` diregenerasi dari canonical `.agent`.

---

## 22. Official Reference Verification & Correction Memory - COMPLETED (2026-07-15)
- **Deskripsi**: Memperkuat governance agar 33 topik teknis memakai sumber utama
  yang ditetapkan user, membaca lesson relevan sebelum task, dan mencatat koreksi
  user sebelum pekerjaan dilanjutkan.
- **Canonical Source Map**: `.agent/official-reference-map.json` menyimpan tepat 33
  pasangan topik/sumber dan phrase ketidakpastian wajib.
- **Skill & Rule**: Menambahkan `official-reference-verifier` dan
  `.agent/rules/official-reference-verification.md`.
- **Correction Gate**: `lessons-capture` kini mewajibkan update
  `.agent/memory/lessons-learned.md` sebelum lanjut setelah koreksi teknis user.
- **Automated Enforcement**: Validator mengecek source map, marker policy, router,
  active skill, correction route, dan bridge hasil generate.
- **Scope**: Hanya sistem `.agent`, generated agent bridges, dan memory governance;
  kode aplikasi monorepo tidak disentuh.

## 23. Rebrand 🔥 I AM CRAZY + Refresh Fakta 2026 - COMPLETED (2026-07-20)

- **Trigger**: `brain/.../upgrade_prompt.md` — ganti identitas output "SESSION BOOT" → "🔥 I AM CRAZY" + naikkan currency governance ke standar terbaru.
- **Files diubah (27, bukan 220)**: 5 skill governance (session-boot, auto-pro-standards, prompt-amplifier, phased-delivery, deep-thinking-enforcer), 3 hook/script (`stop-gate.mjs`, `governance-reminder.mjs`, `export-agent-adapters.mjs`), docs (`.agent/AGENTS.md`, `MASTER_FLOW.md`, `mandatory-skill-usage.md`, `skill-router.json`, `.agents/AGENTS.md`), 4 bridge di-regenerate (AGENTS.md, CLAUDE.md, .cursor/rules/agent-kit.mdc, .agents/rules/agent-kit.md), 2 fix FID→INP (seo-audit, landing-page-generator), core (`professional-engineering-standards.md`, `anti-hallucination.md`), `unslop`, `skill-excellence-ratchet` (+Validation section), memory (decisions, lessons-learned).
- **Rebrand atomik**: folder skill `session-boot` TIDAK di-rename (dipakai router/validator). `stop-gate.mjs` menerima `I AM CRAZY|SESSION BOOT` (transisi anti-trap). Semua marker governance (`EVERY_OUTPUT_SKILL_DISCLOSURE`, `FAIL_CLOSED_GOVERNANCE`, `GOVERNANCE VIOLATION DETECTED`) dipertahankan.
- **Koreksi fakta terverifikasi (7 web search, sumber primer)**: OWASP Top 10 edisi resmi = **2025** (bukan "2026" yg diminta prompt — tidak eksis); WCAG tetap **2.2** (3.0 masih draft ~2028); Core Web Vitals pakai **INP** bukan FID (sejak 2024-03-12); Next.js 16 current stable; Node 24 Active LTS; GSAP 3.13 semua plugin gratis.
- **Validasi (semua exit 0)**: validate-agent-skills, agent-doctor, deep-skill-audit (0 issue), audit-skill-quality (162 Excellent, 0 weak), self-review-validator --scope agent (0 failures), export-agent-adapters --dry-run. Router integrity: 153 skill direferensikan, semua ada.
- **Catatan**: worktree sudah dirty saat sesi mulai (88 deletion pre-existing `build_*.py` dll + perubahan `finger_blur.py` di PROJECT_MEMORY) — TIDAK disebabkan oleh task ini. Footprint task = tepat 27 file modified sesuai rencana.

## 24. GitHub Push Configuration & Pygame Setup - COMPLETED (2026-07-21)

- **Deskripsi**: Mengonfigurasi pengecualian lingkungan virtual (`.venv/` dan `.agent/temp/`) di `.gitignore`, membuat komit untuk file-file baru di workspace (`nyoba.py`, `finger_blur.py`, `demo_headroom.py`, berkas audio `.m4a`), menetapkan remote origin ke repositori GitHub baru, dan menginstal dependensi `pygame` di `.venv`.
- **Target Remote**: `https://github.com/rafihanja/yah-karya-online.git`
- **Status**: Berhasil dikomit secara lokal (Commit `c58f1b1bc993f3574eb821924a5b92cc0a15e1e6`). Push ke remote GitHub memerlukan tindakan manual dari sisi terminal interaktif pengguna karena kendala otentikasi Git Credential Manager di latar belakang.
- **Dependency**: `pygame` berhasil diinstal pada `.venv` menggunakan pip.
