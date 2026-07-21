---
name: performance-optimizer
description: Identifies and fixes performance bottlenecks in code, databases, and APIs. Measures before and after to prove improvements.
risk: high (data queries mutations, caching race conditions, connection pool exhaustion)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Performance Optimizer

> **One-liner:** Guidelines for finding, measuring, and fixing performance bottlenecks across database structures, server endpoints, and frontend components.

## When to Use

- When database queries are running slowly or consuming excessive CPU resources.
- When server endpoints are experiencing latency spikes or failing under load.
- When refactoring slow synchronous calculations or reducing React re-render frequencies.

## Why This Exists

Performance bottlenecks damage user retention and increase server costs. If an application makes separate database queries for every item in a list (the N+1 queries issue) instead of using a JOIN, the database gets overloaded, causing slow response times. Similarly, fetching redundant database fields or making parallel API calls sequentially adds unnecessary lag. Enforcing query profiling, parallel operations, caching strategies, and indexed searches resolves these bottlenecks.

## ALWAYS DO THIS

- **Measure performance before optimizing** — Set up timers (e.g. `console.time()`) to measure baselines and identify the slowest code blocks.
- **Audit database indexes using EXPLAIN** — Analyze query execution plans to verify that queries use index scans rather than sequential scans.
- **Implement cursor pagination for large datasets** — Limit query output sizes using offset or cursor boundaries to prevent memory overload.
- **Combine independent operations in parallel** — Use parallel execution (such as `Promise.all()`) instead of executing requests sequentially.
- **Configure server-side caching** — Cache database read outputs (e.g., using Redis) with appropriate TTL limits to reduce database load.

## NEVER DO THIS

- ❌ **DO NOT** query database tables using wildcards (e.g. `SELECT *`). **Why fails:** Fetches columns that are not needed, wasting database memory and network bandwidth. **Instead:** Select only the required column fields.
- ❌ **DO NOT** execute queries inside loops (the N+1 queries problem). **Why fails:** Triggers hundreds of separate database roundtrips, causing response times to spike. **Instead:** Use eager loading or join statements.
- ❌ **DO NOT** cache dynamic user data without configuring cache invalidation triggers. **Why fails:** Users see outdated information, leading to data consistency bugs. **Instead:** Set short TTL limits and clear caches on database updates.
- ❌ **DO NOT** run profiling or stress tests on the production database. **Why fails:** Risk of locking database tables or exhausting connection pools, causing outages for real users. **Instead:** Run performance tests on a staging clone.

---

## Database Query Lifecycle

Moving from sequential loops to eager joins minimizes database load:

```
[Sequential Loops] ──> [Query 1] ──> [Query 2] ... ──> [Query N]  (N+1 Trips - Slow)
[Eager Loading JOIN] ──> [Combined Query Execution]              (1 Trip - Fast)
```

---

## Examples

### ✅ Good — Parallel Operations, Eager Loading, and Selective Column Fetching

#### 1. Optimized Controller Fetch API (`controllers/DashboardController.ts`)
```typescript
import { Request, Response } from "express";
import { db } from "../config/db";

export async function getDashboardData(req: Request, res: Response) {
  const userId = req.params.userId;

  try {
    console.time("dashboard-fetch");

    // 1. Run independent database queries in parallel to reduce response time
    const [user, posts] = await Promise.all([
      db.query("SELECT id, username, email FROM users WHERE id = $1", [userId]),
      // 2. Use eager loading to fetch related comments count in a single JOIN query
      db.query(`
        SELECT p.id, p.title, COUNT(c.id) as comment_count 
        FROM posts p 
        LEFT JOIN comments c ON c.post_id = p.id 
        WHERE p.author_id = $1 
        GROUP BY p.id
      `, [userId])
    ]);

    console.timeEnd("dashboard-fetch");

    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: user.rows[0],
      posts: posts.rows
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

Why this passes: Selects only the required fields instead of using `SELECT *`, runs queries in parallel to save time, and joins related tables to prevent N+1 query loops.

### ❌ Bad — N+1 Loop Queries, Sequential Call Awaits, and Wildcard Selections

```typescript
import { Request, Response } from "express";
import { db } from "../config/db";

// ERROR 1: Performing sequential awaits and N+1 loop queries
export async function getBadDashboard(req: Request, res: Response) {
  const userId = req.params.userId;

  // ERROR 2: Sequential awaits block the thread, compounding latency
  const userResult = await db.query("SELECT * FROM users WHERE id = $1", [userId]); 
  const user = userResult.rows[0];

  // ERROR 3: Fetching all fields from posts table wastes bandwidth
  const postsResult = await db.query("SELECT * FROM posts WHERE author_id = $1", [userId]); 
  const posts = postsResult.rows;

  // ERROR 4: Executing queries inside a loop (N+1 database roundtrips)
  for (const post of posts) {
    const comments = await db.query("SELECT * FROM comments WHERE post_id = $1", [post.id]);
    post.comments = comments.rows;
  }

  return res.json({ user, posts });
}
```

Why this fails: Runs multiple query requests sequentially, fetches all database fields using wildcards, and triggers separate query roundtrips inside a loop.

---

## Failure Modes

- **The N+1 Query Loop:** Running database queries inside loop blocks, creating multiple unnecessary database roundtrips.
- **The Sequential Await Drag:** Awaiting unrelated async actions one after another, multiplying response latency.
- **The Wildcard memory waste:** Fetching all columns via `SELECT *` instead of selecting only the necessary fields.
- **The Un-indexed Seq Scan:** Searching large tables on unindexed columns, causing slow sequential database scans.
- **The Stale Cache Collision:** Caching dynamic database records without implementing invalidation parameters.
- **The Pagination omission:** Returning un-paginated lists from database queries, risking memory crashes.

## Validation

Audit database query formats, database structures, and api route profiles:

1. **Verify that no wildcard queries are used in database modules:**
   Check code files:
   ```bash
   grep -rn "SELECT \*" src/ 2>/dev/null
   # expected: zero matches. Specific fields are selected.
   ```
2. **Identify database queries executed inside loops:**
   Scan code files for query triggers inside loops:
   ```bash
   grep -rn "await" src/ | grep -E "for\s*\(|forEach\("
   # expected: zero matches. Eager loading or join queries are configured.
   ```
3. **Verify presence of indexes on foreign key columns:**
   Check schema migration files:
   ```bash
   grep -rn "CREATE INDEX" src/db/migrations/ 2>/dev/null
   # expected: Foreign keys and queried columns carry index definitions.
   ```
4. **Confirm API parallel executions:**
   Verify that independent asynchronous operations use `Promise.all()` to execute in parallel.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan optimasi kode:

> "Use the skill `performance-optimizer`. Read `.agent/skills/performance-optimizer/SKILL.md` before coding. Never write queries inside loops or fetch all fields with SELECT *. Always combine independent requests using Promise.all(), verify database columns index settings, and enforce pagination."

## Related

- [performance-engineer](../performance-engineer/SKILL.md) — CPU thread throttling.
- [performance-profiling](../performance-profiling/SKILL.md) — DevTools performance audits.
- [database-design](../database-design/SKILL.md) — Schema modeling constraints.
