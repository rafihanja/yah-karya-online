---
name: nextjs-supabase-auth
description: Expert integration of Supabase Auth with Next.js App Router using @supabase/ssr helpers and HTTP-only cookies.
risk: critical (session hijacking, JWT spoofing, service role leaks, middleware state mismatch)
source: "Elite Agent Operations - Batch 3B (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Next.js Supabase Authentication

> **One-liner:** Guidelines for integrating Supabase SSR client authentication, securing dynamic dashboard pages via middleware checks, and protecting route tokens from hijacking.

## When to Use

- When configuring user authentication (login, signup, password resets) in Next.js App Router using `@supabase/ssr`.
- When writing middleware controllers (`middleware.ts`) to handle user session refreshing and page gating.
- When exchanging third-party OAuth provider codes (Google, GitHub) for active sessions inside server endpoints.

## Why This Exists

Next.js App Router applications require specialized handling of authentication cookies across client, server, and middleware runtime states. Using outdated legacy clients or caching tokens in unsafe browser state (like `localStorage`) exposes the application to Cross-Site Scripting (XSS) and token hijacking. Furthermore, relying on `getSession()` on the server exposes the app to spoofing since it reads unchecked cookie values without verifying signatures. Enforcing token decryption via `getUser()`, wrapping cookies safely inside HTTP-only contexts, and configuring middleware refresh loops protects user sessions.

## ALWAYS DO THIS

- **Use the @supabase/ssr package for Next.js integrations** — Instantiate Supabase connections using the newer `@supabase/ssr` methods rather than the legacy `@supabase/supabase-js` imports.
- **Enforce getUser() verification on server-side layouts** — Authenticate critical layouts and API endpoints by calling `supabase.auth.getUser()`, which validates the JWT directly on the Supabase auth server.
- **Configure session refresh cycles in Next.js middleware** — Handle dynamic cookie updates inside `middleware.ts` by writing cookies directly back to request headers and response outputs.
- **Verify redirect origins dynamically on callback routes** — Read redirect targets from active host headers (e.g. `request.nextUrl.origin`) inside authentication endpoint handlers rather than using static strings.
- **Enable Row Level Security (RLS) on all database tables** — Enforce database-level policies since the anonymous public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is exposed in client-side code.

## NEVER DO THIS

- ❌ **DO NOT** use `supabase.auth.getSession()` inside server pages or layout routines. **Why fails:** It reads JWT payloads directly from client cookies without validating their signatures, making the backend vulnerable to token spoofing. **Instead:** Always query `supabase.auth.getUser()` to decrypt and check session tokens.
- ❌ **DO NOT** export or use the private `SUPABASE_SERVICE_ROLE_KEY` inside client files or middleware logic. **Why fails:** The service role key bypasses RLS policies completely, exposing the entire database to user tampering. **Instead:** Read it only inside server-side scripts or isolated API paths.
- ❌ **DO NOT** perform redirect navigations inside Server Actions without invoking path revalidations beforehand. **Why fails:** Next.js caches layouts aggressively, causing dashboards to display stale anonymous layouts even after login completes. **Instead:** Call `revalidatePath('/', 'layout')` before triggering route changes.
- ❌ **DO NOT** cache authentication tokens inside localStorage or sessionStorage. **Why fails:** Local client variables are accessible to malicious script injectors, exposing user credentials. **Instead:** Maintain tokens inside HTTP-only cookies managed via SSR storage adapters.

---

## Supabase SSR Auth Pipeline

Managing authentication parameters securely from dynamic page scopes to database triggers:

```
[Browser Client] ──> [middleware.ts (Verify getUser)] ──> [Server Action] ──> [Postgres Table RLS]
```

---

## Examples

### ✅ Good — Secure SSR Client, Middleware Gating, and OAuth Callback

#### 1. Supabase Server Connection Scopes Helper (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // Create client mapping Supabase actions back to Next.js cookie stores
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Safe fallback: Ignore changes if called from static layouts
          }
        },
      },
    }
  );
}
```

#### 2. Auth Middleware Controller (`middleware.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Decrypt token safely to fetch user metadata
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Protect dashboard paths from unauthorized visitors
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
```

#### 3. OAuth Callback Endpoint Handler (`app/auth/callback/route.ts`)
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRoute = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Prevent open redirect attacks by forcing path routing relative to request origin
      return NextResponse.redirect(`${origin}${nextRoute}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
```

Why this passes: Encapsulates Supabase SSR clients using cookie adapters, manages session refreshes safely in middleware, exchanges OAuth tokens securely, and routes dynamic callback path targets safely.

### ❌ Bad — Session Token Spoofing and Service Role Keys Exposure

```typescript
// ERROR 1: Importing incorrect client builder instead of SSR library
import { createClient } from "@supabase/supabase-js"; 
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // ERROR 2: Exposing service role key in layout files (RLS is bypassed)
  const client = createClient(
    "https://xyz.supabase.co", 
    "SECRET_SERVICE_ROLE_KEY" 
  );

  // ERROR 3: Using getSession() directly to bypass security reviews
  const { data: { session } } = await client.auth.getSession(); 
  
  if (session) {
    return NextResponse.json({ secrets: "exposed_database_data" });
  }
  
  return NextResponse.json({ error: "Unauthorized" });
}
```

Why this fails: Imports the client from `@supabase/supabase-js` bypassing the Next.js SSR helper package, exposes the system service role key, and validates requests using the insecure `getSession()` method.

---

## Failure Modes

- **The getSession Spoofing:** Fetching user sessions via `getSession()` inside backend pages, letting attackers forge mock session headers.
- **The Service Role Leakage:** Including the administrative service role key in client configurations, bypassing row security boundaries.
- **The Stale Cache Redirect:** Authenticating users but failing to run `revalidatePath()`, displaying outdated layout states.
- **The Open Redirect Attack:** Redirecting clients to arbitrary URLs read directly from redirect queries.
- **The LocalStorage Token Theft:** Storing active sessions in local client space, exposing them to scripting attacks.
- **The static route Session Crash:** Running Supabase clients inside statically compiled routes without resolving headers.

## Validation

Verify client configurations, token resolution parameters, and middleware patterns:

1. **Verify that getSession is replaced by getUser:**
   Scan code files for `getSession()` occurrences:
   ```bash
   grep -rn "getSession()" app/ 2>/dev/null
   # expected: zero matches. Session verification must use getUser().
   ```
2. **Identify files exposing service role variables:**
   Verify service role usage scopes:
   ```bash
   grep -rn "SERVICE_ROLE_KEY" app/ 2>/dev/null
   # expected: zero matches. Client files only consume ANON keys.
   ```
3. **Verify middleware redirect controls:**
   Ensure `middleware.ts` routes unauthorized requests properly.
4. **Identify raw client builders:**
   Ensure `@supabase/ssr` replaces standard builders in Next.js code.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan konfigurasi Supabase Auth:

> "Use the skill `nextjs-supabase-auth`. Read `.agent/skills/nextjs-supabase-auth/SKILL.md` before coding. Never import getSession() for server-side auth checking or leak service role variables. Always use createServerClient with cookie adapters and getUser()."

## Related

- [auth-implementation-patterns](../auth-implementation-patterns/SKILL.md) — Secure hashing and session controls.
- [nextjs-app-router-patterns](../nextjs-app-router-patterns/SKILL.md) — Layout configuration rules.
- [env-fortress](../env-fortress/SKILL.md) — Secrets exclusion parameters.
