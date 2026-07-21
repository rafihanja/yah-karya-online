---
name: seo-fundamentals
description: Generative Engine Optimization for AI search engines (ChatGPT, Claude, Perplexity) and crawlers.
risk: medium (indexation blocks, ranking drops, rendering failures)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# SEO Fundamentals

> **One-liner:** Guidelines for establishing semantic HTML5 layouts, optimizing page load metrics, configuring title/description tags, and ensuring crawlability.

## When to Use

- When building blogs, content-heavy websites, or marketing landing pages.
- When configuring document head parameters (meta tags, viewport settings).
- When audit-checking web pages for semantic element layouts and image alt tags.

## Why This Exists

Beautiful web designs are useless if search engine crawlers or AI engines (like ChatGPT or Claude) cannot crawl or index the content. If a developer uses a pure JavaScript Single-Page Application (SPA) layout without Server-Side Rendering (SSR) for public articles, search engine bots see an empty page because they do not execute JS immediately. Similarly, using multiple `<h1>` elements confuses semantic search hierarchies. Enforcing SSR outputs, semantic headers, and descriptive markup wins search indexing queries.

## ALWAYS DO THIS

- **Ensure Server-Side Rendering (SSR) for public content** — Deploy content-rich sites using SSR or static site generation (SSG) frameworks (e.g. Next.js, Astro) to present readable HTML outputs.
- **Limit pages to a single h1 header** — Enforce a single semantic `<h1>` tag per page, representing the primary document title.
- **Provide alt properties for images** — Add descriptive `alt` tags to all `<img>` elements to support screen readers and image indexing bots.
- **Configure unique meta titles and descriptions** — Set individual, keyword-relevant meta metadata for every route page.
- **Set canonical URL links** — Declare a `<link rel="canonical" href="https://example.com/page">` inside headers to prevent duplicate path indexing conflicts.

## NEVER DO THIS

- ❌ **DO NOT** deploy public blogs or catalog sites using client-side rendered Single-Page Application (SPA) configurations without SSR/SSG. **Why fails:** Crawlers often scrape initial HTML outputs without executing JavaScript, leading to empty index pages. **Instead:** Build public paths using frameworks like Next.js or Astro.
- ❌ **DO NOT** use multiple `<h1>` tags on a single page view. **Why fails:** Confuses search engine indexing bots regarding the primary topic hierarchy of the document. **Instead:** Nest subheadings inside `<h2>` to `<h6>` tags.
- ❌ **DO NOT** leave image `alt` attributes empty or omit them entirely. **Why fails:** Lowers accessibility compliance scores and misses search traffic targets. **Instead:** Add descriptions, or set `alt=""` for purely decorative graphics.
- ❌ **DO NOT** use duplicate meta titles or descriptions across separate URL paths. **Why fails:** Causes keyword cannibalization where search engines ignore pages because they seem identical. **Instead:** Generate unique metadata based on page inputs.

---

## Semantic SEO Page Flow

Structuring code with HTML5 semantic containers helps search engines parse layout context:

```
[HTML Document] ──> [<header> / <nav>] ──> [<main>] ──> [<h1> Article Headline] ──> [<footer>]
```

---

## Examples

### ✅ Good — HTML5 Semantics, Canonical Tags, and Image Alt Attributes

#### 1. Next.js Semantic Layout (`app/posts/[slug]/page.tsx`)
```typescript
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

// 1. Generate unique, optimized metadata per route page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: `${post.title} | Developer Guide`,
    description: post.summary,
    alternates: {
      canonical: `https://mysite.com/posts/${params.slug}`
    }
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);

  // 2. Use semantic HTML5 layout containers
  return (
    <article className="max-w-2xl mx-auto py-8">
      <header>
        {/* 3. Enforce a single h1 headline */}
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <p className="text-gray-500">Published on {post.date}</p>
      </header>
      
      <main className="mt-6 prose">
        <p>{post.content}</p>
        
        {/* 4. Include descriptive alt attributes on images */}
        <img 
          src={post.bannerUrl} 
          alt="Visual representation of database schema design diagram" 
          className="rounded-lg"
        />
      </main>
      
      <footer className="mt-8 border-t pt-4">
        <p>Written by {post.author}</p>
      </footer>
    </article>
  );
}
```

Why this passes: Configures unique metadata, generates canonical URL headers, uses semantic elements, limits headings to a single `<h1>`, and provides description tags for image components.

### ❌ Bad — Div Soup Layouts, Multiple H1 Tags, and Unrendered Client-Only code

```typescript
// ERROR 1: Client-Side only rendering on public articles results in empty HTML boot files
'use client'; 

import { useState, useEffect } from "react";

export default function BadBlogPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/posts/my-slug").then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  // ERROR 2: Nested div soup lacks semantic boundaries
  return (
    <div className="container">
      {/* ERROR 3: Multiple H1 headers on a single page breaks outline hierachy */}
      <h1 className="site-title">Main Portal Site</h1> 
      
      <div className="content">
        <h1 className="article-title">{data.title}</h1>
        
        {/* ERROR 4: Missing alt attributes on important images */}
        <img src={data.image} /> 
        
        <div>{data.body}</div>
      </div>
    </div>
  );
}
```

Why this fails: Renders articles client-side (SPA), uses nested div selectors instead of semantic boundaries, renders duplicate `<h1>` headers, and omits `alt` image parameters.

---

## Failure Modes

- **The Empty Index SPA:** Deploying public blog pages using client-side React routes without pre-rendering steps.
- **The Multi-H1 Conflict:** Using duplicate `<h1>` tags on a page view, confusing document hierarchies.
- **The Blind Image Index:** Omitting description properties from image tags, blocking search engine index pipelines.
- **The Cannibalized Meta Duplicate:** Reusing identical meta templates across routes, causing SEO indexing drops.
- **The Stale Canonical Link:** Hardcoding old or wrong URL targets in canonical headers.
- **The Div Soup Parser Lock:** Wrapping articles in nested layouts, making layout extraction difficult for bot parsers.

## Validation

Audit markup files, build configurations, and tags hierarchies:

1. **Verify that a single H1 element is present per template file:**
   Verify markdown or HTML structures:
   ```bash
   grep -rn "<h1>" src/ | grep -v "layout" 2>/dev/null
   # expected: Verify that files render a single h1 block.
   ```
2. **Verify that images include alt parameters:**
   Check image tags in code:
   ```bash
   grep -rn "<img" src/ | grep -v "alt="
   # expected: zero matches. All images include alt attributes.
   ```
3. **Verify canonical tag presence in page head components:**
   Check head components files:
   ```bash
   grep -rn "rel=\"canonical\"" src/ 2>/dev/null
   # expected: Canonical header links are present inside head blocks.
   ```
4. **Identify framework configuration settings (e.g. Next.js pre-rendering configurations) to ensure SSR/SSG is enabled.**

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi dasar-dasar SEO:

> "Use the skill `seo-fundamentals`. Read `.agent/skills/seo-fundamentals/SKILL.md` before coding. Never use client-only SPAs for blogs or render multiple H1 tags. Always configure semantic HTML5, provide image alt parameters, set unique meta descriptions, and declare canonical headers."

## Related

- [seo-audit](../seo-audit/SKILL.md) — Comprehensive page checks.
- [seo-meta-optimizer](../seo-meta-optimizer/SKILL.md) — CTR metadata tuning.
- [nextjs-best-practices](../nextjs-best-practices/SKILL.md) — SSR execution parameters.
