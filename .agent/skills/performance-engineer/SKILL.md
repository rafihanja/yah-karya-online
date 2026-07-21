---
name: performance-engineer
description: Optimasi FPS layar, kecepatan muat, pencegahan re-render, dan perlindungan memori.
risk: medium (runtime performance impacts, memory leaks, main-thread blocking operations)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Performance Engineer

> **One-liner:** Guidelines for optimizing screen framerates (FPS), avoiding main-thread blockages, preventing layout thrashing, and resolving memory leaks.

## When to Use

- When writing high-frequency event handlers (scroll, resize, mousemove, touch).
- When resolving rendering lag (FPS dropping below 60fps) or long-running CPU tasks.
- When cleaning up memory leaks in single-page applications (SPA) during component unmounting.

## Why This Exists

A visually stunning interface is useless if it runs sluggishly or drains mobile batteries. If a developer attaches event listeners directly to page scroll without using throttling, the browser reflows the layout hundreds of times per second, dropping frames. Similarly, leaving active intervals or listeners running after a view is destroyed leaks memory, eventually crashing the user's browser. Enforcing event throttling, cleaning up resources, and offloading heavy tasks keeps the app running at a smooth 60 FPS.

## ALWAYS DO THIS

- **Throttle high-frequency scroll and resize listeners** — Limit updates to 16ms (60 FPS) or use `requestAnimationFrame` to match display refresh rates.
- **Clean up listeners and timers on unmount** — Remove every event listener, interval, and subscription during component lifecycle teardowns.
- **Offload heavy calculations to Web Workers** — Move CPU-intensive tasks (like image processing or data sorting) off the main thread to prevent UI freezing.
- **Scrutinize third-party library imports** — Import specific lodash functions (e.g. `import debounce from "lodash/debounce"`) rather than importing the entire package.
- **Batch DOM manipulation operations** — Write updates in bulk or use offscreen fragments to avoid triggering multiple layout reflows.

## NEVER DO THIS

- ❌ **DO NOT** attach raw, un-throttled callbacks to scroll, resize, or mousemove events. **Why fails:** Browsers fire these events dozens of times per frame, overloading the main thread and causing noticeable lag. **Instead:** Wrap callbacks in throttle or debounce handlers.
- ❌ **DO NOT** leave active `setInterval` loops or global window event listeners running after a component is unmounted. **Why fails:** The garbage collector cannot free the component's memory, causing memory leaks that slow down the device over time. **Instead:** Clean them up in the unmount callback.
- ❌ **DO NOT** import entire heavy libraries (e.g. `import _ from "lodash"`) if you only need a single function. **Why fails:** Increases bundle sizes unnecessarily, delaying initial page load times on slow mobile networks. **Instead:** Import only the required helper module.
- ❌ **DO NOT** read DOM properties (like `offsetHeight`) immediately after writing values to the DOM. **Why fails:** Triggers layout thrashing by forcing the browser to recalculate layouts multiple times in a single frame. **Instead:** Batch reads first, then write updates.

---

## High-Frequency Event Loop Lifecycle

Decoupling high-frequency event triggers from render operations prevents main-thread blockages:

```
[Raw Event Trigger] ──> [Throttle Wrapper (16ms)] ──> [requestAnimationFrame] ──> [DOM Update]
```

---

## Examples

### ✅ Good — Throttled Event Handlers, Dynamic Imports, and Resource Teardowns

#### 1. Accessible Scroll Tracker Component (`components/ScrollTracker.tsx`)
```typescript
import { useEffect, useState, useRef } from "react";

export function ScrollTracker() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // 1. Check tick status to prevent overloading the main thread
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
          
          setScrollProgress(progress);
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // 2. Clean up the event listener on unmount to prevent memory leaks
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
      <div className="h-full bg-blue-600 transition-all duration-75" style={{ width: `${scrollProgress}%` }} />
    </div>
  );
}
```

Why this passes: Uses `requestAnimationFrame` to sync scroll updates with display frames, adds `{ passive: true }` to keep scrolling smooth, and removes the listener when the component unmounts.

### ❌ Bad — Un-throttled Callbacks, Missing Cleanups, and Large Imports

```typescript
import { useEffect, useState } from "react";
// ERROR 1: Importing the entire lodash library instead of importing specific modules
import _ from "lodash"; 

export function BadScrollTracker() {
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    // ERROR 2: Attaching raw, un-throttled scroll callback blocks rendering
    window.addEventListener("scroll", () => {
      setYOffset(window.scrollY);
    });

    // ERROR 3: Omit unmount cleanup return handler leaks memory on destroy
  }, []);

  return <div>Offset: {yOffset}</div>;
}
```

Why this fails: Imports the whole lodash library, runs layout updates on every single scroll event without throttling, and leaves the event listener active after unmounting.

---

## Failure Modes

- **The Layout Thrashing Loop:** Mixing DOM reads and writes consecutively, forcing the browser to recalculate page layouts repeatedly.
- **The Ghost Event Leak:** Forgetting to remove event listeners on unmount, leading to memory leaks.
- **The Main-Thread Freeze:** Running heavy sorting or parsing loops on the main thread instead of offloading them.
- **The Un-throttled scroll lag:** Binding heavy logic directly to raw scroll triggers without using animation frames.
- **The Bloated Import Payload:** Importing large third-party library bundles instead of target modules.
- **The Stale Timer Leak:** Leaving active intervals or timeouts running after component unmounts.

## Validation

Audit event configurations, lifecycle cleanups, and asset dependencies:

1. **Identify un-throttled event listeners in code:**
   Scan code for high-frequency listeners:
   ```bash
   grep -rn "addEventListener('scroll'" src/ || grep -rn "addEventListener('resize'" src/
   # expected: High-frequency listeners utilize requestAnimationFrame or throttle wrappers.
   ```
2. **Verify cleanup methods inside useEffect hooks:**
   Verify removal patterns:
   ```bash
   grep -rn "addEventListener" src/ | grep -v "removeEventListener"
   # expected: Verification that every listener registered inside components is removed on unmount.
   ```
3. **Verify library import methods:**
   Check imports for lodash or moment:
   ```bash
   grep -rn "import _ from" src/ || grep -rn "import moment from" src/
   # expected: zero matches. Specific modules are imported individually.
   ```
4. **Identify long-running tasks (>50ms):**
   Audit performance profiles to confirm no single task blocks the main thread.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menyelesaikan masalah performa:

> "Use the skill `performance-engineer`. Read `.agent/skills/performance-engineer/SKILL.md` before coding. Never write un-throttled event listeners or omit lifecycle cleanup handlers. Always wrap high-frequency events in requestAnimationFrame, clean up listeners on unmount, and import library modules selectively."

## Related

- [performance-optimizer](../performance-optimizer/SKILL.md) — API bottleneck checks.
- [performance-profiling](../performance-profiling/SKILL.md) — Web Vitals audits.
- [web-performance-optimization](../web-performance-optimization/SKILL.md) — Core assets caching.
