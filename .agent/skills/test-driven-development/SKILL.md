---
name: test-driven-development
description: Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle.
risk: medium (code structure changes, testing harness configuration, test quality)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Test-Driven Development (TDD)

> **One-liner:** Guidelines for enforcing the Red-Green-Refactor cycle to build clean, maintainable logic protected by isolated unit test harnesses.

## When to Use

- When writing core business logic (e.g. price calculations, permission resolvers).
- When patching bugs (recreate the bug with a failing test first, then fix it).
- When refactoring legacy logic to ensure no behavioral changes are introduced.

## Why This Exists

Writing tests after writing code often leads to untestable architecture, skipped edge cases, or biased tests designed to pass the current implementation. By reversing the process—writing a failing test first—you clarify the requirements before coding, decouple logic layers from external dependencies, and create a safety net that permits fearless code refactoring.

## ALWAYS DO THIS

- **Follow the Red-Green-Refactor cycle** — Write a failing test (Red), implement the minimum code to pass (Green), then optimize the codebase structure (Refactor).
- **Mock external dependencies** — Stub database connections, HTTP calls, and system-level operations using mock adapters to keep tests fast (milliseconds).
- **Verify test failures** — Confirm that your test fails for the expected reason in the Red phase before writing any implementation code.
- **Write descriptive test cases** — Structure test cases using the Arrange-Act-Assert format to clarify intent and behavior.
- **Maintain high code coverage** — Cover critical execution paths, validation rules, and error handlers with isolated unit tests.

## NEVER DO THIS

- ❌ **DO NOT** write application code without writing the test first. **Why fails:** Results in code that is hard to test and tightly coupled to framework implementations. **Instead:** Write a minimal failing test case before implementing features.
- ❌ **DO NOT** execute database queries against production or shared local database instances during unit tests. **Why fails:** Introduces slow test runs, shared state contamination, and unpredictable test results. **Instead:** Mock the database layer or use an in-memory database instance.
- ❌ **DO NOT** skip the Refactor phase once the test turns green. **Why fails:** Leads to accumulation of duplicate code, messy functions, and technical debt. **Instead:** Clean up variable names, extract utilities, and simplify nested logic immediately after passing.
- ❌ **DO NOT** write assertions that test implementation details (like checking private variable states or internal helper calls). **Why fails:** Makes tests fragile, causing them to break during refactoring even when user-facing behavior is correct. **Instead:** Assert against public function inputs and outputs.

---

## The TDD Cycle

```
[RED] Write Failing Test ──> [GREEN] Write Minimum Code ──> [REFACTOR] Clean Code
```

---

## Examples

### ✅ Good — Complete Red-Green-Refactor Cycle

```typescript
// 1. Arrange & Act in Test Suite (failing first in RED phase)
import { calculateDiscount } from "./pricing";

describe("calculateDiscount", () => {
  it("should apply 10% discount for orders above $100", () => {
    // Arrange
    const orderTotal = 120;
    
    // Act
    const discount = calculateDiscount(orderTotal);
    
    // Assert
    expect(discount).toBe(12);
  });
  
  it("should apply 0% discount for orders below $100", () => {
    expect(calculateDiscount(80)).toBe(0);
  });
});

// 2. Minimum implementation code (GREEN phase)
export function calculateDiscount(total: number): number {
  if (total > 100) {
    return total * 0.1;
  }
  return 0;
}

// 3. Clean structure with constants (REFACTOR phase)
const DISCOUNT_THRESHOLD = 100;
const DISCOUNT_RATE = 0.1;

export function calculateDiscountRefactored(total: number): number {
  return total > DISCOUNT_THRESHOLD ? total * DISCOUNT_RATE : 0;
}
```

Why this passes: Establishes clear test specs, implements minimal code to verify, and refactors logic using clean constants under the green test shield.

### ❌ Bad — Code-First Writing and Live DB Interactions

```typescript
// ERROR 1: Writing implementation code first without tests
export async function getUserTotal(userId: string): Promise<number> {
  // ERROR 2: Connecting directly to a live production database target inside code
  const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`); 
  return user.total;
}

// ERROR 3: Writing tests after code that query the actual database
import { getUserTotal } from "./userService";

describe("getUserTotal", () => {
  it("works", async () => {
    const res = await getUserTotal("101"); // Fragile: depends on database state
    expect(res).toBeGreaterThan(0);
  });
});
```

Why this fails: Writes tests after the code, interacts with a live database instead of mock fixtures, and lacks clear behavioral assertions.

---

## Failure Modes

- **The Missing Red Phase:** Writing a test that accidentally passes before writing the code, indicating the test is not verifying the targeted logic.
- **Mock-Everything Trap:** Mocking so many internal dependencies that the test no longer verifies integration compatibility.
- **Refactoring without Tests:** Attempting to clean up large structural blocks before writing test harnesses, causing regressions.

## Validation

Cara memverifikasi kepatuhan penggunaan `test-driven-development`:

1. **Verify that unit tests run without live database dependencies:**
   Check test configs for database setup mocks:
   ```bash
   grep -rn "jest.mock" src/
   ```
2. **Execute test suite and verify clean outputs:**
   Ensure tests run successfully:
   ```bash
   npm run test
   # Expected: pass results with no connection leaks
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan TDD:

> "Use the skill `test-driven-development`. Read `.agent/skills/test-driven-development/SKILL.md` before coding. Never write logic files before writing failing test suites. Always mock databases/APIs, assert inputs/outputs, and perform clean refactor cycles once tests turn green."

## Related

- [javascript-testing-patterns](../javascript-testing-patterns/SKILL.md) — Assertion patterns.
- [webapp-testing](../webapp-testing/SKILL.md) — Playwright test setups.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Verification gate checks.
