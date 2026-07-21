---
name: frontend-developer
description: Core technical standards for React 19, Next.js 15, semantic HTML, client-side state management, and responsive layouts.
risk: safe
source: "Elite Agent Operations - Batch 3C (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Frontend Developer Expert Standard

> **One-liner:** Guidelines for writing semantic HTML5 structures, managing client-side data mutations using React 19 transitions, and designing accessible, responsive layouts.

## When to Use

- When authoring reusable React 19 / Next.js 15 interface components (forms, dialogs, sliders).
- When configuring client-side state managers (Zustand) and integrating database client triggers.
- When remediating rendering issues, hydration bottlenecks, or accessibility (WCAG 2.2 AA) failures.

## Why This Exists

Frontend interfaces must remain accessible, responsive, and performant under load. If developers write generic container tags with click event listeners instead of semantic action elements, assistive screen readers cannot navigate the page. Similarly, executing asynchronous calls inside effects without cleanup callbacks triggers resource leaks and race conditions. Enforcing semantic layout hierarchies, using React 19 transition helpers, and securing client states keeps code clean.

## ALWAYS DO THIS

- **Use semantic HTML5 elements for structure** — Organize page regions using semantic tags (e.g. `<main>`, `<nav>`, `<article>`, `<button>`) instead of nested generic div blocks.
- **Implement request abort controls inside effects** — Add abort controllers (e.g. `AbortController` signal parameters) inside `useEffect` calls to clean up pending network queries.
- **Use React 19 transition APIs for async states** — Wrap state mutations inside the `useTransition` hook or use `useActionState` to track execution states automatically.
- **Enforce layout responsiveness using container query tokens** — Style components dynamically using CSS container queries or Tailwind breakpoint tokens (`sm:`, `md:`, `lg:`).
- **Secure local state configurations from memory leaks** — Unregister interval timers, event bindings, and subscription channels when components unmount.

## NEVER DO THIS

- ❌ **DO NOT** use generic `div` blocks with click listeners in place of interactive semantic buttons or links. **Why fails:** Keyboard space/enter keys and screen readers bypass the element, locking keyboard-only users out. **Instead:** Render actions via `<button>` or `<a>` elements with proper href settings.
- ❌ **DO NOT** store sensitive session data or private keys inside client-side configurations or raw browser storage. **Why fails:** Malicious script components can fetch localStorage keys, triggering token theft. **Instead:** Keep auth variables inside secure HTTP-only cookies.
- ❌ **DO NOT** execute state mutations inside rendering calculations. **Why fails:** React throws infinite loops exceptions, crash-blocking the tab. **Instead:** Perform calculations inside event handlers or wrap them in `useMemo`.
- ❌ **DO NOT** ignore console warnings and error listings during local builds. **Why fails:** Gaps like duplicate element keys (`key`) cause layout glitches during DOM reorder events. **Instead:** Treat every console warning as a compile-time bug.

---

## Stateful Form & Action Lifecycle

Handling asynchronous mutations securely using React 19 transitions:

```
[Form Trigger] ──> [useTransition / startTransition] ──> [Server Action API] ──> [Optimistic UI update]
```

---

## Examples

### ✅ Good — React 19 transitions, Abort Signalling, and Semantic Nodes

#### 1. Accessible Search Component with Network Abort Cleanups (`components/SearchInput.tsx`)
```tsx
import React, { useState, useEffect, useTransition } from "react";

export function SearchInput({ onResultLoaded }: { onResultLoaded: (data: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 1. Establish abort signal control to prevent race conditions
    const controller = new AbortController();
    
    if (query.trim().length === 0) {
      onResultLoaded([]);
      return;
    }

    // Trigger state changes inside a React 19 transition scope
    startTransition(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const results = await response.json();
          onResultLoaded(results);
        }
      } catch (err) {
        // Safe check to ignore abort errors
        if ((err as Error).name !== "AbortError") {
          console.error("Search fetch failed:", err);
        }
      }
    });

    // 2. Clear pending request on component unmount or query updates
    return () => controller.abort();
  }, [query, onResultLoaded]);

  return (
    <div className="w-full max-w-md">
      {/* Semantic label and action tags */}
      <label htmlFor="search-box" className="block text-sm font-medium text-slate-700">
        Search Records
      </label>
      <div className="relative mt-2">
        <input
          id="search-box"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Type query to find items..."
        />
        {isPending && (
          <span className="absolute right-3 top-3 text-sm text-slate-500" aria-live="polite">
            Loading...
          </span>
        )}
      </div>
    </div>
  );
}
```

