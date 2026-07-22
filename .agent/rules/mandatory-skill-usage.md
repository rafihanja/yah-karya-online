# Mandatory Skill Usage Rule

Apply this rule to EVERY task, for EVERY AI agent and sub-agent that touches this repository. This rule is non-optional. It exists to raise output quality and to stop generic, low-signal "AI slop".

Source files:

- `../skill-router.json`
- `../active-skills.json`
- `../official-reference-map.json`
- `../rules/max-capability-protocol.md`
- `../rules/official-reference-verification.md`
- `../rules/fail-closed-governance.md`
- `../core/hybrid-agent-policy.md`
- `../core/professional-engineering-standards.md`

## Why This Rule Exists

A model answering from memory alone produces generic, average, often-wrong output ("slop"): boilerplate that ignores project conventions, outdated API usage, and confident guesses. The curated skills in `.agent/skills` encode hard rules, anti-patterns, and known failure modes. Using them is what separates an expert answer from a generic one. Skipping them is treated as a quality defect, not a shortcut.

## Required Behavior (Every Task)

<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->
<!-- FAIL_CLOSED_GOVERNANCE -->
<!-- MANDATORY_SKILL_INDEX -->

**Universal output disclosure:** every assistant output, without exception, must begin by naming the skill(s) used. Substantive output uses the full `I AM CRAZY` header. Trivial/status/clarification/error output uses at least the brand line `🔥 I AM CRAZY`. No conversational output is exempt.

0. **Read the mandatory pre-flight bundle before acting.** For every substantive task, read these files first and in this order:
   - `.agent/skills/session-boot/SKILL.md`
   - `.agent/skills/auto-pro-standards/SKILL.md`
   - `.agent/skills/prompt-amplifier/SKILL.md`
   - `.agent/skills/phased-delivery/SKILL.md`
   - `.agent/skills/project-memory/SKILL.md`
   - `.agent/skills/self-review-gate/SKILL.md`
   - `.agent/rules/mandatory-skill-usage.md`
   - `.agent/rules/fail-closed-governance.md`
   - `PROJECT_MEMORY.md`
   - `.agent/skill-router.json`
   - `.agent/skills/INDEX.md` — katalog SEMUA skill (scan penuh; bukan cuma yang kebetulan match keyword)
   - `.agent/active-skills.json`
   - `.agent/official-reference-map.json`
   - `.agent/memory/lessons-learned.md`

1. **Scan the full skill index, then route.** Before writing or editing anything, scan `.agent/skills/INDEX.md` (every skill in the repo is listed there — nothing hidden) and match the task against `.agent/skill-router.json` (and `.agent/active-skills.json` for the default set). Pick the most specific skill(s) that apply. If the index is stale/missing, run `node .agent/scripts/generate-skill-index.mjs` first.
2. **Read the matched `SKILL.md` before producing output.** Do not rely on the skill name or your memory of it. Open the file using `view_file` and follow its `NEVER DO THIS` / `ALWAYS DO THIS` sections. **Anti-Hallucination Verification**: The agent must trigger a file read (`view_file`) on the target `SKILL.md` within the current active session. Claiming a skill without executing a file check in the session logs will trigger a hard Governance Violation.
3. **Apply skills at the correct depth.** Every output applies `session-boot` for disclosure. Substantive tasks must additionally apply at least one relevant routed skill for code, config, design, review, security, deployment, or content work.
4. **State the skills used in every output.** Full `I AM CRAZY` header is mandatory for substantive work. Trivial/status/clarification/error output must still start with the exact `🔥 I AM CRAZY` brand line.
5. **No silent fallback to generic answers.** If no skill matches, say so explicitly, then proceed with the professional-engineering standards as the baseline — never pretend a skill was used.
6. **Max-capability route is always-on.** For every substantive task, apply `expert-reasoning-operator` and `.agent/rules/max-capability-protocol.md` automatically. Do not wait for the user to say "1000x", "1000x lipat", "gas total", expert reasoning, maximum capability, transparent work, or broad governance/skill upgrade; those phrases only reinforce the same default obligation.
7. **No wasted skill claims.** Mandatory bundle files must be read, but final `Skill dipakai` should list only skills that actually shaped the output. If a governance skill only served as required pre-flight context, list it under files inspected, not as applied.
8. **No disclosure exemption.** Never suppress the skill line because the reply is short, conversational, an acknowledgement, a clarification, a status update, or a tool failure.
<!-- OFFICIAL_REFERENCE_VERIFICATION -->

