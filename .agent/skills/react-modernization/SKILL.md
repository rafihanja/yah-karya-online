---
name: react-modernization
description: Master React version upgrades, class to hooks migration, concurrent features adoption, and codemods for automated transformation.
risk: medium (broken lifecycle hooks behavior, state sync mismatch, transition bottlenecks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React Modernization

> **One-liner:** Guidelines for upgrading React codebases, migrating legacy class components to hooks, and adopting Concurrent features.

## When to Use

- When refactoring legacy React projects containing ES6 Class components and lifecycle methods (`componentDidMount`, etc.).
- When upgrading apps to React 18 or 19 to leverage Concurrent rendering features (`useTransition`, `useDeferredValue`).
- When modernizing class-based state management or migrating components to TypeScript structures.

## Why This Exists

React has evolved from imperative class-based lifecycles to declarative functional hooks, and eventually to Concurrent rendering states. Legacy Class components lead to verbose, hard-to-maintain code blocks, and lack access to modern features (such as Server Components or hooks like `useTransition`). Furthermore, during migrations, developers often introduce bugs by mapping lifecycle hooks incorrectly (e.g. executing side effects during render, or forgetting unmount subscription cleanup methods), which can cause layout freezes.

## ALWAYS DO THIS

- **Map class lifecycles to useEffect cleanup pairs** — Ensure `componentDidMount` and `componentWillUnmount` map to a single `useEffect` block containing a clear return cleanup routine.
- **Adopt concurrent transitions for heavy updates** — Use `useTransition` and `startTransition` to mark non-urgent state updates (like sorting tables or fetching search queries) as low-priority, preventing UI freezes.
- **Maintain hooks order** — Always declare hooks at the top level of React functions, avoiding loops, conditions, or nested callback wrappers.
- **Preserve state reference immutability** — Keep state mutations clean by using functional setters `setState(prev => ...)` when referencing old states.
- **Leverage automated codemods** — Run official React upgrade codemods (`npx react-codemod`) to automate syntax migrations, reducing human error.

## NEVER DO THIS

- ❌ **DO NOT** use synchronous render paths for complex state changes. **Why fails:** Blocks the main thread, causing inputs to freeze while heavy data panels render. **Instead:** Wrap non-urgent updates inside `startTransition`.
- ❌ **DO NOT** execute side effects (like API calls or DOM writes) directly inside the body of a functional component. **Why fails:** These operations run on every single render cycle, creating infinite loop fetches or memory overhead. **Instead:** Wrap side effects inside `useEffect`.
- ❌ **DO NOT** mix class state mutators (`this.state.x = y`) inside functional component wrappers. **Why fails:** Destroys React's hook-tracking mechanism, preventing UI updates or triggering immediate compiler errors. **Instead:** Migrate class states fully to the `useState` hook.

---

## Technical Migration Mapping

| Legacy Class Lifecycle | Modern Functional Hook equivalent |
|-------------------------|------------------------------------|
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentWillUnmount` | `useEffect(() => { return () => { ... } }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [dependencies])` |
| `shouldComponentUpdate` | `React.memo(Component, compareProps)` |

---

## Examples

### ✅ Good — Clean Lifecycle Migration and Concurrent Transition Setup

```tsx
import React, { useState, useEffect, useTransition } from "react";

export default function UserListPanel({ userId }) {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Map legacy componentDidMount & componentWillUnmount cleanly with cleanups
  useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 2. Map legacy componentDidUpdate to dependency-tracked useEffect
  useEffect(() => {
    let isCurrent = true;
    async function fetchUser() {
      const res = await fetch(`/api/user/${userId}`);
      const json = await res.json();
      if (isCurrent) setData(json);
    }
    fetchUser();

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Keep keystroke typing immediate
    setQuery(value);

    // 3. Defer heavy list rendering updates using transitions
    startTransition(() => {
      // Perform non-urgent filtering calculations here
      console.log("Filtering for:", value);
    });
  };

  return (
    <div>
      <input type="text" value={query} onChange={handleSearchChange} placeholder="Search..." />
      {isPending && <p>Filtering lists...</p>}
      {data ? <div>User: {data.name}</div> : <div>Loading...</div>}
    </div>
  );
}
```

Why this passes: Maps lifecycle hooks cleanly with unmount cleanups, uses `useTransition` to prevent UI blocks, and manages side effects inside dependency-tracked hooks.

### ❌ Bad — Legacy Class Component with Side Effects inside Render Path

```tsx
import React from "react";

// ERROR 1: Retaining obsolete ES6 Class component patterns
export default class LegacyUserPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  componentDidMount() {
    // ERROR 2: Missing unmount cleanups for event listeners (leads to memory leaks)
    window.addEventListener("resize", () => console.log(window.innerWidth));
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchData();
    }
  }

  async fetchData() {
    const res = await fetch(`/api/user/${this.props.userId}`);
    const json = await res.json();
    // ERROR 3: direct mutative state update triggers
    this.setState({ data: json });
  }

  render() {
    // ERROR 4: Performing side effects directly inside render function
    console.log("Rendering component");
    return <div>User: {this.state.data?.name}</div>;
  }
}
```

Why this fails: Uses legacy class structures, lacks event listener cleanup on unmount, performs side effects inside the render loop, and lacks concurrent transitions.

---

## Failure Modes

- **Stale State Closures:** Legacy transitions capture outdated state references because dependency variables are omitted from effect lists.
- **Unhandled Event Accumulation:** Forgetting to return listener removal functions in `useEffect` causes memory leaks and performance drop.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-modernization`:

1. **Verify class component absence:**
   Ensure no new class declarations exist:
   ```bash
   grep -rn "class " src/ | grep "extends React.Component"
   ```
2. **Scan for startTransition usage:**
   Ensure heavy updates use Concurrent features:
   ```bash
   grep -rn "startTransition(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan modernisasi React:

> "Use the skill `react-modernization`. Read `.agent/skills/react-modernization/SKILL.md` before coding. Never write legacy class components. Always migrate to functional hooks with unmount cleanups, map class states to useState hooks, and defer heavy rendering using startTransition."

## Related

- [react-best-practices](../react-best-practices/SKILL.md) — Performance rules.
- [react-component-performance](../react-component-performance/SKILL.md) — Render optimizations.
