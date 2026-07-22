import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");
const agentRoot = path.join(repoRoot, ".agent");
const skillsRoot = path.join(agentRoot, "skills");
const manifestPath = path.join(skillsRoot, ".antigravity-install-manifest.json");
const routerPath = path.join(agentRoot, "skill-router.json");

const requiredFiles = [
  ".agent/START_HERE.md",
  ".agent/AGENTS.md",
  ".agent/active-skills.json",
  ".agent/official-reference-map.json",
  ".agent/adapters/adapter-map.json",
  ".agent/adapters/profiles/antigravity.json",
  ".agent/rules/evidence-first.md",
  ".agent/rules/hybrid-router.md",
  ".agent/rules/professional-engineering.md",
  ".agent/rules/official-reference-verification.md",
  ".agent/README.md",
  ".agent/core/anti-hallucination.md",
  ".agent/core/agent-adapter-strategy.md",
  ".agent/core/hybrid-agent-policy.md",
  ".agent/core/professional-engineering-standards.md",
  ".agent/core/safe-commands.md",
  ".agent/memory/decisions.md",
  ".agent/memory/lessons-learned.md",
  ".agent/projects/index.json",
  ".agent/skill-router.json",
  ".agent/skills/llms.txt",
  ".agent/skills/INDEX.md",
  ".agent/scripts/bootstrap-agent.mjs",
  ".agent/scripts/validate-agent-skills.mjs",
  ".agent/scripts/detect-project.mjs",
  ".agent/scripts/agent-doctor.mjs",
  ".agent/scripts/export-agent-adapters.mjs",
];

const requiredSkills = [
  "gsap-core",
  "gsap-timeline",
  "gsap-scrolltrigger",
  "gsap-plugins",
  "gsap-utils",
  "gsap-react",
  "gsap-frameworks",
  "gsap-performance",
  "elite-gsap-react-architecture",
];

