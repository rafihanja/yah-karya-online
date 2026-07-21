---
name: cloudflare-workers-expert
description: Expert in Cloudflare Workers and the Edge Computing ecosystem. Covers Wrangler, KV, D1, Durable Objects, and R2 storage.
risk: medium (edge execution timeouts, resource limits, compatibility errors with Node.js modules)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Cloudflare Workers Expert

> **One-liner:** Guidelines for developing edge serverless functions with Cloudflare Workers, managing D1/KV bindings, offloading background logs via `ctx.waitUntil()`, and maintaining runtime compatibility.

## When to Use

- When developing serverless backends or edge APIs deployed to Cloudflare's global edge network.
- When configuring edge-side data caches (Workers KV), relational databases (D1), or object storage buckets (R2).
- When modifying request/response headers, handling client-side redirects, or adding security filters at the edge.

## Why This Exists

Cloudflare Workers execute in a V8 isolate runtime rather than a full Node.js environment. Attempting to use Node-specific globals (like `fs`, `path`, or `process`) throws runtime errors unless special compatibility flags are enabled. Furthermore, Workers on the free tier are limited to 10ms of CPU execution time per request; blocking the main threat with slow logging operations or heavy computations triggers a CPU limit exception. Utilizing the Fetch API, managing bindings, and offloading tasks to `ctx.waitUntil()` ensures high performance.

## ALWAYS DO THIS

- **Verify Node.js compatibility** — Only use standard Web APIs (like `Fetch`, `Headers`, `Request`, `Response`) or enable the `nodejs_compat` flag in `wrangler.toml` if Node libraries are required.
- **De-prioritize non-blocking operations** — Wrap long-running, non-blocking tasks (like analytics, logging, or third-party tracking) inside `ctx.waitUntil()` to respond to the client immediately.
- **Manage secrets via wrangler bindings** — Access environment variables, KV namespaces, and D1 databases through the `env` argument in the export handler.
- **Bundle code under the 1MB limit** — Keep the final bundle size small to comply with Cloudflare's serverless size constraints.
- **Configure routing redirects at the edge** — Return `Response.redirect()` directly from the worker to resolve redirects at the edge, avoiding round-trips to the origin server.

## NEVER DO THIS

- ❌ **DO NOT** import Node.js core modules (such as `fs`, `path`, or `dns`) in standard Worker scripts. **Why fails:** The V8 isolate runtime does not support Node.js system dependencies, causing immediate runtime crashes on startup. **Instead:** Use standard Web APIs or enable the `nodejs_compat` flag in `wrangler.toml`.
- ❌ **DO NOT** block the response thread by waiting for slow external logging or analytics calls to complete. **Why fails:** If the request takes longer than the allowed CPU time limit (e.g. 10ms on the free tier), Cloudflare terminates the worker and returns a `500 Server Error`. **Instead:** Offload non-blocking promises using `ctx.waitUntil(promise)`.
- ❌ **DO NOT** query global variables or module-level scopes to manage state across different user requests. **Why fails:** Cloudflare routes user requests to different V8 isolates dynamically, which resets global states and can leak data between users. **Instead:** Use Durable Objects or KV storage for persistent states.
- ❌ **DO NOT** hardcode configuration parameters or API keys inside your Worker script. **Why fails:** Exposes credentials in public repositories and prevents routing adjustments across environments. **Instead:** Bind variables using `wrangler.toml` or set them as secret variables via the Wrangler CLI.

---

## Edge Execution & Background Tasks Flow

Returning the response immediately while executing background tasks in parallel prevents CPU timeouts:

```
[HTTP Request] ──> [Worker Fetch] ──> [Return Response] ──> [Execute ctx.waitUntil()] ──> [Log Analytics]
```

---

## Examples

### ✅ Good — D1 Relational Query, KV Cache Check, and Non-blocking Logs

```typescript
export interface Env {
  PRODUCTS_KV: KVNamespace;
  DB: D1Database;
  ANALYTICS_ENDPOINT: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing product ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      // 1. Check the KV cache first to minimize D1 database hits
      const cacheKey = `product:${productId}`;
      const cachedProduct = await env.PRODUCTS_KV.get(cacheKey);

      if (cachedProduct) {
        // Dispatch background analytics logging asynchronously
        ctx.waitUntil(logEvent(env.ANALYTICS_ENDPOINT, productId, "cache_hit"));
        
        return new Response(cachedProduct, {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
      }

      // 2. Query the D1 relational database on cache miss
      const product = await env.DB.prepare(
        "SELECT id, name, price FROM products WHERE id = ?1"
      )
      .bind(productId)
      .first();

      if (!product) {
        return new Response(
          JSON.stringify({ success: false, error: "Product not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const productString = JSON.stringify(product);

      // 3. Cache the retrieved record in KV for subsequent requests (expires in 1 hour)
      ctx.waitUntil(env.PRODUCTS_KV.put(cacheKey, productString, { expirationTtl: 3600 }));
      ctx.waitUntil(logEvent(env.ANALYTICS_ENDPOINT, productId, "cache_miss"));

      return new Response(productString, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: "Internal error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};

// Async background helper function
async function logEvent(endpoint: string, productId: string, status: string): Promise<void> {
  try {
    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ productId, status, timestamp: Date.now() }),
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Failed to log analytics:", err);
  }
}
```

