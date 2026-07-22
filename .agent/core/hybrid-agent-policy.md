# Hybrid Agent Policy

> **Canonical source-priority hierarchy.** This is the single place this four-tier
> hierarchy is defined. `../rules/hybrid-router.md` links here instead of
> restating it — if you change the order or wording, this is the only file to
> edit; do not fork a second copy elsewhere.

This repository uses a hybrid operating model for any AI coding agent:

1. **Local evidence first**: inspect project files, manifests, package scripts, and command output.
2. **Skill routing second**: choose relevant `.agent/skills/*/SKILL.md` entries through `.agent/skill-router.json`. See `../rules/hybrid-router.md` for what to do when two routed skills give contradicting guidance.
3. **Official docs third**: use official or primary docs for current platform behavior.
4. **Model reasoning last**: use general reasoning only after the above sources are exhausted or explicitly marked as assumptions.

For the 33 user-designated technical topics, `.agent/official-reference-map.json`
overrides generic source selection. Apply
`.agent/rules/official-reference-verification.md` and read relevant entries from
`.agent/memory/lessons-learned.md` before acting.

## Why This Exists

The repository intentionally stores `.agent` in Git so moving to a new device does not require rebuilding the agent brain manually. Rules, policies, skills, routers, and validation scripts stay inside `.agent` as the canonical source. If a specific AI tool needs root-level files, export from `.agent` only when the user explicitly asks.

## Verified AI Agent Runtime Facts

Checked on 2026-06-01 from Google Antigravity documentation as one supported runtime example:

- Agents operate inside **Projects**, and projects define folder/repository boundaries.
- Antigravity supports **Local Mode** and **New Worktree Mode**.
- Workspace rules default to `.agents/rules`, with backward support for `.agent/rules`.
- Workspace skills default to `.agents/skills`, with backward support for `.agent/skills`.
- A skill is a folder with `SKILL.md`; `description` helps the agent decide when to use it.
- Workflows are reusable Markdown step sequences invoked by slash commands.
- Security settings include terminal command review, non-workspace file access, Strict Mode, and sandboxing.

Primary Antigravity references:

- https://antigravity.google/docs/projects
- https://antigravity.google/docs/rules
- https://antigravity.google/docs/skills
- https://antigravity.google/docs/ide-workflows
- https://antigravity.google/docs/ide-settings

## Operating Modes

### Fast Local Mode

Use when the task is fully answerable from local files:

- inspect files
- use skill router
- edit minimal scope
- run local validation

### Research Mode

Use when tool behavior, dependency behavior, deployment behavior, or security guidance may have changed:

- browse official docs or primary sources
- record source in the final answer
- update local policy/router only when it helps future work

### Hybrid Mode

Use when both project context and current external behavior matter:

- run project detection
- read relevant local rules/skills
- verify current external docs
- implement local guardrails or code
- run `agent-doctor`

## Anti-Hallucination Contract

An agent must not present a guess as fact. If a claim came from local files, cite the path. If it came from command output, name the command. If it came from external research, cite the link. If it came from reasoning, label it as a recommendation or assumption.

## Tool Portability

Canonical paths:

- `.agent/START_HERE.md`
- `.agent/AGENTS.md`
- `.agent/adapters/adapter-map.json`
- `.agent/active-skills.json`
- `.agent/rules/*.md`
- `.agent/core/*.md`
- `.agent/memory/decisions.md`
- `.agent/projects/index.json`
- `.agent/skills/*/SKILL.md`
- `.agent/skill-router.json`
- `.agent/scripts/*.mjs`

Do not create or require root-level agent files unless the user asks for an export for a specific tool.

Activation paths:

- Manual: paste the prompt from `.agent/START_HERE.md`.
- Bootstrap: `node .agent/scripts/bootstrap-agent.mjs`.
- Adapter dry-run: `node .agent/scripts/export-agent-adapters.mjs --dry-run`.
- Adapter export: `node .agent/scripts/export-agent-adapters.mjs --write --tool <tool>`.
