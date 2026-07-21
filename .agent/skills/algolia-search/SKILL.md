---
name: algolia-search
description: Expert patterns for Algolia search implementation, indexing strategies, React InstantSearch, and relevance tuning.
risk: safe
source: "Elite Agent Operations - Batch 3G (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Algolia Search Engineering

> **One-liner:** Guidelines for integrating search clients, securing API keys, batching database indexes synchronization, and tuning custom search relevance.

## When to Use

- When integrating text searching logic inside SaaS catalogs or document management systems.
- When configuring user-restricted access indices using secure temporary token generation keys.
- When managing backend database synchronizations (atomic swapping, incremental updating, and bulk deletions).

## Why This Exists

Improperly configured search endpoints expose databases to data leakage or high operational costs. If developers bundle the Algolia Admin API key in client-side packages, malicious users can easily wipe all indexes. Similarly, executing full re-indexes or deleting records one-by-one consumes API operations quota and degrades query performance. Enforcing decoupled lite search clients, securing user filters using HMAC tokens, and batch-uploading objects preserves performance and security boundaries.

## ALWAYS DO THIS

- **Leverage search-only keys in client code** — Restrict client access exclusively to the search-only key and fetch-lite client bundles (`algoliasearch/lite`).
- **Implement atomic swaps for full re-indexing** — Sync data to temporary indexes and execute copy-settings and move-index commands to achieve zero-downtime swaps.
- **Enforce secured API keys for multi-tenant filters** — Generate temporary, user-restricted search keys on the backend using filters (e.g. `userId`) and TTL properties.
- **Batch database synchronization payloads** — Group documents updates in chunks (e.g., 1,000–5,000 objects per call) instead of firing single-record update loops.
- **Structure searchable attributes by order of importance** — Rank field searchable structures explicitly in index settings (e.g. `name` > `description`).

## NEVER DO THIS

- ❌ **DO NOT** expose the Admin API key (`ALGOLIA_ADMIN_KEY` = ❌) inside client-facing environment configurations. **Why fails:** Anyone can extract the key from browser assets and run commands to modify settings or delete indices. **Instead:** Keep write keys exclusively on secure backends and proxy search via public search keys.
- ❌ **DO NOT** use the `deleteBy` method for bulk removals in server tasks. **Why fails:** Extremely expensive computationally and subject to heavy rate limiting. **Instead:** Perform deletions in batches using the `deleteObjects` method with object lists.
- ❌ **DO NOT** index date attributes as raw text formatted strings (e.g., "June 29, 2026" = ❌). **Why fails:** Disables numeric sorting comparisons. **Instead:** Map dates to UNIX timestamps (`getTime()`) for numerical sorting.
- ❌ **DO NOT** render static pages for search results paths. **Why fails:** Displays stale records to users when indexes update. **Instead:** Configure on-demand server rendering (`force-dynamic`).

---

## Algolia Indexing & Client Query Pipeline

Verifying keys security, synchronization maps, and relevance rankings:

```
[Database Records] ──> [Batch saveObjects (Admin Key)] ──> [Secured Key generator] ──> [lite Client Query]
```

---

## Examples

### ✅ Good — Secured Key Generation, Batch Indexing, and Search-Only Clients

#### 1. Server-Side Secured Key and Batch Indexing Helper (`lib/algoliaAdmin.ts`)
```typescript
import algoliasearch from "algoliasearch";

// 1. Keep Admin client securely scoped to server-side executions
const adminClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

const index = adminClient.initIndex("products");

export async function batchIndexProducts(products: Array<{ id: string; name: string; description: string; price: number }>) {
  const records = products.map((product) => ({
    objectID: product.id, // required unique record identifier key
    name: product.name,
    description: product.description,
    price: product.price,
    updatedAt: Date.now(), // timestamp format for sorting configurations
  }));

  // 2. Batch records in chunks of 1000 to optimize operations quota
  const BATCH_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    await index.saveObjects(chunk);
  }
}

export function generateUserSecuredKey(userId: string): string {
  // Generate a temporary search key limited to the user's scope
  return adminClient.generateSecuredApiKey(
    process.env.ALGOLIA_SEARCH_KEY!,
    {
      filters: `userId:${userId}`,
      validUntil: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
      restrictIndices: ["user_documents"],
    }
  );
}
```

