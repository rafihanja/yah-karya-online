---
name: split-type
description: Split text into characters, words, and lines for stagger and reveal typography animations.
risk: medium (DOM restructuring layout shifts, missing font updates, SEO index warnings)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# split-type

> **One-liner:** Lightweight DOM utility that splits text blocks into character, word, or line nodes, wrapping them in inline-block spans for staggered animations.

## When to Use

- When building staggered text reveal animations (typewriter, slide-in letters, falling words).
- When animating lines of paragraph text independently as they enter the viewport.
- When creating hover animations that reveal alternative character sets (kinetic typography).

## Why This Exists

Animating raw text nodes directly is not supported in the DOM because CSS styles and GSAP transforms cannot target sub-string segments without wrapping them. Manually wrapping letters or words in individual `<span>` tags is tedious, bloats files, and breaks text wrapping. `SplitType` automates this mapping dynamically. However, splitting text before web fonts resolve yields incorrect line break calculations, and failing to revert changes on unmount clutters the DOM tree, causing rendering anomalies during updates.

## ALWAYS DO THIS

- **Ensure web fonts are loaded first** — Wrap initialization scripts inside `document.fonts.ready.then(...)` block to guarantee correct line break coordinates.
- **Revert DOM changes on unmount** — Always invoke `splitInstance.revert()` when components unmount to restore semantic HTML.
- **Re-split on window resize** — Set up a debounced resize listener that calls `splitInstance.split()` to recalculate line wraps when the container width updates.
- **Set `overflow: hidden` on parent containers** — Use mask containers for clip-reveal effects, hiding elements below borders before animating translation offsets.
- **Apply `display: block` or `display: inline-block` on split nodes** — Ensure style wrappers are not inline, as browsers ignore transform/scale mutations on standard inline tags.

## NEVER DO THIS

- ❌ **DO NOT** execute text splitting before fonts or resources resolve. **Why fails:** Calculation of letter dimensions runs against fallback fonts, causing line breaks and spacing to break once custom fonts load. **Instead:** Delay setup using font-ready hooks.
- ❌ **DO NOT** leave components unmounted without calling `revert()`. **Why fails:** Keeps DOM nodes cluttered with nested tags, breaking React virtual DOM updates and duplicate rendering runs. **Instead:** Call `.revert()` in component unmount cycles.
- ❌ **DO NOT** split extremely long text documents (e.g. books or full articles containing over 1000 characters). **Why fails:** Generates thousands of DOM span nodes, causing layout thrashing and high VRAM allocation. **Instead:** Split text progressively or limit splitting to headers and summaries.
- ❌ **DO NOT** use SplitType on elements containing complex nested semantic structures (like links, icons, or bold sub-elements) without manual testing. **Why fails:** The wrapper restructuring strips out parent element bounds, breaking link clicks or style layouts. **Instead:** Restrict splitting to plain text nodes or isolate text fields.

## Examples

### ✅ Good — React useGSAP Hook Integration with Revert and Font Loader

```javascript
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

export function PremiumHeading() {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    let split;

    // Delay split until web fonts are resolved to avoid incorrect offsets
    document.fonts.ready.then(() => {
      split = new SplitType(".split-title", { types: "words,chars" });

      gsap.from(split.chars, {
        y: "100%",
        opacity: 0,
        stagger: 0.02,
        duration: 0.6,
        ease: "power4.out"
      });
    });

    // Returned cleanup function reverts DOM structure when React unmounts
    return () => {
      split?.revert();
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="heading-wrapper" style={{ overflow: "hidden" }}>
      <h1 className="split-title">Cinematic Reveal</h1>
    </div>
  );
}
```

Why this passes: Delays initialization until custom fonts resolve, scopes selectors using containerRef, sets overflow hidden masks, and reverts DOM elements on unmount.

### ❌ Bad — Naked Setup with No Font Check and Missing Cleanup

```javascript
import SplitType from "split-type";
import gsap from "gsap";

export function badTypography() {
  // ERROR 1: Instantiated immediately, risks fallback font sizing errors
  const split = new SplitType(".leaky-title", { types: "chars" });

  // ERROR 2: Missing overflow masks on parent, letters animate without clipping
  gsap.from(split.chars, { y: 50, opacity: 0 });

  // ERROR 3: No cleanup or revert loop declared, text remains permanently nested
}
```

Why this fails: Lacks font load checks, has no overflow container (letters reveal static layout shifts), and does not revert DOM structure, causing issues on hot reload.

---

## Technical Options

### Constructor Config Parameters
```javascript
const instance = new SplitType(target, {
  types: 'lines,words,chars', // Comma-separated list of nodes to generate (default: 'lines,words,chars')
  tagName: 'span',             // Wrapper HTML tag (default: 'span')
  splitClass: 'split-item'     // Base class added to split items
});
```

---

## Failure Modes

- **Layout shifts on window resize:** Viewport changes wrap lines, but the split elements remain locked in their old positions, causing words to overlay or clip.
- **Lost interactive clicks:** Splitting paragraphs containing `<a>` tags strips event listeners, rendering links dead.

## Validation

Cara memverifikasi kepatuhan penggunaan `split-type`:

1. **Verify DOM Reversion:**
   Ensure every instantiation has a matching cleanup revert:
   ```bash
   grep -rn "revert()" src/
   ```
2. **Scan for font ready conditions:**
   ```bash
   grep -rn "fonts.ready" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan SplitType:

> "Use the skill `split-type`. Read `.agent/skills/split-type/SKILL.md` before coding. Never split text before web fonts load. Always verify that `document.fonts.ready` wraps setup logic, instantiate inside container scopes, and invoke `splitInstance.revert()` in unmount hooks."

## Related

- [gsap-core](../gsap-core/SKILL.md) — Base transform mechanisms.
- [gsap-timeline](../gsap-timeline/SKILL.md) — sequenced timelines.
- [gsap-plugins](../gsap-plugins/SKILL.md) — Alternative SplitText plugin options.
