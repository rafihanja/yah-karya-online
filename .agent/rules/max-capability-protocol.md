# Max Capability Protocol

Apply this rule to EVERY substantive task in this repository. This protocol is always-on by default; user phrases such as expert-level reasoning, maximum capability, "1000x", "1000x lipat", "1000 kali lipat", transparent work, stronger rules, or broad skill/governance upgrades only reinforce the same obligation.

Source files:

- `../skills/expert-reasoning-operator/SKILL.md`
- `../skills/deep-thinking-enforcer/SKILL.md`
- `../rules/evidence-first.md`
- `../rules/mandatory-skill-usage.md`
- `../core/professional-engineering-standards.md`

## Required Behavior

- Do not wait for the user to say "1000x" or "maksimal"; every substantive task must use this protocol automatically.
- Treat "maksimal" as more evidence and sharper validation, not as permission to edit unrelated files.
- Treat "1000x/1000x lipat/1000 kali lipat" as a trigger for this protocol, not as a promise of exaggerated output length, unsafe rewrites, or unrelated scope expansion.
- State the working scope before execution when the request is broad.
- Use an evidence ledger: local files, command output, official docs, and assumptions must be distinguishable.
- Compare alternatives when changing shared rules, skills, architecture, security, database, deployment, or dependencies.
- Name risk before editing: dirty worktree, data loss, security/privacy, regression, performance, and scope creep.
- Prefer small reversible phases over a single large rewrite.
- Run the strongest relevant validation before claiming completion.

## Always-On Activation & Trigger Normalization

For every substantive task, and especially when any agent sees language such as "1000x", "1000x lipat", "1000 kali lipat", "gas total", "maksimalin", or "tingkat ahli", it must normalize the work into these concrete obligations:

1. Read the matching governance/technical skill files before acting.
2. State scope, non-scope, assumptions, and dirty-worktree risk.
3. Build an evidence ledger from local files and command output.
4. Compare at least two viable approaches for shared rules, skills, architecture, or high-risk code.
5. Run the strongest relevant validation and name any gap that remains.

## Hard Boundaries

- Do not broaden the task into app code when the user asked for rules/skills unless the user explicitly includes app behavior.
- Do not rewrite a healthy skill library without a failing audit, clear gap, or explicit target.
- Do not hide validation gaps. If a check cannot run, say why and name the residual risk.
- Do not claim that every skill was used. Claim only skills whose `SKILL.md` was read and changed a decision, validation, risk control, or artifact.

## Completion Gate

Before delivery, the agent must be able to name:

1. Scope chosen and why.
2. Files inspected.
3. Files changed.
4. Skills/rules applied.
5. Commands run and result.
6. Remaining risk.

For `.agent` changes, the minimum validation set is:

```powershell
node .agent\scripts\validate-agent-skills.mjs
node .agent\scripts\agent-doctor.mjs
node .agent\scripts\deep-skill-audit.mjs
node .agent\scripts\audit-skill-quality.mjs
node .agent\scripts\export-agent-adapters.mjs --dry-run
```
