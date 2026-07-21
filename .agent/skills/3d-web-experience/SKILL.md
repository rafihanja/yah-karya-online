---
name: 3d-web-experience
description: Architecting and optimizing immersive 3D experiences for the web.
risk: high (CPU/GPU core thermal throttling, memory leaks, viewport scroll hijacking)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# 3D Web Experience

> **One-liner:** Guidelines for selecting, structuring, and optimizing 3D web frameworks and asset pipelines to deliver fluid 3D web experiences.

## When to Use

- When planning a 3D web application structure (Three.js vs React Three Fiber vs Spline).
- When preparing 3D assets (GLTF/GLB models, textures) for production deployment.
- When optimizing WebGL render loops and performance scales for mobile browsers.

## Why This Exists

Adding 3D elements can elevate web interfaces, but unoptimized 3D implementations are high-risk. Loading raw, uncompressed 3D models (often exceeding 10MB) over slow mobile networks leads to blank screens and high bounce rates. Furthermore, running un-throttled render loops at full resolution on high-DPI screens causes GPU overheating and battery drain. Establishing standard optimization guidelines keeps 3D experiences lightweight, performant, and responsive on all devices.

## ALWAYS DO THIS

- **Compress all 3D assets** — Run GLTF models through Draco or meshopt compression tools and convert textures to compressed `.webp` format to keep file sizes under 2.5MB.
- **Provide 2D image fallbacks** — Render static 2D preview images or mockups on mobile devices and hardware platforms that lack WebGL support.
- **Lazy-load 3D components** — Dynamically import WebGL elements and render canvas tags inside `<Suspense>` blocks with prominent loading indicator progress bars.
- **Cap resolution bounds** — Set pixel ratio limits to a maximum of 2 (`Math.min(window.devicePixelRatio, 2)`) to prevent GPU core throttling on high-DPI screens.
- **Monitor triangle counts** — Maintain strict scene limits (maximum 100K polygons for mobile screens and 500K for desktop browsers).

## NEVER DO THIS

- ❌ **DO NOT** load uncompressed GLB/GLTF models larger than 5MB on page load. **Why fails:** Blocks the main thread, resulting in a blank screen and poor loading metrics. **Instead:** Optimize models via `gltf-transform` and lazy-load them asynchronously.
- ❌ **DO NOT** use 3D assets for purely decorative elements that add no functional or interaction value. **Why fails:** Wastes precious GPU and CPU power on mobile devices. **Instead:** Replace passive 3D assets with light SVG visual components or CSS effects.
- ❌ **DO NOT** execute heavy math formulas (like nested vector distance loops) inside loop ticks. **Why fails:** Drops frame rates, resulting in lag. **Instead:** Pre-calculate variables or use lookup tables.
- ❌ **DO NOT** let OrbitControls hijack all touch interactions on mobile. **Why fails:** Locks page scroll coordinates, trapping mobile visitors inside the 3D element. **Instead:** Disable page zoom or configure specific touch layout regions.

---

## Technical Options Matrix

| Framework | Best For | Complexity | VRAM footprint |
|-----------|----------|------------|----------------|
| **Spline** | Simple elements, quick integration | Low | Medium |
| **React Three Fiber** | Complex scenes, React state binding | Medium | Medium |
| **Three.js Vanilla** | Custom engines, maximal control | High | Optimal |

---

## Examples

### ✅ Good — Compressed Asset Loading with Dynamic Import and DPR Caps

```tsx
import React, { Suspense, lazy } from "react";
import { useGLTF, useProgress, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// 1. Lazy load model component
const OptimizedModel = lazy(() => import("./OptimizedModel"));

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

export default function AppScene() {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  return (
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      <Canvas
        // 2. Cap resolution scales on high-DPI displays to optimize GPU power
        dpr={isMobile ? 1 : 2}
        camera={{ position: [0, 0, 5] }}
      >
        <ambientLight intensity={0.5} />
        {/* 3. Wrap dynamic loaders inside Suspense fallbacks */}
        <Suspense fallback={<Loader />}>
          <OptimizedModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

Why this passes: Lazy-loads model code asynchronously, limits device pixel ratios on mobile screens, and displays load progress bars.

### ❌ Bad — Static Load of Large Uncompressed Model with Uncapped DPR

```tsx
import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function HeavyModel() {
  // ERROR 1: Loading raw uncompressed 20MB asset synchronously on thread init
  const { scene } = useGLTF("/assets/heavy_uncompressed_model.gltf");
  return <primitive object={scene} />;
}

export default function Bad3DContainer() {
  return (
    // ERROR 2: Canvas element lacks parent dimensions and uncapped pixel ratio (kills FPS)
    <Canvas dpr={window.devicePixelRatio}>
      <ambientLight />
      <HeavyModel />
    </Canvas>
    // ERROR 3: Omission of fallback layouts and Suspense wrappers
  );
}
```

Why this fails: Loads heavy raw assets synchronously, leaves device pixel ratio uncapped, lacks parent layout containers, and omits Suspense handlers.

---

## Failure Modes

- **Browser Freeze Crash:** Loading massive uncompressed models causes memory spikes and triggers immediate browser crashes on low-end mobile devices.
- **Scroll Hijack Lock:** The canvas element intercepts touch swipes, stopping vertical scrolling and locking the viewport position.

## Validation

Cara memverifikasi kepatuhan penggunaan `3d-web-experience`:

1. **Verify dynamic components import:**
   Ensure 3D scenes are loaded asynchronously:
   ```bash
   grep -rn "lazy(" src/
   ```
2. **Scan for canvas dimensions constraint wrappers:**
   ```bash
   grep -rn "<Canvas" src/
   # Verify wrapper div tags specify sizing classes or inline height definitions
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun 3D web experience:

> "Use the skill `3d-web-experience`. Read `.agent/skills/3d-web-experience/SKILL.md` before coding. Never load uncompressed models directly on page load. Always compress GLTF assets, lazy-load Canvas layouts, provide 2D static fallbacks, and cap mobile device pixel ratios at 1."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — Memory disposal.
- [react-three-fiber](../react-three-fiber/SKILL.md) — R3F loops.
- [spline-3d-integration](../spline-3d-integration/SKILL.md) — Spline integration patterns.
