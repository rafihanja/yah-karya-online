#!/usr/bin/env node
/**
 * prune-orphan-skills.mjs
 *
 * Hapus skill orphan (ga dirujuk di router maupun active-skills).
 * AMAN: default dry-run. Hapus beneran hanya dengan flag --confirm.
 *
 * Yang DILINDUNGI (tidak akan dihapus):
 *   - Semua skill "wired" (router.skills/optionalSkills + active defaultSet/taskSets)
 *   - antiSlopSkills di router
 *   - requiredSkills GSAP (hardcoded, biar validator tetap lolos)
 *   - Skill governance inti (hardcoded)
 *
 * Setelah hapus, manifest (.antigravity-install-manifest.json) di-update
 * supaya tetap sinkron dengan isi disk.
 *
 * Usage:
 *   node .agent/scripts/prune-orphan-skills.mjs            # dry-run
 *   node .agent/scripts/prune-orphan-skills.mjs --confirm  # eksekusi
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentRoot = path.resolve(here, "..");
const skillsRoot = path.join(agentRoot, "skills");
const manifestPath = path.join(skillsRoot, ".antigravity-install-manifest.json");
const confirm = process.argv.includes("--confirm");

// --- skill governance & GSAP wajib (hardcoded protection) ---
const FORCE_KEEP = new Set([
  "gsap-core", "gsap-timeline", "gsap-scrolltrigger", "gsap-plugins", "gsap-utils",
  "gsap-react", "gsap-frameworks", "gsap-performance", "elite-gsap-react-architecture",
  "session-boot", "auto-pro-standards", "prompt-amplifier", "phased-delivery",
  "project-memory", "self-review-gate",
]);

// --- skill di disk (recursive, dir yang punya SKILL.md) ---
const onDisk = new Set();
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (fs.existsSync(path.join(p, "SKILL.md"))) {
      onDisk.add(path.relative(skillsRoot, p).replaceAll(path.sep, "/"));
    }
    walk(p);
  }
}
walk(skillsRoot);

// --- skill wired ---
const router = JSON.parse(fs.readFileSync(path.join(agentRoot, "skill-router.json"), "utf8"));
const active = JSON.parse(fs.readFileSync(path.join(agentRoot, "active-skills.json"), "utf8"));
const wired = new Set([
  ...(router.routes || []).flatMap((r) => [...(r.skills || []), ...(r.optionalSkills || [])]),
  ...(router.mandatorySkillUsage?.antiSlopSkills || []),
  ...(active.defaultSet || []),
  ...Object.values(active.taskSets || {}).flat(),
]);

const keep = new Set([...wired, ...FORCE_KEEP].filter((s) => onDisk.has(s)));
const orphans = [...onDisk].filter((s) => !keep.has(s)).sort();

console.log("=== PRUNE ORPHAN SKILLS ===");
console.log(`Mode            : ${confirm ? "EKSEKUSI (--confirm)" : "DRY-RUN (aman, ga ngapus apa-apa)"}`);
console.log(`Skill di disk   : ${onDisk.size}`);
console.log(`Dilindungi      : ${keep.size}`);
console.log(`Akan dihapus    : ${orphans.length}`);

if (!confirm) {
  console.log("\nContoh 20 yang akan dihapus:");
  for (const s of orphans.slice(0, 20)) console.log(`  - ${s}`);
  console.log(`\nJalankan ulang dengan --confirm untuk hapus beneran.`);
  process.exit(0);
}

// --- eksekusi hapus ---
let deleted = 0;
const errors = [];
for (const s of orphans) {
  const abs = path.join(skillsRoot, s);
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    deleted++;
  } catch (err) {
    errors.push(`${s}: ${err.message}`);
  }
}

// --- prune folder kosong yang tersisa ---
function pruneEmpty(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) pruneEmpty(path.join(dir, e.name));
  }
  if (dir !== skillsRoot) {
    const left = fs.readdirSync(dir);
    if (left.length === 0) fs.rmdirSync(dir);
  }
}
pruneEmpty(skillsRoot);

// --- update manifest ---
const remaining = [];
onDisk.clear();
walk(skillsRoot);
for (const s of onDisk) remaining.push(s);
remaining.sort((a, b) => a.localeCompare(b));

let manifest = {};
try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); } catch { manifest = {}; }
manifest.entries = remaining;
manifest.entryCount = remaining.length;
manifest.prunedAt = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`\nDihapus         : ${deleted}`);
console.log(`Sisa skill      : ${remaining.length}`);
console.log(`Manifest entries: ${manifest.entryCount}`);
if (errors.length) {
  console.log(`\nError (${errors.length}):`);
  for (const e of errors.slice(0, 10)) console.log(`  ! ${e}`);
}
console.log("\nSelesai. Jalankan agent-doctor & validate untuk verifikasi.");
