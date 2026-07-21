# 📏 Elite Design System Rules

## 1. 8-Point Grid System
Gunakan kelipatan 8 (atau 4) untuk margin, padding, dan gap.
- **Micro**: `4px` (Tailwind: `1`) - untuk gap antara icon dan teks.
- **Small**: `8px` (Tailwind: `2`) - untuk padding dalam tombol.
- **Medium**: `16px` (Tailwind: `4`) - standar spasi komponen dasar.
- **Large**: `32px` (Tailwind: `8`) - jarak antar section yang berdekatan.
- **X-Large**: `64px` (Tailwind: `16`) - jarak hero section ke konten utama.

## 2. Typography Scale (Fluid)
Jangan hardcode piksel pada font jika memungkinkan. Gunakan *scale* relatif bawaan framework (`text-sm`, `text-lg`, `text-4xl`).

## 3. The 60-30-10 Color Rule
Saat mewarnai halaman:
- **60%**: Warna latar belakang dominan (biasanya putih, abu-abu sangat muda, atau hitam/slate pekat untuk dark mode).
- **30%**: Warna sekunder (kartu, navigasi, sidebar).
- **10%**: Warna aksen (biru mencolok, hijau cerah) HANYA untuk *Call-To-Action* (CTA), tombol, atau elemen interaktif utama.

## 4. Optical Alignment
Seringkali elemen yang di-*align* sempurna secara matematis (center) terlihat agak miring secara visual (terutama icon di samping teks). Lakukan kompensasi margin (misal: `-mt-1`) jika secara optik terlihat tidak sejajar.
