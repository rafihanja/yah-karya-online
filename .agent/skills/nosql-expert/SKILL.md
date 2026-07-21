---
name: nosql-expert
description: Expert guidance for distributed NoSQL databases (Cassandra, DynamoDB). Focuses on mental models, query-first modeling, single-table design, and avoiding hot partitions.
risk: medium (hot partitioning, expensive scan queries, eventual consistency data drifts)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# NoSQL Expert

> **One-liner:** Guidelines for modeling query-first NoSQL database schemas, configuring partition keys to prevent hot partitions, implementing single-table designs, and querying secondary indexes.

## When to Use

- When designing distributed database schemas for key-value (AWS DynamoDB) or wide-column (Apache Cassandra, ScyllaDB) stores.
- When setting up secondary indexes, partition hashing keys, or local sort keys.
- When refactoring single-node relational tables into horizontally scalable, denormalized NoSQL layouts.

## Why This Exists

Relational databases model data structures first, then construct queries. In distributed NoSQL databases, query-first modeling is mandatory. If you model tables relationally and join them at runtime in application code, read latency spikes and API gateways timeout. Additionally, choosing partition keys with low cardinality (such as `status` or `gender`) concentrates all write/read traffic onto a single database shard (creating a "hot partition"), which limits cluster performance. Enforcing query-first denormalization, high-cardinality keys, and single-table adjacency lists ensures low-latency performance at scale.

## ALWAYS DO THIS

- **Model schemas based on access patterns** — Map every application query pattern to a specific partition key and sort key structure before creating tables.
- **Select high-cardinality partition keys** — Use unique attributes (like UUIDs or composite hashes) to distribute data evenly across physical nodes.
- **Use single-table design for joins** — Store multiple related entity types in a single table, using composite PK/SK structures (e.g. `PK: USER#101`, `SK: ORDER#202`) to fetch pre-joined records in a single query.
- **Eagerly denormalize database records** — Duplicate user or profile data across child records during writes to optimize read queries, rather than executing joins in code.
- **Implement TTL for automatic data cleanup** — Set Time-To-Live columns on logs, analytics, or session keys to let the database handle cleanup without tombstones.

## NEVER DO THIS

- ❌ **DO NOT** query database tables using full scans (e.g., SQL-like queries without a partition key filter, or using `Scan` in DynamoDB). **Why fails:** Scans read every row in the database, consuming high amounts of read units, causing query timeouts, and locking tables as the dataset grows. **Instead:** Always query using specific partition key lookups.
- ❌ **DO NOT** use low-cardinality properties (such as `is_active` or `gender`) as partition keys. **Why fails:** Routes all queries to a single storage shard, creating a hot partition that throttles throughput while other nodes remain idle. **Instead:** Use composite hashes or unique user IDs as keys.
- ❌ **DO NOT** create multiple separate tables and attempt to join them manually in application loops. **Why fails:** Triggers multiple network round-trips to the database, resulting in N+1 read latency and slow API responses. **Instead:** Model records in a single table using adjacency lists.
- ❌ **DO NOT** delete records frequently in wide-column databases like Apache Cassandra. **Why fails:** Deletes write a "tombstone" marker that remains on disk; high-velocity delete patterns force the query engine to scan millions of tombstones, causing query timeouts. **Instead:** Use Time-To-Live (TTL) expiration rules.

---

## Single-Table Design Data Fetching

Storing different record types in the same partition allows pre-joined read lookups:

```
[Database Query: PK="USER#101"] ──> [Single Network Fetch] ──> [Returns: 1 User Profile + 3 User Orders]
```

---

## Examples

### ✅ Good — DynamoDB Single-Table Design and Query Execution

#### 1. Single-Table Data Layout Mockup
| PK (Partition Key) | SK (Sort Key) | Type | Attributes... |
| :--- | :--- | :--- | :--- |
| `USER#usr_999` | `METADATA` | User | `{ name: "Ian", email: "ian@app.com" }` |
| `USER#usr_999` | `ORDER#ord_001` | Order | `{ total: 89.99, status: "SHIPPED", date: "2026-06-29" }` |
| `USER#usr_999` | `ORDER#ord_002` | Order | `{ total: 15.50, status: "PENDING", date: "2026-06-29" }` |

