---
name: baffle-js
description: Obfuscate and reveal text in DOM elements with hacker/cipher scramble effects.
risk: low (DOM text replacement anomalies, performance updates spikes, font width jumps)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# baffle-js

> **One-liner:** Tiny, lightweight JavaScript utility for creating visual text scramble and cipher reveal animations in DOM elements.

## When to Use

- When building loading screens, hacker-style console logs, or introductory transitions where characters decode dynamically.
- When creating hover reveals for navigation menu links or visual titles.
- When pairing scrambled text reveals with scroll-triggered viewport detection hooks.

## Why This Exists

Applying raw scramble text animations manually requires continuous parsing and replacement of string indices, which is tedious to write and difficult to optimize. Baffle.js automates this by cycling characters using a highly efficient update loop. However, since Baffle replaces the raw `textContent` of target elements, running it on container tags containing child HTML structures (like nested links or spans) will completely destroy the DOM subtree. Furthermore, overlapping multiple scramble instances on the same text causes rendering jumps and browser freeze.

## ALWAYS DO THIS

- **Call `.stop()` or `.reveal()` to end cycles** — Avoid leaving the scramble loop running indefinitely in the background to prevent continuous CPU consumption.
- **Ensure monospace or tabular fonts are configured** — Apply `font-family: monospace` or `font-variant-numeric: tabular-nums` to target containers to prevent layout shifts as characters cycle.
- **Provide accessibility fallback attributes** — Ensure interactive screen readers can read the final content by placing the original text inside `aria-label` tags.
- **Unbind instances on component unmount** — Always trigger cleanup cycles (e.g. stop cycles and discard variables) when the host component unmounts.
- **Target leaf text nodes** — Wrap target strings inside individual, clean `<span>` or `<p>` tags containing no child elements.

## NEVER DO THIS

- ❌ **DO NOT** run Baffle on DOM elements that contain child tags (like `<strong>`, `<a>`, or `<span>`). **Why fails:** Baffle completely overwrites `textContent`, deleting all child nodes and breaking layout styles or click listeners. **Instead:** Target text-only elements directly.
- ❌ **DO NOT** trigger multiple overlapping Baffle instances on the same target element. **Why fails:** The concurrent loops overwrite the same text buffer simultaneously, causing erratic flickering and browser jank. **Instead:** Clean up or stop the previous instance before launching a new one.
- ❌ **DO NOT** configure update speeds below 16ms (e.g., `speed: 5`). **Why fails:** The browser cannot render faster than the hardware monitor refresh rate (typically 60Hz/16ms), resulting in wasted CPU cycles. **Instead:** Set standard, responsive speeds (e.g. 40ms to 80ms).
- ❌ **DO NOT** omit text accessibility fallback wrappers. **Why fails:** Visually impaired users using screen readers will hear a stream of garbled gibberish characters during the scramble cycle. **Instead:** Declare static aria labels.

## Examples

### ✅ Good — Monospace Scramble Hover with Cleanup

```javascript
import baffle from "baffle";

export function setupScrambleHover(elementSelector) {
  const element = document.querySelector(elementSelector);
  if (!element) return null;

  // 1. Configure baffle with monospace character sets and optimized speed
  const b = baffle(element, {
    characters: "█▓▒░<>/[]{}*",
    speed: 60
  });

  const onMouseEnter = () => {
    b.start();
  };

  const onMouseLeave = () => {
    // 2. Reveal text over 800ms and stop the cycle
    b.reveal(800);
  };

  element.addEventListener("mouseenter", onMouseEnter);
  element.addEventListener("mouseleave", onMouseLeave);

  // 3. Return cleanup helper to remove listeners and stop active loops
  return () => {
    element.removeEventListener("mouseenter", onMouseEnter);
    element.removeEventListener("mouseleave", onMouseLeave);
    b.reveal(); // instantly stops active scramble loops
  };
}
```

Why this passes: Configures safe update speeds, binds clean hover triggers, registers unmount cleanups, and prevents infinite cycles.

### ❌ Bad — Multi-Instance Overwriting and Inner HTML Destruction

```javascript
import baffle from "baffle";

export function badScramble() {
  // ERROR 1: Element contains nested link tags, baffle will destroy the DOM tree
  const element = document.querySelector(".bad-container"); 
  // HTML: <div class="bad-container">Hello <a href="#">Link</a></div>

  // ERROR 2: Direct call triggers infinite background loops without cleanup
  const b1 = baffle(element);
  b1.start();

  // ERROR 3: Overlapping second instance on the same element causing conflicts
  const b2 = baffle(element, { speed: 5 }); // ERROR 4: Speed below 16ms
  b2.start();
}
```

Why this fails: Destroys child elements (the link is deleted), triggers duplicate concurrent cycles, runs at an inefficient speed, and has no cleanup path.

---

## Technical CSS Monospace Guide
Prevent horizontal layout shifts during character cycles by using fixed-width text styles:
```css
.scramble-text {
  font-family: 'Courier New', Courier, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em; /* stabilizes visual width */
}
```

---

## Failure Modes

- **Deleted Hyperlinks:** Triggering scramble on a navigation menu removes all click functionality because Baffle stripped out the `<a href="...">` wrappers.
- **Stuck Scramble Text:** The text remains permanently garbled and never decodes because `.reveal()` was never called.

## Validation

Cara memverifikasi kepatuhan penggunaan `baffle-js`:

1. **Verify target element child structures:**
   Scan HTML layouts to ensure baffle targets contain no nested child tags:
   ```bash
   grep -rn "baffle(" src/
   # Verify selectors reference leaf nodes (e.g. span.scramble, h1.scramble)
   ```
2. **Scan for reveal cleanups:**
   Ensure reveal or stop triggers exist:
   ```bash
   grep -rn "\.reveal(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Baffle.js:

> "Use the skill `baffle-js`. Read `.agent/skills/baffle-js/SKILL.md` before coding. Never target containers with nested HTML tags. Always configure monospace CSS styles to avoid layout shift, set update speeds above 16ms, and call `.reveal()` to terminate cycles on cleanup."

## Related

- [scroll-experience](../scroll-experience/SKILL.md) — Viewport triggered reveals.
- [gsap-performance](../gsap-performance/SKILL.md) — Main thread optimization.
