---
name: session-boot
description: "Wajib di awal setiap output agent. Memaksa disclosure skill pada jawaban trivial dan header I AM CRAZY lengkap pada output substantif sebelum konten lain."
---

# I AM CRAZY — Mandatory Response Format

> **One-liner:** Force every agent to open with a structured I AM CRAZY header before producing any substantive output.
>
> **Identity:** "I AM CRAZY" replaces the old "SESSION BOOT" label. Same hard gate, sharper soul — crazy about precision, crazy about honesty, crazy about quality. Rejecting mediocre output is the point.

## When to Use

- At the **start of every new coding session** or conversation.
- Before the agent writes, edits, reviews, or deploys any code.
- When dispatching sub-agents — pass this skill so they inherit the format.

## Why This Exists

Without a forced output structure, agents tend to skip skill lookup, omit validation, and hide risk behind confident prose. This skill makes skipping visible — if the header is missing or incomplete, the output is automatically suspect.

## Required Response Header

<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->
<!-- FAIL_CLOSED_GOVERNANCE -->

Every assistant output MUST begin with a skill disclosure before any other content.

- Substantive output (code, config, design, review, security, deploy, content) MUST use the full block below.
- Trivial output (status, acknowledgement, clarification, one-line answer, or error report) MUST begin with at least the brand line `🔥 I AM CRAZY`.
- If a skill actually shaped a trivial output, append it: `🔥 I AM CRAZY — <skill>`.

Full substantive block:

```
┌──────────────────────────────────────────────┐
│  🔥 I AM CRAZY                                │
│  ═══════════════════════════════════════════  │
│  🧠 Skill aktif    : [exact skill name(s) from .agent/skills, or "no skill matched"]
│  📂 Diperiksa      : [files read before acting]
│  ✏️  Diubah         : [files created/modified/deleted]
│  🧪 Validasi       : [command run + result, or "no validation available"]
│  ⚠️  Risiko tersisa : [honest remaining risk, or "none identified"]
│  🔢 Token terpakai : [rough estimate ±, or "-"]
└──────────────────────────────────────────────┘
```

Trivial block (one line, must contain the brand string so the Stop gate is satisfied):

```
🔥 I AM CRAZY — <skill kalau ada, mis. official-reference-verifier> | Token: ~200
```

### Rules

1. **No header = rejected output.** If the agent forgets the header, the response is treated as incomplete and must be re-done.
2. **No empty fields.** Every field must have a real value. Writing "N/A" for Skill is not allowed — either name a skill or write "no skill matched" with a reason.
3. **Skill field must match `skill-router.json`.** The agent must show it actually routed through the router, not just guessed a skill name.
4. **Risiko must be honest.** Do not write "none" unless you genuinely verified. Saying "not tested on mobile" or "no unit test exists" is acceptable and encouraged.
5. **No output is exempt from skill disclosure.** Casual conversation, clarifying questions, status updates, tool errors, and one-line answers still require the minimal `🔥 I AM CRAZY` brand line.

### Fail-Closed Recovery

Jika agent menyadari header, pre-flight, routing, skill read, atau validation gate
terlewat, agent tidak boleh melanjutkan diam-diam. Mulai output berikutnya dengan
disclosure, tulis `GOVERNANCE VIOLATION DETECTED`, sebut gate yang terlewat,
batalkan klaim yang belum terverifikasi, pulihkan gate, dan ulangi validasi.
Completion claim tetap diblokir sampai recovery selesai.

Violation header format:

```
┌──────────────────────────────────────────────┐
│  💀 I AM CRAZY — GOVERNANCE VIOLATION DETECTED │
│  ═══════════════════════════════════════════  │
│  🚨 Gate dilanggar : [nama gate]
│  🔙 Rollback ke    : [checkpoint]
│  📋 Klaim ditarik  : [klaim yang invalid]
│  🔧 Recovery       : [aksi pemulihan]
└──────────────────────────────────────────────┘
```

## ALWAYS DO THIS

- Start every output with either the full I AM CRAZY block or the minimal `🔥 I AM CRAZY` brand line.
- Read `skill-router.json` → match task → read matched `SKILL.md` → fill the header → then produce output.
- Include validation command AND its result (not just the command name).
- State risk honestly — underreporting risk is worse than overreporting.

## Mandatory Pre-Flight Bundle

Before any substantive task, read this full bundle in order:

1. `.agent/skills/session-boot/SKILL.md`
2. `.agent/skills/auto-pro-standards/SKILL.md`
3. `.agent/skills/prompt-amplifier/SKILL.md`
4. `.agent/skills/phased-delivery/SKILL.md`
5. `.agent/skills/project-memory/SKILL.md`
6. `.agent/skills/self-review-gate/SKILL.md`
7. `.agent/rules/mandatory-skill-usage.md`
8. `.agent/rules/fail-closed-governance.md`
9. `PROJECT_MEMORY.md`
10. `.agent/skill-router.json`
11. `.agent/active-skills.json`
12. `.agent/official-reference-map.json`
13. `.agent/memory/lessons-learned.md`

After this bundle, read every matched technical `SKILL.md` from the router before writing code, review findings, deployment steps, or substantive content.

