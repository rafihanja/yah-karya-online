---
name: gsap-performance
description: Official GSAP skill for performance optimization — GPU transforms, will-change layer promotion, avoiding layout thrashing, and high-frequency quickTo.
risk: high (frame drops, high CPU load, layout recalculations)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP Performance

> **One-liner:** Optimization techniques for maintaining smooth 60 FPS (≥55 FPS on mobile mid-tier devices) by using GPU acceleration and avoiding layout thrashing.

## When to Use

- When building animations with many elements (staggers, grids, particle snow effects).
- When animating elements that trigger on high-frequency events (scroll, mousemove, touch).
- When diagnosing frame drops (jank) or lag during animation cycles.

## Why This Exists

Animating CSS properties that trigger the browser's layout or paint pipelines (such as `width`, `height`, `top`, `left`, `margin`, or `padding`) forces the browser to recalculate the positions of other elements on every frame. This layout thrashing runs entirely on the CPU, causing rendering bottlenecks and frame rates to drop below 30 FPS. Using GPU-composited transforms avoids layout updates entirely, keeping animations fluid.

## ALWAYS DO THIS

- **Prioritize GPU-accelerated properties** — Animate only `x`, `y`, `scaleX`, `scaleY`, `rotation`, and `opacity`. These run on the GPU's compositor layer.
- **Use `gsap.quickTo()` for high-frequency updates** — For mouse followers, custom cursors, or pointer tracking, use `quickTo()` to reuse a single tween instead of spawning new tweens on every pixel update.
- **Apply `will-change: transform` selectively** — Add `will-change: transform` or `will-change: transform, opacity` in CSS to promote animated layers to their own GPU texture beforehand.
- **Batch DOM updates** — Keep DOM reads (e.g. `element.getBoundingClientRect()`) separate from GSAP animation writes to avoid layout thrashing.
- **Kill off-screen animations** — Automatically pause or terminate animations when elements leave the viewport (e.g., using ScrollTrigger's `toggleActions` or manual observers).

## NEVER DO THIS

- ❌ **DO NOT** animate layout-heavy properties like `width`, `height`, `top`, `left`, `margin`, or `padding` for positioning. **Why fails:** Forces browser reflow/layout recalculation on every frame, causing CPU bottlenecks and lag. **Instead:** Use `x`/`y` for position shifts, and `scale` for size changes.
- ❌ **DO NOT** apply `will-change` globally to every element in the CSS stylesheet. **Why fails:** Overloads the GPU's VRAM memory pool, leading to browser crashes, black screens, or degraded rendering performance. **Instead:** Apply it only to the specific elements actively undergoing animation.
- ❌ **DO NOT** create a new timeline or tween inside high-frequency listeners (e.g. `scroll` or `mousemove` callbacks). **Why fails:** Generates thousands of competing active tweens, leading to massive memory overhead and rendering glitches. **Instead:** Use a single, pre-defined tween via `gsap.quickTo()`.
- ❌ **DO NOT** call `ScrollTrigger.refresh()` without debouncing. **Why fails:** Forces synchronous layout recalculation across the entire DOM tree repeatedly, locking up the interface. **Instead:** Debounce refreshes (e.g., at least 200ms) or let GSAP handle it on window resize.

## Examples

### ✅ Good — quickTo() for Pointer Tracking

```javascript
import gsap from "gsap";

export function initCursorFollower(followerSelector) {
  // Instantiate quickTo once for properties updated at high frequency
  const xTo = gsap.quickTo(followerSelector, "x", { duration: 0.3, ease: "power3.out" });
  const yTo = gsap.quickTo(followerSelector, "y", { duration: 0.3, ease: "power3.out" });

  const onMouseMove = (e) => {
    // Reuses the same tween under the hood, skipping heavy overhead
    xTo(e.clientX);
    yTo(e.clientY);
  };

  window.addEventListener("mousemove", onMouseMove);

  // Return cleanup function to prevent memory leaks
  return () => {
    window.removeEventListener("mousemove", onMouseMove);
  };
}
```

Why this passes: Avoids generating a new tween on every mousemove, uses GPU-friendly `x` and `y` transform properties, and provides a clean event unbinding cleanup path.

### ❌ Bad — Generating New Tweens & Animating Layout Properties

```javascript
import gsap from "gsap";

export function initBadCursorFollower(followerSelector) {
  const onMouseMove = (e) => {
    // ERROR 1: Spawns a brand-new tween on every mouse move event (hundreds/sec)
    // ERROR 2: Animates top and left properties, forcing browser layout reflows
    gsap.to(followerSelector, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.3
    });
  };

  window.addEventListener("mousemove", onMouseMove);
}
```

Why this fails: Creates a massive amount of conflicting tweens causing memory inflation, and targets `left`/`top` causing extreme layout thrashing on every pixel shift.

---

## Technical Guidelines for High Performance

### Compositor vs. Layout Properties
Always design layouts to isolate animated components. Use the following hierarchy for CSS styles:
- **GPU Composited (Fast):** `transform: translate(x, y)`, `transform: scale(s)`, `transform: rotate(r)`, `opacity`.
- **Layout Trigger (Slow):** `width`, `height`, `top`, `left`, `margin`, `padding`, `display`, `flex-direction`, `grid-template-columns`.

### Canvas Offloading for High Counts
If you need to animate more than 150 independent visual objects (e.g., marine snow, bubbles in ocean deep-dive animations, starry background particle fields):
- **Avoid DOM Nodes:** Do not use DOM divs for particles.
- **Use HTML5 Canvas:** Render the elements using a single `<canvas>` context or WebGL context.
- **Drive with GSAP:** Use a single GSAP tween updating an index value, or update coordinates inside an `onUpdate` loop rather than running individual DOM tweens.

---

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-performance`:

1. **Audit for Layout Animating:**
   ```bash
   grep -rnE "(top|left|width|height|margin|padding)\s*:" --include="*.js" --include="*.jsx" --include="*.tsx" src/
   ```
2. **Scan for event-based tween instantiation:**
   Check event handlers (`mousemove`, `scroll`, `touchmove`) to ensure they do not invoke `gsap.to()` directly, but use `quickTo()` or throttle/debounce libraries.
3. **Verify Build & Run Performance tests:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengoptimalkan animasi:

> "Use the skill `gsap-performance`. Read `.agent/skills/gsap-performance/SKILL.md` before coding. Never animate left, top, width, or height. Always use x, y, scale, and opacity. Utilize `gsap.quickTo()` for mouse followers or custom hover triggers, apply CSS `will-change` selectively, and offload high particle counts to Canvas instead of DOM nodes."

## Related

- [gsap-core](file:///d:/gsap/.agent/skills/gsap-core/SKILL.md) - Core properties.
- [gsap-scrolltrigger](file:///d:/gsap/.agent/skills/gsap-scrolltrigger/SKILL.md) - Scroll performance optimization.
- [gsap-react](file:///d:/gsap/.agent/skills/gsap-react/SKILL.md) - Memory cleanup in React.
