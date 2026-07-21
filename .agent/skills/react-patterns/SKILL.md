---
name: react-patterns
description: Elite React 18+ Architecture and Performance Patterns.
risk: medium (anti-patterns, tight logic-UI coupling, broken Context re-renders)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React Patterns

> **One-liner:** Guidelines for structural React composition patterns, custom hook encapsulation, and separating business logic from visual presentation.

## When to Use

- When structuring complex layout hierarchies (such as compound navigation selectors, tabs, or form controls).
- When modularizing stateful page logic or refactoring large components.
- When designing custom context interfaces or reusable custom hook functions.

## Why This Exists

If business logic (like API data fetches or complex calculations) is written directly inside visual JSX components, the layout becomes tightly coupled to specific endpoints. This makes components difficult to test, reuse, or refactor. Furthermore, passing data down multiple levels of child components (props drilling) leads to verbose and brittle code. Utilizing clean structural patterns (like Custom Hooks, Context-based Compound Components, and Render Props) enforces a clean separation of concerns.

## ALWAYS DO THIS

- **Isolate business logic inside Custom Hooks** — Move API fetching, coordinate tracking, and state handlers into dedicated custom hook functions (e.g. `useUserData`).
- **Encapsulate shared state via Compound Components** — Design tab or dropdown components using React Context to share state implicitly among children, avoiding props-drilling.
- **Provide clean Error Boundary fallbacks** — Wrap major dashboard grids and page trees in Error Boundaries to prevent a single component crash from breaking the entire application.
- **Declare stable, primitive component props** — Avoid passing un-memoized object or array literals as props to prevent child components from re-rendering on every cycle.
- **Ensure TypeScript interfaces are strictly typed** — Explicitly define property shapes using typescript `interface` or `type` tags instead of using `any`.

## NEVER DO THIS

- ❌ **DO NOT** execute raw API fetch calls directly inside the body of a visual JSX component. **Why fails:** Couples UI to network states, complicates testing, and makes it impossible to reuse the presentation component elsewhere. **Instead:** Extract the fetch call into a custom hook.
- ❌ **DO NOT** pass states through more than three levels of children (props-drilling). **Why fails:** Leads to fragile components where changing a prop name in one file breaks multiple unrelated files down the tree. **Instead:** Use React Context, Zustand, or Jotai for global state.
- ❌ **DO NOT** instantiate component functions dynamically inside another component's render path. **Why fails:** Destroys React's node reconciliation, resetting the child component's internal state on every render. **Instead:** Define components as separate root-level functions.

---

## Technical Design Archetypes

### Compound Components Pattern
Implement tab structures using Context implicitly:
```tsx
const TabContext = createContext(null);
export function Tabs({ children, defaultActive }) {
  const [active, setActive] = useState(defaultActive);
  return <TabContext.Provider value={{ active, setActive }}>{children}</TabContext.Provider>;
}
export function TabTrigger({ value, children }) {
  const { active, setActive } = useContext(TabContext);
  return <button onClick={() => setActive(value)} className={active === value ? "active" : ""}>{children}</button>;
}
```

---

## Examples

### ✅ Good — Custom Hooks for Separating Logic from Presentation

```tsx
import React, { useState, useEffect } from "react";

// 1. Separate all business logic and API orchestration into a Custom Hook
function useUserStats(userId: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    async function getStats() {
      setLoading(true);
      const res = await fetch(`/api/stats/${userId}`);
      const json = await res.json();
      if (isCurrent) {
        setStats(json);
        setLoading(false);
      }
    }
    getStats();
    return () => {
      isCurrent = false;
    };
  }, [userId]);

  return { stats, loading };
}

interface UserProfileProps {
  userId: string;
}

// 2. The Presentation component only handles JSX layouts and receives clean hooks data
export function UserProfile({ userId }: UserProfileProps) {
  const { stats, loading } = useUserStats(userId);

  if (loading) return <div>Loading user metrics...</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="profile-card">
      <h2>{stats.name}</h2>
      <p>Performance score: {stats.score}</p>
    </div>
  );
}
```

Why this passes: Encapsulates stateful API logic inside a reusable hook, typed using clean interfaces, separates concerns, and handles fetching safely.

### ❌ Bad — Tight Logic-UI Coupling and Props-Drilling

```tsx
import React, { useState, useEffect } from "react";

// ERROR 1: Component contains mixed visual rendering, API calls, and inline state
export default function BadProfile({ userId }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // ERROR 2: Direct API fetch call written inside visual component (no unmount cancel)
    fetch(`/api/stats/${userId}`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, [userId]);

  // ERROR 3: Direct props drilling - passing data manually down multiple levels
  return (
    <div className="container">
      <Header />
      <MainContent data={data} />
    </div>
  );
}

function MainContent({ data }) {
  return (
    <main>
      <Sidebar data={data} />
      <ContentArea data={data} />
    </main>
  );
}

function ContentArea({ data }) {
  return <div>Score: {data?.score}</div>;
}

function Header() {
  return <header>Header Title</header>;
}
function Sidebar({ data }) {
  return <aside>User: {data?.name}</aside>;
}
```

Why this fails: Couples data fetching directly to UI templates, forces props-drilling down multiple child layers, and lacks clean unmount cancels.

---

## Failure Modes

- **White Screen of Death:** A rendering crash in a nested leaf node crashes the entire layout because there are no Error Boundaries wrapped around main panels.
- **Context Re-render Storms:** Wrapping all application states in a single Context Provider forces the entire app to re-render whenever a single state variable changes.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-patterns`:

1. **Verify custom hooks encapsulation:**
   Check that complex logic is extracted into custom hooks prefix functions:
   ```bash
   grep -rn "function use" src/
   ```
2. **Scan for inline fetching patterns:**
   Ensure fetch calls are wrapped inside hooks:
   ```bash
   grep -rn "fetch(" src/ | grep -v "use"
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk merancang arsitektur React:

> "Use the skill `react-patterns`. Read `.agent/skills/react-patterns/SKILL.md` before coding. Never mix network fetch logic inside presentation components. Always isolate state handlers in custom hooks, resolve prop-drilling using Context or global stores, and define clean interfaces."

## Related

- [react-best-practices](../react-best-practices/SKILL.md) — Optimization rules.
- [react-component-performance](../react-component-performance/SKILL.md) — Render performance.
- [react-state-management](../react-state-management/SKILL.md) — Global state engines.
