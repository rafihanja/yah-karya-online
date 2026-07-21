---
name: react-component-performance
description: Diagnose slow React components and suggest targeted performance fixes.
risk: medium (unnecessary memoization overhead, broken dependency array bugs)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React Component Performance

> **One-liner:** Guidelines for diagnosing render bottlenecks and isolating high-frequency state updates to optimize React component performance.

## When to Use

- When profiling a slow React view dropping frames below 60 FPS.
- When minimizing component re-renders triggered by keyboard input, timers, or scroll triggers.
- When optimizing long list rendering structures containing custom sub-components.

## Why This Exists

React uses a virtual DOM comparison (reconciliation) process. Every time a parent component re-renders, React recursively checks all its children by default. If a parent component hosts a high-frequency state update (like a 1-second interval timer or a character keystroke buffer), the entire subtree gets reconciled repeatedly. This waste of CPU cycles causes lag. Separating fast-changing states into isolated child trees and memoizing static nodes prevents unnecessary reconciliation cycles.

## ALWAYS DO THIS

- **Isolate high-frequency ticking states** — Extract timer intervals, animation frames, and character search inputs into dedicated self-contained child components.
- **Memoize expensive layout calculations** — Wrap complex array processing (like filtering, map sorting, or mapping arrays) in `useMemo` hooks with strict primitive dependency variables.
- **Stabilize callback handlers** — Wrap function props passed to memoized child components in `useCallback` hooks to prevent reference mutations.
- **Profile with React DevTools** — Use the React DevTools Profiler in production builds to record rendering durations, identifying components taking longer than 16ms to render.
- **Window/Virtualize long lists** — Only render list elements currently visible inside the viewport box when dealing with more than 100 entries.

## NEVER DO THIS

- ❌ **DO NOT** use React state variables to track coordinates or offsets inside scroll/hover listeners. **Why fails:** Triggers continuous re-render operations, dropping frame rates and causing layout delay. **Instead:** Access elements directly using mutable `useRef` handles.
- ❌ **DO NOT** wrap every single component in `React.memo` or every function in `useCallback` by default. **Why fails:** Premature optimization introduces more overhead from reference comparisons than the actual rendering savings. **Instead:** Target components that render frequently or perform heavy computations.
- ❌ **DO NOT** declare dependencies that change reference on every render (like inline arrays `[1, 2, 3]` or object literals `{}`) inside `useEffect` or `useMemo` dependency arrays. **Why fails:** Causes the hook to execute on every single render cycle, defeating its purpose. **Instead:** Memoize the reference or extract it to a module-level constant.

---

## Examples

### ✅ Good — Isolated State Ticking and Memoized Expensive Computations

```tsx
import React, { useState, useEffect, useMemo, memo, useCallback } from "react";

// 1. Separate ticking clock state into isolated component so parent dashboard doesn't re-render
const Clock = memo(function Clock() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(timerId);
  }, []);

  return <span>Time: {ticks}s</span>;
});

// 2. Wrap list items in React.memo with stable callbacks
const RowItem = memo(function RowItem({ item, onClick }) {
  return <li onClick={() => onClick(item.id)}>{item.name}</li>;
});

export default function Dashboard({ items }) {
  const [selectedId, setSelectedId] = useState(null);

  // 3. Memoize heavy map reductions so they only run when inputs change
  const processedData = useMemo(() => {
    return items.filter((item) => item.active);
  }, [items]);

  // 4. Stabilize callback functions passed to memoized rows
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      <Clock />
      <ul>
        {processedData.map((item) => (
          <RowItem key={item.id} item={item} onClick={handleSelect} />
        ))}
      </ul>
      {selectedId && <p>Selected Item: {selectedId}</p>}
    </div>
  );
}
```

Why this passes: Keeps ticking states isolated, memoizes calculations, uses stable `useCallback` hooks for row interactions, and uses unique database keys.

### ❌ Bad — Inline Reductions and Root State Mutations triggering Re-renders

```tsx
import React, { useState, useEffect } from "react";

export default function BadDashboard({ items }) {
  const [ticks, setTicks] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // ERROR 1: Interval updates parent state (triggers full list re-renders every second)
    const timerId = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(timerId);
  }, []);

  // ERROR 2: Performs heavy filtering calculations directly in the render path
  const processedData = items.filter((item) => item.active);

  // ERROR 3: Direct inline handler creates a new function reference on every single render
  return (
    <div>
      <span>Time: {ticks}s</span>
      <ul>
        {processedData.map((item) => (
          <li key={item.id} onClick={() => setSelectedId(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Why this fails: Triggers parent component updates every second, runs heavy filter processing on every render path, and recreates interaction references.

---

## Failure Modes

- **Input Typing Lag:** Character keystroke inputs trigger full-page re-renders, causing a noticeable delay between typing a key and seeing the character display on screen.
- **Infinite Effect Re-runs:** Omitting dependencies or using unstable object references inside dependency arrays triggers infinite render loops, crashing the tab.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-component-performance`:

1. **Verify callback stabilization:**
   Ensure callback functions passed to memoized children are wrapped in `useCallback`:
   ```bash
   grep -rn "useCallback(" src/
   ```
2. **Scan for heavy state updates on root panels:**
   Ensure timers or input handlers are extracted:
   ```bash
   grep -rn "setInterval" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengoptimasi komponen:

> "Use the skill `react-component-performance`. Read `.agent/skills/react-component-performance/SKILL.md` before coding. Never trigger parent re-renders using interval states. Always isolate high-frequency updates, wrap heavy maps in `useMemo`, and stabilize nested function calls with `useCallback`."

## Related

- [react-best-practices](../react-best-practices/SKILL.md) — Waterfall optimizations.
- [react-patterns](../react-patterns/SKILL.md) — Custom hooks design.
