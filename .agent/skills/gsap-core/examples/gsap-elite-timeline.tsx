// @ts-nocheck
/**
 * Contoh: GSAP Elite Timeline (React Integration)
 * Aturan Elite: Gunakan hook useGSAP (atau gsap.context) untuk mencegah Memory Leak.
 */

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'; // Wajib diinstall: npm i @gsap/react

export const EliteHeroSection = () => {
  const containerRef = useRef(null);
  
  // 1. ❌ DOSA FATAL (Anti-Pattern)
  /*
  useEffect(() => {
    // Animasi ini akan menjadi Yatim Piatu (Orphan) jika komponen di-unmount,
    // menyebabkan MEMORY LEAK yang mematikan performa web!
    gsap.from('.judul', { y: 100, opacity: 0 });
  }, []);
  */

  // 2. ✅ STANDAR ELITE (Menggunakan useGSAP)
  useGSAP(() => {
    // Semua animasi di dalam scope ini akan OTOMATIS dibersihkan (reverted)
    // ketika komponen menghilang (unmount). Tidak ada lagi memory leak!
    
    // Gunakan Timeline untuk urutan animasi (Bukan delay manual)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
    
    tl.from('.judul', { y: 50, opacity: 0 })
      .from('.deskripsi', { y: 20, opacity: 0 }, "-=0.5") // Mulai lebih awal 0.5 detik
      .from('.tombol', { scale: 0.8, opacity: 0 }, "-=0.5");
      
  }, { scope: containerRef }); // Scope mengunci elemen hanya di dalam komponen ini

  return (
    <section ref={containerRef} className="hero-section">
      <h1 className="judul">Elite Agent Protocol</h1>
      <p className="deskripsi">Standar animasi tanpa cacat.</p>
      <button className="tombol">Mulai Sekarang</button>
    </section>
  );
};
