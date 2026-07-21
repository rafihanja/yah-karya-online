---
name: clerk-auth
description: Expert patterns for Clerk auth implementation, middleware, organizations, webhooks, and user sync.
risk: high (webhook signature bypass, public key exposures, unawaited auth calls, multi-tenant leaks)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Clerk Authentication

> **One-liner:** Guidelines for setting up Clerk authentication in Next.js App Router applications, configuring middleware route guards, verifying webhook signatures with Svix, and handling B2B organization scopes.

## When to Use

- When implementing user login/registration flows using Clerk in Next.js, React, or backend systems.
- When configuring `clerkMiddleware` to protect API endpoints and client-side page views.
- When syncing Clerk user lifecycle events to a database via webhook integration.

## Why This Exists

Clerk simplifies identity management, but incorrect integration patterns introduce critical vulnerabilities. In Next.js App Router, the `auth()` function is asynchronous; failing to `await auth()` when validating requests leads to silent access control bypasses. Additionally, if webhook sync routes (`/api/webhooks/clerk`) process user creation and deletion events without verifying the incoming `svix` headers, attackers can forge webhook events to create admin users or delete records. Enforcing awaited auth tokens, Svix signature checks, and route matching rules secures access borders.

## ALWAYS DO THIS

- **Await auth() call outputs** — Always call and await the asynchronous `auth()` handler (e.g. `const { userId } = await auth()`) in all Next.js Server Components and Route Handlers.
- **Verify webhook signatures using Svix** — Enforce signature checks on webhook endpoints using Clerk's `Webhook` parser class from `svix` to verify incoming payloads.
- **Add webhook paths to public routes matcher** — Declare webhook routes inside the public routes matcher in `middleware.ts` to prevent Clerk calls from being blocked.
- **Scope queries by organization ID** — When building multi-tenant applications, always extract and filter database queries by the `orgId` parameter returned from the session check.
- **Confirm isLoaded states in client components** — Check `isLoaded` properties before verifying user attributes via hooks (like `useUser()` or `useAuth()`) to prevent hydration mismatches.

## NEVER DO THIS

- ❌ **DO NOT** process webhook requests on the sync route `/api/webhooks/clerk` without verifying Svix signatures. **Why fails:** Attackers can send fake JSON payloads to register accounts, override parameters, or trigger database modifications. **Instead:** Verify the payload using the `svix` library `verify()` method.
- ❌ **DO NOT** call the asynchronous `auth()` helper function in Next.js App Router without using the `await` keyword. **Why fails:** Returns a promise object instead of the session context, letting execution proceed with unauthenticated requests. **Instead:** Use `await auth()`.
- ❌ **DO NOT** expose Clerk secret keys (e.g., prefixing them with `NEXT_PUBLIC_CLERK_SECRET_KEY`) to the frontend. **Why fails:** Exposes the secret key in client-side JS bundles, allowing anyone to bypass auth controls. **Instead:** Keep secret keys in non-public environment variables.
- ❌ **DO NOT** use `currentUser()` for basic session validation checks in Server Components. **Why fails:** `currentUser()` runs a network request to fetch the complete user object, which slows down response times and hits rate limits. **Instead:** Query `auth()` to check the `userId` first.

---

## Webhook Signature Verification Flow

Verifying headers via Svix prevents spoofed requests from hitting database tables:

```
[Clerk webhook Event] ──> [Checks svix-signature Headers] ──> [Svix Webhook verify()]
                                                                      ├── VALID   ──> [Sync to Database]
                                                                      └── INVALID ──> [Return HTTP 400 Bad Request]
```

---

## Examples

### ✅ Good — Async auth() calls, Secure Webhook Verification, and Route Guards

#### 1. Next.js Protected API Route Handler (`app/api/data/route.ts`)
```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // 1. Always await the asynchronous auth() utility call
  const { userId, orgId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Filter query properties by orgId in multi-tenant contexts
  if (!orgId) {
    return NextResponse.json({ error: "Organization required" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    where: { organizationId: orgId }
  });

  return NextResponse.json(projects);
}
```

#### 2. Svix Webhook Sync Handler (`app/api/webhooks/clerk/route.ts`)
```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET key");
  }

  // Fetch signature headers
  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix signature headers", { status: 400 });
  }

  const payload = await req.json();
  const rawBody = JSON.stringify(payload);

  // 3. Verify incoming webhook signatures using Svix
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as WebhookEvent;
  } catch (error) {
    console.error("❌ Webhook verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle verified events
  if (event.type === "user.created") {
    const { id, email_addresses } = event.data;
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0]?.email_address
      }
    });
  }

  return new Response("Success", { status: 200 });
}
```

