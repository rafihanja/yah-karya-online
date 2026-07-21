---
name: seo-schema
description: Detect, validate, and generate Schema.org structured data. JSON-LD format preferred.
risk: high (syntax errors, invalid datetime formats, deprecated schema types usage, Google Rich Results penalties)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Schema Markup Analysis & Generation

> **One-liner:** Guidelines for validating JSON-LD structures, injecting schema markups inside route components, and ensuring alignment with search engine rich results rules.

## When to Use

- When structuring JSON-LD script blocks (`type="application/ld+json"`) in HTML code.
- When audit-checking existing pages for microdata formatting or schema compliance.
- When updating deprecated structured data schemas (e.g. replacing HowTo/EstimatedSalary types).

## Why This Exists

Structured data helps search engines understand the semantic context of page elements, powering rich results (like product prices, review stars, or event dates). However, if JSON-LD scripts carry syntax issues (such as trailing commas or missing quotation marks) or use deprecated types (like `HowTo` or `ClaimReview`), Google's parser rejects the entire block. Enforcing valid JSON-LD formats, absolute URLs, and active schema templates secures rich search listings.

## ALWAYS DO THIS

- **Prioritize JSON-LD script blocks** — Render structured data inside `<script type="application/ld+json">` tags, matching Google's preferred format.
- **Enforce absolute URLs in schema keys** — Ensure target link parameters (such as `logo` or `image`) use complete absolute protocols (`https://`).
- **Use ISO 8601 formats for dates** — Structure datetime keys (like `datePublished` or `dateModified`) in valid `YYYY-MM-DD` or full ISO format.
- **Inject schemas during server rendering** — Deliver JSON-LD blocks in initial server-side HTML outputs rather than injecting them late via client JavaScript.
- **Validate output against rich results rules** — Confirm that the generated schemas include all required parameters before releasing code.

## NEVER DO THIS

- ❌ **DO NOT** use relative paths (e.g. `/assets/logo.png`) inside schema address values. **Why fails:** Search engines struggle to resolve relative links, causing parsing failures. **Instead:** Write complete absolute paths (e.g. `https://mysite.com/assets/logo.png`).
- ❌ **DO NOT** write invalid JSON layouts (such as trailing commas, unquoted property names, or missing closing braces) in script blocks. **Why fails:** The browser parser crashes when reading malformed JSON-LD configurations. **Instead:** Validate and stringify schemas using `JSON.stringify()`.
- ❌ **DO NOT** use deprecated or retired schema types (e.g. `HowTo`, `SpecialAnnouncement`, `EstimatedSalary`, or `Dataset` rich results). **Why fails:** Search engines ignore deprecated tags, resulting in wasted bundle space. **Instead:** Replace them with active schemas like `ProductGroup` or `Organization`.
- ❌ **DO NOT** generate schema elements that do not match the visible page content. **Why fails:** Google penalizes sites that present hidden or mismatched schema data to bots compared to what humans see. **Instead:** Keep schema objects aligned with page copy.

---

## Schema Verification Pipeline

Validating structural tags prevents syntax crashes and ensures rich snippet indexing:

```
[HTML Head Block] ──> [JSON-LD Script] ──> [Checks ISO 8601 Dates] ──> [Absolute URL Paths Only]
                                                                               │
                                    [Validate Mandatory Keys] ◄────────────────┘
```

---

## Examples

### ✅ Good — Valid JSON-LD, Absolute URLs, and ISO Date Formatting

#### 1. Next.js Article Schema Component (`components/ArticleSchema.tsx`)
```typescript
import Head from "next/head";

interface SchemaProps {
  title: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  imageUrl: string;
  pageUrl: string;
}

export function ArticleSchema({ title, authorName, datePublished, dateModified, imageUrl, pageUrl }: SchemaProps) {
  // 1. Build a structured JSON-LD object using active schemas
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "image": imageUrl, // 2. Must be an absolute URL
    "datePublished": datePublished, // 3. Must be YYYY-MM-DD or ISO 8601
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": `https://techportal.com/profile/${authorName.toLowerCase()}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "TechPortal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://techportal.com/assets/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    }
  };

  return (
    <Head>
      {/* 4. Stringify the schema object to prevent trailing comma or quote syntax errors */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </Head>
  );
}
```

Why this passes: Uses the active `BlogPosting` type, formats dates in ISO format, enforces absolute URLs, and stringifies the output to prevent syntax errors.

### ❌ Bad — Malformed JSON Scripts, Relative Links, and Deprecated Types

```typescript
import Head from "next/head";

export default function BadSchema() {
  return (
    <Head>
      {/* ERROR 1: Raw JSON-LD script contains syntax errors (trailing comma, unquoted key) */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "HowTo", // ERROR 2: Using deprecated HowTo schema type
            name: "How to configure Git", // ERROR 3: Missing quotes on key name
            image: "/assets/git.png", // ERROR 4: Relative path breaks parser rules
          }
        `}
      </script>
    </Head>
  );
}
```

Why this fails: Formats JSON-LD manually with syntax issues, uses the deprecated `HowTo` type, and passes relative paths for images.

---

## Failure Modes

- **The Trailing Comma Crash:** Writing raw JSON-LD templates with manual commas, causing browser parsing failures.
- **The Relative URL Reject:** Passing relative paths in schema variables, preventing bots from resolving asset targets.
- **The Deprecated Type Bloat:** Using retired templates (like `HowTo` or `ClaimReview`), wasting code space.
- **The Invalid Date Offset:** Formatting datetimes in non-ISO structures (e.g. `29/06/2026`), causing validation errors.
- **The Mismatched Content Penalty:** Injecting schema properties that do not match the visible page text, triggering penalties.
- **The Late Injection Lag:** Injecting schemas late via client-side JavaScript, delaying crawler updates.

## Validation

Audit markup structures, schema scripts, and type settings:

1. **Verify structured data scripts formatting:**
   Check code files for syntax structures:
   ```bash
   grep -rn "application/ld+json" src/ 2>/dev/null
   # expected: Structured data uses JSON.stringify() instead of raw templates.
   ```
2. **Identify deprecated schema types in use:**
   Scan code for retired type signatures:
   ```bash
   grep -rn -E '"@type":\s*"(HowTo|SpecialAnnouncement|EstimatedSalary)"' src/ 2>/dev/null
   # expected: zero matches. Only active, supported schemas are used.
   ```
3. **Verify absolute URLs in schema properties:**
   Check image and URL fields:
   ```bash
   grep -rn '"image":\s*"/[^/]' src/ 2>/dev/null
   # expected: zero matches. Image links are absolute URLs.
   ```
4. **Confirm date formats matching ISO 8601 patterns:**
   Check datetime fields in schemas to verify they match `YYYY-MM-DD` or full ISO patterns.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi schema markup:

> "Use the skill `seo-schema`. Read `.agent/skills/seo-schema/SKILL.md` before coding. Never write raw unvalidated JSON templates or use relative paths. Always stringify JSON-LD payloads, apply active schema templates, format dates in ISO 8601, and enforce absolute URL targets."

## Related

- [seo-fundamentals](../seo-fundamentals/SKILL.md) — HTML outlining rules.
- [seo-meta-optimizer](../seo-meta-optimizer/SKILL.md) — Canonical configurations.
- [seo-sitemap](../seo-sitemap/SKILL.md) — Sitemap index parameters.