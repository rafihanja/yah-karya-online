# Hybrid Router Rule

Apply this rule when choosing skills, workflows, docs, or validation strategy across any AI coding agent.

Source files:

- `../skill-router.json`
- `../official-reference-map.json`
- `../core/hybrid-agent-policy.md`
- `../scripts/detect-project.mjs`
- `../scripts/agent-doctor.mjs`

## Required Behavior

- Use local repository evidence first.
- Use `.agent/skill-router.json` to choose relevant skills instead of guessing.
- Run `node .agent/scripts/detect-project.mjs` when the project stack is unclear.
- Run `node .agent/scripts/agent-doctor.mjs` after changing `.agent` or project-level agent configuration.
- Prefer official documentation for current tool behavior, especially framework, deployment, package manager, AI agent runtime, and security behavior.
- Untuk topik yang terdaftar, gunakan sumber dari
  `.agent/official-reference-map.json` dan route ke `official-reference-verifier`.
- Baca lesson relevan sebelum task; setelah user correction, update lesson sebelum
  melanjutkan.
- When external research changes a decision, cite the source in the final answer.

## Portable Agent Notes

- Keep canonical rules in `.agent/rules`.
- Keep canonical skills in `.agent/skills`.
- If a specific AI tool needs root-level rules, copy/export from `.agent` only when the user explicitly asks.
- Do not assume skills will be selected automatically. Point the agent with rules, router entries, and explicit task wording.
