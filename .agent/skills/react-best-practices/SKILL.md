---
name: react-best-practices
description: Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel.
risk: safe
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Vercel React Best Practices

> **One-liner:** Guidelines for writing high-performance React and Next.js applications based on Vercel's optimization standards, targeting waterfall reduction and bundle size control.

## When to Use

- When writing new React functional components or Next.js layout pages.
- When implementing data fetching architectures (both client-side and server-side).
- When resolving component re-render loops or optimizing bundle loading states.

## Why This Exists

React's component reconciliation engine and Next.js's dual server-client routing pipeline offer high flexibility, but also introduce key performance failure modes. Typical developer slip-ups include creating sequential data fetching waterfalls, importing heavy modules synchronously on start, and causing unnecessary component re-renders through state mutation. Standardizing Vercel's rules ensures fast page loading, optimal bundle chunking, and efficient rendering cycles.

## ALWAYS DO THIS

- **Eliminate asynchronous waterfalls** — Trigger independent data fetch promises early and use `Promise.all()` to resolve them in parallel.
- **Lazy-load heavy modules** — Use Next.js `dynamic()` or React `lazy()` to import large third-party modules or below-the-fold interface components.
- **Implement request caching on the server** — Use React's `cache()` utility to deduplicate server-side data fetches across the same request lifecycle.
- **Clean up side effects** — Always return cleanup functions (e.g., unsubscribing listeners or clearing timeouts) in `useEffect` hooks.
- **Use stable keys for list items** — Map unique, stable database IDs (not array indexes) to lists to help React reconcile changes.

## NEVER DO THIS

- ❌ **DO NOT** trigger React state mutations directly (e.g., `state.push(item)`). **Why fails:** Bypasses React's state tracking mechanism, preventing UI updates or triggering unpredictable bugs. **Instead:** Perform immutable updates using spread operators (`setState([...state, item])`).
- ❌ **DO NOT** declare a new React component definition inside the body of another component. **Why fails:** Forces the nested component to completely re-mount on every single render cycle, destroying its internal state and causing severe lag. **Instead:** Declare components at the module root level.
- ❌ **DO NOT** use array indices as JSX list keys when list items can be re-ordered, filtered, or deleted. **Why fails:** Breaks React's virtual DOM reconciliation, resulting in input values staying behind or layout bugs. **Instead:** Use unique IDs (e.g., `item.id`).
- ❌ **DO NOT** subscribe to a state value that is only read inside event callback handlers. **Why fails:** Forces the entire component to re-render whenever the state changes, even though no visual updates depend on it. **Instead:** Capture value changes using mutable references (`useRef`).

---

## Technical Optimization Guidelines

### Waterfall Reduction
Compare these server component fetching approaches:
- **Waterfall (Bad):**
  ```tsx
  const user = await fetchUser();
  const posts = await fetchPosts(user.id); // Blocks until user returns
  ```
- **Parallel (Good):**
  ```tsx
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  ```

---

## Examples

### ✅ Good — Parallel Fetching, Dynamic Component Lazy Loading, and Cleanups

```tsx
import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// 1. Lazy load heavy chart components to keep bundle size small
const HeavyChart = dynamic(() => import("./components/HeavyChart"), {
  ssr: false,
  loading: () => <div>Loading Chart Engine...</div>
});

export default function Dashboard({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 2. Use AbortController to clean up pending fetch requests on unmount
    const controller = new AbortController();
    
    async function fetchData() {
      try {
        const response = await fetch(`/api/stats/${userId}`, { signal: controller.signal });
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }
    fetchData();

    return () => controller.abort();
  }, [userId]);

  return (
    <div>
      <h1>User Dashboard</h1>
      <Suspense fallback={<div>Loading Chart Component...</div>}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

Why this passes: Dynamically imports heavy modules, uses `AbortController` to cancel pending fetch requests on unmount, and wraps loading sections in Suspense blocks.

### ❌ Bad — Inline Component Definition, Direct State Mutation, and Missing Cleanups

```tsx
import React, { useState, useEffect } from "react";

export default function BadDashboard() {
  const [items, setItems] = useState([]);

  // ERROR 1: Component definition nested inside parent body (causes re-mounts on every render)
  function ChildItem({ name }) {
    return <li>{name}</li>;
  }

  useEffect(() => {
    // ERROR 2: Missing cleanup for background interval listener (causes memory leaks)
    setInterval(() => {
      // ERROR 3: Direct state array mutation
      items.push("New Item " + Date.now()); 
      setItems(items); 
    }, 1000);
  }, []);

  return (
    <ul>
      {/* ERROR 4: Using index as key in list elements */}
      {items.map((item, index) => (
        <ChildItem key={index} name={item} />
      ))}
    </ul>
  );
}
```

Why this fails: Nests component definitions, mutates state array directly, lacks interval timers cleanup, and uses index indices as list keys.

---

## Failure Modes

- **Hydration Mismatch Errors:** Loading server-incompatible DOM assets dynamically on start without disabling SSR templates.
- **Waterlogged APIs:** Performing serial server fetches sequentially inside nested sub-components instead of parallelizing them.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-best-practices`:

1. **Verify list keys usage:**
   Ensure lists do not map array index arguments as keys:
   ```bash
   grep -rn "key={index}" src/
   ```
2. **Scan for dynamic imports:**
   ```bash
   grep -rn "dynamic(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis komponen React:

> "Use the skill `react-best-practices`. Read `.agent/skills/react-best-practices/SKILL.md` before coding. Never declare nested component definitions or mutate states directly. Always parallelize independent fetches, use next/dynamic for heavy packages, and provide useEffect hook cleanup returns."

## Related

- [react-component-performance](../react-component-performance/SKILL.md) — Re-render limits.
- [react-patterns](../react-patterns/SKILL.md) — Structural structures.
- [tanstack-query-expert](../tanstack-query-expert/SKILL.md) — Fetch optimizations.
