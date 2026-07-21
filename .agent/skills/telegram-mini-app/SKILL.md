---
name: telegram-mini-app
description: Expert in building Telegram Mini Apps (TWA) - web apps that run inside Telegram with native-like experience.
risk: high (session spoofing, signature forgery, blockchain wallet integration failures)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Telegram Mini App (TWA)

> **One-liner:** Guidelines for developing secure Telegram Mini Apps (TWA), validating `initData` signatures on backends, integrating TON Connect wallet flows, and implementing theme-aligned UI features.

## When to Use

- When building web applications designed to load inside Telegram's internal webview frames.
- When validating client-side user sessions and IDs sent from Telegram inside a backend API.
- When integrating Web3 features (like TON blockchain transactions, connect buttons) inside a mobile app wrapper.

## Why This Exists

Many developers trust client-supplied information (like `initDataUnsafe.user`) blindly in their APIs. Because frontend variables can be manipulated in webview instances, this allows attackers to impersonate other accounts by changing query variables. Additionally, failing to call the SDK's initialization parameters causes Telegram to display infinite loading indicators on mobile screens. Enforcing backend HMAC verification and platform SDK boundaries guarantees application security and visual consistency.

## ALWAYS DO THIS

- **Validate signatures on the backend** — Verify the `hash` query parameter in `initData` using a SHA-256 HMAC of your bot token before authorizing user actions.
- **Initialize the SDK on startup** — Load the script tag `<script src="https://telegram.org/js/telegram-web-app.js"></script>` and execute `window.Telegram.WebApp.ready()` immediately on load.
- **Sync UI with platform theme parameters** — Access `WebApp.themeParams` colors via CSS variables to automatically match Telegram's light or dark styling.
- **Utilize native platform navigation buttons** — Bind interface triggers to `WebApp.MainButton` and `WebApp.BackButton` to mimic native system navigation.
- **Add mobile viewport headers** — Set `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` to prevent unwanted zoom scaling.

## NEVER DO THIS

- ❌ **DO NOT** authorize database actions or authenticate users using client-supplied `initDataUnsafe` parameters. **Why fails:** Attackers can easily intercept requests or rewrite Javascript payloads to pass arbitrary user IDs, gaining unauthorized account access. **Instead:** Perform HMAC signature checks of raw `initData` on the backend server.
- ❌ **DO NOT** use full-page redirects or `window.location.reload()` commands inside Mini Apps. **Why fails:** Disrupts the user experience by flashing a white screen and resets the webview state, breaking the native-like app feel. **Instead:** Build single-page app (SPA) views using client-side routing.
- ❌ **DO NOT** store sensitive session tokens or game balances inside browser `localStorage`. **Why fails:** Webview localStorage is volatile and can be wiped by mobile operating systems to free up space. **Instead:** Use the native Telegram CloudStorage API (`WebApp.CloudStorage`) or server-side persistent databases.
- ❌ **DO NOT** ignore platform UI colors by hardcoding absolute styling values. **Why fails:** Causes severe legibility issues when the user switches between Telegram's light and dark themes. **Instead:** Bind style properties to `var(--tg-theme-bg-color)` and related variables.

---

## Backend Authorization Signature Loop

Backend validation secures the API against request spoofing by validating data integrity:

```
[TWA Client] ── send raw initData ──> [Express Backend] ── calculates HMAC with Bot Token ──> [Confirm Match]
```

---

## Examples

### ✅ Good — Secure Backend Validation, SDK Checks, and Native buttons

#### Frontend Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Elite TWA</title>
  <!-- 1. Load the official Telegram WebApp SDK -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    /* 2. Bind theme attributes to platform CSS variables */
    body {
      background-color: var(--tg-theme-bg-color, #ffffff);
      color: var(--tg-theme-text-color, #000000);
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <div id="app">Loading...</div>

  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // 3. Signal load ready to hide Telegram loader spinner
      tg.ready();
      tg.expand(); // Fit entire screen height

      // Render welcome greeting
      const user = tg.initDataUnsafe?.user;
      document.getElementById("app").innerText = `Hello, ${user?.first_name || "User"}`;

      // 4. Configure native Main Button for submission
      tg.MainButton.setText("Submit Data");
      tg.MainButton.onClick(async () => {
        tg.MainButton.showProgress();
        
        // Pass RAW initData string to backend for signature verification
        await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData })
        });
        
        tg.MainButton.hideProgress();
      });
      tg.MainButton.show();
    }
  </script>
</body>
</html>
```

#### Backend Verification (Node.js/Express)

```typescript
import express, { Request, Response } from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN environment variable is missing");

// Verify initData integrity
function verifyTelegramWebAppData(initData: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  // Sort alphabetically and format keys
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // Generate signature key using platform constant salt
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  // Validate calculated signature against telegram hash
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

app.post("/api/submit", (req: Request, res: Response) => {
  const { initData } = req.body;

  if (!initData || !verifyTelegramWebAppData(initData)) {
    return res.status(401).json({ error: "Unauthorized: Invalid signature" });
  }

  // Session data verified successfully
  res.json({ success: true });
});
```

Why this passes: Passes raw initData to backend, calculates cryptographic signatures, initializes the SDK, expands the viewport, and binds styles to native CSS theme colors.

### ❌ Bad — Client Trust and Hardcoded Theme Styles

```html
<!DOCTYPE html>
<html>
<head>
  <title>Unsafe TWA</title>
  <!-- ERROR 1: Missing viewport meta tags, causing UI rendering bugs on iOS devices -->
</head>
<!-- ERROR 2: Hardcoded white backgrounds, causing visual contrast issues in dark mode -->
<body style="background: #ffffff; color: #000000;">
  <div id="user-info"></div>

  <script>
    // ERROR 3: Accessing unsafe client structures without signature verification
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id"); // Prone to URL query manipulation

    document.getElementById("user-info").innerText = `ID: ${userId}`;

    // ERROR 4: Missing WebApp.ready() call, leaving Telegram loading animations active
  </script>
</body>
</html>
```

Why this fails: Trusts client-supplied user parameters, hardcodes styling attributes, lacks the SDK script inclusion, and fails to expand browser contexts.

---

## Failure Modes

- **The URL Query Impersonator:** Accepting raw IDs directly from query parameters (e.g. `?userId=123`) inside database update routes.
- **Infinite Mobile Loading Spinner:** Failing to trigger `tg.ready()` in the entry script, causing Telegram to hang in a loading state.
- **The Stretched Viewport:** Missing viewport constraints on inputs, causing screens to scale and distort layouts on form inputs.

## Validation

Cara memverifikasi kepatuhan penggunaan `telegram-mini-app`:

1. **Verify that initData verification exists on backend endpoints:**
   Confirm cryptographic signature checks are defined:
   ```bash
   grep -rn "createHmac" src/
   # Confirm validation function logic is set
   ```
2. **Verify HTML viewport headers:**
   Confirm mobile viewport tags exist in markup targets:
   ```bash
   grep -rn "viewport" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun Telegram Mini Apps:

> "Use the skill `telegram-mini-app`. Read `.agent/skills/telegram-mini-app/SKILL.md` before coding. Never authenticate client payloads using raw initDataUnsafe parameters. Always verify signatures on backend servers using secret hashes, initialize the WebApp SDK inside markup headers, and match UI colors to theme CSS variables."

## Related

- [telegram-bot-builder](../telegram-bot-builder/SKILL.md) — Bot companion pipelines.
- [secrets-management](../secrets-management/SKILL.md) — Bot token key protection.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — API backend security.
