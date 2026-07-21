---
name: postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
risk: high (exclusive table locks, timezone drifts, connection depletion, slow queries)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# PostgreSQL Best Practices

> **One-liner:** Guidelines for optimizing PostgreSQL databases, choosing optimal column data types, avoiding long-running locks, configuring row-level security (RLS), and analyzing query execution plans.

## When to Use

- When writing complex SQL queries, designing PostgreSQL schemas, or drafting migration scripts.
- When configuring Postgres row-level security (RLS) policies or connection pooling (PgBouncer).
- When diagnosing slow queries, table locks, or vacuum performance problems.

## Why This Exists

PostgreSQL performs differently depending on data type selections and query architectures. For example, using `timestamp` without timezone details leads to timezone comparison drifts, while restricting strings with generic `varchar(255)` limits schema flexibility and forces expensive database rebuilds when sizes expand. Furthermore, holding transactions open while making external API calls locks database rows, causing connection pools to deplete and freezing the application. Enforcing type standards, proper RLS policies, connection pooling, and lock limits ensures database stability.

## ALWAYS DO THIS

- **Use timestamptz for dates** — Always use `timestamptz` (timestamp with time zone) rather than plain `timestamp` to prevent time offset errors across environments.
- **Prefer text over varchar(n)** — Use the `text` data type instead of arbitrary `varchar(255)` columns unless size restrictions are structurally mandatory; Postgres uses the same storage format internally for both, but `text` avoids schema alteration costs when limits expand.
- **Limit transaction durations** — Keep transactions short and focused; never run external HTTP calls or heavy computations inside a transaction block to prevent exclusive locks.
- **Enable Row-Level Security (RLS)** — Secure tenant columns in production multi-user databases by enabling RLS and applying explicit policies to user roles.
- **Configure connection pooling** — Use PgBouncer or Supabase Pooler in front of databases to manage concurrent connection limits.

## NEVER DO THIS

- ❌ **DO NOT** use the `timestamp` (without time zone) type for storing event logs or dates. **Why fails:** Lacks timezone offsets, causing dates to shift when databases or application servers are migrated to different server locales. **Instead:** Always use the `timestamptz` data type.
- ❌ **DO NOT** trigger external network requests or heavy computational logic inside an active SQL transaction block. **Why fails:** Keeps table and row locks open while waiting for the network call to finish, blocking other queries and exhausting the database connection pool. **Instead:** Complete database writes in short transactions, then trigger network calls.
- ❌ **DO NOT** define permissive Row-Level Security (RLS) policies that trigger recursive SELECT statements on the same table. **Why fails:** Triggers an infinite loop when verifying permissions, exhausting memory and causing queries to time out. **Instead:** Use helper functions or reference cache tables to define RLS policies without recursive checks.
- ❌ **DO NOT** use `varchar(n)` as a default column data type for text inputs. **Why fails:** Changing `varchar(n)` limits later requires an expensive database schema lock and rebuild, which can take hours on large tables. **Instead:** Use the `text` data type.

---

## Recursive RLS vs Safe Helper Policy

Recursive RLS loops exhaust database resources, whereas clean policies resolve queries instantly:

```
[Permissive Recursive RLS] ──> [SELECT users] ──> [RLS Checks users Table] ──> [Triggers Recursive SELECT] (Infinite Loop)
[Safe Helper RLS]           ──> [SELECT users] ──> [Query Helper Cache Table] ──> [Grants Access (Safe)]
```

---

## Examples

### ✅ Good — Optimizing Types, Short Transactions, and RLS Policies

#### 1. Optimal Schema and RLS Design
```sql
-- 1. Use optimal data types (text instead of varchar, timestamptz instead of timestamp)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL, -- Flexible type, no rebuilds needed if size expands
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- Safe timezone storage
);

-- Enable Row-Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Define non-recursive, safe RLS policy matching tenant roles
CREATE POLICY user_manage_own_projects ON projects
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

#### 2. Short Transaction Execution Pattern (Node.js)
```typescript
import { Client } from "pg";
const client = new Client();