#### 2. Client-Side Search-Only Lite Setup (`components/SearchBox.tsx`)
```tsx
"use client";

import React from "react";
import algoliasearch from "algoliasearch/lite"; // 3. Import client lite bundle
import { InstantSearch, SearchBox, Hits } from "react-instantsearch";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY! // Public search key only
);

function HitItem({ hit }: any) {
  return (
    <div className="p-4 border-b border-slate-800">
      <h4 className="font-bold text-white">{hit.name}</h4>
      <p className="text-sm text-slate-400 mt-1">{hit.description}</p>
    </div>
  );
}

export function ProductSearch() {
  return (
    <InstantSearch searchClient={searchClient} indexName="products">
      <SearchBox
        placeholder="Search products..."
        className="w-full"
      />
      <Hits hitComponent={HitItem} className="mt-6" />
    </InstantSearch>
  );
}
```

Why this passes: Separates write commands using the admin client on the backend from query operations on the frontend, generates secure user-level query keys, batches indexing tasks in 1000-object blocks, and imports the lightweight client package.

### ❌ Bad — Exposed Admin Keys, Loop-Based Indexing, and Expensive Deletions

```tsx
// app/api/search/route.ts
import algoliasearch from "algoliasearch";

export async function POST(req: Request) {
  // ERROR 1: Exposing Admin API key to public routing loops or client views
  const client = algoliasearch("APP_ID", "ADMIN_KEY_EXPOSED_HERE");
  const index = client.initIndex("products");

  const { products } = await req.json();

  // ERROR 2: Indexing one record at a time in a loop consumes massive API operations
  for (const product of products) {
    await index.saveObject(product); 
  }

  // ERROR 3: deleteBy is computationally expensive and rate-limited
  await index.deleteBy({ filters: "inStock:false" }); 

  return Response.json({ success: true });
}
```

Why this fails: Hardcodes the Admin API key in routes, indexes records individually in a loop instead of batching them, and uses the expensive `deleteBy` function.

---

## Failure Modes

- **The Admin Key Leak:** Bundling admin write credentials in client configurations, allowing attackers to delete records.
- **The Loop Indexing Overload:** Indexing records individually in loop blocks, exhausting the API operations quota.
- **The deleteBy Timeout:** Executing bulk deletions using `deleteBy`, causing database timeouts.
- **The Stale Search Render:** Pre-rendering search pages statically, displaying outdated records to visitors.
- **The String Date Sort:** Storing dates as strings, which prevents numerical sorting.

## Validation

Verify credentials safety, batch structures, and import sources:

1. **Verify that the Admin Key is excluded from client code:**
   Scan codebase for admin key variables:
   ```bash
   grep -rn "ALGOLIA_ADMIN_KEY" src/ 2>/dev/null
   # expected: zero matches inside src/app/ or src/components/ directories.
   ```
2. **Scan for single object saveObject calls:**
   Ensure updates are batched:
   ```bash
   grep -rn "saveObject(" src/ 2>/dev/null
   # expected: zero matches. Synchronization routines call saveObjects for batching.
   ```
3. **Verify presence of lite client imports in frontend directories:**
   Ensure client components import the lightweight client:
   ```bash
   grep -rn "algoliasearch" src/components/ | grep -v "lite" 2>/dev/null
   # expected: zero matches. Client views reference algoliasearch/lite.
   ```
4. **Identify raw dates mappings:**
   Ensure dates are converted to timestamps for sorting.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan integrasi Algolia:

> "Use the skill `algolia-search`. Read `.agent/skills/algolia-search/SKILL.md` before coding. Never expose the Admin API key or run single-record indexing loops. Always configure search-only lite clients, batch updates, and secure user filters."

## Related

- [frontend-dev-guidelines](../frontend-dev-guidelines/SKILL.md) — API encapsulation.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Controller structures.
- [secrets-management](../secrets-management/SKILL.md) — Environment variables security.