#### 2. Query Implementation in Node.js (AWS SDK v3)
```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new Client();
const docClient = DynamoDBDocumentClient.from(client);

interface UserProfile {
  name: string;
  email: string;
}

interface Order {
  total: number;
  status: string;
  date: string;
}

export async function fetchUserAndOrders(userId: string) {
  // Query a single partition key to retrieve both user and order entities
  const command = new QueryCommand({
    TableName: "ProductionSingleTable",
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": `USER#${userId}`
    }
  });

  const response = await docClient.send(command);
  const items = response.Items || [];

  let profile: UserProfile | null = null;
  const orders: Order[] = [];

  for (const item of items) {
    if (item.SK === "METADATA") {
      profile = { name: item.name, email: item.email };
    } else if (item.SK.startsWith("ORDER#")) {
      orders.push({
        total: item.total,
        status: item.status,
        date: item.date
      });
    }
  }

  return { profile, orders };
}
```

Why this passes: Implements single-table design patterns, routes database reads through specific partition key queries, denormalizes records, and avoids scans or code-level joins.

### ❌ Bad — Multi-Table Scans, Low-Cardinality Keys, and Code-Level Joins

```typescript
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

// ERROR 1: Designing separate tables and joining them in code
export async function badGetOrdersAndUser(userId: string) {
  // Query 1: Get User from separate Users table
  const user = await client.send(new GetItemCommand({ TableName: "Users", Key: { id: { S: userId } } }));

  // ERROR 2: Executing Scan Command to search the entire Orders table
  const scanCommand = new ScanCommand({
    TableName: "Orders",
    // ERROR 3: Filtering without a partition key forces full table scans
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": { S: userId }
    }
  });
  
  const orders = await client.send(scanCommand);
  return { user, orders };
}
```

Why this fails: Splts entities across multiple tables, scans the database table without partition keys, and triggers code-level joins.

---

## Failure Modes

- **The Single-Shard Bottleneck:** Using partition keys with low cardinality, throttling database writes to a single storage node.
- **The Scan Budget Burn:** Running scan commands on large tables in production, exhausting read units and driving up costs.
- **The Partition Size Overflow:** Designing schemas that group growing datasets (like transaction history logs) in a single partition, exceeding the 10GB partition size limit.
- **The Write Amplification Spiral:** Denormalizing data too aggressively across many tables, causing write operations to slow down.
- **The Tombstone Read Timeout:** Deleting high volumes of data in Cassandra without TTL configurations, causing read queries to time out.

## Validation

Verify NoSQL schema configurations and query performance:

1. **Verify that no table Scan operations exist in code routes:**
   Check code files for scan commands:
   ```bash
   grep -rn "ScanCommand" src/ lib/ 2>/dev/null
   # expected: zero matches in production query paths. Scans should only run in admin scripts.
   ```
2. **Verify that partition keys are based on high-cardinality fields:**
   Verify schema key definitions:
   ```bash
   grep -rn "PartitionKey" infra/terraform/ 2>/dev/null
   # expected: keys use unique IDs (user_id, device_id), not low-cardinality status codes.
   ```
3. **Audit DynamoDB schema metrics using AWS CLI:**
   ```bash
   aws dynamodb describe-table --table-name ProductionSingleTable --query "Table.KeySchema"
   # expected: PK/SK schemas match configured access patterns.
   ```
4. **Identify hot partitions using AWS CloudWatch metrics:**
   Monitor `ConsumedReadCapacityUnits` and `ConsumedWriteCapacityUnits` across partition keys to verify traffic is distributed evenly.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk merancang NoSQL database:

> "Use the skill `nosql-expert`. Read `.agent/skills/nosql-expert/SKILL.md` before coding. Never write queries that trigger table-wide Scan operations or use low-cardinality partition keys. Always design schemas based on query access patterns, use composite PK/SK structures for single-table designs, and verify key distribution rules."

## Related

- [database-design](../database-design/SKILL.md) — Normalization principles.
- [database](../database/SKILL.md) — Transactional schema updates.
- [redis](../redis/SKILL.md) — Cache storage rules.
