#!/usr/bin/env node
/**
 * upgrade-skill-batch.mjs
 * 
 * Reads a "Good" skill's SKILL.md, identifies missing sections 
 * (ALWAYS DO / NEVER DO / When to Use), and generates upgrade 
 * templates that agents can fill in.
 * 
 * Usage: 
 *   node .agent/scripts/upgrade-skill-batch.mjs --skill <name>    # Show what's missing for one skill
 *   node .agent/scripts/upgrade-skill-batch.mjs --next <N>        # Show top N priority skills to upgrade
 *   node .agent/scripts/upgrade-skill-batch.mjs --template <name> # Generate upgrade template for a skill
 * 
 * Reference: Structure inspired by addyosmani/agent-skills (MIT license)
 * https://github.com/addyosmani/agent-skills
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.join(__dirname, "..", "skills");

const SECTIONS = [
  { rx: /## When to Use/i, label: "When to Use", key: "whenToUse" },
  { rx: /## ALWAYS DO/i, label: "ALWAYS DO THIS", key: "alwaysDo" },
  { rx: /## NEVER DO/i, label: "NEVER DO THIS", key: "neverDo" },
];

function analyzeSkill(skillName) {
  const skillMd = path.join(skillsRoot, skillName, "SKILL.md");
  if (!fs.existsSync(skillMd)) return null;
  
  const content = fs.readFileSync(skillMd, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  
  const missing = [];
  const found = [];
  for (const sec of SECTIONS) {
    if (sec.rx.test(content)) {
      found.push(sec);
    } else {
      missing.push(sec);
    }
  }
  
  // Extract description from frontmatter
  const descMatch = content.match(/description:\s*>?\s*\n?\s*(.+?)(?:\n---|\n[a-z])/is);
  const desc = descMatch ? descMatch[1].trim().slice(0, 120) : "(no description)";
  
  return { skillName, bytes, missing, found, desc, isExcellent: missing.length === 0 || found.length >= 2 };
}

function generateTemplate(skillName) {
  const analysis = analyzeSkill(skillName);
  if (!analysis) {
    console.log(`❌ Skill "${skillName}" not found.`);
    return;
  }
  
  if (analysis.isExcellent) {
    console.log(`✅ "${skillName}" is already Excellent! No upgrade needed.`);
    return;
  }
  
  console.log(`\n📝 UPGRADE TEMPLATE FOR: ${skillName}`);
  console.log(`   Description: ${analysis.desc}`);
  console.log(`   Missing sections: ${analysis.missing.map(m => m.label).join(", ")}`);
  console.log(`\n--- PASTE THESE SECTIONS INTO SKILL.md ---\n`);
  
  for (const sec of analysis.missing) {
    if (sec.key === "whenToUse") {
      console.log(`## When to Use\n`);
      console.log(`- Saat [kondisi spesifik 1].`);
      console.log(`- Saat [kondisi spesifik 2].`);
      console.log(`- Saat user bilang "[kata kunci trigger]".\n`);
    } else if (sec.key === "alwaysDo") {
      console.log(`## ALWAYS DO THIS\n`);
      console.log(`1. **[Aturan 1]:** [Penjelasan konkret + contoh kode jika relevan].`);
      console.log(`2. **[Aturan 2]:** [Penjelasan konkret].`);
      console.log(`3. **[Aturan 3]:** [Penjelasan konkret].\n`);
    } else if (sec.key === "neverDo") {
      console.log(`## NEVER DO THIS\n`);
      console.log(`- JANGAN [larangan 1] — [kenapa berbahaya].`);
      console.log(`- JANGAN [larangan 2] — [kenapa berbahaya].\n`);
    }
  }
  
  console.log(`--- END TEMPLATE ---`);
}

// CLI handling
const args = process.argv.slice(2);
const skillFlag = args.indexOf("--skill");
const nextFlag = args.indexOf("--next");
const templateFlag = args.indexOf("--template");

if (templateFlag >= 0 && args[templateFlag + 1]) {
  generateTemplate(args[templateFlag + 1]);
} else if (skillFlag >= 0 && args[skillFlag + 1]) {
  const analysis = analyzeSkill(args[skillFlag + 1]);
  if (analysis) {
    console.log(`\n📊 ${analysis.skillName}: ${analysis.isExcellent ? "🟢 Excellent" : "🟡 Good"}`);
    console.log(`   Bytes: ${analysis.bytes}`);
    console.log(`   Found: ${analysis.found.map(f => f.label).join(", ") || "none"}`);
    console.log(`   Missing: ${analysis.missing.map(m => m.label).join(", ") || "none"}`);
  }
} else if (nextFlag >= 0) {
  const n = parseInt(args[nextFlag + 1]) || 10;
  const allSkills = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  
  const goods = allSkills.map(s => analyzeSkill(s)).filter(a => a && !a.isExcellent);
  console.log(`\n📋 TOP ${Math.min(n, goods.length)} SKILLS TO UPGRADE:\n`);
  for (const g of goods.slice(0, n)) {
    const missStr = g.missing.map(m => `❌ ${m.label}`).join(", ");
    console.log(`  🟡 ${g.skillName} → ${missStr}`);
  }
  console.log(`\n   Total remaining: ${goods.length}`);
} else {
  console.log("Usage:");
  console.log("  --skill <name>      Analyze one skill");
  console.log("  --next <N>          Show top N skills to upgrade");
  console.log("  --template <name>   Generate upgrade template for a skill");
}
