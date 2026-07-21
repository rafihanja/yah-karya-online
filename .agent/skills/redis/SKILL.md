---
name: redis
description: In-memory data structure store, used as a distributed, in-memory key-value database, cache, session store, and message broker.
risk: medium (event loop blocking, connection exhaustion, memory eviction outages)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Redis

> **One-liner:** Guidelines for integrating Redis in Node.js applications, setting cache expiration bounds, avoiding blockages from blocking commands, separating Pub/Sub connections, and checking memory metrics.

## When to Use

- When implementing API caching layers, session stores, or message broker channels (ioredis).
- When configuring background jobs, rate limiters, or real-time leaderboards.
- When managing high-frequency transaction states that require sub-millisecond latencies.

## Why This Exists

Redis is a single-threaded in-memory database. If developers use blocking commands like `KEYS *` to search key lists in production, Redis freezes the execution thread, causing all client requests to time out. Additionally, failing to define Time-To-Live (TTL) policies on cached items causes memory to grow until the database hits its RAM limit and evicts keys or crashes. Enforcing `SCAN` iteration commands, explicit expiration policies, and separate Pub/Sub connections preserves database performance.

## ALWAYS DO THIS

- **Set key expiration limits (TTL)** — Always append a Time-To-Live duration (`EX` or `PX`) to keys to prevent memory leaks and out-of-memory crashes.
- **Use SCAN instead of KEYS** — Iterate over keys in production using non-blocking cursors (`SCAN`, `HSCAN`, `SSCAN`) rather than the blocking `KEYS` command.
- **Isolate Pub/Sub connections** — Dedicate separate client connections for Pub/Sub subscription listeners; subscribed channels cannot execute regular write/read commands.
- **Use structured key naming namespaces** — Organize keys using semantic colon-separated prefixes (e.g. `app:users:profile:12345`) to prevent key collisions.
- **Serialize nested payloads** — Convert JavaScript object maps into JSON strings before writing to standard keys, or use Redis Hashes (`hset`, `hgetall`).

## NEVER DO THIS

- ❌ **DO NOT** execute the blocking `KEYS *` command in production environments. **Why fails:** Redis is single-threaded, and executing `KEYS` searches the entire keyspace sequentially, freezing the database thread and causing timeouts on all incoming requests. **Instead:** Use the cursor-based `SCAN` command.
- ❌ **DO NOT** use a single Redis client connection to both subscribe to a Pub/Sub channel and execute database queries. **Why fails:** Once a Redis client enters subscription mode, it only accepts commands that manage subscriptions (`SUBSCRIBE`, `UNSUBSCRIBE`, etc.); executing other database write/read operations throws runtime errors. **Instead:** Initialize separate publisher and subscriber client instances.
- ❌ **DO NOT** write large objects or binary payloads (> 1MB) directly to Redis. **Why fails:** Reading large payloads increases network latency and blocks the single thread, reducing throughput. **Instead:** Store files in object storage (like AWS S3 or Cloudflare R2) and reference their URLs in Redis.
- ❌ **DO NOT** cache database query results indefinitely without setting expiration bounds. **Why fails:** Causes the database to run out of RAM, triggering random key evictions (if eviction policies are active) or out-of-memory errors that crash the server. **Instead:** Set an explicit TTL threshold on all cache keys.

---

## Redis Connection Isolation Flow

Publishers and subscribers require separate connection clients to avoid socket blocking:

```
[Redis Publisher Client] ──> PUBLISH "chat" "hello" ──> [Redis Server]
                                                            │
[Redis Subscriber Client] <── (Subscribed socket) ◄─────────┘ (Only listens, cannot write)
```

---

## Examples

### ✅ Good — Connection Isolation, Safe Caching, and SCAN Command

