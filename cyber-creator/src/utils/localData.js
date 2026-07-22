export const MONSTER_CARDS = [
  {
    id: "cpu-rex",
    name: "CPU-Rex (Processor)",
    type: "Processor Core",
    level: 1,
    power: 85,
    description: "Otak utama robot. Sangat pintar, tapi cepat panas kalau disuruh menghitung 1000 soal sekaligus!",
    trivia: "CPU (Central Processing Unit) berfungsi memproses semua perintah yang kamu berikan di layar HP.",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6, 182, 212, 0.4)",
    image: "🤖"
  },
  {
    id: "ram-osaurus",
    name: "RAM-osaurus (Memori)",
    type: "Short-Term Memory",
    level: 1,
    power: 70,
    description: "Ingatan jangka pendek robot. Suka mengingat barang bawaanmu, tapi langsung lupa kalau robotnya dimatikan!",
    trivia: "RAM (Random Access Memory) bertugas menyimpan data sementara agar aplikasi berjalan cepat dan tidak lemot.",
    color: "from-purple-500 to-indigo-600",
    glow: "rgba(124, 58, 237, 0.4)",
    image: "🧠"
  },
  {
    id: "gpu-dragon",
    name: "GPU-Dragon (Grafis)",
    type: "Render Engine",
    level: 1,
    power: 95,
    description: "Naga pembuat gambar indah. Dia yang melukis game di layarmu dengan warna-warni neon yang menakjubkan.",
    trivia: "GPU (Graphics Processing Unit) bertugas merender gambar, animasi, dan video 3D agar terlihat mulus.",
    color: "from-pink-500 to-rose-600",
    glow: "rgba(236, 72, 153, 0.4)",
    image: "🐉"
  },
  {
    id: "megavolt",
    name: "MegaVolt (Baterai)",
    type: "Power Supply",
    level: 1,
    power: 60,
    description: "Sumber tenaga robot. Suka minum listrik dari casan dan benci kalau kamu main game seharian tanpa henti.",
    trivia: "Baterai menyimpan daya kimia untuk diubah menjadi listrik agar HP bisa dinyalakan tanpa kabel.",
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245, 158, 11, 0.4)",
    image: "⚡"
  },
  {
    id: "wifi-fly",
    name: "Wi-Fi-Fly (Sinyal)",
    type: "Signal Carrier",
    level: 1,
    power: 75,
    description: "Kupu-kupu siber pembawa pesan. Terbang tanpa kabel membawa data belajarmu menembus tembok desa.",
    trivia: "Wi-Fi memancarkan data melalui gelombang radio frekuensi tinggi agar kamu bisa terhubung ke internet.",
    color: "from-teal-500 to-emerald-600",
    glow: "rgba(20, 184, 166, 0.4)",
    image: "🦋"
  },
  {
    id: "decibel-monkey",
    name: "Decibel-Monkey (Speaker)",
    type: "Audio Driver",
    level: 1,
    power: 65,
    description: "Monyet pembuat kebisingan. Berteriak riang membacakan dongeng sains di telingamu dengan musik seru.",
    trivia: "Speaker mengubah sinyal listrik digital menjadi getaran udara fisik yang kita dengar sebagai suara.",
    color: "from-yellow-500 to-amber-600",
    glow: "rgba(234, 179, 8, 0.4)",
    image: "🐒"
  },
  {
    id: "glass-turtle",
    name: "Glass-Turtle (Layar)",
    type: "Touch Interface",
    level: 1,
    power: 80,
    description: "Kura-kura kaca sensorik. Sangat peka, dia langsung bereaksi saat jarimu menyentuh tempurungnya.",
    trivia: "Touchscreen menggunakan sensor kapasitif untuk mendeteksi aliran listrik statis alami dari ujung jarimu.",
    color: "from-sky-500 to-blue-600",
    glow: "rgba(14, 165, 233, 0.4)",
    image: "🐢"
  },
  {
    id: "click-crab",
    name: "Click-Crab (Keyboard)",
    type: "Input Controller",
    level: 1,
    power: 75,
    description: "Kepiting pengetik cepat. Capitnya suka mengetik perintah rahasia di layar tombol untuk merakit robot.",
    trivia: "Keyboard mengirimkan kode biner khusus ke CPU setiap kali sebuah tombol huruf ditekan.",
    color: "from-violet-500 to-purple-600",
    glow: "rgba(139, 92, 246, 0.4)",
    image: "🦀"
  },
  {
    id: "cyber-eye",
    name: "Cyber-Eye (Kamera)",
    type: "Vision Sensor",
    level: 1,
    power: 90,
    description: "Burung hantu siber bermata lensa. Dia bisa mengenali coretan gambarmu dan melihat objek dunia nyata.",
    trivia: "Kamera menangkap cahaya melalui sensor lensa lalu mengubahnya menjadi pixel-pixel warna digital.",
    color: "from-fuchsia-500 to-pink-600",
    glow: "rgba(217, 70, 239, 0.4)",
    image: "🦉"
  },
  {
    id: "vault-golem",
    name: "Vault-Golem (ROM)",
    type: "Storage Guard",
    level: 1,
    power: 85,
    description: "Golem batu pelindung berkas. Dia menyimpan dan menjaga folder, foto, dan lagu di dalam gua memorinya.",
    trivia: "ROM / Hard Drive berfungsi menyimpan file secara permanen meskipun HP dimatikan.",
    color: "from-emerald-500 to-green-600",
    glow: "rgba(16, 185, 129, 0.4)",
    image: "🗿"
  }
];

export const TYPING_WORDS = [
  "kamera", "speaker", "layar", "tombol", "kabel",
  "koding", "baterai", "sinyal", "gambar", "suara",
  "folder", "berkas", "kreatif", "internet", "aplikasi",
  "robot", "merakit", "mengetik", "simpan", "hapus",
  "koneksi", "sirkuit", "cahaya", "monitor", "mouse",
  "sensor", "printer", "sandi", "aman", "belajar"
];

export const PROLOGUE_PAGES = [
  {
    id: 1,
    image: "🏙️",
    title: "Kota Siber yang Sunyi",
    content: "Di suatu tempat, terdapat Kota Teknologi Rahasia. Dahulu, semua robot dan mesin bekerja riang berkat kreativitas anak-anak."
  },
  {
    id: 2,
    image: "👾",
    title: "Serangan Monster Game Malas",
    content: "Tiba-tiba, monster game malas menyerang! Anak-anak lupa cara berkreasi dan hanya menatap layar menonton game sepanjang hari."
  },
  {
    id: 3,
    image: "🛠️",
    title: "Bangkitlah Cyber Creator!",
    content: "Kota rahasia ini kehabisan daya dan terkunci. Kini, gerbang kota hanya bisa dibuka oleh kreativitas anak yang berani mencipta!"
  }
];
