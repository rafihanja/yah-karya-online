---
name: nextjs-best-practices
description: Next.js App Router principles. Server Components, data fetching, routing patterns.
risk: safe
source: "Elite Agent Operations - Batch 3B (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Next.js Best Practices

> **One-liner:** Guidelines for optimizing data fetching, configuring routing hierarchies, and managing caching layers inside Next.js App Router projects.

## When to Use

- When structuring App Router directories, configuring root or nested layouts (`layout.tsx`), and separating dynamic leaf pages (`page.tsx`).
- When setting up static data fetching, Incremental Static Regeneration (ISR), or dynamic request-time queries.
- When configuring search crawler metadata, image compressions, and resource prefetching.

## Why This Exists

Next.js provides several automatic caching layers (Request Memoization, Data Cache, Full Route Cache, Router Cache). Misconfiguring these components leads to stale views, excessive database costs, or security leaks where private tokens are exposed. Enforcing default server rendering, optimizing image assets via next/image wrappers, and using correct route handlers prevents common layout and rendering failures.

## ALWAYS DO THIS

- **Use Server Components as the default rendering choice** — Keep components as Server Components unless browser interactivity (event listeners, state hooks) is explicitly required.
- **Implement error boundaries and skeleton loaders** — Create dedicated `loading.tsx` and `error.tsx` layouts in routing directories to handle network loading and exceptions.
- **Configure image parameters with priority attributes above the fold** — Add the `priority` flag to all `next/image` components rendering in the initial viewport (LCP assets).
- **Configure time-based revalidation parameters** — Set explicit revalidation limits (e.g. `next: { revalidate: 60 }`) for dynamic but cache-friendly endpoints.
- **Utilize search metadata generation** — Define dynamic headers using `generateMetadata` exports to ensure distinct title and description tags across dynamic routes.

## NEVER DO THIS

- ❌ **DO NOT** use deprecated Pages Router data helpers (`getServerSideProps` or `getStaticProps` = ❌) in App Router pages. **Why fails:** The App Router runtime does not support these APIs, triggering compile errors. **Instead:** Perform data fetching directly inside server components using async fetch utilities.
- ❌ **DO NOT** fetch common data payloads inside root `layout.tsx` files. **Why fails:** Layout requests block parallel rendering of child pages, causing significant TTFB (Time to First Byte) latency. **Instead:** Fetch specific datasets directly in the pages or leaf components that consume them.
- ❌ **DO NOT** use standard HTML link tags (`<a>` = ❌) for internal route transitions. **Why fails:** Triggers a full browser reload, discarding client-state and losing page transition benefits. **Instead:** Wrap navigations using Next.js `<Link>` components.
- ❌ **DO NOT** call server-side environment variables directly inside client files. **Why fails:** Next.js filters server variables to protect security, causing them to resolve as undefined on the client. **Instead:** Prefix public keys with `NEXT_PUBLIC_` or read them via server actions.

---

## Data Caching Lifecycle

Managing requests across multiple caching layers in Next.js:

```
[Fetch Trigger] ──> [Request Memoization (Deduplication)] ──> [Data Cache (revalidatePath)] ──> [Render Output]
```

---

## Examples

### ✅ Good — Async Dynamic Metadata and Server Fetching with Revalidation

#### 1. Dynamic Page Component (`app/posts/[id]/page.tsx`)
```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Post {
  id: string;
  title: string;
  body: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. Resolve dynamic metadata asynchronously
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await fetchPost(resolvedParams.id);
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Premium Blog`,
    description: post.body.substring(0, 150),
  };
}

// Helper fetch incorporating explicit revalidation interval parameters
async function fetchPost(id: string): Promise<Post | null> {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await fetchPost(resolvedParams.id);

  if (!post) {
    notFound(); // Triggers not-found.tsx boundary layout
  }

  return (
    <article className="prose lg:prose-xl mx-auto p-4">
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

Why this passes: Resolves async dynamic parameters, sets explicit revalidation caching limits, uses semantic HTML article tags, and triggers standard Next.js `notFound()` routes gracefully.

### ❌ Bad — Pages Router Methods, Layout Blockers, and Standard Links

```typescript
// ERROR 1: Using Pages Router functions inside App Router page
export async function getServerSideProps() {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();
  return { props: { data } };
}

export default function BadPage({ data }: { data: any }) {
  return (
    <div>
      {/* ERROR 2: Using standard HTML anchor tag triggers full page reloads */}
      <a href="/dashboard">Go to Dashboard</a> 
      <h1>{data?.title}</h1>
    </div>
  );
}
```

Why this fails: Declares Pages Router `getServerSideProps` which next compiler rejects inside App Router, and uses a standard anchor tag instead of next/link components.

---

## Failure Modes

- **The Layout Fetch Blockage:** Performing primary queries inside parent layouts, causing long client-side wait times.
- **The Anchor Reload Trap:** Using standard `<a>` tags for internal pages, wiping out client state and causing full reload overheads.
- **The Stale Page Lockout:** Omitting revalidation flags or paths, locking dynamic pages into outdated static states.
- **The Undefined secret Key:** Importing server environment variables in client files, rendering keys as empty strings.
- **The Layout Hydration Error:** Nesting mismatched HTML syntax inside parent layout files (e.g. putting divs outside the body).
- **The Pages Router API Collision:** Importing legacy runtime modules into App Router files, causing compiler errors.

## Validation

Verify metadata definitions, routing wrappers, and caching limits:

1. **Check for anchor tags mapping to internal routes:**
   Find standard anchor links in pages:
   ```bash
   grep -rn "<a " app/ 2>/dev/null
   # expected: Verify that links to local routes are replaced with <Link href="..."> components.
   ```
2. **Identify dynamic metadata declarations:**
   Check dynamic page configurations:
   ```bash
   grep -rn "generateMetadata" app/ 2>/dev/null
   # expected: Dynamic routing pages export dynamic metadata configurations.
   ```
3. **Verify caching configuration rules:**
   Search for cache-invalidation tags or revalidate limits:
   ```bash
   grep -rn "revalidate:" app/ 2>/dev/null
   # expected: Dynamic routes include explicit revalidation parameters.
   ```
4. **Identify layout-level database calls:**
   Ensure layout files don't run excessive queries.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan konfigurasi Next.js:

> "Use the skill `nextjs-best-practices`. Read `.agent/skills/nextjs-best-practices/SKILL.md` before coding. Never write getServerSideProps inside App Router or use standard anchor tags for internal page navigations. Always utilize next/link, set revalidation rules, and dynamic meta layouts."

## Related

- [react-nextjs-development](../react-nextjs-development/SKILL.md) - React framework setups.
- [nextjs-app-router-patterns](../nextjs-app-router-patterns/SKILL.md) - Layout and structural component divisions.
- [seo-fundamentals](../seo-fundamentals/SKILL.md) - Metadata configuration controls.
