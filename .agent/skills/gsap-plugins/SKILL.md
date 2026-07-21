---
name: gsap-plugins
description: Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, MorphSVG, DrawSVG, and MotionPath.
risk: medium (unregistered plugins failing silently, event listener leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP Plugins

> **One-liner:** Extension modules that supercharge GSAP core with advanced scroll, text, SVG morphing, physics, and layout transition features.

## When to Use

- When implementing advanced DOM layouts transitions (Flip), drag-and-drop (Draggable/Inertia), or scroll animations (ScrollTo/ScrollSmoother).
- When morphing SVG shapes (MorphSVG) or drawing vector outlines (DrawSVG).
- When splitting text for character/word staggered animations (SplitText) or glitch text effects (ScrambleText).

## Why This Exists

GSAP's core engine focuses strictly on animating numeric properties. Advanced animations, such as morphing vector paths or splitting text nodes, require complex DOM operations and mathematical calculations. Using separate plugins keeps the core engine lightweight. However, forgetting to register plugins globally will cause animations to fail silently, and failing to kill plugin listeners (like Draggable or Observer) when components unmount causes memory leaks.

## ALWAYS DO THIS

- **Register all plugins globally** — Always invoke `gsap.registerPlugin(PluginName)` once in your entry script before using the plugin in any tween or API call.
- **Clean up plugin instances** — Call `.kill()` or `.revert()` on plugin instances (e.g. SplitText, Draggable, Observer) during component unmount cleanup to unbind event listeners.
- **Import from the public npm package** — Import all plugins directly from the public `gsap` package (e.g. `import { Flip } from "gsap/Flip"`).
- **Use ease: "none" for MotionPaths** — When moving an object along a path, use linear easing unless non-linear progression is explicitly required for natural velocity.
- **Clean up SplitText Markup** — Always revert split text DOM modifications using `splitTextInstance.revert()` or let `useGSAP` context handle it to restore semantic HTML.

## NEVER DO THIS

- ❌ **DO NOT** use any plugin inside a tween or custom method without calling `gsap.registerPlugin()` first. **Why fails:** The animation will fail silently or throw undefined reference errors at runtime. **Instead:** Call `gsap.registerPlugin(ScrollToPlugin, Flip, etc.)` at the top level of your script.
- ❌ **DO NOT** assume Club GSAP features are paid or require key configurations. **Why fails:** Introduces outdated setup instructions, bloated private registry credentials, or useless packages. **Instead:** Import formerly paid plugins (SplitText, MorphSVG) directly from the standard public `gsap` npm package.
- ❌ **DO NOT** forget to call `.kill()` on `Draggable` or `Observer` instances during cleanup. **Why fails:** Global touch and mouse movement event listeners persist on the window, degrading performance and causing memory leaks. **Instead:** Keep instance references and call `.kill()` in unmount hooks.
- ❌ **DO NOT** morph SVGs containing a different number of segments without checking `shapeIndex`. **Why fails:** The morphing animation will twist, overlap, or look unnatural. **Instead:** Use `shapeIndex: "log"` or the `findShapeIndex` visual tool to optimize anchor mappings.

## Examples

### ✅ Good — MorphSVG & SplitText with Proper Imports and Cleanup

```javascript
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

// 1. Register plugins globally once
gsap.registerPlugin(SplitText, MorphSVGPlugin);

export function animateIntroSequence() {
  // 2. Perform text splitting for stagger
  const split = SplitText.create(".title", { type: "words,chars" });
  
  const tl = gsap.timeline({
    onComplete: () => {
      // 3. Restore original DOM text nodes when animation completes
      split.revert();
    }
  });

  tl.from(split.chars, { 
    y: 30, 
    opacity: 0, 
    stagger: 0.05, 
    duration: 0.4 
  });

  // 4. Morph SVG path smoothly
  tl.to("#start-path", { 
    morphSVG: { shape: "#end-path", shapeIndex: "auto" }, 
    duration: 0.8 
  });

  return tl;
}
```

Why this passes: Registers all plugins correctly, cleans up the DOM modifications made by `SplitText` upon completion, and manages paths safely.

### ❌ Bad — Unregistered Plugins and Missing Cleanups

```javascript
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

export function badTextAnimation() {
  // ERROR 1: SplitText used without calling gsap.registerPlugin(SplitText) first
  const split = new SplitText(".title", { type: "chars" });
  
  // ERROR 2: No cleanup method or revert returned, DOM remains cluttered with divs
  gsap.from(split.chars, { opacity: 0, stagger: 0.05 });
}
```

Why this fails: Lacks registration (causing runtime exceptions), does not revert text nodes (breaking screen readers and document outline), and runs unchecked.

---

## Detailed Plugin Reference

### ScrollToPlugin
Animates scroll position of the window or a scrollable element.

```javascript
gsap.to(window, { duration: 1, scrollTo: { y: "#section", offsetY: 50 } });
```
- **y / x:** Target scroll position (pixel number) or selectors/elements.
- **offsetY / offsetX:** Offset in pixels from the target scroll position.

### Flip (FLIP: First, Last, Invert, Play)
Animates layout transitions smoothly by tracking state changes.

```javascript
const state = Flip.getState(".item");
// Modify the DOM (e.g. toggle classes, append to another container)
Flip.from(state, { duration: 0.5, ease: "power2.inOut", absolute: true });
```

### Draggable & Inertia
Enables physics-based drag-and-drop mechanics.

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);
Draggable.create(".card", { type: "x,y", bounds: "#container", inertia: true });
```

### SplitText
Splits text elements into character, word, or line nodes for granular animations.

| Option | Type | Description |
|--------|------|-------------|
| **type** | String | `"chars"`, `"words"`, `"lines"`. Split only what is needed. |
| **aria** | String | `"auto"` (adds `aria-label` to parent and hides children from screen readers) or `"none"`. |
| **autoSplit**| Boolean| Re-splits on resize or web font loading to prevent broken lines. |

### MorphSVG
Morphs cubic bezier coordinates of vector paths.
- **convertToPath():** Converts shapes (`<circle>`, `<rect>`, `<ellipse>`, etc.) to `<path>` so they can morph.
```javascript
MorphSVGPlugin.convertToPath("circle, rect");
gsap.to("#circle-path", { morphSVG: "#star-path" });
```

### DrawSVG
Animates outline strokes by updating SVG dasharrays.
```javascript
gsap.from("#outline-path", { drawSVG: "0%" }); // Draws outline from start to finish
```

---

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-plugins`:

