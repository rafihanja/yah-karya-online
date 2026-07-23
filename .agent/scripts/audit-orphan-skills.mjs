import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const skillsRoot = path.join(agentRoot, "skills");
const routerPath = path.join(agentRoot, "skill-router.json");
const activeSkillsPath = path.join(agentRoot, "active-skills.json");

const args = process.argv.slice(2);
const listMode = args.includes("--list");

console.log("=== ORPHAN SKILLS AUDIT ===\n");

// Collect all skills on disk
const diskSkills = new Set();
for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md"))) {
    diskSkills.add(entry.name);
  }
}

// Collect wired skills from router
const wiredSkills = new Set();
let router;
try {
  router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
  for (const route of router.routes || []) {
    for (const skill of [...(route.skills || []), ...(route.optionalSkills || [])]) {
      wiredSkills.add(skill);
    }
  }
  // Also check mandatorySkillUsage.antiSlopSkills
  for (const skill of router.mandatorySkillUsage?.antiSlopSkills || []) {
    wiredSkills.add(skill);
  }
} catch {
  console.error("FAIL: cannot read skill-router.json");
  process.exit(1);
}

// Collect wired skills from active-skills.json
try {
  const activeSkills = JSON.parse(fs.readFileSync(activeSkillsPath, "utf8"));
  for (const skill of activeSkills.defaultSet || []) {
    wiredSkills.add(skill);
  }
  for (const skills of Object.values(activeSkills.taskSets || {})) {
    for (const skill of skills) {
      wiredSkills.add(skill);
    }
  }
} catch {
  console.warn("WARN: cannot read active-skills.json, skipping.");
}

// Governance skills are always considered wired
const GOVERNANCE_SKILLS = new Set([
  "session-boot", "auto-pro-standards", "prompt-amplifier",
  "phased-delivery", "project-memory", "self-review-gate",
  "gsap-core", "gsap-timeline", "gsap-scrolltrigger",
  "gsap-plugins", "gsap-utils", "gsap-react",
  "gsap-frameworks", "gsap-performance", "elite-gsap-react-architecture",
]);

for (const skill of GOVERNANCE_SKILLS) wiredSkills.add(skill);

// Find orphans
const orphans = [...diskSkills]
  .filter((skill) => !wiredSkills.has(skill))
  .sort((a, b) => a.localeCompare(b));

const wiredOnDisk = [...diskSkills].filter((skill) => wiredSkills.has(skill));

console.log(`📋 Skills on disk: ${diskSkills.size}`);
console.log(`🔗 Skills wired (router + active-skills + governance): ${wiredSkills.size}`);
console.log(`✅ Wired & on disk: ${wiredOnDisk.length}`);
console.log(`👻 Orphan (on disk, not wired): ${orphans.length}`);
console.log(`📊 Orphan rate: ${((orphans.length / diskSkills.size) * 100).toFixed(1)}%\n`);

if (orphans.length === 0) {
  console.log("✅ No orphan skills found!\n");
} else {
  if (listMode) {
    console.log("Orphan skills (--list mode):\n");
    for (const skill of orphans) {
      const skillPath = path.join(skillsRoot, skill, "SKILL.md");
      const stat = fs.statSync(skillPath);
      const sizeKb = (stat.size / 1024).toFixed(1);
      console.log(`  👻 ${skill} (${sizeKb} KB)`);
    }
  } else {
    // Group by rough category (first word or prefix)
    const categories = new Map();
    for (const skill of orphans) {
      const prefix = skill.split("-")[0];
      if (!categories.has(prefix)) categories.set(prefix, []);
      categories.get(prefix).push(skill);
    }

    console.log("Orphan skills grouped by prefix:\n");
    const sortedCategories = [...categories.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );
    for (const [prefix, skills] of sortedCategories) {
      if (skills.length >= 2) {
        console.log(`  [${prefix}] (${skills.length}):`);
        for (const s of skills) console.log(`    👻 ${s}`);
      }
    }
    // Singletons
    const singletons = sortedCategories
      .filter(([, skills]) => skills.length === 1)
      .map(([, skills]) => skills[0]);
    if (singletons.length > 0) {
      console.log(`\n  [ungrouped singletons] (${singletons.length}):`);
      for (const s of singletons.slice(0, 15)) console.log(`    👻 ${s}`);
      if (singletons.length > 15) console.log(`    ... dan ${singletons.length - 15} lainnya`);
    }
  }

  console.log(`\n💡 Options:`);
  console.log(`  1. Wire needed skills into skill-router.json routes`);
  console.log(`  2. Add needed skills to active-skills.json defaultSet/taskSets`);
  console.log(`  3. Remove truly unused skills with: node .agent/scripts/prune-orphan-skills.mjs`);
}

// Save report
const reportDir = path.join(agentRoot, "temp");
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, "orphan-skills-report.json"),
  JSON.stringify({
    diskCount: diskSkills.size,
    wiredCount: wiredSkills.size,
    orphanCount: orphans.length,
    orphanRate: `${((orphans.length / diskSkills.size) * 100).toFixed(1)}%`,
    orphans,
  }, null, 2)
);
console.log(`\n💾 Report saved to .agent/temp/orphan-skills-report.json`);
