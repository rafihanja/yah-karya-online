---
name: animejs-animation
description: Advanced JavaScript animation library skill for creating complex, high-performance web animations.
risk: medium (rendering loops overhead, layout reflow, memory leaks in timeline triggers)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Anime.js Animation Skill

> **One-liner:** Lightweight, high-fidelity JavaScript animation engine specialized in complex staggered DOM sequences, spring physics, and SVG path morphing.

## When to Use

- When building staggered orchestrations (such as grid reveals, typography animations, or particle clouds).
- When animating SVG paths (morphing shapes, drawing dynamic outline strokes, motion path guides).
- When creating spring-physics-based UI responses that require custom elastic easing curves.

## Why This Exists

While CSS transitions are great for simple hovers, sequencing multi-stage layouts with dynamic offsets in CSS results in unmaintainable stylesheets. Anime.js handles this by executing animations programmatically on the main thread using requestAnimationFrame. However, animating layout-heavy properties (like `top`, `left`, `width`, or `height`) or creating overlapping timelines without removing stale instances will trigger layout thrashing, drop frames, and leak animation intervals in memory.

## ALWAYS DO THIS

- **Use spring and elastic easings** — Apply sophisticated physics easing values (e.g. `easing: 'spring(1, 80, 10, 0)'` or `easing: 'easeOutElastic(1, .5)'`) to make motion feel natural and premium.
- **Sequence with timeline offsets** — Use `anime.timeline({ ... })` and pass relative timing strings (like `'-=600'`) to create overlapping transitions instead of static delays.
- **Unbind active instances on unmount** — Always invoke `anime.remove(targets)` inside unmount hooks to clean up memory when components are removed.
- **Target GPU-accelerated properties** — Restrict property tweens to `transform` (translateX, translateY, scale, rotate) and `opacity`.
- **Set `will-change` dynamically** — Apply `will-change: transform, opacity` to heavily animated nodes to force GPU layer rendering.

## NEVER DO THIS

- ❌ **DO NOT** animate layout-altering CSS properties like `margin`, `padding`, `width`, or `left`. **Why fails:** Triggers browser layout calculation passes on every animation frame, dropping frame rates below 30 FPS. **Instead:** Animate element translations (`translateX`, `translateY`) and scaling factors.
- ❌ **DO NOT** forget to clear active animations when unmounting components in single-page applications. **Why fails:** The background RAF loop continues referencing detached DOM nodes, leaking memory and degrading hardware performance. **Instead:** Clean up using `anime.remove(".selector")` on component destruction.
- ❌ **DO NOT** use default linear or standard ease-in-out settings for premium storytelling elements. **Why fails:** Animations look mechanical and basic, failing to project a premium aesthetic. **Instead:** Utilize custom cubic-bezier strings or spring curves.
- ❌ **DO NOT** stack multiple concurrent animations on the same DOM element. **Why fails:** Tweens conflict, causing elements to flicker, snap back, or break visual layouts. **Instead:** Manage sequencing inside a single `anime.timeline`.

## Examples

### ✅ Good — Timeline Sequencing with Spring Easing & Cleanup

```javascript
import anime from "animejs";

export function initLandingOrchestration() {
  // 1. Create a structured timeline with global defaults
  const tl = anime.timeline({
    easing: "spring(1, 80, 10, 0)", // Expensive, natural spring curve
    autoplay: true
  });

  // 2. Sequence animations using relative offsets for smooth overlap
  tl.add({
    targets: ".hero-title .char",
    translateY: [40, 0],
    opacity: [0, 1],
    delay: anime.stagger(20) // Organic rhythm
  })
  .add({
    targets: ".hero-description",
    translateY: [20, 0],
    opacity: [0, 1]
  }, "-=800") // Overlaps with title animation by 800ms
  .add({
    targets: ".cta-button",
    scale: [0.95, 1],
    opacity: [0, 1],
    easing: "easeOutElastic(1, .8)"
  }, "-=600");

  // Return cleanup function to unbind target refs
  return () => {
    anime.remove(".hero-title .char");
    anime.remove(".hero-description");
    anime.remove(".cta-button");
  };
}
```

Why this passes: Uses premium spring/elastic easings, overlapping timelines with relative offsets, stagger curves, and ensures targets are removed on unmount.

### ❌ Bad — Static Delays, Layout Animating, and Missing Cleanups

```javascript
import anime from "animejs";

export function initBadAnimation() {
  // ERROR 1: Static animation call with no timeline orchestration
  anime({
    targets: ".bad-box",
    // ERROR 2: Animating layout-heavy margin-left (triggers reflow)
    marginLeft: "200px",
    opacity: 1,
    // ERROR 3: Mechanical linear easing
    easing: "linear",
    duration: 1000
  });

  // ERROR 4: No unmount cleanup, target elements remain bound in memory
}
```

Why this fails: Animates layout-mutating properties, uses mechanical linear easing, lacks timeline coordination, and leaks memory upon component unmount.

---

## SVG Path Morphing Blueprint
When animating path transitions (must have the same number of coordinate points):
```javascript
anime({
  targets: ".morphing-path",
  d: [
    { value: "M10 80 Q 52.5 10, 95 80 T 180 80" },
    { value: "M10 80 Q 52.5 80, 95 80 T 180 80" }
  ],
  easing: "easeOutQuad",
  duration: 2000,
  loop: true,
  direction: "alternate"
});
```

---

## Failure Modes

- **Flickering SVG Strokes:** Morphed SVG shapes flicker or disappear during transitions because the coordinates have mismatched point counts.
- **Browser Memory Crash:** Navigating rapidly back and forth between pages crashes the mobile browser tab because old timeline target references are never released.

## Validation

Cara memverifikasi kepatuhan penggunaan `animejs-animation`:

1. **Verify remove cleanups:**
   Ensure `anime.remove` is called when components or timelines are terminated:
   ```bash
   grep -rn "anime.remove" src/
   ```
2. **Scan for layout mutating css fields in targets:**
   ```bash
   grep -rn -E "(width|height|left|top|margin|padding):" src/ | grep "anime("
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Anime.js:

> "Use the skill `animejs-animation`. Read `.agent/skills/animejs-animation/SKILL.md` before coding. Avoid linear easings and layout-mutating animations. Always use spring/elastic curves, sequence overlapping timelines via relative offsets, and invoke `anime.remove(targets)` on component cleanup."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Multi-purpose animation timelines.
- [gsap-performance](../gsap-performance/SKILL.md) — Layout thrashing mitigations.
