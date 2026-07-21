---
name: frontend-api-integration-patterns
description: Production-ready patterns for integrating frontend applications with backend APIs, including race condition handling, request cancellation, retry strategies, error normalization, and UI state management.
risk: safe
source: "Elite Agent Operations - Batch 3D (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Frontend API Integration Patterns

> **One-liner:** Guidelines for constructing decoupled API clients, preventing async race conditions, implementing backoff retries, and applying optimistic updates.

## When to Use

- When writing asynchronous HTTP clients (Axios, Fetch, or custom request wrappers).
- When configuring search debounce delays, request deduplication, and exponential backoff retry algorithms.
- When creating UI components that execute write mutations requiring optimistic feedback controls.

## Why This Exists

Asynchronous operations on the web are highly prone to network race conditions. If a user quickly triggers two consecutive queries (e.g. searching "A" then "B") and the first request takes longer, the UI displays outdated data when the slow request finishes last. Enforcing token cancellations (`AbortController`), normalizing error structures via custom class boundaries, and preventing retry execution on 4xx validation failures keeps frontend integrations robust.

## ALWAYS DO THIS

- **Implement request cancellation cleanups** — Pass `AbortSignal` parameters to HTTP requests inside components, triggering `abort()` on unmount or input change.
- **Normalize API exceptions using custom error structures** — Wrap responses in unified exception formats (e.g. `ApiError` extending `Error`) carrying status code properties.
- **Configure exponential backoff for transient retries** — Retry transient server errors (5xx/network drops) using randomized delay intervals (jitter) while ignoring client-side 4xx errors.
- **Implement request deduplication maps** — Store active in-flight promises in cache structures to prevent duplicate API requests from triggering simultaneously.
- **Roll back optimistic updates on mutation failures** — Cache local state configurations before executing write mutations, restoring the cached layout if network errors occur.

## NEVER DO THIS

- ❌ **DO NOT** trigger retry loops when receiving 4xx HTTP responses. **Why fails:** 4xx errors indicate client-side validation failures (like bad inputs or unauthorized access) that will always fail under the same conditions, wasting resources. **Instead:** Reject immediately and display validation messages.
- ❌ **DO NOT** make raw, un-wrapped fetch calls directly inside rendering scopes. **Why fails:** Bypasses central headers, authorization tokens, and unified error handling layers. **Instead:** Proxy queries through a unified API client module.
- ❌ **DO NOT** manage async triggers inside components without defining distinct loading, error, and success states. **Why fails:** Leads to silent failures or layout freezes, degrading user experience. **Instead:** Enforce explicit UI state mappings.
- ❌ **DO NOT** update component states on unmounted scopes. **Why fails:** Triggers React memory warnings and performance degradation. **Instead:** Clean up effect subscriptions or check cancellation flags before setting state.

---

## Asynchronous Data Mutation & Error Isolation Pipeline

Normalizing exceptions, managing retries, and shielding UI from race overrides:

```
[Request Trigger] ──> [Deduplication map] ──> [Backoff Retry (5xx only)] ──> [Abort Signal Guard]
```

---

## Examples

### ✅ Good — Decoupled Client, Exponential Backoff, and Optimistic UI Rollbacks

#### 1. Unified API Client Helper (`lib/apiClient.ts`)
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload: any = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = { "Content-Type": "application/json" };
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      // Ignore body parsing failures
    }
    throw new ApiError(payload?.message || "Request failed", response.status, payload);
  }

  if (response.status === 204) return null as T;
  return response.json();
}
```

#### 2. Exponential Backoff Logic with Jitter (`lib/retry.ts`)
```typescript
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 200
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isAbort = error.name === "AbortError";
    const isHttpError = error instanceof ApiError;
    // Only retry transient 5xx errors or network drops; abort on 4xx client errors
    const isRetryable = !isAbort && (!isHttpError || error.status >= 500);

    if (retries <= 0 || !isRetryable) {
      throw error;
    }

    // 1. Calculate exponential delay with randomized jitter offset
    const nextDelay = delay * 2 + Math.random() * 50;
    await sleep(nextDelay);

    return fetchWithBackoff(fn, retries - 1, nextDelay);
  }
}
```

#### 3. Stateful Hook with Optimistic Updates (`hooks/useUpdateItem.ts`)
```tsx
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";

