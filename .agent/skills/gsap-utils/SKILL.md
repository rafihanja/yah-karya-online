---
name: gsap-utils
description: Official GSAP skill for gsap.utils — clamp, mapRange, normalize, interpolate, random, snap, toArray, wrap, and pipe helper utilities.
risk: low (calculation bugs, static values in dynamic triggers)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# gsap.utils

> **One-liner:** Pure utility functions for handling numbers, ranges, colors, arrays, and selectors in animations.

## When to Use

- When constraint checking, mapping, or normalizing values (e.g. mapping vertical scroll positions to container opacity).
- When converting collections (HTMLCollection, NodeList, selector strings) to true arrays (`gsap.utils.toArray()`).
- When randomizing variables, snapping elements to layout grids, or composition-piping multiple transforms.

## Why This Exists

Writing custom mathematics logic for bounding, mapping, or randomizing values is not only tedious but also prone to performance bottlenecks and edge-case bugs (such as NaN returns or incorrect bounds). `gsap.utils` functions are highly optimized, compiled directly inside the GSAP core package, and handle edge cases natively. Using custom math helpers instead of native GSAP utils wastes CPU overhead and bloats the codebase.

## ALWAYS DO THIS

- **Use `gsap.utils.toArray()` for collection handling** — Always use `toArray` instead of `Array.from(querySelectorAll)` to handle selectors, arrays, and singular elements uniformly.
- **Utilize the function form (currying)** — Omit the final value argument to return a reusable calculation function when performing operations repeatedly (e.g., in `scroll` or `mousemove` callbacks).
- **Use `gsap.utils.clamp()` to bind values** — Constrain numbers within acceptable minimum/maximum boundaries before applying them to styles.
- **Map scroll positions using `gsap.utils.mapRange()`** — Map values from one numeric scale to another (e.g. scroll ranges `0` to `2000` mapped to opacity scale `0` to `1`) using `mapRange`.
- **Pass true to `random()` for reusable functions** — Set the last argument to `true` when calling `gsap.utils.random()` to generate a reusable randomizer function (e.g., `let randomFn = gsap.utils.random(-100, 100, 10, true)`).

## NEVER DO THIS

- ❌ **DO NOT** write custom interpolation, rounding, or clamping arithmetic functions. **Why fails:** Bloats the workspace with redundant functions and introduces potential rounding or layout edge-case bugs. **Instead:** Use the tested utility equivalents on `gsap.utils` directly.
- ❌ **DO NOT** execute `gsap.utils.random()` directly inside active scrubbed ScrollTrigger tween objects. **Why fails:** Re-calculates a random coordinate on every single frame refresh, causing the animation to jump erratically. **Instead:** Generate the random value once, store it, or use staggered delay distributions.
- ❌ **DO NOT** assume `mapRange` or `normalize` parse units (e.g. `"px"`, `"%"`). **Why fails:** Passing strings with units to mathematical functions returns `NaN`, breaking calculations. **Instead:** Run `getUnit()` or `unitize()` to separate/append CSS units.
- ❌ **DO NOT** call `toArray` inside high-frequency render frames (e.g. inside `gsap.ticker`). **Why fails:** Repeats DOM node queries repeatedly, triggering layout reflows and reducing FPS. **Instead:** Run queries once, cache the array, and reference it by variable name.

## Examples

### ✅ Good — Mapping Scroll Position to Opacity with Reusable Clamp

```javascript
import gsap from "gsap";

export function initScrollAlphaLink(scrollTriggerInstance) {
  // 1. Create a reusable map function mapping scroll 0-1000px to opacity 0-1
  const mapOpacity = gsap.utils.mapRange(0, 1000, 0, 1);
  const clampOpacity = gsap.utils.clamp(0, 1);

  ScrollTrigger.create({
    trigger: ".parallax-section",
    start: "top top",
    end: "+=1000",
    onUpdate: (self) => {
      // 2. Map and clamp progress value cleanly
      const rawOpacity = mapOpacity(self.scroll());
      const finalOpacity = clampOpacity(rawOpacity);
      
      gsap.set(".overlay", { opacity: finalOpacity });
    }
  });
}
```

Why this passes: Avoids raw arithmetic computations, uses the functional curried approach for maps and clamps, and correctly sanitizes inputs before applying them to target elements.

### ❌ Bad — Custom Math Math Functions and Raw Calculation Loops

```javascript
export function initBadScrollLink(scrollPosition) {
  // ERROR 1: Writing custom math arithmetic instead of gsap.utils
  let opacity = scrollPosition / 1000;
  
  // ERROR 2: Writing custom clamp conditions
  if (opacity < 0) opacity = 0;
  if (opacity > 1) opacity = 1;

  // ERROR 3: Direct document query selector inside callback loop
  const targets = document.querySelectorAll(".overlay");
  targets.forEach(el => el.style.opacity = opacity);
}
```

Why this fails: Introduces custom redundant math conditions, lacks proper scoping or modularity, and queries the DOM continuously within the loop.

---

## Utility Functions Overview

### clamp(min, max, value?)
Constrains a value between min and max. Omit value to get a function:
```javascript
let clampFn = gsap.utils.clamp(0, 100);
clampFn(150); // 100
```

### mapRange(inMin, inMax, outMin, outMax, value?)
Maps a value from one range to another.
```javascript
let mapFn = gsap.utils.mapRange(0, 1, 0, 360);
mapFn(0.5); // 180 (progress to degrees)
```

### toArray(value, scope?)
Converts NodeLists, query arrays, selector strings, or singular nodes to a true array.
```javascript
const elements = gsap.utils.toArray(".box", containerRef.current);
```

### random(min, max, snap?, returnFn?)
Returns a random number within limits.
```javascript
let randomFn = gsap.utils.random(-20, 20, 1, true); // Returns snapped values (-20, -19, ...)
randomFn(); // Fired on demand
```

---

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-utils`:

1. **Verify array parsing patterns:**
   Check for vanilla JS arrays conversions that could be optimized using `gsap.utils.toArray`:
   ```bash
   grep -rn "Array.from(document.querySelectorAll" src/
   ```
2. **Scan for manual range-mapping equations:**
   Ensure no raw percentage calculation formulas are present:
   ```bash
   grep -rn "\/ 100\*" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan GSAP utility helpers:

> "Use the skill `gsap-utils`. Read `.agent/skills/gsap-utils/SKILL.md` before coding. Never write custom math formulas for mapping, clamping, or randomizing. Always utilize `gsap.utils` methods like `mapRange()`, `clamp()`, `toArray()`, and `random(..., true)` to handle values. Ensure DOM arrays are processed efficiently by caching selectors."

## Related

- [gsap-core](file:///d:/gsap/.agent/skills/gsap-core/SKILL.md) — Base transform mechanisms.
- [gsap-timeline](file:///d:/gsap/.agent/skills/gsap-timeline/SKILL.md) — Sequencing sequences.
- [gsap-plugins](file:///d:/gsap/.agent/skills/gsap-plugins/SKILL.md) — Morphing and physics easing.
