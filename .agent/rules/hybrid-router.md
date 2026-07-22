# Hybrid Router Rule

Apply this rule when choosing skills, workflows, docs, or validation strategy across any AI coding agent.

Source files:

- `../skill-router.json`
- `../official-reference-map.json`
- `../core/hybrid-agent-policy.md`
- `../scripts/detect-project.mjs`
- `../scripts/agent-doctor.mjs`

## Required Behavior

- Use `.agent/skill-router.json` to choose relevant skills instead of guessing.
- Run `node .agent/scripts/detect-project.mjs` when the project stack is unclear.
- Run `node .agent/scripts/agent-doctor.mjs` after changing `.agent` or project-level agent configuration.
- Untuk topik yang terdaftar, gunakan sumber dari
  `.agent/official-reference-map.json` dan route ke `official-reference-verifier`.
- Baca lesson relevan sebelum task; setelah user correction, update lesson sebelum
  melanjutkan.
- When external research changes a decision, cite the source in the final answer.
- The four-tier source hierarchy (local evidence → skill routing → official docs →
  model reasoning) is defined once, canonically, in `../core/hybrid-agent-policy.md`.
  Do not restate or fork that hierarchy here — link to it instead so the two files
  cannot drift apart.

## Skill Conflict Resolution

`skill-router.json` routes often return multiple skills for one task (e.g. the
`dependency:three` route alone returns 7 skills). When two routed skills give
directly contradicting `ALWAYS DO THIS` / `NEVER DO THIS` guidance for the same
piece of code:

1. Prefer the skill whose `when`/`Kapan dipakai` description most specifically
   matches the current file, dependency, or framework version in play. A skill
   scoped to the exact library in use (e.g. `nextjs-app-router-patterns` for an
   App Router project) outranks a general-purpose skill covering the same domain
   (e.g. `frontend-dev-guidelines`).
2. If specificity is still tied, prefer the skill that is more restrictive/safer
   (the one whose violation has a documented `Failure Modes` entry with concrete
   user-facing impact) over the one that is silent on the risk.
3. If neither (1) nor (2) resolves it, do not silently pick one. Surface the
   conflict to the user in one sentence — name both skills and the contradicting
   rule — before writing the affected code.
4. Never average or blend two contradicting rules into a third, unstated
   approach; that produces code that satisfies neither skill's validation.

## Portable Agent Notes

- Keep canonical rules in `.agent/rules`.
- Keep canonical skills in `.agent/skills`.
- If a specific AI tool needs root-level rules, copy/export from `.agent` only when the user explicitly asks.
- Do not assume skills will be selected automatically. Point the agent with rules, router entries, and explicit task wording.
