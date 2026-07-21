---
name: ui-ux-designer
description: Create interface designs, wireframes, and design systems. Masters user research, accessibility standards, and modern design tools.
risk: safe
source: "Elite Agent Operations - Batch 3E (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# UI/UX Interface Design Engineering

> **One-liner:** Guidelines for creating accessible UI components, managing vertical alignment systems, and documenting user interfaces.

## When to Use

- When mapping design systems to code blocks using Atomic design parameters.
- When configuring typographic hierarchies, contrast ratios, and layouts spacing variables.
- When prototyping micro-interactions, input validation patterns, and accessible keyboard focus models.

## Why This Exists

UI/UX design is not just about visual aesthetics; it requires structural organization to bridge the gap between design layouts and production code. If developers hand-off designs with non-standard margins, hardcoded sizes, or poor accessibility contrast ratios, the implemented interface will look broken or be unusable. Enforcing atomic spacing hierarchies, responsive single-column mobile fallbacks, and standard WCAG contrast ratios keeps layouts beautiful, structured, and accessible.

## ALWAYS DO THIS

- **Verify WCAG accessibility contrast ratios** — Secure minimum color contrast of 4.5:1 for body copy and 3.0:1 for interface indicator borders.
- **Enforce typography hierarchies** — Organize text scaling systematically using relative units (`rem`/`em`) paired with responsive base heights.
- **Provide clear progressive disclosure steps** — Shield complex B2B information views using collapsible panels, tooltips, or dynamic modal popovers.
- **Establish clear vertical rhythm spacing** — Restrict layout dimensions and paddings to a consistent 8px-based spacing scale.
- **Design logical input focus paths** — Outline keyboard tab indexes sequentially, supporting visible focus indicators across active controls.

## NEVER DO THIS

- ❌ **DO NOT** design layouts without defining mobile viewport collapse rules. **Why fails:** Grid layouts designed for desktop will overflow and warp on narrow mobile screens (under 768px), making the interface unusable. **Instead:** Specify single-column layouts (`grid-cols-1`) on mobile and scale to multi-column on desktop.
- ❌ **DO NOT** use low-contrast text combinations (such as light gray text on white backgrounds or orange text on red backgrounds = ❌). **Why fails:** Bypasses WCAG standards, making content unreadable for low-vision users. **Instead:** Validate combinations using relative contrast rates (such as Slate-500 on Slate-50).
- ❌ **DO NOT** use hidden checkboxes or toggle inputs without visible keyboard outline triggers. **Why fails:** Completely breaks keyboard accessibility. **Instead:** Keep native inputs in the document tree with hidden styles but visible focus indicators.
- ❌ **DO NOT** display raw, jargon-heavy system exceptions directly in consumer UIs. **Why fails:** Confuses users and degrades trust. **Instead:** Intercept errors and show friendly, actionable messages.

---

## UI/UX Handoff & Atomic Architecture Pipeline

Bridging visual design hierarchies with system layouts:

```
[System Tokens (8px Grid)] ──> [Atomic Elements (Buttons)] ──> [Compound Modules (Cards)] ──> [Responsive Templates]
```

---

## Examples

### ✅ Good — Calibrated Typography, Visual Spacing Grids, and Accessible Focus Cycles

#### 1. Accessible Feedback Form Card Component (`components/FeedbackCard.tsx`)
```tsx
import React from "react";

interface FeedbackCardProps {
  title: string;
  description: string;
  onSubmit: () => void;
}

export function FeedbackCard({ title, description, onSubmit }: FeedbackCardProps) {
  return (
    /* 1. Spacing adheres to 8px base spacing grid (p-8 = 32px) */
    <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* 2. Clear contrast typography hierarchy */}
      <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {description}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="mt-6 flex flex-col gap-4">
        <div>
          {/* Label positioned clearly above input */}
          <label htmlFor="user-feedback" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Your Comments
          </label>
          <textarea
            id="user-feedback"
            rows={3}
            placeholder="Help us improve..."
            /* Accessible visible focus border ring configuration */
            className="mt-1.5 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-950 focus:border-slate-950 focus:outline-none transition-all duration-200"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus:outline-none transition-all duration-200"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
```

Why this passes: Establishes a clear typography hierarchy using appropriate font weight modifications, structures dimensions matching the 8px grid scale, positions label tags directly above textarea inputs, and configures accessible focus indicators.

### ❌ Bad — Inaccessible Color Contrast, Missing Focus Indicators, and Hardcoded Margins

```tsx
// ERROR 1: Awkward hardcoded static margin value (mt-[37px]) breaks vertical rhythm
export function BadForm() {
  return (
    <div className="mt-[37px] bg-[#fafafa] p-5">
      {/* ERROR 2: Light gray text on light gray background (WCAG contrast violation) */}
      <span className="text-[#ccc] text-xs">Optional Fields</span>
      
      {/* ERROR 3: Direct layout positioning without labels */}
      <input 
        type="text" 
        placeholder="Enter name"
        style={{ 
          border: "1px solid #ddd", 
          outline: "none" // ERROR 4: Disables focus indicator, locking keyboard navigation
        }}
      />
    </div>
  );
}
```

Why this fails: Maps layout dimensions to non-standard arbitrary spacing classes (`mt-[37px]`), violates WCAG color contrast criteria by using light gray text on a gray background, omits input labels, and sets `outline: none` without providing an alternative focus style.

---

## Failure Modes

- **The Mobile Layout Warp:** Designing complex desktop grid layouts that overflow on narrow viewports.
- **The Low Contrast Trap:** Bypassing WCAG accessibility color contrast guidelines, making content unreadable.
- **The Keyboard Tab Lock:** Omitting focus outline rings on interactive components, blocking keyboard navigation.
- **The Arbitrary Rhythm Break:** Using non-grid values (e.g. `p-[13px]`, `m-[37px]`) instead of an 8px grid system.
- **The Jargon Error Dump:** Displaying raw system exception dumps in consumer-facing error boundaries.

## Validation

Verify typography scaling, spacing scales, and keyboard focus states:

1. **Verify that elements avoid outline: none without focus rings:**
   Scan code for disabled focus indicators:
   ```bash
   grep -rn "outline-none" src/ | grep -v "focus\|ring" 2>/dev/null
   # expected: zero matches. Input elements config accessible focus ring modifiers.
   ```
2. **Scan for arbitrary non-8px spacing values:**
   Identify non-standard spacing modifiers:
   ```bash
   grep -rn "p-\[\|m-\[" src/ 2>/dev/null
   # expected: Spacing parameters mapped to standardized grid sizes.
   ```
3. **Verify color contrast variables:**
   Ensure backgrounds use high-contrast combinations:
   ```bash
   grep -rn "text-slate-300" src/ | grep "bg-white" 2>/dev/null
   # expected: zero matches. Layouts prioritize high contrast color scales.
   ```
4. **Identify layout-level database calls:**
   Ensure components don't include backend database queries.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan penyesuaian UI/UX:

> "Use the skill `ui-ux-designer`. Read `.agent/skills/ui-ux-designer/SKILL.md` before coding. Never disable focus rings or bypass vertical spacing scales. Always enforce WCAG color contrasts, 8px base grids, and responsive mobile viewports."

## Related

- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Calibrated color tokens.
- [tailwind-design-system](../tailwind-design-system/SKILL.md) — Global spacing token configuration.
- [ui-a11y](../ui-a11y/SKILL.md) — Screen reader compliance guides.
