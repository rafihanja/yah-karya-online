---
name: monorepo-multi-bot
description: Workspace management for multiple bots and projects inside a single repository, covering workspaces configuration, shared code libraries, and selective environment setup.
risk: medium (dependency conflicts, cross-pollution of env variables, build step breaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Monorepo Multi-Bot

> **One-liner:** Guidelines for structuring monorepos containing multiple bots or services, configuring npm/yarn/pnpm workspaces, managing shared utility libraries, and isolating local environments.

## When to Use

- When organizing multiple distinct bot projects (e.g. Telegram bots, WhatsApp bots, automation scripts) inside a single repository.
- When refactoring and consolidating duplicate code (like logger modules or LLM provider code) into shared libraries.
- When resolving package dependency mismatches or locking configurations across project folders.

## Why This Exists

If a monorepo lacks formal workspace configurations (like npm or pnpm workspaces), developers install packages directly into the root folder. This causes dependency conflicts between projects (e.g. one bot requiring `whatsapp-web.js` v1 while another requires v2), breaking runtimes. Additionally, copying and pasting helper functions (like API failovers or rate limiters) across directories makes code updates tedious and introduces bugs. Implementing isolated workspace configurations, shared utility paths, and folder-level environment files prevents conflict and code duplication.

## ALWAYS DO THIS

- **Configure workspaces in root settings** — Define subprojects inside the `workspaces` field of the root `package.json` file.
- **Maintain project-level environment files** — Locate `.env` and `.env.example` configurations inside each project directory to prevent cross-pollution of credentials.
- **Isolate shared utility code** — Create a `shared/` directory at the root to package shared utilities (like logging, rate-limiting, and error boundaries).
- **Configure project-specific gitignores** — Define overrides in subdirectory `.gitignore` files for folder-specific assets (like outputs, media frames, or SQLite databases).
- **Maintain a root repository map** — Document the purpose, stack, and execution commands of all subprojects in the root `README.md`.

## NEVER DO THIS

- ❌ **DO NOT** install runtime dependencies directly in the workspace root without formal workspaces grouping. **Why fails:** Causes severe package mismatches and version lock conflicts between subprojects, breaking development builds. **Instead:** Configure pnpm or npm workspaces and install dependencies inside project folders.
- ❌ **DO NOT** duplicate utility functions (such as LLM failover managers or database clients) across multiple folders. **Why fails:** Leads to code drift and inconsistencies where a bug fix in one project is missed in another. **Instead:** Build shared libraries in a `shared/` folder and import them via workspace links or relative imports.
- ❌ **DO NOT** store a single `.env` file at the root containing keys for all subprojects. **Why fails:** Subprojects can access unrelated variables, increasing security exposure, and making containerized deployment setups complex. **Instead:** Maintain individual `.env` files within each project's subfolder.
- ❌ **DO NOT** execute run commands from project directories without configuring central scripting shortcuts in the root. **Why fails:** Forces developers to repeatedly change folders (`cd`) in terminal sessions, slowing down build runs. **Instead:** Define workspace scripts (e.g. `"npm run dev --workspace=my-bot"`) inside the root configuration.

---

## Monorepo Dependency Structure

Npm/pnpm workspaces isolate package resolutions while linking shared libraries:

```
gsap/ (Root) ── package.json (workspaces config)
               ├── shared/ (Common Utils) 
               ├── telegram-bot/ (Isolated package.json)
               └── whatsapp-bot/ (Isolated package.json)
```

---

## Examples

### ✅ Good — Workspace Configurations, Shared Modules, and Local gitignores

#### Root Config (`package.json`)
```json
{
  "name": "gsap-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "shared",
    "projects/*"
  ],
  "scripts": {
    "bootstrap": "npm install",
    "dev:tg": "npm run dev -w projects/telegram-bot",
    "dev:wa": "npm run dev -w projects/whatsapp-bot"
  }
}
```

#### Shared Utility Module (`shared/package.json`)
```json
{
  "name": "@gsap/shared",
  "version": "1.0.0",
  "main": "index.js",
  "private": true
}
```

#### Shared Utility Code (`shared/index.js`)
```javascript
export function sanitizeText(input) {
  return input.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]/g, "").trim();
}

export function buildRateLimiter(windowMs, limit) {
  const users = new Map();
  return (userId) => {
    const last = users.get(userId) || 0;
    const now = Date.now();
    if (now - last < windowMs) return true;
    users.set(userId, now);
    return false;
  };
}
```

#### Bot Integration Code (`projects/telegram-bot/index.js`)
```javascript
import { sanitizeText } from "@gsap/shared";
// Imports resolve cleanly via workspace package links
const clean = sanitizeText("Bot Message! 🚀");
console.log(clean);
```

Why this passes: Configures workspaces in root files, separates projects inside a `projects/` directory, references shared packages via workspace names, and uses single-command start hooks.

### ❌ Bad — Root Packages Pollution, Duplicate Codes, and Overlapping .env

```json
{
  "name": "unsafe-monorepo",
  // ERROR 1: Missing "workspaces" configurations, causing dependencies to install globally
  "dependencies": {
    "telegraf": "^4.16.3",
    "whatsapp-web.js": "^1.23.0",
    "cheerio": "^1.0.0-rc.12"
  },
  "scripts": {
    // ERROR 2: Direct hardcoded cd scripts that break if directories are moved
    "start": "cd telegram-bot && node bot.js" 
  }
}
```

#### Bot Code (`projects/telegram-bot/bot.js`)
```javascript
// ERROR 3: Duplicate helper function copied here from other folders (leads to code drift)
function sanitizeTextCopy(text) {
  return text.trim(); 
}

// ERROR 4: Expecting root-level .env variables to flow inside subdirectory scopes
const token = process.env.ROOT_SHARED_TELEGRAM_TOKEN; 
```

Why this fails: Lacks workspace rules, installs conflicting dependencies in the root folder, duplicates utility functions, and depends on global shared environment variables.

---

## Failure Modes

- **The Dependency Clash:** Installing conflicting versions of the same library in the root package, resulting in runtime compile failures.
- **Code Drift Desync:** Fixing a critical logic bug in one bot's parser helper but leaving the buggy duplicate intact in another directory.
- **The gitignored Upload Leak:** Committing secret tokens to GitHub because a subproject lacks an isolated `.gitignore` config.

## Validation

Cara memverifikasi kepatuhan penggunaan `monorepo-multi-bot`:

1. **Verify workspace settings are defined in root package.json:**
   Check for workspaces configs:
   ```bash
   grep -rn "workspaces" package.json
   # Confirm subfolders directory rules are set
   ```
2. **Verify shared package import links:**
   Ensure project modules resolve shared packages via dependency names (e.g. `@gsap/shared`) instead of fragile relative paths (e.g. `../../shared/`):
   ```bash
   grep -rn "@gsap/shared" projects/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengelola monorepo:

> "Use the skill `monorepo-multi-bot`. Read `.agent/skills/monorepo-multi-bot/SKILL.md` before coding. Never pollute the workspace root with duplicate packages or shared environment files. Always define workspace groups in root config files, decouple utilities into packages, and isolate gitignore rules."

## Related

- [secrets-management](../secrets-management/SKILL.md) — Isolated .env rules.
- [env-fortress](../env-fortress/SKILL.md) — Multi-environment targets.
- [codebase-audit-pre-push](../codebase-audit-pre-push/SKILL.md) — Workspace cleanups.
