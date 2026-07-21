---
name: accessibility-compliance-accessibility-audit
description: Conduct accessibility audits, identify barriers, and provide WCAG 2.2 AA remediation guidance.
risk: high (ADA lawsuits, Section 508 failures, keyboard traps, unaccessible modal overlays)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Accessibility Audit and Testing

> **One-liner:** Guidelines for executing accessibility audits against WCAG 2.2 AA standards, validating custom interactive roles, and generating compliance remediation lists.

## When to Use

- When conducting audits of web interfaces for WCAG 2.2 compliance.
- When identifying accessibility barriers and defining remediation steps.
- When preparing VPAT evidence for stakeholders or verification checks.

## Why This Exists

Achieving accessibility compliance is essential to ensure equal access and avoid legal penalties. While automated tools (like Axe-core or Lighthouse) catch standard issues (like missing alt tags or low contrast), they miss interactive barriers like keyboard focus traps or broken tab orders. Enforcing manual keyboard testing, ARIA role validations, and structured remediation pipelines ensures Section 508 compliance.

## ALWAYS DO THIS

- **Verify all interactive controls are keyboard reachable** — Test that every button, input, and link can be navigated and activated using only the keyboard.
- **Enforce native semantic elements over custom roles** — Use standard tags (like `<button>` or `<input>`) before building custom ARIA elements.
- **Maintain logical document outlines** — Structure page content using logical heading orders (`<h1>` to `<h6>`) without skipping levels.
- **Verify form error message associations** — Ensure form inputs are programmatically linked to validation messages using `aria-describedby`.
- **Set HTML document languages** — Set the language attribute (e.g. `<html lang="en">`) on root tags to help screen readers select the right voice profile.

## NEVER DO THIS

- ❌ **DO NOT** claim legal accessibility compliance based only on automated scans. **Why fails:** Automated tools only detect 30-40% of WCAG violations, missing interactive errors like keyboard focus traps or incorrect reading orders. **Instead:** Perform manual keyboard and screen reader checks.
- ❌ **DO NOT** use custom ARIA roles (like `role="button"`) on generic tags without mapping keyboard events (like `keydown` Space/Enter). **Why fails:** Screen readers announce the tag as a button, but keyboard users cannot trigger it since generic tags lack native Space/Enter triggers. **Instead:** Use native `<button>` tags.
- ❌ **DO NOT** use positive tabIndex values (e.g. `tabindex="1"`). **Why fails:** Positive values break the natural DOM reading order, causing confusing navigation paths for keyboard users. **Instead:** Use `tabindex="0"` for interactive controls or `-1` for programmatic focus.
- ❌ **DO NOT** hide interactive elements from screen readers using `aria-hidden="true"`. **Why fails:** Renders the elements invisible to screen reader users while keeping them tabbable, creating confusing keyboard focus bugs. **Instead:** Hide elements completely using CSS `display: none` or Tailwind `sr-only` styles.

---

## Accessibility Audit Pipeline

A complete audit combines automated tooling with manual keyboard and screen reader validation:

```
[Target URL Route] ──> [Run axe-core CLI Scan] ──> [Manual Keyboard Tab Check] ──> [Remediation List]
```

---

## Examples

### ✅ Good — Keyboard Navigation, Form Input Labels, and Logical Reading Hierarchy

```typescript
import { useState } from "react";

export function TabContainer() {
  const [activeTab, setActiveTab] = useState("tab-1");

  return (
    <div className="border rounded p-4">
      {/* 1. Build tabs using correct tablist roles and keyboard triggers */}
      <div role="tablist" aria-label="Project details tabs" className="flex border-b mb-4">
        <button
          role="tab"
          id="tab-1-trigger"
          aria-selected={activeTab === "tab-1"}
          aria-controls="tab-1-panel"
          onClick={() => setActiveTab("tab-1")}
          className={`px-4 py-2 border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            activeTab === "tab-1" ? "border-blue-600 font-medium" : "border-transparent"
          }`}
        >
          Overview
        </button>
        
        <button
          role="tab"
          id="tab-2-trigger"
          aria-selected={activeTab === "tab-2"}
          aria-controls="tab-2-panel"
          onClick={() => setActiveTab("tab-2")}
          className={`px-4 py-2 border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            activeTab === "tab-2" ? "border-blue-600 font-medium" : "border-transparent"
          }`}
        >
          Details
        </button>
      </div>

      {/* 2. Wrap panels inside tabpanel structures linked to their triggers */}
      <div
        role="tabpanel"
        id="tab-1-panel"
        aria-labelledby="tab-1-trigger"
        hidden={activeTab !== "tab-1"}
        tabIndex={0}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <p>This is the project overview content.</p>
      </div>

      <div
        role="tabpanel"
        id="tab-2-panel"
        aria-labelledby="tab-2-trigger"
        hidden={activeTab !== "tab-2"}
        tabIndex={0}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <p>This is the detailed project statistics.</p>
      </div>
    </div>
  );
}
```

