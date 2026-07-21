---
name: seo-meta-optimizer
description: Creates optimized meta titles, descriptions, and URL suggestions based on character limits and best practices. Generates compelling, keyword-rich metadata.
risk: low (metadata formats tuning, character length compliance)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# SEO Meta Optimizer

> **One-liner:** Guidelines for optimizing page meta titles and descriptions length constraints, generating lowercase hyphenated URL slugs, and driving organic search click-through rates.

## When to Use

- When tuning page title tags and descriptions for high-agency click-through rates (CTR).
- When designing clean, human-readable URL slug patterns for new sections or posts.
- When configuring search engine optimizations settings inside React/Next.js routes.

## Why This Exists

Compelling web page layouts mean nothing if search listings are truncated or hard to read. If meta descriptions exceed 160 characters or titles exceed 60 characters, search engines truncate the text, cutting off important marketing copy. Furthermore, using uppercase characters or spaces in URL paths creates unreadable encodings (e.g. `%20` redirects). Enforcing character limits, lowercase hyphenated path formats, and click-compelling copy secures high click-through rates.

## ALWAYS DO THIS

- **Restrict title tags to 50-60 characters** — Ensure main page titles fit within search listing margins to prevent truncation.
- **Maintain meta descriptions within 150-160 characters** — Provide summaries highlighting value propositions followed by call-to-actions (CTAs).
- **Format URL slugs in lowercase with hyphens** — Keep URL path strings short, lowercase, and hyphen-separated.
- **Position primary keywords early** — Place the main target keyword within the first 30 characters of the title tag.
- **Validate metadata length programmatically** — Implement character check assertions inside automated verification scripts.

## NEVER DO THIS

- ❌ **DO NOT** write meta descriptions exceeding 160 characters. **Why fails:** Search engines truncate excessive characters, leaving description sentences incomplete and hard to read. **Instead:** Keep summaries between 150-160 characters.
- ❌ **DO NOT** use spaces, uppercase characters, or special symbols in URL path strings. **Why fails:** Browsers encode these characters (e.g., `/My%20Page`), creating ugly URLs that look like spam. **Instead:** Enforce lowercase, hyphenated slugs.
- ❌ **DO NOT** stuff metadata with repetitive keywords (e.g., `Title: Cheap Shoes - Buy Cheap Shoes - Shoes online`). **Why fails:** Triggers search engine spam filters, causing ranking drops and lowering user click-through rates. **Instead:** Focus on natural, benefits-driven copy.
- ❌ **DO NOT** use generic titles (like `Home` or `New Page`) across separate routes. **Why fails:** Fails to tell crawlers what the page is about, resulting in poor ranking distribution. **Instead:** Use unique titles matching page inputs.

---

## Metadata Length Guidelines

Maintaining target lengths prevents search engine truncation on mobile and desktop views:

```
[Title Tag]        ──> [First 30 Chars: Primary Keyword] ──> [50-60 Chars Max Limit]
[Meta Description] ──> [Value Proposition + Action CTA]  ──> [150-160 Chars Max Limit]
```

---

## Examples

### ✅ Good — Locked Character Lengths, Active Verbs, and Lowercase Slugs

```typescript
import { Metadata } from "next";

interface MetadataInput {
  title: string;
  category: string;
  summary: string;
  slug: string;
}

// 1. Validate and optimize metadata package fields
export function generateOptimizedMetadata(input: MetadataInput): Metadata {
  // Enforce lowercase hyphenated URL formats
  const cleanSlug = input.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Keep title tags within 50-60 characters
  const rawTitle = `${input.title} - ${input.category} | TechPortal`;
  const optimizedTitle = rawTitle.length > 60 ? `${rawTitle.substring(0, 57)}...` : rawTitle;

  // Keep meta descriptions within 150-160 characters with clear call-to-actions
  const rawDesc = `${input.summary} Learn tips and tricks to optimize codebase structures. Read the complete guide today! ✓`;
  const optimizedDesc = rawDesc.length > 160 ? `${rawDesc.substring(0, 157)}...` : rawDesc;

  return {
    title: optimizedTitle,
    description: optimizedDesc,
    alternates: {
      canonical: `https://techportal.com/${cleanSlug}`
    }
  };
}
```

Why this passes: Limits titles to 60 characters, limits descriptions to 160 characters, formats URL path strings in lowercase with hyphens, and includes action-driven call-to-actions.

### ❌ Bad — Truncated Text, Stuffed Keywords, and Encoded URL Slugs

```typescript
import { Metadata } from "next";

// ERROR 1: Generating metadata without character length validations or format checks
export function badMetadataGenerator(): Metadata {
  return {
    // ERROR 2: Generic, keyword-stuffed title exceeding 60 characters limit
    title: "SQL Databases - Cheap PostgreSQL RDS - Setup SQL Databases postgres server", 

    // ERROR 3: Too long description exceeding 160 characters limit (truncated in search results)
    description: "Welcome to our page! Here we talk about various SQL databases and how to set them up easily on local developer machines or AWS servers. It is super useful and we cover all things related to Postgres and SQLite. Check it out!",

    // ERROR 4: Spaces and uppercase characters in slug create encoded browser URLs
    alternates: {
      canonical: "https://techportal.com/SQL Databases/Postgres Setup" 
    }
  };
}
```

Why this fails: Exceeds character limits for titles and descriptions, stuff keywords, and outputs invalid, unformatted URL paths.

---

## Failure Modes

- **The Truncated Description Snippet:** Exceeding 160 characters, causing search engines to truncate descriptions.
- **The Encoded Slug Spam:** Using spaces or uppercase letters in slugs, generating ugly browser paths.
- **The Keyword-Stuffing Drop:** Stuffing metadata with repetitive keywords, triggering search engine spam filters.
- **The Truncated Title Hook:** Exceeding 60 characters in titles, cutting off branding or hooks.
- **The Missing Action CTA:** Omitting action verbs or triggers in descriptions, lowering click-through rates.
- **The Duplicate Canonical Cannibal:** Copying identical canonical URLs across routes, confusing search engine indexers.

## Validation

Audit metadata modules, routes paths, and title strings:

1. **Verify metadata character count limits:**
   Check code metadata outputs length:
   ```bash
   grep -rn "title:" src/ | grep -v "node_modules" 2>/dev/null
   # expected: Verify that generated title strings conform to 50-60 characters limits.
   ```
2. **Verify description strings length parameters:**
   Check description parameters in code:
   ```bash
   grep -rn "description:" src/ 2>/dev/null
   # expected: Verify that description parameters conform to 150-160 characters limits.
   ```
3. **Verify URL slug formatter methods:**
   Verify slug parser logic:
   ```bash
   grep -rn "replace(" src/config/routes/ 2>/dev/null || grep -rn "toLowerCase(" src/config/routes/ 2>/dev/null
   # expected: Slugs are cleaned to lowercase and hyphen-separated formats.
   ```
4. **Identify duplicate canonical meta tags in build outputs:**
   Scan page head tags to verify that each route returns a unique canonical URL.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi optimasi metadata:

> "Use the skill `seo-meta-optimizer`. Read `.agent/skills/seo-meta-optimizer/SKILL.md` before coding. Never write descriptions exceeding 160 characters or use uppercase spaces in slugs. Always enforce character limits, use lowercase hyphenated URL formats, and write benefit-driven call-to-actions."

## Related

- [seo-fundamentals](../seo-fundamentals/SKILL.md) — HTML outlines rules.
- [seo-audit](../seo-audit/SKILL.md) — Assets performance tuning.
- [seo-sitemap](../seo-sitemap/SKILL.md) — Sitemap index configs.
