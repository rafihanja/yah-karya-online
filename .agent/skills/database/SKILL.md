---
name: database
description: Database development and operations workflow covering SQL, NoSQL, database design, migrations, optimization, and data engineering.
risk: high (data loss from bad migrations, slow query performance, locks on tables)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Database Workflow

> **One-liner:** Guidelines for managing database lifecycles, designing normalized SQL schemas, writing transactional migration scripts, and creating indexes for query optimization.

## When to Use

- When planning database schema migrations, creating tables, or defining foreign keys.
- When optimizing slow database queries, analyzing execution plans (`EXPLAIN ANALYZE`), or adding indexes.
- When configuring data recovery pipelines, backup schedules, or database pooling configurations.

## Why This Exists

Applying schema migrations without transactions can leave the database in a half-migrated state if a query fails, corrupting production data. Additionally, queries that filter on columns without indexes force the database engine to perform full-table scans, which exhausts CPU resources and locks tables under heavy loads. Enforcing transactional migration files, foreign key indexes, and structured normalization guards database performance and integrity.

## ALWAYS DO THIS

- **Write migrations in transactions** — Wrap all schema modifications (like `CREATE TABLE` or `ALTER TABLE`) inside SQL database transactions to ensure rollbacks if the script fails.
- **Index foreign key columns** — Always create indexes on foreign key columns, as databases do not index them automatically and they are frequently used in JOIN operations.
- **Provide matching rollback scripts** — Pair every database schema migration file with a corresponding rollback script (`down` method) to revert changes cleanly.
- **Normailze schemas to 3NF** — Design database schemas to third normal form (3NF) to eliminate data redundancy, unless denormalization is explicitly required for performance.
- **Analyze query execution plans** — Run `EXPLAIN ANALYZE` on slow SQL queries to identify bottlenecks, table scans, or missing index configurations.

## NEVER DO THIS

- ❌ **DO NOT** execute schema migrations directly on production databases without wrapping them in transactions. **Why fails:** If the migration fails halfway through (e.g. due to a syntax error or constraint violation), the database is left in a corrupt, partially-migrated state. **Instead:** Wrap all migration scripts in transactional blocks (e.g. `BEGIN; ... COMMIT;`).
- ❌ **DO NOT** perform queries that filter or join on columns without creating indexes for them. **Why fails:** Forces the database engine to scan every row in the table, increasing search time from milliseconds to seconds as the database grows and locking tables. **Instead:** Add explicit indexes to columns used in `WHERE`, `JOIN`, or `ORDER BY` clauses.
- ❌ **DO NOT** store passwords, API tokens, or secrets as plain text in database columns. **Why fails:** Exposes sensitive credentials to anyone with read access to the database or backups. **Instead:** Hash passwords using Argon2id or bcrypt, and encrypt sensitive tokens before storage.
- ❌ **DO NOT** use wildcard queries (e.g. `SELECT *`) in production application queries. **Why fails:** Fetches unnecessary data, increases network payload size, and can break applications if columns are added or reordered. **Instead:** Specify only the required columns (e.g. `SELECT id, name`).

---

## Transactional Schema Migration Flow

Wrapping schema updates inside SQL transactions prevents corrupt, partial updates:

```
[Migration Starts] ──> [BEGIN Transaction] ──> [Apply DDL / Create Tables] ──> [Exception Raised?]
                                                                                ├── YES ──> [ROLLBACK (Safe)]
                                                                                └── NO  ──> [COMMIT (Applied)]
```

---

## Examples

### ✅ Good — Transactional Migration Script with Indexes (PostgreSQL)

#### 1. Up Migration (`migrations/001_create_orders_table.up.sql`)
```sql
-- Start a transaction block to ensure atomicity
BEGIN;

-- 1. Create the parent orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the child order items table with foreign keys
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes on foreign keys to optimize JOIN and WHERE queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Commit transaction safely
COMMIT;
```

#### 2. Down Migration (`migrations/001_create_orders_table.down.sql`)
```sql
BEGIN;

-- Drop dependent tables first
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

COMMIT;
```

Why this passes: Wraps schema modifications in `BEGIN/COMMIT` transactions, defines explicit primary and foreign keys with cascade constraints, creates matching indexes on foreign keys, and provides a rollback script.

### ❌ Bad — Non-transactional Migrations, Missing Indexes, and Unconstrained Fields

```sql
-- ERROR 1: No BEGIN/COMMIT transaction block - if order_items fails, orders remains created
-- ERROR 2: Missing ON DELETE cascades on relational records
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    total DECIMAL
);

CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) REFERENCES orders(id), 
    product_id VARCHAR(255),
    quantity INTEGER -- ERROR 3: Missing sanity checks (quantity can be negative or zero)
);

-- ERROR 4: Missing indexes on foreign keys (user_id, order_id, product_id)
-- ERROR 5: No matching rollback/down script provided
```

Why this fails: Lacks transactional boundaries, misses indexes on search columns, lacks cascading rules on foreign keys, lacks check constraints, and omits a rollback script.

---

## Failure Modes

- **The Half-Applied Schema Lock:** Running non-transactional migrations that fail halfway through, locking tables and blocking updates.
- **The Sequential Join Slowdown:** Running complex database joins on foreign key columns that lack indexes, causing high CPU usage.
- **The Cascade Orphan Leak:** Deleting a parent row (e.g. a user) while leaving child rows (e.g. profiles) orphaned, violating database integrity.
- **Deadlock from Lock Order Inversion:** Transaction A updates table X then Y, Transaction B updates Y then X — deadlock detected, one aborts, retry storm under load.
- **Index Bloat & Forgotten REINDEX:** B-tree index pages fragmented after high-churn workload → query slow despite "index exists". Mitigation: scheduled `REINDEX CONCURRENTLY` or `pg_repack`.
- **Connection Pool Exhaustion:** App uses default pool size (e.g. 10) but spawns long-running query — pool empty → request queue → cascading 5xx.

## Validation

Audit database hygiene terhadap migration safety, index coverage, dan lock stability:

1. **Migration wajib transactional:**
   ```bash
   grep -L "BEGIN;" migrations/*.sql 2>/dev/null
   # expected: empty output. Setiap migration file wajib BEGIN/COMMIT pair untuk atomicity.
   ```
2. **FK columns punya index:**
   ```bash
   fk_count=$(grep -cE "REFERENCES " migrations/*.sql)
   idx_count=$(grep -cE "CREATE INDEX" migrations/*.sql)
   echo "FK=$fk_count IDX=$idx_count"
   # expected: idx_count >= fk_count. Setiap FK = 1 index supaya DELETE parent gak lock cascade.
   ```
3. **Check long-running query / lock waiters:**
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, state, query
   FROM pg_stat_activity
   WHERE state != 'idle' AND now() - query_start > interval '5 seconds';
   -- expected: zero rows di OLTP. Query > 5s = investigate atau kill.
   ```
4. **Test rollback path:**
   ```bash
   npm run test:db -- --rollback
   # expected: down migration restores schema bit-perfect (test:db harus include rollback case).
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi database schemas:

> "Use the skill `database`. Read `.agent/skills/database/SKILL.md` before coding. Never write non-transactional SQL migrations or query columns without indexing foreign keys. Always write matching up/down migration scripts, enforce transactional safety, and index search fields."

## Related

- [database-design](../database-design/SKILL.md) — Normalization principles.
- [postgres-best-practices](../postgres-best-practices/SKILL.md) — Performance configurations.
- [api-design-principles](../api-design-principles/SKILL.md) — API contract models.