9. **Official-reference gate.** If a task touches a topic in
   `.agent/official-reference-map.json`, apply `official-reference-verifier`. Check
   relevant lessons first, verify uncertain/current claims with the mapped source,
    cross-check before delivery, and update lessons before continuing after a user
    correction.
10. **Fail-closed violation recovery.** Jika mandatory gate terlewat, required validation gagal, atau bukti diklaim tanpa command/file yang nyata, agent WAJIB berhenti, menulis `GOVERNANCE VIOLATION DETECTED`, menarik klaim yang tidak tepercaya, menjalankan recovery, dan memvalidasi ulang. Agent tidak boleh mengizinkan bypass untuk dirinya sendiri.
11. **General mistake capture (bukan hanya official-reference).** Koreksi user pada topik `official-reference-map.json` punya hard gate tervalidasi (lihat `official-reference-verifier`). Koreksi pada topik lain yang berpotensi berulang tetap wajib dicatat lewat `lessons-capture` section 5 sebelum task/fase diklaim selesai — ini kebijakan wajib meski belum ada validator otomatis untuk itu.

## Anti-Slop Contract

Output is rejected (by self-review, before delivery) if it:

- Gives broad, could-apply-to-any-project advice that does not name files, skills, or commands from THIS repo.
- Uses padding, hype, or filler instead of concrete, verifiable steps.
- Ignores a skill's explicit prohibition (e.g. animating `top`/`left` when `gsap-core` forbids it).
- Claims success without the validation named in the matching router route.
- Continues silently after a detected governance violation or failed required validation.

When in doubt, prefer the relevant anti-slop skills: `unslop`, `avoid-ai-writing`, `verification-before-completion`, `code-reviewer`.

## Open-Source Example Harvest (MANDATORY, Bounded)

Agents MUST look up real, verified open-source code using search tools for **every substantive task that has external prior art** — not only "complex" ones — and HARVEST that code as the implementation basis, under these strict limits:

- **Harvest, then adapt (MANDATORY)**: search for real open-source code implementing the pattern BEFORE writing your own; take the actual code from a safe-licensed source and adapt it to this repo's conventions. Do not answer from memory when working prior art exists. This is the required "take the code" step, not optional inspiration.
- **License Validation (MANDATORY)**: You must verify that the license of the external repository or source is strictly permissive (MIT, Apache-2.0, BSD, ISC, Unlicense, CC0, or public domain). Any copy-paste or adaptation of viral copyleft licenses (GPL, AGPL, LGPL) or proprietary code is strictly forbidden.
- **Audit Logging (MANDATORY)**: Any task that harvested external code must document the source URL and the license type in the final response under a "Source & License Audit" section, and record non-trivial adaptations in `.agent/memory/decisions.md`.
- **Prefer primary sources**: official documentation (e.g., Next.js docs, Gemini API docs, Puppeteer API references) and the library's own official GitHub repository. Avoid unverified blog posts.
- **Adapt, don't mass-dump**: translate the structural pattern into this repo's specific conventions — rename, rewire, strip dead parts. Small idiomatic snippets may stay near-verbatim if attributed; never dump large unmodified verbatim blocks.
- **Never run fetched code blindly**: review any downloaded scripts before execution, ensuring no malicious logic is run on the host.
- **No secrets, no exfiltration**: do not send repository contents, credentials, or private context to external services.
- **Exempt**: trivial one-line edits, pure conversation/status output, and tasks with no external prior art (novel internal glue).

## Sub-Agent Propagation

When dispatching sub-agents (workflow, parallel, Task), the dispatching agent MUST pass:

- the matched skill name(s) for the sub-task, and
- the instruction to read the relevant `SKILL.md` before producing output.

A sub-agent that returns generic output without a skill reference should be re-run with explicit skill routing.

## Completion Gate (extends Definition of Done)

A substantive task is not complete until the agent can name:

1. Files changed.
2. Evidence inspected.
3. **Skills read and applied** (exact names) — or an explicit "no skill matched" note.
4. Validation commands run and their result.
5. Any open-source source consulted (URL + license) if external examples were used.
6. Remaining risk.

## Master Flow

Selalu sinkronkan dengan .agent/MASTER_FLOW.md untuk mengorkestrasi penggunaan skill sesuai fase project.
