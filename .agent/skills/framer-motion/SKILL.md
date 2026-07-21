---
name: framer-motion
description: Production-ready declarative animations for React and Next.js.
risk: medium (bundle overhead, rendering loop layout shifts, paint overlays)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# 🚀 Elite Framer Motion

> **One-liner:** Library animasi deklaratif terintegrasi React untuk menyusun transisi halaman, animasi layout otomatis, dan mikro-interaksi performan.

## When to Use

- Saat membangun aplikasi React atau Next.js yang memerlukan animasi transisi masuk/keluar elemen secara dinamis (`AnimatePresence`).
- Saat menangani perubahan tata letak visual komponen secara otomatis akibat perubahan state DOM (`layout` prop).
- Saat mengimplementasikan interaksi gestur tingkat lanjut (seperti drag-and-drop, gesture swipes, hover, dan click transitions).

## Why This Exists

Dalam model pembaruan UI React yang deklaratif, mengelola animasi imperatif secara manual (seperti mengubah properti style elemen langsung menggunakan JavaScript) sangat rentan terhadap konflik sinkronisasi state. Elemen dapat melompat atau kehilangan status transisi saat dilepas dari DOM. Framer Motion menyelesaikan ini dengan menyelaraskan siklus hidup komponen React dengan siklus rendering animasi. Namun, mendeklarasikan objek visual yang kompleks secara langsung (inline) di dalam elemen template akan memperlambat parsing render virtual dan membuat kode berantakan (*dirty markup*).

## ALWAYS DO THIS

- **Gunakan Kamus Variants** — Selalu pisahkan definisi properti animasi dari markup komponen dengan mengekstraknya menjadi objek Variants di luar komponen (atau berkas eksternal).
- **Manfaatkan Orkestrasi Bersarang (`staggerChildren`)** — Gunakan fitur bawaan transisi orkestrasi seperti `staggerChildren` dan `delayChildren` pada parent variant untuk memicu gerakan beruntun otomatis pada elemen anak.
- **Aktifkan `AnimatePresence` untuk Siklus Keluar** — Bungkus komponen kondisional dengan `<AnimatePresence>` dan sertakan atribut `exit` pada elemen anak agar animasi saat elemen dihapus dari DOM berjalan sempurna.
- **Gunakan `layoutId` untuk Transisi Shared Element** — Sambungkan elemen visual yang sama pada dua komponen berbeda menggunakan properti `layoutId` untuk menciptakan animasi transisi elemen transparan (shared layout animation).
- **Terapkan `motion` secara Efektif** — Gantilah tag standar HTML menjadi versi motion (misalnya `<motion.div>`) hanya jika elemen tersebut memerlukan animasi aktif untuk menekan konsumsi memori virtual DOM.

## NEVER DO THIS

- ❌ **JANGAN PERNAH** mendeklarasikan objek visual yang rumit secara langsung (inline) di dalam atribut `animate={{ x: 100, y: 50, scale: 0.5, transition: { duration: 0.5 } }}`. **Why fails:** Menyulitkan pemeliharaan kode, merusak kebersihan template JSX, dan memicu kalkulasi ulang objek di setiap re-render. **Instead:** Gunakan referensi string ke kamus Variants eksternal.
- ❌ **JANGAN PERNAH** menggabungkan Framer Motion dan GSAP untuk memanipulasi properti visual pada satu elemen DOM yang SAMA secara bersamaan. **Why fails:** Kedua mesin animasi akan memperebutkan kendali CSS inline stylesheet, mengakibatkan animasi berkedip (*flicker*), lag, atau macet total. **Instead:** Pisahkan tanggung jawab elemen (misalnya GSAP untuk visual horizontal scroll masif, Framer untuk modal UI dialog).
- ❌ **JANGAN PERNAH** membungkus tabel data besar atau daftar berisi ribuan item ke dalam elemen `<motion.div>` yang memiliki properti `layout`. **Why fails:** Memaksa browser menghitung ulang koordinat bounding-box (*getClientRects*) ribuan elemen sekaligus secara sinkron, memicu layout thrashing parah yang membekukan halaman. **Instead:** Gunakan CSS biasa atau batasi hanya pada elemen kontainer luar.
- ❌ **JANGAN PERNAH** melupakan konfigurasi `mode="wait"` pada komponen `<AnimatePresence>` ketika membuat transisi antar rute halaman. **Why fails:** Komponen baru akan langsung terpasang secara instan di atas komponen lama sebelum animasi keluar selesai, merusak tata letak visual halaman. **Instead:** Nyatakan `<AnimatePresence mode="wait">`.

