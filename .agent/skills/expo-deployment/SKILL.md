---
name: expo-deployment
description: "Deploy Expo apps to production with EAS Build, EAS Submit, app store release metadata, OTA update channels, staged rollouts, rollback planning, and production validation."
risk: safe
source: "https://github.com/expo/skills/tree/main/plugins/expo-deployment"
date_added: "2026-02-27"
---

# Expo Deployment

## Overview

Deploy Expo applications to production environments, including app stores and over-the-air updates.

## When to Use This Skill

Use this skill when you need to deploy Expo apps to production.

Use this skill when:
- Deploying Expo apps to production
- Publishing to app stores (iOS App Store, Google Play)
- Setting up over-the-air (OTA) updates
- Configuring production build settings
- Managing release channels and versions

## Instructions

This skill provides guidance for deploying Expo apps:

1. **Build Configuration**: Set up production build settings
2. **App Store Submission**: Prepare and submit to app stores
3. **OTA Updates**: Configure over-the-air update channels
4. **Release Management**: Manage versions and release channels
5. **Production Optimization**: Optimize apps for production

## Deployment Workflow

### Pre-Deployment

1. Ensure all tests pass
2. Update version numbers
3. Configure production environment variables
4. Review and optimize app bundle size
5. Test production builds locally

### App Store Deployment

1. Build production binaries (iOS/Android)
2. Configure app store metadata
3. Submit to App Store Connect / Google Play Console
4. Manage app store listings and screenshots
5. Handle app review process

### OTA Updates

1. Configure update channels (production, staging, etc.)
2. Build and publish updates
3. Manage rollout strategies
4. Monitor update adoption
5. Handle rollbacks if needed

## Best Practices

- Use EAS Build for reliable production builds
- Test production builds before submission
- Implement proper error tracking and analytics
- Use release channels for staged rollouts
- Keep app store metadata up to date
- Monitor app performance in production

## ALWAYS DO THIS

- Confirm the release target first: internal build, TestFlight/Internal App Sharing, production store submission, or OTA update.
- Keep versioning explicit: update `version`, `ios.buildNumber`, `android.versionCode`, and EAS channels before building.
- Build from a clean release branch and record the exact EAS profile used (`preview`, `production`, or a named rollout profile).
- Validate production configuration with `npx expo-doctor`, `eas build:configure`, or project-specific checks before submitting.
- Prepare rollback: know the previous binary version, OTA channel, and command needed to republish or revert an update.

## NEVER DO THIS

- NEVER submit a production binary that has only been tested in Expo Go; test the exact EAS build artifact.
- NEVER mix staging API keys, bundle identifiers, package names, or update channels into production releases.
- NEVER use OTA updates for native-code changes; build and submit a new binary when native dependencies or config plugins change.
- NEVER rotate signing credentials, bundle IDs, or package names during a deployment unless the task explicitly includes that migration.
- NEVER claim a release is ready without checking store metadata, privacy disclosures, screenshots, and crash/error monitoring.

## Validation Commands

```bash
npx expo-doctor
eas build:list --limit 5
eas channel:list
```

For store submissions, also verify the submitted build in App Store Connect or Google Play Console before marking the phase complete.

## Resources

For more information, see the [source repository](https://github.com/expo/skills/tree/main/plugins/expo-deployment).

## Why This Exists

Expo deployment combines binary versioning, signing credentials, store metadata, EAS profiles, and OTA channels. A release can build successfully yet still ship the wrong environment, an incompatible OTA update, or an untested artifact. This skill makes the release evidence and rollback path explicit.

## Failure Modes

- A production submission points to staging APIs or uses the wrong bundle identifier/package name.
- An OTA update changes native code and crashes users whose installed binary lacks the required native module.
- The team validates Expo Go but never installs the exact production or preview artifact.
- Build numbers, app versions, and update channels drift, making rollback and support diagnosis ambiguous.
- Store privacy declarations, screenshots, review notes, or monitoring setup are missing at submission time.

## Validation

1. **Project health** - Run `npx expo-doctor`; expect no unresolved SDK or dependency compatibility errors.
2. **Artifact evidence** - Run `eas build:list --limit 5`; confirm the target platform, profile, version, and build status.
3. **Channel evidence** - Run `eas channel:list`; confirm production and staging channels map to the intended branches.
4. **Release acceptance** - Install the exact artifact, test the critical flow, and verify its store/TestFlight/Internal App Sharing record before marking the release ready.

## Sub-Agent Propagation

When delegating an Expo release, require the sub-agent to read `.agent/skills/expo-deployment/SKILL.md`, name the platform/profile/channel, avoid credential changes, validate the exact artifact, and return a rollback plan plus build evidence.

## Scope Boundaries
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
