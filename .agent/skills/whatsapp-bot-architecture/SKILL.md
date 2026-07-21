---
name: whatsapp-bot-architecture
description: Production-grade architecture for WhatsApp bots using whatsapp-web.js or Baileys, covering session management, anti-ban throttling, message queues, and error recovery.
risk: high (account ban risks, session hijacks, infinite reply loops, server memory leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# WhatsApp Bot Architecture

> **One-liner:** Guidelines for constructing resilient, anti-ban WhatsApp bots using `whatsapp-web.js` or Baileys, implementing dynamic typing delays, Redis session states, and message router schemas.

## When to Use

- When developing automated business bots, customer service agents, or interactive notifications on WhatsApp.
- When configuring session persistence stores, QR code generation handlers, or reconnect logic hooks.
- When managing media conversions (e.g. converting incoming images to stickers, downloading audio voice notes).

## Why This Exists

Unlike official business APIs, self-hosted WhatsApp Web bridges (like `whatsapp-web.js` or Baileys) operate under strict anti-spam filters monitored by Meta. If a bot sends bulk broadcast messages without random delays, hardcodes credentials in public commits, or responds to its own messages (creating an infinite self-reply loop), the associated phone number will be immediately banned. Enforcing rate-limiting maps, dynamic typing indicators, and session ignores guarantees long-term stability.

## ALWAYS DO THIS

- **Implement user-level cooldown limits** — Maintain an in-memory cooldown Map (or Redis cache) to restrict users to a maximum of 1 request per 5 seconds, blocking spam attacks.
- **Configure randomized response delays** — Simulate human behavior by waiting between 2 to 5 seconds before replying, and trigger typing indicators (`sendStateTyping`) dynamically.
- **Ignore self and status updates** — Verify that incoming messages are not status updates (`msg.isStatus`) or sent by the bot itself (`msg.fromMe`) before invoking commands.
- **Isolate session files using gitignore** — Add session storage directories (such as `.wwebjs_auth/` or `auth_info_multi/`) to `.gitignore` to prevent session hijacking.
- **Integrate multi-provider API fallovers** — Structure LLM calls with secondary and tertiary providers to avoid bot freezing during API outages.

## NEVER DO THIS

- ❌ **DO NOT** reply to messages sent by the bot's own number (`msg.fromMe` is true). **Why fails:** Creates an infinite self-reply loop that floods the chat and immediately triggers WhatsApp's automated spam ban system. **Instead:** Validate `if (msg.fromMe) return;` at the entry point of the message router.
- ❌ **DO NOT** send bulk or automated broadcast messages to multiple chats without a randomized message delay queue. **Why fails:** Meta's anti-spam algorithms detect rapid, identical message distributions and suspend the phone number within minutes. **Instead:** Enforce a message queue with a minimum delay of 5 to 10 seconds per broadcast.
- ❌ **DO NOT** commit authentication session folders (e.g. `.wwebjs_auth`) to the Git repository. **Why fails:** Allows anyone with access to the repository to hijack the active WhatsApp session and control the associated account. **Instead:** Add auth folders to `.gitignore` and manage keys securely.
- ❌ **DO NOT** initialize puppeteer web engines without explicit resource limits inside container environments. **Why fails:** Chromium processes consume large amounts of memory, eventually running out of RAM and crashing the server. **Instead:** Configure headless arguments (like `--no-sandbox` and `--disable-dev-shm-usage`).

---

## Message Routing Flow

Isolating message filters prevents loop failures and protects API quotas:

```
[Incoming Msg] ──> [Filter: self/status/spam?] ──> [Apply Rate Limit] ──> [Trigger Typing State] ──> [Send Response]
```

---

## Examples

### ✅ Good — Rate Limiter, Self-Ignore, Web Cache, and Graceful Reconnections

```javascript
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const rateLimitMap = new Map();
const COOLDOWN_MS = 5000;

// 1. Initialize client with isolated auth strategy and sandboxed browser configurations
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "primary-wa-bot" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  },
  webVersionCache: { type: "remote" } // Auto-update to prevent version mismatches
});

// 2. Prevent spam using a simple rate limiting map helper
function isSpamming(userId) {
  const lastTime = rateLimitMap.get(userId) || 0;
  const now = Date.now();
  if (now - lastTime < COOLDOWN_MS) return true;
  rateLimitMap.set(userId, now);
  return false;
}

// 3. Setup message routing handlers
client.on("message", async (msg) => {
  // CRITICAL: Ignore status updates and messages sent by the bot itself to prevent loops
  if (msg.isStatus || msg.fromMe) return;

  const chat = await msg.getChat();

  // Validate rate limit status
  if (isSpamming(msg.from)) {
    return msg.reply("⚠️ Rate limit exceeded. Please wait a few seconds.");
  }

  const body = msg.body?.trim();
  if (!body) return;

  // Route commands securely
  if (body.startsWith("!")) {
    const command = body.slice(1).toLowerCase();
    
    if (command === "ping") {
      // Simulate human typing behavior
      await chat.sendStateTyping();
      const typingDelay = 1000 + Math.random() * 1500;
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      await chat.clearState();
      
      return msg.reply("pong");
    }
  }
});

// 4. Manage auto-reconnect workflows on network drops
client.on("disconnected", async (reason) => {
  console.error("🚨 WhatsApp client disconnected:", reason);
  setTimeout(async () => {
    try {
      await client.initialize();
    } catch (err) {
      console.error("Failed to re-initialize client:", err);
    }
  }, 10000);
});

client.on("qr", (qr) => {
  console.log("📲 QR Code generated. Scan this code to log in:", qr);
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot is initialized and ready!");
});

client.initialize();
```

Why this passes: Filters out self-messages (`msg.fromMe`) and status updates, integrates a rate limiting helper, simulates typing delays, uses Puppeteer sandboxing, and handles reconnection logic.

### ❌ Bad — No Checks, No Delays, and Hardcoded Loops

```javascript
const { Client } = require("whatsapp-web.js");
const client = new Client(); // ERROR 1: Missing auth persistence strategy

client.on("message", async (msg) => {
  // ERROR 2: Lacks self-message ignore check, leading to infinite self-reply loop if bot receives its own text
  const text = msg.body;

  // ERROR 3: Replying immediately without a typing simulation delay
  if (text === "hello") {
    // ERROR 4: Hardcoding credentials or configuration settings inside response calls
    msg.reply("System active. API Key: sk_live_xyz"); 
  }
});

// ERROR 5: Lacks crash captures and disconnect recovery listeners
client.initialize();
```

Why this fails: Lacks persistent auth configurations, fails to ignore self-messages (prone to infinite loops), lacks rate limiting, and does not simulate typing delays.

---

## Failure Modes

- **The Broadcast Ban:** Sending advertisements to 500 contacts consecutively in under 30 seconds, leading to an immediate phone number ban.
- **The Self-Reply Storm:** Sending a query command from the bot's own number, triggering an infinite loop of replies that exhausts API balances.
- **The puppeteer RAM Exhaustion:** Leaving multiple headless Chrome zombie processes running on host machines after crashes.

## Validation

Cara memverifikasi kepatuhan penggunaan `whatsapp-bot-architecture`:

1. **Verify that self-reply ignore checks exist:**
   Ensure `fromMe` validations wrap message events:
   ```bash
   grep -rn "fromMe" src/
   # Confirm fromMe filters are active
   ```
2. **Verify gitignore rules for authentication folders:**
   Confirm `.wwebjs_auth` is excluded:
   ```bash
   git status --ignored
   # Expected: auth folders appear in the ignored files list
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun WhatsApp bot:

> "Use the skill `whatsapp-bot-architecture`. Read `.agent/skills/whatsapp-bot-architecture/SKILL.md` before coding. Never reply to bot's own messages or send bulk messages without delays. Always verify `fromMe` and `isStatus` filters, implement rate-limiting maps, and ignore auth session folders in Git commits."

## Related

- [whatsapp-cloud-api](../whatsapp-cloud-api/SKILL.md) — Official cloud endpoints.
- [secrets-management](../secrets-management/SKILL.md) — Auth folder git ignoring.
- [env-fortress](../env-fortress/SKILL.md) — Variable configurations.
