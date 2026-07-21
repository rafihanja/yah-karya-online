---
name: baseline-ui
description: Validates animation durations, enforces typography scale, checks component accessibility, and prevents layout anti-patterns in Tailwind CSS projects.
risk: safe
source: "Elite Agent Operations - Batch 3G (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Baseline UI Quality Guardrails

> **One-liner:** Guidelines for enforcing visual consistency, viewport height safety, typographic performance classes, and animation compositor constraints.

## When to Use

- When building new UI layout components or reviewing utility class layouts in Tailwind CSS.
- When validating component accessibility structures (aria-labels on icon buttons, keyboard focus traps).
- When configuring interface transitions, layout animation properties, and typography classes.

## Why This Exists

AI-generated interfaces often suffer from common visual bugs (like layout shifts, broken touch dimensions on mobile, inaccessible custom buttons, or heavy GPU paint lag from raw filter sweeps). Enforcing standard baseline quality rules (such as relative viewport heights `h-dvh` instead of `h-screen`, limiting interactions feedback timings to <200ms, and restricting animations to compositor properties) ensures interfaces perform smoothly and remain fully accessible.

## ALWAYS DO THIS

- **Use dynamic viewports instead of static viewports** — Apply dynamic viewport height classes (e.g. `min-h-[100dvh]` or `h-dvh`) for full-page layouts to prevent browser navigation bar jumping.
- **Provide aria-labels on icon-only interactive controls** — Set explicit descriptions (`aria-label`) on buttons containing only vector SVG icons.
- **Animate only compositor properties** — Limit runtime animations to performance-safe properties (e.g., `transform`, `opacity`) to allow GPU acceleration.
- **Implement tabular numbers on dataset grids** — Apply typographic formatting utility classes (e.g., `tabular-nums`) when rendering data grids to align columns perfectly.
- **Provide clear single CTAs in empty states** — Structure empty view states with a single primary call to action directing users forward.

## NEVER DO THIS

- ❌ **DO NOT** use viewport height constraints (`h-screen` = ❌) on full-screen containers. **Why fails:** Breaks page layout on mobile browsers when address bars collapse/expand, clipping button triggers. **Instead:** Configure dynamic viewports (`h-dvh` / `min-h-[100dvh]`).
- ❌ **DO NOT** rebuild keyboard navigation routines or focus trapping scopes by hand. **Why fails:** Manual JS listeners often bypass edge keys and fail to announce updates to screen readers. **Instead:** Build on top of accessible primitive skeletons (Radix UI, Base UI).
- ❌ **DO NOT** trigger layout calculations changes inside animation loops (e.g. animating `width`, `height`, `top`, or `margin` = ❌). **Why fails:** Triggers continuous browser layout recalculation frames, causing visual jank and lag. **Instead:** Animate using transform attributes (`scale`, `translate3d`).
- ❌ **DO NOT** block clipboard pasting actions inside standard text input controls. **Why fails:** Degrades user accessibility and breaks credential integrations. **Instead:** Retain default browser pasting handlers.

---

## Baseline UI Quality & Performance Pipeline

Filtering visual anti-patterns, checking accessibility, and optimizing compositing:

```
[Tailwind Utility Code] ──> [h-dvh Viewport Check] ──> [Tabular-nums Alignment] ──> [Compositor-only Animations]
```

---

## Examples

### ✅ Good — Dynamic Viewports, Icon Labels, Tabular Data, and Compositor Animations

#### 1. Premium Metric Dashboard Row (`components/MetricRow.tsx`)
```tsx
import React from "react";
import { ArrowUpRight, HelpCircle } from "lucide-react";

interface MetricRowProps {
  label: string;
  value: number;
  changeRate: string;
}

export function MetricRow({ label, value, changeRate }: MetricRowProps) {
  return (
    /* Spacing mapped strictly to standard padding scales */
    <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        
        {/* 1. Icon-only action button includes explicit aria-label for screen readers */}
        <button
          type="button"
          aria-label="Get details about this metric"
          className="text-slate-500 hover:text-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500 focus:outline-none transition-all duration-200"
        >
          <HelpCircle className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* 2. Numeric values align vertically using tabular-nums */}
        <span className="text-2xl font-bold font-sans text-white tabular-nums">
          {value.toLocaleString()}
        </span>

        {/* 3. Snappy hover animation (<200ms) targets compositor transforms */}
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold transition-transform duration-150 hover:scale-105">
          <ArrowUpRight className="size-4" />
          <span>{changeRate}</span>
        </div>
      </div>
    </div>
  );
}
```

Why this passes: Configures icon-only buttons using explicit `aria-label` declarations, applies `tabular-nums` formatting to numerical values, and implements snappy, GPU-safe compositor animations.

### ❌ Bad — Static Viewports, Hidden Input Blocks, and Paint-Lag Layout Animations

```tsx
// ERROR 1: h-screen triggers page clipping bugs on mobile device viewports
export function BadDashboard() {
  return (
    <div className="h-screen bg-black flex flex-col p-[19px]">
      {/* ERROR 2: Arbitrary padding override breaks global consistency */}
      
      {/* ERROR 3: Icon button lacking aria-label accessibility annotations */}
      <button>
        <svg className="w-5 h-5" viewBox="0 0 20 20"><path d="M0 0h20v20H0z"/></svg>
      </button>

      {/* ERROR 4: Animating layout 'height' property triggers heavy browser repaints */}
      <div 
        className="transition-all duration-500 hover:h-64"
        style={{ height: "150px" }}
      >
        <span>Data content</span>
      </div>
    </div>
  );
}
```

