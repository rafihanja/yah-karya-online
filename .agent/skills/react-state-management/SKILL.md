---
name: react-state-management
description: Master modern React state management with Redux Toolkit, Zustand, Jotai, and React Query.
risk: medium (unnecessary global re-renders, cache sync mismatch, boilerplate overhead)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React State Management

> **One-liner:** Guidelines for selecting, structuring, and optimizing client-side (Zustand/Jotai/Redux) and server-side (React Query) global state solutions in React.

## When to Use

- When organizing data sharing between sibling or distant nested components.
- When separating ephemeral UI state (e.g. sidebar toggle) from cached server-state data.
- When implementing optimistic UI state updates for immediate user feedback.

## Why This Exists

React's built-in Context API is useful for injecting configuration states (like themes or locales). However, Context is not designed for high-frequency or heavy state updates: whenever a Context value changes, all components that consume that Context are forced to re-render, creating severe performance bottlenecks. Using dedicated state engines (like Zustand for store-based state, Jotai for atomic state, or TanStack Query for server-cache state) with selective subscriptions solves this problem.

## ALWAYS DO THIS

- **Decouple client UI state from server-side caches** — Let TanStack Query manage server-state data (caching, polling, mutations), and restrict Zustand/Jotai to client-side UI states.
- **Use granular selectors for store subscriptions** — Subscribe to specific state slices (e.g., `useStore(state => state.user)`) instead of extracting the entire store object, preventing unnecessary re-renders.
- **Compute derived values dynamically** — Calculate derived parameters (like list length or total prices) dynamically during render or use `useMemo` instead of storing them as duplicate state values.
- **Normalize flat store structures** — Flatten deeply nested state trees to simplify updates and avoid object reference comparison errors.
- **Configure staleTime query parameters** — Declare explicit `staleTime` values in TanStack Query to prevent redundant network requests whenever a component mounts.

## NEVER DO THIS

- ❌ **DO NOT** use global state stores to host local, component-specific variables (like form inputs or button hover toggles). **Why fails:** Bloats store memory and triggers global re-render cycles for simple local updates. **Instead:** Keep local states in standard `useState` hooks.
- ❌ **DO NOT** duplicate remote API server responses inside a client state store (Zustand/Redux). **Why fails:** Desynchronizes client data from the database server, leading to stale info or cache mismatch. **Instead:** Use TanStack Query as the single source of truth for server state.
- ❌ **DO NOT** update state variables directly via mutations. **Why fails:** Bypasses state reference comparison checks, preventing UI renders or breaking time-travel debugging. **Instead:** Always perform immutable updates.

---

## Technical Decision Tree

```
Are you managing remote data fetched from an API?
├── Yes ──> Use TanStack Query
└── No ───> Are you managing atomic, coordinate-style values?
            ├── Yes ──> Use Jotai
            └── No ───> Use Zustand (or Redux Toolkit for massive enterprise systems)
```

---

## Examples

### ✅ Good — Zustand Slice with Granular Selectors and Context Isolation

```typescript
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

// 1. Create a lightweight Zustand store for client UI state
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme })
}));

// 2. Consume specific, granular selectors inside components to prevent redundant renders
export function SidebarToggle() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <button onClick={toggleSidebar}>
      {sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
    </button>
  );
}

export function ThemeIndicator() {
  // This component will NOT re-render when sidebarOpen changes
  const theme = useUIStore((state) => state.theme);
  return <span>Current theme: {theme}</span>;
}
```

Why this passes: Uses selective store subscriptions to isolate component re-renders, strictly types store actions, and keeps state updates immutable.

### ❌ Bad — Global Context Wrapping Everything and Duplicating Server State

```tsx
import React, { createContext, useState, useContext, useEffect } from "react";

// ERROR 1: Using Context API to wrap all dynamic, high-frequency state updates
const AppContext = createContext<any>(null);

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<any>(null); // ERROR 2: Duplicating server state in local Context

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUserData(data));
  }, []);

  // ERROR 3: Direct mutation warning - object literal created on every render
  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, userData }}>
      {children}
    </AppContext.Provider>
  );
}

export function SidebarButton() {
  // ERROR 4: This button re-renders whenever userData updates, even though it only needs sidebar state
  const { sidebarOpen, setSidebarOpen } = useContext(AppContext);
  return (
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle</button>
  );
}
```

Why this fails: Wraps all state updates in a single Context Provider (causing app-wide re-renders), duplicates API data, and lacks optimized store slices.

---

## Failure Modes

- **Context Re-render Storms:** A single input change triggers app-wide rendering because all states are hosted in a single Context Provider.
- **Stale Server Cache Mismatch:** Caching remote responses in Zustand leads to outdated values because the store lacks auto-refresh or polling mechanisms.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-state-management`:

1. **Verify selector usage in Zustand hooks:**
   Ensure components subscribe to specific state slices:
   ```bash
   grep -rn "useStore(" src/
   # Verify that arguments pass a selector function (e.g. state => state.value)
   ```
2. **Scan for duplicated API data fields:**
   ```bash
   grep -rn "createSlice" src/ | grep -i "user"
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk memilih state management:

> "Use the skill `react-state-management`. Read `.agent/skills/react-state-management/SKILL.md` before coding. Never duplicate server responses inside client Zustand stores. Always keep local UI state in useState, use selectors for store subscriptions, and manage server state with TanStack Query."

## Related

- [react-best-practices](../react-best-practices/SKILL.md) — Fetching waterfalls.
- [react-component-performance](../react-component-performance/SKILL.md) — Render optimization.
- [tanstack-query-expert](../tanstack-query-expert/SKILL.md) — Server caching.
