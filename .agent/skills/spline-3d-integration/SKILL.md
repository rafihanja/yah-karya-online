---
name: spline-3d-integration
description: Use when adding interactive 3D scenes from Spline.design to web projects.
risk: medium (unoptimized model load times, locked page scrolls, memory overhead)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Spline 3D Integration

> **One-liner:** Guidelines for embedding interactive 3D scenes designed in Spline into web platforms using lazy-loaded, touch-friendly configurations.

## When to Use

- When embedding interactive, styled 3D layouts from Spline.design into a portfolio or web application.
- When triggering animations or events in a Spline canvas via React, Next.js, or vanilla JS runtime APIs.
- When loading detailed 3D scenes with responsive scaling and custom canvas backgrounds.

## Why This Exists

Spline provides a powerful, visual interface for designing interactive 3D assets, which are exported as `.splinecode` bundles. However, loading these files requires downloading the heavy Spline WebGL runtime wrapper. If the scene is not lazy-loaded, or if page scrolling controls are not configured correctly, the heavy initial download blocks the main thread, and mouse controls hijack the user's touch events, locking the page and preventing navigation on mobile devices.

## ALWAYS DO THIS

- **Lazy-load Spline components** — Import components dynamically (e.g. using `React.lazy` or Next.js `dynamic`) to prevent the heavy runtime from delaying the initial page paint.
- **Enable background transparency** — Toggle "Hide Background" ON inside Spline play settings to blend the canvas seamlessly with the web page design.
- **Set geometry quality to Performance** — Keep polygon counts optimized for mobile screens to ensure smooth rendering rates.
- **Provide 2D image fallbacks** — Show static preview images while the scene downloads or on devices that lack WebGL support.
- **Disable page hijacking controls** — Disable zoom, pan, and page scroll options in Spline's play settings if the viewer is meant for passive observation.

## NEVER DO THIS

- ❌ **DO NOT** embed Spline scenes via raw `<iframe>` tags in production layouts. **Why fails:** Restricts access to the runtime API, limits styling adjustments, and causes rendering performance lag. **Instead:** Use native packages like `@splinetool/react-spline` or `@splinetool/runtime`.
- ❌ **DO NOT** allow OrbitControls to capture all vertical touch gestures on mobile devices. **Why fails:** Hijacks vertical swipes, locking the page and preventing users from scrolling down the page. **Instead:** Configure `enableZoom={false}` or toggle touch-action rules.
- ❌ **DO NOT** omit custom loading indicator screens during scene hydration. **Why fails:** Leaving a blank space on the page while the scene downloads confuses users, making them think the site is broken. **Instead:** Display a loading indicator using Drei's `Html` or progress hooks.

---

## Technical Design Archetypes

### Dynamic Next.js Integration
Compare these import variations:
- **Blocking (Bad):** `import Spline from '@splinetool/react-spline';`
- **Dynamic (Good):** `const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });`

---

## Examples

### ✅ Good — Lazy-Loaded React Spline Container with Loading Fallbacks

```tsx
import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";

// 1. Lazy load the Spline component with SSR disabled
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <div className="loading-placeholder">Loading 3D Scene...</div>
});

export default function SplineViewer() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="spline-container" style={{ width: "100%", height: "500px", position: "relative" }}>
      {/* 2. Show static preview fallback before loading finishes */}
      {!hasLoaded && !loadError && (
        <div className="static-fallback" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <img src="/assets/scene_fallback.jpg" alt="3D Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* 3. Load Spline scene with custom event listener callbacks */}
      <Suspense fallback={<div className="loader">Initializing...</div>}>
        <Spline
          scene="https://prod.spline.design/example-hash/scene.splinecode"
          onLoad={() => setHasLoaded(true)}
          onError={() => setLoadError(true)}
        />
      </Suspense>
    </div>
  );
}
```

Why this passes: Uses dynamic imports with SSR disabled, shows fallback images while downloading, and wraps the component in a sized parent container.

### ❌ Bad — Static iframe embedding with hardcoded constraints

```tsx
import React from "react";

export default function BadSplineEmbed() {
  return (
    // ERROR 1: Embedding via raw iframe restricts runtime API access
    // ERROR 2: Lacks fallback elements or lazy-loading structures
    // ERROR 3: Hardcoded dimensions overflow mobile viewport scales
    <iframe 
      src="https://my.spline.design/cube-123/" 
      frameBorder="0" 
      width="1200" 
      height="800"
    ></iframe>
  );
}
```

Why this fails: Embeds the scene via iframe, has hardcoded dimensions, lacks load states, and provides no fallback layout options.

---

## Failure Modes

- **UI Thread Freezes:** Importing Spline synchronously in the main bundle increases bundle size and blocks initial page load.
- **Scroll Lock Glitch:** Mobile visitors cannot scroll past the 3D element because touch inputs are captured by the Spline canvas.

## Validation

Cara memverifikasi kepatuhan penggunaan `spline-3d-integration`:

1. **Verify dynamic import configurations:**
   Ensure components are loaded dynamically:
   ```bash
   grep -rn "dynamic(" src/ | grep "react-spline"
   ```
2. **Scan for iframe usage:**
   ```bash
   grep -rn "<iframe" src/ | grep "spline"
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengintegrasikan Spline:

> "Use the skill `spline-3d-integration`. Read `.agent/skills/spline-3d-integration/SKILL.md` before coding. Never embed scenes using static iframe tags in web components. Always lazy-load elements, provide static fallback images, and verify that touch controls do not hijack page scrolling."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — GPU pipeline.
- [react-three-fiber](../react-three-fiber/SKILL.md) — React rendering rules.
