---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.
risk: low (safe analysis, read-only stack trace examinations, diagnostics setup)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Systematic Debugging

> **One-liner:** Guidelines for diagnosing code errors systematically by replicating failures, analyzing stack traces, isolating variables, and executing targeted fixes.

## When to Use

- When encountering runtime application crashes or script execution failures.
- When automated tests fail or return unexpected output.
- When diagnosing logic bugs or performance regressions reported by users.

## Why This Exists

Attempting to fix bugs by making random code changes ("shotgun debugging") without identifying the root cause introduces new regressions, breaks working code, and wastes development time. Systematic debugging requires developers to replicate the error consistently, read the error call stack from top to bottom, and isolate variables to find the exact line causing the crash before writing any code adjustments.

## ALWAYS DO THIS

- **Replicate the failure consistently** — Establish a deterministic set of inputs, commands, or UI actions that trigger the bug before writing a fix.
- **Trace stacks from the top down** — Examine the very first line of the stack trace to locate the exact filename, function, and line number where the error was thrown.
- **Isolate execution variables** — Use divide-and-conquer strategies (such as commenting out helper steps or bypassing middleware layers) to pinpoint the failing component.
- **Clean up debugging statements** — Ensure all diagnostic print statements (like `console.log` or `print()`) are removed or converted to structured logs before committing changes.
- **Add regression tests** — Write a unit test that fails on the bug's original scenario, then verify that your fix makes it pass.

## NEVER DO THIS

- ❌ **DO NOT** make code modifications to fix a bug if you have not identified the exact line of code causing the failure. **Why fails:** Random edits do not address the root cause, leading to code clutter and new regressions. **Instead:** Run diagnostics and read the stack trace to find the root cause.
- ❌ **DO NOT** skip reading the error stack trace when an exception is thrown. **Why fails:** Developers waste time guessing where the error occurred rather than going directly to the file and line. **Instead:** Copy and analyze the stack trace logs.
- ❌ **DO NOT** commit active print statements (`console.log`, `debugger`, `print()`) to the main repository branch. **Why fails:** Pollutes production stdout logs and can leak sensitive information or data schemas to monitoring systems. **Instead:** Clean up diagnostic statements before commits.
- ❌ **DO NOT** verify a fix solely by running the app once and assuming it works. **Why fails:** Edge cases and environmental variables are often missed, causing the bug to recur in production. **Instead:** Write an automated unit or integration regression test.

---

## The Scientific Debugging Loop

```
Replicate Bug ──> Read Stack Trace ──> Isolate Code Area ──> Write Regression Test (Fails) ──> Fix Code (Passes)
```

---

## Examples

### ✅ Good — Analyzing Stack Traces and Isolating Root Causes

Suppose an API route crashes when fetching data.

**Step 1: Read the Stack Trace Log:**
```
TypeError: Cannot read properties of undefined (reading 'price')
    at calculateTax (src/utils/tax.ts:12:25)
    at getInvoiceDetails (src/controllers/invoice.ts:45:18)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
```
The error points directly to `tax.ts` at line 12 inside the `calculateTax` function.

**Step 2: Isolate the source code (`src/utils/tax.ts`):**
```typescript
// Line 12
export function calculateTax(item: { price: number }) {
  // If 'item' is undefined, this throws a TypeError!
  return item.price * 0.1; 
}
```

**Step 3: Write a failing unit test to replicate the bug:**
```typescript
import { calculateTax } from "./tax";

describe("calculateTax", () => {
  it("should handle undefined input safely without throwing", () => {
    // Expecting the function to return 0 or throw a custom schema error instead of crashing
    expect(() => calculateTax(undefined as any)).toThrowError("Invalid item data");
  });
});
```

**Step 4: Implement the safe verification check:**
```typescript
export function calculateTax(item?: { price: number }) {
  if (!item) throw new Error("Invalid item data");
  return item.price * 0.1;
}
```

Why this passes: Locates the exact line using the stack trace, replicates the error with a unit test, fixes the logic safely, and removes debug logs.

### ❌ Bad — Shotgun Debugging and Guesswork

When encountering the same `TypeError: Cannot read properties of undefined (reading 'price')` crash:

```typescript
// ERROR 1: Guessing the issue is in the controller instead of looking at the stack trace
export async function getInvoiceDetails(req: Request, res: Response) {
  // Randomly wrapping everything in a catch-all block without fixing the tax utility
  try {
    const item = req.body.item;
    // ERROR 2: Adding console logs and committing them to git
    console.log("DEBUG LOG: item details are:", item); 
    
    // ERROR 3: Adding random default fallbacks to variables in the wrong place
    const tax = calculateTax(item || { price: 0 }); // Guessing it might be undefined
    res.json({ tax });
  } catch (err) {
    // Swallowing the error and returning blank data
    res.json({ tax: 0 }); 
  }
}
```

Why this fails: Guesses the root cause without analyzing the stack trace, commits debug statements, and swallows exceptions, which hides logic issues.

---

## Failure Modes

- **The Shotgun Loop:** Making constant, unverified logic tweaks until the crash behavior changes slightly, leaving messy code behind.
- **Swallowed Exceptions:** Wrapping buggy code blocks inside empty `try/catch` wrappers, hiding system issues.
- **Dangling Print Leftovers:** Committing hundreds of `console.log("here")` entries into the master branch.

## Validation

Cara memverifikasi kepatuhan penggunaan `systematic-debugging`:

1. **Verify that no leftover debug outputs are committed:**
   Search for diagnostic codes:
   ```bash
   grep -rn "console.log" src/
   # Verify no diagnostic calls are in git diff
   ```
2. **Review error logs:**
   Confirm stack trace files:
   ```bash
   test -d .logs || mkdir .logs
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan debugging:

> "Use the skill `systematic-debugging`. Read `.agent/skills/systematic-debugging/SKILL.md` before coding. Never perform shotgun modifications or swallow exceptions. Always replicate errors, read stack traces from the top down, isolate variables, and verify with tests."

## Related

- [test-driven-development](../test-driven-development/SKILL.md) — Regression test suites.
- [code-reviewer](../code-reviewer/SKILL.md) — Debug checks reviews.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Success validation.
