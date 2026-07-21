---
name: supabase
description: Open source Firebase alternative with PostgreSQL, Auth, and Storage.
risk: high (JWT spoofing from session reads, leaking service_role keys, public access via missing RLS)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Supabase

> **One-liner:** Guidelines for integrating Supabase clients, configuring server-side auth validation via `@supabase/ssr`, securing tables with Row-Level Security, and managing realtime subscriptions.

## When to Use

- When building full-stack applications requiring relational databases, authentication, or file storage.
- When implementing real-time features (such as chat feeds or live updates) over PostgreSQL change listeners.
- When configuring database migrations or access policies using the Supabase CLI.

## Why This Exists

If developers use client-side authentication patterns or query user sessions (`supabase.auth.getSession()`) in Next.js Server Components, attackers can spoof JWT headers and bypass authorization checks. Furthermore, exposing the `service_role` key on the client gives users full administrative access to read and write all database records, bypassing Row-Level Security (RLS). Enforcing server-side auth validation (`supabase.auth.getUser()`), restricting key scopes, and enabling RLS ensures data security.

## ALWAYS DO THIS

- **Verify tokens via auth.getUser()** — Always validate sessions on server entry points using `supabase.auth.getUser()` rather than trusting client-supplied session keys.
- **Enable Row-Level Security (RLS)** — Turn on RLS for every database table to prevent public write access via anon keys.
- **Isolate client keys** — Limit client applications to the `anon` public key; keep the administrative `service_role` key restricted to secure, server-side environments.
- **Initialize server-specific clients** — Use `@supabase/ssr` to create cookie-based clients when working in Next.js Server Components, middleware, or Route Handlers.
- **Manage database changes via migrations** — Implement database schema updates using the Supabase CLI (`supabase migration new`) to maintain version control.

## NEVER DO THIS

- ❌ **DO NOT** use `supabase.auth.getSession()` to authorize users in server-side environments (like Server Components or API routes). **Why fails:** `getSession()` reads local cookie data without verifying the JWT signature with Supabase servers, allowing attackers to spoof headers and access unauthorized data. **Instead:** Always use `supabase.auth.getUser()` to force signature verification.
- ❌ **DO NOT** expose the `service_role` secret key in client-side files, environment variables, or console logs. **Why fails:** Bypasses all Row-Level Security rules, granting users full administrative privileges to mutate any table or record. **Instead:** Limit client-side exposure to the public `anon` key.
- ❌ **DO NOT** initialize the standard client-side Supabase client (`createClient`) inside Next.js Server Components. **Why fails:** Standard clients do not sync headers or cookie storage with server requests, leading to mismatched user sessions and caching issues. **Instead:** Use `@supabase/ssr` utilities to build context-aware clients.
- ❌ **DO NOT** deploy database tables without active RLS configurations enabled. **Why fails:** Allows anyone with your public `anon` key to execute arbitrary queries, inserts, and deletes against your database. **Instead:** Enforce RLS (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).

---

## Server-Side Auth Verification Flow

Validating tokens on the server prevents JWT spoofing attacks:

```
[Client Request] ──> [Next.js Middleware] ──> [supabase.auth.getUser()] ──> [Fetch Session from Supabase API]
                                                                                  ├── Valid   ──> [Allow Request]
                                                                                  └── Invalid ──> [Redirect to Login]
```

---

## Examples

### ✅ Good — Next.js Server Client Configuration and Token Verification

#### 1. Next.js Server-Side Client Setup (`src/utils/supabase/server.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe fallback: Server components cannot write cookies directly
          }
        }
      }
    }
  );
}
```

#### 2. Server Component Auth Validation (`src/app/dashboard/page.tsx`)
```typescript
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  // Validate the user's JWT token on the server
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch data safely using Row-Level Security rules
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("user_id", user.id);

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

Why this passes: Uses `@supabase/ssr` to configure server-side clients, syncs cookie stores, validates user sessions on the server, and retrieves data using RLS checks.

### ❌ Bad — JWT Spoofing, Exposing service_role, and Missing RLS

```typescript
import { createClient } from "@supabase/supabase-js";

// ERROR 1: Exposing service_role key to client configurations
const unsafeClient = createClient(
  "https://my-project.supabase.co",
  "service_role_secret_key_which_bypasses_all_rls_security..." 
);

export async function DashboardPageBad(req) {
  // ERROR 2: authorize user using getSession (vulnerable to JWT spoofing)
  const { data: { session } } = await unsafeClient.auth.getSession();
  
  if (!session) {
    return { status: 401, body: "Unauthorized" };
  }

  // ERROR 3: Querying databases with bypassed authorization checks
  const { data } = await unsafeClient.from("projects").select("*");
  return { body: data };
}
```

Why this fails: Exposes the `service_role` key, uses `getSession` instead of `getUser` to validate sessions, and queries database records without RLS checks.

---

## Failure Modes

- **The Session Hijacking Attack:** Using `getSession()` on server endpoints, allowing clients to send forged session payloads to access data.
- **The Service Role Leak:** Accidentally committing the `service_role` key to public repos, exposing database records.
- **The Public Write Outage:** Creating new tables without enabling RLS, allowing anonymous users to delete or modify data.
- **RLS Policy Loophole via JOIN:** Writing an RLS policy on table A but forgetting table B that A joins to — query returns full data because B has no policy, RLS on A becomes useless.
- **Realtime Channel Flood:** Subscribing to a high-update table (`postgres_changes`) without filters → every client receives every row mutation → bandwidth + connection limits hit fast.
- **Storage Bucket Public-by-Default:** Creating a Storage bucket via dashboard with "public" toggle on → all uploaded files accessible by URL guess, no auth gate.
- **OAuth Redirect Spoofing:** Misconfigured `redirect_to` allowlist in Supabase Auth dashboard → attacker redirects post-login to `evil.com?token=...`, captures session.

## Validation

Audit Supabase setup untuk JWT spoofing, key leak, RLS gap:

1. **Grep server-side `getSession()` usage (security blocker):**
   ```bash
   grep -rnE "auth\.getSession\(\)" --include="*.ts" --include="*.tsx" \
     src/app/ src/middleware* src/pages/api/ 2>/dev/null
   # expected: zero matches. Any hit = JWT spoofing risk.
   ```
2. **Grep `service_role` leak in client code:**
   ```bash
   grep -rnE "service_role|SUPABASE_SERVICE_ROLE" --include="*.ts" --include="*.tsx" \
     src/components/ src/app/ src/pages/ 2>/dev/null
   # expected: zero matches in client paths. Only allowed in server-only files (route handlers, server actions, edge functions).
   ```
3. **Verify RLS enabled on every table:**
   ```sql
   -- Run in Supabase SQL editor:
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = false;
   -- expected: zero rows. Any row = table missing RLS = public read/write risk.
   ```
4. **Verify Auth redirect allowlist matches production domain:**
   Open Supabase Dashboard → Authentication → URL Configuration → Redirect URLs. Confirm only production domain + `localhost` for dev. No wildcards (`*`) or unrelated domains.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Supabase:

> "Use the skill `supabase`. Read `.agent/skills/supabase/SKILL.md` before coding. Never authorize users on the server using getSession() or expose service_role keys. Always authenticate sessions using auth.getUser(), configure server clients via @supabase/ssr, and enable Row-Level Security on all database tables."

## Related

- [nextjs-supabase-auth](../nextjs-supabase-auth/SKILL.md) — Next.js auth patterns.
- [postgres-best-practices](../postgres-best-practices/SKILL.md) — RLS policies setup.
- [auth-implementation-patterns](../auth-implementation-patterns/SKILL.md) — Generic token rules.
