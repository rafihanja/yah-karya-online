---
name: environment-setup-guide
description: Guide developers through setting up development environments with proper tools, dependencies, and configurations.
risk: medium (inconsistent tool versions, dependency conflicts, missing configuration templates, local vs server mismatches)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Environment Setup Guide

> **One-liner:** Guidelines for onboarding developers, pinning local runtime engines (nvm/pyenv), configuring environment templates, and verifying local database dependencies.

## When to Use

- When writing onboarding documentation or `setup.sh` installation scripts.
- When configuring local runtime environments using tools like Node.js Version Manager (`nvm`), Docker, or Virtualenvs.
- When creating standard `.env.example` templates for local configuration variables.

## Why This Exists

Inconsistent development environments across team members lead to the classic "works on my machine" problem, slowing down feature deliveries. If a developer uses a local Node.js version different from the production server, compile mismatches can crash deployments. Additionally, if the repository lacks a clear configuration template, onboarding developers must waste hours guessing required API keys. Enforcing engine version pinning, containerized backing services, and verification scripts ensures consistent environments.

## ALWAYS DO THIS

- **Pin engine versions in configs** — Define strict runtime versions using `.nvmrc` for Node or `.python-version` for Python projects.
- **Provide a complete .env.example** — Maintain a dummy environment template listing all configuration keys needed for local execution.
- **Use containers for backing services** — Configure a `docker-compose.yml` to spin up local database dependencies (Postgres, Redis) rather than requiring manual installation.
- **Automate verification checks** — Create a `setup.sh` or validation test script to confirm environment keys and packages are set up correctly.
- **Provide troubleshooting runbooks** — Document common installation errors (such as port conflicts or permission issues) and their solutions.

## NEVER DO THIS

- ❌ **DO NOT** instruct developers to install backend databases (like PostgreSQL or Redis) globally on their host machines. **Why fails:** Different members get different version configurations, leading to inconsistent schemas and features. **Instead:** Package backing services inside Docker Compose files.
- ❌ **DO NOT** run global node dependencies installations (e.g., `npm install -g package`). **Why fails:** Triggers permission errors (`EACCES`), and packages cannot be tracked inside repository dependency lockfiles. **Instead:** Pin dependencies locally in `package.json` under devDependencies.
- ❌ **DO NOT** omit instructions for configuring environment variables. **Why fails:** Onboarding developers encounter unhandled startup crashes without clear logs explaining which variables are missing. **Instead:** Include setup instructions in the README and provide `.env.example` files.
- ❌ **DO NOT** commit real secrets or `.env` files to source code version control. **Why fails:** Exposes production credentials to anyone reading the source code history. **Instead:** Add `.env` to `.gitignore`.

---

## Environment Setup Workflow

Using virtual engines and containerized databases ensures repeatable project runs:

```
[Repository Clone] ──> [nvm use / pyenv activate] ──> [docker-compose up -d] ──> [npm run dev / python run]
```

---

## Examples

### ✅ Good — Locked Versions, Environment Configurations, and Docker Backing Services

#### 1. Node Version Configuration (`.nvmrc`)
```
20.11.0
```

#### 2. Local Backing Services (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  # 1. Runs Postgres database in a container to prevent global installation drift
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: main_dev_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 3. Environment variables configuration (`.env.example`)
```
# Environment variables example template
NODE_ENV=development
PORT=3000

# PostgreSQL database connection string
DATABASE_URL=postgresql://dev_user:dev_password_123@localhost:5432/main_dev_db
```

Why this passes: Pin-locks node versions, runs Postgres using Docker container blocks, documents configurations using examples, and abstracts environments.

### ❌ Bad — Global Database Requests, Global Packages, and Exposed Secrets

```bash
# ERROR 1: Requesting global installation of database packages
sudo apt-get install postgresql postgresql-contrib 

# ERROR 2: Running global package installation (triggers EACCES permissions)
npm install -g nodemon ts-node 

# ERROR 3: Committing active credentials directly in setup scripts
echo "DATABASE_URL=postgresql://real_admin:real_password_999@real-server/prod" > .env
```

Why this fails: Instructs global DB installations, requires global npm modules, and prints real secret credentials directly to logs or configuration files.

---

## Failure Modes

- **The Version Drift Outage:** Compiling with unpinned host dependencies, resulting in compilation failures.
- **The Global Package EACCES:** Running global package installs, leading to terminal permission blocks.
- **The Empty Template Chase:** Omitting `.env.example` templates, forcing onboarding engineers to hunt down variables.
- **The Global DB Collision:** Running tests on a shared global postgres setup, leading to dirty table schema states.
- **The Committed Dotenv Secret:** Committing `.env` files to git because they were missing in `.gitignore`.
- **The Port Conflict Fail:** Hardcoding local ports (like `5432`), causing startup crashes if other services run on them.

## Validation

Audit project onboarding files, versions pins, and compose dependencies:

1. **Verify that engine versions configurations are present:**
   Check for configuration locks:
   ```bash
   ls .nvmrc .python-version package.json 2>/dev/null
   # expected: Environment engine keys or files are present.
   ```
2. **Verify that a dotenv template file exists:**
   Verify env files:
   ```bash
   ls .env.example 2>/dev/null
   # expected: The dummy .env.example file is present in the repository root.
   ```
3. **Verify backing services container definitions:**
   Check docker setups:
   ```bash
   ls docker-compose.yml 2>/dev/null
   # expected: Database dependencies are packaged inside docker-compose configurations.
   ```
4. **Confirm git exclusion rules for environment secrets:**
   Verify git ignore targets:
   ```bash
   grep -rn "^\.env$" .gitignore 2>/dev/null
   # expected: Local dotenv files are ignored by git rules.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi panduan setup:

> "Use the skill `environment-setup-guide`. Read `.agent/skills/environment-setup-guide/SKILL.md` before coding. Never demand global installations or expose credentials. Always pin versions in configs, provide .env.example templates, containerize databases in docker-compose, and exclude .env files in .gitignore."

## Related

- [deployment-validation-config-validate](../deployment-validation-config-validate/SKILL.md) — Config parsing.
- [vercel-deployment](../vercel-deployment/SKILL.md) — Hosting environments.
- [git-survival-guide](../git-survival-guide/SKILL.md) — Git exclusions templates.
