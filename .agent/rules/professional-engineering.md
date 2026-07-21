# Professional Engineering Rule

Apply this rule when implementing, reviewing, refactoring, securing, testing, or preparing code for GitHub.

Source files:

- `../core/professional-engineering-standards.md`
- `../core/safe-commands.md`
- `../skill-router.json`

## Required Behavior

- Use the smallest maintainable implementation that satisfies the task.
- Prefer project conventions over new abstractions.
- Validate inputs at trust boundaries.
- Run available build, lint, typecheck, or tests before claiming completion.
- For UI work, check accessibility, responsiveness, motion safety, and visual regressions.
- For dependencies, avoid adding packages unless the project needs them and the user accepts the tradeoff.
- For security-sensitive changes, use OWASP ASVS-style verification thinking.
- For shipped artifacts, consider supply-chain integrity: lockfiles, reproducible commands, and no secrets.

## Definition Of Done

A task is not complete until the agent can name:

1. Files changed.
2. Evidence inspected.
3. Skills or rules used.
4. Validation commands run.
5. Known residual risks.
