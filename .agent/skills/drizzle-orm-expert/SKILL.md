---
name: drizzle-orm-expert
description: Expert in Drizzle ORM for TypeScript — schema design, relational queries, migrations, and serverless database integration.
risk: medium (unprepared statements, schema push data loss, missing query schema references)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Drizzle ORM Expert

> **One-liner:** Guidelines for designing type-safe Drizzle schemas, defining relational maps, executing transaction queries, and running migrations using Drizzle Kit.

## When to Use

- When structuring TypeScript-first database layers using Drizzle ORM.
- When generating schema migrations, applying database updates, or configuring Drizzle Kit pipelines.
- When optimizing database queries using Drizzle's Relational Query API (`db.query`) or prepared statements.

## Why This Exists

Drizzle ORM compiles queries directly to raw SQL with compile-time type safety. However, if developers deploy migrations using direct sync push commands (`drizzle-kit push`) in production, schema collisions can drop columns and cause permanent data loss. Additionally, forgetting to register relational schemas (`relations()`) or pass the `{ schema }` object during client initialization throws runtime errors when calling nested includes (`with`). Enforcing Drizzle Kit migrations, relations definitions, type inference, and pooled client setups prevents runtime crashes and data loss.

## ALWAYS DO THIS

- **Generate migrations via Drizzle Kit** — Always run `drizzle-kit generate` to create SQL migration files, and apply changes in production using `drizzle-kit migrate`.
- **Pass schema config objects to drizzle()** — Pass the full schema object (including table definitions and relations) to the database client constructor to enable the Relational Query API.
- **Infer types from schemas** — Use `InferSelectModel` and `InferInsertModel` to generate TypeScript types from database schemas automatically, avoiding manual interface duplication.
- **Index query columns in the schema** — Define table indexes explicitly in the schema builder callback using the second argument of the `pgTable` (or `mysqlTable`) constructor.
- **Use prepared statements for hot paths** — Compile frequently executed database queries into prepared statements using `.prepare()` to avoid SQL parsing overhead.

## NEVER DO THIS

- ❌ **DO NOT** use `drizzle-kit push` to sync schema modifications in production environments. **Why fails:** Pushes schema changes directly without generating migration history, which can drop columns or tables automatically when structural shifts occur. **Instead:** Generate migrations with `drizzle-kit generate` and apply them with `drizzle-kit migrate`.
- ❌ **DO NOT** write manual TypeScript interface structures to define database models. **Why fails:** Manual interfaces drift from the schema over time, leading to silent type mismatches and compilation errors. **Instead:** Derive model types dynamically using `InferSelectModel<typeof table>`.
- ❌ **DO NOT** query database tables using nested `with` options in `db.query.*` without declaring a corresponding `relations()` map in the schema file. **Why fails:** Throws runtime exceptions or returns empty objects because Drizzle cannot resolve the table relationships. **Instead:** Define relational mappings using the `relations` utility.
- ❌ **DO NOT** write raw SQL strings when the Drizzle query builder supports the operation. **Why fails:** Bypasses TypeScript compile-time checks, exposing queries to syntax errors and SQL injection vulnerabilities. **Instead:** Use Drizzle's standard query builder methods.

---

## Drizzle Migration and Compilation Flow

Schema changes compile to type definitions and migration files, preventing database drift:

```
[Schema (schema.ts)] ──> [drizzle-kit generate] ──> [SQL Migration File] ──> [drizzle-kit migrate] ──> [Production DB]
                    └── [Compile-time Type Inference] ──> [Strict TypeScript Queries]
```

---

## Examples

### ✅ Good — Type-Safe Schemas, Relations, and Client Initialization

#### 1. Schema Definitions (`src/db/schema.ts`)
```typescript
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// Define the parent users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// Define the child posts table with indexes
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    // Define query indexes
    index("idx_posts_author_id").on(table.authorId)
  ]
);

// 1. Declare relational mappings explicitly for the Relational Query API
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  })
}));

// 2. Infer types dynamically from schema definitions
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
```

