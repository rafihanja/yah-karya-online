---
name: lenis-scroll
description: Smooth scrolling using Lenis, normalized scroll behavior, and integration with GSAP ScrollTrigger.
risk: medium (scroll fights, performance lag, accessibility compliance)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# lenis-scroll

> **One-liner:** Lightweight, high-performance smooth scrolling engine that normalizes momentum scroll gestures across browsers and integrates with GSAP.

## When to Use

- When building websites that require butter-smooth, momentum-based scrolling.
- When normalizing differences in scrolling velocity across platforms (e.g. Firefox vs Chrome wheel increments).
- When syncing scroll-linked parallax animations (GSAP ScrollTrigger) to a smooth, inertia-driven timeline.
- When designing immersive storytelling experiences containing horizontal overlays or deep vertical transitions.

## Why This Exists

Native browser scrolling (especially on desktop trackpads and mousewheels) behaves inconsistently across different operating systems and browser engines. This velocity delta causes scroll-driven animations (like parallax) to feel jerky, stuttering, or out of sync. Furthermore, legacy scroll-jacking scripts lock input threads and break accessibility. Lenis provides a lightweight smooth scroll wrapper that operates directly on the main thread using requestAnimationFrame, keeping animations fluid without hijacking standard scroll mechanics.

## ALWAYS DO THIS

- **Instantiate Lenis globally** — Create a single Lenis instance once per document or inside root app contexts (such as `_app.js`).
- **Synchronize with GSAP ScrollTrigger** — Set up a scroll event listener using `lenis.on('scroll', ScrollTrigger.update)` to keep GSAP computations in sync.
- **Utilize the GSAP Ticker** — Bind the Lenis update loop directly to GSAP's optimized ticker using `gsap.ticker.add((time) => lenis.raf(time * 1000))` and disable `lagSmoothing`.
- **Clean up on unmount** — Always invoke `lenis.destroy()` when components unmount or pages change to prevent persistent requestAnimationFrame loops.
- **Respect vestibular motion preferences** — Check `prefers-reduced-motion` and disable or scale back Lenis smooth scrolling if the user has requested reduced movement.
- **Set body CSS heights to auto** — Ensure your stylesheet declares `html, body { height: auto; }` so Lenis does not fight native scrolling viewport calculations.

## NEVER DO THIS

- ❌ **DO NOT** use Lenis alongside other smooth scroll engines (such as Locomotive Scroll or GSAP ScrollSmoother) on the same page. **Why fails:** Multiple scroll engines override scroll positions simultaneously, resulting in infinite scrolling loops, layout jumps, or rendering freezes. **Instead:** Pick one smooth scroll wrapper for the entire project.
- ❌ **DO NOT** forget to bind the `requestAnimationFrame` loop or the GSAP Ticker update handler. **Why fails:** Lenis will block all scrolling input completely, locking the website. **Instead:** Add `lenis.raf` to `gsap.ticker` or run a local RAF loop.
- ❌ **DO NOT** declare `scroll-behavior: smooth` in your CSS stylesheet when using Lenis. **Why fails:** The browser's native smooth-scrolling animations clash with Lenis's calculations, causing jitters during anchors or manual scroll-tos. **Instead:** Keep CSS scroll-behavior set to its default value or `auto`.
- ❌ **DO NOT** declare `overflow: hidden` globally on the `<html>` or `<body>` element. **Why fails:** Lenis depends on native scrolling structures to register wheel and touch events, and hiding overflows completely disables scrolling. **Instead:** Keep overflows default on root elements.

## Examples

### ✅ Good — Global Lenis Setup with GSAP Ticker Synchronization

```javascript
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  // Check for users who prefer reduced motion
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return null;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true
  });

  // 1. Sync ScrollTrigger update bounds with Lenis
  lenis.on("scroll", ScrollTrigger.update);

  // 2. Feed GSAP ticker into Lenis RAF
  const tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);

  // 3. Disable lagSmoothing to prevent animations from skipping frames during lag spikes
  gsap.ticker.lagSmoothing(0);

  // Return cleanup function for route changes or unmount
  return () => {
    gsap.ticker.remove(tickerCallback);
    lenis.destroy();
  };
}
```

Why this passes: Syncs correctly with GSAP Ticker, disables lagSmoothing, checks for prefers-reduced-motion accessibility, and provides a clear unmount cleanup callback.

### ❌ Bad — Double Setup and Native Smooth Scroll Clash

```javascript
import Lenis from "lenis";

// ERROR 1: Fails to check for user accessibility preferences
const lenis = new Lenis();

// ERROR 2: Uses manual requestAnimationFrame loop without cleanup
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ERROR 3: Missing GSAP ScrollTrigger sync, causing parallax to desynchronize
// ERROR 4: No destroy method exported, causing memory leak on unmount
```

Why this fails: Lacks integration with ScrollTrigger (leading to laggy parallax animations), ignores user reduced-motion preferences, and has no cleanup path to stop the animation loop on unmount.

---

## Technical Options

### Constructor Config Parameters
```javascript
const lenis = new Lenis({
  wrapper: window,        // scroll container (default: window)
  content: document.body, // scroll content (default: document.body)
  lerp: 0.1,              // scroll easing intensity (smaller = smoother, default: 0.1)
  duration: 1.2,          // scroll animation duration in seconds
  infinite: false,        // infinite scrolling loop
});
```

---

## Failure Modes

- **Frozen scroll behavior:** The page loads, but the user cannot scroll down at all. This is usually caused by omitting the `raf` execution loop or hiding overflows on `<html>`/`<body>`.
- **Desynchronized Parallax Elements:** Parallax elements jump, glitch, or flicker during scrolling because ScrollTrigger's recalculation loop was not bound to Lenis's scroll updates.

## Validation

Cara memverifikasi kepatuhan penggunaan `lenis-scroll`:

1. **Verify Lag Smoothing Disable:**
   Ensure lagSmoothing is set to 0 when initializing Lenis:
   ```bash
   grep -rn "lagSmoothing(0)" src/
   ```
2. **Scan for cleanups:**
   Ensure `lenis.destroy()` is called in cleanup paths:
   ```bash
   grep -rn "destroy()" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Lenis:

> "Use the skill `lenis-scroll`. Read `.agent/skills/lenis-scroll/SKILL.md` before coding. Avoid mixing with other smooth scroll libraries. Always link Lenis to the GSAP Ticker, set `gsap.ticker.lagSmoothing(0)`, verify that `prefers-reduced-motion` settings disable smooth scroll, and clean up the instanced loop using `lenis.destroy()` on unmount."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Base animation mechanics.
- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Parallax triggers.
- [locomotive-scroll](../locomotive-scroll/SKILL.md) — Alternative smooth scrolling wrapper.
