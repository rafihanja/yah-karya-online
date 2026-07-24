import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const skillsRoot = path.join(agentRoot, "skills");
const routerPath = path.join(agentRoot, "skill-router.json");

console.log("=== ROUTER ↔ SKILL CROSS-VALIDATION ===\n");

const issues = [];

// Read router
let router;
try {
  router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
} catch (error) {
  console.error(`FAIL: cannot read skill-router.json: ${error.message}`);
  process.exit(1);
}

// Collect all routed skills with their route context
const routedSkills = new Map(); // skillName -> [{ routeIndex, when/routeWhen }]
for (const [index, route] of (router.routes || []).entries()) {
  const skills = [...(route.skills || []), ...(route.optionalSkills || [])];
  const context = route.when
    ? route.when.join(", ")
    : route.routeWhen || "(no when/routeWhen)";

  for (const skill of skills) {
    if (!routedSkills.has(skill)) routedSkills.set(skill, []);
    routedSkills.get(skill).push({ index, context });
  }
}

// For each routed skill, check SKILL.md exists and has valid frontmatter
let checked = 0;
let missingFrontmatter = 0;
let missingDescription = 0;
let missingSkillFile = 0;

for (const [skillName, routes] of routedSkills) {
  const skillPath = path.join(skillsRoot, skillName, "SKILL.md");

  if (!fs.existsSync(skillPath)) {
    issues.push(`❌ Router references skill "${skillName}" but SKILL.md does not exist`);
    missingSkillFile++;
    continue;
  }

  checked++;
  const content = fs.readFileSync(skillPath, "utf8");

  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    issues.push(`⚠️  "${skillName}" has no YAML frontmatter`);
    missingFrontmatter++;
    continue;
  }

  const frontmatter = frontmatterMatch[1];

  // Check for required fields
  const hasName = /^name:\s*.+/m.test(frontmatter);
  const hasDescription = /^description:\s*.+/m.test(frontmatter);

  if (!hasName) {
    issues.push(`⚠️  "${skillName}" frontmatter missing 'name' field`);
  }
  if (!hasDescription) {
    issues.push(`⚠️  "${skillName}" frontmatter missing 'description' field`);
    missingDescription++;
  }

  // Check if skill has ALWAYS DO THIS / NEVER DO THIS sections (quality gate)
  const hasAlways = /ALWAYS DO THIS/i.test(content);
  const hasNever = /NEVER DO THIS/i.test(content);
  if (!hasAlways && !hasNever) {
    issues.push(
      `⚠️  "${skillName}" is routed but has no ALWAYS/NEVER sections — ` +
      `agent may get no actionable guidance from this skill`
    );
  }
}

// Check for skills that appear in multiple CONFLICTING routes
// (same skill routed from very different contexts — potential conflict source)
const multiRoutedSkills = [...routedSkills.entries()]
  .filter(([, routes]) => routes.length >= 3)
  .sort((a, b) => b[1].length - a[1].length);

if (multiRoutedSkills.length > 0) {
  console.log(`📊 Skills routed from 3+ different routes (potential over-routing):`);
  for (const [skill, routes] of multiRoutedSkills.slice(0, 10)) {
    console.log(`   ${skill}: ${routes.length} routes`);
  }
  console.log("");
}

// Summary
console.log(`📋 Skills checked: ${checked}`);
console.log(`🔗 Unique routed skills: ${routedSkills.size}`);
console.log(`❌ Missing SKILL.md: ${missingSkillFile}`);
console.log(`⚠️  Missing frontmatter: ${missingFrontmatter}`);
console.log(`⚠️  Missing description: ${missingDescription}`);

if (issues.length > 0) {
  console.log(`\n🔍 Issues found: ${issues.length}\n`);
  for (const issue of issues) {
    console.log(`  ${issue}`);
  }
  // Exit with failure only for hard errors (missing SKILL.md)
  if (missingSkillFile > 0) {
    console.log(`\n❌ FAIL: ${missingSkillFile} routed skill(s) have no SKILL.md on disk.`);
    process.exit(1);
  }
  console.log(`\n⚠️  WARN: ${issues.length} issue(s) found but none are hard failures.`);
} else {
  console.log(`\n✅ All routed skills have valid SKILL.md with frontmatter.`);
}
