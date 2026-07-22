#!/usr/bin/env node
/**
 * Claude Code UserPromptSubmit hook — anti context-drift governance reminder.
 *
 * Mirrors the Antigravity PreInvocation hook (.agents/scripts/governance-reminder.mjs)
 * so BOTH tools enforce the same .agent governance at runtime, not just in static docs.
 *
 * Schema (verified from code.claude.com/docs/en/hooks):
 *   - stdin: JSON { session_id, cwd, transcript_path, hook_event_name, prompt, ... }
 *   - For UserPromptSubmit, plain stdout on exit 0 is injected into the model context.
 *     (No JSON envelope required for the simple "add context" case.)
 *
 * Fail-open: any error still exits 0 so the user is never blocked by this hook.
 */

const reminder = [
  "=== MANDATORY GOVERNANCE REMINDER (.agent) ===",
  "Ikuti governance .agent di SETIAP balasan, bukan cuma di awal sesi.",
  "",
  "SEBELUM output apapun:",
  "1. Scan .agent/skills/INDEX.md — katalog SEMUA skill repo (tidak ada yang disembunyikan),",
  "   bukan cuma yang kebetulan match keyword router.",
  "2. Route task ke .agent/skill-router.json — pilih skill paling spesifik.",
  "3. Baca SKILL.md yang matched (jangan andalkan ingatan).",
  "4. Mulai response substantif dengan I AM CRAZY header:",
  "   🔥 I AM CRAZY | 🧠 Skill aktif | 📂 Diperiksa | ✏️ Diubah | 🧪 Validasi | ⚠️ Risiko tersisa | 🔢 Token",
  "5. Terapkan auto-pro-standards otomatis (security, SEO, performa, a11y).",
  "6. Project baru/besar: prompt-amplifier dulu → phased-delivery.",
  "7. Selesai = self-review-gate + update PROJECT_MEMORY.md.",
  "",
  "Tanda drift (langsung koreksi): jawaban generik tanpa nyebut file repo ini,",
  "tidak ada I AM CRAZY header, skill disebut tapi tidak dibaca dari file-nya.",
  "TANPA I AM CRAZY HEADER = OUTPUT DITOLAK. Non-negotiable.",
  "=== END REMINDER ===",
].join("\n");

process.stdout.write(reminder);
process.exit(0);