#### 1. Safe Cache Handler with Expiration Limits
```typescript
import Redis from "ioredis";

// Initialize the primary connection client
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function getCachedValue<T>(
  key: string,
  fetchOriginalFn: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  // Check cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // Fetch from database on cache miss
  const freshData = await fetchOriginalFn();

  // Save to cache with an explicit expiration limit (TTL)
  await redis.set(key, JSON.stringify(freshData), "EX", ttlSeconds);

  return freshData;
}
```

#### 2. Non-blocking Key Scanner
```typescript
export async function deleteKeysByPrefix(prefix: string): Promise<void> {
  let cursor = "0";
  
  // Non-blocking loop iteration using SCAN
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      `${prefix}*`,
      "COUNT",
      100
    );
    
    cursor = nextCursor;
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}
```

Why this passes: Establishes explicit TTL limits, uses non-blocking cursor scans (`redis.scan`) to iterate over keys, serializes object inputs, and uses namespace prefixes.

### ❌ Bad — KEYS Commands, Sharing Subscriber Connections, and Unbounded Caching

```typescript
import Redis from "ioredis";
const sharedClient = new Redis("redis://localhost:6379");

// ERROR 1: Caching database values indefinitely without expiration boundaries (TTL)
export async function badCacheSet(key: string, data: any) {
  await sharedClient.set(key, JSON.stringify(data)); 
}

// ERROR 2: Sharing subscription clients for write operations
export async function badPubSubSetup() {
  await sharedClient.subscribe("alerts");
  
  // ERROR 3: Attempting database write commands on subscription socket (throws error)
  await sharedClient.set("status", "active"); 
}

// ERROR 4: Using the blocking KEYS command to find matching profiles
export async function getKeysUnsafe(prefix: string) {
  // Freezes the single execution thread, causing timeouts
  return await sharedClient.keys(`${prefix}*`); 
}
```

Why this fails: Caches records indefinitely without TTL limits, runs write queries on subscriber sockets, and executes blocking `keys()` searches.

---

## Failure Modes

- **The Single-Thread Freeze:** Running `KEYS *` in a production database containing millions of keys, blocking all user requests.
- **The Subscription State Crash:** Triggering data updates on a client connection that is locked in subscription mode.
- **The Out-of-Memory Outage:** Caching database values without expiration bounds, causing Redis to crash due to RAM exhaustion.
- **The Eviction cascade:** Setting database limits to evict keys on memory pressure without monitoring, dropping critical session tokens.
- **The Cold Cache Stampede:** Having hot cache keys expire simultaneously, causing thousands of concurrent requests to hit the database at once.
- **The Unserialized Data Corruption:** Attempting to store raw JavaScript objects in Redis, which converts the objects to `[object Object]` strings.

## Validation

Validate Redis caching, connection patterns, and memory safety:

1. **Verify that the blocking KEYS command is not used in production code:**
   Check code files for keys commands:
   ```bash
   grep -rn "\.keys(" src/ lib/ 2>/dev/null
   # expected: zero matches. All loops use SCAN instead of KEYS.
   ```
2. **Verify that every cache write command defines a TTL:**
   Verify code files for Redis set operations:
   ```bash
   grep -rn "\.set(" src/ | grep -vE "EX|PX"
   # expected: zero matches. Every set command includes an expiration flag.
   ```
3. **Verify memory metrics and limits via redis-cli:**
   ```bash
   redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human"
   # expected: current memory is well below the configured maxmemory threshold.
   ```
4. **Monitor active clients and connection health:**
   ```bash
   redis-cli CLIENT LIST | head -n 10
   # expected: verified connections list with separate publish and subscribe client states.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi Redis:

> "Use the skill `redis`. Read `.agent/skills/redis/SKILL.md` before coding. Never write blocking KEYS commands or reuse subscriber connections for queries. Always define key namespaces, configure explicit expiration limits (TTL), and use SCAN commands for key iterations."

## Related

- [database-design](../database-design/SKILL.md) — Normalization principles.
- [nodejs-best-practices](../nodejs-best-practices/SKILL.md) — Event loop patterns.
- [nosql-expert](../nosql-expert/SKILL.md) — Key-value database patterns.
