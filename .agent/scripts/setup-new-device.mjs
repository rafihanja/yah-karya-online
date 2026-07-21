#!/usr/bin/env node
/**
 * Setup device baru — satu command untuk menghidupkan semua governance + hooks.
 *
 * Jalankan di device baru setelah `git clone`:
 *   node .agent/scripts/setup-new-device.mjs
 *
 * Yang dilakukan:
 *  1. Salin .claude/settings.example.json -> .claude/settings.json (kalau belum ada)
 *  2. Bootstrap agent kit (validate skills, detect project, agent-doctor)
 *  3. Cek hook Claude Code (UserPromptSubmit) & Antigravity (PreInvocation + Stop)
 *  4. Cetak langkah terakhir yang perlu user lakukan (isi API key, reload)
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const agentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(agentRoot, "..");
const ok = (m) => console.log(`✅ ${m}`);
const info = (m) => console.log(`ℹ️  ${m}`);
const warn = (m) => console.log(`⚠️  ${m}`);
const p = (rel) => path.join(repoRoot, rel);
const exists = (rel) => fs.existsSync(p(rel));

console.log("\n=== SETUP DEVICE BARU — Agent Governance ===\n");

// 1. settings.json dari template
const setReal = ".claude/settings.json";
const setExample = ".claude/settings.example.json";
if (exists(setReal)) {
  ok(`${setReal} sudah ada (dilewati).`);
} else if (exists(setExample)) {
  fs.copyFileSync(p(setExample), p(setReal));
  ok(`${setReal} dibuat dari template.`);
  warn(`WAJIB: buka ${setReal}, isi ANTHROPIC_API_KEY kamu (sekarang masih placeholder).`);
} else {
  warn(`${setExample} tidak ada — lewati. (Claude Code akan pakai default.)`);
}

// 2. Bootstrap
console.log("\n--- Bootstrap agent kit ---");
const boot = spawnSync(process.execPath, [path.join(agentRoot, "scripts/bootstrap-agent.mjs")], {
  cwd: repoRoot,
  encoding: "utf8",
});
if (boot.stdout) process.stdout.write(boot.stdout);
if (boot.status !== 0) {
  if (boot.stderr) process.stderr.write(boot.stderr);
  warn("bootstrap mengembalikan error — cek output di atas.");
} else {
  ok("Bootstrap selesai (skills valid, project terdeteksi, doctor passed).");
}

// 3. Cek hooks
console.log("\n--- Cek hooks ---");
function checkJson(rel, fn, label) {
  try {
    const data = JSON.parse(fs.readFileSync(p(rel), "utf8"));
    fn(data) ? ok(`${label} aktif (${rel}).`) : warn(`${label} TIDAK ditemukan di ${rel}.`);
  } catch {
    warn(`${rel} tidak terbaca — ${label} mungkin belum aktif.`);
  }
}
checkJson(setReal, (d) => d?.hooks?.UserPromptSubmit, "Hook Claude Code (UserPromptSubmit)");
checkJson(".agents/hooks.json", (d) => d?.["agent-governance-anti-drift"]?.PreInvocation, "Hook Antigravity (PreInvocation)");
checkJson(".agents/hooks.json", (d) => d?.["agent-governance-stop-gate"]?.Stop, "Hook Antigravity (Stop gate)");

// 4. Langkah terakhir
console.log("\n=== LANGKAH TERAKHIR (manual, sekali saja) ===");
info("1. Isi ANTHROPIC_API_KEY di .claude/settings.json (kalau baru dibuat).");
info("2. Restart / reload Claude Code DAN Antigravity supaya hooks terbaca.");
info("3. Selesai — governance auto-enforce tiap pesan di kedua tool.");
console.log("");
