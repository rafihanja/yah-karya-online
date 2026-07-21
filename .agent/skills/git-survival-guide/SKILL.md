---
name: git-survival-guide
description: Git version control survival patterns for developers, covering push protection recoveries, commit credentials purging, rebase conflict resolutions, and history recovery.
risk: medium (unintended history rewrites, data loss via hard resets, shared history pollution)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Git Survival Guide

> **One-liner:** Guidelines for navigating Git version control emergencies, resolving merge conflicts, stripping committed secrets from repository history, and recovering lost work using reflogs.

## When to Use

- When recovering from rejected pushes (due to remote conflicts, oversized binaries, or secret detection triggers).
- When purging exposed credentials (like `.env` files or API keys) from the entire repository commit history.
- When resolving complex rebase conflicts or recovering accidental deletions using `git reflog`.

## Why This Exists

Git keeps track of every commit. This means that if a secret key is accidentally committed to a repository, simply creating a new commit that deletes it does not solve the problem—the secret is still visible in the repository's history. Additionally, running force resets (`git reset --hard`) without backups can cause developers to lose hours of work. Establishing standard practices for interactive rebasing, credential removal, and recovery commands prevents security leaks and data loss.

## ALWAYS DO THIS

- **Verify status before staging changes** — Always run `git status` and `git diff --cached` before committing to verify that no sensitive files or debug lines are staged.
- **Isolate local edits before major actions** — Run `git stash` to back up your current work before starting a rebase, hard reset, or checkout operation.
- **Purge exposed keys from history** — If a secret is committed, use `git filter-repo` or BFG Repo-Cleaner to remove the file from all commits, then invalidate the keys immediately.
- **Integrate relative rebase merges** — Pull upstream updates using `git pull --rebase` to maintain a clean, linear git history.
- **Use standard commit message formats** — Structure commit messages using conventional prefixes (like `feat:`, `fix:`, `chore:`, `refactor:`) to improve project organization.

## NEVER DO THIS

- ❌ **DO NOT** use force pushing (`git push --force` or `-f`) on shared tracking branches without aligning with other collaborators. **Why fails:** Overwrites commits on the remote server, which can delete your teammates' work and disrupt development. **Instead:** Use `git push --force-with-lease`, which blocks the push if the remote branch has new commits.
- ❌ **DO NOT** commit credentials and try to hide them by deleting the files in a later commit. **Why fails:** The secret remains visible in the Git commit history and can be retrieved by anyone with repository access. **Instead:** Rewrite the history using `git filter-repo` to purge all references, and rotate the compromised keys.
- ❌ **DO NOT** run `git reset --hard` to discard local changes without saving your work first. **Why fails:** Discards unstaged modifications permanently, making it difficult to recover lost code. **Instead:** Stash your changes using `git stash` before resetting.
- ❌ **DO NOT** commit large binary assets (such as video files, build folders, or heavy databases) to the main tree. **Why fails:** Bloats the repository size, slowing down clone and pull times for all developers. **Instead:** Exclude binaries using `.gitignore` and upload assets to cloud storage.

---

## Conflict Resolution & Recovery Path

Safely merging remote changes prevents code loss and maintains history:

```
[Local Changes] ──> [git stash] ──> [git pull --rebase] ──> [Resolve Conflicts] ──> [git stash pop]
```

---

## Examples

### ✅ Good — Interactive Rebasing, Secret Purges, and Force-With-Lease Pushes

#### 1. Purging Committed Secrets from History
If `.env` was committed and needs to be completely removed from all branches and commit history:
```bash
# Install git-filter-repo utility (requires Python)
pip install git-filter-repo

# Force-remove the file from all commits in the repository history
git filter-repo --invert-paths --path .env

# Verify that the file is no longer present in git log references
git log --all --full-history -- .env

# Push the rewritten history to the remote repository
git push origin --force --all
```

#### 2. Resolving Merge Conflicts via Rebase
```bash
# 1. Stash current workspace changes to prevent conflicts
git stash

# 2. Rebase local commits on top of remote origin/main updates
git pull --rebase origin main

# 3. If a conflict occurs, resolve the highlighted files in your editor, then:
git add src/main.js
git rebase --continue

# 4. Restore stashed workspace changes
git stash pop
```

#### 3. Recovering Discarded Commits using Reflog
If an accidental `git reset --hard` deleted a commit:
```bash
# 1. List all recent operations, including resets and branch changes
git reflog
# Output:
# 5b4c3d2 HEAD@{0}: reset: moving to HEAD~1
# a1b2c3d HEAD@{1}: commit: feat: integrate dialog

# 2. Restore the branch to the exact state before the reset
git reset --hard a1b2c3d
```

Why this passes: Purges secrets from history, resolves conflicts cleanly using rebase flows, uses reflogs to recover lost commits, stashes changes before major resets, and pushes using force-with-lease.

### ❌ Bad — Plain Force Pushing, Leaked Secrets, and Hard Resets

```bash
# ERROR 1: Committing sensitive environment variables directly to the main branch
git add .env
git commit -m "add database keys"

# ERROR 2: Trying to hide the leak with a delete commit (keys remain in history)
git rm .env
git commit -m "fix: delete secret keys"

# ERROR 3: Running hard resets without backing up unstaged changes first
git reset --hard origin/main

# ERROR 4: Overwriting team commits on remote main branch using plain force push
git push origin main --force
```

Why this fails: Commits `.env` to repository history, attempts to cover leaks using basic deletes, runs hard resets without backing up stashed files, and pushes using plain force flags.

---

## Failure Modes

- **The Shared Push Overwrite:** Overwriting a colleague's commits on the remote server by using `git push -f` instead of `--force-with-lease`.
- **The Phantom Credentials Leak:** Uploading database passwords to GitHub, leaving them indexable in history logs.
- **The Unstaged Hard Reset:** Running `git reset --hard` on unstaged files, permanently losing local updates.

## Validation

Cara memverifikasi kepatuhan penggunaan `git-survival-guide`:

1. **Verify that force pushes use force-with-lease:**
   Check code or automation workflows for force push operations:
   ```bash
   git config --global alias.pushf "push --force-with-lease"
   # Confirm lease configs are active
   ```
2. **Verify gitignore rules for credentials:**
   Confirm directories like `.env` are listed:
   ```bash
   git check-ignore -v .env
   # Expected output shows matching rule line in gitignore
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengelola Git:

> "Use the skill `git-survival-guide`. Read `.agent/skills/git-survival-guide/SKILL.md` before coding. Never force push with plain force flags or cover leaked credentials using basic delete commits. Always stash local changes before resets, push using force-with-lease, and purge exposed secrets from history using git-filter-repo."

## Related

- [secrets-management](../secrets-management/SKILL.md) — Auditing secrets patterns.
- [env-fortress](../env-fortress/SKILL.md) — Environment variables setup.
- [codebase-audit-pre-push](../codebase-audit-pre-push/SKILL.md) — Pre-commit quality checks.
