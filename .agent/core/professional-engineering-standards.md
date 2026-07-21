# Professional Engineering Standards

This file defines the professional-grade baseline for agent work in this repository. It is intentionally practical: use the highest rigor that fits the project size and risk, but do not skip safety just because the project is small.

## Source Standards

Use these standards as reference anchors:

- **Security**: OWASP Application Security Verification Standard (ASVS) for web application security requirements and verification thinking. Cross-reference the **OWASP Top 10:2025** risk list (current edition, finalized Jan 2026 — there is no "2026" edition). Two 2025 additions are directly relevant to this repo's philosophy: **A03 Software Supply Chain Failures** (reinforces the SLSA/lockfile stance) and **A10 Mishandling of Exceptional Conditions** ("fail open instead of closed" — mirrors this repo's fail-closed governance).
- **Accessibility**: W3C Web Content Accessibility Guidelines (WCAG) 2.2 AA for user-facing web UI. WCAG 2.2 remains the current W3C Recommendation (also ISO/IEC 40500:2025); WCAG 3.0 is still a Working Draft (~2028+) and is NOT a compliance target yet.
- **Performance**: Core Web Vitals — **LCP ≤ 2.5s, INP < 200ms, CLS < 0.1** at the 75th percentile of real users. INP replaced First Input Delay (FID) as a Core Web Vital on 2024-03-12; do not cite FID as a current metric.
- **Supply chain**: SLSA for build integrity and software supply-chain risk.
- **Project evidence**: local files, manifest, package scripts, command output, and explicit user instruction.
- **User-designated technical references**: `.agent/official-reference-map.json`
  plus `.agent/rules/official-reference-verification.md`.

References checked on 2026-07-20:

- https://owasp.org/www-project-application-security-verification-standard/
- https://owasp.org/Top10/2025/
- https://www.w3.org/TR/WCAG22/
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://slsa.dev/

## Engineering Baseline

### Requirements

- Clarify ambiguous inputs when a wrong assumption could create rework, data loss, or security risk.
- If the user asks to proceed, state assumptions briefly and continue.
- Do not invent features, data, credentials, endpoints, or deployment state.
- For every substantive task, convert the work into scope, evidence, risk, alternatives where relevant, and validation. Do not wait for expert-level, maximum-capability, "1000x", "1000x lipat", or "1000 kali lipat" language, and do not treat those phrases as permission to edit unrelated files.

### Design

- Keep changes scoped to the requested behavior.
- Use existing project patterns before introducing new architecture.
- Add abstraction only when it removes real duplication or risk.
- Prefer readable, boring code over clever code.

### Security

- Validate external input.
- Treat file system, network, user input, environment variables, webhooks, and database/API responses as trust boundaries.
- Never commit real secrets, tokens, private keys, or `.env` files.
- Avoid `eval`, dynamic code execution, shell string construction, and unsafe deserialization.
- For auth, payment, database, deploy, or credential changes, increase verification rigor.

### Testing And Verification

- Run the strongest available local validation:
  - build
  - lint
  - typecheck
  - unit/integration tests
  - browser/UI verification for frontend changes
- If no validation exists, run syntax checks or explain the gap.
- Do not claim success without command output or file evidence.
- For mapped technical topics, verify uncertain or version-sensitive claims with the
  designated source and cross-check the result before delivery.
- If user correction reveals a technical mistake, record it in
  `.agent/memory/lessons-learned.md` before continuing.
- For `.agent` changes, include agent-kit validation (`validate-agent-skills`, `agent-doctor`, quality audit, and adapter dry-run when config changed).

### Frontend Quality

- Use semantic HTML where possible.
- Preserve keyboard access and focus behavior.
- Keep motion respectful of `prefers-reduced-motion`.
- Avoid layout shifts, text overlap, and animation of layout-heavy properties.
- For GSAP, prefer transforms and opacity, cleanup timelines/triggers, and route React work through `useGSAP`.

### Dependencies

- Do not add dependencies by default.
- Prefer built-in platform APIs and existing project packages.
- If a dependency is needed, explain why and verify package scripts still pass.

### Git And Delivery

- Keep commits focused.
- Do not mix unrelated work.
- Do not stage untracked folders unless explicitly requested.
- Before push, run the applicable quality gate and report what passed.

## Professional Completion Template

Use this structure for non-trivial work:

```text
Done:
- Changed: [files]
- Evidence: [files/commands inspected]
- Validation: [commands and result]
- Risk: [none / specific remaining risk]
- GitHub: [commit hash if pushed]
```
