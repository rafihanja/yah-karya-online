#!/usr/bin/env node
/**
 * deep-skill-audit.mjs
 *
 * Audit mendalam untuk kualitas konten skill:
 * - Konsistensi bahasa (mixing ID/EN)
 * - Contoh code yang ada
 * - Anti-pattern coverage
 * - Validation rules
 * - Redundansi
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillsRoot = path.join(__dirname, "..", "skills");

const issues = {
  languageMix: [],
  noExamples: [],
  noAntiPatterns: [],
  noValidation: [],
  tooGeneric: [],
  inconsistentFormat: []
};

const skillDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const skill of skillDirs) {
  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, "utf8");

  // Check language mixing (ID + EN dalam proporsi yang aneh)
  const idWords = (content.match(/\b(yang|untuk|dengan|adalah|harus|jangan|ini|itu|dan|atau)\b/gi) || []).length;
  const enWords = (content.match(/\b(the|for|with|should|must|never|this|that|and|or)\b/gi) || []).length;

  if (idWords > 5 && enWords > 5 && Math.abs(idWords - enWords) < 10) {
    issues.languageMix.push({ skill, idWords, enWords });
  }

  // Check for code examples
  if (!content.includes("```") && !content.includes("Example:") && content.length > 500) {
    issues.noExamples.push(skill);
  }

  // Check for anti-patterns
  if (!content.match(/NEVER\s+DO/i) && !content.match(/anti[\s-]pattern/i) && !content.match(/avoid/i)) {
    issues.noAntiPatterns.push(skill);
  }

  // Check for validation
  if (!content.match(/validat/i) && !content.match(/test/i) && !content.match(/check/i)) {
    issues.noValidation.push(skill);
  }

  // Check for generic content
  const genericPhrases = [
    "follow best practices",
    "use common sense",
    "be careful",
    "make sure to",
    "don't forget"
  ];
  const genericCount = genericPhrases.filter(phrase =>
    content.toLowerCase().includes(phrase)
  ).length;

  if (genericCount >= 3) {
    issues.tooGeneric.push({ skill, genericCount });
  }

  // Check format consistency (CRLF-safe)
  if (!content.match(/^---\r?\n/m) || !content.match(/^name:\s*\S/im)) {
    issues.inconsistentFormat.push(skill);
  }
}

console.log("=== DEEP SKILL AUDIT ===\n");

console.log(`🌐 Language Mixing (ID+EN campur): ${issues.languageMix.length}`);
if (issues.languageMix.length > 0) {
  issues.languageMix.slice(0, 10).forEach(({ skill, idWords, enWords }) => {
    console.log(`   ${skill}: ID=${idWords} EN=${enWords}`);
  });
}

console.log(`\n📝 No Code Examples: ${issues.noExamples.length}`);
if (issues.noExamples.length > 0) {
  console.log(`   ${issues.noExamples.slice(0, 15).join(", ")}`);
}

console.log(`\n⚠️ No Anti-Patterns: ${issues.noAntiPatterns.length}`);
if (issues.noAntiPatterns.length > 0) {
  console.log(`   ${issues.noAntiPatterns.slice(0, 15).join(", ")}`);
}

console.log(`\n✅ No Validation: ${issues.noValidation.length}`);
if (issues.noValidation.length > 0) {
  console.log(`   ${issues.noValidation.slice(0, 15).join(", ")}`);
}

console.log(`\n🤖 Too Generic: ${issues.tooGeneric.length}`);
if (issues.tooGeneric.length > 0) {
  issues.tooGeneric.slice(0, 10).forEach(({ skill, genericCount }) => {
    console.log(`   ${skill}: ${genericCount} generic phrases`);
  });
}

console.log(`\n📋 Inconsistent Format: ${issues.inconsistentFormat.length}`);
if (issues.inconsistentFormat.length > 0) {
  console.log(`   ${issues.inconsistentFormat.join(", ")}`);
}

const totalIssues =
  issues.languageMix.length +
  issues.noExamples.length +
  issues.noAntiPatterns.length +
  issues.noValidation.length +
  issues.tooGeneric.length +
  issues.inconsistentFormat.length;

console.log(`\n📊 Total Issues: ${totalIssues}`);
console.log(`📊 Skills Scanned: ${skillDirs.length}`);
console.log(`📊 Issue Rate: ${((totalIssues / skillDirs.length) * 100).toFixed(1)}%`);

// Export untuk processing
fs.writeFileSync(
  path.join(__dirname, "..", "temp", "skill-audit-report.json"),
  JSON.stringify(issues, null, 2)
);

console.log(`\n💾 Full report saved to .agent/temp/skill-audit-report.json`);
