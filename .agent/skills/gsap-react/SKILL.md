---
name: gsap-react
description: Official GSAP skill for React — integration, useGSAP hook, scoping refs, contextSafe, and StrictMode compatibility.
risk: high (memory leaks, unmounted target errors, double-firing in StrictMode)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP with React

> **One-liner:** Seamless, leak-free animation orchestration in React utilizing the official `@gsap/react` hook ecosystem.

## When to Use

- When animating React components or layouts in Next.js, Vite, or Gatsby.
- When creating animations that depend on React state or layout cycles (e.g. dynamic sizing, mount/unmount fades).
- When resolving rendering issues, layout jumping, or memory leaks caused by React re-renders or StrictMode.

## Why This Exists

React's rendering lifecycle (which frequently recreates virtual DOM structures and re-runs component functions) clashes directly with GSAP's direct DOM mutation approach. If a component re-renders or unmounts while a GSAP tween is running, the target elements may become detached, leading to memory leaks and errors. Furthermore, React's StrictMode renders hooks twice in development, which causes animations to fire twice, creating double-bound events and visual glitches.

## ALWAYS DO THIS

- **Register useGSAP globally** — Always call `gsap.registerPlugin(useGSAP)` once in your entry file (e.g., `main.js` or `_app.js`) before calling `useGSAP`.
- **Use the `useGSAP()` hook** — Prefer `useGSAP()` over standard `useEffect()` for configuring animations; it handles cleanup and revert automatically on unmount.
- **Use local ref scoping** — Always pass a `scope` reference (e.g. `useGSAP(() => {}, { scope: containerRef })`) so selector strings are localized and do not animates elements outside the component.
- **Wrap callbacks in `contextSafe`** — Wrap event handlers (like click click/pointer moves) that instantiate new animations *after* initial mount in `contextSafe` to clean them up properly.
- **Cleanup manually in standard useEffect** — If `@gsap/react` is not available, always call `gsap.context()` inside `useEffect()` and return `() => ctx.revert()`.

## NEVER DO THIS

- ❌ **DO NOT** target elements using global selector strings (`gsap.to(".box", ...)`) without a defined `scope`. **Why fails:** Animates elements with the same class names in other components across the DOM, causing massive visual bugs. **Instead:** Pass the container ref as a scope parameter.
- ❌ **DO NOT** omit the cleanup return function if using vanilla `useEffect()`. **Why fails:** Orphaned animations and ScrollTriggers continue to run on unmounted DOM elements in the background, consuming CPU resources. **Instead:** Return `() => ctx.revert()` or let `useGSAP()` do it.
- ❌ **DO NOT** animate React state values directly inside GSAP vars objects. **Why fails:** Causes conflicting state updates and infinite re-render loops in React. **Instead:** Target DOM refs directly and animate CSS properties.
- ❌ **DO NOT** instantiate animations inside the component render path (outside hooks). **Why fails:** Re-creates the animation objects on every single state update or render, freezing the browser. **Instead:** Wrap all animation setup inside `useGSAP()` or event handlers.

## Examples

### ✅ Good — Clean useGSAP Hook with Scoped Refs

```jsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function AnimatedCard() {
  const containerRef = useRef(null);
  
  // Setup scoped animation. Reverts automatically on unmount or hot-reload.
  const { contextSafe } = useGSAP(() => {
    gsap.from(".card-title", { 
      y: 20, 
      opacity: 0, 
      duration: 0.5 
    });
  }, { scope: containerRef });

  // Safe animation instantiation in callback
  const onHover = contextSafe(() => {
    gsap.to(".card-badge", { 
      scale: 1.1, 
      duration: 0.2 
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(".card-badge", { 
      scale: 1, 
      duration: 0.2 
    });
  });

  return (
    <div 
      ref={containerRef} 
      className="card" 
      onMouseEnter={onHover} 
      onMouseLeave={onLeave}
    >
      <div className="card-badge">New</div>
      <h2 className="card-title">Premium Animation</h2>
    </div>
  );
}
```

Why this passes: Scopes all selectors to `containerRef`, handles setup inside `useGSAP`, and wraps dynamic hover handlers in `contextSafe` to prevent leaks.

### ❌ Bad — Global Selectors and Leaky useEffect Setup

```jsx
import { useEffect } from "react";
import gsap from "gsap";

export function LeakyCard() {
  useEffect(() => {
    // ERROR 1: Targets global selector, can affect other instances
    gsap.from(".card-title", { y: 20, opacity: 0 });

    const handleHover = () => {
      // ERROR 2: Creates orphaned tween on click/hover without context
      gsap.to(".card-badge", { scale: 1.1 });
    };

    document.querySelector(".card").addEventListener("mouseenter", handleHover);
    
    // ERROR 3: Missing cleanup return function!
  }, []);

  return (
    <div className="card">
      <div className="card-badge">New</div>
      <h2 className="card-title">Leaky Animation</h2>
    </div>
  );
}
```

Why this fails: Animates global selectors, does not clean up the main animation or hover listener on unmount, and lacks scoping, leading to memory leaks and cross-component interference.

---

## Technical Details

### useGSAP Config Object
The second argument of `useGSAP` can be a dependency array, or a configuration object:
```javascript
useGSAP(() => {
  gsap.to(".box", { x: endX });
}, {
  dependencies: [endX],     // Triggers re-synchronization when endX changes
  scope: containerRef,      // Limits selectors to children of containerRef
  revertOnUpdate: true      // Reverts all animations before re-running
});
```

### StrictMode & SSR Considerations
1. **StrictMode:** React renders twice in development. `useGSAP` handles this natively by reverting the first render's animations during the second mount, preventing duplicate/glitched timelines.
2. **Server-Side Rendering (Next.js):** GSAP depends on DOM APIs. Ensure imports or logic do not execute on the server. All animation code must remain inside `useGSAP` (which executes client-side only).

---

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-react`:

1. **Verify useGSAP Import Pattern:**
   ```bash
   grep -rn "import { useGSAP }" src/
   ```
2. **Scan for missing scope references:**
   Ensure `useGSAP` calls pass a scope property or references:
   ```bash
   grep -rn "useGSAP(" src/ | grep -v "scope"
   # Verify if any useGSAP call omits scoping config (except trivial global ones)
   ```
3. **Verify strict-mode double mount behavior:**
   Run the local build to ensure components load correctly under React StrictMode:
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan GSAP di React:

> "Use the skill `gsap-react`. Read `.agent/skills/gsap-react/SKILL.md` before coding. Register the `useGSAP` plugin globally. Do not use plain `useEffect` without `gsap.context()` for animations. Always pass a `scope` (ref) to `useGSAP`, wrap interactive callbacks in `contextSafe`, and ensure SSR components only run GSAP on the client."

## Related

- [gsap-core](file:///d:/gsap/.agent/skills/gsap-core/SKILL.md) — Base transform mechanisms.
- [gsap-timeline](file:///d:/gsap/.agent/skills/gsap-timeline/SKILL.md) — Creating sequenced timelines.
- [gsap-performance](file:///d:/gsap/.agent/skills/gsap-performance/SKILL.md) — Animating 60 FPS in React apps.
