---
name: javascript-testing-patterns
description: Comprehensive guide for implementing robust testing strategies in JavaScript/TypeScript applications using modern testing frameworks and best practices.
risk: medium (testing setup configurations, mocks injections, async race conditions)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# JavaScript Testing Patterns

> **One-liner:** Guidelines for constructing decoupled JavaScript/TypeScript unit and integration test suites using Jest/Vitest mock features and asynchronous wait assertions.

## When to Use

- When writing unit tests for frontend components (React, Vue) or backend services (Node, NestJS).
- When configuring mock handlers for external REST/GraphQL APIs (e.g. Mock Service Worker).
- When resolving flaky async tests, microtask queues, or simulated time delays.

## Why This Exists

If developer test suites rely on live third-party network APIs or direct database instances, tests fail due to external outages or local state collisions. In frontend component testing, asserting element visibility immediately after firing user events causes tests to fail because virtual DOM updates happen asynchronously. Standardizing on mock boundaries and async wait timers guarantees predictable, fast, and repeatable test runs.

## ALWAYS DO THIS

- **Verify asynchronous rendering with `waitFor`** — Use testing library wait helpers (like `waitFor` or `findBy`) to poll for DOM changes after user event simulations.
- **Implement Mock Service Worker (MSW) for API calls** — Intercept network-level traffic using MSW rather than stubbing global `fetch` objects, ensuring realistic browser network behavior.
- **Isolate test files from shared mutable states** — Reset mock calls and clean up test structures inside `afterEach` hooks.
- **Enforce strict typing in test mocks** — Declare typed mock definitions (e.g., `jest.MockedFunction<...>` or Vitest equivalent) to maintain compiler safety.
- **Mock native time events using fake timers** — Control clock executions (like `setTimeout` or `setInterval`) using Jest/Vitest utility functions (`jest.useFakeTimers()`).

## NEVER DO THIS

- ❌ **DO NOT** trigger actual REST/GraphQL endpoints inside unit or component test suites. **Why fails:** Introduces network dependencies that fail during offline runs, slow down execution, and leak test payloads to live staging logs. **Instead:** Mock API requests using MSW or localized mock function stubs.
- ❌ **DO NOT** use static delays (e.g., `await new Promise(r => setTimeout(r, 100))`) to wait for asynchronous component rendering. **Why fails:** Causes tests to run slowly and introduces flakiness when environments experience execution lag. **Instead:** Use async find-by selectors (e.g., `await screen.findByText('Loaded')`).
- ❌ **DO NOT** check internal object fields or private methods inside assertions. **Why fails:** Makes tests highly brittle; minor refactoring of internal helper methods breaks the tests even when public interface inputs and outputs function correctly. **Instead:** Assert only against public return outputs and visible UI structures.
- ❌ **DO NOT** leak mocked module implementations across test files. **Why fails:** Pollutes global caches, leading to side-effects where tests pass when run individually but fail when executed concurrently. **Instead:** Reset mock behaviors after each test run using `jest.restoreAllMocks()` or `vi.restoreAllMocks()`.

---

## E2E Mocking Boundaries

Decouple tests from live services by establishing network interception interceptors:

```
[UI Test Suite] ── fires request ──> [MSW Interceptor / Jest Mock] ── returns mock ──> [Assert Result]
```

---

## Examples

### ✅ Good — Async Component Rendering with Screen Finder and MSW mocks

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { UserProfile } from "./UserProfile";

// 1. Setup Mock Service Worker (MSW) server boundary
const server = setupServer(
  rest.get("/api/user", (req, res, ctx) => {
    return res(ctx.json({ id: "101", name: "Jane Doe" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks(); // Clear calls count
});
afterAll(() => server.close());

describe("<UserProfile />", () => {
  it("should render fetched user name asynchronously", async () => {
    // Arrange
    render(<UserProfile />);
    const fetchButton = screen.getByRole("button", { name: "Fetch User" });

    // Act
    await userEvent.click(fetchButton);

    // Assert: Use async finder which polls the DOM for the update
    const userNameNode = await screen.findByText("User: Jane Doe");
    expect(userNameNode).toBeInTheDocument();
  });
});
```

Why this passes: Intercepts network calls at the protocol layer with MSW, cleans up handlers in `afterEach`, and uses async finder selectors (`findByText`) instead of static timeouts.

### ❌ Bad — Global Fetch Overrides, Hardcoded Sleep delays, and Direct State Checks

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfile } from "./UserProfile";

describe("<UserProfile /> Unoptimized", () => {
  it("fetches user", async () => {
    // ERROR 1: Overwriting global fetch object directly (prone to leaking)
    (global as any).fetch = () =>
      Promise.resolve({
        json: () => Promise.resolve({ name: "Jane Doe" })
      });

    render(<UserProfile />);
    const btn = screen.getByText("Fetch User");
    userEvent.click(btn);

    // ERROR 2: Hardcoding sleep duration to wait for fetch thread to resolve
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ERROR 3: Checking internal state variables instead of public elements
    const element = screen.getByTestId("user-card");
    expect(element.className).toContain("active-card"); // Brittle style check
  });
});
```

Why this fails: Mutates global fetch properties, sleeps statically, and asserts against internal implementation class details.

---

## Failure Modes

- **The Shared Cache Mutator:** Forgetting to clear mocks in `afterEach`, causing assertions in subsequent files to fail because call counts are preserved.
- **Visual Loader Snapshots:** Capturing snapshots or asserting element presence while loading spinners are still active in the DOM.
- **The Fake-Timer Hang:** Using fake timers without executing `jest.runAllTimers()` or restoring real timers, causing subsequent tests to hang.

## Validation

Cara memverifikasi kepatuhan penggunaan `javascript-testing-patterns`:

1. **Verify that global mocks are cleared in suites:**
   Confirm that `afterEach` functions run cleanups:
   ```bash
   grep -rn "clearAllMocks" src/
   # Confirm configurations exist
   ```
2. **Execute test coverage reports:**
   Verify code coverage metrics:
   ```bash
   npm run test -- --coverage
   # Expected: pass results with coverage data
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi testing patterns:

> "Use the skill `javascript-testing-patterns`. Read `.agent/skills/javascript-testing-patterns/SKILL.md` before coding. Never intercept APIs via global variable overrides or write static waits. Always mock API targets using MSW, clean mock allocations in afterEach, and resolve async renders using findBy assertions."

## Related

- [test-driven-development](../test-driven-development/SKILL.md) — TDD cycle steps.
- [webapp-testing](../webapp-testing/SKILL.md) — Python automation.
- [playwright](../playwright/SKILL.md) — Page object tests.
