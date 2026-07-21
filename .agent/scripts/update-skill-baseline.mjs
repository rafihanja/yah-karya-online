#!/usr/bin/env node
/**
 * update-skill-baseline.mjs
 * 
 * Runs audit-skill-quality.mjs, parses the output, and updates
 * .agent/memory/skill-quality-baseline.json — but ONLY if quality
 * has NOT regressed (excellent >= previous, weak/empty == 0).
 * 
 * Usage: node .agent/scripts/update-skill-baseline.mjs [--force]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(__dirname, '..', 'memory', 'skill-quality-baseline.json');
const force = process.argv.includes('--force');

// Run the audit
let auditOutput;
try {
  auditOutput = execSync('node .agent/scripts/audit-skill-quality.mjs', {
    cwd: join(__dirname, '..', '..'),
    encoding: 'utf-8'
  });
} catch (e) {
  console.error('❌ audit-skill-quality.mjs failed:', e.message);
  process.exit(1);
}

// Parse numbers from audit output
const parseNum = (label) => {
  const match = auditOutput.match(new RegExp(`${label}.*?:\\s*(\\d+)`));
  return match ? parseInt(match[1], 10) : 0;
};

const current = {
  excellent: parseNum('Excellent'),
  good: parseNum('Good'),
  weak: parseNum('Weak'),
  empty: parseNum('Empty'),
  total: parseNum('Total scanned'),
};

console.log(`\n📊 Current Quality:`);
console.log(`   🟢 Excellent: ${current.excellent}`);
console.log(`   🟡 Good: ${current.good}`);
console.log(`   🔴 Weak: ${current.weak}`);
console.log(`   ⚫ Empty: ${current.empty}`);
console.log(`   📦 Total: ${current.total}`);

// Load previous baseline
let previous = { excellent: 0, good: 0, weak: 0, empty: 0, total: 0 };
if (existsSync(baselinePath)) {
  try {
    previous = JSON.parse(readFileSync(baselinePath, 'utf-8'));
  } catch (e) {
    console.warn('⚠️  Could not parse existing baseline, treating as fresh.');
  }
}

console.log(`\n📏 Previous Baseline:`);
console.log(`   🟢 Excellent: ${previous.excellent}`);
console.log(`   🟡 Good: ${previous.good}`);
console.log(`   📦 Total: ${previous.total}`);

// Ratchet check
const regressions = [];

if (current.excellent < previous.excellent) {
  regressions.push(`❌ Excellent dropped: ${previous.excellent} → ${current.excellent}`);
}
if (current.weak > 0) {
  regressions.push(`❌ Weak skills detected: ${current.weak} (must be 0)`);
}
if (current.empty > 0) {
  regressions.push(`❌ Empty skills detected: ${current.empty} (must be 0)`);
}

if (regressions.length > 0 && !force) {
  console.log(`\n🚫 RATCHET BLOCKED — Quality regression detected:`);
  regressions.forEach(r => console.log(`   ${r}`));
  console.log(`\n   Fix the regressions first, or use --force to override.`);
  process.exit(1);
}

if (regressions.length > 0 && force) {
  console.log(`\n⚠️  FORCE MODE — Updating baseline despite regressions:`);
  regressions.forEach(r => console.log(`   ${r}`));
}

// Update baseline
const newBaseline = {
  capturedAt: new Date().toISOString(),
  excellent: current.excellent,
  good: current.good,
  weak: current.weak,
  empty: current.empty,
  total: current.total,
  note: `Updated from ${previous.excellent} → ${current.excellent} Excellent.`
};

writeFileSync(baselinePath, JSON.stringify(newBaseline, null, 2) + '\n');

const delta = current.excellent - previous.excellent;
const arrow = delta > 0 ? `⬆️ +${delta}` : delta === 0 ? '➡️ same' : `⬇️ ${delta}`;

console.log(`\n✅ Baseline updated! Excellent: ${previous.excellent} → ${current.excellent} (${arrow})`);
console.log(`   Saved to: ${baselinePath}`);
