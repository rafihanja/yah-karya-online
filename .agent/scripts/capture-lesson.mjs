#!/usr/bin/env node
/**
 * capture-lesson.mjs
 *
 * Helper buat skill `lessons-capture`. Catat pelajaran lintas-project ke
 * .agent/memory/lessons-learned.md dengan format konsisten, dan deteksi
 * pola berulang (tag yang muncul >= 3x = kandidat jadi skill baru).
 *
 * Usage:
 *   node .agent/scripts/capture-lesson.mjs --add "<project>" "<lesson>" "<tag1,tag2>" [--promote]
 *   node .agent/scripts/capture-lesson.mjs --review     # rekap tag + kandidat promosi
 *   node .agent/scripts/capture-lesson.mjs --list       # tampilkan semua entry mentah
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentRoot = path.resolve(here, "..");
const logPath = path.join(agentRoot, "memory", "lessons-learned.md");
const PROMOTE_THRESHOLD = 3;

const argv = process.argv.slice(2);
const mode = argv[0];

function ensureLog() {
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, "# Lessons Learned — Memori Lintas-Project\n\n", "utf8");
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseTags() {
  if (!fs.existsSync(logPath)) return [];
  const content = fs.readFileSync(logPath, "utf8").replace(/\r/g, "");
  const tags = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^\*\*Tags:\*\*\s*(.+)$/i);
    if (m) {
      for (const t of m[1].split(",")) {
        const tag = t.trim().toLowerCase();
        if (tag) tags.push(tag);
      }
    }
  }
  return tags;
}

function tagFrequency() {
  const freq = new Map();
  for (const t of parseTags()) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]);
}

if (mode === "--add") {
  const project = argv[1];
  const lesson = argv[2];
  const tags = (argv[3] || "").split(",").map((t) => t.trim()).filter(Boolean);
  const promote = argv.includes("--promote") ? "yes" : "no";

  if (!project || !lesson) {
    console.error('FAIL: butuh argumen. Contoh:');
    console.error('  node .agent/scripts/capture-lesson.mjs --add "ranja-store" "Pakai useGSAP buat cleanup otomatis" "gsap,react"');
    process.exit(1);
  }

  // cek secret kasar
  if (/(api[_-]?key|secret|password|token|AKIA|sk-)/i.test(lesson)) {
    console.error("FAIL: lesson kelihatan mengandung secret. Jangan simpan credential di sini.");
    process.exit(1);
  }

  ensureLog();
  const entry = [
    "",
    `## ${today()} — ${project}`,
    `**Lesson:** ${lesson}`,
    `**Tags:** ${tags.join(", ") || "uncategorized"}`,
    `**Promote?:** ${promote}`,
    "",
  ].join("\n");
  fs.appendFileSync(logPath, entry, "utf8");
  console.log(`✅ Lesson dicatat ke ${path.relative(agentRoot, logPath).replaceAll(path.sep, "/")}`);

  // langsung kasih sinyal kalau tag ini udah sering muncul
  const freq = tagFrequency();
  const hot = freq.filter(([, c]) => c >= PROMOTE_THRESHOLD).map(([t]) => t);
  const relevant = tags.map((t) => t.toLowerCase()).filter((t) => hot.includes(t));
  if (relevant.length) {
    console.log(`\n🔔 Tag berulang (>= ${PROMOTE_THRESHOLD}x): ${relevant.join(", ")}`);
    console.log(`   Pertimbangkan bikin skill baru buat pola ini (lihat skill lessons-capture).`);
  }
  process.exit(0);
}

if (mode === "--review" || mode === undefined) {
  const freq = tagFrequency();
  console.log("=== LESSONS REVIEW ===");
  if (!freq.length) {
    console.log("Belum ada lesson tercatat.");
    process.exit(0);
  }
  console.log(`Total tag unik: ${freq.length}\n`);
  console.log("Frekuensi tag:");
  for (const [tag, count] of freq) {
    const flag = count >= PROMOTE_THRESHOLD ? "  🔔 KANDIDAT SKILL" : "";
    console.log(`  ${String(count).padStart(3)}x  ${tag}${flag}`);
  }
  const candidates = freq.filter(([, c]) => c >= PROMOTE_THRESHOLD);
  console.log("");
  if (candidates.length) {
    console.log(`🔔 ${candidates.length} pola berulang (>= ${PROMOTE_THRESHOLD}x) layak dipertimbangkan jadi skill:`);
    for (const [tag, count] of candidates) console.log(`   - ${tag} (${count}x)`);
    console.log(`\n   Bikin skill: .agent/skills/<nama>/SKILL.md → daftar manifest → wire active-skills+router → agent-doctor.`);
  } else {
    console.log(`Belum ada pola yang muncul >= ${PROMOTE_THRESHOLD}x. Lanjut kumpulin dulu.`);
  }
  process.exit(0);
}

if (mode === "--list") {
  if (!fs.existsSync(logPath)) { console.log("Belum ada log."); process.exit(0); }
  console.log(fs.readFileSync(logPath, "utf8"));
  process.exit(0);
}

console.error(`Mode ga dikenal: ${mode}. Pakai --add | --review | --list`);
process.exit(1);
