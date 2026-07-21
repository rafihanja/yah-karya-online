#!/usr/bin/env node
/**
 * audit-orphan-skills.mjs
 *
 * Cari skill yang "sia-sia" (ga kepake) dan referensi yang rusak.
 *
 * Sebuah skill dianggap TERPAKAI ("wired") kalau dirujuk di salah satu:
 *   - .agent/skill-router.json  (routes[].skills, routes[].optionalSkills,
 *                                 mandatorySkillUsage.antiSlopSkills)
 *   - .agent/active-skills.json (defaultSet, taskSets.*)
 *
 * Output:
 *   - Ringkasan angka ke console
 *   - Daftar broken reference (dirujuk tapi ga ada di disk)
 *   - Laporan lengkap ditulis ke .agent/memory/orphan-skills-report.md
 *
 * Flags:
 *   --list   tampilkan SEMUA orphan ke console (bukan cuma sample)
 *   --json   cetak hasil sebagai JSON ke console
 *
 * Usage: node .agent/scripts/audit-orphan-skills.mjs [--list] [--json]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentRoot = path.resolve(here, "..");
const skillsRoot = path.join(agentRoot, "skills");
const routerPath = path.join(agentRoot, "skill-router.json");
const activePath = path.join(agentRoot, "active-skills.json");
const reportPath = path.join(agentRoot, "memory", "orphan-skills-report.md");

const args = new Set(process.argv.slice(2));
const showAll = args.has("--list");
const asJson = args.has("--json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// 1. Semua skill di disk (folder yang punya SKILL.md)
const onDisk = new Set();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const abs = path.join(dir, entry.name);
    if (fs.existsSync(path.join(abs, "SKILL.md"))) {
      onDisk.add(path.relative(skillsRoot, abs).replaceAll(path.sep, "/"));
    }
    walk(abs);
  }
}
if (!fs.existsSync(skillsRoot)) {
  console.error(`FAIL: skills directory tidak ada: ${skillsRoot}`);
  process.exit(1);
}
walk(skillsRoot);

// 2. Skill yang dirujuk di router
const router = readJson(routerPath);
const routerSkills = new Set(
  (router.routes || []).flatMap((r) => [
    ...(r.skills || []),
    ...(r.optionalSkills || []),
  ])
);
for (const s of router.mandatorySkillUsage?.antiSlopSkills || []) {
  routerSkills.add(s);
}

// 3. Skill yang dirujuk di active-skills
const active = readJson(activePath);
const activeSkills = new Set([
  ...(active.defaultSet || []),
  ...Object.values(active.taskSets || {}).flat(),
]);

// 4. Hitung
const wired = new Set([...routerSkills, ...activeSkills]);
const wiredMissing = [...wired].filter((s) => !onDisk.has(s)).sort();
const orphans = [...onDisk].filter((s) => !wired.has(s)).sort();
const used = [...onDisk].filter((s) => wired.has(s)).sort();

const summary = {
  totalOnDisk: onDisk.size,
  referencedInRouter: routerSkills.size,
  referencedInActive: activeSkills.size,
  wiredUnique: wired.size,
  brokenReferences: wiredMissing.length,
  orphans: orphans.length,
  orphanRatioPct: Number(((orphans.length / onDisk.size) * 100).toFixed(1)),
};

// 5. Output
if (asJson) {
  console.log(JSON.stringify({ summary, wiredMissing, used, orphans }, null, 2));
} else {
  console.log("=== ORPHAN SKILL AUDIT ===\n");
  console.log(`Total skill di disk            : ${summary.totalOnDisk}`);
  console.log(`Dirujuk di router              : ${summary.referencedInRouter}`);
  console.log(`Dirujuk di active-skills       : ${summary.referencedInActive}`);
  console.log(`Total terpakai (union)         : ${summary.wiredUnique}`);
  console.log(`Referensi RUSAK (broken)       : ${summary.brokenReferences}`);
  console.log(`Orphan (ga kepake)             : ${summary.orphans}`);
  console.log(`Rasio orphan                   : ${summary.orphanRatioPct}%`);

  if (wiredMissing.length) {
    console.log(`\n--- BROKEN REFERENCES (dirujuk tapi ga ada di disk) ---`);
    for (const s of wiredMissing) console.log(`  ❌ ${s}`);
  }

  const sample = showAll ? orphans : orphans.slice(0, 30);
  console.log(`\n--- ORPHAN SKILLS ${showAll ? "(semua)" : "(sample 30, pakai --list buat semua)"} ---`);
  for (const s of sample) console.log(`  ${s}`);
  if (!showAll && orphans.length > 30) {
    console.log(`  ... dan ${orphans.length - 30} lainnya (lihat ${path.relative(agentRoot, reportPath).replaceAll(path.sep, "/")})`);
  }
}

// 6. Tulis laporan lengkap ke file
const now = new Date().toISOString();
const lines = [];
lines.push(`# Orphan Skills Report`);
lines.push("");
lines.push(`> Dibuat otomatis oleh \`.agent/scripts/audit-orphan-skills.mjs\``);
lines.push(`> Terakhir dijalankan: ${now}`);
lines.push("");
lines.push(`## Ringkasan`);
lines.push("");
lines.push(`| Metrik | Angka |`);
lines.push(`|---|---|`);
lines.push(`| Total skill di disk | ${summary.totalOnDisk} |`);
lines.push(`| Dirujuk di router | ${summary.referencedInRouter} |`);
lines.push(`| Dirujuk di active-skills | ${summary.referencedInActive} |`);
lines.push(`| Total terpakai (union) | ${summary.wiredUnique} |`);
lines.push(`| Referensi rusak | ${summary.brokenReferences} |`);
lines.push(`| Orphan (ga kepake) | ${summary.orphans} |`);
lines.push(`| Rasio orphan | ${summary.orphanRatioPct}% |`);
lines.push("");
if (wiredMissing.length) {
  lines.push(`## Broken References (dirujuk tapi ga ada di disk)`);
  lines.push("");
  for (const s of wiredMissing) lines.push(`- \`${s}\``);
  lines.push("");
}
lines.push(`## Skill Terpakai (${used.length})`);
lines.push("");
for (const s of used) lines.push(`- \`${s}\``);
lines.push("");
lines.push(`## Orphan Skills (${orphans.length}) — kandidat prune/arsip`);
lines.push("");
for (const s of orphans) lines.push(`- ${s}`);
lines.push("");

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
console.log(`\n📄 Laporan lengkap ditulis ke: ${path.relative(agentRoot, reportPath).replaceAll(path.sep, "/")}`);
