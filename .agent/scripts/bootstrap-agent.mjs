import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const repoRoot = path.resolve(agentRoot, "..");
const projectsDir = path.join(agentRoot, "projects");
const inventoryPath = path.join(projectsDir, "index.json");

function runNodeScript(relativeScript, args = []) {
  const scriptPath = path.join(agentRoot, relativeScript);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    throw new Error(`${relativeScript} failed with exit code ${result.status}`);
  }

  return result.stdout;
}

function writeProjectInventory(detectOutput) {
  const inventory = JSON.parse(detectOutput);
  inventory.generatedAt = new Date().toISOString();
  inventory.generator = ".agent/scripts/bootstrap-agent.mjs";

  fs.mkdirSync(projectsDir, { recursive: true });
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + "\n", "utf8");
  console.log(`wrote ${path.relative(repoRoot, inventoryPath).replaceAll(path.sep, "/")}`);
}

console.log("== validate agent skills ==");
runNodeScript("scripts/validate-agent-skills.mjs");

console.log("\n== detect projects ==");
const detectOutput = runNodeScript("scripts/detect-project.mjs");
writeProjectInventory(detectOutput);

console.log("\n== adapter dry-run ==");
runNodeScript("scripts/export-agent-adapters.mjs", ["--dry-run"]);

console.log("\n== agent doctor ==");
runNodeScript("scripts/agent-doctor.mjs");

console.log("\nOK: bootstrap complete.");
