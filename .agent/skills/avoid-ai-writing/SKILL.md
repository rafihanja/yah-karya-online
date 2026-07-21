---
name: avoid-ai-writing
description: Audit and rewrite content to remove categories of AI writing patterns with replacement tables.
risk: low (formatting checks, vocabulary filters)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Avoid AI Writing

> **One-liner:** Guidelines for detecting and auditing common LLM buzzwords, flowery introductory clauses, and repetitive transitional phrases in technical documentation.

## When to Use

- When writing public-facing release notes, repository documentation, or markdown guides.
- When proofreading generated code comments or explanation blocks to remove robotic tones.
- When auditing technical writing for clarity, conciseness, and readability.

## Why This Exists

Large Language Models (LLMs) have a strong built-in bias toward using flowery, dramatic, and repetitive vocabulary (e.g. "delve", "tapestry", "testament", "crucial", "beacon"). They also pad paragraphs with empty introductory statements like "In today's digital era" or "It is important to remember that." These patterns dilute the value of technical content, make reading tedious, and flag the text as generic AI output. Enforcing word replacement audits keeps documentation professional and direct.

## ALWAYS DO THIS

- **Use factual, measurable adjectives** — Replace subjective buzzwords (like "revolutionary" or "significant") with concrete data or metrics (e.g., "reduces bundle size by 30%").
- **Audit drafts against forbidden word lists** — Actively scan texts to replace common LLM words like "delve", "tapestry", "demystify", "embark", or "testament".
- **Transition paragraphs logically** — Connect thoughts using clear headings and logical structure rather than transitional keywords like "In conclusion" or "Additionally".
- **Write direct introductions** — Start paragraphs directly with the primary technical subject instead of setting up long, generic contexts.
- **Maintain a technical, professional tone** — Focus on explaining how the code functions rather than making claims about its impact.

## NEVER DO THIS

- ❌ **DO NOT** begin a paragraph with conversational introductory filters (e.g., "Firstly, let's explore", "It is crucial to note that"). **Why fails:** Signals generic AI filler text and slows down read times. **Instead:** State the fact directly (e.g., "The database must...").
- ❌ **DO NOT** use dramatic or flowery descriptors (e.g., "This codebase stands as a testament to clean design"). **Why fails:** Employs subjective marketing-speak that lacks technical utility. **Instead:** State concrete facts (e.g., "This module decouples visual elements from logic structures").
- ❌ **DO NOT** conclude a section with generic summaries (e.g., "In summary, these changes will help you build better apps"). **Why fails:** Pads documentation with low-value, repetitive summaries. **Instead:** End with a verification command or an immediate next-step pointer.

---

## AI Word Replacement Guide

| Forbidden AI Word | Recommended Clean Alternative |
|-------------------|--------------------------------|
| "delve into" | "analyze", "examine", "read" |
| "tapestry" | "system", "architecture", "structure" |
| "demystify" | "explain", "clarify" |
| "testament to" | "proof of", "evidence of" |
| "embark on" | "start", "begin" |
| "significant / revolutionary" | *State the actual metric (e.g., "30% reduction")* |
| "it is important to note that" | *Omit and write the statement directly* |

---

## Examples

### ✅ Good — Direct, Factual Technical Descriptions

```markdown
### Bundle Size Analysis

The latest refactoring replaced wildcard imports with direct file references.

This change:
- Reduces the main JS bundle size from 350KB to 240KB (a 31% reduction).
- Lowers Lighthouse performance load times by 0.4 seconds.

Check bundle details:
```bash
npm run analyze
```
```

Why this passes: Avoids subjective buzzwords, details concrete performance improvements, and starts directly with the technical topic.

### ❌ Bad — Flowery Generalizations and AI Buzzwords

```markdown
### Demystifying the Tapestry of Code

In today's digital era, it is crucial to note that clean code stands as a testament to engineering excellence. Let's delve into this revolutionary refactoring journey. Embarking on this path will significantly elevate your developer experience.
```

Why this fails: Uses forbidden words ("demystifying", "tapestry", "testament", "delve", "embark", "significantly"), uses filler intros ("it is crucial to note that"), and lacks metrics.

---

## Failure Modes

- **The Flowery Tapestry Pattern:** Describing technical modules using artistic or literary adjectives instead of functional descriptions.
- **Empty Introductory Padding:** Adding paragraphs of setup text before introducing the actual command or code change.
- **Unsupported Claims:** Declaring a change is "highly optimized" or "revolutionary" without providing validation metrics or benchmarks.

## Validation

Cara memverifikasi kepatuhan penggunaan `avoid-ai-writing`:

1. **Scan for forbidden AI words:**
   Verify that documentation does not contain common buzzwords:
   ```bash
   grep -rn -E "(delve|tapestry|demystify|testament to|embark on)" docs/
   # Expected: no matches found
   ```
2. **Check for missing metrics on claims:**
   Confirm that statements claiming performance improvements are backed by metrics:
   ```bash
   grep -rn -E "(optimize|speed up|improve)" docs/
   # Verify that these statements include numbers/data
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis technical text:

> "Use the skill `avoid-ai-writing`. Read `.agent/skills/avoid-ai-writing/SKILL.md` before starting to write. Never use flowery words like 'tapestry' or 'delve' or include generic introductory padding. Always write concisely, back up performance claims with metrics, and keep documentation direct."

## Related

- [unslop](../unslop/SKILL.md) — Text density optimization.
- [code-reviewer](../code-reviewer/SKILL.md) — Documentation review guidelines.
