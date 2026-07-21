---
name: typescript-expert
description: TypeScript and JavaScript expert with type-level programming, performance optimization, and modular configurations.
risk: safe
source: "Elite Agent Operations - Batch 3F (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# TypeScript & Type-Level Architecture

> **One-liner:** Guidelines for constructing strict type systems, enforcing nominal branded typings, mitigating recursion performance lag, and validating compilation.

## When to Use

- When developing type-safe abstractions, generic utility layers, and library APIs.
- When configuring workspace parameters inside `tsconfig.json` compiler files.
- When diagnosing compilation performance lag, type instantiation depth errors, or ESM module resolution issues.

## Why This Exists

Loose or unchecked type systems lead to runtime failures and slow compilation. If developers use `any`, map infinite recursion types, or ignore null checking configurations, applications become unstable. Enforcing strict compiler options (such as `strict: true` and `noUncheckedIndexedAccess`), defining branded domain primitives, and splitting complex interfaces keeps typings solid and fast.

## ALWAYS DO THIS

- **Enable strict compiler configuration rules** — Turn on critical type safety options (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`) in all workspace `tsconfig.json` configurations.
- **Implement Nominal Branded Types for identifiers** — Secure sensitive domain primitive fields (UserId, OrderId) using branded nominal wrappers to prevent parameter type mixes.
- **Pair branded types with runtime parsers (Zod / Valibot)** — Compile-time brands offer **zero** protection against JSON payloads from `fetch`, DB drivers, or `req.body`. Wrap every system boundary with a runtime schema that produces the branded value, otherwise the brand is theatre.
- **Set clear bounds on recursive types** — Limit type nesting depth structures (e.g. max 10 loops) to avoid tsc compiler stack overflow crashes.
- **Isolate third-party types using ambient declaration files** — Place custom external modules typings inside ambient files (`.d.ts`) to manage untyped packages cleanly.
- **Enable incremental compilation caching** — Accelerate build-time checks by turning on `incremental` and `skipLibCheck` properties in the tsconfig.

## NEVER DO THIS

- ❌ **DO NOT** use the `any` keyword to bypass compile-time exceptions. **Why fails:** Disables type analysis, converting TS files back into fragile JavaScript and causing runtime type errors. **Instead:** Enforce the `unknown` type and validate shapes using type guards.
- ❌ **DO NOT** use type assertions (`as`) to force mismatching variable mappings. **Why fails:** Masks typing failures during compilation, leading to runtime failures. **Instead:** Implement proper type narrowers, predicates, or schemas validation.
- ❌ **DO NOT** use nested intersection combinations (`&`) to merge large recursive objects. **Why fails:** Degrades type-checking speed, causing IDE lag and compiler out-of-memory errors. **Instead:** Inherit properties cleanly using `interface` extensions.
- ❌ **DO NOT** hardcode runtime absolute directory paths mapping inside imports. **Why fails:** Breaks modular compilations, causing runtime ESM import errors. **Instead:** Configure compiler path mappings (`paths`) and resolve them using bundlers.

---

## TypeScript Compilation & Resolution Pipeline

Analyzing type constraints, resolving modules, and testing safety:

```
[tsconfig.json (Strict Rules)] ──> [Type Guard Primitives] ──> [tsc typecheck (noEmit)] ──> [Vitest expectTypeOf]
```

---

## Examples

### ✅ Good — Branded Types, Strict Type Guards, and Type-Level Testing

#### 1. Nominal Domain Types and Safe Guards (`lib/domain.ts`)
```typescript
// 1. Nominal branded type definitions to prevent primitive obsession
export type Brand<K, T> = K & { readonly __brand: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

export interface User {
  id: UserId;
  name: string;
  role: "admin" | "user";
}

// 2. Custom type guard predicate to narrow down types safely
export function isAdmin(user: User): user is User & { role: "admin" } {
  return user.role === "admin";
}

export function processOrder(userId: UserId, orderId: OrderId) {
  // UserId and OrderId are non-interchangeable nominal values
  return { userId, orderId, processedAt: Date.now() };
}
```

#### 2. Type-Level Validation Tests (`tests/domain.test-d.ts`)
```typescript
import { expectTypeOf } from "vitest";
import { User, UserId, OrderId, processOrder } from "@/lib/domain";

test("Verify domain types compliance", () => {
  // Confirm UserId cannot be assigned directly to OrderId
  expectTypeOf<UserId>().not.toEqualTypeOf<OrderId>();
  
  // Confirm processOrder parameters accept only branded primitives
  expectTypeOf(processOrder).parameter(0).toEqualTypeOf<UserId>();
  expectTypeOf(processOrder).parameter(1).toEqualTypeOf<OrderId>();
});
```

Why this passes: Configures nominal branded type constraints, implements clean runtime type guard predicates, and validates type constraints at compile-time using Vitest type tests.

### ❌ Bad — any Bypass, Unchecked Type Assertions, and Deep Intersections

```typescript
// ERROR 1: Using 'any' bypasses the type-checking engine completely
export function badProcess(input: any) {
  // ERROR 2: Unsafe type assertion forces compiler to bypass validations
  const user = input as { id: string; role: string };
  
  // ERROR 3: Accessing unchecked index property triggers runtime crashes
  return user.id.toUpperCase(); 
}

// ERROR 4: Deep intersection of complex models leads to tsc out-of-memory errors
type ComplexA = { name: string; details: { id: number } };
type ComplexB = { age: number; details: { key: string } };
type BadMerge = ComplexA & ComplexB; 
```

Why this fails: Disables type verification using `any`, forces unsafe overrides using `as`, accesses unsafe properties without checks, and merges complex nested types using intersections instead of interface extensions.

---

## Failure Modes

- **The any Bypass Escape:** Bypassing compilation checks using `any`, leading to runtime type failures.
- **The Unsafe Type Cast:** Forcing mismatching types using `as` casts, masking typing issues.
- **The Interface Intersection Bloat:** Merging complex nested types using intersections, causing type-checking lag.
- **The Unchecked Index Crash:** Querying dynamic object indexes without strict checks, causing runtime undefined errors.
- **The Infinite Type Recursion:** Mapping recursive types without depth constraints, crashing the tsc compiler.

## Validation

Verify compiler constraints, type safety configurations, and typing exclusions:

1. **Verify that strict typings rules are active in tsconfig.json:**
   Ensure crucial strict options are enabled:
   ```bash
   grep -rn "strict" tsconfig.json 2>/dev/null
   # expected: Config includes "strict": true.
   ```
2. **Scan codebase for any occurrences:**
   Identify bypassed checks:
   ```bash
   grep -rn ": any" src/ | grep -v "eslint-disable" 2>/dev/null
   # expected: zero matches. Input elements utilize explicit typings or unknown type bounds.
   ```
3. **Verify presence of type tests files:**
   Confirm type-level testing integration:
   ```bash
   find src -name "*.test-d.ts" 2>/dev/null
   # expected: Complex type-level helper modules include test-d specification files.
   ```
4. **Runtime guard — branded types must be produced by a parser, not a cast:**
   Compile-time `as UserId` casts are the same as `any`. Find boundaries that mint brand values without a runtime parser:
   ```bash
   grep -rEn "as (User|Order|Account|Tenant)Id" src/ 2>/dev/null
   # expected: zero matches. All branded values come from z.string().brand<"UserId">().parse(...) or equivalent.
   ```
   Then probe the parser actually rejects bad input:
   ```bash
   node -e "const {z}=require('zod'); const UserId=z.string().uuid().brand('UserId'); try{UserId.parse('not-a-uuid'); console.error('FAIL: accepted bad id')}catch{console.log('OK: rejected')}"
   # expected: "OK: rejected". If "FAIL" — branded type has no runtime protection.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan modificação TypeScript:

> "Use the skill `typescript-expert`. Read `.agent/skills/typescript-expert/SKILL.md` before coding. Never write raw any bypasses or unsafe casts. Always enforce strict compiler checks, nominal branded variables, interface extensions, and type-level test files."

## Related

- [frontend-dev-guidelines](../frontend-dev-guidelines/SKILL.md) — Modular folder structures.
- [javascript-testing-patterns](../javascript-testing-patterns/SKILL.md) — Test integration structures.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Verification run scripts.
