---
name: api-design-principles
description: Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs.
risk: medium (breaking API contract modifications, bad status mapping, insecure query filters)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# API Design Principles

> **One-liner:** Guidelines for designing developer-friendly REST APIs, establishing consistent JSON response envelopes, implementing cursor pagination, and mapping correct HTTP status codes.

## When to Use

- When planning new public or internal RESTful endpoints, data models, or contracts.
- When structuring paginated listings, search parameters, or bulk resource exports.
- When configuring global error formatting schemas for API response middlewares.

## Why This Exists

Inconsistent API contracts frustrate developers and lead to brittle client integrations. Common issues include mixing verbs and nouns in URL paths (e.g. `POST /getUserList`), returning `200 OK` status codes for server errors, or using unstructured JSON formats that wrap data inconsistently. Enforcing semantic paths, standard status codes, and consistent payload structures ensures that APIs are easy to use and scale.

## ALWAYS DO THIS

- **Use plural nouns for resource paths** — Design RESTful URLs using plural resource names (e.g. `/api/v1/users`) rather than verbs. Use HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to define the action.
- **Wrap payloads in standardized envelopes** — Standardize JSON structures so they always include top-level properties like `success`, `data` (for payloads), and `error` (for failures).
- **Return accurate HTTP status codes** — Map outcomes to correct status codes (e.g. `201 Created` for resource creation, `409 Conflict` for duplicate records, `422 Unprocessable Entity` for validation failures).
- **Implement cursor-based pagination** — Use cursor tokens (`starting_after` or base64 hashes) instead of offset-based pagination for large datasets to prevent item duplication.
- **Enforce path versioning** — Include version prefixes (e.g. `/api/v1/`) in URL paths to prevent breaking changes on frontend consumers.

## NEVER DO THIS

- ❌ **DO NOT** embed action verbs inside REST path URLs (e.g. `POST /api/v1/deleteUser?id=10`). **Why fails:** Violates REST principles, leading to inconsistent routes and making it difficult to leverage HTTP caching. **Instead:** Use semantic plural paths combined with HTTP verbs (e.g., `DELETE /api/v1/users/10`).
- ❌ **DO NOT** return `200 OK` status codes for requests that encounter server or validation errors. **Why fails:** Client applications assume the request was successful because of the status code, bypass error handlers, and attempt to parse empty or invalid data, causing frontend crashes. **Instead:** Return appropriate status codes (like `400 Bad Request` or `500 Internal Server Error`).
- ❌ **DO NOT** use offset-based pagination (`LIMIT 10 OFFSET 50`) for datasets that are updated frequently. **Why fails:** If new items are added while a user is browsing, the database offsets shift, causing items to be duplicated or missed across page loads. **Instead:** Implement cursor-based pagination (`starting_after=ID`).
- ❌ **DO NOT** return bare arrays as top-level JSON responses (e.g., `[ { "id": 1 } ]`). **Why fails:** Restricts future API enhancements, as you cannot add metadata properties (like pagination info or execution times) without breaking existing client integrations. **Instead:** Wrap lists inside a parent envelope object (e.g., `{ "data": [ { "id": 1 } ] }`).

---

## RESTful Routing Mapping

Map semantic resource endpoints to standard HTTP verbs and status codes:

```
[Client Request] ── GET    /v1/orders     ──> [List Orders]      ──> [200 OK]
                 ── POST   /v1/orders     ──> [Create Order]     ──> [201 Created]
                 ── DELETE /v1/orders/:id ──> [Cancel Order]     ──> [204 No Content]
```

---

## Examples

### ✅ Good — Structured REST Routing, Standardized Envelopes, and Cursor Pagination

```typescript
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

interface Product {
  id: string;
  name: string;
}

// Simulated database listing
const mockProducts: Product[] = Array.from({ length: 100 }, (_, i) => ({
  id: `prod_${i + 1}`,
  name: `Premium Product ${i + 1}`
}));

// GET /api/v1/products - Cursor-based paginated resource listing
app.get("/api/v1/products", (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string || "10", 10), 100);
  const startingAfter = req.query.starting_after as string;

  let startIndex = 0;
  if (startingAfter) {
    const foundIdx = mockProducts.findIndex((p) => p.id === startingAfter);
    if (foundIdx !== -1) {
      startIndex = foundIdx + 1;
    }
  }

  const items = mockProducts.slice(startIndex, startIndex + limit);
  const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

  // 1. Return 200 OK with standardized envelope structure
  res.status(200).json({
    success: true,
    data: items,
    pagination: {
      limit,
      starting_after: startingAfter || null,
      next_cursor: nextCursor,
      has_more: startIndex + limit < mockProducts.length
    }
  });
});

// POST /api/v1/products - Resource creation route
app.post("/api/v1/products", (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    // 2. Return 422 for validation/semantic issues
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_FAILED",
        message: "Product name is required",
        details: [{ field: "name", issue: "cannot be empty" }]
      }
    });
  }

  const newProduct = { id: `prod_${Date.now()}`, name };
  
  // 3. Return 201 Created for resource creation
  res.status(201).json({
    success: true,
    data: newProduct
  });
});
```

Why this passes: Uses plural nouns for resource paths, wraps lists in object envelopes, includes pagination metadata, maps correct status codes (200, 201, 422), and formats error responses consistently.

### ❌ Bad — Verb Paths, Non-standard Envelopes, and 200 OK Errors

```typescript
import express from "express";

const app = express();
app.use(express.json());

// ERROR 1: Mixing verbs in route paths
app.post("/api/v1/get_product_list", (req, res) => {
  const products = [{ id: "1", name: "Laptop" }];
  
  // ERROR 2: Returning a bare array as a top-level JSON response
  res.status(200).json(products); 
});

// ERROR 3: Using a GET request to create a resource
app.get("/api/v1/createProduct", (req, res) => {
  const name = req.query.name as string;
  
  if (!name) {
    // ERROR 4: Returning 200 OK for validation errors
    return res.status(200).json({ 
      status: "error",
      message: "Required parameter 'name' is missing."
    });
  }

  res.status(200).json({ status: "success", id: "prod_999", name });
});
```

Why this fails: Embeds verbs in routing URLs, returns raw arrays at the top level, uses GET methods for writes, and returns 200 OK codes for validation errors.

---

## Failure Modes

- **The 200 OK Failure Parse:** Clients attempting to render empty tables because a failed API call returned a `200 OK` status code.
- **The Shifted Offset Skip:** Users missing feed posts because offsets shifted when new items were added.
- **The Bare Array Block:** Being unable to add query execution time metrics to response headers because the root response is a bare array.

## Validation

Cara memverifikasi kepatuhan penggunaan `api-design-principles`:

1. **Verify that routing paths are resource-based (no verbs):**
   Verify router code definitions for verb names:
   ```bash
   grep -rn "POST\|GET" src/routes/ | grep -E "create|get|delete|update"
   # Expected: No outputs showing verb actions inside paths.
   ```
2. **Verify HTTP status codes logic:**
   Ensure status returns match target endpoints context:
   ```bash
   grep -rn "res.status(201)" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mendesain API endpoints:

> "Use the skill `api-design-principles`. Read `.agent/skills/api-design-principles/SKILL.md` before coding. Never embed action verbs in REST URLs or return 200 OK for validation failures. Always use resource-based plural paths, wrap responses in envelopes, and return accurate HTTP status codes."

## Related

- [backend-architect](../backend-architect/SKILL.md) — Layered code boundaries.
- [backend-dev-guidelines](../backend-dev-guidelines/SKILL.md) — Controller execution routes.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Security routing.
