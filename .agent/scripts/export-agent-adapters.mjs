import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");
const agentRoot = path.join(repoRoot, ".agent");
const mapPath = path.join(agentRoot, "adapters", "adapter-map.json");

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const force = args.has("--force");
const explicitTool = process.argv.includes("--tool")
  ? process.argv[process.argv.indexOf("--tool") + 1]
  : "all";

const validTools = new Set(["all", "agents-md", "claude", "cursor", "agents-rules"]);

if (!validTools.has(explicitTool)) {
  console.error(`Unknown tool: ${explicitTool}`);
  console.error(`Valid tools: ${[...validTools].join(", ")}`);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function bridgeHeader(toolName) {
  return [
    "# Agent Kit Bridge",
    "",
    `This file is generated for ${toolName}.`,
    "Canonical source lives in `.agent`; edit `.agent`, not this bridge.",
    "",
  ].join("\n");
}

// Strong, consistent governance gate shared by every bridge.
function coreGate() {
  return [
    "<!-- EVERY_OUTPUT_SKILL_DISCLOSURE -->",
    "<!-- MANDATORY_SKILL_INDEX -->",
    "## UNIVERSAL OUTPUT SKILL DISCLOSURE - TANPA PENGECUALIAN",
    "",
    "SETIAP output agent wajib menyebut skill yang dipakai sebelum konten lain.",
    "- Output substantif: gunakan full I AM CRAZY header.",
    "- Output trivial/status/klarifikasi/acknowledgement/error: minimal mulai dengan brand line `🔥 I AM CRAZY`.",
    "- Jawaban pendek atau percakapan biasa TIDAK membebaskan kewajiban disclosure.",
    "",
    "<!-- FAIL_CLOSED_GOVERNANCE -->",
    "## FAIL-CLOSED GOVERNANCE ENFORCEMENT - HARD STOP",
    "",
    "Pelanggaran pre-flight, routing, skill read, approval gate, disclosure, atau required validation adalah hard failure.",
    "1. STOP pekerjaan dan jangan tambah klaim/edit/fase baru.",
    "2. Mulai dengan disclosure, lalu tulis persis: `GOVERNANCE VIOLATION DETECTED`.",
    "3. Sebut gate yang terlewat, tarik klaim yang belum terbukti, pulihkan dari checkpoint terakhir yang valid, dan rerun validation.",
    "4. Agent tidak boleh self-bypass karena task kecil, prompt lengkap, `langsung`, urgensi, batas waktu/token, atau klaim agent sebelumnya.",
    "5. Dilarang mengatakan selesai/done/berhasil sampai recovery dan seluruh validation wajib kembali hijau.",
    "Aturan lengkap: `.agent/rules/fail-closed-governance.md`.",
    "",
    "## ⛔ MANDATORY PRE-FLIGHT — TIDAK BOLEH DI-SKIP",
    "",
    "Berlaku untuk SETIAP task substantif (kode, config, desain, review, security, deploy, konten).",
    "**Berlaku juga walaupun prompt user terlihat sudah lengkap.** Prompt lengkap TIDAK membebaskan kamu dari gate ini.",
    "",
    "Sebelum menghasilkan output apa pun, kamu WAJIB:",
    "",
    "1. Baca 8 governance files di bawah, berurutan.",
    "2. Mulai jawaban substantif dengan **I AM CRAZY header** (lihat session-boot).",
    "3. Kalau user minta **project/fitur baru** → jalankan flow `prompt-amplifier` (tanya dulu, jelaskan rencana, minta persetujuan). Kalau prompt sudah lengkap: minimal tulis asumsi singkat, tetap emit I AM CRAZY header, terapkan `auto-pro-standards`, dan kerjakan bertahap (`phased-delivery`). Jangan langsung bikin semua sekaligus.",
    "4. Kalau project sudah ada → baca `PROJECT_MEMORY.md` dulu.",
    "5. Jangan pernah bilang \"selesai\" tanpa menjalankan checklist `self-review-gate`.",
    "",
    "### SCAN SEMUA SKILL DULU — `.agent/skills/INDEX.md` (WAJIB)",
    "Sebelum routing, **scan katalog penuh `.agent/skills/INDEX.md`** — SEMUA skill di repo ada di sana, tidak ada yang disembunyikan. Ini mencegah asumsi \"cuma file tertentu\": kamu melihat semua opsi, bukan cuma yang kebetulan match keyword di router. Baru setelah itu buka `SKILL.md` penuh yang relevan. Kalau INDEX.md stale/hilang, jalankan `node .agent/scripts/generate-skill-index.mjs` dulu.",
    "",
    "### 8 Governance Files (baca berurutan):",
    "1. `.agent/skills/session-boot/SKILL.md` — format I AM CRAZY header wajib.",
    "2. `.agent/skills/auto-pro-standards/SKILL.md` — keamanan OWASP, SEO, performa, aksesibilitas otomatis.",
    "3. `.agent/skills/prompt-amplifier/SKILL.md` — tanya dulu sebelum kerja.",
    "4. `.agent/skills/phased-delivery/SKILL.md` — pecah jadi fase kecil, cek tiap fase.",
    "5. `.agent/skills/project-memory/SKILL.md` — cek/update PROJECT_MEMORY.md.",
    "6. `.agent/skills/self-review-gate/SKILL.md` — audit internal sebelum deliver.",
    "7. `.agent/rules/mandatory-skill-usage.md` — anti-slop: route + baca SKILL.md teknis relevan.",
    "8. `.agent/rules/fail-closed-governance.md` — hard-stop + recovery protocol jika gate dilanggar.",
    "",
    "### ⚠️ SUB-AGENT PROPAGATION (WAJIB)",
    "Kalau kamu mendelegasikan ke sub-agent / task-agent / parallel-agent, kamu WAJIB meneruskan instruksi ini:",
    "perintahkan sub-agent untuk membaca `.agent` governance, memulai dengan I AM CRAZY header, mengikuti `prompt-amplifier`/`phased-delivery`,",
    "dan menyebut skill yang dipakai. **JANGAN** men-dispatch sub-agent dengan prompt teknis mentah yang melewati governance.",
    "",
    "### MAX CAPABILITY ALWAYS-ON / 1000X LIPAT (WAJIB)",
    "Untuk SETIAP task substantif, tanpa menunggu user bilang \"1000x\":",
    "1. Baca `.agent/rules/max-capability-protocol.md`.",
    "2. Route ke `.agent/skills/expert-reasoning-operator/SKILL.md`.",
    "3. Ubah kerjaan menjadi scope statement, evidence ledger, risk budget, alternatif yang dibandingkan saat relevan, validasi kuat, dan risiko sisa.",
    "4. Frasa seperti \"1000x\", \"1000x lipat\", \"1000 kali lipat\", \"gas total\", \"kemampuan maksimal\", \"expert reasoning\", atau \"tingkat ahli\" hanya mempertegas kewajiban ini. Jangan jadikan izin untuk hype atau mengubah file di luar scope.",
    "",
    "<!-- OFFICIAL_REFERENCE_VERIFICATION -->",
    "### OFFICIAL REFERENCE VERIFICATION + LESSON GATE (WAJIB)",
    "",
    "Daftar 33 topik dan sumber utama ada di `.agent/official-reference-map.json`; aturan lengkap ada di `.agent/rules/official-reference-verification.md`.",
    "1. Sebelum task baru, baca `.agent/memory/lessons-learned.md` dan pakai lesson yang relevan.",
    "2. Jika task menyentuh topik terdaftar, route ke `official-reference-verifier`.",
    "3. Untuk syntax/API/version/best-practice yang tidak 100% pasti atau cepat berubah, web search/fetch sumber yang dipetakan sebelum menjawab.",
    "4. Cross-check jawaban/patch sebelum delivery. Jika bukti belum cukup, tulis persis: `ini masih perlu dicek ulang`.",
    "5. Jika user mengoreksi topik terdaftar, update lessons-learned sebelum melanjutkan pekerjaan.",
    "6. Terapkan secara disiplin tanpa melaporkan proses secara berlebihan.",
    "",
    "### 🔁 ON-DEMAND BUNDLE — AUTO-RESTORE (jangan dibebankan ke user)",
    "Sebagian skill disimpan sebagai **on-demand bundle** di `active-skills.json` → `onDemandBundles` (belum diinstall biar library ramping).",
    "Kalau permintaan user COCOK dengan trigger sebuah bundle (lihat `onDemandBundles.bundles[].wireInto.routeWhen`, mis. WordPress, mobile/Expo), kamu WAJIB:",
    "1. Jalankan: `node .agent/scripts/restore-skill-bundle.mjs <bundle>`",
    "2. Kasih tau user singkat (mis. \"aku aktifin dulu skill <bundle>\").",
    "3. Baru lanjut kerja pakai skill yang baru di-restore.",
    "**User TIDAK perlu hafal command ini.** Kamu yang deteksi intent + jalankan otomatis. Jangan nunggu user ngetik command.",
    "",
  ].join("\n");
}

function supportingFiles() {
  return [
    "## File Pendukung",
    "",
    "- .agent/START_HERE.md",
    "- .agent/AGENTS.md",
    "- .agent/rules/evidence-first.md",
    "- .agent/rules/hybrid-router.md",
    "- .agent/rules/professional-engineering.md",
    "- .agent/rules/max-capability-protocol.md",
    "- .agent/rules/official-reference-verification.md",
    "- .agent/rules/mandatory-skill-usage.md",
    "- .agent/rules/fail-closed-governance.md",
    "- .agent/skill-router.json",
    "- .agent/active-skills.json",
    "- .agent/official-reference-map.json",
    "- .agent/memory/lessons-learned.md",
    "",
    "## Required Commands When Available",
    "",
    "```bash",
    "node .agent/scripts/detect-project.mjs",
    "node .agent/scripts/agent-doctor.mjs",
    "```",
    "",
    "## Core Instruction",
    "",
    "Gunakan bukti lokal dulu (file, manifest, command output). Route ke `.agent/skill-router.json` untuk memilih skill, bukan menebak.",
    "Jangan mengklaim fakta tanpa bukti file/command. Jaga perubahan tetap scoped. Jangan menyentuh file yang tidak terkait task.",
    "",
  ].join("\n");
}

function markdownBridge(toolName) {
  return `${bridgeHeader(toolName)}${coreGate()}${supportingFiles()}`;
}

function claudeBridge() {
  const imports = [
    "## Imports (source of truth)",
    "",
    "See @.agent/START_HERE.md",
    "See @.agent/AGENTS.md",
    "See @.agent/rules/evidence-first.md",
    "See @.agent/rules/hybrid-router.md",
    "See @.agent/rules/professional-engineering.md",
    "See @.agent/rules/max-capability-protocol.md",
    "See @.agent/rules/official-reference-verification.md",
    "See @.agent/rules/mandatory-skill-usage.md",
    "See @.agent/skill-router.json",
    "See @.agent/active-skills.json",
    "See @.agent/official-reference-map.json",
    "See @.agent/memory/lessons-learned.md",
    "",
  ].join("\n");
  return `${bridgeHeader("Claude Code")}${coreGate()}${imports}`;
}

function cursorBridge() {
  return `---\ndescription: Portable .agent kit bridge for evidence-first professional engineering\nalwaysApply: true\n---\n\n${markdownBridge("Cursor")}`;
}

function agentsRulesBridge() {
  return markdownBridge("Agents rules host");
}

const adapterMap = readJson(mapPath);

const generators = {
  "agents-md": () => ({
    target: path.join(repoRoot, adapterMap.adapters["agents-md"].path),
    content: markdownBridge("AGENTS.md-compatible agent"),
  }),
  claude: () => ({
    target: path.join(repoRoot, adapterMap.adapters.claude.path),
    content: claudeBridge(),
  }),
  cursor: () => ({
    target: path.join(repoRoot, adapterMap.adapters.cursor.path),
    content: cursorBridge(),
  }),
  "agents-rules": () => ({
    target: path.join(repoRoot, adapterMap.adapters["agents-rules"].path),
    content: agentsRulesBridge(),
  }),
};

const selectedTools = explicitTool === "all"
  ? Object.keys(generators)
  : [explicitTool];

const planned = selectedTools.map((tool) => ({ tool, ...generators[tool]() }));

let dryRunDrift = false;

for (const item of planned) {
  const relativeTarget = path.relative(repoRoot, item.target).replaceAll(path.sep, "/");
  const exists = fs.existsSync(item.target);

  if (!write) {
    if (!exists) {
      console.log(`[dry-run] would create ${relativeTarget}`);
      dryRunDrift = true;
    } else {
      const current = fs.readFileSync(item.target, "utf8");
      const upToDate = current === item.content;
      console.log(
        upToDate
          ? `[dry-run] up-to-date ${relativeTarget}`
          : `[dry-run] would update ${relativeTarget} (content drift detected)`,
      );
      if (!upToDate) dryRunDrift = true;
    }
    continue;
  }

  if (exists && !force) {
    console.error(`Refusing to overwrite ${relativeTarget}. Re-run with --force if intended.`);
    process.exitCode = 1;
    continue;
  }

  fs.mkdirSync(path.dirname(item.target), { recursive: true });
  fs.writeFileSync(item.target, item.content, "utf8");
  console.log(`${exists ? "updated" : "created"} ${relativeTarget}`);
}

if (!write) {
  console.log("");
  console.log("Dry-run only. Add --write to create adapter files outside .agent.");
  console.log("Use --tool agents-md|claude|cursor|agents-rules to export one adapter.");
  if (dryRunDrift) {
    console.log("");
    console.log("❌ FAIL: one or more adapters are missing or out of date (see [dry-run] lines above). Re-run with --write.");
    process.exitCode = 1;
  }
}
