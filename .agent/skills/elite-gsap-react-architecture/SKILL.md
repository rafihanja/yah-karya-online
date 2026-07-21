---
name: elite-gsap-react-architecture
description: Standar mutlak untuk penggunaan GSAP di React/Next.js menggunakan hook useGSAP untuk mencegah memory leak.
risk: high (memory leaks, double mounts di StrictMode, target unmounted)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# 🚀 Elite GSAP React Architecture

> **One-liner:** Arsitektur integrasi GSAP dan React bebas leak menggunakan hook `@gsap/react` dan manajemen siklus hidup komponen yang ketat.

## When to Use

- Saat menulis animasi GSAP dalam aplikasi React 18+ (termasuk Next.js App/Pages Router dan Vite-React).
- Saat membuat animasi ScrollTrigger di komponen React yang mengalami re-render atau pergantian rute (SPA routing).
- Saat menyelesaikan masalah rendering ganda di *StrictMode* atau error target elemen tidak ditemukan.

## Why This Exists

Dalam ekosistem React, DOM bersifat dinamis dan sering dimodifikasi melalui siklus render virtual. Ketika animasi GSAP diinisialisasi secara naif (misalnya langsung menggunakan `useEffect` tanpa pembersihan), referensi ke elemen DOM dapat terlepas (*detached*). Akibatnya, animasi terus berjalan di memori latar belakang (memory leak) dan memicu warning di konsol. Selain itu, fitur StrictMode React merender komponen dua kali saat inisiasi untuk mendeteksi leak, yang jika tidak ditangani dengan benar akan melipatgandakan listener animasi.

## ALWAYS DO THIS

- **Gunakan hook `useGSAP()`** — Selalu gunakan hook `useGSAP` sebagai pengganti `useEffect` untuk inisialisasi animasi. Hook ini otomatis merevert context saat komponen dilepas.
- **Batasi cakupan dengan Ref (Scoping)** — Berikan referensi kontainer DOM sebagai properti scope pada config `useGSAP` (misalnya `{ scope: containerRef }`) agar query selector hanya mencari di bawah anak kontainer tersebut.
- **Daftarkan Plugin secara Global** — Panggil `gsap.registerPlugin(useGSAP)` di berkas entri aplikasi utama (seperti `main.jsx` atau `_app.tsx`) sekali saja sebelum render aplikasi.
- **Bungkus Handler Dinamis dengan `contextSafe`** — Gunakan fungsi `contextSafe` yang dikembalikan oleh hook `useGSAP` untuk membungkus animasi yang dipicu secara interaktif (seperti hover, click, atau scroll listener eksternal).
- **Gunakan `transform` GPU** — Batasi animasi pada properti `x`, `y`, `scale`, `rotation`, dan `opacity` untuk meminimalkan beban CPU dan memaksimalkan performa GPU (target FPS ≥55).

## NEVER DO THIS

- ❌ **JANGAN PERNAH** menulis animasi GSAP di dalam `useEffect` tanpa membungkusnya di dalam `gsap.context()` dan mengembalikan fungsi `ctx.revert()`. **Why fails:** Memicu memory leak masif, listener scroll menumpuk, dan koordinat animasi tabrakan setelah rute halaman berubah. **Instead:** Gunakan hook `useGSAP()` yang sudah menangani lifecycle secara otomatis.
- ❌ **JANGAN PERNAH** menggunakan pemilih string global seperti `gsap.to(".box", ...)` di dalam komponen tanpa mendefinisikan scope. **Why fails:** Animasi akan memengaruhi elemen `.box` milik komponen lain di seluruh DOM aplikasi, merusak tata letak visual komponen lain. **Instead:** Gunakan `scope: containerRef` atau ref langsung pada target.
- ❌ **JANGAN PERNAH** memodifikasi State React (`useState`) secara langsung di dalam callback tick GSAP atau `onUpdate` animasi. **Why fails:** Menyebabkan loop rendering tak terbatas (*infinite render loop*) yang membekukan browser. **Instead:** Manipulasi properti DOM secara langsung menggunakan GSAP.
- ❌ **JANGAN PERNAH** lupa mematikan (`.kill()`) atau merevert timeline ketika komponen dilepas. **Why fails:** Animasi hantu (*ghost tweens*) akan terus berjalan di memori RAM dan menurunkan performa CPU/GPU secara drastis. **Instead:** Pastikan instansi animasi diregistrasi di dalam context `useGSAP`.

## Examples

