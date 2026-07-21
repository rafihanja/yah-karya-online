# 🏎️ GSAP Performance Checklist

Sebelum mengirimkan / men-deploy animasi GSAP, *engineer* WAJIB memeriksa ceklis berikut untuk menjamin animasi berjalan pada 60 FPS (Frame Per Second) tanpa *jitter* atau ngelag di HP kentang.

## 1. Animasi Hanya Menggunakan GPU Properties
- [ ] **Ya**: Menggunakan `x`, `y` (translasi) bukan `top`, `left`.
- [ ] **Ya**: Menggunakan `scale` bukan `width`, `height`.
- [ ] **Ya**: Menggunakan `rotation` bukan memanipulasi *CSS transform* secara manual.
- [ ] **Ya**: Menggunakan `opacity` bukan `display: none/block`.

## 2. Manajemen Memori & Cleanup
- [ ] **Ya**: Menggunakan `@gsap/react` (`useGSAP`) jika menggunakan ekosistem React.
- [ ] **Ya**: Jika TIDAK bisa menggunakan `useGSAP`, wajib menggunakan pola `let ctx = gsap.context(); return () => ctx.revert();` pada `useEffect`.

## 3. Seleksi Elemen
- [ ] **Ya**: Menggunakan `useRef` untuk seleksi DOM yang presisi di React.
- [ ] **Ya**: Menghindari *string selector* global (seperti `gsap.to('.card')`) kecuali digabungkan dengan opsi `{ scope: containerRef }`.

## 4. ScrollTrigger
- [ ] **Ya**: Plugin diregistrasi hanya sekali di luar komponen atau di tingkat akar.
- [ ] **Ya**: Menggunakan properti `invalidateOnRefresh: true` jika ukuran elemen bersifat dinamis.

## Tabel Properti: Hardware Acceleration (GPU) vs CPU
| Properti CSS | Biaya Render | Dimana Diolah? | Status Animasi |
|---|---|---|---|
| `x`, `y` (Transform) | Sangat Murah | GPU | ✅ Direkomendasikan |
| `scale` | Sangat Murah | GPU | ✅ Direkomendasikan |
| `opacity` | Sangat Murah | GPU | ✅ Direkomendasikan |
| `width`, `height` | SANGAT MAHAL | CPU (Memicu Reflow) | ❌ HINDARI |
| `top`, `left` | SANGAT MAHAL | CPU (Memicu Reflow) | ❌ HINDARI |
| `box-shadow` | Mahal | CPU (Memicu Repaint) | ⚠️ Hati-hati |