Why this fails: Declares a static viewport container (`h-screen`), omits `aria-label` annotations on an icon-only button trigger, and animates a layout property (`height`) which causes significant frame-rate drops.

---

## Failure Modes

- **The h-screen Mobile Overflow:** Clipping layout structures on mobile browsers due to static viewport usage.
- **The Silent Icon Trap:** Bypassing `aria-label` properties on icon-only buttons, blocking screen reader navigation.
- **The Layout Animation Jank:** Animating margins, paddings, width, or height, causing visible layout stutter.
- **The Arbitrary Padding Shift:** Writing custom spacing configurations (e.g. `p-[19px]`) that break alignment rhythm.
- **The Missing Accessibility Primitives:** Rebuilding select dropdowns or dialog scopes manually from raw divs, creating keyboard trap risks.
- **The iOS Safari 100dvh First-Paint Jump:** Even `100dvh` jumps by ~80px on iOS Safari's first paint while the URL bar collapses. Pair with `min-h-[100svh]` fallback for above-the-fold hero sections, or pin the hero to `svh` (small viewport) and let interior content use `dvh`.
- **The Android Keyboard Overlay:** Soft keyboards on Android Chrome shrink the viewport but `dvh` stays at full pre-keyboard value (Chrome behavior differs from Safari). Use `interactive-widget=resizes-content` in the meta viewport or `visualViewport.height` JS read for input-heavy screens.
- **The Notched Safe-Area Drop:** Without `viewport-fit=cover` + `env(safe-area-inset-*)`, content vanishes behind iOS notch / Dynamic Island and Android gesture bars. Required for any `position: fixed` toolbars or bottom CTAs.

## Edge Cases — Mobile Webview Reality Check

These are NOT covered by `h-dvh` alone — verify on real devices, not just devtools:

| Platform | Quirk | Mitigation |
|---|---|---|
| iOS Safari | `100dvh` jumps on first paint as URL bar collapses | Hero → `min-h-[100svh]`; interior → `dvh` |
| iOS Safari | Bottom nav bar overlaps fixed CTAs without `viewport-fit=cover` | Add `viewport-fit=cover` meta + `pb-[env(safe-area-inset-bottom)]` on fixed bars |
| Android Chrome | Keyboard shrinks layout viewport; `dvh` does NOT track keyboard | Meta `interactive-widget=resizes-content`, or JS `visualViewport.height` |
| Android WebView (in-app browsers) | `dvh` may report stale value after orientation change | Force reflow via `100% * window.innerHeight / 100` JS fallback |
| iOS PWA standalone | Status bar area is opaque; `safe-area-inset-top` returns 0 unless `viewport-fit=cover` | Always set `viewport-fit=cover` |

## Validation

Verify viewport units, layout animations, and accessibility tags:

1. **Verify that full-screen layouts avoid h-screen:**
   Search for static viewport heights:
   ```bash
   grep -rn "h-screen" src/ 2>/dev/null
   # expected: zero matches. Layouts utilize h-dvh or min-h-[100dvh] parameters.
   ```
2. **Scan for layout animations:**
   Check for transitions targeting layout parameters:
   ```bash
   grep -rn "transition-" src/ | grep "width\|height\|top\|left" 2>/dev/null
   # expected: zero matches. Animations modify only transforms and opacity variables.
   ```
3. **Verify presence of aria-labels on icon buttons:**
   Ensure svg-only button nodes carry label attributes:
   ```bash
   grep -rn "<button" src/ -A 3 | grep -i "aria-label"
   # expected: SVG/Icon buttons carry explicit aria-label parameters.
   ```
4. **Identify arbitrary spacing class overrides:**
   Ensure component directories conform to design spacing scales.
5. **Verify viewport-fit=cover for notched/safe-area handling:**
   Without this meta value, `env(safe-area-inset-*)` returns 0 on iOS, hiding fixed CTAs behind the Dynamic Island or home indicator.
   ```bash
   grep -rn "viewport-fit=cover\|viewportFit.*cover" src/ app/ 2>/dev/null
   # expected: at least one match in layout.tsx / _document.tsx / index.html.
   ```
6. **Runtime probe — real device viewport behavior (if Playwright available):**
   ```bash
   npx playwright test --grep "@viewport" --project="Mobile Safari"
   # expected: 0 failures. Visual snapshots match across portrait, landscape, keyboard-open states.
   ```
   If no Playwright, manually open Safari iOS + Chrome Android, scroll until URL bar collapses, focus an input — confirm no hidden CTAs, no content under notch, no overlap with soft keyboard.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan validasi visual:

> "Use the skill `baseline-ui`. Read `.agent/skills/baseline-ui/SKILL.md` before coding. Never write h-screen viewports or animate layout heights. Always enforce h-dvh viewports, aria-labels on icon triggers, tabular-nums variables, and compositor-only transformations."

## Related

- [ui-ux-designer](../ui-ux-designer/SKILL.md) — Grid spacing structures.
- [tailwind-design-system](../tailwind-design-system/SKILL.md) — Extending theme variables.
- [ui-a11y](../ui-a11y/SKILL.md) — Auditing accessibility compliance standards.
