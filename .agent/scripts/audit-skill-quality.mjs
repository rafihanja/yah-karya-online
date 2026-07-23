#!/usr/bin/env node
/**
 * audit-skill-quality.mjs
 * 
 * Scan semua SKILL.md di .agent/skills dan flag yang kualitasnya rendah.
 * Kriteria "rendah":
 *   - Kurang dari 200 bytes (terlalu pendek, kemungkinan cuma placeholder)
 *   - Tidak punya section ALWAYS/NEVER/When to Use (kurang instruktif)
 *   - Cuma 1 baris isi (setelah strip heading)
 * 
 * Usage: node .agent/scripts/audit-skill-quality.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsRoot = path.join(__dirname, "..", "skills");
const MIN_BYTES = 200;
const RECOMMENDED_SECTIONS = [
  /always\s+do/i,
  /never\s+do/i,
  /when\s+to\s+use/i,
];

const results = { excellent: [], good: [], weak: [], empty: [] };

const skillDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const skill of skillDirs) {
  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  const lines = content.split("\n").filter(l => l.trim().length > 0 && !l.startsWith("#"));

  if (bytes < 50) {
    results.empty.push({ skill, bytes, reason: "hampir kosong" });
    continue;
  }

  if (bytes < MIN_BYTES) {
    results.weak.push({ skill, bytes, reason: `terlalu pendek (${bytes} bytes < ${MIN_BYTES})` });
    continue;
  }

  const sectionsFound = RECOMMENDED_SECTIONS.filter(rx => rx.test(content)).length;

  if (lines.length <= 2) {
    results.weak.push({ skill, bytes, reason: `cuma ${lines.length} baris isi` });
  } else if (sectionsFound >= 2) {
    results.excellent.push(skill);
  } else {
    results.good.push(skill);
  }
}

console.log("=== SKILL QUALITY AUDIT ===\n");
console.log(`🟢 Excellent (punya ALWAYS/NEVER/When to Use): ${results.excellent.length}`);
console.log(`🟡 Good (cukup panjang, tapi kurang section): ${results.good.length}`);
console.log(`🔴 Weak (terlalu pendek / 1-2 baris): ${results.weak.length}`);
console.log(`⚫ Empty (hampir kosong): ${results.empty.length}`);
console.log(`\nTotal scanned: ${results.excellent.length + results.good.length + results.weak.length + results.empty.length}`);

if (results.weak.length > 0) {
  console.log(`\n--- WEAK SKILLS (perlu diperbaiki) ---`);
  for (const w of results.weak.slice(0, 30)) {
    console.log(`  ❌ ${w.skill}: ${w.reason}`);
  }
  if (results.weak.length > 30) {
    console.log(`  ... dan ${results.weak.length - 30} lainnya`);
  }
}

if (results.empty.length > 0) {
  console.log(`\n--- EMPTY SKILLS (perlu dihapus atau diisi) ---`);
  for (const e of results.empty) {
    console.log(`  💀 ${e.skill}: ${e.reason}`);
  }
}

if (results.weak.length === 0 && results.empty.length === 0) {
  console.log("\n✅ Semua skill berkualitas cukup baik!");
} else {
  console.log(`\n❌ FAIL: ${results.weak.length + results.empty.length} skill(s) below quality bar (weak/empty).`);
  process.exit(1);
}
