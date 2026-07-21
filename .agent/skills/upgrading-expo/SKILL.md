---
name: upgrading-expo
description: "Upgrade Expo SDK versions safely by reviewing release notes, applying `expo install --fix`, migrating config and deprecated APIs, validating native dependencies, and testing iOS/Android/web builds."
risk: safe
source: "https://github.com/expo/skills/tree/main/plugins/upgrading-expo"
date_added: "2026-02-27"
---

# Upgrading Expo

## Overview

Upgrade Expo SDK versions safely, handling breaking changes, dependencies, and configuration updates.

## When to Use This Skill

Use this skill when you need to upgrade Expo SDK versions.

Use this skill when:
- Upgrading to a new Expo SDK version
- Handling breaking changes between SDK versions
- Updating dependencies for compatibility
- Migrating deprecated APIs to new versions
- Preparing apps for new Expo features

## Instructions

This skill guides you through upgrading Expo SDK versions:

1. **Pre-Upgrade Planning**: Review release notes and breaking changes
2. **Dependency Updates**: Update packages for SDK compatibility
3. **Configuration Migration**: Update app.json and configuration files
4. **Code Updates**: Migrate deprecated APIs to new versions
5. **Testing**: Verify app functionality after upgrade

## Upgrade Process

### 1. Pre-Upgrade Checklist

- Review Expo SDK release notes
- Identify breaking changes affecting your app
- Check compatibility of third-party packages
- Backup current project state
- Create a feature branch for the upgrade

### 2. Update Expo SDK

```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Upgrade Expo SDK
npx expo install expo@latest

# Update all Expo packages
npx expo install --fix
```

### 3. Handle Breaking Changes

- Review migration guides for breaking changes
- Update deprecated API calls
- Modify configuration files as needed
- Update native dependencies if required
- Test affected features thoroughly

### 4. Update Dependencies

```bash
# Check for outdated packages
npx expo-doctor

# Update packages to compatible versions
npx expo install --fix

# Verify compatibility
npx expo-doctor
```

### 5. Testing

- Test core app functionality
- Verify native modules work correctly
- Check for runtime errors
- Test on both iOS and Android
- Verify app store builds still work

## Common Issues

### Dependency Conflicts

- Use `expo install` instead of `npm install` for Expo packages
- Check package compatibility with new SDK version
- Resolve peer dependency warnings

### Configuration Changes

- Update `app.json` for new SDK requirements
- Migrate deprecated configuration options
- Update native configuration files if needed

### Breaking API Changes

- Review API migration guides
- Update code to use new APIs
- Test affected features after changes

## Best Practices

- Always upgrade in a feature branch
- Test thoroughly before merging
- Review release notes carefully
- Update dependencies incrementally
- Keep Expo CLI updated
- Use `expo-doctor` to verify setup

## ALWAYS DO THIS

- Start with a clean branch and capture the current Expo SDK, React Native version, native dependencies, and EAS profiles.
- Read the target SDK release notes and migration notes before changing package versions.
- Use `npx expo install` and `npx expo install --fix` for Expo-managed packages so versions match the target SDK.
- Re-run config plugin, permission, and native-module checks because SDK upgrades can change generated native projects.
- Test at least the app start path, navigation, permissions, offline/network behavior, and production build profile after the upgrade.

## NEVER DO THIS

- NEVER upgrade Expo by bulk-editing `package.json` versions without `expo install --fix` and `expo-doctor`.
- NEVER skip release notes; deprecated APIs and config keys often fail only at runtime or during native build.
- NEVER merge an SDK upgrade that only passed web or Expo Go if the app ships native binaries.
- NEVER combine an SDK upgrade with unrelated feature work; keep the diff reviewable and reversible.
- NEVER ignore peer dependency warnings for native libraries, config plugins, Reanimated, navigation, or Expo modules.

## Validation Commands

```bash
npx expo-doctor
npx expo install --fix
npx tsc --noEmit
eas build --profile preview --platform android
```

Run the EAS build only when credentials and project policy allow it; otherwise document the missing release validation as remaining risk.

## Resources

For more information, see the [source repository](https://github.com/expo/skills/tree/main/plugins/upgrading-expo).

## Why This Exists

An Expo SDK upgrade changes a compatibility set spanning Expo modules, React Native, config plugins, native projects, Metro, and EAS builds. Editing package versions alone can leave a project that typechecks but fails at runtime or native compilation.

## Failure Modes

- Package versions are bulk-edited without using Expo-compatible resolution and doctor checks.
- Release notes and migration notes are skipped, leaving deprecated config or runtime APIs.
- The upgrade is tested only on web or Expo Go even though the app ships native binaries.
- Native modules, config plugins, permissions, Reanimated, or navigation remain on incompatible versions.
- Unrelated features are mixed into the SDK upgrade, making rollback and regression isolation difficult.

## Validation

1. **Compatibility repair** - Run `npx expo install --fix`; review every dependency change before accepting it.
2. **Doctor gate** - Run `npx expo-doctor`; expect no unresolved SDK compatibility problems.
3. **Code gate** - Run `npx tsc --noEmit` plus the repository test command for migrated APIs.
4. **Native proof** - Create or inspect a preview EAS build for each shipped platform and smoke-test startup, navigation, permissions, and native integrations.

## Sub-Agent Propagation

When delegating an Expo SDK upgrade, require the sub-agent to read `.agent/skills/upgrading-expo/SKILL.md`, name source and target SDK versions, keep the diff upgrade-only, follow official migration notes, and return doctor, type, test, and native-build evidence.

## Scope Boundaries
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