Why this passes: Declares type definitions for environment bindings, reads from cache before querying the database, offloads background tasks using `ctx.waitUntil()`, handles errors, and uses Web-standard Response APIs.

### ❌ Bad — Node Imports, Blocking Task Loops, and Hardcoded Configurations

```typescript
// ERROR 1: Trying to import Node.js core modules in a standard worker script
import fs from "fs"; 
import path from "path";

export default {
  async fetch(request) {
    // ERROR 2: Accessing Node.js process environment variables instead of env bindings
    const apiKey = process.env.API_KEY; 

    // ERROR 3: Direct read attempt of local filesystem (throws error on Cloudflare Edge)
    const filePath = path.join(__dirname, "data.txt");
    const data = fs.readFileSync(filePath, "utf-8");

    // ERROR 4: Blocking the response thread to wait for slow analytics calls
    const logResult = await fetch("https://analytics.unsafe.com/log", {
       method: "POST",
       body: JSON.stringify({ event: "read", data })
    });
    
    // ERROR 5: Missing try/catch block - any network issue will crash the entire response
    return new Response(data);
  }
};
```

Why this fails: Imports Node.js core modules, accesses `process.env` directly, triggers blocking file reads, waits for slow network logs before returning, and lacks exception wrappers.

---

## Failure Modes

- **The Node Runtime Crash:** Deploying script code containing `fs` or `path` imports without configuring compatibility flags.
- **The CPU Limit Exception:** Blocking the worker execution thread with heavy algorithms or nested sync queries, exceeding the 10ms (free) / 50ms (paid) CPU time limit.
- **The Global Leakage:** Using global variables to store user-specific variables, leaking data between requests in the same V8 isolate.
- **KV Eventual Consistency Trap:** Treating Workers KV like Redis — write lalu read langsung dapat value lama (propagation up to 60s globally). Mitigasi: pakai D1 atau Durable Objects untuk strong consistency.
- **Durable Object ID Collision:** Generate DO id dari user input tanpa namespace → konflik antar tenant, data bocor. Mitigasi: `idFromName(tenantId + ":" + resourceId)`.
- **R2 Egress Surprise Bill:** R2 egress free untuk Cloudflare network, tapi proxy via Worker ke S3-compatible client charges Worker request quota. Plus list operations expensive. Mitigasi: monitor `cf-workers.cf-cache-status` dan minimize list-then-fetch pattern.

## Validation

Audit Cloudflare Workers code terhadap runtime compat, CPU budget, isolation, dan binding hygiene:

1. **Detect Node.js core imports tanpa compat flag:**
   ```bash
   grep -rnE "from ['\"](fs|path|crypto|stream|buffer)['\"]" src/
   # expected: zero atau ada `compatibility_flags = ["nodejs_compat"]` di wrangler.toml.
   ```
2. **Background tasks pakai `ctx.waitUntil()`:**
   ```bash
   grep -rnE "(fetch\(|analytics|logger)" src/ | grep -v "waitUntil\|return "
   # expected: setiap background fire-and-forget wajib `ctx.waitUntil(...)` supaya Worker gak return sebelum done.
   ```
3. **No global mutable state per-request:**
   ```bash
   grep -rnE "^let |^var |^const [a-z][a-zA-Z]+ = (\[\]|\{\}|new Map)" src/index.ts src/worker.ts 2>/dev/null
   # expected: zero. Top-level mutable = shared antar request di V8 isolate.
   ```
4. **Verify wrangler config valid:**
   ```bash
   npx wrangler deploy --dry-run --outdir=dist
   # expected: build pass, output bundle size < 1 MB (free) / 10 MB (paid).
   ```
5. **CPU time profiling test:**
   ```bash
   npx wrangler dev --local --inspect
   # Run sample requests + check DevTools Performance tab. CPU time per request < 50ms.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mendeploy Cloudflare Workers:

> "Use the skill `cloudflare-workers-expert`. Read `.agent/skills/cloudflare-workers-expert/SKILL.md` before coding. Never use Node.js core modules or block response loops with slow network calls. Always route variables via env bindings, offload tasks using ctx.waitUntil, and return Web-standard response objects."

## Related

- [backend-dev-guidelines](../backend-dev-guidelines/SKILL.md) — Routing structures.
- [api-design-principles](../api-design-principles/SKILL.md) — Endpoint contract structures.
- [secrets-management](../secrets-management/SKILL.md) — Environment safety.
