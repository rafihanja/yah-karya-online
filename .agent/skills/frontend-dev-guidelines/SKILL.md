---
name: frontend-dev-guidelines
description: Architectural and performance coding standards for React, TypeScript, Suspense-first dynamic rendering, code organization, and type safety.
risk: safe
source: "Elite Agent Operations - Batch 3C (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Frontend Development Guidelines

> **One-liner:** Non-negotiable structural, performance, and type-safety standards for building production-grade React and TypeScript applications.

## When to Use

- When organizing front-end monorepo architectures (such as colocating resources inside `src/features/` folders).
- When configuring Suspense-first dynamic queries (`useSuspenseQuery`) or managing asynchronous boundary structures.
- When refactoring React code blocks to prevent unnecessary re-renders or resource memory leaks.

## Why This Exists

Frontend codebases decay rapidly when architectural boundaries are ignored. Allowing direct API fetch triggers inside components, neglecting typescript definitions, or writing custom loading spinners on every page leads to inconsistent user experiences and heavy bundle loads. Enforcing strict Suspense rendering patterns, isolating API logic in feature folders, and mandating explicit type definitions prevents runtime errors and bundle bloat.

## ALWAYS DO THIS

- **Isolate domain logic inside feature directories** — Organize files under modular feature folders (e.g. `src/features/{feature-name}/api/`) and expose functionalities cleanly via `index.ts` gates.
- **Configure Suspense-first query hooks for data fetching** — Rely on React Query's `useSuspenseQuery` or Suspense components instead of manual loading variables (`isLoading`).
- **Enforce explicit return types on all functions** — Define strict typescript return shapes (e.g. `export function formatAmount(value: number): string`) instead of letting compiler infer types.
- **Wrap interactive handlers in performance hooks** — Enforce handler memoization using `useCallback` when passing events as callbacks to optimized leaf elements.
- **Lazy load non-trivial routes and dynamic modals** — Split bundle sizes using lazy loading declarations (e.g. `React.lazy(() => import(...))`) wrapped inside Suspense loaders.

## NEVER DO THIS

- ❌ **DO NOT** use the `any` keyword in typescript declarations. **Why fails:** Disables structural checking, exposing the application to runtime type exceptions. **Instead:** Define explicit interface schemas or use `unknown` combined with type guards.
- ❌ **DO NOT** write raw inline axios/fetch calls inside page components. **Why fails:** Couples UI rendering directly with dynamic API networks, making mocking and unit testing impossible. **Instead:** Colocate network requests in dedicated feature api layers.
- ❌ **DO NOT** write custom early-return spinner statements (e.g. `if (loading) return <Spinner />` = ❌). **Why fails:** Bypasses React's native streaming layout features, causing layout shifts. **Instead:** Delegate loading states to Suspense boundaries (`loading.tsx`).
- ❌ **DO NOT** import cross-feature private files without going through public exports. **Why fails:** Creates tight dependency coupling, breaking modular builds. **Instead:** Read imports exclusively from feature `index.ts` entry points.

---

## Component Rendering Order & Architecture

Ordering component declarations to maintain readability and predictability:

```
[Props Interfaces] ──> [Hooks Initialization] ──> [Memoized Derivations] ──> [Callback Handlers] ──> [JSX Render]
```

---

## Examples

### ✅ Good — Features Isolation, Suspense Queries, and Explicit Types

#### 1. Isolated API Client Layer (`features/user-profile/api/getUserProfile.ts`)
```typescript
import axios from "axios";

export interface UserProfileData {
  id: string;
  name: string;
  avatarUrl: string;
}

export async function getUserProfile(userId: string): Promise<UserProfileData> {
  const { data } = await axios.get<UserProfileData>(`/api/users/${userId}`);
  return data;
}
```

#### 2. Suspense-First Feature Component (`features/user-profile/components/UserProfile.tsx`)
```tsx
import React, { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/getUserProfile";

interface UserProfileProps {
  userId: string;
  onRefreshCompleted?: (timestamp: number) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onRefreshCompleted }) => {
  // 1. Fetch data utilizing native Suspense hooks
  const { data: profile } = useSuspenseQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  // 2. Wrap interactive callback in performance hook
  const handleRefreshClick = useCallback(() => {
    onRefreshCompleted?.(Date.now());
  }, [onRefreshCompleted]);

  return (
    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
      <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-full" />
      <h2 className="mt-4 text-xl font-bold text-slate-900">{profile.name}</h2>
      <button onClick={handleRefreshClick} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
        Refresh Status
      </button>
    </div>
  );
};
```

Why this passes: Separates API operations from rendering files, fetches data utilizing `useSuspenseQuery` without early-return spinner clutter, uses strict typescript types, and wraps callbacks in `useCallback`.

### ❌ Bad — Inline Fetches, Insecure Typings, and Early Return Spinners

```tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

// ERROR 1: Missing TypeScript interface definitions for props and return states
export default function BadProfile(props: any) { 
  const [data, setData] = useState<any>(null); // ERROR 2: Explicit "any" usage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ERROR 3: Inline fetch call inside component is un-testable
    axios.get(`/api/users/${props.userId}`).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, [props.userId]);

  // ERROR 4: Early return spinner blocks React Suspense controls
  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      <h3>{data?.name}</h3>
    </div>
  );
}
```

Why this fails: Declares parameters as `any`, performs raw network fetches inside component layouts, manages loading state variables manually, and returns early loading text instead of delegating to Suspense boundaries.

---

## Failure Modes

- **The any Type Bypass:** Using `any` in TypeScript files, neutralizing compile-time safety checks.
- **The Early Return Spinner:** Returning custom loader elements when data fetching, causing rendering layout shifts.
- **The Inline Fetch Coupling:** Triggering network queries directly inside components, making server caching impossible.
- **The Cross-Feature Dependency Leak:** Importing private components directly from sibling directories, bypassing feature index files.
- **The Un-memoized Callback Loop:** Passing raw inline arrow functions to optimized children, forcing unnecessary redraws.
- **The Monolithic Sizing Bloat:** Importing heavy third-party assets synchronously, blocking page load times.

## Validation

Verify feature modularity, type validation declarations, and component boundaries:

1. **Verify that no file uses any typings:**
   Scan TypeScript structures for `any`:
   ```bash
   grep -rn ": any" src/ 2>/dev/null | grep -v "node_modules"
   # expected: zero matches. All type annotations declare explicit interfaces.
   ```
2. **Identify custom loading spinner checks:**
   Confirm components delegate loading triggers to Suspense boundaries:
   ```bash
   grep -rn "return <Spinner" src/ 2>/dev/null
   # expected: zero matches. Layouts utilize global or route-level loading setups.
   ```
3. **Verify presence of feature index gatekeepers:**
   Check feature public exports:
   ```bash
   find src/features/ -name "index.ts" 2>/dev/null
   # expected: Modular feature setups export APIs via index gatekeepers.
   ```
4. **Identify raw inline axios or fetch configurations:**
   Ensure components don't execute raw HTTP queries.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis kode React/TypeScript:

> "Use the skill `frontend-dev-guidelines`. Read `.agent/skills/frontend-dev-guidelines/SKILL.md` before coding. Never declare any typings or return custom loading spinners. Always enforce Suspense-first data queries, isolate logic inside features, and define strict types."

## Related

- [frontend-developer](../frontend-developer/SKILL.md) — Frontend layout integration rules.
- [typescript-expert](../typescript-expert/SKILL.md) — TypeScript configuration rules.
- [react-best-practices](../react-best-practices/SKILL.md) — Performance optimization checks.
