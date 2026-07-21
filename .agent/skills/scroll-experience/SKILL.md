---
name: scroll-experience
description: Expert in building immersive scroll-driven experiences - parallax storytelling, scroll animations, and interactive narratives.
risk: high (performance bottlenecks, scroll hijacking, layout shifts, accessibility blocks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Scroll Experience

> **One-liner:** Creative coding guidelines for designing immersive, storytelling scroll experiences that prioritize performance and accessibility.

## When to Use

- When building storytelling pages (interactive timelines, product scroll walkthroughs, parallax narratives).
- When sequencing animations tied entirely to the user's viewport scroll progression.
- When planning layout pinning, sticky side panels, or canvas-based scroll visualizers.

## Why This Exists

Scroll storytelling turns static web pages into engaging narratives. However, implementing scroll animations naively (such as using scroll listeners to mutate layouts or hijacking native scroll wheels) introduces extreme rendering bottlenecks. Choppy animations, input lags, and rendering freezes can ruin the user experience. Additionally, complex scroll sequences often ignore accessibility standards, blocking keyboard navigation and causing discomfort for users with vestibular disorders.

## ALWAYS DO THIS

- **Prioritize GPU-composited transformations** — Only animate properties like `transform` (translate, scale, rotate) and `opacity` to avoid triggering layout paints.
- **Support prefers-reduced-motion** — Always check and respect system motion preferences by scaling back or disabling parallax animations when requested.
- **Implement keyboard accessibility** — Ensure all scroll-story sections can be navigated using the keyboard (`tabindex="0"` on containers) and are readable without JavaScript.
- **Isolate parallax speed ratios** — Map layers to distinct speed factors (e.g. background 0.2x, midground 0.5x, foreground 1x) to establish natural visual depth.
- **Throttle and cache scroll reads** — Use optimized scroll event brokers like GSAP's `ScrollTrigger` or Svelte's reactive bindings instead of unthrottled `window.addEventListener('scroll')`.

## NEVER DO THIS

- ❌ **DO NOT** hijack the user's mouse wheel or scrolling momentum (scroll hijacking) to force custom scroll speeds. **Why fails:** Breaks natural browser expectations, making users feel out of control and increasing bounce rates. **Instead:** Link scroll progression to animation timelines using passive `scrub` triggers.
- ❌ **DO NOT** hide key product messages or calls to action (CTAs) behind scroll-triggered animations. **Why fails:** Impedes conversion rates and hurts SEO indexes because bots cannot execute scroll actions to reveal content. **Instead:** Keep critical text readable immediately and enhance it with progressive animation.
- ❌ **DO NOT** animate layout-heavy properties like `width`, `height`, `top`, `left`, `margin`, or `padding`. **Why fails:** Triggers browser layout recalculations on every scroll tick, dropping the frame rate below 30 FPS. **Instead:** Animate container scales or translation matrices.
- ❌ **DO NOT** overload mobile viewports with complex multi-layered parallax. **Why fails:** Mobile GPUs struggle with composite layers, causing stuttering scroll behavior and overheating. **Instead:** Reduce layer counts or scale back coordinates on mobile screens.

## Examples

### ✅ Good — Accessible, Performance-Optimized Parallax Layout

```javascript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initNarrativeParallax() {
  // 1. Accessibility: Check for reduced motion preferences
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return null;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".narrative-section",
      start: "top top",
      end: "+=1500",
      scrub: 1, // Smooth catch-up
      pin: true,
      invalidateOnRefresh: true
    }
  });

  // 2. Parallax layering using distinct GPU-friendly translation speeds
  tl.to(".bg-cloud", { y: -100, ease: "none" }, 0)   // Background (slow)
    .to(".mid-mountain", { y: -250, ease: "none" }, 0) // Midground
    .to(".fg-character", { y: -400, ease: "none" }, 0); // Foreground (fast)

  return tl;
}
```

Why this passes: Respects system motion settings, restricts animations to GPU-friendly `y` translations, registers a smooth scrub lag, and pins the wrapper cleanly.

### ❌ Bad — Unthrottled Layout Mutation and Trapped Navigation

```javascript
// ERROR 1: Unthrottled scroll event listener
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  
  // ERROR 2: Animating layout-heavy margin-top (forces browser reflow)
  const element = document.querySelector(".parallax-element");
  element.style.marginTop = `${scrolled * 0.5}px`;
  
  // ERROR 3: No prefers-reduced-motion check
  // ERROR 4: No cleanup listener unbinding
});
```

Why this fails: Triggers synchronous layout recalculations on every frame, drops FPS, runs on devices with reduced motion enabled, and leaks listeners when pages change.

---

## Technical Deep Dive

### Library Options Comparison
Choose the appropriate library based on your environment:
- **GSAP ScrollTrigger:** Best for complex multi-step timeline sequencing, pinning, and cross-framework support.
- **Framer Motion:** Best for simple React-native scroll-linked state mapping.
- **Lenis:** Best for global scroll normalization (momentum control).
- **CSS scroll-timeline:** Best for native browser-driven scroll indicators (no JS required).

### Parallax Depth Speed Chart
| Layer | Speed Ratio | Purpose |
|-------|-------------|---------|
| Background | 0.2x | Ambient sky, clouds, stars |
| Midground | 0.5x | Mountains, hills, buildings |
| Foreground | 1.0x | Primary interactive panels |
| Floating Elements | 1.2x | Dust particles, weather effects |

---

## Failure Modes

- **Layout Jumps on Mobile:** Viewport sizing triggers reflows when the mobile browser address bar shows/hides, causing scroll coordinates to jump.
- **Keyboard Navigation Traps:** Keyboard users focus on a section but cannot scroll or advance because focus trapping loops.

## Validation

Cara memverifikasi kepatuhan penggunaan `scroll-experience`:

1. **Verify Reduced Motion Check:**
   Ensure layout scripts check for client reduced-motion queries:
   ```bash
   grep -rn "prefers-reduced-motion" src/
   ```
2. **Scan for layout reflow animations:**
   ```bash
   grep -rnE "(width|height|top|left|margin|padding)\s*:" --include="*.js" --include="*.jsx" --include="*.tsx" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun scroll experience:

> "Use the skill `scroll-experience`. Read `.agent/skills/scroll-experience/SKILL.md` before coding. Never hijack the native mouse wheel. Always check for `prefers-reduced-motion` settings, restrict animations to GPU-friendly `transform` and `opacity` properties, manage layering speeds to build depth, and ensure sections are keyboard-navigable."

## Related

- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Dedicated ScrollTrigger animations.
- [gsap-performance](../gsap-performance/SKILL.md) — GPU optimization.
- [lenis-scroll](../lenis-scroll/SKILL.md) — Smooth scrolling normalization.