interface Item {
  id: string;
  name: string;
}

export function useUpdateItem(initialItems: Item[]) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [error, setError] = useState<string | null>(null);

  const deleteItemOptimistically = async (itemId: string) => {
    // 1. Cache current state configuration for recovery fallback
    const backupItems = [...items];
    setError(null);

    // 2. Optimistically update local view variables instantly
    setItems((current) => current.filter((item) => item.id !== itemId));

    try {
      await apiClient(`/api/items/${itemId}`, { method: "DELETE" });
    } catch (err: any) {
      // 3. Roll back view layout to cached states on mutation failures
      setItems(backupItems);
      setError(err.message || "Failed to delete item.");
    }
  };

  return { items, error, deleteItemOptimistically };
}
```

Why this passes: Separates API client logic from component layout scopes, handles status code classifications, defines exponential backoff logic mapping only to transient 5xx codes, and runs optimistic rollbacks safely.

### ❌ Bad — Infinite Retries on 4xx Validation Errors and Missing Aborts

```tsx
// ERROR 1: Infinite retry loop does not isolate 4xx validation errors
export async function badFetch(id: string) {
  try {
    return await fetch(`/api/items/${id}`).then(res => res.json());
  } catch (err) {
    // ERROR 2: Infinite loop retry block will trigger database overload on 404/401 errors
    console.log("Retrying request...");
    return badFetch(id); 
  }
}

export function BadComponent() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // ERROR 3: Direct fetch trigger lacking AbortController or cancel flag
    badFetch("123").then((res) => setData(res)); 
    // Triggers memory leak warnings if component unmounts before fetch resolves
  }, []);

  return <div>{data}</div>;
}
```

Why this fails: Triggers infinite retry loops without check parameters, misses `AbortController` cancellation methods, handles no request error boundaries, and imports raw API clients directly inside components.

---

## Failure Modes

- **The Validation Loop Lock:** Retrying requests on 4xx validation errors, overloading the database with invalid queries.
- **The Stale Override Collision:** Bypassing request cancellation controls, letting older responses overwrite newer views.
- **The Unchecked unmount Leak:** Modifying state parameters after elements unmount, triggering console warnings.
- **The Optimistic Data Loss:** Wiping local UI states upon action failures without restoring cached layouts.
- **The Synchronous Backoff Overload:** Retrying connection drops simultaneously across multiple components without random jitter delays.

## Validation

Verify Client structures, retry exclusions, and cancellation hooks:

1. **Verify that retries ignore 4xx status codes:**
   Check retry definitions:
   ```bash
   grep -rn "status" src/ | grep ">=" 2>/dev/null
   # expected: Retrying parameters check that status code is >= 500.
   ```
2. **Scan for AbortController configurations inside pages:**
   Ensure components clean up async queries on unmount:
   ```bash
   grep -rn "AbortController" src/ | grep "abort()" 2>/dev/null
   # expected: Components executing asynchronous actions call abort() on cleanups.
   ```
3. **Verify presence of optimistic rollback variables:**
   Verify backup actions:
   ```bash
   grep -rn "const" src/ | grep -i "backup\|previous"
   # expected: Optimistic operations cache current states before mutations.
   ```
4. **Identify raw HTTP queries:**
   Ensure components use the unified apiClient helper instead of raw fetches.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan integrasi API:

> "Use the skill `frontend-api-integration-patterns`. Read `.agent/skills/frontend-api-integration-patterns/SKILL.md` before coding. Never retry 4xx errors or trigger fetches without abort cleanup methods. Always enforce custom exceptions normalization, exponential backoff, and optimistic rollbacks."

## Related

- [frontend-dev-guidelines](../frontend-dev-guidelines/SKILL.md) — Colocation of API files.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — API contract alignments.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Empirical validations steps.