async function processUserPurchase(userId: string, productId: string) {
  // Step 1: Perform fast database updates inside a short transaction
  await client.query("BEGIN;");
  try {
    await client.query("UPDATE accounts SET balance = balance - 10 WHERE id = $1", [userId]);
    await client.query("INSERT INTO purchases (user_id, product_id) VALUES ($1, $2)", [userId, productId]);
    await client.query("COMMIT;");
  } catch (error) {
    await client.query("ROLLBACK;");
    throw error;
  }

  // Step 2: Trigger external API calls OUTSIDE the active transaction block
  // Prevents locking database rows while waiting for third-party networks
  await sendSlackNotification(`User ${userId} bought product ${productId}`);
}
```

Why this passes: Uses `text` and `timestamptz` data types, enables RLS with a direct (non-recursive) security policy, separates network requests from database transactions, and uses proper rollbacks.

### ❌ Bad — Bounded Types, Long Transactions, and Recursive RLS

```sql
-- ERROR 1: Using timezone-less timestamp
-- ERROR 2: Using bounded varchar(255) forces database locks on size expansion
CREATE TABLE projects_unsafe (
    id UUID PRIMARY KEY,
    user_id UUID,
    title VARCHAR(255), 
    created_at TIMESTAMP
);

ALTER TABLE projects_unsafe ENABLE ROW LEVEL SECURITY;

-- ERROR 3: Recursive RLS policy - querying the table inside its own USING check triggers infinite loops
CREATE POLICY unsafe_recursive ON projects_unsafe
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM projects_unsafe WHERE title = 'Admin Dashboard'
        )
    );
```

```typescript
// ERROR 4: Long-running transaction holding locks during slow network request
async function badTransaction(userId: string) {
  await client.query("BEGIN;");
  await client.query("UPDATE accounts SET balance = balance - 10 WHERE id = $1", [userId]);

  // ERROR 5: Waiting for external network request inside the transaction lock
  await fetch("https://third-party-api.com/process"); 

  await client.query("COMMIT;");
}
```

Why this fails: Uses `timestamp` without timezone information, restricts strings with `varchar(255)`, defines a recursive RLS policy that triggers infinite loops, and runs network requests inside an active transaction.

---

## Failure Modes

- **The Database Lock Depletion:** Leaving transactions open while executing slow external fetches, causing database connections to run out.
- **The Timezone Drift Bug:** Storing timestamps without offsets, causing scheduled tasks to execute at incorrect times when servers migrate.
- **The RLS Stack Overflow:** Registering RLS policies that check user roles by selecting rows from the same table, causing query timeouts.
- **TOAST Blowup:** Storing JSONB columns > 8KB triggers TOAST out-of-line storage — every read fetches separate pages, masked as "Postgres got slow" without obvious cause.
- **Stale Statistics Seq-Scan:** Query planner ignores indexed columns after bulk insert/update because `pg_stat_user_tables` statistics are outdated → unexpected seq scan on hot path. Mitigation: `VACUUM ANALYZE` after bulk loads.
- **Unindexed FK Cascade:** Child table foreign key without index → `DELETE` on parent row scans entire child table, blocks DML for seconds-to-minutes.

## Validation

Audit PostgreSQL schema untuk timezone bug, transaction leak, RLS recursion, dan plan stability:

1. **Block raw `timestamp` (without timezone):**
   ```bash
   grep -rnE "\btimestamp\b(?!tz)" migrations/ schema/ 2>/dev/null
   # expected: zero matches. Semua datetime wajib `timestamptz`.
   ```
2. **Detect FK columns tanpa index (lambat saat DELETE parent):**
   ```sql
   -- Run di psql:
   SELECT c.conrelid::regclass AS table, a.attname AS column
   FROM pg_constraint c
   JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
   WHERE c.contype = 'f' AND NOT EXISTS (
     SELECT 1 FROM pg_index i
     WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
   );
   -- expected: zero rows. Setiap FK perlu index untuk avoid cascade delete lock.
   ```
3. **Verify statistics fresh setelah bulk load:**
   ```sql
   SELECT relname, last_analyze, n_mod_since_analyze
   FROM pg_stat_user_tables
   WHERE n_mod_since_analyze > 10000;
   -- expected: zero rows OR ANALYZE scheduled. Stale stats = bad query plan.
   ```
4. **EXPLAIN ANALYZE hot queries:**
   ```sql
   EXPLAIN (ANALYZE, BUFFERS) <slow query here>;
   -- expected: index scan untuk kolom yang di-WHERE. Seq Scan pada table > 10k rows = red flag.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan PostgreSQL schema:

> "Use the skill `postgres-best-practices`. Read `.agent/skills/postgres-best-practices/SKILL.md` before coding. Never write raw timestamp data types or call network fetches inside database transactions. Always use timestamptz and text types, enable RLS, and keep database write loops outside transactions."

## Related

- [database](../database/SKILL.md) — Transactional SQL migrations.
- [database-design](../database-design/SKILL.md) — Normalization principles.
- [neon-postgres](../neon-postgres/SKILL.md) — Serverless Postgres setups.
