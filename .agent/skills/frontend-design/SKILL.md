---
name: frontend-design
description: Core UI/UX engineering standards for typography scales, visual hierarchies, modern color palettes, layout layering, and responsive grids.
risk: safe
source: "Elite Agent Operations - Batch 3C (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Elite Frontend Design Guidelines

> **One-liner:** Standard Operating Procedure (SOP) for crafting premium, high-fidelity layouts, spatial structures, color palettes, and interactive states.

## When to Use

- When structuring user interface components (Hero sections, cards grids, pricing layouts).
- When determining design tokens (color schemes, box-shadow bounds, border-radius configurations).
- When configuring micro-interactions, transition parameters, and interactive states.

## Why This Exists

Functional software that looks generic or dated fails to build trust. If developers use hardcoded layout dimensions, opaque solid drop-shadows, or static hover states, interfaces feel rigid and cheap. Enforcing professional design system tokens (such as the 8px spatial grid, modern HSL-tailored colors, and smooth micro-interactions) elevates websites to premium standards.

## ALWAYS DO THIS

- **Enforce the 8px spatial grid standard** — Standardize layout paddings, margins, and gaps using multiples of 8px (e.g. `0.25rem` / `4px`, `0.5rem` / `8px`, `1rem` / `16px`, `1.5rem` / `24px`).
- **Enforce relative typographic units** — Set font sizes, margins, and paddings using `rem` or `em` units to preserve user browser text scalability.
- **Implement diffused, transparent shadows** — Use soft, multi-layered shadows with high blur radius configurations and low opacities (e.g. `rgba(0, 0, 0, 0.05)`) instead of solid black bounds.
- **Enforce interactive focus and hover states** — Style all clickable selectors (buttons, links, form inputs) with smooth micro-animations (e.g. `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).
- **Establish clear visual hierarchy** — Scale heading weights and colors (e.g. using slate-900 for titles vs. slate-500 for descriptions) to guide user attention.

## NEVER DO THIS

- ❌ **DO NOT** use primary default web colors (such as `#FF0000` red, `#0000FF` blue = ❌). **Why fails:** Looks unpolished and aggressive. **Instead:** Use harmonized, custom palettes (like slate, indigo, zinc, and warm neutral offsets).
- ❌ **DO NOT** hardcode absolute pixel sizing (`px`) for primary container layouts. **Why fails:** Prevents fluid scaling on different screen resolutions, causing content overflows. **Instead:** Use responsive percentages, flexboxes, or viewport units (`vw`, `vh`).
- ❌ **DO NOT** set interactive transitions using linear durations without easing descriptors. **Why fails:** Animations look mechanical and unnatural. **Instead:** Use transition timing functions like `cubic-bezier` or `ease-in-out`.
- ❌ **DO NOT** use high-opacity solid backdrops on elements that overlay background patterns. **Why fails:** Ruins layout depth and blocks visual hierarchy. **Instead:** Use translucent backdrops combined with backdrop filters (glassmorphism).

---

## Spatial Grid & Layout Hierarchy Pipeline

Guiding spacing scaling and typography weights from layout elements to inner margins:

```
[Viewport Grid: 8px Multiples] ──> [Dynamic Typography Scale] ──> [Glass Layering] ──> [Micro-Transitions]
```

---

## Examples

### ✅ Good — Fluid Spacing, Diffused Layering, and Smooth Bezier Hover Transition

#### 1. Premium Product Card Layout Component (`components/ProductCard.tsx`)
```tsx
import React from "react";

interface CardProps {
  title: string;
  category: string;
  price: string;
}

export function ProductCard({ title, category, price }: CardProps) {
  return (
    <article className="group relative rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50">
      {/* 1. Clear Typographic Hierarchy */}
      <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600">
        {category}
      </span>
      <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="mt-4 text-2xl font-semibold text-slate-800">
        {price}
      </p>

      {/* 2. Interactive action button with smooth state transition */}
      <button className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        Add to Cart
      </button>
    </article>
  );
}
```

Why this passes: Uses custom HSL Slate/Indigo color ranges, maintains clear typographical hierarchies, applies 8px-based spacing variables (paddings/margins), uses smooth custom cubic-bezier animations, and styles soft shadows.

### ❌ Bad — Static Colors, Hard Sizing, and Linear Transitions

```tsx
// ERROR 1: Sizing wrapper using absolute pixels limits responsive scaling
export function BadCard() {
  return (
    <div style={{ width: "300px", padding: "15px", border: "1px solid #FF0000" }}> 
      {/* ERROR 2: Raw primary red borders look unpolished */}
      <span style={{ fontSize: "12px", color: "#0000FF" }}>New Category</span> 
      
      {/* ERROR 3: Text elements lack sizing contrast */}
      <h2>Unpolished Title</h2> 

      {/* ERROR 4: Opaque solid box shadows look outdated */}
      <button style={{ 
        boxShadow: "5px 5px 0px #000000", 
        transition: "0.2s linear" // ERROR 5: Linear transitions feel robotic
      }}>
        Add
      </button>
    </div>
  );
}
```

Why this fails: Uses absolute layout properties (`width: 300px`, `padding: 15px`), utilizes raw primary red and blue hex values, lacks clear heading sizes, styles an opaque solid drop-shadow, and uses linear transitions.

---

## Failure Modes

- **The Static Pixel Lock:** Hardcoding absolute coordinates (like `height: 400px`) causing responsiveness failure.
- **The Linear Animation Trap:** Configuring transitions without easing functions, making animations look mechanical.
- **The Solid Black Shadow:** Setting high-opacity shadows, creating a heavy and unpolished look.
- **The Aggressive Color Clash:** Mixing un-harmonized raw secondary colors, degrading visual appeal.
- **The Missing Hover Outline:** Omitting custom focus styling rings, causing accessibility issues for keyboard users.
- **The Squashed Layout Block:** Crowding text blocks without margins, reducing legibility.

## Validation

Verify layout coordinates, hover states, and color properties:

1. **Verify that absolute pixel layout parameters are avoided:**
   Check CSS variables:
   ```bash
   grep -rn "width: [0-9]*px" src/ 2>/dev/null
   # expected: Sizing declarations use rem, em, or fluid percentage variables.
   ```
2. **Scan for primary colors hex parameters:**
   Check configurations for aggressive hex codes:
   ```bash
   grep -rn "#ff0000\|#0000ff" src/ 2>/dev/null
   # expected: zero matches. Layouts utilize curated theme color tokens.
   ```
3. **Verify transition declaration parameters:**
   Verify transitions include easing descriptors:
   ```bash
   grep -rn "transition: " src/ 2>/dev/null
   # expected: Transitions specify custom bezier parameters (e.g. cubic-bezier).
   ```
4. **Confirm focus states configurations:**
   Ensure button interactive classes map to focus ring highlights.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan penataan antarmuka:

> "Use the skill `frontend-design`. Read `.agent/skills/frontend-design/SKILL.md` before coding. Never write static pixel sizes for containers or utilize raw secondary colors. Always apply relative scaling (rem), soft shadows, dynamic visual hierarchies, and cubic-bezier transitions."

## Related

- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Typography scales and visual standards.
- [tailwind-design-system](../tailwind-design-system/SKILL.md) — CSS utility framework setups.
- [baseline-ui](../baseline-ui/SKILL.md) — Verification of layout metrics.
