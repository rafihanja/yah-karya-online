---
name: unslop
description: Post-process AI-generated text to strip AI writing patterns (slop) before publishing.
risk: low (cosmetic editing, quality checks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Unslop Engine

> **One-liner:** Guidelines for post-processing AI-generated text to eliminate repetitive filler patterns, enforce active voice structures, and vary sentence length.

## When to Use

- When editing documentation files, README files, or markdown guides that feel wordy or robotic.
- When cleaning up system comments, instructions, or PR descriptions.
- When revising drafts to sound clear, concise, and direct.

## Why This Exists

AI models tend to produce wordy, redundant prose ("slop") characterized by constant sentence lengths, generic transition words, and passive constructions. This makes technical reading tedious. Standardizing on "unslop" guidelines ensures that documentation is punchy, utilizes active voice statements, and varies sentence rhythms, keeping explanations highly readable.

## ALWAYS DO THIS

- **Vary sentence length (Burstiness)** — Mix long explanation blocks with short, punchy statements. Sentence variety mimics natural writing and maintains reader interest.
- **Use direct active voice** — Structure sentences with the actor performing the action (e.g. "Run tests" rather than "Tests should be run by developers").
- **Cut filler phrases** — Strip out unnecessary words (like "crucial to note", "firstly", "delve into") to increase information density.
- **Use simple, concrete nouns** — Replace abstract jargon with simple, descriptive terms.
- **Enforce the 20% reduction rule** — Edit first drafts to reduce word counts by 20% while retaining the core technical message.

## NEVER DO THIS

- ❌ **DO NOT** write consecutive sentences of the same length. **Why fails:** Creates a monotonic rhythm that bores readers. **Instead:** Alternate short, medium, and long sentences to create a natural rhythm.
- ❌ **DO NOT** rely on passive voice constructions. **Why fails:** Dilutes ownership and makes sentences unnecessarily complex. **Instead:** Write in active voice.
- ❌ **DO NOT** use generic transition list markers (e.g., "In conclusion", "Additionally", "It is important to remember"). **Why fails:** Signals generic AI-generated filler text and wastes reader attention. **Instead:** Transition using logic and structural headings.

---

## Technical Text Patterns

| Slop/AI Pattern | Clean/Human Alternative |
|-----------------|-------------------------|
| "It is crucial to note that the database must be configured before running scripts." | "Configure the database before running scripts." |
| "This file was created in order to handle the retrieval of users." | "This file handles user retrieval." |
| "Furthermore, it should be noted that variables are stored in the memory." | "Variables are stored in memory." |

### Substance Counter-Signals (2026)

Slop is defined by *quality*, not origin — the useful question is "is this worth trusting?", not "was this AI-written?". Presence of these concrete signals is evidence the text is NOT slop; their absence is a red flag:

- **Numbers** — specific measurements, versions, thresholds (e.g. "INP < 200ms", "exit 0"), not "fast" or "good".
- **Named entities** — actual file paths, function names, commands, repo skills — not "various files", "the system".
- **Verifiable references** — links/paths a reader can open and check, not vague appeals to "best practices".

### Code Slop (distinct from prose slop)

AI-written code can compile, pass tests, and still be slop: structurally correct but architecturally thoughtless. Watch for **duplicated patterns across many files**, **complexity inflation** (needless abstraction), and **tests that mirror the implementation instead of validating behavior**. The danger is scale — the same small shortcut repeated across a codebase becomes debugging tax and production risk. Detection is hybrid: deterministic rules for enforceable gates + human/LLM review where intent matters. (Reference: research_findings.md §7.)

---

## Examples

### ✅ Good — Active Voice, High Information Density, and Sentence Variety

```markdown
### Database Migration Guide

Configure your database connection credentials inside `.env` before initiating migrations.

Run:
```bash
npm run db:migrate
```

This updates your schemas. If migrations fail, check your connection strings.
```

Why this passes: Uses direct commands ("Configure", "Run"), varies sentence length, and avoids generic transition words.

### ❌ Bad — Passive Voice, Fluffy Fillers, and Monotonic Rhythm

```markdown
Firstly, it is important to remember that in order for migrations to be run, the developer must verify that the environment configuration has been established correctly. It should be noted that if this is not done, errors will be encountered by the system. Consequently, in conclusion, always verify the variables.
```

Why this fails: Uses passive voice ("errors will be encountered"), pads text with filler phrases ("firstly", "consequently", "in conclusion"), and uses similar sentence lengths.

---

## Failure Modes

- **The Robotic Metronome:** Writing five sentences in a row with almost identical word counts, causing the text to read like a machine output.
- **Passive-Voice Obfuscation:** Writing "The API key was leaked" instead of "We leaked the API key," which hides the actor.
- **Transitions Flood:** Overloading paragraphs with transitional filler words, decreasing read speed.

## Validation

Cara memverifikasi kepatuhan penggunaan `unslop`:

1. **Grep filler-phrase patterns:**
   ```bash
   grep -rnE "(crucial to note|it is important|delve into|furthermore|in conclusion|firstly|moreover|additionally)" \
     --include="*.md" --include="*.mdx" .
   # expected: zero matches, or all justified by context
   ```
2. **Grep passive-voice red flags:**
   ```bash
   grep -rnE "(should be|will be|is being|are being|has been) [a-z]+ed\b" \
     --include="*.md" .
   # expected: zero matches in technical sentences; rewrite to active voice
   ```
3. **Word reduction sanity check:**
   ```bash
   # Compare draft vs final word count
   wc -w draft.md final.md
   # expected: final ≤ 80% of draft (20% reduction rule)
   ```
4. **Sentence length burstiness check (manual):**
   Sample 5 consecutive sentences in any paragraph. Count words per sentence. If standard deviation < 3 words, paragraph is monotonic — restructure.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis dokumentasi:

> "Use the skill `unslop`. Read `.agent/skills/unslop/SKILL.md` before writing. Never write long paragraphs with monotonic sentence structures. Always write in active voice, cut transition fillers, and keep documentation direct."

## Related

- [avoid-ai-writing](../avoid-ai-writing/SKILL.md) — Vocabulary lists checks.
- [code-reviewer](../code-reviewer/SKILL.md) — Documentation reviews.
