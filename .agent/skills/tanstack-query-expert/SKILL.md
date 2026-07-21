---
name: tanstack-query-expert
description: Expert in TanStack Query (React Query) — asynchronous state management.
risk: medium (cache invalidation conflicts, optimistic rollback bugs, infinite fetch loops)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# TanStack Query Expert

> **One-liner:** Guidelines for constructing typed query key factories, custom API mutation hooks, optimistic UI rollbacks, and Server hydration boundaries in Next.js.

## When to Use

- When building data-fetching hooks in React/Next.js client-side views.
- When configuring global API caching rules, refetch boundaries, and background syncing logic.
- When performing mutations (POST/PUT/DELETE) that require selective cache invalidation.

## Why This Exists

React does not provide built-in server caching or connection status tracking, leading developers to write fragile `useEffect` hooks to fetch data. By default, TanStack Query configures `staleTime: 0`, meaning every component remount triggers a background refetch request. Without strict guidelines, developers misspell array query keys across files, trigger infinite network loops on query errors, and duplicate query values in local component states, breaking cache consistency.

## ALWAYS DO THIS

- **Construct typed Query Key Factories** — Group all keys in a central factory object (e.g., `userKeys.detail(id)`) to prevent spelling errors.
- **Abstract query hooks** — Encapsulate query logic inside custom React hooks (e.g. `useUserData`), keeping view components clean of fetching logic.
- **Configure non-zero staleTime** — Declare default stale values (`staleTime: 1000 * 60`) on the root client to prevent redundant requests on every component remount.
- **Roll back optimistic updates on mutation failures** — Snapshot current cache states in `onMutate` and restore them in `onError` if a network request fails.
- **Wrap pre-fetched queries in HydrationBoundaries** — Dehydrate the cache in Next.js Server Components and wrap client child nodes inside `<HydrationBoundary state={dehydrate(queryClient)}>` tags.

## NEVER DO THIS

- ❌ **DO NOT** sync query data into local React states via `useEffect` hooks (e.g. `useEffect(() => setState(data), [data])`). **Why fails:** Duplicates memory states, breaks cache consistency, and bypasses TanStack Query's automated cache updates. **Instead:** Use query variables directly or derive them in render cycles.
- ❌ **DO NOT** use dynamic values in `queryKey` arrays without including them in dependency parameters. **Why fails:** Prevents the query from refetching when the filtering variable changes. **Instead:** Add all dynamic variables to the query key array.
- ❌ **DO NOT** omit error handling checks on fetch functions. **Why fails:** If the fetch promise fails to throw a standard error, TanStack Query treats it as a success, caching empty/broken values. **Instead:** Throw explicit error objects on non-ok HTTP responses.

---

## Technical Cache Lifecycle
Coordinate these settings:
- **`staleTime`:** The duration (in ms) before cached data is considered old. Mounts of stale data trigger background refetches.
- **`gcTime` (formerly `cacheTime`):** The duration (in ms) before unused cache entries are removed from memory.

---

## Examples

### ✅ Good — Query Keys Factory, Optimistic Update, and Custom Hooks

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// 1. Establish central query keys factory
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const
};

// 2. Encapsulate queries inside custom hooks
export function useTodo(id: string) {
  return useQuery<Todo>({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/todos/${id}`);
      if (!res.ok) throw new Error("Failed to fetch todo details");
      return res.json();
    },
    staleTime: 5 * 60 * 1000 // fresh for 5 minutes
  });
}

// 3. Implement robust optimistic mutation updates
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Todo) => {
      const res = await fetch(`/api/todos/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onMutate: async (updatedTodo) => {
      const queryKey = todoKeys.detail(updatedTodo.id);
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot state
      const previousValue = queryClient.getQueryData<Todo>(queryKey);
      
      // Optimistically update
      queryClient.setQueryData<Todo>(queryKey, updatedTodo);
      
      return { previousValue };
    },
    onError: (err, updatedTodo, context) => {
      // Rollback on error
      if (context?.previousValue) {
        queryClient.setQueryData(todoKeys.detail(updatedTodo.id), context.previousValue);
      }
    },
    onSettled: (data, err, variables) => {
      // Invalidate cache to sync with database
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) });
    }
  });
}
```

Why this passes: Encapsulates query logic inside hooks, establishes query key factories, cancels active queries before optimistic updates, and rolls back on failure.

### ❌ Bad — Syncing Cache to Local State and Missing Key Dependencies

```tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function BadTodoList({ filter }) {
  const [localTodos, setLocalTodos] = useState<any[]>([]);

  // ERROR 1: Omission of filter parameter in queryKey array (prevents refetch on filter change)
  const { data, error } = useQuery({
    queryKey: ["bad-todos"], 
    queryFn: async () => {
      const res = await fetch("/api/todos");
      // ERROR 2: Missing error throw check on non-ok HTTP responses
      return res.json();
    }
  });

  // ERROR 3: Syncing cache data to local state inside useEffect (creates synchronization bugs)
  useEffect(() => {
    if (data) {
      setLocalTodos(data);
    }
  }, [data]);

  return (
    <ul>
      {localTodos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Why this fails: Omits query key filter parameters, duplicates cache data inside component state, and lacks error checks.

---

## Failure Modes

- **Infinite Refresh Storms:** Creating an unstable fetch function that does not throw clean errors inside rendering loops triggers continuous automatic retries.
- **Cache Persistence Leak:** Setting `gcTime` values below `staleTime` deletes cached items from memory while they are still considered fresh.

## Validation

Cara memverifikasi kepatuhan penggunaan `tanstack-query-expert`:

1. **Verify custom query hooks:**
   Ensure components don't call useQuery inline directly:
   ```bash
   grep -rn "useQuery(" src/
   # Verify that useQuery calls are abstracted inside hooks files
   ```
2. **Scan for query state synchronization:**
   Ensure `useEffect` is not used to copy query data:
   ```bash
   grep -rn "useEffect(" src/ | grep "setData"
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengintegrasikan TanStack Query:

> "Use the skill `tanstack-query-expert`. Read `.agent/skills/tanstack-query-expert/SKILL.md` before coding. Never sync query responses to local component states. Always establish Query Key Factories, configure non-zero staleTime values, and use custom hooks."

## Related

- [react-best-practices](../react-best-practices/SKILL.md) — Waterfall prevention.
- [react-state-management](../react-state-management/SKILL.md) — UI state separation.
