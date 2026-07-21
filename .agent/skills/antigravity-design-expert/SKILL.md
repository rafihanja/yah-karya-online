---
name: antigravity-design-expert
description: Core UI/UX engineering skill for building highly interactive, spatial, weightless, and glassmorphism-based web interfaces using GSAP and 3D CSS.
risk: low (CSS rendering issues, lack of backdrop-filter support on older browsers)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Antigravity UI & Motion Design Expert

> **One-liner:** Panduan perancangan antarmuka web interaktif berbasis kedalaman spasial (3D CSS), efek glassmorphism premium, dan animasi bobot melayang menggunakan GSAP.

## When to Use

- Saat membangun dashboard interaktif dengan kedalaman visual spasial (Z-axis layering) atau efek glassmorphism transparan.
- Ketika menyusun tata letak kartu grid isometrik 3D menggunakan CSS Transforms (`perspective`, `rotateX`, `rotateY`).
- Ketika merancang animasi scroll-driven halus (ScrollTrigger) dengan prinsip gerakan melayang (antigravity).

## Why This Exists

Desain flat 2D standar sering kali terasa kaku dan kurang menarik bagi pengguna modern. Konsep "Antigravity Design" menghidupkan antarmuka melalui kedalaman ruang spasial dan efek melayang. Namun, merancang efek 3D CSS dan glassmorphism secara asal-asalan akan menurunkan performa rendering secara drastis (layout thrashing) pada browser seluler. Menggunakan properti optimasi hardware (seperti `will-change: transform`) dan fallback browser memastikan antarmuka tetap berjalan pada 60 FPS dengan kontras teks yang memenuhi standar aksesibilitas WCAG.

## ALWAYS DO THIS

- **Terapkan glassmorphism dengan kontras teks yang tinggi** — Pastikan teks di atas latar belakang blur transparan memiliki rasio kontras minimal 4.5:1 untuk memenuhi standar aksesibilitas WCAG AA.
- **Gunakan properti will-change untuk akselerasi GPU** — Deklarasikan `will-change: transform` pada elemen yang beranimasi 3D untuk memindahkan beban rendering ke kartu grafis.
- **Sediakan kueri media prefers-reduced-motion** — Matikan animasi transisi atau pergerakan kamera 3D bagi pengguna yang mengaktifkan opsi pengurangan gerakan pada sistem operasi mereka.
- **Gunakan z-index berskala logis** — Kelola urutan tumpukan elemen visual menggunakan skala terstruktur (seperti `z-index: 10`, `z-index: 20`, `z-index: 50`) daripada menulis angka acak (seperti `z-index: 99999`).
- **Sertakan supports query untuk backdrop-filter** — Tuliskan fallback gaya padat (solid background) bagi peramban lawas yang belum mendukung fungsi filter blur latar belakang.

## NEVER DO THIS

- ❌ **JANGAN PERNAH** menganimasikan properti layout mahal (seperti `box-shadow`, `filter: blur()`, atau `backdrop-filter`) di dalam putaran render frame secara terus-menerus. **Why fails:** Memicu repainting berulang pada browser CPU yang mengakibatkan frame rate anjlok dan visual terputus-putus. **Instead:** Animasikan skala atau opasitas lapisan elemen bayangan palsu menggunakan properti `transform` atau `opacity` yang diakselerasi GPU.
- ❌ **JANGAN PERNAH** memaksa animasi intro berjalan tanpa tombol lewati (skip button). **Why fails:** Animasi masuk berdurasi panjang menghambat akses kegunaan utama dan merusak kenyamanan pengguna (UX). **Instead:** Sediakan opsi tombol lewati serta atur durasi entrance yang singkat (maksimal 0.8 detik).
- ❌ **JANGAN PERNAH** menggunakan efek kemiringan 3D CSS pada wadah yang menampung tombol klik aktif tanpa memperhitungkan batas interaksi kursor. **Why fails:** Sudut kemiringan yang ekstrem mendistorsi area klik tombol, menyulitkan pengguna dalam berinteraksi. **Instead:** Batasi sudut rotasi rotasi sumbu maksimal 15 derajat.

