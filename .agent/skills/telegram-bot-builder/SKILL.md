---
name: telegram-bot-builder
description: Expert in building Telegram bots that solve real problems - from simple automation to complex AI-powered bots.
risk: medium (access token compromises, rate limiting blocks, API webhooks exposure)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Telegram Bot Builder

> **One-liner:** Guidelines for architecting scalable Telegram bots using Telegraf, implementing global error handlers, configuring Redis session persistence, and enforcing rate limiters.

## When to Use

- When developing interactive conversational bots or automated chat assistants for Telegram.
- When configuring production webhook servers (e.g. Express, Fastify) or polling setups for local development.
- When implementing bot monetization paths (e.g. Telegram Payments, Premium subscriptions).

## Why This Exists

Poorly designed Telegram bots often crash on unexpected input types (like users sending files instead of text) due to missing handlers. Additionally, deploying bots in polling mode on serverless platforms wastes resources, while lack of global throttling causes bots to hit Telegram's strict API limits (max 30 messages/second globally), leading to account blocks. Standardizing on webhook callbacks, rate limiters, and global catch boundaries ensures uninterrupted operations.

## ALWAYS DO THIS

- **Implement global error catch blocks** — Always configure `bot.catch()` in Telegraf/GrammY to capture exceptions, preventing crashes on unexpected user payloads.
- **Enforce message rate-limiting middleware** — Restrict sending volumes to a maximum of 30 messages/second globally, and 1 message/second inside a single chat using throttling adapters (e.g. `telegraf-ratelimit` or Bottleneck).
- **Use Webhook delivery mode in production** — Deploy production bots as webhooks behind HTTPS endpoints to optimize performance and server resources.
- **Configure persistent session stores** — Use Redis or database adapters for session middleware instead of standard in-memory caches to prevent state loss during server restarts.
- **Gracefully shut down bot processes** — Register `process.once("SIGINT")` listeners to terminate connections cleanly on process stops.

## NEVER DO THIS

- ❌ **DO NOT** hardcode Telegram Bot API tokens inside source files or commit them to repository history. **Why fails:** Public bot tokens are scanned by automated scraper scripts and compromised within seconds, allowing attackers to hijack your bot. **Instead:** Access tokens using environment variables (e.g., `process.env.TELEGRAM_BOT_TOKEN`).
- ❌ **DO NOT** use default polling mode `bot.launch()` in serverless production environments (like Vercel or AWS Lambda). **Why fails:** Serverless containers spin down after requests, killing the polling listener and missing incoming user updates. **Instead:** Configure webhook middleware routes (`bot.webhookCallback()`).
- ❌ **DO NOT** access message text properties directly without verifying their existence. **Why fails:** Accessing `ctx.message.text` directly throws an error if a user sends a photo, sticker, or location, crashing the bot instance. **Instead:** Verify the update type (e.g., check `if (ctx.message && 'text' in ctx.message)`).
- ❌ **DO NOT** execute expensive operations (like AI generation or video processing) synchronously in the request lifecycle without notifying the user. **Why fails:** Users assume the bot has frozen and repeatedly trigger the button, overloading the server. **Instead:** Trigger typing animations (`ctx.sendChatAction("typing")`) and return immediate status updates.

---

## Webhook Request Handling Loop

Deploying webhook architectures optimizes resource consumption on host servers:

```
[Telegram Server] ── POST updates ──> [Express/Fastify Webhook Endpoint] ──> [bot.handleUpdate()] ──> [Send Response]
```

---

## Examples

### ✅ Good — Secure Webhook Setup, Global Errors, Throttling, and State Checks

```typescript
import { Telegraf, session } from "telegraf";
import rateLimit from "telegraf-ratelimit";
import express from "express";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN environment variable is missing");

const bot = new Telegraf(botToken);

// 1. Configure user message rate-limiting middleware (max 2 requests per second per user)
const limitConfig = {
  window: 1000,
  limit: 2,
  onLimitExceeded: (ctx: any) => ctx.reply("⚠️ Too many requests. Please slow down.")
};
bot.use(rateLimit(limitConfig));

// 2. Setup session store (in production, replace with Redis session adapter)
bot.use(session());

// 3. Command handler validating message structure
bot.start((ctx) => {
  ctx.reply("Welcome! Use /help to get started.");
});

bot.on("text", async (ctx) => {
  // Always trigger visual indicators before slow background operations
  await ctx.sendChatAction("typing");
  
  const text = ctx.message.text;
  ctx.reply(`You typed: ${text}`);
});

// 4. Implement global error boundary to catch all unexpected runtime issues
bot.catch((err: any, ctx) => {
  console.error(`❌ Bot encountered an error for update ${ctx.update.update_id}:`, err);
  ctx.reply("An unexpected error occurred. Please try again later.");
});

// 5. Setup production Webhook server route using Express
const app = express();
app.use(express.json());

const webhookPath = `/webhook/${process.env.WEBHOOK_SECRET || "secure-secret"}`;
app.use(bot.webhookCallback(webhookPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  // Set webhook target on Telegram servers
  await bot.telegram.setWebhook(`https://your-domain.com${webhookPath}`);
});

// 6. Support graceful shutdown hooks
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

Why this passes: Uses secure environment variables, configures a global error boundary, integrates rate limits, uses webhook callbacks, and triggers typing animations.

### ❌ Bad — Hardcoded Token, Polling in Production, and No Handlers

```typescript
import { Telegraf } from "telegraf";

// ERROR 1: Hardcoding sensitive bot token in source file
const bot = new Telegraf("123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."); 

// ERROR 2: Lacks rate limiter, making bot prone to API lockouts on spam attacks

bot.on("text", (ctx) => {
  // ERROR 3: Accessing text field directly without checks (will crash on stickers)
  const text = ctx.message.text; 
  ctx.reply(`Result: ${text.toUpperCase()}`);
});

// ERROR 4: Lacks bot.catch() global error handler - crashes on unexpected errors

// ERROR 5: Using polling mode in production without shutdown hooks
bot.launch();
```

Why this fails: Hardcodes the bot token, accesses text directly without validation, lacks a rate limiter, lacks an error catcher, and defaults to polling.

---

## Failure Modes

- **The Sticker Crash:** An unhandled image update crashing the bot instance due to direct access of undefined text fields.
- **Telegram HTTP 429 Block:** Flooding a chat with automated notifications, triggering Telegram's spam locks and blocking the bot.
- **Serverless Webhook Timeout:** Running long-running tasks inside the webhook handler thread, exceeding serverless execution limits.

## Validation

Cara memverifikasi kepatuhan penggunaan `telegram-bot-builder`:

1. **Verify that no bot tokens are committed:**
   Check for potential hardcoded token patterns:
   ```bash
   grep -rn "new Telegraf(" src/
   # Confirm tokens are extracted via process.env
   ```
2. **Verify global error handler definition:**
   Ensure error boundaries wrapper is registered:
   ```bash
   grep -rn "bot.catch(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun Telegram bot:

> "Use the skill `telegram-bot-builder`. Read `.agent/skills/telegram-bot-builder/SKILL.md` before coding. Never commit raw token keys or use default polling in serverless deployments. Always wrap pipelines inside bot.catch error catchers, enforce rate limiters, and handle sticker/image payloads safely."

## Related

- [telegram-mini-app](../telegram-mini-app/SKILL.md) — Mini App Web interfaces.
- [secrets-management](../secrets-management/SKILL.md) — Token key safety.
- [env-fortress](../env-fortress/SKILL.md) — Environment setups.
