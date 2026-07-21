---
name: nodejs-best-practices
description: Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying.
risk: medium (event loop blocks, CPU-heavy execution locks, unhandled promise errors)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Node.js Best Practices

> **One-liner:** Decision-making guidelines for configuring Node.js runtimes, optimizing event loop performance, managing parallel asynchronous operations, and avoiding CPU blockages.

## When to Use

- When selecting frameworks (Hono, Fastify, NestJS, Express) or module systems (ESM, CJS) for new backend projects.
- When resolving event loop bottlenecks, synchronous file operations, or CPU-bound tasks.
- When structuring unit, integration, and E2E test suites inside Node.js applications.

## Why This Exists

Node.js executes JavaScript on a single thread. If developers use synchronous methods (like `fs.readFileSync`) or execute CPU-bound work (like password hashing or image resizing) directly on the main thread, the entire event loop blocks, delaying requests for all other users. Enforcing async I/O APIs, parallel promise handling, and dedicated thread offloading ensures high-throughput, low-latency performance.

## ALWAYS DO THIS

- **Use non-blocking asynchronous APIs** — Always choose asynchronous methods (e.g., `fs.promises.readFile`) over synchronous equivalents in production routing paths.
- **Run independent tasks in parallel** — Aggregate concurrent, non-dependent operations inside `Promise.all` or `Promise.allSettled` to execute tasks in parallel.
- **Offload CPU-bound calculations** — Delegate heavy computations (such as encryption, hashing, or compression) to Node.js Worker Threads (`worker_threads`) or external task queues.
- **Use stream parsing for large files** — Stream large files or database cursors to process data in chunks without exceeding RAM capacity.
- **Configure native test runners** — Leverage Node.js's built-in test runner (`node:test`) for lightweight, dependency-free test execution.

## NEVER DO THIS

- ❌ **DO NOT** execute synchronous file system operations (e.g. `fs.readFileSync`) or blocking code inside route handlers. **Why fails:** Blocks Node's single-threaded event loop, preventing all other incoming requests from being processed until the operation finishes. **Instead:** Use promise-based asynchronous methods (e.g. `fs.promises.readFile`).
- ❌ **DO NOT** use `Promise.all` when you need all tasks to attempt completion even if one fails. **Why fails:** If any single promise rejects, the entire `Promise.all` rejects immediately, aborting the process and losing the results of the successful promises. **Instead:** Use `Promise.allSettled` and inspect individual status results.
- ❌ **DO NOT** run heavy encryption, zip compression, or complex sorting algorithms directly on the main thread. **Why fails:** Blocks the event loop, causing APIs to drop connections and timeout. **Instead:** Delegate processing to Worker Threads or offload tasks to background queues.
- ❌ **DO NOT** run await statements sequentially when they are independent of each other (e.g. `const a = await getA(); const b = await getB();`). **Why fails:** Doubles the request response time by executing calls one after the other instead of concurrently. **Instead:** Execute both calls in parallel using `Promise.all`.

---

## Event Loop Scheduling Path

Non-blocking operations run asynchronously, freeing the main thread to process other incoming requests:

```
[Incoming Req] ──> [Async I/O Call] ──> [Free Main Thread (Process other Req)] ──> [I/O Callback Resolves] ──> [Send Response]
```

---

## Examples

### ✅ Good — Parallel Async Operations, Non-blocking Cryptography, and Streams

#### 1. Parallel Task Handling with `Promise.allSettled`
```typescript
import { promises as fs } from "fs";

interface UserProfile {
  id: string;
  name: string;
}

export async function fetchUserBatchDetails(userIds: string[]): Promise<UserProfile[]> {
  // Execute independent operations concurrently
  const promises = userIds.map(async (id) => {
    const data = await fs.readFile(`./data/users/${id}.json`, "utf-8");
    return JSON.parse(data) as UserProfile;
  });

  // Wait for all promises to resolve or fail individually without aborting
  const results = await Promise.allSettled(promises);
  
  const profiles: UserProfile[] = [];
  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      profiles.push(result.value);
    } else {
      console.error(`⚠️ Failed to load user ID: ${userIds[idx]}. Reason:`, result.reason);
    }
  });

  return profiles;
}
```

#### 2. Non-blocking Cryptography (Async PBKDF2)
```typescript
import crypto from "crypto";

export function hashPasswordAsync(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 64,000 iterations run asynchronously on Node's libuv thread pool
    crypto.pbkdf2(password, salt, 64000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
}
```

Why this passes: Uses promise-based async file APIs, handles parallel fetches with `Promise.allSettled`, isolates failures, uses async hashing methods on Node's thread pool, and avoids blocking.

### ❌ Bad — Synchronous File Reading, Event Loop Blocks, and Sequential Await Calls

```typescript
import fs from "fs";
import crypto from "crypto";

// ERROR 1: Using synchronous file operations blocks the single-threaded event loop
export function getUserDetailsSync(userId: string): any {
  const data = fs.readFileSync(`./data/users/${userId}.json`, "utf-8");
  return JSON.parse(data);
}

// ERROR 2: Blocking PBKDF2 locks the main thread during iterations
export function hashPasswordUnsafe(password: string, salt: string): string {
  // Freezes the server process until the loop completes
  return crypto.pbkdf2Sync(password, salt, 64000, 64, "sha512").toString("hex");
}

// ERROR 3: Sequential awaits on independent database calls
export async function getDashboardDataUnoptimized() {
  // Double processing latency by running calls one after the other
  const stats = await database.getStats(); 
  const logs = await database.getLogs(); 
  return { stats, logs };
}
```

Why this fails: Freezes the event loop with synchronous file reads, blocks the main thread during password hashing, and runs independent queries sequentially.

---

## Failure Modes

- **The Freeze-on-Hash:** Running CPU-intensive hashing algorithms on the main thread, causing server timeouts.
- **The Fail-Fast Rejection:** Using `Promise.all` on lists of third-party API fetches, where a single timeout causes the entire request to fail.
- **The Out-of-Memory Buffer:** Reading huge files into memory buffers using `fs.readFile` instead of streaming them.

## Validation

Cara memverifikasi kepatuhan penggunaan `nodejs-best-practices`:

1. **Verify that no synchronous fs calls exist in production paths:**
   Check code files for synchronous file operations:
   ```bash
   grep -rn "fs\.[a-zA-Z]*Sync\(" src/
   # Expected: No matches in production API directories.
   ```
2. **Verify usage of parallel Promise calls:**
   Ensure sequential awaits are optimized:
   ```bash
   grep -rn "Promise.all" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengoptimalkan kinerja Node.js:

> "Use the skill `nodejs-best-practices`. Read `.agent/skills/nodejs-best-practices/SKILL.md` before coding. Never use synchronous file system methods or execute blocking CPU operations on the main thread. Always handle parallel tasks using Promise.allSettled and delegate heavy processing to worker threads."

## Related

- [backend-architect](../backend-architect/SKILL.md) — Structural design logic.
- [backend-dev-guidelines](../backend-dev-guidelines/SKILL.md) — Express route structures.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Security middleware configurations.
