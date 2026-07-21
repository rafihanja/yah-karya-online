---
name: product-design
description: Design de produto nivel Apple — sistemas visuais, UX flows, acessibilidade, linguagem visual proprietaria, design tokens, prototipagem e handoff. Cobre Figma, design systems, tipografia, cor, espacamento, motion design e principios de design cognitivo.
risk: safe
source: "Elite Agent Operations - Batch 3E (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Premium Product Design Standards

> **One-liner:** Guidelines for establishing premium design systems (Apple-grade simplicity), structural design tokens, and user flow architectures.

## When to Use

- When structuring unified cross-platform product layouts, visual languages, and brand identity constraints.
- When generating theme tokens schemas (colors, shadows elevation, motion parameters).
- When configuring onboarding user experience flows, empty state illustrations, and voice UI feedback blocks.

## Why This Exists

Premium product design requires systematic constraints (what Steve Jobs described as honest materials and radical simplicity) rather than one-off styles. If interfaces rely on oversaturated gradients, complex navigation hierarchies, or slow transitions, user retention drops. Enforcing atomic design systems, desaturated color tokens, fast spring animation delays, and cognitive load reduction mechanisms ensures products look polished and function seamlessly.

## ALWAYS DO THIS

- **Implement design system tokens systematically** — Store key style parameters (colors, font-scales, radii, animations) in structured JSON configurations.
- **Provide clear affordances for interactive elements** — Ensure clickable controls visually resemble click targets (via hover states, dropshadows, or subtle active transformations).
- **Structure cognitive UX flows linearly** — Outline user pathways using simple steps: Entry point $\rightarrow$ Context $\rightarrow$ Action $\rightarrow$ System feedback $\rightarrow$ Outcome.
- **Configure premium spring timing constants** — Set animation durations to snappy intervals (<300ms) utilizing custom spring curves.
- **Validate screen touch target dimensions** — Set touch areas for interactive targets to a minimum of 44x44px for mobile devices.

## NEVER DO THIS

- ❌ **DO NOT** use generic, uninformative messages in empty state views (e.g. "No items found" = ❌). **Why fails:** Confuses users and fails to guide them forward. **Instead:** Outline a clear opportunity with supporting visual context and an action button (e.g. "No pipelines configured yet. Create your first pipeline!").
- ❌ **DO NOT** hardcode absolute sizing bounds on content containers. **Why fails:** Blocks content scaling on fluid monitors and causes text clipping. **Instead:** Define maximum constraints (e.g. `max-w-7xl`) paired with responsive margins.
- ❌ **DO NOT** write jargon-heavy, system-level technical errors directly to users. **Why fails:** Degrades trust and confuses non-technical users. **Instead:** Translate codes into clear, friendly error messages.
- ❌ **DO NOT** use more than two distinct font families within a single product. **Why fails:** Generates visual noise and increases page load times. **Instead:** Stick to a single typeface pairing (e.g. Satoshi for headings, Satoshi Mono for code).

---

## Product Design & Tokenization Pipeline

Translating design principles into system tokens:

```
[Simplicity Principles] ──> [JSON Design Tokens] ──> [Atomic Primitives] ──> [Cohesive UX Flows]
```

---

## Examples

### ✅ Good — Structured Token Definitions and Descriptive Empty States

#### 1. Global Product Tokens Configuration (`tokens/design-system.json`)
```json
{
  "colors": {
    "brand": {
      "accent": "#0ea5e9",
      "accent-hover": "#0284c7"
    },
    "neutral": {
      "background": "#090d16",
      "surface": "#111827",
      "text-primary": "#f9fafb",
      "text-muted": "#9ca3af"
    }
  },
  "typography": {
    "display": { "fontSize": "3rem", "fontWeight": "700", "lineHeight": "1.1" },
    "body": { "fontSize": "1rem", "fontWeight": "400", "lineHeight": "1.6" }
  },
  "spacing": {
    "base": "8px",
    "padding-card": "24px"
  },
  "motion": {
    "snappy": "200ms cubic-bezier(0.16, 1, 0.3, 1)"
  }
}
```

