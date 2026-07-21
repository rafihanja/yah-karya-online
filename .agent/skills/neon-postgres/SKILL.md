---
name: neon-postgres
description: Expert patterns for Neon serverless Postgres, branching, connection pooling, and Prisma/Drizzle integration.
risk: medium (unpooled migrations, serverless connection leaks, HTTP transaction errors)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Neon Postgres

> **One-liner:** Guidelines for integrating Neon serverless Postgres, configuring pooled and direct URLs, utilizing WebSocket pools for transactions, and managing database branching.

## When to Use

- When developing serverless backend applications or Edge functions integrated with Neon Postgres.
- When configuring connection pooling using Neon's built-in PgBouncer pooler.
- When setting up preview databases, CI/CD database branching pipelines, or ORM configurations (Drizzle, Prisma).

## Why This Exists

Neon uses PgBouncer to support up to 10,000 concurrent serverless connections. However, running schema migrations or DDL operations through PgBouncer connection pools fails because PgBouncer does not support transactional session locks. Furthermore, using standard HTTP drivers to execute queries saves connection overhead but does not support SQL transactions. Enforcing split connection URLs (pooled vs. direct) and WebSocket drivers for transaction blocks ensures database stability.

## ALWAYS DO THIS

- **Use split database URLs** — Define a pooled connection URL (`-pooler` suffix) for application queries and a direct connection URL (no pooler suffix) for database schema migrations.
- **Select the appropriate driver** — Use `neon-http` for lightweight, one-off queries (fastest cold starts) and `neon-serverless` WebSockets when executing transactions or sessions.
- **Enable SSL connections** — Ensure connection strings append `sslmode=require` to comply with Neon's secure connection rules.
- **Limit serverless pool sizes** — Constrain client-side pool sizes (e.g., `max: 5` or `max: 10`) when running inside serverless lambdas to prevent exhausting connection limits.
- **Implement retry logic for cold starts** — Wrap database clients with connection retry loops to handle latency when instances wake from scale-to-zero suspension.

## NEVER DO THIS

- ❌ **DO NOT** execute schema migrations (e.g., `prisma migrate` or `drizzle-kit migrate`) through pooled connection strings (PgBouncer). **Why fails:** DDL statements and migration locks are not supported by transactional poolers, causing migrations to fail or lock up. **Instead:** Always use a direct connection string (`DIRECT_URL`) for migrations.
- ❌ **DO NOT** attempt to run database transactions (`db.transaction()`) using the lightweight HTTP driver (`neon-http`). **Why fails:** HTTP queries are stateless and execute independently, making it impossible to hold transaction locks open across multiple statements. **Instead:** Use the WebSocket-based `Pool` driver from `@neondatabase/serverless`.
- ❌ **DO NOT** provision unbounded local connection pool sizes (e.g. `max: 100`) inside serverless function containers. **Why fails:** If serverless functions scale to 100 instances and each opens 100 connections, it exhausts Neon's compute limits instantly, resulting in connection timeouts. **Instead:** Keep local pool sizes small (`max: 5` or `max: 10`).
- ❌ **DO NOT** share a single development branch across multiple active pull request preview environments. **Why fails:** Different PR builds will overwrite database schemas and records, causing tests to fail. **Instead:** Use the Neon CLI or GitHub Actions to create isolated database branches for each preview environment.

---

## Neon Serverless Connection Routing

Direct connection for migrations vs. pooled connection for runtime queries:

```
[Prisma Migrate]  ──> [DIRECT_URL]  ──> [Direct Connect] ──> [Apply DDL Schema]
[Serverless App]  ──> [DATABASE_URL] ──> [PgBouncer Pool] ──> [Execute Application SQL]
```

---

## Examples

### ✅ Good — Drizzle Setup with Pooled, Direct, and WebSocket Drivers

#### 1. Drizzle Schema Configuration (`drizzle.config.ts`)
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use the direct, unpooled connection string for migrations
    url: process.env.DIRECT_DATABASE_URL!
  }
});
```

#### 2. Drizzle Database Initialization (`src/db/index.ts`)
```typescript
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Required when running in environments where standard WebSocket is missing (e.g. Node.js)
if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const isProduction = process.env.NODE_ENV === "production";

// 1. Establish WebSocket connection pool for transactional database queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Pooled connection string
  max: isProduction ? 10 : 2, // Limit pool size inside serverless instances
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export const db = drizzle(pool, { schema });