Why this passes: Uses native button elements, implements ARIA tablist roles, uses `hidden` parameters to hide inactive panels, and includes focusable states for active panels.

### ❌ Bad — Custom Toggles without Keyboard Triggers and Unlabeled Layouts

```typescript
import { useState } from "react";

// ERROR 1: Building a tab component using generic div tags without keyboard handlers
export function BadTab() {
  const [active, setActive] = useState("one");

  return (
    <div className="tab-wrapper">
      <div className="tabs-header">
        {/* ERROR 2: Custom button role on div without tabIndex or key triggers */}
        <div 
          role="button" 
          onClick={() => setActive("one")} 
          className="tab-item"
        >
          Overview
        </div>
        
        {/* ERROR 3: Custom button lacks keyboard accessibility */}
        <div 
          role="button" 
          onClick={() => setActive("two")} 
          className="tab-item"
        >
          Details
        </div>
      </div>

      {/* ERROR 4: Static panel containers lack connection triggers */}
      <div className="panel" style={{ display: active === "one" ? "block" : "none" }}>
        Overview Content
      </div>
    </div>
  );
}
```

Why this fails: Uses generic `div` tags for tab navigation, defines roles without mapping keyboard triggers or tab indexes, and fails to link panel elements to triggers.

---

## Failure Modes

- **The Automated Validation Lock:** Relying only on automated scan tools and missing interactive focus bugs.
- **The Silent Custom Trigger:** Declaring ARIA roles (e.g. `role="button"`) on generic tags without implementing keyboard listeners.
- **The Broken Tab Order:** Setting positive `tabindex` values, breaking the natural document outline flow.
- **The Invisible Focus Trap:** Hiding focus rings (`outline: none`), leaving keyboard users lost.
- **The Disconnected Validation Error:** Displaying error text that is not linked to inputs via `aria-describedby`.
- **The Mismatched Lang Tag:** Omitting or misconfiguring root language parameters (`<html lang="en">`).

## Validation

Audit markup structures, tab navigation patterns, and ARIA roles:

1. **Verify that no positive tabindex values are used:**
   Check code files:
   ```bash
   grep -rn 'tabIndex=\s*["'\'']\?[1-9]' src/ 2>/dev/null
   # expected: zero matches. Tab indexes are 0 or -1.
   ```
2. **Verify native element usage over custom roles:**
   Scan code for click handlers on static tags:
   ```bash
   grep -rn "onClick=" src/ | grep -E "<div|<span|<p"
   # expected: zero matches. Triggers use native button tags or carry proper tabIndex and key handlers.
   ```
3. **Verify root lang parameter settings:**
   Check HTML templates:
   ```bash
   grep -rn "<html" src/ || grep -rn "<html" public/ 2>/dev/null
   # expected: Root HTML tags define language attributes.
   ```
4. **Confirm form error associations:**
   Check inputs for `aria-describedby` configurations.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan audit aksesibilitas:

> "Use the skill `accessibility-compliance-accessibility-audit`. Read `.agent/skills/accessibility-compliance-accessibility-audit/SKILL.md` before coding. Never write positive tabIndexes or custom roles without key triggers. Always verify interactive elements are keyboard reachable, use native buttons, set root lang tags, and link form errors."

## Related

- [ui-a11y](../ui-a11y/SKILL.md) — Focus style guidelines.
- [wcag-audit-patterns](../wcag-audit-patterns/SKILL.md) — WCAG 2.2 AA standards.
- [screen-reader-testing](../screen-reader-testing/SKILL.md) — Assistive technology checks.
