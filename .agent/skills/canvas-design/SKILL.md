---
name: canvas-design
description: Design principles for visual layouts, spatial composition, grid hierarchy, and clinical typography in digital canvases.
risk: medium (overlapping graphics, broken layout alignment, font conflicts)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Canvas Design

> **One-liner:** Guidelines for creating highly sophisticated, grid-aligned visual compositions and clinical typographic layouts on digital design canvases.

## When to Use

- When building minimalist poster designs, infographics, or visual presentation slides.
- When generating visual art canvases containing systematic observation diagrams, grid structures, or geometric forms.
- When organizing layouts where typography acts as a spatial grid element rather than just plain paragraphs.

## Why This Exists

Without strict design parameters, AI-generated canvas layouts frequently end up cluttered, chaotic, and amateurish. Elements overlap, margins are ignored, and multiple conflicting fonts disrupt hierarchy. Establishing systematic guidelines ensures that visual compositions feel modern, clinical, and balanced, using negative space effectively to guide the eye.

## ALWAYS DO THIS

- **Adhere to a strict grid system** — Align all graphic blocks, text fields, and borders along a proportional grid matrix.
- **Maintain clear separation margins** — Ensure that every element (text, graphics, vectors) has ample negative breathing space and does not touch canvas edges.
- **Use clinical, high-contrast typography** — Employ clean sans-serif fonts for structural labels and thin serif fonts for visual accents, keeping sizes balanced.
- **Keep a limited color palette** — Restrict canvas colors to a maximum of 3-4 cohesive tones (such as rich grays, dark modes, or muted natural tones) to project sophistication.
- **Isolate typography from graphic backgrounds** — Place text over clean, flat background areas to guarantee readability, avoiding busy patterns.

## NEVER DO THIS

- ❌ **DO NOT** let graphics and text elements overlap on the canvas. **Why fails:** Distorts text readability and looks sloppy, failing professional standards. **Instead:** Establish clear bounding coordinates for each layer.
- ❌ **DO NOT** use default system fonts (such as Arial or Times New Roman) for premium layouts. **Why fails:** Looks generic and lacks design sophistication. **Instead:** Load high-quality font assets (e.g. Poppins, Outfit, or Lora).
- ❌ **DO NOT** stretch vector shapes or images out of their natural aspect ratio. **Why fails:** Distorts figures and curves, degrading layout quality. **Instead:** Scale assets proportionally.
- ❌ **DO NOT** clutter the canvas with long, explanatory text blocks. **Why fails:** Clutters visual compositions, breaking the "minimal text" principle. **Instead:** Use short, punchy clinical labels.

## Examples

### ✅ Good — Clinical Geometric Layout with Balanced Spacing

```javascript
// Example implementation on a canvas context
export function drawClinicalCanvas(ctx, width, height) {
  // 1. Establish strict boundaries and margins
  const margin = 50;
  const contentWidth = width - margin * 2;
  const contentHeight = height - margin * 2;

  // Clear backdrop
  ctx.fillStyle = "#fcfbfa";
  ctx.fillRect(0, 0, width, height);

  // 2. Draw systematic grid coordinates
  ctx.strokeStyle = "#e8e5e2";
  ctx.lineWidth = 1;
  ctx.strokeRect(margin, margin, contentWidth, contentHeight);

  // 3. Clinical typography alignment
  ctx.fillStyle = "#1c1a18";
  ctx.font = "300 24px 'Poppins'";
  ctx.fillText("SYSTEMATIC OBSERVATION", margin + 30, margin + 60);

  ctx.font = "italic 400 12px 'Lora'";
  ctx.fillText("Diagram 08 // Force Fields", margin + 30, margin + 90);

  // 4. Balanced geometric shape
  ctx.fillStyle = "#8a817c";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 120, 0, Math.PI * 2);
  ctx.fill();

  // 5. Clinical reference marker
  ctx.fillStyle = "#b7b2a9";
  ctx.font = "500 10px 'Courier New'";
  ctx.fillText("COORD: 45.98 / -12.44", margin + 30, height - margin - 30);
}
```

Why this passes: Keeps elements within margins, uses grid lines, aligns clinical text labels, and employs a muted color palette.

### ❌ Bad — Chaotic Layer Overlapping and Generic Styles

```javascript
export function drawBadCanvas(ctx, width, height) {
  // ERROR 1: No margins, drawing directly at edge coordinates
  ctx.fillStyle = "blue"; 
  ctx.fillRect(0, 0, width, height);

  // ERROR 2: Random, heavy text size that overlaps subsequent drawings
  ctx.font = "bold 80px Arial"; // ERROR 3: Generic system font
  ctx.fillStyle = "red";
  ctx.fillText("MASSIVE OVERLAPPING TITLE TEXT BLOCK", 10, 100);

  // ERROR 4: Drawing a shape that clips directly into the title text
  ctx.fillStyle = "yellow";
  ctx.fillRect(50, 50, 300, 300);
}
```

Why this fails: Lacks margin controls, uses generic system fonts, features overlapping text and shapes, and uses clashing colors.

---

## Technical Layout Chart
Use these standard spacing variables to align structural blocks:
- **Title Block:** `y = margin + 50px`
- **Main Diagram Canvas:** `center of layout`
- **Details & Captions:** `y = height - margin - 40px`
- **Grid Divider lines:** `width / 3` and `width * 2 / 3`

---

## Failure Modes

- **Layout Bleeding:** Canvas components crop or drop off-screen on smaller devices because margins are calculated as static pixel constants without proportional scale factors.
- **Typographic Clash:** Text layers overlay each other when the font sizes are adjusted dynamically.

## Validation

Cara memverifikasi kepatuhan penggunaan `canvas-design`:

1. **Verify margins exist:**
   Ensure boundary calculations subtract margin factors before positioning nodes:
   ```bash
   grep -rn "margin" src/
   ```
2. **Scan for clean font selections:**
   Ensure layout configs import elegant font families:
   ```bash
   grep -rn -E "(Poppins|Lora|Outfit)" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mendesain canvas:

> "Use the skill `canvas-design`. Read `.agent/skills/canvas-design/SKILL.md` before coding. Never let graphic elements overlap. Always define strict layout margins, apply grid coordinate guides, use thin clinical typography, and stick to a limited color scheme."

## Related

- [algorithmic-art](../algorithmic-art/SKILL.md) — Computational graphics.
- [gsap-performance](../gsap-performance/SKILL.md) — Render loop optimization.
