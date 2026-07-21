---
name: barba-js
description: Fluid page transitions (SPA-like) without reloading for multi-page websites.
risk: high (broken scripts after transition, lost event listeners, duplicate timelines, scroll jumps)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# barba-js

> **One-liner:** Client-side routing manager that intercepts link clicks to load new pages asynchronously via AJAX, replacing content containers with smooth transitions.

## When to Use

- When building multi-page static websites that require smooth, SPA-like page transitions (e.g. creative portfolios, product showrooms, agency sites).
- When sequencing page-out and page-in animations using libraries like GSAP or Anime.js.
- When animating shared visual elements across different pages (shared layout transitions).

## Why This Exists

On standard multi-page websites, clicking a link triggers a full browser reload, resulting in a blank screen flash and destroying all active JavaScript states. Barba.js solves this by preventing the default link reload, fetching the target page in the background via Fetch/AJAX, and swapping the main container. However, since a full reload is bypassed, any scripts loaded on the first page will not execute on the new page, rendering dynamic components (like ScrollTriggers, click listeners, or sliders) completely dead after navigation.

## ALWAYS DO THIS

- **Wrap content in semantic data-attributes** — Format layouts using a parent `data-barba="wrapper"` and individual view containers marked with `data-barba="container"` and unique `data-barba-namespace`.
- **Re-initialize scripts in `afterEnter` hooks** — Always re-bind event listeners, slide scripts, and GSAP ScrollTriggers when the `afterEnter` lifecycle fires, as the old DOM node is completely replaced.
- **Return promises or timelines** — Return a Promise or a GSAP timeline from transition hooks (`leave`, `enter`) to prevent Barba from swapping containers before animations finish.
- **Kill old timelines on exit** — Revert and destroy any active animations, timelines, or scroll instances in the `leave` hook to prevent memory leaks.
- **Reset scroll position** — Scroll the window to the top (`window.scrollTo(0, 0)`) in `afterEnter` transitions to emulate a standard page load, unless building a continuous layout.

## NEVER DO THIS

- ❌ **DO NOT** assume scripts declared inline within `data-barba="container"` will execute automatically on container swap. **Why fails:** Browsers do not execute nested `<script>` tags injected via `innerHTML`, causing interactive features to break. **Instead:** Register page-specific initializers in Barba's lifecycle hooks (`beforeEnter`/`afterEnter`).
- ❌ **DO NOT** use Barba.js alongside Single Page Application frameworks (such as Next.js, Nuxt, or React Router). **Why fails:** SPA frameworks already manage client-side routing natively, and adding Barba causes critical navigation conflicts, routing loops, and crashes. **Instead:** Use native framework transitions (like Framer Motion).
- ❌ **DO NOT** leave GSAP ScrollTriggers running on unmounted containers. **Why fails:** Old scroll triggers continue tracking coordinates in the background against nonexistent nodes, dropping performance and throwing layout errors. **Instead:** Call `ScrollTrigger.getAll().forEach(t => t.kill())` on page exit.
- ❌ **DO NOT** forget to bind browser back and forward actions. **Why fails:** Visual transitions play during manual clicks, but using the browser's back button triggers instant, ugly jumps. **Instead:** Ensure transitions support standard popstate events.

## Examples

### ✅ Good — Barba Setup with GSAP Transition and Script Re-initialization

```javascript
import barba from "@barba/core";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 1. Page-specific initializers map
const pageInitializers = {
  home: () => {
    // Setup home page ScrollTriggers
    gsap.from(".hero-text", { opacity: 0, y: 30, scrollTrigger: ".hero-text" });
  },
  portfolio: () => {
    // Setup portfolio page scripts
    console.log("Portfolio page initialized");
  }
};

export function initBarbaTransitions() {
  barba.init({
    transitions: [{
      name: "fade-transition",
      
      // A. Leave: Animate current page container out
      leave(data) {
        // Kill all active ScrollTriggers to prevent memory leaks
        ScrollTrigger.getAll().forEach(t => t.kill());
        
        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.4
        });
      },
      
      // B. Enter: Animate next page container in
      enter(data) {
        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.4
        });
      }
    }],
    
    // C. Lifecycle Hook: Reset scroll and run page-specific scripts after swapping containers
    views: [{
      namespace: "home",
      afterEnter() {
        window.scrollTo(0, 0);
        pageInitializers.home();
      }
    }, {
      namespace: "portfolio",
      afterEnter() {
        window.scrollTo(0, 0);
        pageInitializers.portfolio();
      }
    }]
  });
}
```

Why this passes: Terminates active ScrollTriggers on leave, returns GSAP animations from lifecycle hooks, resets scroll positions, and re-binds page-specific scripts dynamically.

### ❌ Bad — Naked Page Swap with Broken Script Execution

```javascript
import barba from "@barba/core";

// ERROR 1: Simple initialization without cleaning up previous page timelines/ScrollTriggers
barba.init({
  transitions: [{
    name: "bad-transition",
    leave(data) {
      // ERROR 2: Does not return a Promise/GSAP animation, Barba swaps containers instantly
      document.querySelector(".current-page").style.opacity = 0;
    },
    enter(data) {
      document.querySelector(".next-page").style.opacity = 1;
      // ERROR 3: No script re-initialization, new page components remain static and broken
    }
  }]
});
```

Why this fails: Fails to return animations (causing layout jumps), does not clean up previous page states (leading to memory leaks), and does not re-initialize scripts on container swap.

---

## Technical Markup Setup
Ensure all multi-page HTML templates declare wrappers correctly:
```html
<!-- Base index.html layout wrapper -->
<body data-barba="wrapper">
  <!-- Navigation links remain outside the container to avoid reload -->
  <nav class="main-nav">
    <a href="/index.html">Home</a>
    <a href="/portfolio.html">Portfolio</a>
  </nav>

  <!-- Container swap target area -->
  <main data-barba="container" data-barba-namespace="home">
    <h1>Welcome Home</h1>
  </main>
</body>
```

---

## Failure Modes

- **Broken Forms or Event Listeners:** Navigating to a page containing interactive forms or sliders works on fresh load, but fails to respond when arrived at via Barba clicks.
- **Double Container Glitch:** Old page content is not deleted, resulting in the new page content appending below or above the old layout.

## Validation

Cara memverifikasi kepatuhan penggunaan `barba-js`:

1. **Verify ScrollTrigger cleanups on leave:**
   Ensure ScrollTrigger.kill() processes run in transition lifecycles:
   ```bash
   grep -rn "ScrollTrigger.getAll" src/
   ```
2. **Scan for re-initializers:**
   Check for afterEnter hook script configurations:
   ```bash
   grep -rn "afterEnter" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Barba.js:

> "Use the skill `barba-js`. Read `.agent/skills/barba-js/SKILL.md` before coding. Never omit target view initializations. Always return Promises/GSAP timelines from transition hooks, kill ScrollTriggers on exit, reset scroll positions to top on entry, and re-initialize event handlers inside `afterEnter` callbacks."

## Related

- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Dynamic scroll recalculations.
- [gsap-performance](../gsap-performance/SKILL.md) — Memory cleanup guidelines.
