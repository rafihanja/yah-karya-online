# Agent Adapter Strategy

The portable source of truth lives in `.agent`. This keeps all agent work versioned, portable, and recoverable when moving devices.

## Reality Check

There is no honest way to guarantee every AI coding agent will automatically load `.agent` by itself. Different tools use different conventions:

- AGENTS-compatible tools commonly read root `AGENTS.md`.
- Claude Code reads project memory from `CLAUDE.md` or `.claude/CLAUDE.md`, and supports `@path` imports in `CLAUDE.md`.
- Cursor supports project rules in `.cursor/rules` and also supports `AGENTS.md`.
- Antigravity/OpenCode-style hosts may use `.agents/rules` or `.agents/skills`.

Because the user wants canonical results to stay inside `.agent`, the correct professional approach is:

1. Keep canonical policy, rules, router, and scripts in `.agent`.
2. Provide a manual entrypoint at `.agent/START_HERE.md`.
3. Provide an opt-in adapter exporter that can create tool-specific bridge files later.
4. Keep the exporter dry-run by default.

## Adapter Contract

Generated adapters must be small bridge files. They should not duplicate the full policy. They should point back to `.agent` so updates remain centralized.

Adapter files may include:

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/agent-kit.mdc`
- `.agents/rules/agent-kit.md`

Do not generate adapters unless the user asks or runs the exporter with `--write`.

## Source References Checked

Checked on 2026-06-01:

- Cursor project rules live in `.cursor/rules`; Cursor also supports `AGENTS.md`.
- Claude Code project memory can live in `./CLAUDE.md` or `./.claude/CLAUDE.md`, and `CLAUDE.md` can import files using `@path`.
- Antigravity docs describe `.agents/rules` and `.agents/skills`, with backward compatibility for `.agent`.

References:

- https://docs.cursor.com/en/context
- https://docs.claude.com/en/docs/claude-code/memory
- https://antigravity.google/docs/rules
- https://antigravity.google/docs/skills
