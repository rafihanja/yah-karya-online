#!/usr/bin/env node
/**
 * enforce-skill-quality.mjs
 *
 * Hard-block validator for SKILL.md files (Skill Library Revolution standard).
 * Used as a pre-commit gate: exits 1 if any SKILL.md violates the 4 quality rules
 * or is missing required 10-point markers.
 *
 * Usage:
 *   node .agent/scripts/enforce-skill-quality.mjs <file1.md> [file2.md] ...
 *   node .agent/scripts/enforce-skill-quality.mjs --staged       # auto-detect staged SKILL.md
 *   node .agent/scripts/enforce-skill-quality.mjs --all          # check ALL skills (audit mode)
 *
 * Exit codes:
 *   0 — all checked files comply
 *   1 — at least one violation found
 *   2 — usage error (no files / bad args)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const skillsRoot = path.join(agentRoot, "skills");

// -- Rule thresholds ----------------------------------------------------------
const RULES = {
  minFailureModes: 5,
  minValidationSteps: 4,
  forbiddenValidationCommands: ["npm run build"],
  forbiddenTemplatedHeaders: ["Cara memverifikasi kepatuhan penggunaan"],
  forbiddenAbsolutePathPatterns: [/[A-Z]:\/Users\//, /\/Users\/[a-z]/, /\/home\/[a-z]/],
  forbiddenAutoGenSections: ["## Limitations"],
  requiredMarkers: [
    "## Why This Exists",
    "## ALWAYS DO",
    "## NEVER DO",
    "## Failure Modes",
    "## Validation",
    "## Sub-Agent Propagation",
  ],
};

// -- Helpers ------------------------------------------------------------------
function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

function getStagedSkillFiles() {
  try {
    const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
      encoding: "utf8",
    });
    return out
      .split("\n")
      .filter((f) => f.endsWith("SKILL.md") && f.includes(".agent/skills/"))
      .map((f) => path.resolve(process.cwd(), f));
  } catch {
    return [];
  }
}

function getAllSkillFiles() {
  const out = [];
  if (!fs.existsSync(skillsRoot)) return out;
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const f = path.join(skillsRoot, entry.name, "SKILL.md");
    if (fs.existsSync(f)) out.push(f);
  }
  return out;
}

function extractSection(content, header) {
  // Captures content between the given "## Header" and the next "## " heading.
  const lines = content.split("\n");
  const startIdx = lines.findIndex((l) => l.trimEnd() === header);
  if (startIdx === -1) return null;
  const tail = lines.slice(startIdx + 1);
  const endRel = tail.findIndex((l) => /^## /.test(l));
  return endRel === -1 ? tail.join("\n") : tail.slice(0, endRel).join("\n");
}

// -- Validation logic ---------------------------------------------------------
function validateSkill(filePath) {
  const violations = [];
  const content = readFile(filePath);

  // Required markers
  for (const marker of RULES.requiredMarkers) {
    if (!content.includes(marker)) {
      violations.push(`MISSING_MARKER: ${marker}`);
    }
  }

  // Failure Modes depth
  const fmSection = extractSection(content, "## Failure Modes");
  if (fmSection !== null) {
    const fmCount = (fmSection.match(/^- /gm) || []).length;
    if (fmCount < RULES.minFailureModes) {
      violations.push(
        `THIN_FAILURE_MODES: ${fmCount} patterns (need ≥${RULES.minFailureModes})`,
      );
    }
  }

  // Validation depth
  const valSection = extractSection(content, "## Validation");
  if (valSection !== null) {
    const valCount = (valSection.match(/^\d+\. /gm) || []).length;
    if (valCount < RULES.minValidationSteps) {
      violations.push(
        `THIN_VALIDATION: ${valCount} steps (need ≥${RULES.minValidationSteps})`,
      );
    }

    // Forbidden boilerplate commands inside Validation
    for (const bad of RULES.forbiddenValidationCommands) {
      if (valSection.includes(bad)) {
        violations.push(`BOILERPLATE_COMMAND_IN_VALIDATION: "${bad}"`);
      }
    }
  }

  // Forbidden templated headers (anywhere in file)
  for (const tplHdr of RULES.forbiddenTemplatedHeaders) {
    if (content.includes(tplHdr)) {
      violations.push(`TEMPLATED_HEADER: "${tplHdr}"`);
    }
  }

  // Forbidden absolute paths
  for (const pattern of RULES.forbiddenAbsolutePathPatterns) {
    if (pattern.test(content)) {
      const sample = content.match(pattern);
      violations.push(`ABSOLUTE_PATH_LEAK: matches ${pattern} (e.g., "${sample?.[0]}")`);
    }
  }

  // Forbidden auto-gen tail sections
  for (const sec of RULES.forbiddenAutoGenSections) {
    // Allow ## Limitations only if NOT the trailing auto-gen boilerplate
    // (auto-gen pattern: 3 generic bullet points about scope/validation/clarification)
    if (content.includes(sec + "\n")) {
      const tail = extractSection(content, sec) || "";
      const isAutoGen =
        tail.includes("Use this skill only when") &&
        tail.includes("not a substitute") &&
        tail.includes("ask for clarification");
      if (isAutoGen) {
        violations.push(`AUTO_GENERATED_TAIL: ${sec} contains generator boilerplate`);
      }
    }
  }

  return violations;
}

// -- CLI ----------------------------------------------------------------------
function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) return { mode: "usage", files: [] };
  if (args[0] === "--staged") return { mode: "staged", files: [] };
  if (args[0] === "--all") return { mode: "all", files: [] };
  return { mode: "explicit", files: args };
}

function printUsage() {
  console.log(
    `Usage:\n` +
      `  node .agent/scripts/enforce-skill-quality.mjs <file...>\n` +
      `  node .agent/scripts/enforce-skill-quality.mjs --staged   # check staged SKILL.md\n` +
      `  node .agent/scripts/enforce-skill-quality.mjs --all      # audit ALL skills\n`,
  );
}

function main() {
  const { mode, files } = parseArgs(process.argv);
  let targets;

  if (mode === "usage") {
    printUsage();
    process.exit(2);
  }

  if (mode === "staged") targets = getStagedSkillFiles();
  else if (mode === "all") targets = getAllSkillFiles();
  else targets = files.map((f) => path.resolve(process.cwd(), f));

  // Filter: only SKILL.md under .agent/skills/
  targets = targets.filter(
    (f) => f.endsWith("SKILL.md") && f.includes(path.join(".agent", "skills")),
  );

  if (targets.length === 0) {
    if (mode === "staged") {
      console.log("✓ No staged SKILL.md files to check.");
      process.exit(0);
    }
    console.error("ERROR: no SKILL.md files matched.");
    process.exit(2);
  }

  let totalViolations = 0;
  const report = [];

  for (const file of targets) {
    if (!fs.existsSync(file)) {
      report.push({ file, violations: [`FILE_NOT_FOUND`] });
      totalViolations++;
      continue;
    }
    const violations = validateSkill(file);
    if (violations.length > 0) {
      report.push({ file, violations });
      totalViolations += violations.length;
    }
  }

  // Output
  const relFromRepo = (f) => path.relative(path.resolve(agentRoot, ".."), f).replace(/\\/g, "/");

  if (totalViolations === 0) {
    console.log(`✓ All ${targets.length} SKILL.md file(s) comply with quality rules.`);
    process.exit(0);
  }

  console.error(`\n✗ Skill quality enforcement FAILED — ${totalViolations} violation(s) in ${report.length} file(s):\n`);
  for (const { file, violations } of report) {
    console.error(`  ${relFromRepo(file)}:`);
    for (const v of violations) console.error(`    • ${v}`);
    console.error("");
  }
  console.error(
    `Quality rules (see PROJECT_MEMORY.md section 6 + .agent/templates/skill-template-master.md):\n` +
      `  - Failure Modes: ≥${RULES.minFailureModes} domain-specific patterns\n` +
      `  - Validation: ≥${RULES.minValidationSteps} tool-relevant steps (no "npm run build" filler)\n` +
      `  - No templated header "Cara memverifikasi kepatuhan penggunaan ..."\n` +
      `  - No absolute paths (C:/Users, /Users/x, /home/x)\n` +
      `  - All 6 required markers present\n` +
      `  - No auto-generated "## Limitations" boilerplate tail\n\n` +
      `Fix the violations above before committing. Bypass with --no-verify ONLY if user explicitly authorizes.\n`,
  );
  process.exit(1);
}

main();
