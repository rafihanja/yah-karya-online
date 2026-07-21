---
name: whatsapp-cloud-api
description: Integration with WhatsApp Business Cloud API (Meta), covering messages, templates, HMAC-SHA256 webhooks, and automation boilerplates.
risk: extreme (unauthenticated webhooks execution, rate limiting blocks, API payload billing charges)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# WhatsApp Cloud API

> **One-liner:** Guidelines for integrating with Meta's official WhatsApp Business Cloud API, establishing secure HMAC-SHA256 webhook validation, and sending templates.

## When to Use

- When integrating the official Meta WhatsApp Business Cloud API (Graph API) inside backend systems.
- When configuring secure webhook reception handlers to receive customer message updates.
- When sending pre-approved templates or interactive components (buttons, lists).

## Why This Exists

Self-hosted WhatsApp bridges are prone to account bans, whereas the official Cloud API offers a stable, sanctioned alternative. However, leaving webhook endpoints unsecured allows attackers to forge mock message payloads, which can trick backend databases. Additionally, failing to verify signatures or using simple string checks (instead of timing-safe comparisons) exposes webhooks to timing attacks. Implementing secure HMAC validation and template rules prevents security compromises.

## ALWAYS DO THIS

- **Verify signatures on webhook entry** — Calculate the expected SHA-256 HMAC of raw request bodies using the `APP_SECRET` and compare it with the `X-Hub-Signature-256` header.
- **Enforce timing-safe comparisons** — Use `crypto.timingSafeEqual` in Node.js (or `hmac.compare_digest` in Python) to prevent timing analysis attacks.
- **Respond with HTTP 200 within 5 seconds** — Acknowledge webhook notifications immediately to prevent Meta from retrying and disabling the webhook.
- **Verify the 24-hour conversational window** — Send template-based messages when contacting users outside the 24-hour window; use standard text messages only within the active window.
- **Maintain a secure verify token** — Verify the webhook challenge during initial setup by comparing the incoming token with your verified `VERIFY_TOKEN`.

## NEVER DO THIS

- ❌ **DO NOT** process incoming POST webhook updates without verifying their HMAC-SHA256 signatures. **Why fails:** Attackers can send forged HTTP requests containing fake message events, manipulating application states or triggering actions. **Instead:** Validate signatures against the registered `APP_SECRET` key.
- ❌ **DO NOT** use basic string equality checks (`===` or `==`) to verify cryptographic signatures. **Why fails:** Leaves the endpoint vulnerable to timing attacks, allowing attackers to guess signatures character-by-character. **Instead:** Use timing-safe comparison functions.
- ❌ **DO NOT** store WhatsApp access tokens directly inside configuration code or commit them to Git. **Why fails:** Exposes billing accounts and messaging pipelines to unauthorized users. **Instead:** Load tokens from environment variables.
- ❌ **DO NOT** block webhook response threads with long-running business logic operations. **Why fails:** Exceeds the 5-second timeout window, causing Meta to retry the event, which wastes server resources and leads to duplicate responses. **Instead:** Acknowledge the webhook with an immediate HTTP 200 and process tasks asynchronously in a background worker queue.

---

## Webhook Signature Verification Flow

Cryptographic validation ensures incoming payloads originate directly from Meta:

```
[Meta Server] ── POST payload + signature ──> [Express Endpoint] ── timingSafeEqual verification ──> [HTTP 200]
```

---

## Examples

### ✅ Good — Webhook Verification, HMAC Validation, and Message Sending

```typescript
import express, { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";

const app = express();

// 1. Capture raw request bodies as buffers for accurate HMAC generation
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  })
);

const APP_SECRET = process.env.APP_SECRET;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

if (!APP_SECRET || !VERIFY_TOKEN || !PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
  throw new Error("Missing WhatsApp configuration environment variables");
}

// 2. Validate webhook verification challenges (GET request)
app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// 3. Timing-safe signature check validation function
function isSignatureValid(rawBody: Buffer, signature: string): boolean {
  const calculatedSig = crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody)
    .digest("hex");
    
  const expectedBuffer = Buffer.from(`sha256=${calculatedSig}`);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

// 4. Handle incoming messages safely (POST request)
app.post("/webhook", (req: any, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string;

  if (!signature || !isSignatureValid(req.rawBody, signature)) {
    return res.sendStatus(401);
  }

  // Acknowledge event immediately within 5 seconds to prevent retries
  res.status(200).send("EVENT_RECEIVED");

  // Delegate processing tasks asynchronously
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      console.log(`Received message from ${message.from}: ${message.text?.body}`);
    }
  }
});

// 5. Send WhatsApp template message function
export async function sendTemplateNotification(to: string, userName: string) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "welcome_notification",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: userName }]
          }
        ]
      }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}
```

Why this passes: Parses raw bodies to preserve signature hashes, uses timing-safe comparisons, returns immediate HTTP 200 acknowledgements, and hides API keys.

### ❌ Bad — Trusting Payloads Unverified, Loose Matches, and Blocking Loops

```typescript
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ERROR 1: Accepting all incoming webhook payloads without signature checks
app.post("/webhook", async (req, res) => {
  const body = req.body;
  const message = body.entry[0].changes[0].value.messages[0];

  // ERROR 2: Executing database calls and blocking thread execution
  const dbUser = await db.query(`SELECT * FROM users WHERE phone = '${message.from}'`);
  
  // ERROR 3: Accessing message text directly without checking properties (crashes on media)
  const text = message.text.body;

  // ERROR 4: Hardcoded token keys inside message requests
  await axios.post("https://graph.facebook.com/v21.0/12345/messages", {
    messaging_product: "whatsapp",
    to: message.from,
    type: "text",
    text: { body: `Echo: ${text}` }
  }, {
    headers: { Authorization: "Bearer EAAGx..." } 
  });

  // ERROR 5: Belated HTTP response sent after external network calls complete
  res.sendStatus(200); 
});
```

Why this fails: Processes payloads without verifying signatures, triggers raw query executions, blocks responses during API callouts, and hardcodes authentication tokens.

---

## Failure Modes

- **The Verification Bypasse:** Attackers sending mock webhook updates to update database models or balances without validation checks.
- **The Webhook Loop Lock:** Slow external calls delaying webhook responses past 5 seconds, causing Meta to flood the server with retried requests.
- **The Media Crash:** Accessing `.text.body` on incoming sticker updates, raising a TypeError and crashing the server.

## Validation

Cara memverifikasi kepatuhan penggunaan `whatsapp-cloud-api`:

1. **Verify signature validation is configured on webhook endpoints:**
   Confirm timing safe comparison exists:
   ```bash
   grep -rn "timingSafeEqual" src/
   # Confirm validation is bound to webhook middleware
   ```
2. **Verify verify token configuration checks:**
   Confirm token matching checks are active:
   ```bash
   grep -rn "VERIFY_TOKEN" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengintegrarikan WhatsApp Cloud API:

> "Use the skill `whatsapp-cloud-api`. Read `.agent/skills/whatsapp-cloud-api/SKILL.md` before coding. Never process webhook payloads without verifying HMAC-SHA256 signatures timing-safely. Always send immediate HTTP 200 acknowledgements, use templates outside the 24h window, and keep tokens secure."

## Related

- [whatsapp-bot-architecture](../whatsapp-bot-architecture/SKILL.md) — Session anti-ban.
- [secrets-management](../secrets-management/SKILL.md) — API keys protection.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Transport logic rules.
