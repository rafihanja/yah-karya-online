#!/usr/bin/env node
/**
 * generate-skill-index.mjs
 *
 * Membangun katalog RINGKAS untuk SELURUH skill di .agent/skills/ ke satu file
 * .agent/skills/INDEX.md. Tujuannya: agent bisa MELIHAT semua skill tiap task
 * (progressive disclosure) tanpa harus membuka semua SKILL.md mentah — scan
 * INDEX dulu, baru buka SKILL.md penuh yang benar-benar match.
 *
 * Sumber data:
 *  - Frontmatter `name` + `description` tiap <skill>/SKILL.md
 *    (handle quoted string, plain scalar, dan block scalar `>` / `|`).
 *  - active-skills.json untuk anotasi keanggotaan set (default / taskset / on-demand).
 *
 * Sifat output:
 *  - Deterministik (sorted by name) dan idempoten (TANPA timestamp) supaya
 *    aman dari diff-churn dan bisa dijadikan drift-gate oleh validator.
 *
 * Usage:
 *   node .agent/scripts/generate-skill-index.mjs            # tulis INDEX.md
 *   node .agent/scripts/generate-skill-index.mjs --check    # exit 1 jika INDEX.md stale (tidak menulis)
 *
 * Exit codes:
 *   0 — sukses tulis, atau (dengan --check) INDEX.md sudah up-to-date
 *   1 — (dengan --check) INDEX.md stale / hilang
 *   2 — error fatal (skills dir hilang, frontmatter rusak)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const skillsRoot = path.join(agentRoot, "skills");
const activeSkillsPath = path.join(agentRoot, "active-skills.json");
const indexPath = path.join(skillsRoot, "INDEX.md");

const INDEX_MARKER = "MANDATORY_SKILL_INDEX";

const checkMode = process.argv.slice(2).includes("--check");

function die(message, code = 2) {
  console.error(`FAIL: ${message}`);
  process.exit(code);
}

/**
 * Ekstrak frontmatter YAML sederhana (blok pertama antara `---` ... `---`).
 * Bukan parser YAML penuh — cukup untuk field skalar `name` dan `description`
 * termasuk block scalar (`>` folded / `|` literal) dengan lanjutan ter-indent.
 */
function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return {};

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return {};

  const fm = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2];

    // Block scalar: `>` (folded) atau `|` (literal). Kumpulkan baris ter-indent.
    if (value.trim() === ">" || value.trim() === "|") {
      const collected = [];
      let j = i + 1;
      for (; j < end; j++) {
        const cont = lines[j];
        if (cont.trim() === "") {
          collected.push("");
          continue;
        }
        if (/^\s+/.test(cont)) {
          collected.push(cont.trim());
        } else {
          break;
        }
      }
      i = j - 1;
      value = collected.join(" ").replace(/\s+/g, " ").trim();
    } else {
      value = value.trim();
      // Buang quote pembungkus jika ada.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
    }

    fm[key] = value;
  }
  return fm;
}

function listSkillDirs() {
  if (!fs.existsSync(skillsRoot)) die(`Missing skills directory: ${skillsRoot}`);
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readActiveSets() {
  const membership = new Map(); // skillName -> Set<label>
  const add = (skill, label) => {
    if (!membership.has(skill)) membership.set(skill, new Set());
    membership.get(skill).add(label);
  };

  if (!fs.existsSync(activeSkillsPath)) return membership;

  let active;
  try {
    active = JSON.parse(fs.readFileSync(activeSkillsPath, "utf8"));
  } catch (error) {
    die(`active-skills.json is not valid JSON: ${error.message}`);
  }

  for (const skill of active.defaultSet || []) add(skill, "default");

  for (const [setName, skills] of Object.entries(active.taskSets || {})) {
    for (const skill of skills || []) add(skill, `task:${setName}`);
  }

  const bundles = active.onDemandBundles?.bundles || {};
  for (const [bundleName, bundle] of Object.entries(bundles)) {
    const status = bundle.status === "installed" ? "installed" : "not-installed";
    for (const skill of bundle.skills || []) {
      add(skill, `on-demand:${bundleName}(${status})`);
    }
  }

  return membership;
}

function truncate(text, max = 240) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function buildIndex() {
  const skills = listSkillDirs();
  const membership = readActiveSets();

  const entries = skills.map((dir) => {
    const raw = fs.readFileSync(path.join(skillsRoot, dir, "SKILL.md"), "utf8");
    const fm = parseFrontmatter(raw);
    const name = fm.name?.trim() || dir;
    const description = truncate(fm.description || "(no description in frontmatter)");
    const sets = membership.get(dir) || membership.get(name) || new Set();
    return { dir, name, description, sets: [...sets].sort() };
  });

  const defaultCount = entries.filter((e) => e.sets.includes("default")).length;

  const header = [
    `<!-- ${INDEX_MARKER} -->`,
    "# Skill Index — SEMUA Skill (.agent/skills)",
    "",
    "> **AUTO-GENERATED — jangan edit tangan.** Regenerate:",
    "> `node .agent/scripts/generate-skill-index.mjs`",
    "",
    "## Cara Pakai (WAJIB)",
    "",
    "1. **Scan SELURUH index ini dulu** tiap task substantif — semua skill di repo",
    "   ada di sini, tidak ada yang disembunyikan. Ini pengganti asumsi \"cuma",
    "   file tertentu\": kamu melihat semua opsi, bukan cuma yang kebetulan match keyword.",
    "2. Silang-cek dengan `.agent/skill-router.json` untuk sinyal routing.",
    "3. **Baca `SKILL.md` PENUH** hanya untuk skill yang benar-benar relevan dengan task —",
    "   jangan mengklaim skill tanpa membuka file-nya (anti-hallucination gate).",
    "4. Tetap mulai output dengan header I AM CRAZY dan sebut skill yang dipakai.",
    "",
    "Legend set: `default` = selalu aktif; `task:<set>` = task-set di active-skills.json;",
    "`on-demand:<bundle>` = perlu restore lebih dulu (`node .agent/scripts/restore-skill-bundle.mjs <bundle>`).",
    "",
    `**Total skill: ${entries.length}** — di antaranya ${defaultCount} default-set.`,
    "",
    "---",
    "",
  ];

  const body = entries.map((e) => {
    const setLabel = e.sets.length ? e.sets.join(", ") : "unrouted (lihat router)";
    return [
      `### ${e.name}`,
      `- **Set:** ${setLabel}`,
      `- **Kapan dipakai:** ${e.description}`,
      `- **Path:** \`.agent/skills/${e.dir}/SKILL.md\``,
      "",
    ].join("\n");
  });

  return { content: header.join("\n") + "\n" + body.join("\n"), count: entries.length };
}

const { content, count } = buildIndex();

if (checkMode) {
  const existing = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : null;
  if (existing !== content) {
    console.error("FAIL: INDEX.md is stale or missing. Run: node .agent/scripts/generate-skill-index.mjs");
    process.exit(1);
  }
  console.log(`OK: INDEX.md up-to-date (${count} skills).`);
  process.exit(0);
}

fs.writeFileSync(indexPath, content, "utf8");
console.log(`OK: wrote .agent/skills/INDEX.md (${count} skills).`);