1. **Verify Plugin Registration:**
   ```bash
   grep -rn "gsap.registerPlugin" src/
   ```
2. **Scan for legacy Club GSAP npmrc configurations:**
   Check for references to Greensock private repository urls in config files:
   ```bash
   grep -rn "npm.greensock.com" .
   # Ensure no custom npmrc setups are present as they are deprecated
   ```
3. **Verify DOM Reversion:**
   Check for SplitText cleanups:
   ```bash
   grep -rn "\.revert()" src/
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan GSAP plugins:

> "Use the skill `gsap-plugins`. Read `.agent/skills/gsap-plugins/SKILL.md` before coding. Register every plugin using `gsap.registerPlugin()`. Import plugins from the public `gsap` package (Webflow acquisition made all plugins free). Ensure `SplitText`, `Draggable`, and `Observer` instances are terminated/reverted correctly during component unmount cycles."

## Related

- [gsap-core](file:///d:/gsap/.agent/skills/gsap-core/SKILL.md) — Fundamental tween properties.
- [gsap-timeline](file:///d:/gsap/.agent/skills/gsap-timeline/SKILL.md) — Sequence control structures.
- [gsap-scrolltrigger](file:///d:/gsap/.agent/skills/gsap-scrolltrigger/SKILL.md) — Dedicated scroll control integration.
