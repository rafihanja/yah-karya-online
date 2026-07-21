---
name: verification-before-completion
description: Claiming work is complete without verification is dishonesty, not efficiency.
risk: medium (untested bug releases, broken build deployments, false status logs)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Verification Before Completion

> **One-liner:** Guidelines enforcing strict proof-first status reports by requiring fresh test and build validations before claiming any task completion.

## When to Use

- When reporting task completions or expressing satisfaction with code edits.
- When committing changes, submitting Pull Requests, or moving to the next implementation phase.
- When reviewing sub-agent outcomes or validating issue resolutions.

## Why This Exists

AI agents often claim "done" or "fixed" based on assumptions rather than execution evidence. This leads to broken packages, syntax errors, or missing requirements slipping into repositories. Claiming success without fresh verification damages trust and wastes time in debug-rework loops. Enforcing a strict "proof-first" policy guarantees that compile statuses, test outcomes, and visual checks are freshly executed and documented before any claim is made.

## ALWAYS DO THIS

- **Identify the validation command first** — Determine which test, build, or script command proves your change works before announcing completion.
- **Provide concrete output evidence** — Include actual console counts (e.g. `exit 0`, `25/25 tests passed`) in status updates.
- **Run validation checks freshly** — Execute verification commands immediately before making success statements; never rely on past runs.
- **Verify edge cases manually if untested** — Explicitly state browser versions or input scopes that were not tested.
- **Verify sub-agent outputs independently** — Inspect git diffs and run builds locally rather than accepting a sub-agent's success report.

## NEVER DO THIS

- ❌ **DO NOT** state that a task is complete based on expectations (e.g., "should work now" or "looks good"). **Why fails:** Bypasses actual runtime verification, leading to broken builds in production. **Instead:** Execute the build command and verify the exit code is 0.
- ❌ **DO NOT** claim that all tests pass without running the entire test suite. **Why fails:** A change that fixes one component can break unrelated files, which goes unnoticed if only partial tests are run. **Instead:** Run the full test suite.
- ❌ **DO NOT** assume a compiler error is fixed because a linter passes without errors. **Why fails:** Linters only check code style and basic syntax rules, not compile safety or database schema compatibility. **Instead:** Run `npm run build` or the compiler checker.
- ❌ **DO NOT** claim a bug is fixed without testing the original failure scenario. **Why fails:** The bug might persist in production due to environmental differences or missing edge cases. **Instead:** Verify the fix by recreating the issue first.

---

## The Verification Gate Process

```
Work Done ──> Run Build / Lint ──> Check Exit Code (0) ──> Report Claim with Concrete Output
```

---

## Examples

### ✅ Good — Verification with Fresh Logs and Test Counts

```markdown
### 🚀 Phase 3 Complete: Cart Component Upgrade

The shopping cart component has been upgraded to support quantity increments and dynamic totals.

**Verification Evidence:**
1. **Build Success:** Ran `npm run build` locally:
   ```bash
   npm run build
   # Output:
   # ✓ Compiled successfully
   # Build completed in 8.4s
   # Exit code: 0
   ```

2. **Unit Tests Passed:** Executed the full cart test suite:
   ```bash
   npm run test src/components/Cart.test.tsx
   # Output:
   # PASS  src/components/Cart.test.tsx
   # Tests:       12 passed, 12 total
   # Snapshots:   0 total
   # Time:        1.45 s
   ```

3. **Console Safety:** Visual test in Chrome DevTools shows 0 errors.

The cart calculations are verified. Ready for Phase 4.
```

Why this passes: Provides actual execution logs, specifies which test files were run, and documents the exit status.

### ❌ Bad — Guesswork and Assumptions

```markdown
I have updated the cart logic to fix the total price bug. The code looks correct now and should work perfectly. I am confident it will build successfully on Vercel. Let me know if you find any bugs!
```

Why this fails: Lacks validation logs, relies on assumptions ("should work"), and delegates testing to the user.

---

## Failure Modes

- **Silent Compiler Crashes:** Claiming lint success while the build command crashes because a type definition is missing.
- **Vague Status Checks:** Stating "looks correct" when a typo prevents a hook from running.
- **Skipped Test Regressions:** Merging changes that break other components because only a single test file was run.

## Validation

Cara memverifikasi kepatuhan penggunaan `verification-before-completion`:

1. **Verify that status updates contain console logs:**
   Confirm reports contain execution details:
   ```bash
   # Check if build exit messages exist in logs
   grep -rn "Compiled successfully" C:/Users/ACER/.gemini/antigravity-ide/brain/
   ```
2. **Scan for incomplete status messages:**
   Ensure no "should work" or "should be fixed" statements remain in deliverables:
   ```bash
   grep -rn "should work" C:/Users/ACER/.gemini/antigravity-ide/brain/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk memvalidasi tasks:

> "Use the skill `verification-before-completion`. Read `.agent/skills/verification-before-completion/SKILL.md` before claiming success. Never claim tasks are done using assumptions. Always run full builds, verify test suites, and provide concrete execution logs."

## Related

- [self-review-gate](../self-review-gate/SKILL.md) — Pre-delivery gate.
- [code-reviewer](../code-reviewer/SKILL.md) — Manual review criteria.
- [codebase-audit-pre-push](../codebase-audit-pre-push/SKILL.md) — Pre-push audits.