#### 2. Client Setup (`src/db/index.ts`)
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 3. Initialize client by passing the full schema object
export const db = drizzle(pool, { schema });

// 4. Run database transactions securely
export async function createAuthorWithWelcomePost(email: string, name: string) {
  return await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({ email, name })
      .returning();

    await tx.insert(posts).values({
      title: "Welcome to my profile!",
      authorId: newUser.id
    });

    return newUser;
  });
}
```

Why this passes: Declares explicit table schemas and query indexes, sets up `relations` mappings, derives types automatically from the schema, passes the schema config to the drizzle client constructor, and runs transactions securely.

### ❌ Bad — Hardcoded Interfaces, Missing Relations, and Production Push commands

```typescript
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

// ERROR 1: Missing table indexes
export const usersUnsafe = pgTable("users", {
  email: text("email").notNull()
});

// ERROR 2: Creating duplicate manual type interfaces that can drift
interface UnsafeUserInterface {
  email: string;
  role: string; // ERROR: Field does not exist on usersUnsafe table!
}

// ERROR 3: Initializing client without passing the schema configuration object
const db = drizzle(pool); 

// ERROR 4: Attempting query inclusions with relations missing in schema
const result = await db.query.usersUnsafe.findMany({
  with: { posts: true } // Throws runtime exception
});
```

Why this fails: Omits table indexes, defines type interfaces manually, initializes the client without schema configurations, and queries relationships without a relations map.

---

## Failure Modes

- **The Production Schema Wipe:** Running `drizzle-kit push` in production, dropping columns or tables during deployment.
- **The Empty Include Crash:** Running `db.query.*.findMany` with `with` options, throwing runtime exceptions because the schema relations were not configured.
- **The Interface Drift Mismatch:** Writing manual type interfaces that drift from the database schema, leading to runtime failures.
- **Relations Waterfall N+1:** Nesting `with: { posts: { with: { comments: true }}}` 3+ levels — Drizzle emits separate queries per nesting level under naive driver setup, causing N+1 latency under load.
- **Isolation Level Default Trap:** Calling `db.transaction()` without explicit `{ isolationLevel: 'serializable' }` for financial/concurrent read-modify-write ops — default Read Committed leaves race conditions open.
- **Migration Drift:** Editing schema files but forgetting to run `drizzle-kit generate` — TypeScript types match runtime schema but deployed DB still has old shape, runtime failures after deploy.

## Validation

Audit Drizzle setup terhadap schema wipe, type drift, dan N+1:

1. **Block `drizzle-kit push` di production scripts:**
   ```bash
   grep -rnE "drizzle-kit\s+push" package.json scripts/ .github/workflows/ 2>/dev/null
   # expected: zero matches outside dev. Production wajib `drizzle-kit migrate` (versioned migration files).
   ```
2. **Verify schema config passed ke client:**
   ```bash
   grep -rnE "drizzle\([^)]*schema" src/ lib/ 2>/dev/null
   # expected: setiap drizzle() call include `{ schema }` arg — tanpa schema, query relations gak jalan.
   ```
3. **Detect schema-vs-migration drift:**
   ```bash
   npx drizzle-kit check
   # expected: "Everything's fine 🐶". Drift = generate new migration sebelum deploy.
   ```
4. **Verify explicit isolation level di transaction:**
   ```bash
   grep -rnE "db\.transaction\(" src/ | xargs -I{} grep -L "isolationLevel" {} 2>/dev/null
   # expected: empty output. File yang punya db.transaction tanpa isolationLevel = race-condition risk.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Drizzle ORM:

> "Use the skill `drizzle-orm-expert`. Read `.agent/skills/drizzle-orm-expert/SKILL.md` before coding. Never run schema push commands in production or duplicate database types manually. Always generate SQL migrations, define relations maps, and pass schema configurations to client constructors."

## Related

- [database](../database/SKILL.md) — Transactional SQL migrations.
- [database-design](../database-design/SKILL.md) — Schema normalization rules.
- [neon-postgres](../neon-postgres/SKILL.md) — Serverless Postgres connections.
