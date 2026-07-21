---
name: database-design
description: Database design principles, indexing strategy, prevention of N+1 queries, and normalization.
risk: medium (bad table normalization, missing index keys, cascading delete loops)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Database Design

> **One-liner:** Guidelines for database normalization, designing primary and foreign keys, setting up composite indexes, and implementing soft delete patterns.

## When to Use

- When designing relational SQL schemas, tables, and primary/foreign key connections.
- When creating query index strategies (such as composite, unique, or partial indexes).
- When designing archiving systems, soft delete architectures, or denormalization layers.

## Why This Exists

If a database schema is poorly normalized (for example, storing comma-separated values in a single column), queries become complex, slow, and prone to data anomalies. Additionally, filtering on multiple columns (like `where status = 'active' and created_at > date`) without a composite index forces the database engine to perform slow full-table scans. Enforcing normalized schemas, foreign key cascade constraints, composite indexes, and soft-delete patterns ensures database scalability and speed.

## ALWAYS DO THIS

- **Normalize schemas to 3NF** — Eliminate redundant data by separating entities into distinct tables linked by primary and foreign keys.
- **Define composite indexes for multi-column queries** — Create multi-column indexes (e.g. `(status, created_at)`) for queries that filter on multiple attributes.
- **Create indexes on foreign keys** — Always add indexes to foreign key columns to optimize `JOIN` operations.
- **Enforce soft delete patterns** — Implement soft deletes using a nullable `deleted_at` timestamp column to preserve critical records.
- **Use snake_case for tables and columns** — Standardize database naming conventions using lowercase snake_case (e.g. `user_profiles`, `created_at`).

## NEVER DO THIS

- ❌ **DO NOT** store comma-separated lists or multiple values inside a single string column. **Why fails:** Violates the first normal form (1NF), making it impossible to index, query, or enforce integrity on the nested values without slow regex scans. **Instead:** Create a relational table with foreign key linkages (one-to-many relationship).
- ❌ **DO NOT** use permanent hard-delete commands (`DELETE FROM table`) on audit-sensitive records. **Why fails:** Erases transaction logs, user histories, and audit data permanently, making recovery impossible. **Instead:** Implement a soft-delete column (`deleted_at`).
- ❌ **DO NOT** create a composite index where the column ordering does not match query filtering directions. **Why fails:** Databases can only leverage composite indexes from left to right; if you index `(status, user_id)` but query only by `user_id`, the index is ignored. **Instead:** Order composite index columns based on query cardinality (most selective columns first).
- ❌ **DO NOT** define foreign keys without specifying cascading rules (like `ON DELETE CASCADE` or `ON DELETE SET NULL`). **Why fails:** If a parent row is deleted, the database will block the deletion or leave orphaned rows in child tables, breaking referential integrity. **Instead:** Define cascading delete rules on foreign keys.

---

## Normalization (1NF to 3NF) Process

Normalize data models step-by-step to remove redundancies and optimize search indices:

```
[Unnormalized Table] ──> [1NF (Atomic Fields)] ──> [2NF (Primary Key Links)] ──> [3NF (No Transitive Links)]
```

---

## Examples

### ✅ Good — Normalized Tables, Composite Indexes, and Soft Deletes

```sql
-- 1. Create a parent roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Create a normalized users table linking to roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 3. Soft Delete Column
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 4. Create composite index matching query patterns (filtering by status and created_at)
-- Order columns from left-to-right based on how they appear in WHERE queries
CREATE INDEX IF NOT EXISTS idx_users_status_created 
ON users(status, created_at) 
WHERE deleted_at IS NULL; -- 5. Partial Index: excludes soft-deleted records to save storage space
```

Why this passes: Normalizes roles and users into separate tables, defines explicit foreign keys with restrict rules, implements soft-delete columns, creates a composite index, and utilizes partial indexes to optimize queries.

### ❌ Bad — Denormalized Fields, Unindexed Joins, and Hard Deletes

```sql
-- ERROR 1: Storing comma-separated role strings violates First Normal Form (1NF)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    
    -- ERROR 2: Storing multiple IDs in a string makes joins impossible
    associated_role_ids VARCHAR(255), 
    
    status VARCHAR(50),
    created_at TIMESTAMP
);

-- ERROR 3: Missing soft-delete support (forces unsafe hard deletes)
-- ERROR 4: Missing indexes on status or created_at columns
```

Why this fails: Violates basic normalization rules (1NF), stores multiple relationship links in a single string, lacks soft-delete support, and misses indexing on search columns.

---

## Failure Modes

- **The Comma-Separated Query Lock:** Attempting to join tables using string regex matches on comma-separated values, crashing database performance.
- **The Left-to-Right Index Miss:** Querying a database using the second column of a composite index, forcing a full-table scan.
- **The Orphaned Record Leak:** Deleting a parent row while child tables have unindexed, orphaned keys, bloating storage.
- **The Soft-Delete Filter Forget:** Adding `deleted_at` column but lupa `WHERE deleted_at IS NULL` di query → user dihapus tetap muncul di listing, auth bypass.
- **Premature Denormalization:** Duplicating columns ke multiple tables untuk "optimasi read" sebelum benchmark → write path harus update N tempat, data drift, bukan optimasi tapi technical debt.
- **Enum Migration Hell:** Pakai PostgreSQL `ENUM` type — menambah value baru di production butuh `ALTER TYPE` yang lock-heavy. Mitigasi: pakai `CHECK` constraint atau lookup table.

## Validation

Audit schema design untuk normalization, indexing, soft-delete consistency:

1. **Detect comma-separated multi-value columns:**
   ```bash
   grep -rnE "VARCHAR.*['\"](comma|ids|list)" migrations/ schema/ 2>/dev/null
   # expected: zero matches. Multi-value = junction table required.
   ```
2. **Detect SELECT * di production queries:**
   ```bash
   grep -rnE "SELECT\s+\*" src/ lib/ --include="*.ts" --include="*.sql" 2>/dev/null
   # expected: zero matches outside admin/debug paths. Production queries wajib explicit column list.
   ```
3. **Verify FK columns punya index:**
   ```bash
   grep -B1 -A3 "REFERENCES " migrations/*.sql | grep -c "CREATE INDEX"
   # expected: tiap REFERENCES diikuti CREATE INDEX di kolom yg sama.
   ```
4. **Soft-delete filter coverage:**
   ```bash
   grep -rnE "FROM\s+users\b" src/ | grep -v "deleted_at IS NULL\|softDelete"
   # expected: zero matches. Setiap query ke table dengan deleted_at wajib filter.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk merancang tabel database:

> "Use the skill `database-design`. Read `.agent/skills/database-design/SKILL.md` before coding. Never write denormalized comma-separated fields in a single column or use hard deletes on audit tables. Always normalize to 3NF, enforce snake_case column names, implement soft-deletes, and define composite indexes."

## Related

- [database](../database/SKILL.md) — Transactional SQL migrations.
- [postgres-best-practices](../postgres-best-practices/SKILL.md) — PostgreSQL configurations.
- [database-admin](../database-admin/SKILL.md) — Cloud database instances provisioning.
