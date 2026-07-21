---
name: web-mobile-joystick
description: Expert patterns for implementing virtual joysticks and touch camera swipes in Three.js for mobile browsers.
risk: medium (unresponsive touch inputs, screen scrolling conflict, camera viewport jitter)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Mobile Touch Controls (Three.js)

> **One-liner:** Guidelines for implementing decoupled, multi-touch virtual joysticks and swipe camera controls in WebGL canvas viewports.

## When to Use

- When building 3D browser games or interactive walkthroughs that run on mobile devices.
- When implementing virtual joystick overlays on top of a Three.js canvas.
- When handling split-screen multi-touch inputs (e.g. left thumb moves, right thumb looks).

## Why This Exists

If touch event listeners directly mutate 3D object transformations (like camera rotation or player position) inside event callbacks, the calculations fire at the rate of the device's touch digitizer (often 120Hz+). This desynchronization from the browser's render tick causes screen stutter and camera jitter. Furthermore, omitting CSS touch prevention controls causes the browser to trigger its default scroll bounce or reload gesture, breaking the game interface.

## ALWAYS DO THIS

- **Decouple input gathering from rendering logic** — Record touch coordinates into a shared `InputState` data object within event listeners, and read those values inside the `useFrame` or `requestAnimationFrame` loop.
- **Use the Pointer Events API** — Bind to `pointerdown`, `pointermove`, and `pointerup` handlers instead of using separate legacy mouse and touch listeners.
- **Set pointer capture coordinates** — Invoke `element.setPointerCapture(event.pointerId)` when a drag starts to continue tracking movements even if the user's finger slides outside the joystick area.
- **Add CSS touch-action suppression** — Configure `touch-action: none` in stylesheets for the canvas container to disable default browser scroll refresh actions.
- **Differentiate screen input areas** — Segment the viewport so that the left half handles character movement (joystick) and the right half processes camera rotation (swipes).

## NEVER DO THIS

- ❌ **DO NOT** modify camera coordinates or mesh parameters directly inside input event listeners. **Why fails:** Causes animation jitter and frame rate drops due to high-frequency digitizer inputs. **Instead:** Write coordinates to a shared state object first.
- ❌ **DO NOT** use legacy `touchstart` or `mousedown` triggers. **Why fails:** Fails to support hybrid touch/stylus inputs and requires writing duplicate code paths. **Instead:** Use Unified Pointer Events.
- ❌ **DO NOT** allow the default browser scrolling behavior to trigger during active touch interactions. **Why fails:** Swiping to look rotates the camera but also scrolls or pulls-to-refresh the webpage, disrupting the layout. **Instead:** Apply `touch-action: none` rules.

---

## Technical Layout Segmentation
Map inputs using coordinate boundaries:
- **Left Viewport (0.0 to 0.5 X):** Movement Joystick boundary.
- **Right Viewport (0.5 to 1.0 X):** Camera rotation swipe boundary.
- **CSS Rule:** `canvas, .ui-overlay { touch-action: none; }`

---

## Examples

### ✅ Good — Decoupled Pointer Listener with Capturing controls

```javascript
// InputState.js
export const inputState = {
  moveX: 0,
  moveY: 0,
  isPointerActive: false
};

export function setupJoystick(joystickElement) {
  const center = { x: 0, y: 0 };
  const maxDistance = 50;

  const onPointerDown = (e) => {
    // 1. Capture pointer to track movements outside element boundaries
    joystickElement.setPointerCapture(e.pointerId);
    inputState.isPointerActive = true;
    
    const rect = joystickElement.getBoundingClientRect();
    center.x = rect.left + rect.width / 2;
    center.y = rect.top + rect.height / 2;
  };

  const onPointerMove = (e) => {
    if (!inputState.isPointerActive) return;

    // 2. Calculate offsets relative to the joystick center point
    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    // 3. Write normalized offset data directly to the input state
    inputState.moveX = (Math.cos(angle) * distance) / maxDistance;
    inputState.moveY = (Math.sin(angle) * distance) / maxDistance;
  };

  const onPointerUp = (e) => {
    inputState.isPointerActive = false;
    inputState.moveX = 0;
    inputState.moveY = 0;
  };

  joystickElement.addEventListener("pointerdown", onPointerDown);
  joystickElement.addEventListener("pointermove", onPointerMove);
  joystickElement.addEventListener("pointerup", onPointerUp);

  // 4. Return cleanup to remove listeners on unmount
  return () => {
    joystickElement.removeEventListener("pointerdown", onPointerDown);
    joystickElement.removeEventListener("pointermove", onPointerMove);
    joystickElement.removeEventListener("pointerup", onPointerUp);
  };
}
```

Why this passes: Decouples input state calculations, uses the Pointer Events API, locks pointers via `setPointerCapture`, and cleans up handlers on unmount.

### ❌ Bad — Direct Camera Modification inside touchstart loops

```javascript
// ERROR 1: Direct mutation inside legacy touch listeners causes camera jitter
export function setupBadControls(camera) {
  window.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    
    // ERROR 2: Direct coordinates modification inside high-frequency digitizer event
    camera.rotation.y += touch.clientX * 0.001;
    camera.rotation.x += touch.clientY * 0.001;

    // ERROR 3: Lacks unmount cleanup hooks, causing listeners to stack up on route change
    // ERROR 4: Lacks touch-action CSS rules, causing default page scroll issues
  });
}
```

Why this fails: Mutates coordinates directly inside input events, uses legacy touch handlers, lacks cleanup logic, and does not suppress default scrolling behaviors.

---

## Failure Modes

- **Camera Jitter Glitch:** The scene stutters during swipes because coordinates update at the touch digitizer rate instead of the render frame rate.
- **Page Scroll Lock Conflict:** Swiping on the canvas rotates the camera but also scrolls the webpage, shifting the UI layout.

## Validation

Cara memverifikasi kepatuhan penggunaan `web-mobile-joystick`:

1. **Verify pointer capture usage:**
   Ensure pointer locking routines exist:
   ```bash
   grep -rn "setPointerCapture(" src/
   ```
2. **Scan for legacy touch events:**
   Ensure unified Pointer Events are used:
   ```bash
   grep -rn "touchstart" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk memprogram touch controls:

> "Use the skill `web-mobile-joystick`. Read `.agent/skills/web-mobile-joystick/SKILL.md` before coding. Never modify 3D coordinates directly inside event listeners. Always update a shared state object, use unified Pointer Events, use setPointerCapture, and set touch-action to none."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — GPU render cycles.
- [threejs-fundamentals](../threejs-fundamentals/SKILL.md) — Camera controls.
