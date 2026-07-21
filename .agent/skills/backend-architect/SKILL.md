---
name: backend-architect
description: Master software architect specializing in modern architecture, microservices, and clean code.
risk: low (architectural patterns definition, structural guidelines)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Backend Architect

> **One-liner:** Guidelines for enforcing Separation of Concerns (SoC) in backend services, partitioning code layers (Controller, Service, Repository), and maintaining stateless execution.

## When to Use

- When structuring the architecture layout of a new backend service or microservice.
- When refactoring existing spaghetti codebases to separate business logic from routing layers.
- When implementing clean code principles, Dependency Injection, and architectural design patterns.

## Why This Exists

If a backend application mixes routing parameters, validation logic, database queries, and business calculations in a single function, the system becomes difficult to maintain. Furthermore, direct database access from controllers blocks unit testing, since mocks cannot easily isolate the components. Enforcing decoupled layers and stateless endpoints ensures that backend components are testable, modular, and easy to scale.

## ALWAYS DO THIS

- **Enforce Separation of Concerns** — Structure services into three distinct layers: Controllers (HTTP parsing), Services (business rules), and Repositories (database access).
- **Use Data Transfer Objects (DTOs)** — Define explicit type interfaces or validation schemas (using Zod or Class-Validator) to sanitize incoming request bodies.
- **Maintain stateless execution** — Store active session data inside central caches (like Redis) rather than in-memory server variables, allowing services to scale horizontally.
- **Implement Dependency Injection** — Inject repository interfaces into service constructors instead of hardcoding database instances.
- **Handle graceful shutdown signals** — Register listeners for termination signals (`SIGINT`, `SIGTERM`) to close database pools and connection streams cleanly before the process exits.

## NEVER DO THIS

- ❌ **DO NOT** embed business logic calculations or string manipulation algorithms directly inside route controllers. **Why fails:** Makes business logic non-reusable across other endpoints and blocks unit testing by coupling logic to the HTTP request cycle. **Instead:** Delegate business logic to dedicated Service classes.
- ❌ **DO NOT** query database tables or execute raw SQL commands directly inside controllers or routing handlers. **Why fails:** Bypasses security layers, leaks database schemas into the HTTP transport layer, and prevents unit testing without an active database connection. **Instead:** Access data using Repository layers or Data Access Objects (DAOs).
- ❌ **DO NOT** store user session states in local variables on the server. **Why fails:** If the service is deployed behind a load balancer with multiple instances, requests from the same user will hit different servers, resulting in random session drops. **Instead:** Use JWTs or store active session states in shared Redis clusters.
- ❌ **DO NOT** initialize network client connections (like HTTP, Database, or Redis) inside helper functions on every request. **Why fails:** Repeatedly opening and closing connections exhausts socket descriptors, causing connection failures under high traffic. **Instead:** Initialize clients once at startup and reuse connection pools.

---

## Clean Architecture Layer Separation

Decoupling route endpoints from queries makes the system modular and testable:

```
[HTTP Request] ──> [Controller (Validate DTO)] ──> [Service (Process Logic)] ──> [Repository (Query DB)]
```

---

## Examples

### ✅ Good — Clean Layer Separation with Zod Validation, Services, and Repositories

#### 1. Data Transfer Object & Schema
```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
```

#### 2. Repository Layer (Database Access Only)
```typescript
import { DatabaseConnection } from "../db";

export class UserRepository {
  constructor(private db: DatabaseConnection) {}

  async findByEmail(email: string) {
    return this.db.query("SELECT * FROM users WHERE email = $1", [email]);
  }

  async save(user: CreateUserDTO) {
    return this.db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", [
      user.email,
      user.password
    ]);
  }
}
```

#### 3. Service Layer (Business Logic Only)
```typescript
import { UserRepository } from "./user.repository";
import { CreateUserDTO } from "./user.dto";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async registerUser(dto: CreateUserDTO) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing.length > 0) {
      throw new Error("Email already registered");
    }
    // Business logic: Hashing, validation checks, account creation triggers
    return this.userRepo.save(dto);
  }
}
```

#### 4. Controller Layer (HTTP Transport Only)
```typescript
import { Request, Response } from "express";
import { UserService } from "./user.service";
import { CreateUserSchema } from "./user.dto";

export class UserController {
  constructor(private userService: UserService) {}

  handleRegister = async (req: Request, res: Response) => {
    try {
      // 1. Validate DTO input structure
      const validatedData = CreateUserSchema.parse(req.body);
      
      // 2. Delegate execution to Service
      const newUser = await this.userService.registerUser(validatedData);
      
      res.status(201).json(newUser);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}
```

Why this passes: Separates DTO validation from business logic, abstracts queries into a repository layer, uses dependency injection, handles errors at the controller level, and remains stateless.

### ❌ Bad — Combined Spaghetti Code inside Route Handlers

```typescript
import express from "express";
import { Pool } from "pg";

const app = express();
const dbPool = new Pool();

// ERROR 1: Business logic, database queries, and routing logic are combined in a single file
app.post("/users", async (req, res) => {
  const { email, password } = req.body;

  // ERROR 2: Missing DTO validation schemas (crashes if body parameters are missing)
  if (!email.includes("@")) {
    return res.status(400).send("Invalid email");
  }

  // ERROR 3: Direct database query from route controller
  const existing = await dbPool.query("SELECT * FROM users WHERE email = $1", [email]);
  
  if (existing.rows.length > 0) {
    // ERROR 4: Handling business exceptions inside the HTTP routing handler
    return res.status(400).send("Email exists");
  }

  const result = await dbPool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
    email,
    password
  ]);

  res.status(201).send(result);
});
```

Why this fails: Combines routing, validation, and database operations in a single block, lacks testable boundaries, accesses raw database pools directly, and does not use type validation schemas.

---

## Failure Modes

- **The Database-Coupled Controller:** Writing SQL query calls inside controllers, which breaks unit testing.
- **The Local Variable Session:** Storing authenticated user sessions in local variable maps, causing session drops when scaling to multiple servers.
- **The Validation Bypass:** Processing parameters directly from `req.body` without schema validation, leading to database schema insertion crashes.

## Validation

Cara memverifikasi kepatuhan penggunaan `backend-architect`:

1. **Verify separation of code files:**
   Ensure database access calls are not placed in controller directories:
   ```bash
   grep -rn "SELECT " src/controllers/
   # Expected: No output. Database query triggers must reside in repository folders.
   ```
2. **Verify DTO schema usage:**
   Check controllers for validation schema checks:
   ```bash
   grep -rn "Schema.parse" src/controllers/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menyusun arsitektur backend:

> "Use the skill `backend-architect`. Read `.agent/skills/backend-architect/SKILL.md` before coding. Never write raw database queries or business calculations inside controllers. Always decouple code into Controllers, Services, and Repositories, validate DTO schemas on start, and design stateless routing handlers."

## Related

- [backend-dev-guidelines](../backend-dev-guidelines/SKILL.md) — Node backend patterns.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Node-specific structures.
- [api-design-principles](../api-design-principles/SKILL.md) — API transport logic guidelines.
