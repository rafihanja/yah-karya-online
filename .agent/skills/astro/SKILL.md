---
name: astro
description: Build content-focused websites with Astro — zero JS by default, islands architecture, multi-framework components, and Markdown/MDX support.
risk: safe
source: "Elite Agent Operations - Batch 3G (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Astro Content Architecture

> **One-liner:** Guidelines for constructing zero-JS static layouts, configuring islands hydration boundaries, and defining type-safe content schemas.

## When to Use

- When building content-dense portals (portfolios, documentation index files, e-commerce catalog pages).
- When configuring Islands hydration triggers (`client:load`, `client:visible`, `client:media`) to selectively render framework components.
- When organizing type-safe schema validation models within `src/content/config.ts` content files.

## Why This Exists

Traditional Single Page Application (SPA) frameworks compile all layout code into bloated JavaScript bundles, causing slow page loads on slower networks. Astro resolves this by compile-time rendering components to static HTML with zero client-side JavaScript by default. If developers over-apply immediate load directives (`client:load`) or skip content schema validation constraints, the performance and structure advantages of the framework are lost.

## ALWAYS DO THIS

- **Isolate client hydration to visible viewport sections** — Leverage lazy hydration tags (e.g. `client:visible`) for components situated below the fold to avoid loading javascript prematurely.
- **Enforce type-safe schemas for content collection folders** — Define structured schema constraints using Zod properties inside `src/content/config.ts` validation configs.
- **Define explicit Props interfaces in Astro components** — Declare type contracts in the server script frontmatter block so that Astro type-checks template arguments.
- **Prefix public variables with PUBLIC_ identifier keys** — Restrict runtime client-accessible environment keys using public namespace prefixes while keeping private keys server-only.
- **Deallocate dynamic route parameters on static builds** — Export required static parameters maps (`getStaticPaths`) for all dynamic paths to prevent build-time compilation failures.

## NEVER DO THIS

- ❌ **DO NOT** use immediate load directives (`client:load` = ❌) on components that do not require immediate client-side user interactivity. **Why fails:** Bloats the initial page bundle, increasing Total Blocking Time (TBT). **Instead:** Use static `.astro` components, or hydrate lazily using `client:visible` or `client:idle`.
- ❌ **DO NOT** embed database write operations or write-access tokens directly inside static page templates frontmatter. **Why fails:** Static builds run compile-time checks once, rendering static values into HTML bundles, leaking secret keys or publishing stale records. **Instead:** Proxy mutations through dedicated SSR route handler paths.
- ❌ **DO NOT** mix viewport media query controls with framework-level query modifiers (e.g., using pure CSS rules instead of `client:media` = ❌). **Why fails:** Loads component assets on mobile devices even if hidden. **Instead:** Conditionally fetch using the native client-directive (e.g. `client:media="(max-width: 768px)"`).
- ❌ **DO NOT** write raw unescaped strings directly to the DOM using template injections (`set:html` = ❌). **Why fails:** Bypasses built-in cross-site scripting (XSS) protections. **Instead:** Validate and sanitize HTML inputs using dedicated sanitization libraries.

---

## Astro Islands Architecture & Build Pipeline

Rendering static markup and selectively hydrating dynamic component islands:

```
[.astro Page Layout] ──> [Static HTML compile] ──> [client:visible Island] ──> [Lazy Hydration trigger]
```

---

## Examples

### ✅ Good — Scoped Island Directives, Schema Verification, and Type-Safe Routes

#### 1. Content Collection Configuration (`src/content/config.ts`)
```typescript
import { z, defineCollection } from "astro:content";

// 1. Enforce type-safe data schema models via Zod
const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    description: z.string().max(160),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

#### 2. Dynamic Route with Props Verification (`src/pages/blog/[slug].astro`)
```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import SearchWidget from "@/components/SearchWidget.tsx";

// 1. Mandatory export of getStaticPaths in static generation mode
export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");
  return blogEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

interface Props {
  entry: any; // Astro infers template arguments type-safety from Props
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BaseLayout title={entry.data.title} description={entry.data.description}>
  <article class="prose mx-auto">
    <h1>{entry.data.title}</h1>
    <Content />
  </article>

  {/* 2. Hydrate search widget island lazily only when scrolled into view */}
  <div class="mt-12 border-t pt-8">
    <SearchWidget client:visible />
  </div>
</BaseLayout>
```

Why this passes: Configures type-safe schemas, implements static paths resolvers (`getStaticPaths`), defines explicit `Props` interface targets, and sets the interactive React component (`SearchWidget`) to hydrate lazily using `client:visible`.

### ❌ Bad — Global Immediate Hydration, Hardcoded Secrets, and Missing Schema Guards

```astro
---
// src/pages/bad-blog/[slug].astro
// ERROR 1: Hardcoding sensitive database API access key in static page context
const privateDbKey = "sk_prod_123456789"; 

import BadSearch from "../../components/BadSearch.tsx";
---

<html>
  <body>
    <!-- ERROR 2: client:load forces immediate Javascript downloads, breaking the static benefit -->
    <BadSearch client:load />

    {/* ERROR 3: Accessing dynamic parameters directly without getStaticPaths definition */}
    <div>Post Content: {Astro.params.slug}</div> 
  </body>
</html>
```

Why this fails: Hardcodes secret database API keys inside a static page frontmatter block, enforces immediate load directives (`client:load`) on widgets that could be hydrated lazily, and queries parameter scopes directly without defining static resolvers (`getStaticPaths`).

---

## Failure Modes

- **The client:load Abuse:** Setting immediate loading directives on all components, erasing Astro's performance benefits.
- **The Static Secret Leak:** Storing private access keys inside static page compilers, rendering keys into static HTML files.
- **The Media Load Overhead:** Hiding a framework component using CSS media queries while loading it on unneeded device viewports.
- **The getStaticPaths Omission:** Triggering compilation failures by omitting static path resolver exports on dynamic pages.
- **The Raw Template Injection XSS:** Injecting unverified html inputs using the `set:html` attribute, creating security vulnerabilities.

## Validation

Verify configuration boundaries, route declarations, and hydration directives:

1. **Verify that dynamic routes declare static path resolvers:**
   Check dynamic page setups:
   ```bash
   grep -rn "export async function getStaticPaths" src/pages/ 2>/dev/null
   # expected: Dynamic pages under static generation mode export static path paths.
   ```
2. **Scan for immediate client loading directives usage:**
   Identify candidate files for lazy hydration tuning:
   ```bash
   grep -rn "client:load" src/ 2>/dev/null
   # expected: Immediate load calls are justified. Above-the-fold elements hydrate lazily.
   ```
3. **Verify Zod schema definitions presence in content files:**
   Ensure content folders implement Zod configurations:
   ```bash
   grep -rn "defineCollection" src/content/config.ts 2>/dev/null
   # expected: Content models enforce schema constraints via Zod objects.
   ```
4. **Identify layout-level database calls:**
   Ensure templates avoid loading direct database writes.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Astro:

> "Use the skill `astro`. Read `.agent/skills/astro/SKILL.md` before coding. Never write client:load directives on below-the-fold content or hardcode secrets in templates. Always configure content collection schemas, getStaticPaths hooks, and client:visible triggers."

## Related

- [tailwind-patterns](../tailwind-patterns/SKILL.md) — Class styling configurations.
- [frontend-dev-guidelines](../frontend-dev-guidelines/SKILL.md) — API layer encapsulation.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Manual page verification.
