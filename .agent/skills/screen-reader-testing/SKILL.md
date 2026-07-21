---
name: screen-reader-testing
description: Practical guide to testing web applications with screen readers for comprehensive accessibility validation.
risk: medium (unannounced alerts, unlabelled controls, logical voice order failures, accessibility lawsuit exposure)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Screen Reader Testing

> **One-liner:** Guidelines for testing web components with assistive technologies (VoiceOver, NVDA), configuring ARIA live announcement zones, and auditing label descriptors.

## When to Use

- When validating screen reader accessibility (VoiceOver on macOS/iOS, NVDA or JAWS on Windows).
- When debugging dynamic interface notifications (toasts, alerts, search results).
- When audit-checking form label associations and custom button tag configurations.

## Why This Exists

Screen readers read page content aloud to visually impaired users, relying on clean semantic structures. If dynamic events (such as loading spinners, network errors, or success toasts) appear without `aria-live` containers, screen readers ignore them, leaving users unaware of state changes. Similarly, using icon buttons without text labels creates silent elements. Enforcing accessible labels, live announcers, and semantic headings preserves voice navigation.

## ALWAYS DO THIS

- **Use aria-live for dynamic announcements** — Structure live zones (`aria-live="polite"` or `aria-live="assertive"`) to announce real-time alerts.
- **Provide visible or screen-reader-only labels** — Wrap inputs in `<label>` elements or declare `aria-label` properties on interactive controls.
- **Ensure correct heading hierarchies** — Nest content structure using logical descending headers (`<h1>` to `<h6>`) without skipping levels.
- **Test with keyboard triggers** — Verify that screen reader virtual cursors can access and activate all triggers using Enter/Space inputs.
- **Hide purely decorative elements** — Apply `aria-hidden="true"` or empty `alt=""` attributes to decorative icons or layouts to prevent voice clutter.

## NEVER DO THIS

- ❌ **DO NOT** trigger layout modals or alert notifications without announcing them to screen readers. **Why fails:** Visually impaired users cannot see the modal, leading them to believe the application is frozen. **Instead:** Focus the modal title or utilize an `aria-live` region.
- ❌ **DO NOT** omit descriptive labels on standalone icon buttons (like `✕` or `☰`). **Why fails:** Screen readers read the character literally (e.g., "button, multiplication sign") or say nothing, leaving the button's action unknown. **Instead:** Add `aria-label="Close modal"` or `aria-label="Toggle menu"`.
- ❌ **DO NOT** use CSS `display: none` or `visibility: hidden` to hide content that should remain accessible to screen readers. **Why fails:** These styles hide elements from the DOM tree, removing them from screen readers entirely. **Instead:** Use utility classes that hide elements visually but keep them readable (e.g. standard Tailwind `sr-only` styles).
- ❌ **DO NOT** use layout elements like tables (`<table>`) for layout positioning without declaring appropriate ARIA role tags. **Why fails:** Screen readers read table columns and cell indexes literally, making content hard to understand. **Instead:** Enforce grid-based CSS layout parameters.

---

## Dynamic Announcement Zone

Aria-live zones tell screen readers to announce runtime changes immediately:

```
[Dynamic Event Triggered] ──> [Write Text to aria-live="polite" Container]
                                              │
                                              └──> [Screen Reader Announces: "Text payload"]
```

---

## Examples

### ✅ Good — Dynamic Live Announcers and Labelled Icon Buttons

#### 1. Accessible Toast Notification Component (`components/Toast.tsx`)
```typescript
import { useEffect, useState } from "react";

export function Toast({ message, type, onClose }: { message: string; type: "info" | "error"; onClose: () => void }) {
  return (
    // 1. Structure live zone container to alert screen readers (assertive for errors)
    <div
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      className="fixed bottom-4 right-4 flex items-center gap-3 bg-gray-900 text-white p-4 rounded shadow-lg"
    >
      <span className="flex-1">{message}</span>
      
      {/* 2. Provide clear label descriptor on icon button close trigger */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
```

Why this passes: Configures dynamic live announcer zones (`aria-live`), handles severity levels, hides the visual icon character from VoiceOver using `aria-hidden`, and provides description labels.

### ❌ Bad — Unannounced Toast Changes and Unlabelled Triggers

```typescript
import { useState } from "react";

// ERROR 1: Omit aria-live wrappers, leaving screen readers unaware of alerts
export function BadNotification({ text }: { text: string }) {
  return (
    <div className="toast-wrapper">
      <span className="text">{text}</span>
      
      {/* ERROR 2: Bare icon buttons read literally as 'multiplication sign' or ignored */}
      <button onClick={() => close()}>✕</button> 
    </div>
  );
}
```

Why this fails: Omits dynamic live announcers, fails to hide raw decorative icons, and leaves button actions unlabelled.

---

## Failure Modes

- **The Silent Alert Outage:** Rendering toast error notifications without `aria-live` wrappers, leaving users unaware of the failure.
- **The Naked Icon Button:** Using standalone visual icons as buttons without defining `aria-label` settings.
- **The Decorative Voice Clutter:** Leaving raw icons or graphics unhidden, forcing screen readers to read decoration code.
- **The Skipped Heading Step:** Skipping heading levels (e.g. jumping from `<h1>` to `<h4>`), breaking page navigation models.
- **The Broken Form Input:** Omitting associated labels on input fields, leaving users unsure what value to enter.
- **The Hidden Content Trap:** Visually hiding elements using CSS properties that remove them from screen readers.

## Validation

Audit markup files, heading hierarchies, and live region configurations:

1. **Verify that dynamic notification modules define aria-live zones:**
   Check code files:
   ```bash
   grep -rn "aria-live=" src/ || grep -rn 'role="status"' src/
   # expected: Dynamic notifications are wrapped inside live announcer components.
   ```
2. **Verify icon triggers include descriptive labels:**
   Verify buttons labels:
   ```bash
   grep -rn "aria-label=" src/ 2>/dev/null
   # expected: Triggers lacking text labels are configured with aria-label descriptors.
   ```
3. **Verify heading layouts structure:**
   Check heading tags:
   ```bash
   grep -rn -E "<h[1-6]" src/ 2>/dev/null
   # expected: Verify that heading tags progress in a logical hierarchy.
   ```
4. **Identify raw decorative images lacking empty alt attributes:**
   Check image files list to confirm decorative icons define `alt=""` or `aria-hidden="true"`.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan pengujian screen reader:

> "Use the skill `screen-reader-testing`. Read `.agent/skills/screen-reader-testing/SKILL.md` before coding. Never write silent toast notifications or unlabelled icons. Always implement aria-live properties, define aria-labels on icon buttons, hide decoration assets with aria-hidden, and preserve heading hierarchies."

## Related

- [ui-a11y](../ui-a11y/SKILL.md) — Focus outline settings.
- [wcag-audit-patterns](../wcag-audit-patterns/SKILL.md) — Compliance standards checks.
- [accessibility-compliance-accessibility-audit](../accessibility-compliance-accessibility-audit/SKILL.md) — Audit workflows.
