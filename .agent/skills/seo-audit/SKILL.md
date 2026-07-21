---
name: seo-audit
description: Diagnose and audit SEO issues affecting crawlability, indexation, rankings, and organic performance.
risk: low (metadata configurations, structural outline tests)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# SEO Audit Patterns

> **One-liner:** Guidelines for auditing page semantic tags hierarchies, checking social Open Graph previews, and verifying assets lazy-loading constraints.

## When to Use

- When reviewing layout template structures for semantic HTML5 compliance.
- When validating social media metadata tags during page development.
- When run-checking images for lazy-loading parameters and alt definitions.

## Why This Exists

Incorrect tag structures and bloated layouts (such as "div soup" designs) make it hard for search bots to extract page context, which hurts rankings. Furthermore, if high-resolution banner images lack lazy loading settings, they block main-thread execution, hurting the Largest Contentful Paint (LCP) Core Web Vital score. Enforcing HTML5 landmarks, social previews verification, and image load checks secures search ranking bounds.

## ALWAYS DO THIS

- **Structure pages using HTML5 landmarks** — Declare `<header>`, `<nav>`, `<main>`, `<article>`, and `<footer>` elements rather than generic `<div>` segments.
- **Implement Open Graph and Twitter Card tags** — Inject descriptive `<meta property="og:title">` and image parameters to support social link previews.
- **Configure lazy loading on off-screen assets** — Apply `loading="lazy"` to all images below the initial fold viewport to optimize LCP.
- **Run automated checks for alt tags** — Run local audit scripts before committing code to detect images missing description properties.
- **Set relative dimensions on media components** — Declare absolute or relative width/height ratios on image layouts to avoid Layout Shifts (CLS).

## NEVER DO THIS

- ❌ **DO NOT** use generic `<div>` containers for layout boundaries (e.g., `<div class="header">` or `<div id="footer">`). **Why fails:** Search engines rely on semantic HTML5 tags to understand page layout context. **Instead:** Use native semantic tags like `<header>` and `<footer>`.
- ❌ **DO NOT** render primary imagery above the fold with lazy loading enabled. **Why fails:** Delays the Largest Contentful Paint (LCP) time by blocking immediate image loads. **Instead:** Keep loading defaults or use `priority` parameters for hero banners.
- ❌ **DO NOT** leave social sharing preview image URLs empty or unreferenced. **Why fails:** Social sharing apps fallback to generic placeholders, resulting in broken links. **Instead:** Map full static assets links to `og:image` properties.
- ❌ **DO NOT** use absolute host links in local testing configurations. **Why fails:** Validation scripts throw errors because local server references break on production builds. **Instead:** Use relative paths or target host variable boundaries.

---

## Semantic Outline Layout

Semantic wrappers group elements into logical document sections:

```
[HTML Head Section] ──> [Meta OG Tags / Canonical Links]
[HTML Body Section] ──> [<header>] ──> [<nav>] ──> [<main> / <article>] ──> [<footer>]
```

---

## Examples

### ✅ Good — HTML5 Semantic Outline and Social Preview Headers

#### 1. Next.js Document Layout Component (`components/BaseLayout.tsx`)
```typescript
import Head from "next/head";

interface LayoutProps {
  title: string;
  description: string;
  shareImage: string;
  canonicalUrl: string;
  children: React.ReactNode;
}

export function BaseLayout({ title, description, shareImage, canonicalUrl, children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* 1. Inject social Open Graph preview tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      {/* 2. Group layouts using HTML5 semantic elements */}
      <header className="border-b py-4">
        <nav className="container flex justify-between mx-auto">
          <a href="/">Home</a>
          <a href="/docs">Documentation</a>
        </nav>
      </header>

      <main className="container mx-auto py-8">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-gray-500">
        <p>© 2026 Project Portal. All rights reserved.</p>
      </footer>
    </>
  );
}
```

#### 2. Lazy Loading Asset Image (`components/Banner.tsx`)
```typescript
export function Banner() {
  return (
    <div className="banner-wrapper">
      {/* 3. Apply lazy loading below the fold and set explicit width/height values */}
      <img
        src="/assets/banner-details.jpg"
        alt="Analytics chart tracking user engagement rates"
        width={1200}
        height={630}
        loading="lazy" 
        className="rounded shadow"
      />
    </div>
  );
}
```

Why this passes: Configures Open Graph tags, wraps markup inside semantic landmarks, applies lazy loading for off-screen images, and declares layout dimensions.

### ❌ Bad — Div Soup Layout structures and Missing Social tags

```typescript
// ERROR 1: Missing Open Graph / Twitter Card social tags in the document head
import Head from "next/head";

export default function BadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-wrapper">
      {/* ERROR 2: Nested div soup lacks semantic landmarks */}
      <div className="top-navigation"> 
        <a href="/">Home</a>
      </div>

      <div className="main-content-area">
        {children}
        
        {/* ERROR 3: Omit lazy-loading on secondary images below the fold */}
        <img src="/assets/footer-graphic.jpg" alt="decorative footer image" /> 
      </div>

      <div className="bottom-footer">
        <p>© 2026 Bad Project</p>
      </div>
    </div>
  );
}
```

Why this fails: Omits social metadata tags, uses nested generic `<div>` containers instead of semantic layouts, and loads off-screen images without lazy-loading settings.

---

## Failure Modes

- **The Div Soup Parser Lock:** Wrapping layout contents inside nested `<div>` tags, hiding semantic boundaries from index bots.
- **The Missing Preview Link:** Forgetting Open Graph tags, resulting in broken social share links.
- **The Fold Lazy Collision:** Adding `loading="lazy"` properties to hero images above the fold, delaying LCP times.
- **The Layout Shift CLS:** Omitting width and height parameters on media elements, causing cumulative layout shifts.
- **The Orphaned Alt Graphic:** Merging images without alt attributes, hurting accessibility scores and search indexing.
- **The Localhost Canonical Leak:** Committing local dev URLs (e.g. `localhost:3000`) inside production canonical headers.

## Validation

Audit markup structures, meta elements, and image properties:

1. **Verify that HTML5 semantic landmark elements are present:**
   Verify main layouts files:
   ```bash
   grep -E "<header|<nav|<main|<footer" src/ 2>/dev/null
   # expected: Main page templates utilize semantic container tags.
   ```
2. **Verify Open Graph metadata tag parameters:**
   Check head wrappers:
   ```bash
   grep -rn "og:image" src/ 2>/dev/null
   # expected: Meta og tags are defined in document heads.
   ```
3. **Verify lazy loading on off-screen assets:**
   Check image components for lazy loading parameters:
   ```bash
   grep -rn "loading=\"lazy\"" src/ 2>/dev/null
   # expected: Off-screen images include lazy loading attributes.
   ```
4. **Identify images missing alt attributes in the codebase:**
   Check image elements in code:
   ```bash
   grep -rn "<img" src/ | grep -v "alt="
   # expected: zero matches. Every image tag includes an alt attribute.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan audit SEO:

> "Use the skill `seo-audit`. Read `.agent/skills/seo-audit/SKILL.md` before coding. Never use div soup wrappers or lazy load hero images. Always implement semantic HTML5 landmarks, write Open Graph tags, and ensure images have alt attributes and dimensions."

## Related

- [seo-fundamentals](../seo-fundamentals/SKILL.md) — Basic crawlers guidelines.
- [seo-meta-optimizer](../seo-meta-optimizer/SKILL.md) — CTR metadata overrides.
- [wcag-audit-patterns](../wcag-audit-patterns/SKILL.md) — Accessibility compliance guidelines.
