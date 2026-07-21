---
name: threejs-fundamentals
description: Three.js scene setup, cameras, renderer, Object3D hierarchy, and coordinate systems.
risk: low (improper camera rendering bounds, resize layout shifts)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Three.js Fundamentals

> **One-liner:** Essential guidelines for setting up Three.js scenes, cameras, renderers, coordinate bounds, and responsive resize event listeners.

## When to Use

- When initializing a raw, vanilla Three.js project sandbox or Canvas container.
- When configuring basic orthographic or perspective projection cameras.
- When setting up logical parent-child transform matrices (Object3D hierarchy).

## Why This Exists

Creating a 3D scene requires coordinates mapping, camera projections, rendering buffers, and resize handlers. If camera aspect ratios are not recalculated correctly when the window resize fires, the entire 3D scene gets squeezed, stretched, or pixelated. Capping device pixel ratios and handling lifecycle updates cleanly ensures that the scene renders at 60 FPS across both ultra-high DPI desktop monitors and mobile screens.

## ALWAYS DO THIS

- **Cap renderer pixel ratio at 2** — Ensure the WebGLRenderer limits layout scaling (`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`) to prevent frame drops on mobile.
- **Update projection matrices on resize** — Recalculate camera aspect ratio (`camera.aspect = width / height`) and trigger `camera.updateProjectionMatrix()` when size updates.
- **Dispose assets when discarding scene instances** — Clean up all allocated geometries, materials, textures, and render targets before dismantling the WebGL context.
- **Utilize right-handed coordinate rules** — Keep in mind that Three.js uses +X (right), +Y (up), and +Z (towards the user).
- **Group related elements via Object3D/Group** — Assemble structural components together inside `THREE.Group` tags to animate coordinates collectively.

## NEVER DO THIS

- ❌ **DO NOT** instantiate new materials, textures, or geometries inside requestAnimationFrame render loops. **Why fails:** Allocates memory continuously, freezing the tab in seconds. **Instead:** Create assets once in setup, modify properties in render loop.
- ❌ **DO NOT** use raw `window.devicePixelRatio` without bounding. **Why fails:** High-DPI screens (like Apple Retina) force unnecessary 3x/4x rendering scales, causing GPU overheating. **Instead:** Use `Math.min(devicePixelRatio, 2)`.
- ❌ **DO NOT** add unneeded shadow-casting light sources. **Why fails:** Each shadow-casting light requires an additional depth-map render pass, killing FPS. **Instead:** Limit dynamic shadows to one main direction.

## Examples

### ✅ Good — Sized Canvas Initializer with Resize Handlers

```javascript
import * as THREE from "three";

export function initializeScene(canvasElement) {
  const width = canvasElement.clientWidth;
  const height = canvasElement.clientHeight;

  // 1. Scene, Camera, and Renderer setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Add sample mesh
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 3. Set animation loop
  let animationId = null;
  function animate() {
    animationId = requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  // 4. Handle resize events relative to parent dimensions
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h, false);
    }
  });
  resizeObserver.observe(canvasElement.parentElement);

  // Return cleanup helper
  return () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
```

Why this passes: Recalculates projection matrix on resize bounds, caps device pixel ratio, disposes geometries, and cancels the loop on unmount.

### ❌ Bad — Static Aspect Ratio and Missing Resize Handler

```javascript
import * as THREE from "three";

export function setupBadScene() {
  const scene = new THREE.Scene();
  // ERROR 1: Setting static width/height aspect ratios (squeezes on resize)
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  
  // ERROR 2: Hardcoded renderer dimensions that overflow smaller displays
  renderer.setSize(1920, 1080);
  document.body.appendChild(renderer.domElement);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
  );
  scene.add(mesh);

  function draw() {
    requestAnimationFrame(draw);
    renderer.render(scene, camera);
  }
  draw();

  // ERROR 3: Complete omission of resize listener and disposal cleanup hooks
}
```

Why this fails: Lacks responsive resize handlers, uses static dimensions, does not cap pixel ratios, and leaks memory by not exposing cleanup handles.

---

## Technical Coordinates Mapping
Coordinate system overview:
- **Right Hand Rule:** Thumb points +X (Right), Index +Y (Up), Middle +Z (Out).
- **NDC Bounds:** Normalized Device Coordinates mapping ranges from -1.0 to 1.0.

---

## Failure Modes

- **Squashed/Stretched Visuals:** The 3D scene deforms because `camera.aspect` is not updated during window resize.
- **VRAM Memory Bloat:** Re-initializing scenes without disposing older geometries causes the tab to crash.

## Validation

Cara memverifikasi kepatuhan penggunaan `threejs-fundamentals`:

1. **Verify updateProjectionMatrix presence:**
   Ensure camera aspect recalculation calls exist:
   ```bash
   grep -rn "updateProjectionMatrix(" src/
   ```
2. **Verify setPixelRatio constraints:**
   Ensure pixel ratio bounds exist:
   ```bash
   grep -rn "Math.min" src/ | grep "devicePixelRatio"
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Three.js fundamentals:

> "Use the skill `threejs-fundamentals`. Read `.agent/skills/threejs-fundamentals/SKILL.md` before coding. Never use hardcoded canvas dimension constraints. Always dynamically scale coordinate boundaries, update camera projection matrices on resize, cap pixel ratios at 2, and dispose WebGL resources."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — GPU optimization.
- [react-three-fiber](../react-three-fiber/SKILL.md) — Declarative state mappings.