Why this passes: Uses semantic HTML structures, enforces an `AbortController` inside `useEffect` to prevent network race conditions, wraps dynamic changes inside React 19 `useTransition`, and uses aria-live properties for loading updates.

### ❌ Bad — Insecure Div Clicks, Missing Cleanups, and Raw Effect Updates

```tsx
import React, { useState, useEffect } from "react";

export default function BadSearch({ onUpdate }: any) {
  const [val, setVal] = useState("");

  // ERROR 1: Triggering side-effect fetching without cleanup triggers race conditions
  useEffect(() => {
    fetch(`/api/search?q=${val}`)
      .then((res) => res.json())
      .then((data) => onUpdate(data)); 
  }, [val]); // Lacks abort controls

  return (
    <div>
      <input type="text" onChange={(e) => setVal(e.target.value)} />
      
      {/* ERROR 2: Generic div container used as button (inaccessible to screen readers) */}
      <div 
        onClick={() => setVal("")} 
        style={{ cursor: "pointer", background: "red" }}
      >
        Clear
      </div>
    </div>
  );
}
```

Why this fails: Triggers async operations in `useEffect` without abort or cleanups, uses a generic `div` element as an interactive action trigger without tabIndex or roles, and uses inline styling properties.

---

## Failure Modes

- **The Div Click Trap:** Using `div` tags with `onClick` bindings, locking out users navigating via keyboards.
- **The Stale Fetch Overwrite:** Omitting abort cleanups in effects, letting delayed responses overwrite new inputs.
- **The Client State Key Leak:** Caching private access tokens in client-side arrays, exposing sessions to XSS theft.
- **The Infinite State Render:** Triggering state mutations directly inside component body renders, causing tab crashes.
- **The Missing Alert Status:** Updating views dynamically without using ARIA status tags to notify screen readers.
- **The Non-Semantic Action:** Using text anchors (`<a>` tags) without href declarations as action buttons.

## Validation

Verify element classifications, state cleaning hooks, and transition configurations:

1. **Verify that interactive divs are avoided:**
   Scan for dynamic clicks on non-semantic tags:
   ```bash
   grep -rn "onClick=" src/ | grep -E "<div|<span" 2>/dev/null
   # expected: zero matches. Interactive click events map to semantic button or link tags.
   ```
2. **Scan for abort signals inside state effects:**
   Ensure fetch functions inside useEffect handle abort parameters:
   ```bash
   grep -rn "useEffect(" src/ -A 10 | grep "AbortController"
   # expected: Effects handling API calls configure AbortController instances.
   ```
3. **Verify presence of React 19 transition handlers:**
   Verify transition usage:
   ```bash
   grep -rn "useTransition(" src/ 2>/dev/null
   # expected: Async state updates utilize React 19 useTransition models.
   ```
4. **Confirm keyboard focus actions accessibility:**
   Verify that custom interactive elements include keydown triggers.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan koding antarmuka:

> "Use the skill `frontend-developer`. Read `.agent/skills/frontend-developer/SKILL.md` before coding. Never use generic divs for buttons or execute network requests without abort controllers. Always write semantic elements, utilize useTransition, and configure responsive layouts."

## Related

- [frontend-dev-guidelines](../frontend-dev-guidelines/SKILL.md) — Architecture and features setups.
- [ui-a11y](../ui-a11y/SKILL.md) — Accessibility compliance guidelines.
- [react-best-practices](../react-best-practices/SKILL.md) — Dynamic cache optimizations.
