---
name: gsap-core
description: "GreenSock Animation Platform. Standard industri untuk animasi web performan."
risk: medium (performance & memory leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# 🟢 Elite GSAP Core (GreenSock)

> **One-liner:** Mesin animasi performa tinggi berbasis transform GPU untuk interaksi web yang interaktif tanpa jank dan memory leak.

## When to Use

- Saat menggerakkan posisi (x/y), rotasi, skala, atau opasitas elemen DOM secara presisi.
- Saat membuat efek paralaks atau animasi kompleks yang bergantung pada urutan waktu (*sequencing*).
- Saat merancang interaksi UI premium (hover micro-interactions, custom transition, page load state).

## Why This Exists

GSAP adalah standar industri untuk animasi web premium (seperti yang terlihat di situs pemenang Awwwards). Namun, tanpa pengelolaan siklus hidup (lifecycle) yang benar, animasi GSAP akan terus berjalan di latar belakang (memory leak), menumpuk pemrosesan CPU, dan menyebabkan jank. Menganimasikan properti non-GPU seperti `top` atau `left` juga memaksa browser melakukan reflow/layout kalkulasi ulang yang lambat pada setiap frame.

## ALWAYS DO THIS

- **Gunakan properti transform berbasis GPU** — Selalu gunakan `x`, `y`, `scale`, `rotation`, dan `opacity` untuk pergerakan. Ini didelegasikan ke compositor thread GPU untuk performa 60 FPS.
- **Scoping dengan refs** — Di React, selalu gunakan React refs untuk element target animasi, jangan gunakan selector string global (`".box"`) tanpa batas scope karena dapat bertabrakan dengan komponen lain.
- **Bersihkan Tween saat Unmount** — Selalu simpan instansi tween/timeline ke variabel dan panggil `.kill()` atau gunakan `gsap.context()` / `useGSAP` untuk revert ketika komponen dilepas.
- **Pemberian nama instansi yang jelas** — Berikan nama deskriptif pada variabel timeline/tween (contoh: `introTl`, `scrollTween`) untuk keterbacaan kode yang optimal.

## NEVER DO THIS

- ❌ **JANGAN PERNAH** menganimasikan properti layout non-GPU seperti `top`, `left`, `width`, `height`, `margin`, atau `padding`. **Why fails:** Memicu Browser Reflow pada setiap frame yang membebani CPU secara ekstrem dan menyebabkan jank visual. **Instead:** Gunakan properti transform GPU seperti `x`/`y` untuk posisi, dan `scaleX`/`scaleY` untuk ukuran.
- ❌ **JANGAN PERNAH** membiarkan tween berjalan setelah elemen targetnya dihapus dari DOM. **Why fails:** Menyebabkan memory leak dan error internal di engine GSAP (mencoba memperbarui properti elemen yang sudah tidak ada). **Instead:** Bersihkan animasi secara eksplisit di cleanup lifecycle (misalnya, `return () => tween.kill()`).
- ❌ **JANGAN PERNAH** mengurutkan rangkaian animasi dengan `delay` manual. **Why fails:** Urutan animasi menjadi tidak fleksibel, sulit dipelihara, dan rentan patah jika durasi salah satu animasi berubah. **Instead:** Gunakan `gsap.timeline()` dan position parameter.

## Examples

### ✅ Good — React useGSAP Hook (Pembersihan Otomatis)

```jsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function PremiumHero() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Animasi di-scope ke containerRef dan otomatis dibersihkan saat unmount
    gsap.from(".hero-title", { 
      y: 50, 
      opacity: 0, 
      duration: 0.8, 
      ease: "power3.out" 
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hero-container">
      <h1 className="hero-title">Welcome to Antigravity</h1>
    </div>
  );
}
```

Why this passes: Menggunakan hook `useGSAP` dengan `scope` terdefinisi dan properti GPU-friendly (`y` dan `opacity`), menjamin pembersihan otomatis saat unmount.

### ❌ Bad — Tanpa Cleanup & Memicu Reflow

```jsx
import { useEffect } from "react";
import gsap from "gsap";

export function LeakyComponent() {
  useEffect(() => {
    // Animasi tanpa scope global, menganimasikan properti layout 'top'
    // dan tidak ada cleanup function saat unmount
    gsap.to(".bad-box", { 
      top: "100px", 
      duration: 1 
    });
  }, []);

  return <div className="bad-box">Reflow Box</div>;
}
```

Why this fails: 
1. Menganimasikan properti layout `top` yang memicu browser reflow berulang kali.
2. Menggunakan selector string global tanpa pembatasan scope.
3. Tidak melakukan pembersihan (`cleanup`) saat unmount, memicu memory leak jika komponen dimuat ulang.

## Failure Modes

- **Animasi Hantu (Ghost Tweens):** Elemen hilang dari DOM tetapi profiler CPU menunjukkan utas GSAP tetap aktif memperbarui koordinat.
- **Tumpukan Animasi (Tween Clashing):** Beberapa event memicu animasi yang sama berulang kali tanpa menghentikan animasi sebelumnya, menyebabkan glitch visual.
- **Layout Thrashing:** Frame drop parah (FPS turun di bawah 30) saat transisi halaman akibat pengubahan properti non-GPU secara simultan.

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-core`:

1. **Pengecekan Kode Statis (Grep):**
   Gunakan perintah grep berikut untuk mendeteksi penggunaan properti non-GPU yang dilarang:
   ```bash
   grep -rE "(top|left|width|height|margin|padding)\s*:" --include="*.js" --include="*.jsx" --include="*.tsx" src/
   # Pastikan tidak ada properti non-GPU yang digunakan dalam objek vars GSAP
   ```
2. **Pengecekan Konsol Browser:**
   Buka Developer Tools (Console) di browser dan pastikan tidak ada pesan peringatan dari GSAP tentang target unmounted.
3. **Validasi Build:**
   Jalankan build verifikasi lokal:
   ```bash
   npm run build
   # Pastikan build sukses tanpa error sintaksis GSAP
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis animasi menggunakan GSAP:

> "Gunakan skill `gsap-core`. Sebelum menulis kode animasi, baca `.agent/skills/gsap-core/SKILL.md`. Wajib gunakan properti transform berbasis GPU (x, y, scale, rotation, opacity), gunakan scope refs di React, dan pastikan cleanup tween berjalan dengan benar saat unmount."

## Related

- [gsap-timeline](file:///d:/gsap/.agent/skills/gsap-timeline/SKILL.md) — Mengatur urutan sekuensial tween.
- [gsap-react](file:///d:/gsap/.agent/skills/gsap-react/SKILL.md) — Manajemen integrasi GSAP dengan React Lifecycle.
- [gsap-performance](file:///d:/gsap/.agent/skills/gsap-performance/SKILL.md) — Optimasi performa dan FPS.
