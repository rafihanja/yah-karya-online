#!/usr/bin/env node
/**
 * list-good-skills.mjs
 * 
 * Lists all skills rated "Good" (missing ALWAYS/NEVER/When to Use sections)
 * so agents know exactly which skills to upgrade next.
 * 
 * Usage: node .agent/scripts/list-good-skills.mjs [--priority]
 *   --priority: Sort by priority (governance/security first, then frequently used)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsRoot = path.join(__dirname, "..", "skills");
const RECOMMENDED_SECTIONS = [
  { rx: /always\s+do/i, label: "ALWAYS DO" },
  { rx: /never\s+do/i, label: "NEVER DO" },
  { rx: /when\s+to\s+use/i, label: "When to Use" },
];

// Priority tiers for upgrade order
const PRIORITY_TIERS = {
  critical: [
    "session-boot", "auto-pro-standards", "prompt-amplifier", "phased-delivery",
    "project-memory", "self-review-gate", "lessons-capture", "skill-excellence-ratchet"
  ],
  security: [
    "api-security-best-practices", "auth-implementation-patterns", "backend-security-coder",
    "frontend-security-coder", "web-security-testing", "cc-skill-security-review",
    "secrets-management", "env-fortress", "security-audit"
  ],
  gsap: [
    "gsap-core", "gsap-timeline", "gsap-scrolltrigger", "gsap-plugins",
    "gsap-utils", "gsap-react", "gsap-frameworks", "gsap-performance",
    "gsap-horizontal-parallax", "elite-gsap-react-architecture"
  ],
  frontend: [
    "frontend-developer", "frontend-design", "react-best-practices",
    "nextjs-best-practices", "nextjs-app-router-patterns", "design-taste-frontend",
    "antigravity-design-expert", "tailwind-patterns", "shadcn"
  ],
  quality: [
    "code-reviewer", "codebase-audit-pre-push", "verification-before-completion",
    "unslop", "avoid-ai-writing", "systematic-debugging", "test-driven-development"
  ]
};

const showPriority = process.argv.includes("--priority");

const goodSkills = [];

const skillDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const skill of skillDirs) {
  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  const lines = content.split("\n").filter(l => l.trim().length > 0 && !l.startsWith("#"));

  if (bytes < 200 || lines.length <= 2) continue;

  const missing = [];
  const found = [];
  for (const sec of RECOMMENDED_SECTIONS) {
    if (sec.rx.test(content)) {
      found.push(sec.label);
    } else {
      missing.push(sec.label);
    }
  }

  if (found.length < 2) {
    goodSkills.push({ skill, bytes, missing, found });
  }
}

if (!showPriority) {
  console.log(`\n📋 GOOD SKILLS NEEDING UPGRADE (${goodSkills.length} total)\n`);
  console.log("Each skill below needs these sections added to reach Excellent:\n");
  for (const s of goodSkills) {
    const missStr = s.missing.map(m => `❌ ${m}`).join(", ");
    const foundStr = s.found.length > 0 ? ` (has: ${s.found.join(", ")})` : "";
    console.log(`  🟡 ${s.skill}${foundStr}`);
    console.log(`     Missing: ${missStr}`);
  }
} else {
  console.log(`\n📋 GOOD SKILLS BY PRIORITY (${goodSkills.length} total)\n`);
  
  const goodNames = new Set(goodSkills.map(s => s.skill));
  const assigned = new Set();

  for (const [tier, skills] of Object.entries(PRIORITY_TIERS)) {
    const inTier = skills.filter(s => goodNames.has(s));
    if (inTier.length === 0) continue;
    
    console.log(`\n--- ${tier.toUpperCase()} (${inTier.length} to upgrade) ---`);
    for (const name of inTier) {
      const info = goodSkills.find(s => s.skill === name);
      const missStr = info.missing.map(m => `❌ ${m}`).join(", ");
      console.log(`  🟡 ${name} → Missing: ${missStr}`);
      assigned.add(name);
    }
  }

  const unassigned = goodSkills.filter(s => !assigned.has(s.skill));
  if (unassigned.length > 0) {
    console.log(`\n--- OTHER (${unassigned.length} remaining) ---`);
    for (const s of unassigned.slice(0, 20)) {
      const missStr = s.missing.map(m => `❌ ${m}`).join(", ");
      console.log(`  🟡 ${s.skill} → Missing: ${missStr}`);
    }
    if (unassigned.length > 20) {
      console.log(`  ... dan ${unassigned.length - 20} lainnya`);
    }
  }
}

console.log(`\n📊 Summary: ${goodSkills.length} skills need upgrade to Excellent`);
console.log("   To upgrade: add missing ALWAYS DO / NEVER DO / When to Use sections");
