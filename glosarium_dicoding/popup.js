const rawData = [
  { letter: "A", term: "Algoritma", def: "Sekumpulan instruksi atau aturan yang terdefinisi dengan baik untuk memecahkan masalah atau melakukan perhitungan." },
  { letter: "A", term: "Anomali", def: "Nilai atau pola data yang menyimpang secara signifikan dari mayoritas data lainnya, sering dideteksi selama tahap Exploratory Data Analysis (EDA)." },
  { letter: "A", term: "API", def: "Antarmuka pemrograman aplikasi adalah seperangkat aturan yang memungkinkan dua perangkat lunak berbeda untuk berkomunikasi." },
  { letter: "A", term: "Artificial Intelligence (AI)", def: "Bidang ilmu komputer yang bertujuan menciptakan sistem yang mampu meniru kecerdasan manusia untuk melakukan tugas tertentu." },
  { letter: "A", term: "Automatic Code Completions", def: "Fitur pada editor kode yang menyarankan dan menyelesaikan baris kode secara otomatis saat pengguna mengetik." },
  
  { letter: "B", term: "Bahasa Alami", def: "Bahasa yang digunakan manusia dalam komunikasi sehari-hari, yang dapat diproses dan dipahami oleh komputer." },
  { letter: "B", term: "Batch Scoring", def: "Proses menghasilkan prediksi untuk sejumlah besar data secara bersamaan, biasanya pada interval waktu yang ditetapkan." },
  { letter: "B", term: "Bias", def: "Ketidakseimbangan atau kesalahan sistematis dalam model atau data yang menyebabkan hasil prediksi menyimpang dari kondisi sebenarnya." },
  { letter: "B", term: "Business Intelligence", def: "Proses dan teknologi untuk mengumpulkan, menyimpan, dan menganalisis data bisnis untuk membuat keputusan yang lebih baik." },
  
  { letter: "C", term: "Cell", def: "Unit dasar dalam sebuah notebook yang dapat berisi narasi (markdown) atau kode yang dapat dieksekusi." },
  { letter: "C", term: "Churn", def: "Istilah bisnis yang mengacu pada kecenderungan pelanggan atau pengguna untuk berhenti menggunakan layanan atau produk, sering dijadikan variabel target dalam predictive analysis." },
  { letter: "C", term: "Classification", def: "Jenis model machine learning yang memprediksi nilai kategorikal, seperti menentukan apakah suatu objek termasuk dalam kelas tertentu." },
  { letter: "C", term: "Clustering", def: "Jenis model machine learning yang mengelompokkan titik data yang memiliki kemiripan ke dalam grup tanpa adanya label kategori di awal." },
  { letter: "C", term: "Cloud Data Sources", def: "Sumber data yang disimpan di infrastruktur komputasi awan, seperti layanan penyimpanan data online." },
  { letter: "C", term: "Clusters", def: "Kelompok titik data yang terbentuk dalam proses clustering yang memiliki karakteristik atau kemiripan yang serupa." },
  { letter: "C", term: "Code-first", def: "Pendekatan pengembangan yang memprioritaskan penulisan kode secara manual untuk membangun suatu solusi." },
  { letter: "C", term: "Code Snippet", def: "Bagian kecil dari kode sumber yang dapat digunakan kembali untuk tugas pemrograman umum atau spesifik." },
  { letter: "C", term: "Compute Engines", def: "Komponen perangkat lunak yang bertugas melakukan perhitungan dan pemrosesan data dalam suatu platform analitik." },
  { letter: "C", term: "Compute Resources", def: "Sumber daya komputasi, seperti CPU dan memori, yang digunakan untuk menjalankan tugas pemrosesan data atau model." },
  { letter: "C", term: "CSV", def: "Format file teks sederhana yang menyimpan data tabular di mana setiap nilai dipisahkan oleh koma." },
  
  { letter: "D", term: "DataFrame", def: "Struktur data berbentuk tabel dua dimensi (baris dan kolom) yang digunakan untuk memuat, memanipulasi, dan menganalisis data di lingkungan notebook Fabric." },
  { letter: "D", term: "Data Distribution", def: "Sebaran nilai-nilai dalam sebuah himpunan data yang menunjukkan seberapa sering setiap nilai muncul." },
  { letter: "D", term: "Data Engineering", def: "Disiplin ilmu yang berfokus pada perancangan dan pembangunan sistem untuk mengumpulkan, menyimpan, dan mentransformasi data mentah." },
  { letter: "D", term: "Data Factory", def: "Layanan dalam Fabric yang digunakan untuk mengambil, mentransformasi, dan mengorkestrasi pergerakan dan pemrosesan data." },
  { letter: "D", term: "Data Ingestion", def: "Proses memuat atau mentransfer data dari satu atau lebih sumber ke sistem penyimpanan." },
  { letter: "D", term: "Data Integration", def: "Proses menggabungkan data dari sumber yang berbeda menjadi satu tampilan yang seragam dan kohesif." },
  { letter: "D", term: "Data Mesh", def: "Paradigma arsitektur data terdistribusi yang memperlakukan data sebagai produk, di mana kepemilikan dan penyediaan data dipegang oleh domain bisnis." },
  { letter: "D", term: "Data Science", def: "Bidang interdisipliner yang menggunakan metode ilmiah, proses, algoritma, dan sistem untuk mengekstrak pengetahuan dan wawasan dari data." },
  { letter: "D", term: "Data Visualization", def: "Representasi data secara grafis, seperti melalui bagan atau plot, untuk mempermudah pemahaman pola dan tren." },
  { letter: "D", term: "Data Warehousing", def: "Sistem yang mengumpulkan, menyimpan, dan mengelola data historis dari berbagai sumber untuk mendukung analisis bisnis." },
  { letter: "D", term: "Data Wrangler", def: "Alat bantu visual interaktif yang terintegrasi di notebook Microsoft Fabric untuk eksplorasi, pembersihan, dan transformasi data." },
  { letter: "D", term: "Delta Table", def: "Tabel yang menggunakan format Delta Lake untuk penyimpanan data, menawarkan kemampuan transaksi ACID, versioning, dan skema yang fleksibel, dan merupakan dasar dari OneLake dan Lakehouse di Fabric." },
  { letter: "D", term: "delta-parquet", def: "Format penyimpanan data default di OneLake untuk data tabular, yang menggabungkan format Parquet dengan kapabilitas transaksi Delta Lake." },
  { letter: "D", term: "Dependency", def: "Modul, library, atau paket perangkat lunak lain yang dibutuhkan oleh sebuah program atau proyek agar dapat berfungsi dengan baik." },
  { letter: "D", term: "Deployment", def: "Proses peletakan model machine learning yang telah dilatih ke dalam lingkungan produksi agar dapat digunakan untuk menghasilkan prediksi." },
  
  { letter: "E", term: "End-to-End", def: "Menggambarkan proses atau sistem yang lengkap dan terintegrasi, mencakup setiap tahapan dari awal hingga akhir." },
  { letter: "E", term: "Error Marking", def: "Fitur dalam editor kode yang secara visual menyoroti kesalahan sintaksis atau logis dalam kode yang sedang ditulis." },
  { letter: "E", term: "ETL (Extract, Transform, Load)", def: "Proses integrasi data yang meliputi pengambilan data dari sumber, perubahan format dan strukturnya, lalu pemuatan ke sistem tujuan." },
  { letter: "E", term: "Experiments", def: "Konsep dalam machine learning yang melacak dan merekam berbagai upaya pelatihan model dengan pengaturan yang berbeda." },
  { letter: "E", term: "Exploratory Data Analysis (EDA)", def: "Langkah awal dalam proyek data science untuk memahami karakteristik utama, pola, dan anomali dalam data melalui visualisasi dan statistik." },
  
  { letter: "F", term: "Feature Engineering", def: "Proses menciptakan fitur input baru yang informatif dari data mentah yang sudah ada untuk meningkatkan akurasi model machine learning." },
  { letter: "F", term: "Feature Selection", def: "Proses memilih subset variabel input (fitur) yang paling relevan untuk digunakan dalam pelatihan model machine learning." },
  { letter: "F", term: "Fitur", def: "Variabel input atau atribut yang digunakan oleh model machine learning untuk membuat prediksi." },
  { letter: "F", term: "Forecasting", def: "Jenis model machine learning yang memprediksi nilai numerik kontinu di masa depan, biasanya didasarkan pada data deret waktu." },
  { letter: "F", term: "Fragmentasi", def: "Keadaan di mana data tersebar di berbagai sistem atau platform yang berbeda, yang menyebabkan tantangan dalam analitik yang terpadu." },
  { letter: "F", term: "Framework", def: "Kerangka kerja perangkat lunak yang menyediakan struktur dan fungsi dasar untuk mengembangkan aplikasi atau solusi tertentu." },
  
  { letter: "G", term: "Gateway", def: "Komponen yang berfungsi sebagai jembatan aman untuk mentransfer data antara layanan cloud Fabric dan sumber data yang berada di lingkungan on-premise." },
  { letter: "G", term: "Generative AI", def: "Sub-bidang Artificial Intelligence yang berfokus pada pembangunan sistem yang dapat menghasilkan konten baru, seperti teks, gambar, atau kode." },
  
  { letter: "H", term: "Histogram", def: "Jenis bagan yang menampilkan distribusi frekuensi data numerik dengan membagi data menjadi 'bin' atau interval." },
  { letter: "H", term: "Hyperparameters", def: "Parameter yang nilainya ditetapkan secara manual sebelum proses pelatihan model machine learning dimulai." },
  
  { letter: "I", term: "Imputasi", def: "Teknik yang digunakan untuk mengganti nilai yang hilang (missing data) dalam suatu dataset dengan nilai yang diestimasi." },
  { letter: "I", term: "Ingestion", def: "Istilah lain untuk Data Ingestion, yaitu proses memuat data ke dalam sistem analitik." },
  { letter: "I", term: "Insight", def: "Wawasan atau pemahaman berharga yang diperoleh dari analisis data." },
  { letter: "I", term: "Intelligent Code Completion", def: "Fitur yang menyarankan penyelesaian kode secara kontekstual dan lebih cerdas, sering kali didukung oleh Artificial Intelligence." },
  
  { letter: "J", term: "JSON", def: "Format file teks ringan dan mudah dibaca manusia yang umum digunakan untuk pertukaran data semi-terstruktur." },
  
  { letter: "K", term: "Komponen Utama", def: "Variabel baru yang tidak berkorelasi, dihasilkan dari Principal Component Analysis (PCA), yang menangkap sebagian besar variasi dalam data asli." },
  { letter: "K", term: "Korelasi", def: "Hubungan statistik antara dua variabel yang menunjukkan sejauh mana perubahan pada satu variabel berkaitan dengan perubahan pada variabel lainnya." },
  
  { letter: "L", term: "Lakehouse", def: "Arsitektur data modern di Fabric yang menggabungkan kemampuan data warehouse dengan fleksibilitas data lake." },
  { letter: "L", term: "Library", def: "Sekumpulan kode dan fungsi yang telah ditulis sebelumnya yang dapat digunakan oleh programmer untuk mempermudah pengembangan perangkat lunak." },
  { letter: "L", term: "Line Plot", def: "Jenis bagan yang menampilkan titik-titik data yang dihubungkan dengan segmen garis lurus, sangat efektif untuk data deret waktu." },
  { letter: "L", term: "Logical Lake", def: "Lapisan konseptual di atas penyimpanan data fisik yang menyatukan data dari berbagai sumber tanpa duplikasi fisik." },
  { letter: "L", term: "Low-Code", def: "Pendekatan pengembangan perangkat lunak yang memungkinkan pengguna membuat aplikasi atau alur kerja dengan sedikit atau tanpa penulisan kode." },
  
  { letter: "M", term: "Machine Learning", def: "Sub-bidang Artificial Intelligence yang memungkinkan sistem belajar dari data, mengidentifikasi pola, dan membuat keputusan tanpa diprogram secara eksplisit." },
  { letter: "M", term: "Metadata", def: "Data tentang data yang menjelaskan struktur, skema, asal, dan karakteristik lain dari suatu item data dalam Fabric." },
  { letter: "M", term: "Metrics", def: "Nilai kuantitatif yang digunakan untuk mengukur performa, akurasi, dan kualitas suatu model machine learning selama atau setelah pelatihan, seperti R-squared atau accuracy." },
  { letter: "M", term: "MLflow", def: "Framework open-source terintegrasi di Microsoft Fabric yang digunakan untuk mengelola siklus hidup machine learning, termasuk pelacakan experiments dan metrik, serta penyimpanan model artifacts." },
  { letter: "M", term: "Missing Completely at Random (MCAR)", def: "Situasi di mana data yang hilang tidak memiliki hubungan dengan nilai variabel apa pun, baik yang hilang maupun yang diamati." },
  { letter: "M", term: "Missing at Random (MAR)", def: "Situasi di mana data yang hilang memiliki hubungan dengan variabel lain yang diamati, tetapi tidak dengan nilai yang hilang itu sendiri." },
  { letter: "M", term: "Missing Data", def: "Fenomena ketika beberapa nilai untuk variabel tertentu tidak tersedia dalam sebuah dataset." },
  { letter: "M", term: "Missing Not at Random (MNAR)", def: "Situasi di mana data yang hilang berhubungan langsung dengan nilai dari data yang hilang itu sendiri." },
  { letter: "M", term: "Model", def: "Representasi matematis yang menangkap pola dan hubungan yang telah dipelajari dari data untuk membuat prediksi atau keputusan." },
  { letter: "M", term: "Model Artifacts", def: "Semua file pendukung yang dihasilkan selama pelatihan model, seperti berkas bobot model itu sendiri dan berkas MLmodel yang mendefinisikan cara kerja model, disimpan dan dilacak oleh MLflow." },
  { letter: "M", term: "Modeling/Pemodelan", def: "Tahap dalam alur kerja data science di mana algoritma dipilih dan dilatih menggunakan data yang telah disiapkan untuk menemukan pola dan membuat prediksi." },
  { letter: "M", term: "Model Signature", def: "Skema atau kontrak yang mendefinisikan format masukan (input) dan keluaran (output) yang diharapkan dari model machine learning, dicatat dalam berkas MLmodel." },
  { letter: "M", term: "Multivariat", def: "Analisis atau data yang melibatkan dan menguji hubungan antara lebih dari dua variabel secara bersamaan." },
  
  { letter: "N", term: "Normalisasi", def: "Teknik pra-pemrosesan data untuk menskalakan nilai-nilai numerik dalam dataset ke rentang standar, biasanya antara 0 dan 1." },
  { letter: "N", term: "Notebook", def: "Lingkungan interaktif berbasis web di Fabric yang memungkinkan pengguna menulis dan menjalankan kode bersama dengan narasi (markdown) dalam cell." },
  
  { letter: "O", term: "One-hot encoding", def: "Teknik preprocessing yang mengubah variabel kategorikal menjadi format numerik biner yang dapat diproses oleh algoritma machine learning." },
  { letter: "O", term: "ONNX (Open Neural Network Exchange)", def: "Format standar terbuka yang memungkinkan model machine learning ditransfer dan digunakan di antara framework yang berbeda, memastikan konsistensi deployment." },
  { letter: "O", term: "On-premise", def: "Model penyebaran perangkat lunak di mana sistem diinstal dan dioperasikan dari lokasi fisik organisasi sendiri." },
  { letter: "O", term: "Open-source", def: "Perangkat lunak yang kode sumbernya dapat dilihat, dimodifikasi, dan didistribusikan secara bebas oleh siapa pun." },
  
  { letter: "P", term: "Pair Plot", def: "Matriks plot yang menampilkan hubungan antara setiap pasangan variabel numerik dalam dataset dan distribusi masing-masing variabel pada diagonalnya." },
  { letter: "P", term: "Pemrosesan Paralel", def: "Kemampuan suatu sistem komputasi untuk menjalankan banyak instruksi secara bersamaan di beberapa unit pemrosesan." },
  { letter: "P", term: "Persentil", def: "Ukuran statistik yang menunjukkan nilai di bawahnya persentase tertentu dari observasi dalam suatu kelompok berada." },
  { letter: "P", term: "Pipelines", def: "Rangkaian langkah yang terotomasi dan terstruktur untuk memindahkan dan memproses data dari sumber hingga tujuan." },
  { letter: "P", term: "Power BI", def: "Layanan dalam Fabric yang dikhususkan untuk visualisasi data, pembuatan laporan interaktif, dan dashboard untuk analisis bisnis." },
  { letter: "P", term: "Pre-processing", def: "Tahap awal dalam data science yang melibatkan pembersihan, transformasi, dan persiapan data mentah agar siap dan optimal untuk dianalisis atau digunakan untuk melatih model machine learning." },
  { letter: "P", term: "Principal Component Analysis (PCA)", def: "Teknik statistik untuk mereduksi dimensi data dengan mengubah sekumpulan variabel yang berkorelasi menjadi sekumpulan komponen utama yang tidak berkorelasi." },
  { letter: "P", term: "Processing", def: "Serangkaian operasi yang dilakukan pada data untuk mengubah atau mengekstrak informasi yang bermakna." },
  { letter: "P", term: "Predictive Analysis", def: "Cabang analitik data yang menggunakan data historis untuk memprediksi hasil atau tren di masa depan." },
  
  { letter: "R", term: "R-squared (R2)", def: "Metrik evaluasi yang digunakan dalam regression untuk menunjukkan proporsi varians variabel dependen yang dapat diprediksi dari variabel independen." },
  { letter: "R", term: "Regression", def: "Jenis model machine learning yang memprediksi nilai numerik kontinu, seperti harga atau suhu." },
  { letter: "R", term: "Real-time Intelligence", def: "Kemampuan untuk mengumpulkan, menganalisis, dan mengambil tindakan berdasarkan data yang masuk secara instan." },
  { letter: "R", term: "Run", def: "Sebuah instans tunggal dari eksekusi tugas atau pelatihan model dalam sebuah experiment machine learning." },
  
  { letter: "S", term: "Scalable", def: "Kemampuan suatu sistem untuk menangani peningkatan beban kerja atau volume data tanpa penurunan performa." },
  { letter: "S", term: "Scatter Plot", def: "Jenis bagan yang menggunakan titik-titik untuk menampilkan nilai dari dua variabel, berguna untuk mengidentifikasi korelasi." },
  { letter: "S", term: "scikit-learn", def: "Library open-source Python yang populer dan terintegrasi di Fabric, digunakan untuk melatih model machine learning tradisional." },
  { letter: "S", term: "Sensitivity Label", def: "Label yang diterapkan pada item data Fabric untuk mengklasifikasikan tingkat kerahasiaan dan menerapkan kebijakan perlindungan data." },
  { letter: "S", term: "Silo", def: "Kondisi di mana data terisolasi dan tidak dapat diakses atau dibagikan secara bebas antara berbagai departemen atau sistem, yang menjadi hambatan analitik." },
  { letter: "S", term: "Skewed", def: "Distribusi data yang tidak simetris, di mana sebagian besar data berkumpul di satu sisi." },
  { letter: "S", term: "Software-as-a-Service (SaaS)", def: "Model penyediaan perangkat lunak di mana aplikasi di-hosting oleh penyedia dan diakses pengguna melalui internet." },
  { letter: "S", term: "Spark Compute", def: "Sumber daya komputasi yang didukung oleh framework Apache Spark, dirancang untuk pemrosesan data skala besar." },
  { letter: "S", term: "Standardisasi", def: "Teknik pra-pemrosesan data yang menskalakan nilai-nilai sehingga memiliki rata-rata nol dan deviasi standar satu." },
  { letter: "S", term: "Status Data Refresh", def: "Indikator yang menunjukkan keberhasilan atau kegagalan pembaruan data terbaru pada dataset atau item analitik, serta waktu pembaruan tersebut." },
  { letter: "S", term: "Syntax Highlighting", def: "Fitur editor kode yang menampilkan teks dalam berbagai warna dan font berdasarkan kategori istilah, yang meningkatkan keterbacaan kode." },
  
  { letter: "T", term: "Tabular", def: "Format data yang terstruktur dalam bentuk tabel baris dan kolom." },
  { letter: "T", term: "Time-series Data", def: "Kumpulan observasi data yang diurutkan atau diindeks berdasarkan waktu." },
  { letter: "T", term: "Transform", def: "Proses mengubah struktur, format, atau nilai data agar sesuai untuk analisis atau pelatihan model, bagian dari proses preprocessing." },
  { letter: "T", term: "Training", def: "Proses melatih model machine learning dengan memberinya data input untuk belajar dari pola yang ada." },
  
  { letter: "U", term: "Univariat", def: "Analisis statistik yang hanya melibatkan dan berfokus pada satu variabel pada satu waktu." },
  { letter: "U", term: "Upstream", def: "Mengacu pada tahapan atau sistem sebelumnya dalam alur kerja pemrosesan data, tempat data berasal." },
  
  { letter: "V", term: "Variabel Target", def: "Variabel yang ingin diprediksi atau dijelaskan oleh model machine learning berdasarkan fitur input." },
  { letter: "V", term: "Version Control", def: "Sistem yang mencatat perubahan pada serangkaian file seiring waktu sehingga Anda dapat meninjau kembali versi tertentu." },
  { letter: "V", term: "Variables Explorer", def: "Fitur dalam notebook yang memungkinkan pengguna untuk melacak dan melihat nilai, tipe, dan properti semua variabel yang sedang aktif secara real-time." },
  
  { letter: "W", term: "Workload", def: "Jumlah pekerjaan atau tugas pemrosesan yang harus dilakukan oleh suatu sistem komputasi dalam periode waktu tertentu." },
  { letter: "W", term: "Workspace", def: "Wadah logis dalam platform yang berfungsi sebagai ruang kerja atau studio proyek untuk mengatur dan mengelola aset data dan analitik." }
];

