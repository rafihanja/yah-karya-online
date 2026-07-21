---
name: zdog
description: Flat, round, designer-friendly pseudo-3D engine for canvas and SVG.
risk: low (canvas scale distortion, animation loop layout leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Zdog

> **One-liner:** Guidelines for constructing lightweight, vector-based pseudo-3D illustrations on HTML5 canvas or SVG elements using Zdog.

## When to Use

- When building minimalist, illustrative 3D figures (e.g. geometric icons, characters, logos) without WebGL.
- When creating simple, interactive card turns or floating page components.
- When prototyping rapid spatial concepts without the overhead of Three.js.

## Why This Exists

Three.js relies on WebGL, which requires complex shaders, materials, light grids, and substantial file sizes. Zdog avoids WebGL entirely by utilizing the standard HTML5 2D Canvas or SVG rendering API. It maps 3D vector coordinates onto a flat plane, resulting in a distinct, stylized flat-color aesthetic. However, since Zdog calculates and sorts polygon shapes on the main CPU thread rather than offloading to the GPU, loading detailed models (exceeding 100 shape elements) will quickly bottleneck browser performance.

## ALWAYS DO THIS

- **Call `updateRenderGraph()` in the render loop** — Zdog does not auto-render; you must explicitly call `illustration.updateRenderGraph()` to redraw changes.
- **Cancel animation loop ticks on unmount** — Always store the animation frame ID (`requestAnimationFrame`) and cancel it (`cancelAnimationFrame`) when the host component unmounts to prevent memory leaks.
- **Utilize Zdog.Anchor for spatial grouping** — Group related vectors under a single `Zdog.Anchor` container to animate, scale, or rotate them collectively.
- **Cap shape counts under 100 elements** — Keep vector counts optimized to maintain 60 FPS performance on mobile browsers.
- **Bind touch drag triggers safely** — Use Zdog's built-in `dragRotate: true` on the root Illustration element to enable mouse/touch interactions easily.

## NEVER DO THIS

- ❌ **DO NOT** use Zdog for photorealistic scenes with realistic lights or shadow calculations. **Why fails:** Zdog has no lighting, shadow, or texture systems; it only renders flat colors and stroke widths. **Instead:** Use Three.js for photorealistic scenes.
- ❌ **DO NOT** nest shapes too many levels deep. **Why fails:** CPU-based polygon sort routines become exponentially expensive, resulting in lagging animations. **Instead:** Keep scene hierarchies flat and organized.
- ❌ **DO NOT** load heavy dynamic external mesh assets (like GLTF models) into Zdog. **Why fails:** Zdog only supports programmatically declared vector primitives (like `Rect`, `Ellipse`, or `Cone`). **Instead:** Define meshes using Zdog's shape parameters.

---

## Technical Performance Matrix

| Shape Count | Mobile Performance | Desktop Performance |
|-------------|--------------------|---------------------|
| **< 50** | 60 FPS | 60 FPS |
| **50 - 100** | 45 - 60 FPS | 60 FPS |
| **> 100** | < 30 FPS (Jank) | 45 - 60 FPS |

---

## Examples

### ✅ Good — Interactive Floating Cube with Loop Cleanup

```javascript
import Zdog from "zdog";

export function initZdogScene(canvasSelector) {
  // 1. Initialize root illustration wrapper
  const illo = new Zdog.Illustration({
    element: canvasSelector,
    dragRotate: true,
    zoom: 1
  });

  // 2. Set up logical group anchor
  const group = new Zdog.Anchor({
    addTo: illo,
    translate: { y: -10 }
  });

  // 3. Declare declarative shapes
  new Zdog.Box({
    addTo: group,
    width: 60,
    height: 60,
    depth: 60,
    stroke: false,
    color: "#C25",
    leftFace: "#EA0",
    rightFace: "#E62",
    topFace: "#ED0",
    bottomFace: "#636"
  });

  let animationId = null;
  function animate() {
    // 4. Update coordinates and redraw render graph manually
    group.rotate.y += 0.02;
    illo.updateRenderGraph();
    animationId = requestAnimationFrame(animate);
  }
  animate();

  // 5. Cleanup handler called on unmount
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}
```

Why this passes: Rotates vector nodes using anchors, updates the render graph, starts a loop with custom drag rotation, and provides clean unmount loop cancellations.

### ❌ Bad — Static Draw Omission and Missing Unmount Cleanup

```javascript
import Zdog from "zdog";

export function drawBadZdog() {
  const illo = new Zdog.Illustration({
    element: ".bad-canvas"
  });

  new Zdog.Rect({
    addTo: illo,
    width: 100,
    height: 100,
    color: "#ff0000"
  });

  // ERROR 1: Omission of illo.updateRenderGraph() - canvas will render blank
  
  function animate() {
    illo.rotate.y += 0.05;
    // ERROR 2: Request animation loop trigger without updateRenderGraph
    requestAnimationFrame(animate);
  }
  animate();

  // ERROR 3: Missing cancelAnimationFrame cleanup results in infinite loop leaks
}
```

Why this fails: Omits `updateRenderGraph` (nothing appears), runs an empty render loop, and lacks unmount cancellations.

---

## Failure Modes

- **Blank Canvas Glitch:** Visual shapes do not render because the developer forgot to call `updateRenderGraph()` after scene initialization.
- **Memory Leak Lag:** Changing pages in an SPA leaves the animation loop running in the background, consuming CPU resources.

## Validation

Cara memverifikasi kepatuhan penggunaan `zdog`:

1. **Verify updateRenderGraph presence:**
   Ensure render redraw calls exist:
   ```bash
   grep -rn "updateRenderGraph(" src/
   ```
2. **Scan for cancelAnimationFrame unmount hooks:**
   Ensure cleanup routines cancel active loops:
   ```bash
   grep -rn "cancelAnimationFrame(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Zdog:

> "Use the skill `zdog`. Read `.agent/skills/zdog/SKILL.md` before coding. Never use Zdog for realistic scenes. Always construct hierarchies using Anchor tags, call `updateRenderGraph()` in render loops, and cancel the animation frame loop on unmount."

## Related

- [threejs-fundamentals](../threejs-fundamentals/SKILL.md) — Standard 3D fundamentals.
- [gsap-performance](../gsap-performance/SKILL.md) — Animation loop optimizations.
