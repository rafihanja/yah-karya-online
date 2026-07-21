#!/usr/bin/env node
/**
 * Antigravity Stop hook — governance completion gate.
 *
 * Fires when the agent tries to STOP. If the last substantive assistant turn
 * did NOT include an "I AM CRAZY" header (legacy "SESSION BOOT" still accepted
 * for one transition turn), we refuse to stop and force the agent back into the
 * loop to redo the answer with governance applied.
 *
 * Output schema (verified from antigravity.google/docs/hooks):
 *   { "decision": "continue", "reason": "<injected as system message>" }
 *   -> any other output (or {}) lets the agent stop normally.
 *
 * Safeguards:
 *  - Anti-infinite-loop: force-continue at most MAX_RETRIES times per conversation
 *    (state tracked in a temp file keyed by conversationId).
 *  - Fail-open: any parse/IO error => allow stop (never trap the user).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MAX_RETRIES = 2;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allowStop() {
  // Empty object = no objection, agent stops normally.
  process.stdout.write("{}");
  process.exit(0);
}

function forceContinue(reason) {
  process.stdout.write(JSON.stringify({ decision: "continue", reason }));
  process.exit(0);
}

let input = {};
try {
  input = JSON.parse(readStdin() || "{}");
} catch {
  allowStop();
}

const transcriptPath = input.transcriptPath;
const conversationId = input.conversationId || "unknown";

// --- Anti-infinite-loop state ---
const stateFile = path.join(
  os.tmpdir(),
  `antigravity-stopgate-${String(conversationId).replace(/[^\w.-]/g, "_")}.json`
);
function getRetries() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, "utf8")).retries || 0;
  } catch {
    return 0;
  }
}
function bumpRetries(n) {
  try {
    fs.writeFileSync(stateFile, JSON.stringify({ retries: n }), "utf8");
  } catch {
    /* ignore */
  }
}

// --- Read last assistant text from transcript ---
if (!transcriptPath || !fs.existsSync(transcriptPath)) allowStop();

let lastAssistantText = "";
try {
  const lines = fs.readFileSync(transcriptPath, "utf8").split(/\r?\n/).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    let evt;
    try {
      evt = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    const role = evt.role || evt.author || evt.type;
    if (role && /assistant|model|agent/i.test(String(role))) {
      // content can be a string or an array of parts
      const c = evt.content ?? evt.text ?? evt.message ?? "";
      lastAssistantText = typeof c === "string" ? c : JSON.stringify(c);
      break;
    }
  }
} catch {
  allowStop();
}

// Trivial / empty turns: don't gate.
if (!lastAssistantText || lastAssistantText.trim().length < 40) allowStop();

// Governance satisfied? Accept the new I AM CRAZY brand, and keep the legacy
// SESSION BOOT string valid for a one-turn transition so in-flight answers
// are never trapped by the rename.
if (/I AM CRAZY|SESSION BOOT/i.test(lastAssistantText)) {
  bumpRetries(0); // reset for next time
  allowStop();
}

// Missing header -> force redo, but respect retry cap.
const retries = getRetries();
if (retries >= MAX_RETRIES) {
  bumpRetries(0);
  allowStop();
}
bumpRetries(retries + 1);
forceContinue(
  "GOVERNANCE GATE: balasan terakhirmu tidak punya header 'I AM CRAZY'. " +
    "Sesuai .agent governance, output substantif WAJIB diawali header I AM CRAZY " +
    "(🧠 Skill aktif / 📂 Diperiksa / ✏️ Diubah / 🧪 Validasi / ⚠️ Risiko / 🔢 Token). " +
    "Jalankan self-review-gate, route ke .agent/skill-router.json, lalu tulis ulang " +
    "balasan dengan header lengkap sebelum berhenti."
);
