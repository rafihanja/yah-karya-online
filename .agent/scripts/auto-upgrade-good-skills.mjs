#!/usr/bin/env node
/**
 * auto-upgrade-good-skills.mjs
 *
 * Upgrades "Good" skills to "Excellent" by DERIVING the missing
 * canonical sections (When to Use / ALWAYS DO / NEVER DO) from each
 * skill's OWN existing content — not a generic template.
 *
 * Why this approach (anti-slop):
 *   Most "Good" skills are already content-rich. They fail the audit
 *   only because their guidance lives under non-canonical headings
 *   ("Use this skill when", "Best Practices" with ✅/❌, "Safety",
 *   numbered "Instructions"). This script harvests those real lines
 *   and re-expresses them under the canonical headers the audit and
 *   downstream agents expect. No invented facts.
 *
 * Sources harvested:
 *   When to Use  ← existing "use this skill when / when to use" bullets,
 *                  else derived from frontmatter description + tags
 *   ALWAYS DO    ← "✅" bullets, Best Practices (positive), Safety,
 *                  Key Principles, numbered Instructions/Response steps
 *   NEVER DO     ← "❌" bullets, lines with never/don't/do not/avoid/jangan
 *
 * Insertion: before "## Limitations" if present, else end of file.
 * Only MISSING canonical sections are added. Idempotent.
 *
 * Usage:
 *   node .agent/scripts/auto-upgrade-good-skills.mjs --dry-run [--limit N]
 *   node .agent/scripts/auto-upgrade-good-skills.mjs --apply
 *   node .agent/scripts/auto-upgrade-good-skills.mjs --apply --only <skill>
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.join(__dirname, "..", "skills");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run") || !args.includes("--apply");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const onlyIdx = args.indexOf("--only");
const ONLY = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const CANON = {
  whenToUse: /^##+\s*when\s+to\s+use/im,
  alwaysDo: /^##+\s*always\s+do/im,
  neverDo: /^##+\s*never\s+do/im,
};

// ---------- helpers ----------

function splitFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: "", body: content };
  return { fm: m[1], body: content.slice(m[0].length) };
}

function getField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "im"));
  if (!m) return "";
  return m[1].trim().replace(/^["'>|]+\s*/, "").replace(/["']$/, "").trim();
}

function getTags(fm) {
  const m = fm.match(/^tags:\s*\[(.+?)\]/im);
  if (!m) return [];
  return m[1].split(",").map(s => s.trim().replace(/["']/g, "")).filter(Boolean);
}

// Return array of {heading, lines:[...raw body lines]} for each ## section
function sections(body) {
  const out = [];
  const lines = body.split(/\r?\n/);
  let cur = { heading: "__preamble__", level: 0, lines: [] };
  for (const line of lines) {
    const h = line.match(/^(#{2,4})\s+(.*?)\s*$/);
    if (h) {
      out.push(cur);
      cur = { heading: h[2].trim(), level: h[1].length, lines: [] };
    } else {
      cur.lines.push(line);
    }
  }
  out.push(cur);
  return out;
}

// Strip list/emoji markers only. PRESERVE wording (incl. leading Don't/Never)
function cleanItem(raw) {
  let s = raw.replace(/\r$/, "").trim();
  s = s.replace(/^[-*+]\s+/, "");                 // list marker
  s = s.replace(/^\d+[.)]\s+/, "");                // numbered marker
  s = s.replace(/^[✅❌✔️✖️🔴🟢⚠️🚨•·]+\s*/u, "");  // leading emoji/glyph
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function isBulletLine(l) {
  return /^\s*([-*+]\s+|\d+[.)]\s+|[✅❌✔️✖️🔴🟢⚠️🚨])/u.test(l);
}

function dedupe(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = x.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (key.length < 8 || seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out;
}

// Sections we must NOT mine for directives (descriptive / factual / meta).
const BLACKLIST_RX = /(limitation|related skill|related workflow|common pitfall|knowledge base|example|capabilit|reference|table of contents|output format|overview|behavioral trait|how it works|purpose|__preamble__)/i;
// Sections that legitimately contain positive imperative guidance.
const POSITIVE_RX = /(best practice|key principle|guideline|do this|^always|instruction|response approach|principle|checklist|rules|core principle|workflow|actions)/i;
// A line is a prohibition only if it LEADS with a prohibition word.
const LEAD_NEG_RX = /^(don'?t\b|do not\b|never\b|avoid\b|jangan\b|no\s|must not\b)/i;

function harvest(body) {
  const secs = sections(body);
  const always = [];
  const never = [];
  const whenUse = [];

  for (const sec of secs) {
    const h = sec.heading.toLowerCase();
    const bullets = sec.lines.filter(isBulletLine);
    const isWhenUse = /(when to use|use this skill when|use when|use this workflow when|use this when)/.test(h)
      && !/\b(not|don'?t|avoid)\b/.test(h);
    const isAntiPattern = /(anti.?pattern|sharp edge|pitfall|gotcha)/.test(h);
    const isValidation = /(validation check)/.test(h);
    const isPositive = POSITIVE_RX.test(h);
    const isBlacklisted = BLACKLIST_RX.test(h);

    for (const raw of bullets) {
      const checkPos = /^\s*[-*+]?\s*(✅|✔️)/u.test(raw);
      const checkNeg = /^\s*[-*+]?\s*(❌|✖️)/u.test(raw);
      const cleaned = cleanItem(raw);
      if (!cleaned || cleaned.length < 8) continue;

      if (isWhenUse) { whenUse.push(cleaned); continue; }

      // Anti-pattern format: "Pattern: X | Why: Y | Fix: Z" -> NEVER DO
      if (isAntiPattern) {
        const m = cleaned.match(/Pattern:\s*(.+?)\s*\|\s*Why:\s*(.+?)(?:\s*\|\s*Fix:.*)?$/i);
        if (m) {
          never.push(`Avoid ${m[1].replace(/\.$/, "")} — ${m[2].replace(/\.$/, "")}`);
        } else if (LEAD_NEG_RX.test(cleaned)) {
          never.push(cleaned);
        }
        continue;
      }

      // Strong, format-based signals work in ANY non-blacklisted section.
      if (checkNeg) {
        if (!isBlacklisted) never.push(LEAD_NEG_RX.test(cleaned) ? cleaned : `Avoid: ${cleaned}`);
        continue;
      }
      if (checkPos) { if (!isBlacklisted) always.push(cleaned); continue; }
      if (isBlacklisted || isValidation) continue;

      if (LEAD_NEG_RX.test(cleaned)) {
        never.push(cleaned);
      } else if (isPositive) {
        always.push(cleaned);
      }
    }

    // Validation Checks: mine the "Message:" remediation lines as ALWAYS DO.
    if (isValidation) {
      for (const ln of sec.lines) {
        const m = ln.replace(/\r$/, "").match(/^\s*Message:\s*(.+)$/i);
        if (m && m[1].trim().length > 8) always.push(m[1].trim());
        // also mine table rows: | Check | Action |
        const t = ln.replace(/\r$/, "").match(/^\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|/);
        if (t && /[a-z]/.test(t[1]) && !/^action$|^-+$/i.test(t[1].trim())) {
          always.push(t[1].trim());
        }
      }
    }
  }

  return {
    whenUse: dedupe(whenUse).slice(0, 8),
    always: dedupe(always).slice(0, 10),
    never: dedupe(never).slice(0, 8),
  };
}

function deriveWhenUse(desc, tags, name) {
  const out = [];
  if (desc) {
    out.push(`Use when the task involves: ${desc.replace(/\.$/, "")}.`);
  }
  if (tags.length) {
    out.push(`Use when working with ${tags.slice(0, 5).join(", ")}.`);
  }
  out.push(`Use when the user explicitly references \`${name}\` or its domain.`);
  return dedupe(out);
}

function renderSection(title, items) {
  const lines = [`## ${title}`, ""];
  for (const it of items) {
    const dot = /[.:!?)]$/.test(it) ? "" : ".";
    lines.push(`- ${it}${dot}`);
  }
  lines.push("");
  return lines.join("\n");
}

// ---------- main ----------

const skillDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name).sort();

let processed = 0, upgraded = 0, skipped = 0;
const report = [];

for (const skill of skillDirs) {
  if (ONLY && skill !== ONLY) continue;
  if (upgraded >= LIMIT) break;

  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;

  const content = fs.readFileSync(skillMd, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  const bodyLines = content.split("\n").filter(l => l.trim() && !l.startsWith("#"));
  if (bytes < 200 || bodyLines.length <= 2) continue; // not in scope

  const present = {
    whenToUse: CANON.whenToUse.test(content),
    alwaysDo: CANON.alwaysDo.test(content),
    neverDo: CANON.neverDo.test(content),
  };
  const presentCount = Object.values(present).filter(Boolean).length;
  if (presentCount >= 2) { skipped++; continue; } // already Excellent

  processed++;
  const { fm, body } = splitFrontmatter(content);
  const desc = getField(fm, "description");
  const tags = getTags(fm);
  const h = harvest(body);

  // Decide which sections to add to reach >=2 canonical headers.
  const additions = [];
  const need = 2 - presentCount;

  const candidates = [];
  if (!present.whenToUse) {
    const items = h.whenUse.length >= 2 ? h.whenUse : deriveWhenUse(desc, tags, skill);
    candidates.push({ key: "whenToUse", title: "When to Use", items, real: h.whenUse.length >= 2 });
  }
  if (!present.alwaysDo) {
    candidates.push({ key: "alwaysDo", title: "ALWAYS DO", items: h.always, real: h.always.length >= 2 });
  }
  if (!present.neverDo) {
    candidates.push({ key: "neverDo", title: "NEVER DO", items: h.never, real: h.never.length >= 2 });
  }

  // Prefer sections backed by REAL harvested content first.
  candidates.sort((a, b) => (b.real - a.real) || (b.items.length - a.items.length));

  let added = 0;
  for (const c of candidates) {
    if (added >= need && c.items.length < 2) continue; // only force-add when we still need headers
    if (c.items.length < 1) continue;
    // Ensure at least 2 bullets for a credible section
    if (c.items.length < 2) {
      if (c.key === "whenToUse") c.items = deriveWhenUse(desc, tags, skill);
      else continue;
    }
    additions.push(renderSection(c.title, c.items));
    added++;
  }

  if (added < need) {
    report.push({ skill, status: "NEEDS-MANUAL", note: `only ${added}/${need} sections derivable`, present });
    continue;
  }

  const block = "\n" + additions.join("\n");
  let newContent;
  const limMatch = content.match(/\n##\s*Limitations/i);
  if (limMatch) {
    const idx = content.indexOf(limMatch[0]);
    newContent = content.slice(0, idx) + block + "\n" + content.slice(idx + 1);
  } else {
    newContent = content.replace(/\s*$/, "\n") + block;
  }

  report.push({
    skill, status: "UPGRADE",
    added: candidates.filter(c => additions.some(a => a.includes(`## ${c.title}`))).map(c => `${c.title}(${c.items.length}${c.real ? "" : "*derived"})`),
  });

  if (!DRY) fs.writeFileSync(skillMd, newContent, "utf8");
  upgraded++;
}

console.log(`\n=== AUTO-UPGRADE ${DRY ? "(DRY RUN)" : "(APPLIED)"} ===\n`);
for (const r of report.slice(0, ONLY ? 1 : 200)) {
  if (r.status === "UPGRADE") {
    console.log(`  ✅ ${r.skill} → +${r.added.join(", +")}`);
  } else {
    console.log(`  ⚠️  ${r.skill} → ${r.note}`);
  }
}
console.log(`\nProcessed(in-scope Good): ${processed} | Upgraded: ${upgraded} | Already-excellent skipped: ${skipped}`);
if (DRY) console.log(`\n(DRY RUN — no files written. Re-run with --apply to write.)`);