const secretPatterns = [
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9_]{36,}/],
  ["OpenAI key", /sk-[A-Za-z0-9]{32,}/],
  ["Anthropic key", /sk-ant-[A-Za-z0-9_-]{20,}/],
  ["Hugging Face token", /hf_[A-Za-z0-9]{20,}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{35}/],
  ["Private key marker", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

const failures = [];
const warnings = [];

function rel(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`${rel(file)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function addFailure(message) {
  failures.push(message);
}

function walk(directory, visitor) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, visitor);
    } else {
      visitor(absolutePath);
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(repoRoot, file))) {
    addFailure(`Missing required file: ${file}`);
  }
}

const manifest = fs.existsSync(manifestPath) ? readJson(manifestPath) : null;
const router = fs.existsSync(routerPath) ? readJson(routerPath) : null;
const activeSkillsPath = path.join(agentRoot, "active-skills.json");
const activeSkills = fs.existsSync(activeSkillsPath) ? readJson(activeSkillsPath) : null;

const skillDirs = [];
if (fs.existsSync(skillsRoot)) {
  walk(skillsRoot, (file) => {
    if (path.basename(file) === "SKILL.md") {
      skillDirs.push(path.relative(skillsRoot, path.dirname(file)).replaceAll(path.sep, "/"));
    }
  });
} else {
  addFailure("Missing .agent/skills directory.");
}

const manifestEntries = new Set(Array.isArray(manifest?.entries) ? manifest.entries : []);
for (const skill of skillDirs) {
  if (!manifestEntries.has(skill)) addFailure(`Skill missing from manifest: ${skill}`);
}

for (const entry of manifestEntries) {
  if (!fs.existsSync(path.join(skillsRoot, entry))) addFailure(`Manifest entry missing on disk: ${entry}`);
}

for (const skill of requiredSkills) {
  if (!fs.existsSync(path.join(skillsRoot, skill, "SKILL.md"))) {
    addFailure(`Required GSAP skill missing: ${skill}`);
  }
  if (!manifestEntries.has(skill)) {
    addFailure(`Required GSAP skill missing from manifest: ${skill}`);
  }
}

const wiredSkills = new Set();

if (router) {
  if (!Array.isArray(router.routes)) addFailure(".agent/skill-router.json must contain routes array.");
  if (!Array.isArray(router.sourcePriority)) addFailure(".agent/skill-router.json must contain sourcePriority array.");

  // Include skills, optionalSkills, and antiSlopSkills in broken-reference check.
  const routedSkills = new Set([
    ...(router.routes || []).flatMap((route) => [...(route.skills || []), ...(route.optionalSkills || [])]),
    ...(router.mandatorySkillUsage?.antiSlopSkills || []),
  ]);
  for (const skill of routedSkills) {
    wiredSkills.add(skill);
    if (!fs.existsSync(path.join(skillsRoot, skill, "SKILL.md"))) {
      addFailure(`Router references missing skill: ${skill}`);
    }
  }
}

if (activeSkills) {
  const activeSkillNames = [
    ...(activeSkills.defaultSet || []),
    ...Object.values(activeSkills.taskSets || {}).flat(),
  ];

  for (const skill of new Set(activeSkillNames)) {
    wiredSkills.add(skill);
    if (!fs.existsSync(path.join(skillsRoot, skill, "SKILL.md"))) {
      addFailure(`Active skill missing on disk: ${skill}`);
    }
    if (!manifestEntries.has(skill)) {
      addFailure(`Active skill missing from manifest: ${skill}`);
    }
  }
}

// Orphan check: skills on disk that are not wired anywhere (router or active-skills).
// Governance + required GSAP skills are always considered wired even if not routed.
const FORCE_WIRED = new Set([...requiredSkills,
  "session-boot", "auto-pro-standards", "prompt-amplifier", "phased-delivery",
  "project-memory", "self-review-gate",
]);
const orphanSkills = skillDirs.filter((skill) => !wiredSkills.has(skill) && !FORCE_WIRED.has(skill));
if (orphanSkills.length > 0) {
  warnings.push(
    `${orphanSkills.length} skill(s) di disk tidak dirujuk router/active-skills (orphan). ` +
    `Jalankan: node .agent/scripts/audit-orphan-skills.mjs --list | prune: node .agent/scripts/prune-orphan-skills.mjs`
  );
  for (const skill of orphanSkills.slice(0, 10)) warnings.push(`  orphan: ${skill}`);
  if (orphanSkills.length > 10) warnings.push(`  ... dan ${orphanSkills.length - 10} lainnya`);
}

// Orphan script check: .agent/scripts/*.mjs yang tidak direferensikan di manapun
// di dalam .agent (router, rules, hooks, docs, memory, skills, atau script lain).
// Bridge di root tidak di-scan karena isinya generated dari .agent (menghindari
// referensi palsu dari file turunan). Mirror orphan-skill check: WARNING dulu,
// bukan hard-fail — naikkan ke fail hanya setelah relic sekali-jalan dibersihkan.
const scriptsRoot = path.join(agentRoot, "scripts");
if (fs.existsSync(scriptsRoot)) {
  const scriptFiles = fs.readdirSync(scriptsRoot).filter((name) => name.endsWith(".mjs"));
  const scriptTextByName = new Map();
  let staticRefBlob = "";

  walk(agentRoot, (file) => {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      return;
    }
    if (path.dirname(file) === scriptsRoot && file.endsWith(".mjs")) {
      scriptTextByName.set(path.basename(file), text);
    } else {
      staticRefBlob += `\n${text}`;
    }
  });

  const orphanScripts = scriptFiles.filter((script) => {
    const base = script.replace(/\.mjs$/, "");
    if (staticRefBlob.includes(base)) return false;
    for (const [other, text] of scriptTextByName) {
      if (other !== script && text.includes(base)) return false;
    }
    return true;
  });

  if (orphanScripts.length > 0) {
    warnings.push(
      `${orphanScripts.length} script di .agent/scripts tidak direferensikan di manapun ` +
      "(kemungkinan relic sekali-jalan). Tinjau, lalu hapus/arsipkan kalau memang usang."
    );
    for (const script of orphanScripts.slice(0, 12)) warnings.push(`  orphan-script: ${script}`);
    if (orphanScripts.length > 12) warnings.push(`  ... dan ${orphanScripts.length - 12} lainnya`);
  }
}

const agentControlFiles = [
  path.join(agentRoot, "START_HERE.md"),
  path.join(agentRoot, "AGENTS.md"),
  path.join(agentRoot, "README.md"),
  path.join(agentRoot, "active-skills.json"),
  path.join(agentRoot, "official-reference-map.json"),
  path.join(agentRoot, "skill-router.json"),
  path.join(agentRoot, "adapters", "adapter-map.json"),
];

for (const directory of [
  path.join(agentRoot, "core"),
  path.join(agentRoot, "adapters"),
  path.join(agentRoot, "rules"),
  path.join(agentRoot, "scripts"),
  path.join(agentRoot, "memory"),
  path.join(agentRoot, "projects"),
]) {
  if (fs.existsSync(directory)) {
    walk(directory, (file) => agentControlFiles.push(file));
  }
}

for (const file of agentControlFiles) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const [name, pattern] of secretPatterns) {
    if (pattern.test(content)) {
      addFailure(`Secret-like value found in ${rel(file)} (${name}).`);
    }
  }
}

const agentRuleCount = fs.existsSync(path.join(agentRoot, "rules"))
  ? fs.readdirSync(path.join(agentRoot, "rules")).filter((name) => name.endsWith(".md")).length
  : 0;

if (agentRuleCount === 0) warnings.push("No .agent/rules/*.md files found.");
if (!fs.existsSync(path.join(agentRoot, "skills"))) warnings.push("No .agent/skills directory found.");

if (failures.length > 0) {
  console.error("FAIL: agent doctor found problems.");
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length > 0) {
    console.error("Warnings:");
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log("OK: agent doctor passed.");
console.log(`- Required files: ${requiredFiles.length}`);
console.log(`- Portable rule files: ${agentRuleCount}`);
console.log(`- Skills with SKILL.md: ${skillDirs.length}`);
console.log(`- Manifest entries: ${manifestEntries.size}`);
console.log(`- Required GSAP skills: ${requiredSkills.length}`);
console.log(`- Agent control files secret-scanned: ${agentControlFiles.length}`);
if (warnings.length > 0) {
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