### ✅ Good — Struktur Komponen React dengan useGSAP dan contextSafe

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Registrasi hook useGSAP secara global
gsap.registerPlugin(useGSAP);

export function PremiumBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Inisialisasi animasi aman dengan scope terdefinisi
  const { contextSafe } = useGSAP(() => {
    gsap.from(titleRef.current, { 
      y: 30, 
      opacity: 0, 
      duration: 0.8, 
      ease: "power3.out" 
    });
    
    // Selector ".btn" di-scope otomatis di bawah containerRef
    gsap.from(".btn", { 
      scale: 0.9, 
      opacity: 0, 
      delay: 0.2, 
      stagger: 0.1 
    });
  }, { scope: containerRef });

  // Handler interaksi dibungkus contextSafe agar aman dari memory leak
  const onHoverBtn = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
  });

  const onLeaveBtn = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
  });

  return (
    <div ref={containerRef} className="banner-container">
      <h1 ref={titleRef}>Antigravity Web Experience</h1>
      <button 
        className="btn" 
        onMouseEnter={onHoverBtn} 
        onMouseLeave={onLeaveBtn}
      >
        Explore Now
      </button>
    </div>
  );
}
```

Why this passes: Menggunakan hook `useGSAP` dengan scope ref yang aman, menggunakan target ref eksplisit untuk judul, dan mengamankan hover handler dengan `contextSafe`.

### ❌ Bad — Penggunaan useEffect Naif Tanpa Scoping & Cleanup

```tsx
import { useEffect } from "react";
import gsap from "gsap";

export function LeakyBanner() {
  useEffect(() => {
    // ERROR 1: Menggunakan selector string global tanpa scope
    gsap.from(".bad-title", { y: 30, opacity: 0 });

    const handleHover = () => {
      // ERROR 2: Membuat tween yatim piatu di luar lifecycle/context
      gsap.to(".bad-btn", { scale: 1.05 });
    };

    const btn = document.querySelector(".bad-btn");
    btn?.addEventListener("mouseenter", handleHover);

    // ERROR 3: Tidak ada fungsi pengembalian (cleanup) untuk revert GSAP maupun event listener
  }, []);

  return (
    <div className="banner-container">
      <h1 className="bad-title">Leaky Web Experience</h1>
      <button className="bad-btn">Explore Now</button>
    </div>
  );
}
```

Why this fails: Tidak melakukan cleanup saat unmount sehingga menyebabkan memory leak, tidak meng-scope pemilih string (berisiko merusak banner lain), dan meninggalkan event listener liar di DOM.

---

## Failure Modes

- **Animasi Duplikat (Double Fire):** Saat halaman pertama kali dimuat di mode Development, StrictMode merender komponen dua kali, menyebabkan animasi melompat atau bertumpuk ganda karena tidak dibersihkan.
- **Detached DOM Memory Leak:** Profiler Chrome menunjukkan konsumsi memori Heap bertambah setiap kali pengguna berpindah halaman, disebabkan oleh referensi elemen DOM yang tersangkut di utas GSAP.

## Validation

Cara memverifikasi kepatuhan penggunaan `elite-gsap-react-architecture`:

1. **Verifikasi Import useGSAP:**
   Pastikan tidak ada penggunaan `useEffect` langsung untuk inisiasi animasi GSAP tanpa cleanup:
   ```bash
   grep -rn "useEffect" src/ | grep "gsap."
   # Harus kosong, semua animasi wajib menggunakan useGSAP atau menyertakan revert()
   ```
2. **Periksa Scoping useGSAP:**
   Pastikan setiap deklarasi `useGSAP` mendefinisikan scope:
   ```bash
   grep -rn "useGSAP(" src/ | grep -v "scope"
   ```
3. **Validasi Build Lokal:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis kode animasi di React/Next.js:

> "Gunakan skill `elite-gsap-react-architecture`. Sebelum menulis kode, baca `.agent/skills/elite-gsap-react-architecture/SKILL.md` terlebih dahulu. Wajib gunakan hook `useGSAP` untuk inisialisasi animasi, definisikan `scope` menggunakan ref kontainer DOM, dan bungkus semua callback event interaktif eksternal dengan `contextSafe` untuk menghindari kebocoran memori."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Mekanisme dasar animasi.
- [gsap-react](../gsap-react/SKILL.md) — Panduan mendalam integrasi React.
- [gsap-performance](../gsap-performance/SKILL.md) — Optimasi performa frame.