## Examples

### ✅ Good — Implementasi Variants Eksternal dan Orkestrasi Stagger

```tsx
import { motion } from "framer-motion";

// 1. Kamus Variants dideklarasikan di luar komponen untuk optimasi parsing memory
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Memicu transisi anak secara beruntun otomatis
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export function FeatureList({ items }: { items: string[] }) {
  return (
    // 2. Menggunakan variant string references untuk menyambungkan orkestrasi parent-child
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="list-container"
    >
      {items.map((item, index) => (
        <motion.li 
          key={index} 
          variants={itemVariants} 
          className="list-item"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

Why this passes: Mengisolasi variants di luar komponen, mengotomatisasi orkestrasi anak menggunakan `staggerChildren`, dan menyederhanakan markup JSX.

### ❌ Bad — Penulisan Inline Objek Rumit dan Orkestrasi Manual

```tsx
import { motion } from "framer-motion";

export function BadFeatureList({ items }: { items: string[] }) {
  return (
    <ul className="list-container">
      {items.map((item, index) => (
        // ERROR 1: Penulisan objek visual inline yang rumit langsung di JSX
        // ERROR 2: Orkestrasi delay menggunakan perhitungan matematika manual
        <motion.li
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="list-item"
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

Why this fails: Mengotori berkas template JSX dengan deklarasi inline yang dihitung ulang setiap kali render, serta tidak menggunakan variants orkestrasi bawaan parent-child.

---

## Failure Modes

- **Modal Tertahan Tanpa Hilang:** Dialog modal langsung hilang seketika saat state ditutup tanpa memutar animasi keluar. Hal ini disebabkan oleh lupa membungkus elemen dengan tag `<AnimatePresence>` atau salah menempatkan tag tersebut di dalam percabangan logika kondisi.
- **Pergeseran Tata Letak Saat Transisi Rute:** Saat berpindah rute halaman, konten halaman baru melompat ke bawah konten halaman lama karena mode transisi rute tidak diatur ke `mode="wait"`.

## Validation

Cara memverifikasi kepatuhan penggunaan `framer-motion`:

1. **Scan inline style properties in motion tags:**
   Pastikan properti transisi tidak dideklarasikan inline dalam jumlah berlebih:
   ```bash
   grep -rn "transition={{ delay" src/
   # Mencari indikasi orkestrasi delay manual alih-alih staggerChildren
   ```
2. **Scan for AnimatePresence tags configuration:**
   Pastikan tag AnimatePresence memiliki atribut mode yang sesuai:
   ```bash
   grep -rn "AnimatePresence" src/
   ```
3. **Validasi Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Framer Motion:

> "Gunakan skill `framer-motion`. Baca berkas aturan `.agent/skills/framer-motion/SKILL.md` sebelum koding. JANGAN PERNAH mendeklarasikan objek animasi kompleks secara inline di JSX. Gunakan kamus Variants eksternal, gunakan `staggerChildren` untuk orkestrasi beruntun anak, dan pastikan transisi rute halaman dilindungi oleh `<AnimatePresence mode="wait">`."

## Related

- [lottie-web](../lottie-web/SKILL.md) — Integrasi animasi vector berat.
- [gsap-react](../gsap-react/SKILL.md) — Mitigasi bentrokan manipulasi DOM React.
