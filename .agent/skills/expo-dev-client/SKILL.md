---
name: expo-dev-client
description: Build and distribute Expo development clients locally or via TestFlight
risk: unknown
source: community
version: 1.0.0
license: MIT
---

Use EAS Build to create development clients for testing native code changes on physical devices. Use this for creating custom Expo Go clients for testing branches of your app.

## When to Use
- You need an Expo development client because the app depends on custom native code or targets not supported by Expo Go.
- The task involves building, distributing, or testing EAS development builds on physical devices.
- You need guidance on when to choose a dev client versus staying on plain Expo Go.

## Important: When Development Clients Are Needed

**Only create development clients when your app requires custom native code.** Most apps work fine in Expo Go.

You need a dev client ONLY when using:
- Local Expo modules (custom native code)
- Apple targets (widgets, app clips, extensions)
- Third-party native modules not in Expo Go

**Try Expo Go first** with `npx expo start`. If everything works, you don't need a dev client.

## EAS Configuration

Ensure `eas.json` has a development profile:

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    },
    "development": {
      "autoIncrement": true,
      "developmentClient": true
    }
  },
  "submit": {
    "production": {},
    "development": {}
  }
}
```

Key settings:
- `developmentClient: true` - Bundles expo-dev-client for development builds
- `autoIncrement: true` - Automatically increments build numbers
- `appVersionSource: "remote"` - Uses EAS as the source of truth for version numbers

## Building for TestFlight

Build iOS dev client and submit to TestFlight in one command:

```bash
eas build -p ios --profile development --submit
```

This will:
1. Build the development client in the cloud
2. Automatically submit to App Store Connect
3. Send you an email when the build is ready in TestFlight

After receiving the TestFlight email:
1. Download the build from TestFlight on your device
2. Launch the app to see the expo-dev-client UI
3. Connect to your local Metro bundler or scan a QR code

## Building Locally

Build a development client on your machine:

```bash
# iOS (requires Xcode)
eas build -p ios --profile development --local

# Android
eas build -p android --profile development --local
```

Local builds output:
- iOS: `.ipa` file
- Android: `.apk` or `.aab` file

## Installing Local Builds

Install iOS build on simulator:

```bash
# Find the .app in the .tar.gz output
tar -xzf build-*.tar.gz
xcrun simctl install booted ./path/to/App.app
```

Install iOS build on device (requires signing):

```bash
# Use Xcode Devices window or ideviceinstaller
ideviceinstaller -i build.ipa
```

Install Android build:

```bash
adb install build.apk
```

## Building for Specific Platform

```bash
# iOS only
eas build -p ios --profile development

# Android only
eas build -p android --profile development

# Both platforms
eas build --profile development
```

## Checking Build Status

```bash
# List recent builds
eas build:list

# View build details
eas build:view
```

## Using the Dev Client

Once installed, the dev client provides:
- **Development server connection** - Enter your Metro bundler URL or scan QR
- **Build information** - View native build details
- **Launcher UI** - Switch between development servers

Connect to local development:

```bash
# Start Metro bundler
npx expo start --dev-client

# Scan QR code with dev client or enter URL manually
```

## ALWAYS DO THIS

- Try Expo Go first; introduce a dev client only when custom native code, config plugins, or unsupported native modules require it.
- Add a dedicated `development` profile in `eas.json` with `developmentClient: true` and keep it separate from production profiles.
- Rebuild the dev client whenever native dependencies, config plugins, entitlements, permissions, or app config change.
- Test on the physical device class that matters for the bug or feature; simulator-only validation is insufficient for native integrations.
- Start Metro with `npx expo start --dev-client` so the installed development build connects to the correct bundle mode.

## NEVER DO THIS

- NEVER treat a dev client as a production release candidate; it includes development tooling and launcher behavior.
- NEVER keep debugging-only native permissions, hosts, or endpoints when moving from a development profile to production.
- NEVER assume JavaScript-only reloads cover native changes; native dependency changes require a new EAS build.
- NEVER share unsigned or ad hoc builds without checking platform signing, tester access, and device registration constraints.
- NEVER ignore EAS build logs; signing, config plugin, and native compilation errors usually need source-level fixes.

## Validation Commands

```bash
eas build:list --limit 5
npx expo start --dev-client
```

After installation, launch the dev client on a target device and verify it can connect to the Metro server for the intended branch.

## Troubleshooting

**Build fails with signing errors:**
```bash
eas credentials
```

**Clear build cache:**
```bash
eas build -p ios --profile development --clear-cache
```

**Check EAS CLI version:**
```bash
eas --version
eas update
```

## Why This Exists

Development clients are native binaries, not JavaScript-only tooling. Without a clear rebuild boundary, teams waste time debugging stale native code, accidentally test production behavior in a development launcher, or distribute builds with the wrong permissions and endpoints.

## Failure Modes

- A native dependency changes but the team only reloads Metro, leaving the installed dev client stale.
- A dev client is treated as a production candidate even though it contains development launcher behavior.
- The EAS development profile inherits production signing, endpoints, or permissions incorrectly.
- A build works in a simulator but fails on a physical device that exercises camera, push, biometrics, or background execution.
- Testers cannot install or launch the build because signing, device registration, or access configuration was not checked.

## Validation

1. **Compatibility** - Run `npx expo-doctor`; resolve native dependency and config plugin issues.
2. **Build record** - Run `eas build:list --limit 5`; confirm a successful development-client build for the target platform.
3. **Bundler connection** - Run `npx expo start --dev-client`; verify the installed client opens the intended Metro project.
4. **Device proof** - Test the native feature on a representative physical device and record whether a rebuild was required.

## Sub-Agent Propagation

When delegating dev-client work, require the sub-agent to read `.agent/skills/expo-dev-client/SKILL.md`, justify why Expo Go is insufficient, name native changes that trigger rebuilds, and provide EAS plus physical-device validation evidence.

## Scope Boundaries
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
