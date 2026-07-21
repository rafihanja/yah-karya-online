---
name: vercel-deployment
description: Expert knowledge for deploying to Vercel with Next.js, Edge configurations, and environments isolation.
risk: high (production database corruption, serverless cold starts, secret environment variables exposure)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Vercel Deployment

> **One-liner:** Guidelines for deploying Next.js applications to Vercel, managing serverless and edge runtimes, configuring redirect logic, and isolating staging from production.

## When to Use

- When deploying Next.js or static applications to Vercel hosting infrastructures.
- When configuring `vercel.json` headers, routes, and edge runtime region settings.
- When organizing public vs private environment variables in the Vercel dashboard.

## Why This Exists

Vercel provides zero-config deployments, but incorrect setups can lead to security breaches and performance regressions. If a developer prefixes a sensitive API key (e.g. database URLs or payment processor secret tokens) with `NEXT_PUBLIC_`, the key is inlined into the client-side JavaScript bundles, allowing anyone to inspect it. Additionally, if preview deployments for pull requests connect to the production database, untested migrations or code bugs can delete active user data. Enforcing environment-specific configs, Edge runtime selections, and build optimizations secures deployment pipelines.

## ALWAYS DO THIS

- **Isolate preview and production databases** — Ensure pull request deployments use a staging/development database instead of the live production database.
- **Keep secrets server-side** — Access secret tokens only on the server, avoiding any `NEXT_PUBLIC_` prefixes.
- **Configure Next.js standalone output** — Set `output: 'standalone'` in `next.config.js` to minimize function bundle sizes.
- **Handle preflight CORS requests** — Return explicit headers for `OPTIONS` calls in API routes that accept cross-origin queries.
- **Configure Incremental Static Regeneration (ISR) tags** — Utilize dynamic revalidation tags (`revalidateTag`) to purge edge caches without rebuilding.

## NEVER DO THIS

- ❌ **DO NOT** prefix sensitive secret credentials (like `DATABASE_URL` or `STRIPE_SECRET_KEY`) with `NEXT_PUBLIC_`. **Why fails:** Vercel packages these variables into client JS files, exposing them in browser developer tools. **Instead:** Keep the variables server-only and access them inside Server Components or Route Handlers.
- ❌ **DO NOT** use the production database url on Vercel preview environments. **Why fails:** Test runs or code bugs on branch preview deployments can corrupt live production records. **Instead:** Define separate preview database configurations in the Vercel dashboard.
- ❌ **DO NOT** import heavy Node-specific modules (like `fs`, `path`, or native binary bindings) inside API routes configured with the `edge` runtime. **Why fails:** Edge routes run on the V8 engine without Node.js APIs, causing deployments to crash at runtime. **Instead:** Use the Node.js runtime or use web standard APIs.
- ❌ **DO NOT** execute database migration commands directly inside Vercel's build scripts (`next build`). **Why fails:** If the build fails or multiple preview deployments execute concurrently, it can result in database locks or partial schema states. **Instead:** Run migrations in isolated GitHub Actions steps or release hooks.

---

## Vercel Environment Isolation Flow

Separating production secrets from preview environments prevents staging data leaks:

```
[Push to Main Branch]  ──> [Production Env] ──> [Connects to Live DB]
[PR / Feature Branch] ──> [Preview Env]    ──> [Connects to Staging DB]
```

---

## Examples

### ✅ Good — Runtime Configuration, Secure Environment Setup, and CORS Headers

#### 1. API Route with Node Runtime and CORS (`app/api/data/route.ts`)
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default Node.js runtime is ideal for heavy SQL database operations
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // 1. Database query using server-only variables (no NEXT_PUBLIC_ prefix)
    const data = await prisma.item.findMany();

    // 2. Return response with explicit CORS headers for safety
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "https://trusted-partner.com",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// 3. Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://trusted-partner.com",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
```

#### 2. Standalone Build Optimization Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 4. Standalone output optimizes serverless bundle sizes
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.images.com"
      }
    ]
  }
};

module.exports = nextConfig;
```

Why this passes: Separates client/server environment scopes, isolates API runtimes, configures preflight options headers, and compiles standalone bundles.

### ❌ Bad — Exposed Public Secrets, Unmanaged Preflight, and Edge Runtime Collisions

```typescript
import fs from "fs"; // ERROR 1: Importing Node.js native module in Edge runtime

// ERROR 2: Configuring Edge runtime for code that depends on Node.js APIs
export const runtime = "edge"; 

export async function GET() {
  // ERROR 3: Accessing sensitive credentials prefixing them with public namespace
  const key = process.env.NEXT_PUBLIC_DATABASE_URL; 
  
  // Fails at runtime on Vercel due to missing Node.js FS APIs
  const data = fs.readFileSync("./data.json", "utf8"); 

  // ERROR 4: Missing OPTIONS CORS preflight handler causes cross-origin blockages
  return new Response(data);
}
```

Why this fails: Imports Node-only files into Edge routes, exposes private parameters using public prefixes, and omits CORS preflight check handlers.

---

## Failure Modes

- **The Public Namespace Spill:** Naming server-only variables with the `NEXT_PUBLIC_` prefix, leaking credentials to client bundles.
- **The DB Branching Collateral:** Running PR previews against production databases, leading to data corruption.
- **The Edge Node-API Crash:** Triggering Node.js utilities (`fs`, `path`) on routes running in the Edge runtime.
- **The Standalone Bloat:** Omitting standalone build targets, creating large deployment packages.
- **The Preflight CORS Block:** Omitting preflight OPTIONS handlers on endpoints accessed by external domains.
- **The Ephemeral Files Loss:** Writing upload logs or uploads directly to local paths, losing files when the serverless container restarts.

## Validation

Audit Vercel deployments configurations, environment tags, and CORS headers:

1. **Verify that no sensitive variables carry public prefixes:**
   Check code and environment files:
   ```bash
   grep -rn "NEXT_PUBLIC_DATABASE_URL" . 2>/dev/null
   # expected: zero matches. Sensitive credentials use server-only keys.
   ```
2. **Verify Node.js modules are excluded from Edge routes:**
   Verify edge files dependencies:
   ```bash
   grep -rn "runtime = 'edge'" src/ -B 5 | grep -E "import fs|import path"
   # expected: zero matches. Edge files only import compatible web APIs.
   ```
3. **Verify next config standalone configurations:**
   Check next configuration properties:
   ```bash
   grep -rn "output: 'standalone'" next.config.js
   # expected: Next config has standalone output enabled.
   ```
4. **Identify missing OPTIONS routes:**
   Scan route folders for `OPTIONS` export methods to confirm CORS preflight checks are set up.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Vercel:

> "Use the skill `vercel-deployment`. Read `.agent/skills/vercel-deployment/SKILL.md` before coding. Never prefix secrets with NEXT_PUBLIC_ or connect preview branches to live databases. Always configure standalone builds, handle OPTIONS preflight calls, and verify Edge runtime compatibility."

## Related

- [github-actions-templates](../github-actions-templates/SKILL.md) — CI/CD automation pipelines.
- [deployment-validation-config-validate](../deployment-validation-config-validate/SKILL.md) — Schema validations.
- [supabase](../supabase/SKILL.md) — External database settings.
