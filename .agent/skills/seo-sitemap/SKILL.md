---
name: seo-sitemap
description: Analyze existing XML sitemaps or generate new ones with industry templates. Validates format, URLs, and structure.
risk: medium (sitemap parsing failures, indexation blocks, search engine sync errors)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Sitemap Analysis & Generation

> **One-liner:** Guidelines for constructing XML sitemaps, managing index configurations for scale, excluding invalid URLs, and linking sitemap references in robots.txt.

## When to Use

- When writing script pipelines to auto-generate `sitemap.xml` index files.
- When validating URL indexes and checking HTTP status codes in sitemaps.
- When auditing sitemaps reference settings inside search console parameters or `robots.txt`.

## Why This Exists

Sitemaps tell search engine bots which pages they should crawl and index. However, if a sitemap file exceeds the 50,000 URL limit or carries non-canonical, redirected, or 404 error links, search engines waste crawl budget and fail to index new content. Similarly, using deprecated tags (such as `<priority>` or `<changefreq>`) adds unnecessary bloat, as modern search engines ignore them. Enforcing limits, clean URLs, and linking to robots.txt secures search indexing pipelines.

## ALWAYS DO THIS

- **Register sitemaps inside robots.txt** — Declare absolute sitemap locations (e.g. `Sitemap: https://site.com/sitemap.xml`) at the end of the `robots.txt` configuration.
- **Enforce sitemap index splitting** — Split sitemap files into indexes if page totals exceed 50,000 URLs or 50MB file size limits.
- **Include canonical HTTPS URLs only** — Ensure all listed links return direct HTTP 200 responses, excluding redirects or noindex pages.
- **Ensure correct XML schemas namespaces** — Use the exact namespace configuration `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` in the root element.
- **Update lastmod values accurately** — Format `<lastmod>` date strings in valid `YYYY-MM-DD` layout matching actual content edits.

## NEVER DO THIS

- ❌ **DO NOT** include URLs that return non-200 HTTP status codes (such as 301/302 redirects, 404 not found, or 500 server errors). **Why fails:** Crawlers waste time on broken paths, hurting indexation rates. **Instead:** Periodically check sitemap links to verify they return direct 200 responses.
- ❌ **DO NOT** use deprecated `<priority>` or `<changefreq>` tags in XML files. **Why fails:** Modern search engine crawlers (including Googlebot) ignore these tags, resulting in bloated file sizes. **Instead:** Omit these properties and prioritize accurate `<lastmod>` values.
- ❌ **DO NOT** exceed 50,000 URL items or 50MB compressed size limits in a single sitemap file. **Why fails:** Search engines reject files exceeding these boundaries, blocking index pipelines. **Instead:** Deploy a sitemap index structure (`<sitemapindex>`) to group smaller files.
- ❌ **DO NOT** list non-canonical, noindex, or disallowed pages in sitemaps. **Why fails:** Sends contradictory signals to crawlers, leading to indexing errors. **Instead:** Filter out paths containing `<meta name="robots" content="noindex">` or excluded paths.

---

## Sitemap Index Structure

Grouping sitemaps under a master index file optimizes crawler paths:

```
[robots.txt reference] ──> [sitemap-index.xml] 
                                  ├── [sitemap-pages.xml] ──> [Canonical URLs]
                                  └── [sitemap-posts.xml] ──> [Canonical URLs]
```

---

## Examples

### ✅ Good — Clean XML Layout, Sitemap Indexing, and robots.txt Integration

#### 1. Master Sitemap Index XML File (`public/sitemap-index.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- 1. Enforce correct schemas namespaces -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://techportal.com/sitemap-pages.xml</loc>
    {/* 2. Set accurate lastmod timestamps */}
    <lastmod>2026-06-29</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://techportal.com/sitemap-posts.xml</loc>
    <lastmod>2026-06-28</lastmod>
  </sitemap>
</sitemapindex>
```

#### 2. Root robots.txt Configuration (`public/robots.txt`)
```
User-agent: *
Allow: /

# 3. Reference the absolute path of the sitemap index at the end
Sitemap: https://techportal.com/sitemap-index.xml
```

Why this passes: Configures correct namespaces, splits large sitemaps using indexes, updates modification times, and links the sitemap in `robots.txt`.

### ❌ Bad — Deprecated Tags, Redundant Keys, and Missing Master references

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- ERROR 1: Committing sitemap without robots.txt links or index splits -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://techportal.com/home</loc>
    {/* ERROR 2: Including deprecated changefreq and priority keys (ignored by bots) */}
    <changefreq>daily</changefreq> 
    <priority>1.0</priority>
  </url>
  <url>
    {/* ERROR 3: Including non-canonical URL redirection target links */}
    <loc>https://techportal.com/old-posts-redirect</loc> 
    <lastmod>2026-02-07</lastmod>
  </url>
</urlset>
```

Why this fails: Uses deprecated tags, includes redirects, and lacks sitemap index splits or robots.txt linkages.

---

## Failure Modes

- **The Deprecated Bloat Tag:** Including `<priority>` or `<changefreq>` tags in XML files, causing token bloat.
- **The Broken URL Index:** Including redirected or 404 error links, wasting crawl budget.
- **The Index Overflow Error:** Exceeding 50,000 URLs in a single sitemap file without an index split.
- **The Conflicted robots.txt:** Blocking paths in robots.txt but listing them in the sitemap.
- **The Localhost URL Leak:** Hardcoding localhost URLs in production sitemaps.
- **The Stale lastmod Stamp:** Copying a static date for all URLs, leading search engines to ignore modification timestamps.

## Validation

Audit XML sitemaps, index splits, and robots.txt configurations:

1. **Verify sitemap references in robots.txt:**
   Check robots config:
   ```bash
   grep -rn "Sitemap:" public/robots.txt 2>/dev/null
   # expected: Robots file references the production sitemap URL.
   ```
2. **Identify deprecated sitemap tags:**
   Scan sitemaps for priority/changefreq tags:
   ```bash
   grep -rn -E "<priority|<changefreq" public/ 2>/dev/null
   # expected: zero matches. Modern sitemaps omit these properties.
   ```
3. **Verify sitemap URL formats:**
   Check sitemap link protocols:
   ```bash
   grep -rn "<loc>http://" public/ 2>/dev/null
   # expected: zero matches. Only HTTPS URLs are listed.
   ```
4. **Confirm sitemap file sizes limits:**
   Check generated file sizes to confirm no single sitemap exceeds 50MB.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi sitemap:

> "Use the skill `seo-sitemap`. Read `.agent/skills/seo-sitemap/SKILL.md` before coding. Never write deprecated priority tags or list redirects. Always declare sitemaps in robots.txt, split files exceeding 50,000 URLs using indexes, and use HTTPS URLs."

## Related

- [seo-fundamentals](../seo-fundamentals/SKILL.md) — Basic crawler guidelines.
- [seo-meta-optimizer](../seo-meta-optimizer/SKILL.md) — Slug configurations.
- [seo-schema](../seo-schema/SKILL.md) — JSON-LD structured schemas.
