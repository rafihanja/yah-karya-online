---
name: ui-a11y
description: Audit a StyleSeed-based component or page for WCAG 2.2 AA issues and apply practical accessibility fixes where the code makes them safe.
risk: medium (screen reader failures, keyboard traps, focus indicator blockages)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# UI Accessibility Audit

> **One-liner:** Guidelines for auditing user interfaces against WCAG 2.2 AA standards, verifying touch targets, styling visible focus rings, and configuring reduced motion preferences.

## When to Use

- When building interactive components (buttons, links, inputs) in mobile-first web pages.
- When audit-checking CSS configurations for visible focus indicators and styling contrast issues.
- When configuring spatial transitions or animations that should support reduced-motion layouts.

## Why This Exists

Polished digital designs are useless if users with motor, visual, or cognitive challenges cannot access them. If a developer uses a generic `div` or `span` as a button without adding keyboard focus triggers or ARIA roles, users navigating with keyboards or screen readers cannot interact with it. Similarly, setting `outline: none` on interactive tags hides focus rings, trapping keyboard navigation. Enforcing semantic tags, accessible focus indicators, and minimal touch target bounds guarantees user access.

## ALWAYS DO THIS

- **Verify touch target dimensions** — Enforce minimum touch areas of 44x44px (or 24x24px with surrounding margins) for all touch components to support mobile users.
- **Ensure visible keyboard focus indicators** — Keep or style default focus outlines (e.g. using `focus-visible` parameters) so keyboard users can track their active position.
- **Configure prefers-reduced-motion queries** — Wrap non-critical page transitions inside CSS media queries that disable animations if users prefer reduced motion.
- **Apply semantic roles to interactive components** — Use native `<button>` or `<a>` elements for triggers rather than generic `<div>` tags.
- **Confirm text color contrast ratios** — Enforce minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text against background layers.

## NEVER DO THIS

- ❌ **DO NOT** use `outline: none` or `outline: 0` in CSS resets without providing an alternative focus style. **Why fails:** Keyboard users lose track of where they are on the page, rendering the site completely unusable for screenless or mouse-free navigation. **Instead:** Use `:focus-visible` to style visible focus outlines.
- ❌ **DO NOT** design clickable buttons using generic `<div>` or `<span>` elements without mapping keyboard handlers and role properties. **Why fails:** Keyboards and screen readers ignore these tags as static layout containers, bypassing the button actions. **Instead:** Enforce native `<button>` elements.
- ❌ **DO NOT** use color as the only way to convey information or state updates (like error fields or active choices). **Why fails:** Colorblind or visually impaired users cannot identify which elements changed. **Instead:** Add text labels, icons, or descriptive properties.
- ❌ **DO NOT** set touch target heights below 44px on mobile buttons. **Why fails:** Users with motor control challenges cannot reliably click small targets, causing navigation errors. **Instead:** Use padding or margin attributes to extend touch target areas.

---

## Focus Ring and Touch Target Layout

Designing touch targets and focus states ensures accessibility for both mobile and keyboard users:

```
[Touch Button]  ──> [Minimum Size: 44px x 44px Area]
[Keyboard Tab] ──> [:focus-visible Selector] ──> [High-Contrast Focus Ring outline]
```

---

## Examples

### ✅ Good — Keyboard Navigation, Touch Targets, and Motion Preferences

#### 1. Accessible Accordion Toggle Component (`components/AccordionToggle.tsx`)
```typescript
import { useState } from "react";

export function AccordionToggle({ label, content }: { label: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b py-2">
      {/* 1. Use native <button> to ensure keyboard focus and tap actions */}
      {/* 2. Touch target meets the 44px minimum height constraint */}
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full min-h-[48px] px-4 py-2 text-left font-medium
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <span>{label}</span>
        <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 text-gray-700">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}
```

#### 2. Accessible Motion CSS stylesheet (`styles/motion.css`)
```css
/* 3. Wrap complex page animations inside prefers-reduced-motion media query gates */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-delay: -1ms !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    background-attachment: scroll !important;
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
}
```

Why this passes: Uses native button components, sets heights to satisfy mobile touch targets, configures visible custom focus rings using `focus-visible`, and disables animations when reduced motion is preferred.

### ❌ Bad — Faux Button Layouts, Hidden Focus Outlines, and Uncontrolled Motion

```typescript
// ERROR 1: Creating a click handler on a div tag without roles, tabIndex, or key triggers
export function BadToggle() {
  const [open, setOpen] = useState(false);

  return (
    // ERROR 2: Generic layout container lacks native button behaviors
    // ERROR 3: Small touch target height (30px) is difficult to click
    <div 
      onClick={() => setOpen(!open)} 
      className="clickable-item h-[30px] bg-gray-100"
    >
      Click here
    </div>
  );
}
```

```css
/* ERROR 4: Disabling outline styles globally blocks keyboard navigation tracking */
.clickable-item {
  outline: none; 
}
```

Why this fails: Uses generic `div` containers for button actions, omits keyboard triggers and tab indexes, sets heights below 44px, and disables focus outlines in CSS.

---

## Failure Modes

- **The Hidden Focus Trap:** Setting `outline: none` globally, making keyboard navigation blind.
- **The Faux Button Outcast:** Using generic `div` tags for actions without mapping ARIA attributes or keyboard listeners.
- **The Small Touch Target:** Setting mobile button areas below 44x44px, causing tap target issues.
- **The Animation Auto-Play Loop:** Running high-motion animations without checking the user's reduced motion preferences.
- **The Color-Only State Change:** Indicating input validation success or failure using only color changes.
- **The Keyboard Tab Lock:** Trapping focus inside components (e.g. modals), preventing users from exiting with the Escape key.

## Validation

Audit markup layouts, focus styling, and media query properties:

1. **Verify that outline properties are not disabled without focus-visible styles:**
   Check CSS style rules:
   ```bash
   grep -rn "outline:\s*none" src/ || grep -rn "outline:\s*0" src/
   # expected: Verify that focus-visible or custom rings are configured when default outline is disabled.
   ```
2. **Identify buttons implemented using generic containers:**
   Scan code for click handlers on static tags:
   ```bash
   grep -rn "onClick=" src/ | grep -E "<div|<span|<p"
   # expected: zero matches. Triggers utilize native button tags or carry proper tabIndex and key handlers.
   ```
3. **Verify prefers-reduced-motion CSS support:**
   Verify stylesheet media queries:
   ```bash
   grep -rn "prefers-reduced-motion" src/ 2>/dev/null
   # expected: CSS transition libraries include rules supporting reduced motion configurations.
   ```
4. **Confirm touch target button sizes compliance:**
   Check layout configurations to confirm interactive elements meet the minimum 44px touch size.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan audit aksesibilitas UI:

> "Use the skill `ui-a11y`. Read `.agent/skills/ui-a11y/SKILL.md` before coding. Never write outline: none resets without alternatives or use bare div elements as buttons. Always configure focus-visible outlines, touch targets above 44px, and prefers-reduced-motion queries."

## Related

- [wcag-audit-patterns](../wcag-audit-patterns/SKILL.md) — Comprehensive Section 508 guidelines.
- [screen-reader-testing](../screen-reader-testing/SKILL.md) — VoiceOver / NVDA checks.
- [baseline-ui](../baseline-ui/SKILL.md) — Styling tokens constraints.
