---
name: github-actions-templates
description: Production-ready GitHub Actions workflow patterns for testing, building, and deploying applications.
risk: high (pipeline failures, exposed tokens, caching locks, broken status checks)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GitHub Actions Templates

> **One-liner:** Guidelines for writing secure, cached, and multi-job GitHub Actions workflows for continuous integration (CI) and continuous deployment (CD).

## When to Use

- When configuring automated testing, linting, and build pipelines inside `.github/workflows/`.
- When integrating continuous delivery deployment routes to platforms like AWS, Docker Registry, or Vercel.
- When setting up dependency caching policies to optimize pipeline run durations.

## Why This Exists

GitHub Actions automate verification checks, but poorly written configurations slow down delivery and compromise credentials. If a workflow hardcodes third-party access keys or tokens directly in the YAML files, the credentials leak publicly. Additionally, running steps without dependencies caching forces the virtual machine to download packages from scratch on every run, wasting minutes. Enforcing environment secrets, caching mechanisms, and isolated parallel jobs secures and accelerates the integration lifecycle.

## ALWAYS DO THIS

- **Use GitHub Secrets for private keys** — Bind sensitive values via `${{ secrets.NAME }}` inside the workflow environment parameters.
- **Configure packages and build caches** — Implement actions cache actions (e.g., `actions/cache` or setting the `cache` property in setup utilities) to save `node_modules` or pip outputs.
- **Deconstruct workflows into isolated jobs** — Separate tasks (such as `lint`, `test`, `build`, and `deploy`) into distinct jobs linked by dependency paths (`needs`).
- **Enforce branch protection status checks** — Require success checks on actions before pull requests can be merged to main branches.
- **Pin action steps to explicit versions** — Use specific tags or commit SHA hashes (e.g. `actions/checkout@v4`) instead of raw branch names to prevent third-party supply-chain breaks.

## NEVER DO THIS

- ❌ **DO NOT** commit raw access tokens, API keys, or database URLs inside YAML configuration files. **Why fails:** The credentials become visible to anyone with access to the repository, compromising account security. **Instead:** Reference them via `secrets`.
- ❌ **DO NOT** write a single giant job containing all lint, test, build, and deploy steps. **Why fails:** If one of the initial tests fail, identifying the step is difficult, and steps cannot execute in parallel, increasing queue durations. **Instead:** Split them into multiple structured jobs using the `needs:` keyword.
- ❌ **DO NOT** use unpinned `latest` or generic references in action steps. **Why fails:** Updates to third-party actions can introduce breaking changes that break builds without warning. **Instead:** Pin to specific version tags.
- ❌ **DO NOT** run deployment jobs on pull requests from unverified external forks. **Why fails:** External forks can run modified code that prints secret environment variables or accesses staging environments. **Instead:** Restrict deployment steps using `if: github.ref == 'refs/heads/main'` checks.

---

## CI/CD Pipeline Workflow

Isolating and connecting pipeline jobs ensures verification checks run before deployment actions:

```
[PR / Push Trigger] ──> [Job: Lint / Test] ──> [Job: Build Bundle] ──> [Job: Deploy Server]
```

---

## Examples

### ✅ Good — Multi-Job Pipeline, Cache Settings, and Secrets Configuration

#### 1. Next.js Verification and Deployment Pipeline (`.github/workflows/ci-cd.yml`)
```yaml
name: Continuous Integration & Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 1. Verification Job (Linting & Testing)
  verify:
    name: Verify Codebase Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          # 2. Configures package manager caching
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Run Tests
        run: npm test

  # 3. Deployment Job (Runs only on main branch success)
  deploy:
    name: Deploy to Production
    needs: verify
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Deploy Frontend to Vercel
        env:
          # 4. Accesses tokens securely from GitHub Secrets
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: npx vercel --token $VERCEL_TOKEN --prod --yes
```

Why this passes: Separates concerns into distinct verification and deployment jobs, implements npm packages caching, binds tokens using GitHub Secrets, and restricts deployment to main branch pushes.

### ❌ Bad — Hardcoded Tokens, Uncached Packages, and Mono-Job Runs

```yaml
# ERROR 1: Triggering deploy on all events (including external PRs)
name: Bad Pipeline Trigger
on: [push, pull_request]

jobs:
  everything:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repo
        uses: actions/checkout@v2

      # ERROR 2: Missing caching configuration forces fresh package download
      - name: Setup Node
        uses: actions/setup-node@v2 

      # ERROR 3: Single massive job combining test and deploy
      - name: Install and Run everything
        run: |
          npm install
          npm run test
          
      # ERROR 4: Hardcoding sensitive tokens directly in the config file
      - name: Bad Vercel Deploy
        run: npx vercel --token "secret_token_val_xyz123" --prod --yes
```

Why this fails: Combines testing and deployments in a single job, lacks caching, exposes tokens in cleartext, and triggers deployments on unverified PR requests.

---

## Failure Modes

- **The Secret Leak Exposure:** Hardcoding private keys directly inside YAML scripts, letting them leak to logs or source files.
- **The Uncached Package Lock:** Omitting npm/pip package cache keys, adding minutes of download latency to every run.
- **The Mono-Job Blocker:** Running lint, test, and build steps in a single job without dependency linking.
- **The External Fork PR Deploy:** Triggering deployment tasks on PR pushes from external forks without environment validations.
- **The Supply Chain Break:** Referencing unpinned external actions, causing pipelines to crash when developers publish breaking updates.
- **The Stale Cache Collision:** Using generic or unversioned cache keys, returning broken state caches across different branches.

## Validation

Audit GitHub Actions workflow files for credentials security, cache settings, and job dependencies:

1. **Verify that no cleartext API keys are present in workflow files:**
   Check workflow configurations:
   ```bash
   grep -rn "secrets\." .github/workflows/ || echo "Warning: Check for unreferenced keys"
   # expected: All sensitive configuration variables are referenced from secrets.
   ```
2. **Verify that packages caching is configured:**
   Verify setup actions:
   ```bash
   grep -rn "cache:" .github/workflows/
   # expected: Setup steps include caching definitions ('npm', 'yarn', or 'actions/cache').
   ```
3. **Verify distinct job separations:**
   Verify job names and needs parameters:
   ```bash
   grep -rn "needs:" .github/workflows/
   # expected: Downstream build/deploy jobs specify dependencies on verification tests.
   ```
4. **Confirm deployment triggers constraints:**
   Check branches targets constraints to ensure deployment jobs restrict execution to the main branch.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi GitHub Actions:

> "Use the skill `github-actions-templates`. Read `.agent/skills/github-actions-templates/SKILL.md` before coding. Never write hardcoded keys or build without caching. Always split test/deploy tasks into distinct jobs, bind tokens from secrets, and pin step version tags."

## Related

- [vercel-deployment](../vercel-deployment/SKILL.md) — Production frontend delivery.
- [environment-setup-guide](../environment-setup-guide/SKILL.md) — Node/Python setups.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Credentials management.
