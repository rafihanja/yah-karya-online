---
name: react-nextjs-development
description: React and Next.js 14+ application development with App Router, Server Components, TypeScript, Tailwind CSS, and modern frontend patterns.
risk: safe
source: "Elite Agent Operations - Batch 3B (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React and Next.js Development Workflow

> **One-liner:** Structured guidelines for building React and Next.js 14+ projects, separating Server vs. Client boundaries, and enforcing proper static rendering behaviors.

## When to Use

- When scaffolding new React applications or Next.js projects with App Router configurations.
- When organizing client-side state managers (Zustand, React Query) or forms integrations (React Hook Form, Zod).
- When resolving hydration mismatches, client/server routing barriers, or dynamic asset preloads.

## Why This Exists

Next.js App Router changes how developers handle components, data fetching, and layouts. The default component is a React Server Component (RSC), which executes only on the server. If developers try to inject browser event listeners or React state hooks (like `useState`) directly into server components, the compiler throws error messages. Enforcing clean boundary setups, handling asynchronous route parameters safely, and configuring proper client-side hydrate/defer rules keeps React applications fast and clean.

## ALWAYS DO THIS

- **Verify server vs client component boundaries** — Mark all files containing event listeners, contexts, or state hooks with the `"use client"` directive at the very top.
- **Configure dynamic imports with SSR disabled for browser-only assets** — Load custom widgets or libraries relying on `window` APIs using dynamic imports (e.g. `dynamic(() => import(...), { ssr: false })`).
- **Enforce TypeScript types on route parameters** — Define structured type boundaries for dynamic slug parameters (e.g. `params: Promise<{ slug: string }>` in Next.js 15).
- **Group layout hierarchies using nested page setups** — Keep routing clean by separating shared navigation structures (`layout.tsx`) from page-specific views (`page.tsx`).
- **Define explicit metadata parameters in server pages** — Export structured static metadata parameters (e.g. `export const metadata: Metadata = { ... }`) to optimize crawler performance.

## NEVER DO THIS

- ❌ **DO NOT** use React lifecycle hooks (`useState`, `useEffect`) in default server component files. **Why fails:** RSCs do not execute in the browser; importing state hooks triggers compile-time parser exceptions. **Instead:** Add `"use client"` to the top of the file or split stateful logic into dedicated client sub-components.
- ❌ **DO NOT** read asynchronous search parameter structures directly in page render loops. **Why fails:** Next.js 15 dynamic route parameter resolution is asynchronous; direct synchronous reads trigger hydration mismatch mismatches. **Instead:** Await parameter resolutions before querying data sources.
- ❌ **DO NOT** hardcode configuration tokens or server-side keys in client code files. **Why fails:** Exposes backend keys (e.g. database credentials) to user inspection. **Instead:** Read public keys from `process.env.NEXT_PUBLIC_*` or keep secrets inside server actions.
- ❌ **DO NOT** nested import `"use client"` files directly inside server layout routines without separating layouts from state managers. **Why fails:** Turns the entire page hierarchy into a heavy client-side bundle, neutralizing server component benefits. **Instead:** Wrap client contexts inside dedicated wrapper files.

---

## App Router Boundary Pipeline

Separating server structures from stateful client modules keeps bundles lightweight:

```
[layout.tsx (Server)] ──> [page.tsx (Server Action)] ──> [Context Provider (Client)] ──> [Leaf Components]
```

---

## Examples

### ✅ Good — Stateful Forms Nested Safely Inside Server Pages

#### 1. Server-Side Page Component (`app/contact/page.tsx`)
```typescript
import { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Premium App",
  description: "Get in touch with our team safely.",
};

export default async function ContactPage() {
  // Server-side database check or parameter loads can occur here
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
      {/* Client-side form nested safely within a server page */}
      <ContactForm defaultType="General Inquiry" />
    </main>
  );
}
```

#### 2. Client-Side Leaf Component (`components/ContactForm.tsx`)
```typescript
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm({ defaultType }: { defaultType: string }) {
  const [status, setStatus] = useState<string>("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("Submitting...");
    // Trigger submit route handler
    setStatus("Message sent successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("email")} placeholder="Email" className="border p-2 w-full" />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      <textarea {...register("message")} placeholder="Message" className="border p-2 w-full" />
      {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit ({defaultType})
      </button>
    </form>
  );
}
```

Why this passes: Separates server-side metadata and page structure from the client-side stateful contact form, uses `"use client"` appropriately in the form file, and uses Zod for validation.

### ❌ Bad — Stateful Imports in Server Component and Static Keys Leakage

```typescript
// ERROR 1: Missing "use client" when using state hook
import React, { useState } from "react"; 

export default function BadContactPage() {
  const [email, setEmail] = useState(""); // ERROR 2: useState directly in RSC fails compile
  
  const handleConnect = () => {
    // ERROR 3: Accessing private backend token in client context
    const serverKey = process.env.DATABASE_PRIVATE_KEY; 
    console.log("Connecting database via key:", serverKey);
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleConnect}>Submit</button>
    </div>
  );
}
```

Why this fails: Omits `"use client"` despite importing and using `useState`, accesses private backend variables in rendering code, and executes dynamic event handlers directly inside a server component.

---

## Failure Modes

- **The Hydration Mismatch:** Rendering browser-specific dynamics (e.g. `Date.now()`) on the server without checking hydration state.
- **The Event Handler Crash:** Placing dynamic click parameters (`onClick`) inside files lacking `"use client"` directives.
- **The Monolithic Client Conversion:** Marking root page layouts (`layout.tsx`) as `"use client"`, converting the entire sub-tree into a heavy client bundle.
- **The Synchronous Params Exception:** Synchronously parsing page parameters (e.g. `params.slug`) in Next.js 15 before resolution.
- **The Environment Secret Leak:** Exposing private database passwords or keys by naming them in client-side configurations.
- **The window is not defined Error:** Loading libraries that rely on the browser `window` API inside server-side render paths.

## Validation

Verify compilation, routing boundaries, and client/server boundary markers:

1. **Verify that files with state hooks declare use client:**
   Check code structures:
   ```bash
   grep -rn "useState(" app/ | grep -v '"use client"' 2>/dev/null
   # expected: zero matches. Stateful files must include the client boundary marker.
   ```
2. **Identify leaks of private environment keys:**
   Check client configurations:
   ```bash
   grep -rn "process.env\." app/ | grep -v "NEXT_PUBLIC_"
   # expected: Client-facing configurations only reference NEXT_PUBLIC_ variables.
   ```
3. **Verify correct implementation of dynamic imports:**
   Verify that browser-only dependencies are dynamically loaded:
   ```bash
   grep -rn "ssr: false" app/ 2>/dev/null
   # expected: Libraries calling window APIs use dynamic loads with ssr disabled.
   ```
4. **Confirm TypeScript route validation:**
   Ensure dynamic routing files map parameter variables to async definitions.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan koding React/Next.js:

> "Use the skill `react-nextjs-development`. Read `.agent/skills/react-nextjs-development/SKILL.md` before coding. Never write state hooks in server components or access server-side secrets in client code. Always use 'use client' boundaries for event-based files and load browser-only dependencies dynamically."

## Related

- [nextjs-best-practices](../nextjs-best-practices/SKILL.md) — Next.js optimization and caching behaviors.
- [nextjs-app-router-patterns](../nextjs-app-router-patterns/SKILL.md) — App Router data and dynamic layout rules.
- [typescript-expert](../typescript-expert/SKILL.md) — TypeScript type definitions check.
