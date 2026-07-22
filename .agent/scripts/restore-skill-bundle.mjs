#!/usr/bin/env node
/**
 * restore-skill-bundle.mjs
 *
 * Restore "on-demand bundle" skill dari git history pas kebutuhannya muncul.
 * Bundle didefinisikan di active-skills.json -> onDemandBundles.bundles.
 *
 * Yang dilakukan:
 *   1. git checkout <restoreSource> -- <skill folders>  (ambil balik dari history)
 *   2. Tambah skill ke manifest (.antigravity-install-manifest.json)
 *   3. Auto-wire: tambah task-set + route ke active-skills.json & skill-router.json
 *
 * Usage:
 *   node .agent/scripts/restore-skill-bundle.mjs            # list bundle tersedia
 *   node .agent/scripts/restore-skill-bundle.mjs mobile     # restore + wire bundle "mobile"
 *
 * Setelah restore, jalankan agent-doctor buat verifikasi.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const agentRoot = path.resolve(here, "..");
const repoRoot = path.resolve(agentRoot, "..");
const skillsRoot = path.join(agentRoot, "skills");
const activePath = path.join(agentRoot, "active-skills.json");
const routerPath = path.join(agentRoot, "skill-router.json");
const manifestPath = path.join(skillsRoot, ".antigravity-install-manifest.json");

const bundleName = process.argv[2];
const force = process.argv.includes("--force");
const active = JSON.parse(fs.readFileSync(activePath, "utf8"));
const onDemand = active.onDemandBundles || {};
const bundles = onDemand.bundles || {};
const restoreSource = onDemand.restoreSource || "HEAD";

if (!bundleName) {
  console.log("=== ON-DEMAND BUNDLES ===");
  console.log(`Restore source (git): ${restoreSource}\n`);
  const names = Object.keys(bundles);
  if (!names.length) { console.log("Belum ada bundle yang didefinisikan."); process.exit(0); }
  for (const n of names) {
    const b = bundles[n];
    console.log(`  ${n}  [${b.status || "?"}]  (${b.skills.length} skill) - ${b.reason || ""}`);
  }
  console.log(`\nRestore: node .agent/scripts/restore-skill-bundle.mjs <bundle>`);
  process.exit(0);
}

const bundle = bundles[bundleName];
if (!bundle) {
  console.error(`FAIL: bundle "${bundleName}" ga ada. Bundle tersedia: ${Object.keys(bundles).join(", ") || "(none)"}`);
  process.exit(1);
}

console.log(`=== RESTORE BUNDLE: ${bundleName} ===`);
console.log(`Sumber git: ${restoreSource}`);
console.log(`Skill: ${bundle.skills.length}\n`);

// 0. dirty-tree check (safe-commands.md: git checkout on these paths can
//    silently discard uncommitted local edits — refuse unless --force).
const targets = bundle.skills.map((s) => `.agent/skills/${s}`);
let dirtyOutput = "";
try {
  dirtyOutput = execSync(`git status --short -- ${targets.join(" ")}`, {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
} catch (err) {
  console.error(`FAIL: could not check git status before restore: ${err.message}`);
  process.exit(1);
}
if (dirtyOutput && !force) {
  console.error("FAIL: uncommitted local changes found in target skill paths — restore aborted.");
  console.error("This restore runs `git checkout` on these paths, which would silently discard:");
  console.error(dirtyOutput);
  console.error("\nCommit or stash those changes first, or re-run with --force to discard them intentionally:");
  console.error(`  node .agent/scripts/restore-skill-bundle.mjs ${bundleName} --force`);
  process.exit(1);
}

// 1. git checkout skill folders
try {
  execSync(`git checkout ${restoreSource} -- ${targets.join(" ")}`, { cwd: repoRoot, stdio: "inherit" });
} catch (err) {
  console.error(`FAIL: git checkout error: ${err.message}`);
  process.exit(1);
}

// verifikasi yang berhasil ke-restore
const restored = bundle.skills.filter((s) => fs.existsSync(path.join(skillsRoot, s, "SKILL.md")));
const missing = bundle.skills.filter((s) => !restored.includes(s));
console.log(`Ter-restore: ${restored.length}/${bundle.skills.length}`);
if (missing.length) console.log(`Tidak ada di ${restoreSource}: ${missing.join(", ")}`);

// 2. update manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
for (const s of restored) if (!manifest.entries.includes(s)) manifest.entries.push(s);
manifest.entries.sort((a, b) => a.localeCompare(b));
manifest.entryCount = manifest.entries.length;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Manifest entries: ${manifest.entryCount}`);

// 3. auto-wire: task-set + route
const wire = bundle.wireInto || {};
if (wire.taskSet) {
  active.taskSets = active.taskSets || {};
  active.taskSets[wire.taskSet] = restored;
}
if (bundle.status !== undefined) bundle.status = "installed";
fs.writeFileSync(activePath, JSON.stringify(active, null, 2) + "\n");
console.log(`Wired ke active-skills taskSet: ${wire.taskSet || "(none)"}`);

if (wire.routeWhen && restored.length) {
  const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
  const exists = (router.routes || []).some(
    (r) => JSON.stringify(r.when) === JSON.stringify(wire.routeWhen)
  );
  if (!exists) {
    router.routes.push({
      when: wire.routeWhen,
      skills: restored,
      validation: ["project-build-if-available"],
    });
    fs.writeFileSync(routerPath, JSON.stringify(router, null, 2) + "\n");
    console.log(`Route ditambahkan: when ${JSON.stringify(wire.routeWhen)}`);
  } else {
    console.log("Route sudah ada, skip.");
  }
}

console.log(`\nSelesai. Verifikasi: node .agent/scripts/agent-doctor.mjs`);