#### 2. Accessible Empty State Component (`components/EmptyState.tsx`)
```tsx
import React from "react";
import { PlusIcon, InboxIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl max-w-lg mx-auto">
      {/* 1. Contextual visual container */}
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 text-slate-400">
        <InboxIcon size={28} />
      </div>
      
      {/* 2. Direct, actionable messaging */}
      <h3 className="mt-6 text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-[35ch]">
        {description}
      </p>

      {/* 3. Primary call to action with generous touch dimensions */}
      <button
        onClick={onAction}
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 active:scale-98 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-200 focus:ring-2 focus:ring-sky-400 focus:outline-none min-h-[44px]"
      >
        <PlusIcon size={16} strokeWidth={2.5} />
        {actionLabel}
      </button>
    </div>
  );
}
```

Why this passes: Configures design tokens inside structured layouts configurations, defines a descriptive empty state component with guide directions, and sets the button size to satisfy touch target requirements (>44px).

### ❌ Bad — Static Empty States, Jargon Messages, and Arbitrary Styles

```tsx
// ERROR 1: Plain static empty state provides zero contextual direction to the user
export function BadEmpty() {
  return (
    <div className="p-5 text-center bg-[#fafafa]">
      {/* ERROR 2: Uses filler icons without clear purpose */}
      <span>⚠️</span>
      
      {/* ERROR 3: Jargon-heavy, unhelpful text copy */}
      <h3>Error code 0x404: Empty dataset parameters</h3>
      <p>Please contact system admins or run SQL migration queries.</p>
      
      {/* ERROR 4: Small touch target width height (<44px target) */}
      <button style={{ height: "30px", fontSize: "11px" }}>
        Close
      </button>
    </div>
  );
}
```

Why this fails: Displays a vague message without a clear next step, exposes system-level database logs to the user, and sets button dimensions below standard touch target sizes (<44px).

---

## Failure Modes

- **The Static Dead End:** Creating empty states that provide no action buttons or setup instructions.
- **The Database Log Leak:** Dumping raw backend system logs directly into client interfaces.
- **The Touch Target Squish:** Building interactive buttons smaller than 44x44px on mobile layouts.
- **The Token Bypass:** Bypassing design system parameters in favor of inline styling overrides.
- **The Font Overload Clutter:** Importing too many distinct font families, slowing down page loads.

## Validation

Verify token configurations, empty state structures, and touch target sizes:

1. **Verify that button dimensions satisfy mobile targets:**
   Check button height and padding definitions:
   ```bash
   grep -rn "py-1\|py-1.5" src/ | grep -v "sm:" 2>/dev/null
   # expected: zero matches. Mobile buttons maintain padding/height properties >= 44px.
   ```
2. **Scan for empty states containing static messages:**
   Ensure empty state components provide interactive CTAs:
   ```bash
   grep -rn "No items found" src/ 2>/dev/null
   # expected: zero matches. Empty states feature guiding calls to action.
   ```
3. **Verify fonts definition imports count:**
   Ensure stylesheet imports load no more than two typefaces:
   ```bash
   grep -rn "@import" src/ | grep -i "font" 2>/dev/null
   # expected: Typography imports are limited to prevent visual noise.
   ```
4. **Identify raw styling files:**
   Ensure styles are mapped to tokens variables.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan konsep desain produk:

> "Use the skill `product-design`. Read `.agent/skills/product-design/SKILL.md` before coding. Never write static empty states or layout buttons smaller than 44x44px. Always configure theme tokens, define clear next steps, and maintain high contrast."

## Related

- [ui-ux-designer](../ui-ux-designer/SKILL.md) — Spacing base grids.
- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Asymmetric visual balance.
- [baseline-ui](../baseline-ui/SKILL.md) — UI verification routines.
