---
name: gsap-frameworks
description: Official GSAP skill for Vue, Svelte, and other non-React frameworks — lifecycle, scoping selectors, and cleanup on unmount.
risk: medium (performance leaks and unmounted target references)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP with Vue, Svelte, and Other Frameworks

> **One-liner:** Guidelines for safe, leak-free animation lifecycle and scope management in non-React component frameworks (Vue, Nuxt, Svelte).

## When to Use

- When writing or reviewing GSAP animations in Vue (Vue 3 composition / options API), Nuxt 4, or Svelte (Svelte 4/5).
- When integrating smooth scrolling or ScrollTrigger animations into lifecycle hooks (`onMounted`/`onMount` and `onUnmounted`/`onDestroy`).
- When animating elements inside component subtrees without leaking handlers to the global document object.

## Why This Exists

Component frameworks frequently add, remove, or modify DOM nodes during state updates and routing. If a GSAP animation is initialized before the DOM is fully rendered (e.g., inside Vue's `setup()` or Svelte's script initialization), it will fail to find its targets and throw runtime exceptions. Furthermore, failing to revert animations and ScrollTriggers on component unmount keeps active timelines and scroll listeners in memory, leading to memory leaks and performance degradation.

## ALWAYS DO THIS

- **Initialize in mounted hooks** — Run GSAP animation setup inside `onMounted` (Vue) or `onMount` (Svelte) once the DOM nodes are fully compiled.
- **Wrap animations in `gsap.context()`** — Always encapsulate animations within `gsap.context(callback, scope)` passing the component's root reference as the scope to prevent selector leakage.
- **Clean up on unmount** — Always invoke `ctx.revert()` inside `onUnmounted` (Vue) or the returned cleanup function of `onMount` (Svelte) to terminate active animations and scroll listeners.
- **Bind refs directly** — Bind container DOM elements using native ref attributes (`ref="container"` in Vue, `bind:this={container}` in Svelte) to guarantee a stable reference for scoping.
- **Debounce ScrollTrigger.refresh() on dynamic updates** — Run `ScrollTrigger.refresh()` after framework tick cycles (e.g., `nextTick` in Vue or `tick` in Svelte) when injecting dynamic lists or AJAX data.

## NEVER DO THIS

- ❌ **DO NOT** instantiate animations or query selectors outside lifecycle hooks. **Why fails:** The DOM structure has not been generated, resulting in target unmounted errors and broken animations. **Instead:** Keep all GSAP initializations inside mounted hooks.
- ❌ **DO NOT** target global document classes (e.g. `gsap.to(".box", ...)`) directly inside a component. **Why fails:** Animates elements with the same class names in other components on the page, introducing visual conflicts. **Instead:** Scope the selector using `gsap.context(..., containerRef)`.
- ❌ **DO NOT** use React-specific hooks like `useGSAP()` in Vue or Svelte. **Why fails:** Throws runtime compilation errors since the hook is designed specifically for React's virtual DOM reconciliation. **Instead:** Use vanilla lifecycle hooks combined with `gsap.context()`.
- ❌ **DO NOT** register GSAP plugins inside the component body. **Why fails:** Causes redundant plugin registrations on every re-render or component instantiation. **Instead:** Call `gsap.registerPlugin()` once in the app entry file (e.g., `main.js`).

## Examples

### ✅ Good — Vue 3 script setup with Context Scope & Revert

```html
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const container = ref(null);
let ctx;

onMounted(() => {
  if (!container.value) return;
  
  // Scopes all animation selector queries to this component's DOM tree
  ctx = gsap.context(() => {
    gsap.to(".box", { x: 100, duration: 0.6 });
    gsap.from(".item", { opacity: 0, y: 10, stagger: 0.1 });
  }, container.value);
});

onUnmounted(() => {
  // Safe cleanup: kills all tweens, ScrollTriggers, and reverts styles
  ctx?.revert();
});
</script>

<template>
  <div ref="container">
    <div class="box">Box</div>
    <div class="item">Item</div>
  </div>
</template>
```

Why this passes: Scopes queries using `gsap.context`, delays instantiation until `onMounted`, and guarantees unmount cleanup using `ctx.revert()`.

### ❌ Bad — Vue 3 Setup without Scoping and Cleanup

```html
<script setup>
import { ref } from "vue";
import { gsap } from "gsap";

// ERROR 1: Executed synchronously during setup before template is compiled/rendered
gsap.to(".leaky-box", { x: 100 });

// ERROR 2: No mounting hooks used, no scoping context declared, and no cleanup
</script>

<template>
  <div class="leaky-box">Leaky Box</div>
</template>
```

Why this fails: Triggers animations before the target is rendered in the DOM, targets a global selector string, and leaks the animation memory structure upon component destruction.

---

## Detailed Framework Integrations

### Vue 3 Composition API (setup option)
```javascript
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";

export default {
  setup() {
    const container = ref(null);
    let ctx;

    onMounted(() => {
      ctx = gsap.context(() => {
        gsap.to(".target", { scale: 1.1 });
      }, container.value);
    });

    onUnmounted(() => {
      ctx?.revert();
    });

    return { container };
  }
};
```

### Svelte Setup
Svelte allows returning a cleanup function directly from `onMount`.
```html
<script>
  import { onMount } from "svelte";
  import { gsap } from "gsap";

  let container;

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.to(".box", { rotation: 360 });
    }, container);
    
    // Returns cleanup automatically run on component destroy
    return () => ctx.revert();
  });
</script>

<div bind:this={container}>
  <div class="box">Svelte Box</div>
</div>
```

---

## Failure Modes

- **Orphaned ScrollListeners:** Navigating between routes inside a Single Page App (SPA) causes scroll performance to drop because old ScrollTriggers were not reverted.
- **Unmounted Target Warnings:** Browser console prints warnings stating that GSAP cannot resolve target DOM nodes during component load.

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-frameworks`:

1. **Verify Mount Initializations:**
   Check that GSAP initializations are within `onMounted` or `onMount` blocks:
   ```bash
   grep -rn "gsap.to(" src/ | grep -v "onMounted" | grep -v "onMount"
   ```
2. **Scan for global DOM queries in hooks:**
   Ensure `gsap.context` scope container references are passed:
   ```bash
   grep -rn "gsap.context(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis animasi GSAP di Vue/Svelte:

> "Use the skill `gsap-frameworks`. Read `.agent/skills/gsap-frameworks/SKILL.md` before coding. Never instantiate animations outside lifecycle hooks. Always wrap animation scripts inside `onMounted` (Vue) or `onMount` (Svelte), declare a `gsap.context(..., containerRef)` scope, and invoke `ctx.revert()` inside unmount hooks to prevent memory leaks."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Base transform mechanisms.
- [gsap-timeline](../gsap-timeline/SKILL.md) — sequenced timelines.
- [gsap-scrolltrigger](../gsap-scrolltrigger/SKILL.md) — Scroll-driven layouts.
- [gsap-react](../gsap-react/SKILL.md) — React-specific lifecycle integrations.
