---
name: react-native-architecture
description: "Architect production React Native and Expo apps with feature boundaries, navigation, state management, native module isolation, offline-first data, performance budgets, testing gates, and EAS-aware release structure."
risk: safe
source: community
date_added: "2026-02-27"
---

# React Native Architecture

Production-ready patterns for React Native development with Expo, including navigation, state management, native modules, and offline-first architecture.

## When to Use

- Starting a new React Native or Expo project
- Implementing complex navigation patterns
- Integrating native modules and platform APIs
- Building offline-first mobile applications
- Optimizing React Native performance
- Setting up CI/CD for mobile releases

## Do not use this skill when

- The task is unrelated to react native architecture
- You need a different domain or tool outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.
- If detailed examples are required, open `resources/implementation-playbook.md`.

## ALWAYS DO THIS

- Define architecture boundaries first: app shell, feature modules, shared UI, domain logic, data access, native adapters, and test utilities.
- Keep navigation state, server cache, local UI state, and offline queue responsibilities separate.
- Isolate native modules and platform APIs behind typed service adapters so Expo Go/dev-client/release differences are explicit.
- Design offline-first flows with cache policy, sync conflict rules, retry behavior, and user-visible recovery states.
- Add a validation gate for every architecture change: typecheck, tests, Expo doctor, and at least one simulator/device smoke check when native behavior changes.

## NEVER DO THIS

- NEVER put API calls, persistence, navigation side effects, and UI rendering into one screen component.
- NEVER introduce a native module without deciding whether Expo Go, dev client, config plugin, and EAS Build behavior still match the project.
- NEVER store server cache, form state, auth state, and navigation state in one global store.
- NEVER ignore app lifecycle transitions; background refresh, cold start, and permission revocation can break otherwise valid architecture.
- NEVER claim "offline-first" without conflict resolution, retry queues, stale-data indicators, and failure recovery.

## Reference Pattern

```text
app/                 # Expo Router routes only
src/features/auth/   # screens, hooks, service, tests for one domain
src/shared/ui/       # reusable presentation components
src/shared/data/     # query client, storage adapters, sync queue
src/native/          # typed wrappers for device APIs and native modules
```

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.

## Validation Commands

```bash
npx tsc --noEmit
npx expo-doctor
npm test
```

If navigation, native modules, or offline sync changed, add a simulator/device smoke test that covers cold start, background/foreground, and network loss.

## Why This Exists

React Native applications combine JavaScript state, server cache, navigation, persistence, native modules, and platform lifecycle behavior. Without explicit boundaries, screens become tightly coupled and offline, native rebuild, testing, and release changes acquire a large regression radius.

## Failure Modes

- One global store mixes auth, forms, server cache, navigation, and offline queues.
- Screen components perform API calls, persistence, navigation side effects, and rendering together.
- Native modules are imported directly across features without typed platform adapters.
- Offline-first is claimed without stale indicators, retry queues, conflict policy, or recovery UX.
- Architecture is validated only by static types and never through cold start, lifecycle, and network-loss behavior.

## Validation

1. **Boundary scan** - Review the feature tree and confirm routes, domain logic, data access, UI, and native adapters are separated.
2. **Type safety** - Run `npx tsc --noEmit`; expect zero cross-boundary type or import errors.
3. **Project health** - Run `npx expo-doctor`; resolve Expo, React Native, config plugin, and native dependency issues.
4. **Runtime proof** - Test cold start, navigation restoration, background/foreground, offline queueing, and network recovery on a target device.

## Sub-Agent Propagation

When delegating React Native architecture work, require the sub-agent to read `.agent/skills/react-native-architecture/SKILL.md` and its implementation playbook, preserve feature boundaries, isolate native adapters, and return type, Expo doctor, and lifecycle/offline evidence.

## Scope Boundaries
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
