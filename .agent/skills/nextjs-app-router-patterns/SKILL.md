---
name: nextjs-app-router-patterns
description: Comprehensive patterns for Next.js 14+ App Router architecture, Server Components, and modern full-stack React development.
risk: safe
source: "Elite Agent Operations - Batch 3B (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Next.js App Router Patterns

> **One-liner:** Guidelines for nesting layouts, configuring parallel and intercepting routes, handling streaming suspense, and securing data mutations via Server Actions.

## When to Use

- When organizing folder structures in the `app/` directory, configuring layouts, templates, and dynamic path parameters.
- When creating parallel routing slots (`@slot`) or modal intercepting paths (`(.)`) in complex dashboards.
- When building database mutation forms integrated with server-side validations using Server Actions.

## Why This Exists

Next.js App Router relies on directory structure conventions to determine layouts, error capture ranges, loading boundaries, and URL mapping. Standardizing parallel routing prevents active slots from disappearing when a user reloads the page. Similarly, executing client form validation alongside server actions ensures data schema integrity without requiring manual HTTP fetch API wrappers.

## ALWAYS DO THIS

- **Implement route groups to organize layouts** — Group directories using parentheses (e.g. `(auth)/login` or `(dashboard)/analytics`) to separate layouts without altering public URL structures.
- **Configure default error boundaries at each segment level** — Place a client-side `error.tsx` file inside route directories to capture render-time exceptions gracefully.
- **Define explicit parallel slot fallbacks** — Create `default.tsx` files inside parallel route folders to prevent rendering blank spaces on page reloads.
- **Implement skeleton loaders with streaming Suspense** — Write a local `loading.tsx` file in data-heavy route paths to display immediate feedback during streaming.
- **Validate Server Action inputs via schemas** — Run strict validator routines (e.g. Zod `.parse()`) inside files labeled with `"use server"`.

## NEVER DO THIS

- ❌ **DO NOT** create route handlers (`route.ts` = ❌) for operations that can be handled using Server Actions. **Why fails:** Introduces additional HTTP latency and manual fetch coding overhead. **Instead:** Invoke Server Actions directly inside form triggers.
- ❌ **DO NOT** make layout pages stateful by placing `"use client"` at the root layout file. **Why fails:** Disables Server Component optimization for all child pages, increasing JS bundle size. **Instead:** Keep layouts static and wrap client contexts in distinct provider components.
- ❌ **DO NOT** forget to add `"use server"` at the very top of server actions files. **Why fails:** Next.js compiles the action code into client code, leaking private logic or failing client-side during invocation. **Instead:** Place the directive at the top of the file.
- ❌ **DO NOT** place mutable state values in `layout.tsx` files. **Why fails:** Next.js layouts persist state and do not re-render when navigating between child pages, causing UI synchronization issues. **Instead:** Manage dynamic state values inside specific leaf pages (`page.tsx`) or context systems.

---

## Parallel and Intercepting Route Flow

Nesting modal overlays on top of background dashboards without changing pages:

```
[Dashboard Route] ──> [Modal Inception (Intercepting Route)] ──> [Fallback Layout (default.tsx)]
```

---

## Examples

### ✅ Good — Parallel Routing Modal with Server Actions Verification

#### 1. Page Layout Component (`app/dashboard/layout.tsx`)
```typescript
import React from "react";

export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6">{children}</main>
      {/* Parallel route slot for modal overlays */}
      <div>{modal}</div>
    </div>
  );
}
```

#### 2. Parallel Route Fallback Component (`app/dashboard/@modal/default.tsx`)
```typescript
// Fallback component required to handle pages reload without slot mismatch
export default function DefaultModal() {
  return null;
}
```

#### 3. Intercepting Page Component (`app/dashboard/@modal/(.)preview/page.tsx`)
```typescript
"use client";

import { useRouter } from "next/navigation";

export default function InterceptedPreviewModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Quick Preview</h2>
        <p>This post is intercepted dynamically on the same page.</p>
        <button onClick={() => router.back()} className="mt-4 bg-gray-200 px-4 py-2 rounded">
          Close Modal
        </button>
      </div>
    </div>
  );
}
```

#### 4. Server Action Implementation (`app/actions/save.ts`)
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  id: z.string().uuid(),
  content: z.string().min(5),
});

export async function saveDashboardItem(prevState: any, formData: FormData) {
  // Validate data payload strictly on the server
  const validated = schema.safeParse({
    id: formData.get("id"),
    content: formData.get("content"),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  // Execute database updates...
  revalidatePath("/dashboard");
  return { success: true };
}
```

Why this passes: Establishes a clean parallel slot layout structure, implements the required `default.tsx` fallback, handles modal transitions client-side, and validates Server Action inputs on the backend.

### ❌ Bad — Stateful Root Layout, Missing Fallback, and Un-validated Actions

```typescript
// ERROR 1: Marking root layout as "use client" disables server features
"use client";

import React, { useState } from "react";

export default function BadLayout({ children }: { children: React.ReactNode }) {
  const [theme] = useState("dark"); // ERROR 2: Stateful variables inside layout

  return (
    <html lang="en">
      <body className={theme}>{children}</body>
    </html>
  );
}
```

Why this fails: Declares `"use client"` on the root layout file, manages state inside layout rendering scopes, and disables static component optimizations for all child routes.

---

## Failure Modes

- **The Parallel Route Blank Screen:** Omitting `default.tsx` from parallel slots, causing layout crashes upon browser reload.
- **The Global Client Mutation:** Putting state hooks in main layout files, loading heavy bundle sizes.
- **The Unchecked Server Action:** Forgetting schema validation inside server actions, leaving APIs vulnerable to query injection.
- **The Missing Revalidation Loop:** Modifying records in database actions without calling `revalidatePath()`, resulting in outdated UI views.
- **The Nested Route Handler Latency:** Running dynamic JSON database query endpoints via nested `route.ts` handlers instead of using server actions.

## Validation

Verify slot definitions, server boundaries, and input schemas:

1. **Verify that parallel slots have default views:**
   Check directory structures:
   ```bash
   find app/ -name "default.tsx" 2>/dev/null
   # expected: Parallel slot routes contain default.tsx files to avoid layout crashes.
   ```
2. **Scan for stateful components inside layout files:**
   Verify layouts contain no `"use client"` declarations:
   ```bash
   grep -rn '"use client"' app/layout.tsx 2>/dev/null
   # expected: zero matches. Layout files remain static Server Components.
   ```
3. **Verify presence of "use server" inside backend actions:**
   Validate server action boundary tags:
   ```bash
   grep -rn '"use server"' app/actions/ 2>/dev/null
   # expected: All backend mutation actions specify "use server" at the file header.
   ```
4. **Confirm presence of schema check validations:**
   Ensure action files include Zod validation tests.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan pola Next.js App Router:

> "Use the skill `nextjs-app-router-patterns`. Read `.agent/skills/nextjs-app-router-patterns/SKILL.md` before coding. Never write client state inside root layout files or skip input validation in Server Actions. Always provide default.tsx layouts for parallel routes, loading skeletons, and schema parsing."

## Related

- [nextjs-best-practices](../nextjs-best-practices/SKILL.md) — Routing metadata and caching strategies.
- [react-nextjs-development](../react-nextjs-development/SKILL.md) — Dynamic boundaries setup.
- [auth-implementation-patterns](../auth-implementation-patterns/SKILL.md) — Secure routing authentication checks.
