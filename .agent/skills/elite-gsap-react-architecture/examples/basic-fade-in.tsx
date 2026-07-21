// @ts-nocheck
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * Contoh: Basic Fade-In Animation
 *
 * Pattern Wajib:
 * 1. Gunakan `useRef` untuk mengambil DOM element.
 * 2. Gunakan `useGSAP` untuk animasi yang scope-nya tertutup.
 * 3. Animasi properti yang aman untuk GPU (y, opacity).
 */
export const BasicFadeIn = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      // gsap code here...
      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    },
    { scope: containerRef } // Scope memastikan selector string aman jika dipakai
  );

  return (
    <div ref={containerRef} className="flex justify-center items-center h-screen bg-gray-900">
      <h1 ref={textRef} className="text-4xl text-white font-bold">
        Elite Smooth Fade-In 🚀
      </h1>
    </div>
  );
};
