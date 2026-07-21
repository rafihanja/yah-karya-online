#!/usr/bin/env node
/**
 * Antigravity PreInvocation hook — anti context-drift.
 * Fires before EVERY model call and injects the .agent governance reminder
 * as an ephemeralMessage so it never gets buried in a long conversation.
 *
 * Output schema (verified from antigravity.google/docs/hooks):
 *   { "injectSteps": [ { "ephemeralMessage": "<text>" } ] }
 */

const reminder = [
  "=== MANDATORY GOVERNANCE REMINDER (.agent) ===",
  "Ikuti governance .agent di SETIAP balasan, bukan cuma di awal sesi.",
  "",
  "SEBELUM output apapun:",
  "1. Route task ke .agent/skill-router.json — cari skill yang cocok.",
  "2. Baca SKILL.md yang matched (jangan andalkan ingatan).",
  "3. Mulai response substantif dengan I AM CRAZY header:",
  "   🔥 I AM CRAZY | 🧠 Skill aktif | 📂 Diperiksa | ✏️ Diubah | 🧪 Validasi | ⚠️ Risiko tersisa | 🔢 Token",
  "4. Terapkan auto-pro-standards otomatis (security, SEO, performa, a11y).",
  "5. Project baru/besar: prompt-amplifier dulu → phased-delivery.",
  "6. Selesai = self-review-gate + update PROJECT_MEMORY.md.",
  "",
  "Tanda drift (langsung koreksi): jawaban generik tanpa nyebut file repo ini,",
  "tidak ada I AM CRAZY header, skill disebut tapi tidak dibaca dari file-nya.",
  "TANPA I AM CRAZY HEADER = OUTPUT DITOLAK. Non-negotiable.",
  "=== END REMINDER ===",
].join("\n");

process.stdout.write(
  JSON.stringify({ injectSteps: [{ ephemeralMessage: reminder }] })
);
