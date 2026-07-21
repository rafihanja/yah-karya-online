---
name: playwright
description: Framework for Web Testing and Automation. Allows testing Chromium, Firefox, and WebKit with a single API.
risk: medium (E2E browser testing execution, screenshot comparators, local network triggers)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Playwright Browser Automation

> **One-liner:** Guidelines for writing robust E2E browser tests using role-based locators, Page Object Models, and auto-waiting assertions to verify web flows.

## When to Use

- When writing E2E or integration tests verifying user flows (e.g. login, checkout).
- When automating UI assertions, forms submissions, and file upload validations.
- When executing cross-browser sanity testing (Chromium, Firefox, WebKit) in CI/CD pipelines.

## Why This Exists

E2E tests written with old tools (like Selenium) are notoriously flaky because they rely on manual timeout delays and fragile CSS selector structures. When developers hardcode wait durations or select elements using nested tags (like `div > button:nth-child(2)`), minor visual restyling breaks the test suite. Playwright's auto-waiting mechanism combined with semantic role selectors makes tests resilient to design updates.

## ALWAYS DO THIS

- **Use accessible semantic selectors** — Target interactive elements using `getByRole`, `getByLabel`, `getByPlaceholder`, or `getByText` to verify real accessibility structures.
- **Enforce auto-waiting assertions** — Rely on Playwright's `expect(locator).toBeVisible()` or `expect(locator).toHaveText()` assertions to handle element loading schedules.
- **Group tests into isolated blocks** — Structure related scenarios using `test.describe` and configure database teardowns in `test.beforeEach` blocks.
- **Manage page logic in Page Object Models (POM)** — Encapsulate page selector locators and action flows inside modular POM classes.
- **Verify parallel independence** — Design tests to run concurrently by ensuring each scenario operates with a clean, isolated browser context.

## NEVER DO THIS

- ❌ **DO NOT** use static sleep commands (like `page.waitForTimeout(5000)` or custom timeouts) to wait for elements to load. **Why fails:** Slows down tests, causes flakiness in loaded CI environments, and increases execution costs. **Instead:** Assert against element states using auto-waiting locators or use `locator.waitFor()`.
- ❌ **DO NOT** target nodes using raw class names or deeply nested CSS paths (e.g., `.btn-orange > span:nth-child(3)`). **Why fails:** Minor CSS layout restructuring breaks tests instantly, resulting in constant test maintenance. **Instead:** Locate by accessible name (e.g., `page.getByRole('button', { name: 'Submit' })`).
- ❌ **DO NOT** write scenarios that depend on state changes from previous tests. **Why fails:** Test runners execute files concurrently or in random order, causing dependent tests to fail. **Instead:** Initialize necessary state (like seeding dummy users or database configurations) inside `beforeEach` setups.
- ❌ **DO NOT** store plain-text production passwords inside local test files or commit them to Git. **Why fails:** Exposes production databases and cloud targets to potential compromise. **Instead:** Inject test user credentials using environment variables.

---

## Page Object Model (POM) Structure

Using Page Objects segregates tests from underlying selectors, facilitating maintenance:

```
[Test Script] ── calls action ──> [Page Object Model (POM)] ── interacts ──> [Web Page]
```

---

## Examples

### ✅ Good — Locator Scopes, POM structures, and Auto-Wait Assertions

```typescript
import { test, expect, Page } from "@playwright/test";

// 1. Establish modular Page Object Model
export class DashboardPage {
  readonly page: Page;
  readonly heading: any;
  readonly logoutButton: any;

  constructor(page: Page) {
    this.page = page;
    // Bind locators using role-based semantic selectors
    this.heading = page.getByRole("heading", { name: "User Dashboard" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
  }

  async logout() {
    await this.logoutButton.click();
  }
}

// 2. Standardized E2E script run
test.describe("Dashboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate user or configure environment
    await page.goto("/dashboard");
  });

  test("should load user statistics panel cleanly", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    
    // Playwright automatically waits for the heading to become visible before asserting
    await expect(dashboard.heading).toBeVisible();
    
    // Target nested widgets securely by scoping locators
    const statWidget = page.locator("[data-testid='stats-card']");
    await expect(statWidget.getByText("Active Users: 1,240")).toBeVisible();
  });
});
```

Why this passes: Encapsulates page mappings inside POM classes, scopes locators using test-ids and accessible texts, and utilizes auto-waiting assertions.

### ❌ Bad — Class-Based Selectors, Fragile Selectors, and Static Delays

```typescript
import { test, expect } from "@playwright/test";

test("login test unoptimized", async ({ page }) => {
  await page.goto("/login");

  // ERROR 1: Targeting elements using fragile class structures
  await page.locator(".form-container > div:nth-child(2) > input").fill("user@test.com");
  await page.locator(".pw-input-field").fill("password123");
  
  // ERROR 2: Clicking non-accessible structural tags
  await page.locator(".submit-btn-panel").click();

  // ERROR 3: Adding static timeout delays (flaky and slow)
  await page.waitForTimeout(5000); 

  // ERROR 4: Vague layout validation assertions
  const url = page.url();
  expect(url.endsWith("/dashboard")).toBe(true);
});
```

Why this fails: Targets inputs using complex selectors, uses static timeout delays, and uses loose string matching for URL assertions.

---

## Failure Modes

- **The Flaky Timer:** Using `waitForTimeout` because a slow network causes tests to fail in CI pipelines.
- **Concurrently Clashing States:** Parallel tests sharing the same backend database user record, leading to database lock errors.
- **The DOM Shift Breakage:** Minor visual updates breaking selector paths like `div > span > input`.

## Validation

Cara memverifikasi kepatuhan penggunaan `playwright`:

1. **Verify that no static timeout statements exist:**
   Scan for manual sleep commands:
   ```bash
   grep -rn "waitForTimeout" tests/
   # Expected: no matches found
   ```
2. **Execute Playwright test suite:**
   Ensure tests run cleanly in headless mode:
   ```bash
   npx playwright test
   # Expected: all browser profiles return success
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis E2E tests:

> "Use the skill `playwright`. Read `.agent/skills/playwright/SKILL.md` before coding. Never write static wait timeouts or nested CSS paths. Always structure locators using roles or test-ids, wrap views in Page Object Models, and write isolated parallel test scripts."

## Related

- [webapp-testing](../webapp-testing/SKILL.md) — Node-specific execution routines.
- [javascript-testing-patterns](../javascript-testing-patterns/SKILL.md) — Custom mocks patterns.
- [verification-before-completion](../verification-before-completion/SKILL.md) — E2E check validation.