---

## Technical Layout Archetypes

### Glassmorphism Styles dengan Fallback CSS
Gunakan penulisan fallback aman berikut:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.85); /* Solid fallback */
}

@supports (backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
  }
}
```

---

## Examples

### ✅ Good — Kartu Glassmorphic Spasial dengan Optimasi GPU dan Aksesibilitas

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    /* 1. Pengaturan ruang kedalaman spasial pada parent container */
    .scene-container {
      perspective: 1000px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    /* 2. Glassmorphism dengan fallback solid */
    .glass-3d-card {
      width: 320px;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #1a1a1a;
      background: rgb(240, 240, 240);
      transform: rotateX(10deg) rotateY(-10deg);
      
      /* Akselerasi GPU */
      will-change: transform;
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    @supports (backdrop-filter: blur(12px)) {
      .glass-3d-card {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(12px);
      }
    }

    .glass-3d-card:hover {
      transform: rotateX(0deg) rotateY(0deg) translateZ(20px);
    }

    /* 3. Aksesibilitas bagi pengguna prefers-reduced-motion */
    @media (prefers-reduced-motion: reduce) {
      .glass-3d-card {
        transform: none !important;
        transition: none !important;
        will-change: auto !important;
      }
    }
  </style>
</head>
<body>
  <div class="scene-container">
    <div class="glass-3d-card">
      <h2>Spasial UI</h2>
      <p>Mengapung di dalam koordinat sumbu 3D CSS dengan akselerasi rendering hardware GPU.</p>
    </div>
  </div>
</body>
</html>
```

Why this passes: Menerapkan supports fallback blur, melimitasi kemiringan rotasi sumbu 3D, mendeklarasikan `will-change` GPU, dan mematikan pergerakan transisi untuk kueri media `prefers-reduced-motion`.

### ❌ Bad — Animasi Bayangan Berulang-ulang dan Ketiadaan Fallback Glassmorphism

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .bad-glow-card {
      /* ERROR 1: Ketiadaan supports fallback untuk browser lawas */
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      
      /* ERROR 2: Animasi box-shadow berat secara terus-menerus (layout thrashing CPU) */
      animation: intensiveShadowPulse 1s infinite alternate;
    }

    @keyframes intensiveShadowPulse {
      0% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
      100% { box-shadow: 0 0 50px rgba(0, 255, 0, 1.0); }
    }

    .container {
      /* ERROR 3: Urutan tumpukan z-index tidak logis dan berantakan */
      z-index: 999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="bad-glow-card">
      <h1>Spasial Kasar</h1>
    </div>
  </div>
</body>
</html>
```

Why this fails: Menjalankan animasi bayangan terus menerus (boros CPU), mengabaikan fallback browser, menggunakan penataan z-index liar, dan meniadakan penyesuaian reduced-motion.

---

## Failure Modes

- **UI Lag Jitter:** Pergerakan visual terasa tersendat (jank) karena developer menganimasikan properti berat seperti `box-shadow` secara berkala dalam loop animasi.
- **Invisible Text AA Contrast:** Teks tidak terbaca di atas latar belakang transparan karena kontras warna font tidak mencukupi di bawah pencahayaan dinamis.

## Validation

Cara memverifikasi kepatuhan penggunaan `antigravity-design-expert`:

1. **Verify @supports query existence:**
   Ensure style fallback tags exist:
   ```bash
   grep -rn "backdrop-filter" src/
   # Ensure backdrop-filter exists alongside @supports block
   ```
2. **Scan for prefers-reduced-motion triggers:**
   ```bash
   grep -rn "prefers-reduced-motion" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan konsep Antigravity Design:

> "Gunakan skill `antigravity-design-expert`. Baca `.agent/skills/antigravity-design-expert/SKILL.md` sebelum menulis kode. JANGAN animasikan properti layout mahal seperti box-shadow di dalam render loops. Selalu sediakan supports fallback blur, terapkan will-change pada transformasi 3D CSS, dan hormati kueri media prefers-reduced-motion."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — 3D GPU optimization.
- [gsap-performance](../gsap-performance/SKILL.md) — Frame optimization.
