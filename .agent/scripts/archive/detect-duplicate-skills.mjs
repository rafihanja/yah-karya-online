import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const skillsRoot = path.join(agentRoot, "skills");

console.log("=== DUPLICATE SKILL CONTENT DETECTOR ===\n");

// Read all SKILL.md files
const skills = [];
for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  if (!fs.existsSync(skillPath)) continue;

  const content = fs.readFileSync(skillPath, "utf8");
  // Strip frontmatter for comparison
  const body = content.replace(/^---[\s\S]*?---\r?\n?/, "").trim();
  skills.push({ name: entry.name, body, length: body.length });
}

console.log(`📋 Skills loaded: ${skills.length}\n`);

// Normalize text for comparison: lowercase, strip whitespace variations, remove markdown syntax
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[#*`_\-|>\[\](){}]/g, "")  // strip markdown chars
    .replace(/\s+/g, " ")                 // normalize whitespace
    .trim();
}

// Compute simple similarity using shared trigrams (3-character windows)
function trigramSimilarity(a, b) {
  const trigramsA = new Set();
  const trigramsB = new Set();
  const normA = normalize(a);
  const normB = normalize(b);

  // Skip very short content
  if (normA.length < 100 || normB.length < 100) return 0;

  for (let i = 0; i <= normA.length - 3; i++) {
    trigramsA.add(normA.slice(i, i + 3));
  }
  for (let i = 0; i <= normB.length - 3; i++) {
    trigramsB.add(normB.slice(i, i + 3));
  }

  let shared = 0;
  for (const t of trigramsA) {
    if (trigramsB.has(t)) shared++;
  }

  const union = trigramsA.size + trigramsB.size - shared;
  return union === 0 ? 0 : shared / union; // Jaccard similarity
}

// Compare all pairs — O(n^2) but n=162 is manageable
const duplicates = [];
const HIGH_THRESHOLD = 0.70;  // 70%+ similarity = likely duplicate
const WARN_THRESHOLD = 0.55;  // 55-70% = worth investigating

for (let i = 0; i < skills.length; i++) {
  for (let j = i + 1; j < skills.length; j++) {
    const sim = trigramSimilarity(skills[i].body, skills[j].body);
    if (sim >= WARN_THRESHOLD) {
      duplicates.push({
        skillA: skills[i].name,
        skillB: skills[j].name,
        similarity: sim,
        level: sim >= HIGH_THRESHOLD ? "HIGH" : "WARN",
      });
    }
  }
}

// Sort by similarity descending
duplicates.sort((a, b) => b.similarity - a.similarity);

if (duplicates.length === 0) {
  console.log("✅ No significant content duplicates found among skills.\n");
} else {
  const highCount = duplicates.filter((d) => d.level === "HIGH").length;
  const warnCount = duplicates.filter((d) => d.level === "WARN").length;

  console.log(`🔍 Found ${duplicates.length} similar skill pairs:\n`);

  for (const dup of duplicates.slice(0, 20)) {
    const emoji = dup.level === "HIGH" ? "🔴" : "🟡";
    console.log(
      `  ${emoji} ${(dup.similarity * 100).toFixed(1)}% — ${dup.skillA} ↔ ${dup.skillB}`
    );
  }

  if (duplicates.length > 20) {
    console.log(`  ... dan ${duplicates.length - 20} lainnya`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`  🔴 HIGH (≥${HIGH_THRESHOLD * 100}%): ${highCount} pairs`);
  console.log(`  🟡 WARN (≥${WARN_THRESHOLD * 100}%): ${warnCount} pairs`);

  if (highCount > 0) {
    console.log(`\n⚠️  ${highCount} skill pair(s) have very high content overlap.`);
    console.log(`  Consider merging or deduplicating to reduce context window waste.`);
  }
}

// Save report
const reportDir = path.join(agentRoot, "temp");
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, "duplicate-skills-report.json"),
  JSON.stringify({ scanned: skills.length, duplicates }, null, 2)
);
console.log(`\n💾 Full report saved to .agent/temp/duplicate-skills-report.json`);
