# Safe Command Registry

This file defines command behavior for agent work in this repository.

## Always Safe To Read

These commands are read-only or low-risk:

```bash
git status --short
git diff --stat
git diff
git log -1 --oneline
node .agent/scripts/validate-agent-skills.mjs
node .agent/scripts/detect-project.mjs
node .agent/scripts/agent-doctor.mjs
```

## Safe After Inspecting Project Files

Run these only after reading the relevant package/config file:

```bash
npm run build
npm run lint
npm test
pnpm build
pnpm lint
pnpm test
yarn build
yarn lint
yarn test
```

## Requires Explicit User Intent

These are allowed only when the user clearly asks for them or approves them:

```bash
git add
git commit
git push
npm install
pnpm install
yarn install
```

## High-Risk / Do Not Run Without Specific Approval

- Recursive delete or force delete commands.
- `git reset --hard`, `git clean -fd`, or broad checkout/restore commands.
- Commands targeting drive roots such as `D:\`, `C:\`, `/`, or the user home directory.
- Any command that reads or writes outside the active workspace.
- Any script inside `.agent/skills` unless its `SKILL.md` and source code have been reviewed.
- Any command involving credentials, production deploys, payments, databases, or auth migration.
- `node .agent/scripts/prune-orphan-skills.mjs --confirm` — deletes skill directories with `fs.rmSync(recursive: true, force: true)`. Only run `--confirm` after the operator has reviewed the dry-run output (default mode, no flag) and explicitly approved the deletion list.
- `node .agent/scripts/restore-skill-bundle.mjs <bundle>` — runs `git checkout <ref> -- <paths>` against `.agent/skills/<bundle-paths>`, which silently discards any uncommitted local edits to those exact paths. Before running it, check for local drift with `git status --short -- .agent/skills` and get explicit confirmation if that command returns any output.

## Rule

If a command can modify files, install software, contact external services, push to GitHub, delete data, or expose secrets, the agent must explain the reason and wait for permission unless the user already gave explicit instruction for that exact operation.