// 2. Safely execute database transactions using the WebSocket driver
export async function transferFunds(fromUser: string, toUser: string, amount: number) {
  await db.transaction(async (tx) => {
    await tx.execute(
      "UPDATE accounts SET balance = balance - $1 WHERE name = $2",
      [amount, fromUser]
    );
    await tx.execute(
      "UPDATE accounts SET balance = balance + $1 WHERE name = $2",
      [amount, toUser]
    );
  });
}
```

Why this passes: Uses unpooled connections for schema migrations, configures WebSocket-based connection pools for transactions, limits pool sizes for serverless instances, and adds WebSocket constructors.

### ❌ Bad — Pooled Migrations, HTTP Transactions, and Large Unbounded Pools

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ERROR 1: Initializing HTTP client with a direct connection string instead of pooled
const sql = neon("postgres://user:pass@ep-direct-db.neon.tech/neondb");
const db = drizzle(sql);

// ERROR 2: Attempting transactions using the HTTP-neon driver (fails at runtime)
export async function badTransfer(fromUser: string, toUser: string, amount: number) {
  await db.transaction(async (tx) => {
     // Throws transaction-unsupported errors
     await tx.execute("UPDATE accounts SET balance = balance - $1", [amount]);
  });
}

// ERROR 3: No connection timeouts or maximum pool sizes defined
```

Why this fails: Uses the HTTP-neon driver to run SQL transactions, uses a direct URL for routine application queries, and lacks pool limit settings.

---

## Failure Modes

- **The Pooled Migration Lock:** Attempting to run DDL migrations through PgBouncer, causing connection timeouts or schema sync failures.
- **The Stateless Transaction Crash:** Running `db.transaction()` over the HTTP driver, throwing immediate runtime exceptions.
- **The Serverless Connection Exhaustion:** Spawning unconstrained pools inside serverless lambdas, blocking database connections under load.
- **Cold-Start Compute Wakeup Latency:** Neon auto-pauses compute setelah idle 5 menit (free tier) — first request after pause = +500-1000ms cold start. User pikir API broken.
- **Branch Database Quota Burst:** Membuat ratusan preview branch (PR) tanpa cleanup → free tier branch limit hit → CI fail di environment yang tidak terkait.
- **Read Replica Stale Read:** Routing read query ke replica branch tanpa sadar replication lag → user POST data lalu GET dapat versi lama.

## Validation

Audit Neon setup terhadap driver mismatch, pool exhaustion, dan branch hygiene:

1. **Verify direct URL untuk migrations (bukan pooled):**
   ```bash
   grep -rnE "DIRECT_DATABASE_URL|directUrl" drizzle.config.* prisma/schema.prisma 2>/dev/null
   # expected: config wajib reference direct URL (port 5432) — pooled (PgBouncer port 6543) gak bisa DDL.
   ```
2. **Verify WebSocket driver dipakai untuk transactions:**
   ```bash
   grep -rnE "@neondatabase/serverless.*Pool|neonConfig\.webSocketConstructor" src/ lib/ 2>/dev/null
   # expected: setiap module yang panggil `.transaction()` import WebSocket Pool, bukan HTTP driver.
   ```
3. **Pool size capped untuk serverless:**
   ```bash
   grep -rnE "new Pool\(\{" src/ | grep -E "max:\s*[1-5]\b"
   # expected: max ≤ 5 di Lambda/Edge function. Default unconstrained = exhaust DB connection cap.
   ```
4. **Cleanup branch DB di PR close (CI workflow):**
   ```bash
   grep -rnE "neonctl branches delete|neon branches delete" .github/workflows/
   # expected: ada step delete branch di PR close trigger. Tanpa cleanup = quota burst.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Neon database:

> "Use the skill `neon-postgres`. Read `.agent/skills/neon-postgres/SKILL.md` before coding. Never run migrations through pooled strings or execute transactions using the HTTP driver. Always use direct URLs for migrations, configure WebSocket pools for transactions, and limit serverless pool sizes."

## Related

- [database](../database/SKILL.md) — Transactional SQL migrations.
- [database-design](../database-design/SKILL.md) — Schema normalization rules.
- [postgres-best-practices](../postgres-best-practices/SKILL.md) — PostgreSQL performance.