Why this passes: Awaits the `auth()` helper, routes multi-tenant queries using organizational bounds, verifies webhook payloads using Svix, and handles errors.

### ❌ Bad — Unawaited auth() checks, Unverified Webhooks, and Exposed Public Secrets

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ERROR 1: Exposing secret keys with the NEXT_PUBLIC prefix
const BAD_SECRET_KEY = process.env.NEXT_PUBLIC_CLERK_SECRET_KEY; 

export async function GET() {
  // ERROR 2: Calling the async auth() function without the await keyword
  const { userId } = auth(); 

  // ERROR 3: Accessing properties on a Promise object results in incorrect validations
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ERROR 4: Processing webhook data without verifying Svix signatures
  const payload = await req.json();
  await prisma.user.create({ data: { clerkId: payload.data.id } });

  return NextResponse.json({ success: true });
}
```

Why this fails: Exposes keys with public prefixes, calls `auth()` without awaiting the promise, and writes webhook inputs to the database without verification checks.

---

## Failure Modes

- **The Unawaited Promise Bypass:** Failing to await `auth()`, allowing unauthenticated requests to bypass route checks.
- **The Spoofed Webhook Sync:** Omitting Svix signature verification, letting attackers modify user roles or records.
- **The Public Secret exposure:** Prefixing Clerk secret keys with `NEXT_PUBLIC`, exposing them in client-side bundles.
- **The Webhook Route Lockout:** Forgetting to register webhook paths as public routes, causing middleware to block Clerk events.
- **The Hydration Mismatch:** Querying user attributes in client components before checking that the `isLoaded` hook property is true.
- **The Tenant Cross-Talk Leak:** Accessing organization data without scoping SQL queries with the session's `orgId`.

## Validation

Audit Clerk authentication routes, middleware parameters, and webhook signatures:

1. **Verify that the async auth() function is always awaited:**
   Check code files for unawaited auth calls:
   ```bash
   grep -rn "const {.*} = auth(" src/
   # expected: zero matches. All instances use 'await auth()'.
   ```
2. **Verify that webhook handlers implement Svix signature checks:**
   Verify Svix usage in webhook routes:
   ```bash
   grep -rn "new Webhook(" src/app/api/webhooks/
   # expected: Verify that svix handlers are configured for incoming webhooks.
   ```
3. **Verify that webhook routes are public in middleware configs:**
   Verify middleware configuration files:
   ```bash
   grep -rn "clerkMiddleware" middleware.ts -A 10 | grep "webhooks"
   # expected: Webhook endpoints are registered as public routes.
   ```
4. **Identify exposed secret keys in public configurations:**
   Check environment configuration variables:
   ```bash
   grep -rn "NEXT_PUBLIC_CLERK_SECRET_KEY" . 2>/dev/null
   # expected: zero matches. Only public keys carry the public prefix.
   ```
5. **Runtime probe — Svix rejection on unsigned webhook POST:**
   Static grep only confirms `new Webhook(...)` exists; it does NOT prove the route actually rejects unsigned payloads. Send a real unsigned request against the running dev server:
   ```bash
   # Dev server must be running on :3000
   curl -i -X POST http://localhost:3000/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -d '{"type":"user.created","data":{"id":"forged_id"}}'
   # expected: HTTP/1.1 400 (missing svix headers) or invalid-signature error.
   # If it returns 200, the route is forge-vulnerable even though grep passes.
   ```
6. **Runtime probe — required env vars present at boot:**
   Compile-time `process.env.CLERK_WEBHOOK_SECRET` reads return `undefined` silently when missing on Vercel/Railway. Probe before deploy:
   ```bash
   node -e "['CLERK_SECRET_KEY','CLERK_WEBHOOK_SECRET','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'].forEach(k=>{if(!process.env[k])throw new Error('Missing '+k)})"
   # expected: exit 0. Non-zero = env not loaded; webhook will throw at first request.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Clerk:

> "Use the skill `clerk-auth`. Read `.agent/skills/clerk-auth/SKILL.md` before coding. Never write unawaited auth() calls or parse webhooks without Svix verification. Always protect routes in middleware, check isLoaded properties in client components, and filter tenant queries by orgId."

## Related

- [auth-implementation-patterns](../auth-implementation-patterns/SKILL.md) — Secure auth designs.
- [backend-security-coder](../backend-security-coder/SKILL.md) — Security coding rules.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Secure endpoints.
