// @ts-nocheck
/**
 * Contoh: Framer Motion Variants
 * Aturan Elite: Pisahkan objek konfigurasi animasi dari struktur JSX (UI).
 */

import { motion } from 'framer-motion';

// 1. ✅ KAMUS VARIANTS (Terpisah di luar komponen)
// Ini membuat JSX Anda di bawah tetap bersih dan mudah dibaca.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // staggerChildren otomatis memberi jeda 0.2 detik antar anak komponen (List item)
      staggerChildren: 0.2, 
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

// 2. 🚀 KOMPONEN
export const EliteAnimatedList = ({ items }) => {
  return (
    // Kita cukup memanggil 'initial' dan 'animate' sebagai string dari nama varian
    <motion.ul
      className="bg-zinc-900 p-4 rounded-xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.li
          key={index}
          className="text-white mb-2 p-2 bg-zinc-800"
          // Otomatis mewarisi status 'hidden' dan 'visible' dari Parent container
          variants={itemVariants} 
          whileHover={{ scale: 1.05 }} // Interaksi Instan
          whileTap={{ scale: 0.95 }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
};
