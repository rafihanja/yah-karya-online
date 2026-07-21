// @ts-nocheck
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Wajib register plugin sebelum digunakan
gsap.registerPlugin(ScrollTrigger);

/**
 * Contoh: ScrollTrigger Safe Cleanup
 *
 * Pattern Wajib:
 * 1. ScrollTrigger sangat rawan bocor jika komponen di unmount/remount (e.g. Next.js navigation).
 * 2. Menggunakan `useGSAP` menyelesaikan 99% masalah memory leak karena otomatis me-revert
 *    seluruh timeline dan instances ScrollTrigger yang dideklarasi di dalamnya.
 */
export const ScrollTriggerSafeCleanup = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Timeline dengan ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1, // Smooth scrub
          markers: false, // Set true untuk debugging
        },
      });

      tl.to(boxRef.current, {
        x: '50vw',
        rotation: 360,
        scale: 1.5,
        backgroundColor: '#ff0055',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="min-h-[200vh] bg-black pt-[100vh]">
      <div ref={boxRef} className="w-24 h-24 bg-blue-500 rounded-lg"></div>
    </section>
  );
};
