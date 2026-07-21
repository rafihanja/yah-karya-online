---
name: gsap-horizontal-parallax
description: Official architecture for building robust 2.5D horizontal scroll parallax experiences using GSAP ScrollTrigger.
risk: high (clipping boundaries, horizontal scrolling glitches, aspect ratio distortion)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP Horizontal Parallax Architecture

> **One-liner:** Build horizontal scroll parallax by moving a container based on its dynamic `scrollWidth` calculations, preventing stretched units or SVG distortion.

## When to Use

- When building horizontal scrolling sections where vertical scroll progression translates content horizontally.
- When implementing a 2.5D parallax depth effect (background panel and foreground elements moving at different speeds).
- When resolving SVG rendering seams or distortion in wide aspect ratio layouts.

## Why This Exists

Hardcoding translation values (such as `x: "-300vw"` or `x: -5000`) breaks the layout on screens with different aspect ratios or mobile viewports. If the container size changes, the animation will scroll either too far (revealing empty gaps) or stop short (hiding content). Additionally, tiling multiple SVGs side-by-side using CSS Flexbox can trigger rendering seams (vertical hairline cracks) due to sub-pixel rounding errors in Chromium/Webkit engines. Calculating dynamic `scrollWidth` offsets resolves these bugs.

## ALWAYS DO THIS

- **Use the ScrollWidth Pattern** — Always calculate horizontal scroll translation dynamically using `x: () => -(container.scrollWidth - window.innerWidth)`.
- **Set `invalidateOnRefresh: true`** — Always enable `invalidateOnRefresh: true` on the ScrollTrigger config to recalculate bounds on window resize or layout changes.
- **Wrap elements in a pinned container** — Wrap horizontal layout sections in a parent container styled with `width: 100vw; height: 100vh; overflow: hidden; position: relative` and pin it.
- **Maintain natural aspect ratios** — Let panorama or layer images have natural dimensions (e.g. `height: 100vh; width: auto`), avoiding arbitrary scaling.
- **Eliminate SVG seams with native cloning** — Use a single `<svg viewBox="...">` and the `<use>` element to tile backgrounds, and apply `shape-rendering: crispEdges` to avoid hairline seams.

## NEVER DO THIS

- ❌ **DO NOT** hardcode horizontal translation values using fixed pixel units or `vw` strings (e.g., `x: "-400vw"`). **Why fails:** Breaks alignment and bounds on displays with different aspect ratios (e.g., ultrawide monitors or vertical mobile screens). **Instead:** Use dynamic functions returning `scrollWidth` offsets.
- ❌ **DO NOT** set `preserveAspectRatio="none"` on large SVGs stretched across the canvas. **Why fails:** Distorts and stretches background vectors unnaturally, degrading visual quality. **Instead:** Let background vectors scale proportionally or tile them.
- ❌ **DO NOT** omit the `invalidateOnRefresh: true` parameter from the ScrollTrigger. **Why fails:** Viewport resizing leaves old scroll boundaries cached in memory, resulting in broken alignment. **Instead:** Always declare it in the ScrollTrigger vars object.
- ❌ **DO NOT** use CSS Flexbox margins (e.g., `margin: -1px`) to stitch background tiles. **Why fails:** Fails to prevent rendering seams when applying linear gradients or rendering on retina displays. **Instead:** Use SVG `<use>` elements with precise pixel coordinates.

## Examples

### ✅ Good — Dynamic ScrollWidth Parallax with Invalidation

```javascript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHorizontalParallax() {
  const wrapper = document.querySelector(".scroll-wrapper");
  const panorama = document.querySelector(".panorama-container");
  const foreground = document.querySelector(".foreground-container");

  // Dynamic offset calculation function
  const getScrollAmount = () => -(panorama.scrollWidth - window.innerWidth);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      pin: true,
      start: "top top",
      end: () => `+=${panorama.scrollWidth}`, // Scroll pacing matches content width
      scrub: 1,
      invalidateOnRefresh: true // CRITICAL: re-calculates scroll distance on resize
    }
  });

  // Background slides to the end
  tl.to(panorama, { x: getScrollAmount, ease: "none" }, 0);

  // Foreground slides faster to create depth/parallax (2.5D effect)
  tl.to(foreground, { x: () => getScrollAmount() * 1.5, ease: "none" }, 0);

  return tl;
}
```

Why this passes: Uses dynamic functions for translations, registers `invalidateOnRefresh` to handle viewport resizing, and pins the root wrapper safely.

### ❌ Bad — Hardcoded Translation and Missing Resize Recalculation

```javascript
import gsap from "gsap";

export function initBadParallax() {
  // ERROR 1: Hardcoded translation value
  gsap.to(".panorama", {
    x: "-400vw",
    ease: "none",
    scrollTrigger: {
      trigger: ".scroll-wrapper",
      pin: true,
      start: "top top",
      end: "+=3000",
      scrub: true
      // ERROR 2: Missing invalidateOnRefresh: true
    }
  });
}
```

Why this fails: Hardcodes `-400vw` which cuts off on wide/narrow monitors, has no resize recalculation, and risks layout breaks.

---

## SVG Layout Stitching Pattern
When tiling large vector assets side-by-side:
```html
<svg viewBox="0 0 6000 500" style="shape-rendering: crispEdges;">
  <defs>
    <g id="panorama-tile">
      <!-- Art assets go here -->
    </g>
  </defs>
  <!-- First tile -->
  <use href="#panorama-tile" x="0" />
  <!-- Second tile (Mirrored to seamlessly repeat without seams) -->
  <g transform="translate(1500, 0) scale(-1, 1)">
    <use href="#panorama-tile" x="0" />
  </g>
</svg>
```

---

## Failure Modes

- **Gaps at the scroll boundaries:** The user scrolls to the end of the section, but the container translation leaves a massive empty gap or gets clipped prematurely.
- **Layout Jumps:** Resizing the browser window changes the document width, but the horizontal container remains stuck in its old coordinates.

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-horizontal-parallax`:

1. **Verify dynamic coordinate calculation:**
   Ensure horizontal translations use functions rather than static strings:
   ```bash
   grep -rn "x:" src/ | grep -v "() =>"
   # Look for static strings/numbers passed to x transformations in horizontal timelines
   ```
2. **Scan for invalidateOnRefresh:**
   Ensure ScrollTrigger declarations in horizontal views contain the invalidation flag:
   ```bash
   grep -rn "invalidateOnRefresh" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membuat horizontal scroll parallax:

> "Use the skill `gsap-horizontal-parallax`. Read `.agent/skills/gsap-horizontal-parallax/SKILL.md` before coding. Never use hardcoded values like `-300vw` or fixed pixel offsets for horizontal translations. Always calculate offsets dynamically using `scrollWidth`, declare `invalidateOnRefresh: true` on the ScrollTrigger, and handle seamless backgrounds inside a single SVG canvas using `<use>` elements."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Base transform mechanisms.
- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Pinning and scrub.
- [lenis-scroll](../lenis-scroll/SKILL.md) — Smooth scrolling.