### Mandatory Bundle Proof

For substantive final responses, `Diperiksa` must include either the exact bundle files or this concise proof:

`mandatory governance bundle (7 files), PROJECT_MEMORY.md, skill-router.json, active-skills.json, official-reference-map.json, lessons-learned.md, plus [matched skill files]`

If an agent cannot truthfully say this was read, it must stop and read the bundle before acting.

### Zero-Waste Ledger Rule

The mandatory bundle must be read, but `Skill aktif` should list only skills that actually shaped the output. A skill counts as applied only if it changed a decision, prevented a risk, selected validation, or produced an artifact.

## NEVER DO THIS

- Never skip the header on substantive tasks hoping nobody notices.
- Never fill the header with generic placeholder text ("various files", "standard validation").
- Never copy a previous session's header without re-checking — context changes between sessions.
- Never treat this as optional "nice to have" formatting — it is a hard gate.
- Never self-authorize a bypass after detecting a governance violation.

## Sub-Agent Propagation

When dispatching sub-agents, include this instruction:

> "You must use the `session-boot` skill. Begin your response with the I AM CRAZY header. Read `.agent/skills/session-boot/SKILL.md` for the exact format."

## Examples

### ✅ Good — Specific, verifiable, honest

```
┌──────────────────────────────────────────────┐
│  🔥 I AM CRAZY                                │
│  ═══════════════════════════════════════════  │
│  🧠 Skill aktif    : gsap-core, gsap-scrolltrigger, frontend-design
│  📂 Diperiksa      : src/components/Hero.jsx, package.json
│  ✏️  Diubah         : src/components/Hero.jsx (added scroll animation)
│  🧪 Validasi       : npm run build → exit 0, visual check in Chrome DevTools
│  ⚠️  Risiko tersisa : belum ditest di Safari, reduced-motion belum dihandle
│  🔢 Token terpakai : ~3.2k
└──────────────────────────────────────────────┘
```

Why this passes: every field has a concrete value, the validation includes the actual result (`exit 0`), and the residual risk is honest (Safari + a11y gap named).

### ❌ Bad — Generic, unverifiable, hidden risk

```
🔥 I AM CRAZY
🧠 Skill aktif    : best practices
📂 Diperiksa      : various files
✏️  Diubah         : updated the code
🧪 Validasi       : looks good
⚠️  Risiko tersisa : none
```

Why this fails:
- `best practices` is not a real skill name in `.agent/skills/`.
- `various files` hides what was actually read — reviewer cannot audit.
- `looks good` is not a validation command and has no result.
- `none` for risk is almost always a lie — at minimum "not tested on $other_browser" applies.

### 🟡 Edge case — No skill matched, no validation possible

```
┌──────────────────────────────────────────────┐
│  🔥 I AM CRAZY                                │
│  ═══════════════════════════════════════════  │
│  🧠 Skill aktif    : no skill matched (task: rename a one-line typo in README)
│  📂 Diperiksa      : README.md (lines 12-14)
│  ✏️  Diubah         : README.md (1 char typo fix)
│  🧪 Validasi       : no validation available (docs-only change, no build step)
│  ⚠️  Risiko tersisa : none identified (visual diff inspected)
│  🔢 Token terpakai : ~400
└──────────────────────────────────────────────┘
```

Why this is acceptable: when no skill matches, the agent says so **with the task** (so reviewer can decide if routing was correct). "No validation available" is OK if the reason is given.

## Failure Modes — Real Patterns to Avoid

- **Header at the end instead of the start** → reviewer reads output first, then header is just a checklist applied retroactively. Always emit the header BEFORE substantive output.
- **Copy-pasting last session's header** → context changes; skills, files, and validation all differ per task. Always re-derive.
- **Padding the `Skill aktif` field with unused skills** → claiming `code-reviewer` when the agent never read it = lying. Only list skills whose SKILL.md was actually read this turn.
- **Validating only after writing the header** → leads to `Validasi: pending`. Run validation, then write the header.

## Validation

How to verify the agent actually followed this skill:

1. **Header presence** — every substantive response must start with `🔥 I AM CRAZY` within the first 5 lines.
2. **Skill cross-check** — every name in `Skill aktif` must exist as a directory under `.agent/skills/`. Verify with:

   ```bash
   ls -d .agent/skills/<skill-name>
   ```

3. **File evidence** — every path in `Diperiksa` / `Diubah` must exist (or be the file the agent just created). Verify with `ls` or `git status`.
4. **Validation reality** — the command in `Validasi` should be re-runnable; the stated result should match what running it now produces.
5. **Risk audit** — if `Risiko tersisa: none`, ask one probing question (untested browser? edge input? concurrency?). If the agent cannot answer, the field was filled dishonestly.

A self-review script that scans the most recent assistant turn for the header pattern can automate step 1. See `self-review-gate` for the full delivery gate.

## Related

- `.agent/rules/mandatory-skill-usage.md` — the rule this header proves compliance with.
- `self-review-gate` — runs after the work; this skill runs before. Both required.
- `project-memory` — header references project context; ensure `PROJECT_MEMORY.md` was read when relevant.
