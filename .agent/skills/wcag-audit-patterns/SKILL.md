---
name: wcag-audit-patterns
description: Comprehensive guide to auditing web content against WCAG 2.2 guidelines with actionable remediation strategies.
risk: high (ADA lawsuits, Section 508 failures, keyboard traps, unaccessible modal overlays)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# WCAG Audit Patterns

> **One-liner:** Guidelines for conducting compliance audits against WCAG 2.2 AA standards, testing keyboard focus loops, and implementing skip links.

## When to Use

- When reviewing user interfaces for Section 508 or ADA accessibility compliance audits.
- When fixing keyboard tab routing bugs or designing focus trap containers for dialog overlays.
- When validating markup files using testing tools (axe-core, Lighthouse accessibility).

## Why This Exists

Ensuring WCAG 2.2 compliance is critical to avoid legal challenges and provide equal access. If keyboard users cannot skip repetitive navigation menus or get stuck inside modal dialogs (a keyboard focus trap), they cannot complete basic tasks. Similarly, hiding focus indicators or using colors as the only indicator of a state change violates guidelines. Enforcing keyboard focus loops, skip navigation links, and screen reader announcements secures Section 508 compliance.

## ALWAYS DO THIS

- **Implement a skip navigation link** — Add a skip-link (`href="#main-content"`) at the top of document templates that appears on focus to bypass repetitive menus.
- **Trap keyboard focus inside active modals** — Enforce a loop container that keeps Tab keys constrained inside open dialog interfaces.
- **Provide semantic labels for non-text triggers** — Map explicit `aria-label` tags to image buttons or icon elements.
- **Maintain logical tab indices** — Enforce natural document outline tabbing paths rather than hardcoding arbitrary `tabindex` integers.
- **Declare error associations programmatically** — Link form inputs to their corresponding error strings using `aria-describedby` mappings.

## NEVER DO THIS

- ❌ **DO NOT** use `tabindex` values greater than `0` (e.g. `tabindex="1"`, `tabindex="5"`). **Why fails:** Hardcoded positive indexes override the natural DOM tab order, creating confusing and broken navigation paths for keyboard users. **Instead:** Keep indices to `0` for interactive components or `-1` for programmatic focusing.
- ❌ **DO NOT** let keyboard focus escape behind visible overlay modal backdrops. **Why fails:** Keyboard users can accidentally tab to background elements that are hidden behind overlays, leading to invisible triggers. **Instead:** Add `aria-hidden="true"` to background containers when modals open.
- ❌ **DO NOT** design form input errors that are not linked to their inputs. **Why fails:** Screen readers fail to read validation errors when fields receive focus, leaving users unaware of input issues. **Instead:** Enforce `aria-describedby` mappings.
- ❌ **DO NOT** use empty anchor tags (`<a>`) without valid `href` parameters for buttons. **Why fails:** Browsers ignore these elements during keyboard navigation, skipping them during tab checks. **Instead:** Use native `<button>` tags.

---

## Keyboard Modal Focus Trap

Modals must catch and wrap focus between their first and last interactive elements:

```
[Modal Opens] ──> [Programmatic Focus on Close Button]
      ▲                                                  │
      └─────── (Tab wraps from Last Element) ◄───────────┘
```

---

## Examples

### ✅ Good — Keyboard Skip Navigation, Modal Focus Traps, and Form Linkages

#### 1. Header Skip Navigation Markup (`components/Header.tsx`)
```typescript
export function Header() {
  return (
    <>
      {/* 1. Injects skip navigation link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-3 rounded"
      >
        Skip to main content
      </a>
      
      <header className="bg-gray-100 p-4">
        <nav>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
    </>
  );
}
```

#### 2. Accessible Form Field Association (`components/InputField.tsx`)
```typescript
interface FieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}

export function InputField({ id, label, value, error, onChange }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </label>
      
      {/* 2. Bind validation error targets using aria-describedby */}
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
      />
      
      {error && (
        <span id={errorId} role="alert" className="text-red-600 text-sm">
          {error}
        </span>
      )}
    </div>
  );
}
```

Why this passes: Configures skip links, binds input elements to validation messages, handles invalid states, and ensures correct tab indices.

### ❌ Bad — Hardcoded Tab Indexes, Inaccessible Inputs, and Orphaned Modals

```typescript
// ERROR 1: Omit skip-links, forcing keyboard users to tab through navigation lists
export function BadForm() {
  return (
    <div>
      <div className="nav-links">
        <a href="/home">Home</a>
        <a href="/shop">Shop</a>
      </div>

      <div className="form-content">
        {/* ERROR 2: Hardcoding positive tabIndex values breaks natural tabbing orders */}
        <input type="text" placeholder="Name" tabIndex={2} />
        
        {/* ERROR 3: Omit labels or aria-label attributes on inputs */}
        <input type="text" placeholder="Password" tabIndex={1} />
        
        {/* ERROR 4: Static container click tags lack keyboard focus reachability */}
        <div onClick={() => submit()} className="submit-btn">Submit</div>
      </div>
    </div>
  );
}
```

Why this fails: Omits skip links, uses hardcoded positive tab indexes, lacks labels on input fields, and uses static tags for submission actions.

---

## Failure Modes

- **The Broken Tab Order:** Setting positive `tabindex` values, breaking natural navigation hierarchies.
- **The Keyboard Modal Trap:** Failing to capture focus within modals, letting focus slip to background elements.
- **The Empty Skip Link:** Omitting skip navigation links, forcing users to tab through header links on every page load.
- **The Silent Validation Error:** Displaying form error messages that are not programmatically linked to inputs.
- **The Unreachable Action Tag:** Using static divs for buttons, skipping them during keyboard navigation.
- **The Hidden Screen Reader Focus:** Rendering modal overlays without toggling background layouts with `aria-hidden`.

## Validation

Audit markup structures, tab routes, and form bindings:

1. **Verify that no positive tabindex values are used:**
   Check code files:
   ```bash
   grep -rn 'tabIndex=\s*["'\'']\?[1-9]' src/ 2>/dev/null
   # expected: zero matches. Tab indexes are 0 or -1.
   ```
2. **Verify form inputs have associated labels:**
   Check input elements:
   ```bash
   grep -rn "<input" src/ | grep -v -E "id=|aria-label="
   # expected: Verify that inputs carry associated labels or aria-label properties.
   ```
3. **Verify skip navigation references in base layouts:**
   Check layout entry points:
   ```bash
   grep -rn "href=\"#main-content\"" src/ 2>/dev/null
   # expected: Page templates include skip navigation blocks.
   ```
4. **Identify inputs linked to errors via aria-describedby:**
   Scan code for `aria-describedby` keys on inputs to confirm error messages are linked.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan audit WCAG:

> "Use the skill `wcag-audit-patterns`. Read `.agent/skills/wcag-audit-patterns/SKILL.md` before coding. Never write positive tabIndex values or unlinked form errors. Always implement skip navigation triggers, trap focus in dialog containers, and associate input fields with labels."

## Related

- [ui-a11y](../ui-a11y/SKILL.md) — Focus style guidelines.
- [screen-reader-testing](../screen-reader-testing/SKILL.md) — Assistive technology testing.
- [accessibility-compliance-accessibility-audit](../accessibility-compliance-accessibility-audit/SKILL.md) — Audit reports.
