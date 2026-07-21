---
name: locomotive-scroll
description: Smooth scrolling and parallax effects with intersection observer and custom scroll-trigger proxies.
risk: high (performance overhead, layout calculation mismatches, broken scroll-linked features)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# locomotive-scroll

> **One-liner:** Heavy-duty smooth scrolling library featuring built-in layout-independent parallax, scroll-triggered class toggles, and velocity modifiers.

## When to Use

- When building web experiences that require per-element scroll speed multipliers (e.g. `data-scroll-speed="3"`).
- When triggering scroll-inview styling toggles (e.g. `.is-inview`) using native IntersectionObservers.
- When creating momentum-based smooth scroll layouts where scroll positions are translated entirely via CSS transforms.

## Why This Exists

Because Locomotive Scroll completely hijacks browser scroll events by nesting contents inside a translated `translate3d` wrapper, standard window-based scroll positions remain at zero. This layout-mutating approach breaks all default ScrollTrigger coordinates and scroll-linked logic. To resolve this, a proxy hook (`ScrollTrigger.scrollerProxy`) must be configured to read coordinates directly from Locomotive Scroll's local APIs. Failing to destroy instances or refresh heights when dynamic images load breaks scroll calculations.

## ALWAYS DO THIS

- **Structure HTML with specific data-attributes** — Wrap all scrollable sections inside a container marked with `data-scroll-container` and individual areas with `data-scroll-section`.
- **Register ScrollTrigger scrollerProxy** — Always establish `ScrollTrigger.scrollerProxy(container, ...)` to map Locomotive Scroll's coordinates back to GSAP.
- **Bind events to ScrollTrigger.update** — Ensure Locomotive scroll listeners update ScrollTrigger by calling `scrollInstance.on("scroll", ScrollTrigger.update)`.
- **Destroy instances on unmount** — Always call `scrollInstance.destroy()` when switching routes or unmounting components to avoid memory leaks.
- **Refresh heights on content injection** — Invoke `scrollInstance.update()` after AJAX content injections or when lazy-loaded images resolve to recalculate bounds.

## NEVER DO THIS

- ❌ **DO NOT** use Locomotive Scroll alongside other smooth scroll engines (such as Lenis or GSAP ScrollSmoother) on the same page. **Why fails:** The scroll containers fight for DOM translation control, locking scroll interaction and freezing rendering layers. **Instead:** Select only one smooth scroll library.
- ❌ **DO NOT** use CSS `position: fixed` elements inside a container managed by Locomotive Scroll. **Why fails:** The wrapper's `transform` establishes a new local coordinate context, forcing `position: fixed` elements to behave like absolute elements and scroll off-screen. **Instead:** Use `data-scroll-sticky` or place fixed elements outside the scroll container.
- ❌ **DO NOT** omit the `data-scroll-section` attributes on large pages. **Why fails:** Locomotive Scroll maps heights globally, leading to performance bottlenecks during translate cycles and rendering glitches on mobile viewports. **Instead:** Segment content into logical sections.
- ❌ **DO NOT** forget to call `destroy()` in Single Page Applications (SPAs). **Why fails:** Transform coordinate calculations and window listeners stack on every route transition, locking up the CPU and freezing page loads. **Instead:** Revert and destroy in unmount loops.

## Examples

### ✅ Good — Setup with GSAP scrollerProxy and Cleanup

```javascript
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLocomotiveScroll(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return null;

  // Initialize Locomotive Scroll v4
  const scroller = new LocomotiveScroll({
    el: container,
    smooth: true,
    multiplier: 1,
    lerp: 0.1
  });

  // 1. Tell ScrollTrigger to listen to scroll updates from Locomotive
  scroller.on("scroll", ScrollTrigger.update);

  // 2. Setup Scroller Proxy so ScrollTrigger reads coordinates from Locomotive transforms
  ScrollTrigger.scrollerProxy(container, {
    scrollTop(value) {
      return arguments.length 
        ? scroller.scrollTo(value, 0, 0) 
        : scroller.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    // Pinning handles translate offsets instead of fixed positioning
    pinType: container.style.transform ? "transform" : "fixed"
  });

  // 3. Keep ScrollTrigger refreshed
  ScrollTrigger.addEventListener("refresh", () => scroller.update());
  ScrollTrigger.refresh();

  // Return cleanup function
  return () => {
    ScrollTrigger.removeEventListener("refresh", () => scroller.update());
    scroller.destroy();
  };
}
```

Why this passes: Integrates scrollerProxy correctly, binds event updates, updates boundaries on refresh, and cleanly destroys the instance on unmount.

### ❌ Bad — Naked Setup with Position Fixed Inside Container

```javascript
import LocomotiveScroll from "locomotive-scroll";

// ERROR 1: Naked initialization without ScrollTrigger proxy or cleanup
const scroll = new LocomotiveScroll({
  el: document.querySelector("[data-scroll-container]"),
  smooth: true
});

// HTML markup has position: fixed nav inside [data-scroll-container]
// ERROR 2: No scroll.destroy() call provided, causing memory leaks
```

Why this fails: Lacks integration with ScrollTrigger (breaking all scroll animations), causes layout bugs on elements using `position: fixed`, and leaks memory when routes change.

---

## Technical Markup Guide

Ensure layouts match the following structure:
```html
<div data-scroll-container>
  <!-- Nav bar must be outside or set with data-scroll-sticky -->
  <header data-scroll-section>
    <h1 data-scroll data-scroll-speed="2">Pro Parallax</h1>
  </header>
  <main data-scroll-section>
    <div data-scroll data-scroll-repeat="true" data-scroll-class="revealed">
      Reveals class when inside viewport
    </div>
  </main>
</div>
```

---

## Failure Modes

- **Frozen scroll during route changes:** Navigating back to a page leaves a duplicate hidden wrapper instance, rendering the site completely unscrollable.
- **ScrollTrigger markers out of bounds:** Scroll markers float static in the viewport or do not align with visual triggers due to missing scrollerProxy declarations.

## Validation

Cara memverifikasi kepatuhan penggunaan `locomotive-scroll`:

1. **Verify scrollerProxy is configured:**
   Check for proxy configurations on projects importing Locomotive:
   ```bash
   grep -rn "scrollerProxy" src/
   ```
2. **Scan for markup sections:**
   Verify HTML files containing containers also declare section wrappers:
   ```bash
   grep -rn "data-scroll-container" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Locomotive Scroll:

> "Use the skill `locomotive-scroll`. Read `.agent/skills/locomotive-scroll/SKILL.md` before coding. Ensure HTML layouts follow strict data-scroll structures. Always configure the ScrollTrigger `scrollerProxy` mapping, register scroll updates correctly, refresh heights dynamically after DOM manipulations, and destroy instances on component unmount."

## Related

- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Custom scrolling integration.
- [lenis-scroll](../lenis-scroll/SKILL.md) — Main-thread smooth scrolling alternative.
