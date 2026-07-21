---
name: code-reviewer
description: Elite code review expert specializing in modern AI-powered code review.
risk: low (non-modifying checks, reviews execution paths, code quality standards)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Code Reviewer

> **One-liner:** Guidelines for reviewing code changes, validating algorithmic correctness, security controls, architectural performance, and structural cleanliness before merge actions.

## When to Use

- When reviewing a Pull Request (PR) or branch commit before merging into the main branch.
- When performing a self-review of code before delivering a task to the user.
- When assessing a codebase to identify technical debt or code quality issues.

## Why This Exists

Code review is the final checkpoint before code changes are merged into production. If reviewers focus only on stylistic issues (which should be handled by automated formatters like Prettier or Linters), they miss critical architectural issues. Without structured guidelines, reviewers often miss critical security bugs (e.g. SQL injection, hardcoded keys), N+1 query loops, or memory leaks, resulting in production regressions.

## ALWAYS DO THIS

- **Prioritize security and performance reviews** — Focus on finding hardcoded keys, access control leaks, SQL injections, and database N+1 query loops first.
- **Provide clear, actionable feedback** — State exactly what the issue is, why it is a problem, and how to fix it with concrete code examples.
- **Confirm test coverage** — Verify that the changes include appropriate unit, integration, or E2E tests to prevent future regressions.
- **Ensure clean separation of concerns** — Check that business logic is separated from visual display layers and verify API configurations.
- **Enforce automated checks** — Ensure that linting, formatting, and test suites pass successfully before starting a manual code review.

## NEVER DO THIS

- ❌ **DO NOT** approve a Pull Request or code branch that lacks a clear description of the changes. **Why fails:** Reviewers cannot verify if the implementation aligns with the original requirements without context, leading to bugs. **Instead:** Reject the review until a clear PR description is provided.
- ❌ **DO NOT** comment on formatting, styling, or indentation rules in manual code reviews. **Why fails:** Waste of reviewer time and introduces friction. **Instead:** Configure automated formatter checks (e.g., Prettier/ESLint) to block commits that violate style rules.
- ❌ **DO NOT** provide vague, low-signal comments (e.g. "LGTM" or "Refactor this"). **Why fails:** Confuses the author, leads to guess-work, and slows down the feedback loop. **Instead:** Explain the exact rationale and suggest the specific refactoring path.
- ❌ **DO NOT** merge code changes without verifying that the build compiles successfully in staging. **Why fails:** Risk of merging compilation errors that break the main build. **Instead:** Verify that the CI build checks are green.

---

## Technical Audit Hierarchy

Reviewers should evaluate code changes in this order of priority:
1. **Security:** Hardcoded credentials, injection attacks, access control, SSRF.
2. **Correctness:** Logic flow, edge cases, error handling, race conditions.
3. **Performance:** N+1 queries, unnecessary re-renders, memory leaks, payload sizes.
4. **Maintainability:** Separation of concerns, naming conventions, documentation.

---

## Examples

### ✅ Good — Specific, Actionable Code Review Feedback

```markdown
### 🧐 Review Finding: N+1 Query in Post Retrieval Loop

**Location:** `src/services/postService.ts` [postService.ts:L45-L53](../../src/services/postService.ts#L45-L53)

**Issue:** 
The current implementation queries the database for each post's author individually inside a loop. This creates an N+1 query vulnerability that will overload the database under load:

```typescript
// Unoptimized code in PR
const posts = await db.post.findMany();
for (const post of posts) {
  post.author = await db.user.findUnique({ where: { id: post.authorId } }); // N queries!
}
```

**Remediation:**
We should join the tables or use Prisma's `include` parameter to fetch all author records in a single query:

```typescript
// Optimized recommendation
const posts = await db.post.findMany({
  include: {
    author: {
      select: { id: true, name: true }
    }
  }
});
```

Please refactor this to optimize query performance and reduce database round-trips.
```

Why this passes: Pinpoints the file location, explains the specific performance impact, and provides a clear before/after code snippet showing how to fix it.

### ❌ Bad — Stylistic and Vague Comments

```markdown
- `src/components/Button.tsx`: Why did you use 2 spaces instead of 4 here? Please fix this indentation.
- `src/services/userService.ts`: This file looks very messy. Please clean this up and refactor the user verification logic.
- Looks good otherwise, approved!
```

Why this fails: Wastes time on stylistic issues that should be automated, provides vague feedback without concrete suggestions, and approves the change without verifying safety.

---

## Failure Modes

- **Stylistic Bikeshedding:** Wasting time arguing over formatting style details while missing N+1 query loops.
- **Rubber-Stamp Approvals:** Approving large pull requests with a generic "Looks good" message without reviewing the code.
- **Scope Creep Comments:** Demanding unrelated refactoring tasks that are outside the scope of the current PR.

## Validation

Cara memverifikasi kepatuhan penggunaan `code-reviewer`:

1. **Verify that code review comments contain code recommendations:**
   Confirm that findings explain how to fix the issue:
   ```bash
   # Check if code blocks exist in review reports
   grep -rn "```" reports/reviews/
   ```
2. **Scan for automated formatting checks:**
   Confirm that format checkers are defined in the project:
   ```bash
   test -f .prettierrc || test -f .eslintrc.json
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mereview kode:

> "Use the skill `code-reviewer`. Read `.agent/skills/code-reviewer/SKILL.md` before starting code reviews. Never comment on formatting style rules that should be handled by automated formatters. Always prioritize security, correctness, and performance, and provide clear code examples for recommendations."

## Related

- [self-review-gate](../self-review-gate/SKILL.md) — Self-review checks.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Success validation.
- [codebase-audit-pre-push](../codebase-audit-pre-push/SKILL.md) — Pre-push codebase audits.
