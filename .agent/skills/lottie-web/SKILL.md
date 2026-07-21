---
name: lottie-web
description: Render After Effects animations natively on the web using Adobe After Effects JSON exports.
risk: medium (bundle overhead, high CPU usage on mobile, main thread parsing blocks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# lottie-web

> **One-liner:** Browser rendering engine that compiles Adobe After Effects vector animations exported as JSON (Bodymovin) into high-performance SVGs, Canvas, or HTML layers.

## When to Use

- When rendering complex vector animations (such as dynamic illustrations, onboarding walkthroughs, micro-interactions, or animated icons).
- When resolution-independent assets are required across varying screen densities (utilizing the SVG renderer).
- When integrating animations that need precise interactive control (scroll triggers, hover events, click-to-playback).

## Why This Exists

Although CSS and SVG animations are excellent for simple shapes, complex storyboards exported from Adobe After Effects are nearly impossible to code manually. `lottie-web` reads automated vector path maps from JSON models and converts them into browser-native animations. However, raw JSON exports can be extremely large (often exceeding 500KB), which blocks the main thread during parsing and consumes massive amounts of mobile CPU power. Furthermore, failing to unbind active frame loops when components unmount causes severe memory leaks.

## ALWAYS DO THIS

- **Use the SVG renderer** — Declare `renderer: 'svg'` for clean, crisp, resolution-independent vector scaling.
- **Destroy instances on unmount** — Always trigger `animationInstance.destroy()` in component cleanups to terminate active requestAnimationFrame rendering loops.
- **Lazy-load Lottie libraries and JSON assets** — Use dynamic imports or code-splitting to load the Lottie engine and JSON assets only when they enter the viewport.
- **Embed small JSON inline** — When an animation is critical to the Largest Contentful Paint (LCP) and has a file size below 50KB, import and bundle it directly as `animationData` to bypass network fetches.
- **Provide semantic fallbacks** — Ensure container divs have an `aria-label` detailing the animation's content, and include a static fallback graphic for systems where JavaScript is disabled.

## NEVER DO THIS

- ❌ **DO NOT** import the heavy `lottie-web` package globally in main bundles. **Why fails:** Bloats the initial JavaScript payload by over 250KB, dropping Google Lighthouse performance ratings. **Instead:** Dynamically import the player or use the lightweight version `lottie-web/build/player/lottie_light.min.js` which only includes the SVG renderer.
- ❌ **DO NOT** use `renderer: 'html'` for animations containing complex SVG masks, blend modes, or layers. **Why fails:** Most modern vector layout features are unsupported in the HTML renderer, leading to visual artifacts and broken shapes. **Instead:** Always declare `renderer: 'svg'` or `renderer: 'canvas'` for dense particle layouts.
- ❌ **DO NOT** loop animations indefinitely in the background when they are out of the viewport. **Why fails:** Consumes user battery power and CPU cycles on mobile devices, dropping screen frame rates. **Instead:** Use an IntersectionObserver to pause the animation when hidden.
- ❌ **DO NOT** embed large JSON structures (>200KB) inline inside HTML files. **Why fails:** Bloats HTML document parsing times and prevents browsers from caching the animation assets. **Instead:** Load files asynchronously via a path reference.

## Examples

### ✅ Good — React Setup with Lazy Loading, Viewport Pause, and Cleanup

```javascript
import { useEffect, useRef } from "react";

export function LazyLottiePlayer({ animationPath }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    let active = true;

    // 1. Asynchronously load Lottie only when component mounts
    const initLottie = async () => {
      const lottie = (await import("lottie-web/build/player/lottie_light.js")).default;
      const animationData = await fetch(animationPath).then(res => res.json());

      if (!active || !containerRef.current) return;

      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false, // Control playback via intersection observer
        animationData
      });

      // 2. Play only when container is visible in the viewport
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          animRef.current?.play();
        } else {
          animRef.current?.pause();
        }
      }, { threshold: 0.1 });

      observer.observe(containerRef.current);
    };

    initLottie();

    // 3. Unmount Cleanup: terminates active RAF loops and observer bindings
    return () => {
      active = false;
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, [animationPath]);

  return (
    <div 
      ref={containerRef} 
      className="lottie-wrapper"
      role="img"
      aria-label="Interactive vector presentation animation"
    />
  );
}
```

Why this passes: Dynamically imports the lightweight player, halts playback when out of view, uses custom aria labels, and cleans up the instance on unmount.

### ❌ Bad — Static Imports and Missing Animation Cleanup

```javascript
// ERROR 1: Heavy core bundle imported synchronously
import lottie from "lottie-web";

export function BadLottiePlayer() {
  const containerId = "bad-lottie-container";

  // ERROR 2: Inisialisasi langsung tanpa useEffect, container DOM mungkin belum ada
  lottie.loadAnimation({
    container: document.getElementById(containerId),
    renderer: "html", // ERROR 3: html renderer lacks layer mask support
    loop: true,
    autoplay: true,
    path: "/animations/massive-heavy.json"
  });

  // ERROR 4: No component unmount hooks, leading to background memory leaks
  return <div id={containerId} />;
}
```

Why this fails: Bloats bundle size with static imports, initializes before component is mounted, uses the buggy HTML renderer, and leaks memory cycles indefinitely after the page changes.

---

## Technical Easing Controls
To link animations to scroll progress or external inputs:
```javascript
// Map scroll percentage (0 to 1) directly to animation frames
const totalFrames = anim.totalFrames;
window.addEventListener("scroll", () => {
  const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  anim.goToAndStop(scrollPercent * totalFrames, true);
});
```

---

## Failure Modes

- **Stuttering on Onboarding Screens:** Heavy vector calculations parsing detailed shape matrices lock the browser main thread, causing page scrolling to lag.
- **Orphaned Audio or Timers:** Complex Lottie shapes containing embedded triggers continue executing background callbacks after route navigation.

## Validation

Cara memverifikasi kepatuhan penggunaan `lottie-web`:

1. **Verify destroy lifecycle calls:**
   Ensure cleanup methods exist on components initiating Lottie:
   ```bash
   grep -rn "destroy()" src/
   ```
2. **Scan for light player imports:**
   Ensure imports select the lightweight variant to exclude heavy Canvas/HTML parsers:
   ```bash
   grep -rn "lottie_light" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Lottie:

> "Use the skill `lottie-web`. Read `.agent/skills/lottie-web/SKILL.md` before coding. Never import lottie-web synchronously in main bundles. Always load dynamically, select the light player format, synchronize playback with an IntersectionObserver to avoid background CPU drains, and trigger `.destroy()` on unmount."

## Related

- [gsap-performance](../gsap-performance/SKILL.md) — Thread optimization.
- [framer-motion](../framer-motion/SKILL.md) — React animation orchestrations.
