---
name: web-performance-optimization
description: Optimize website and web application performance including loading speed, Core Web Vitals, bundle size, caching strategies, and runtime performance.
risk: high (caching race conditions, client-side rendering crashes, uncompressed assets payloads)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Performance Optimization

> **One-liner:** Guidelines for optimizing page load speed, configuring cache-control headers, implementing code splitting, and compressing visual assets.

## When to Use

- When optimizing initial page loading speed (TTFB, LCP) and visual stability (CLS) on the web.
- When reducing JavaScript bundle sizes using dynamic code splitting.
- When configuring proxy servers, CDN edge routes, or cache-control header parameters.

## Why This Exists

Slow loading speeds hurt user experience, reduce conversion rates, and lower search rankings. If a browser has to download multiple megabytes of uncompressed JavaScript and massive images upfront, page load times spike on mobile connections. Furthermore, failing to cache static resources causes the browser to fetch assets repeatedly on every view. Enforcing code splitting, asset compression, lazy loading, and caching policies ensures fast page load times.

## ALWAYS DO THIS

- **Implement route-level code splitting** — Split JavaScript bundles into smaller chunks using dynamic imports (e.g. `React.lazy()` or Next `dynamic()`).
- **Convert images to WebP/AVIF formats** — Compress visual assets and use `<picture>` tags to deliver responsive layouts.
- **Configure Cache-Control headers** — Set caching policies (e.g., `Cache-Control: public, max-age=31536000, immutable`) for static assets.
- **Deconstruct critical rendering paths** — Inline critical CSS and defer non-essential JavaScript tags to avoid render blocking.
- **Configure compression algorithms on servers** — Enable Gzip or Brotli compression on reverse proxies and CDN nodes.

## NEVER DO THIS

- ❌ **DO NOT** deliver a single, massive JavaScript bundle containing all route logic to the client. **Why fails:** The browser wastes time downloading and parsing unnecessary code, causing long interactivity delays (high INP). **Instead:** Enforce dynamic, route-based code splitting.
- ❌ **DO NOT** serve uncompressed or oversized raw image formats (like PNG or JPEG) for page layouts. **Why fails:** Consumes excessive bandwidth and blocks Largest Contentful Paint (LCP) updates. **Instead:** Convert images to modern formats and compress them under 200KB.
- ❌ **DO NOT** use synchronous `<script>` tags in the HTML header. **Why fails:** Blocks the browser parser, delaying initial page rendering. **Instead:** Use the `async` or `defer` script properties.
- ❌ **DO NOT** define dynamic, user-specific data under immutable cache-control headers. **Why fails:** Users see stale information from cached files, causing consistency bugs. **Instead:** Set no-cache or short validation parameters (e.g. `no-store`).

---

## Asset Caching Lifecycle

Static resources should use long immutable lifetimes, while dynamic data requires validation:

```
[Static Assets (.js, .css)]  ──> [Cache-Control: public, max-age=31536000, immutable]
[Dynamic Data (endpoints)] ──> [Cache-Control: no-store, must-revalidate]
```

---

## Examples

### ✅ Good — Dynamic Imports, Picture Formats, and Server Cache Headers

#### 1. Next.js Lazy Loaded Component Route (`components/Dashboard.tsx`)
```typescript
import dynamic from "next/dynamic";
import Head from "next/head";

// 1. Lazy load heavy component block to reduce initial JS payload sizes
const HeavyChartWidget = dynamic(
  () => import("./HeavyChartWidget"),
  { 
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
    ssr: false 
  }
);

export function Dashboard() {
  return (
    <>
      <Head>
        {/* 2. Preload critical LCP hero image resources */}
        <link rel="preload" as="image" href="https://techportal.com/assets/hero.avif" />
      </Head>
      
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* 3. Use picture structures to deliver optimized formats */}
        <picture className="block my-4">
          <source srcset="/assets/hero.avif" type="image/avif" />
          <source srcset="/assets/hero.webp" type="image/webp" />
          <img
            src="/assets/hero.jpg"
            alt="Dashboard banner"
            width="1200"
            height="600"
            className="w-full h-auto rounded"
            loading="eager"
          />
        </picture>

        <HeavyChartWidget />
      </main>
    </>
  );
}
```

Why this passes: Splits large JS libraries from the initial load using dynamic imports, preloads critical LCP assets, and uses responsive picture layouts with AVIF/WebP formats.

### ❌ Bad — Monolithic Bundles, Uncompressed Images, and Blocking Head Scripts

```typescript
import Head from "next/head";
// ERROR 1: Importing heavy components directly forces inclusion in the main JS bundle
import HeavyChartWidget from "./HeavyChartWidget"; 

export function BadDashboard() {
  return (
    <>
      <Head>
        {/* ERROR 2: Synchronous script tags block HTML parsing and render pipelines */}
        <script src="https://thirdparty.com/library.js"></script> 
      </Head>
      
      <main className="dashboard-content">
        <h1>Dashboard</h1>
        {/* ERROR 3: Serving raw 3MB JPEG images blocks Largest Contentful Paint (LCP) */}
        <img src="/assets/hero.jpg" alt="Banner" /> 
        
        <HeavyChartWidget />
      </main>
    </>
  );
}
```

Why this fails: Imports heavy files directly (increasing main bundle sizes), uses blocking head scripts, and serves uncompressed images without size dimensions.

---

## Failure Modes

- **The Monolithic Bundle Block:** Packing all route logic into a single JS file, delaying page load.
- **The Raw Image LCP Delay:** Serving uncompressed, multi-megabyte images, delaying LCP.
- **The Blocking Head Script:** Including raw, synchronous script tags in HTML head sections.
- **The Stale Dynamic Cache:** Caching user data with long immutable parameters, showing stale information.
- **The No-Compression Payload:** Failing to enable Brotli or Gzip compression on reverse proxy servers.
- **The Missing Dimension CLS:** Omitting width and height parameters on images, causing layout shifts.

## Validation

Audit bundle composition, asset caching rules, and server configurations:

1. **Verify that routing modules implement lazy loading:**
   Check code files:
   ```bash
   grep -rn "React.lazy(" src/ || grep -rn "dynamic(" src/
   # expected: Heavy widgets and routes are imported dynamically.
   ```
2. **Verify image tags define width and height attributes:**
   Check layout image tags:
   ```bash
   grep -rn "<img" src/ | grep -v -E "width=|height="
   # expected: zero matches. Layout images define size constraints.
   ```
3. **Verify server cache-control headers rules:**
   Verify proxy configurations:
   ```bash
   grep -rn "Cache-Control" nginx.conf 2>/dev/null || grep -rn "headers" next.config.js 2>/dev/null
   # expected: Static assets specify long max-age and immutable parameters.
   ```
4. **Confirm Brotli/Gzip configuration settings:**
   Check server configurations to confirm compression is enabled for JS, CSS, and HTML assets.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan optimasi performa web:

> "Use the skill `web-performance-optimization`. Read `.agent/skills/web-performance-optimization/SKILL.md` before coding. Never write monolithic bundles, synchronous script header tags, or uncompressed image routes. Always split code blocks dynamically, prefetch LCP resources, set image size properties, and configure immutable Cache-Control tags."

## Related

- [performance-engineer](../performance-engineer/SKILL.md) — Event loop throttling.
- [performance-optimizer](../performance-optimizer/SKILL.md) — Query execution optimization.
- [performance-profiling](../performance-profiling/SKILL.md) — Web Vitals audits.