document.addEventListener('DOMContentLoaded', () => {
  let currentSelectedLetter = "ALL";
  let showFavoritesOnly = false;
  let favorites = JSON.parse(localStorage.getItem('glosarium_favs') || '[]');

  const searchInput = document.getElementById('searchInput');
  const alphaFilter = document.getElementById('alphaFilter');
  const termList = document.getElementById('termList');
  const statsCount = document.getElementById('statsCount');
  const activeFilterText = document.getElementById('activeFilterText');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnFavoriteFilter = document.getElementById('btnFavoriteFilter');
  const toast = document.getElementById('toast');

  // Theme Toggle
  const savedTheme = localStorage.getItem('glosarium_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  btnThemeToggle.textContent = savedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap';

  btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('glosarium_theme', newTheme);
    btnThemeToggle.textContent = newTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  });

  // Favorites Filter Toggle
  btnFavoriteFilter.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    btnFavoriteFilter.style.borderColor = showFavoritesOnly ? 'var(--accent-color)' : 'var(--border-color)';
    btnFavoriteFilter.style.background = showFavoritesOnly ? 'var(--accent-bg)' : 'var(--bg-card)';
    render();
  });

  // Render Alpha Buttons
  function renderAlphaButtons() {
    const letters = ["ALL", ...new Set(rawData.map(item => item.letter))].sort();
    alphaFilter.innerHTML = '';
    letters.forEach(letter => {
      const btn = document.createElement('button');
      btn.className = `alpha-btn ${letter === currentSelectedLetter ? 'active' : ''}`;
      btn.textContent = letter === "ALL" ? "All" : letter;
      if (letter === "ALL") btn.style.width = "38px";
      btn.addEventListener('click', () => {
        currentSelectedLetter = letter;
        document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
      alphaFilter.appendChild(btn);
    });
  }

  // Toggle Favorite
  function toggleFav(termName) {
    if (favorites.includes(termName)) {
      favorites = favorites.filter(f => f !== termName);
    } else {
      favorites.push(termName);
    }
    localStorage.setItem('glosarium_favs', JSON.stringify(favorites));
    updateFavButtonLabel();
    render();
  }

  function updateFavButtonLabel() {
    btnFavoriteFilter.textContent = `Favorit (${favorites.length})`;
  }

  // Copy to Clipboard
  function copyDef(term, def) {
    const textToCopy = `${term}: ${def}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast();
      }).catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast();
  }

  function showToast() {
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
  }

  // Highlight text helper
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Main Render Function
  function render() {
    const query = searchInput.value.toLowerCase().trim();
    let filtered = rawData.filter(item => {
      const matchesQuery = item.term.toLowerCase().includes(query) || item.def.toLowerCase().includes(query);
      const matchesLetter = currentSelectedLetter === "ALL" || item.letter === currentSelectedLetter;
      const matchesFav = !showFavoritesOnly || favorites.includes(item.term);
      return matchesQuery && matchesLetter && matchesFav;
    });

    statsCount.textContent = `Menampilkan ${filtered.length} dari ${rawData.length} istilah`;
    
    let filterDesc = [];
    if (currentSelectedLetter !== "ALL") filterDesc.push(`Huruf ${currentSelectedLetter}`);
    if (query) filterDesc.push(`Cari "${query}"`);
    if (showFavoritesOnly) filterDesc.push(`Favorit`);
    activeFilterText.textContent = filterDesc.length ? filterDesc.join(" | ") : "Semua Istilah";

    if (filtered.length === 0) {
      termList.innerHTML = `<div class="no-results">Tidak ada istilah yang cocok.</div>`;
      return;
    }

    // Group by letter
    const grouped = {};
    filtered.forEach(item => {
      if (!grouped[item.letter]) grouped[item.letter] = [];
      grouped[item.letter].push(item);
    });

    let html = '';
    Object.keys(grouped).sort().forEach(letter => {
      html += `<div class="letter-group">
        <div class="letter-header">${letter}</div>`;
      
      grouped[letter].forEach(item => {
        const isFav = favorites.includes(item.term);
        const highlightedTerm = highlightMatch(item.term, query);
        const highlightedDef = highlightMatch(item.def, query);

        html += `
          <div class="term-card">
            <div class="term-header">
              <span class="term-title">${highlightedTerm}</span>
              <div class="card-actions">
                <button class="action-btn ${isFav ? 'is-fav' : ''}" data-action="fav" data-term="${encodeURIComponent(item.term)}">
                  ${isFav ? '★ Favorit' : '☆ Simpan'}
                </button>
                <button class="action-btn" data-action="copy" data-term="${encodeURIComponent(item.term)}" data-def="${encodeURIComponent(item.def)}">
                  Salin
                </button>
              </div>
            </div>
            <div class="term-def">${highlightedDef}</div>
          </div>
        `;
      });
      html += `</div>`;
    });

    termList.innerHTML = html;
  }

  // Delegated Event Listener for Extension CSP Compliance (No Inline Handlers!)
  termList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    
    const action = btn.dataset.action;
    const term = decodeURIComponent(btn.dataset.term);
    
    if (action === 'fav') {
      toggleFav(term);
    } else if (action === 'copy') {
      const def = decodeURIComponent(btn.dataset.def);
      copyDef(term, def);
    }
  });

  searchInput.addEventListener('input', render);

  // Initial setup
  renderAlphaButtons();
  updateFavButtonLabel();
  render();
});
