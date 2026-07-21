import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const agentRoot = path.resolve(path.dirname(currentFile), "..");
const repoRoot = path.resolve(agentRoot, "..");
const skillsRoot = path.join(agentRoot, "skills");
const manifestPath = path.join(skillsRoot, ".antigravity-install-manifest.json");
const outputDisclosurePolicyId = "EVERY_OUTPUT_SKILL_DISCLOSURE";
const officialReferencePolicyId = "OFFICIAL_REFERENCE_VERIFICATION";
const failClosedPolicyId = "FAIL_CLOSED_GOVERNANCE";
const officialReferenceMapPath = path.join(agentRoot, "official-reference-map.json");
const outputDisclosurePolicyFiles = [
  path.join(agentRoot, "AGENTS.md"),
  path.join(agentRoot, "MASTER_FLOW.md"),
  path.join(agentRoot, "rules", "mandatory-skill-usage.md"),
  path.join(skillsRoot, "session-boot", "SKILL.md"),
  path.join(agentRoot, "scripts", "export-agent-adapters.mjs"),
];
const officialReferencePolicyFiles = [
  path.join(agentRoot, "AGENTS.md"),
  path.join(agentRoot, "MASTER_FLOW.md"),
  path.join(agentRoot, "rules", "mandatory-skill-usage.md"),
  path.join(agentRoot, "rules", "official-reference-verification.md"),
  path.join(skillsRoot, "official-reference-verifier", "SKILL.md"),
  path.join(agentRoot, "scripts", "export-agent-adapters.mjs"),
];
const failClosedPolicyFiles = [
  path.join(agentRoot, "AGENTS.md"),
  path.join(agentRoot, "MASTER_FLOW.md"),
  path.join(agentRoot, "rules", "mandatory-skill-usage.md"),
  path.join(agentRoot, "rules", "fail-closed-governance.md"),
  path.join(skillsRoot, "session-boot", "SKILL.md"),
  path.join(skillsRoot, "self-review-gate", "SKILL.md"),
  path.join(agentRoot, "scripts", "export-agent-adapters.mjs"),
];
const generatedBridgePolicyFiles = [
  path.join(repoRoot, "AGENTS.md"),
  path.join(repoRoot, "CLAUDE.md"),
  path.join(repoRoot, ".cursor", "rules", "agent-kit.mdc"),
  path.join(repoRoot, ".agents", "rules", "agent-kit.md"),
];
const expectedOfficialReferences = new Map([
  ["HTML", "html.com"],
  ["CSS", "web.dev/learn/css"],
  ["JavaScript", "javascript.info"],
  ["React", "reactplay.io"],
  ["Vue", "learnvue.co"],
  ["Angular", "angular.dev/tutorials"],
  ["Git", "git-scm.com/book"],
  ["Web3", "learnweb3.io"],
  ["Python", "learnpython.org"],
  ["SQL", "w3schools.com/sql"],
  ["Blockchain", "cryptozombies.io"],
  ["Next.js", "nextjs.org/learn"],
  ["AI (Basics)", "elementsofai.com"],
  ["PHP", "phptherightway.com"],
  ["API", "rapidapi.com/learn"],
  ["Go", "learn-golang.org"],
  ["Rust", "rust-lang.org/learn"],
  ["Design Patterns", "refactoring.guru"],
  ["TypeScript", "typescriptlang.org/docs"],
  ["C++", "cplusplus.com/doc/tutorial"],
  ["Java", "docs.oracle.com/javase/tutorial"],
  ["C#", "dotnet.microsoft.com/learn/csharp"],
  ["Swift", "swift.org/learn"],
  ["Django", "djangoproject.com/start"],
  ["Flask", "flask.palletsprojects.com/tutorial"],
  ["Docker", "docker.com/get-started"],
  ["Kubernetes", "kubernetes.io/docs/tutorials"],
  ["Linux", "linuxjourney.com"],
  ["Cybersecurity", "tryhackme.com"],
  ["DevOps", "roadmap.sh/devops"],
  ["Cloud AWS", "aws.amazon.com/training"],
  ["Cloud GCP", "cloudskillsboost.google"],
  ["Cloud Azure", "microsoft.com/learn/azure"],
]);
const expectedOfficialRouteSignals = new Set([
  "request:html",
  "request:css",
  "request:javascript",
  "request:react",
  "request:vue",
  "request:angular",
  "request:git",
  "request:web3",
  "request:python",
  "request:sql",
  "request:blockchain",
  "request:nextjs",
  "request:ai-basics",
  "request:php",
  "request:api",
  "request:go",
  "request:rust",
  "request:design-patterns",
  "request:typescript",
  "request:cpp",
  "request:java",
  "request:csharp",
  "request:swift",
  "request:django",
  "request:flask",
  "request:docker",
  "request:kubernetes",
  "request:linux",
  "request:cybersecurity",
  "request:devops",
  "request:aws",
  "request:gcp",
  "request:azure",
]);

const requiredSupportFiles = [
  path.join(agentRoot, "README.md"),
  path.join(agentRoot, "START_HERE.md"),
  path.join(agentRoot, "AGENTS.md"),
  path.join(agentRoot, "active-skills.json"),
  officialReferenceMapPath,
  path.join(agentRoot, "adapters", "adapter-map.json"),
  path.join(agentRoot, "adapters", "profiles", "antigravity.json"),
  path.join(agentRoot, "rules", "evidence-first.md"),
  path.join(agentRoot, "rules", "hybrid-router.md"),
  path.join(agentRoot, "rules", "professional-engineering.md"),
  path.join(agentRoot, "rules", "mandatory-skill-usage.md"),
  path.join(agentRoot, "rules", "fail-closed-governance.md"),
  path.join(agentRoot, "rules", "official-reference-verification.md"),
  path.join(agentRoot, "core", "anti-hallucination.md"),
  path.join(agentRoot, "core", "agent-adapter-strategy.md"),
  path.join(agentRoot, "core", "hybrid-agent-policy.md"),
  path.join(agentRoot, "core", "professional-engineering-standards.md"),
  path.join(agentRoot, "core", "safe-commands.md"),
  path.join(agentRoot, "memory", "decisions.md"),
  path.join(agentRoot, "memory", "lessons-learned.md"),
  path.join(agentRoot, "skill-router.json"),
  path.join(skillsRoot, "llms.txt"),
  path.join(agentRoot, "scripts", "bootstrap-agent.mjs"),
  path.join(agentRoot, "scripts", "detect-project.mjs"),
  path.join(agentRoot, "scripts", "agent-doctor.mjs"),
  path.join(agentRoot, "scripts", "export-agent-adapters.mjs"),
];

const requiredSkills = [
  "gsap-core",
  "gsap-timeline",
  "gsap-scrolltrigger",
  "gsap-plugins",
  "gsap-utils",
  "gsap-react",
  "gsap-frameworks",
  "gsap-performance",
  "elite-gsap-react-architecture",
];

function fail(message, details = []) {
  console.error(`FAIL: ${message}`);
  for (const detail of details) {
    console.error(`- ${detail}`);
  }
  process.exitCode = 1;
}

function listTopLevelDirs() {
  if (!fs.existsSync(skillsRoot)) {
    fail(`Missing skills directory: ${skillsRoot}`);
    return [];
  }

  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function listSkillDirs() {
  const skills = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const absolutePath = path.join(directory, entry.name);
      const skillFile = path.join(absolutePath, "SKILL.md");

      if (fs.existsSync(skillFile)) {
        skills.push(path.relative(skillsRoot, absolutePath).replaceAll(path.sep, "/"));
      }

      walk(absolutePath);
    }
  }

  walk(skillsRoot);
  return skills.sort((a, b) => a.localeCompare(b));
}

function readManifest() {
  if (!fs.existsSync(manifestPath)) {
    fail(`Missing manifest: ${manifestPath}`);
    return { entries: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    fail(`Manifest is not valid JSON: ${error.message}`);
    return { entries: [] };
  }
}

function validateOutputSkillDisclosurePolicy() {
  const violations = [];

  for (const file of outputDisclosurePolicyFiles) {
    if (!fs.existsSync(file)) {
      violations.push(`missing policy file: ${path.relative(repoRoot, file)}`);
      continue;
    }

    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(outputDisclosurePolicyId)) {
      violations.push(`missing ${outputDisclosurePolicyId} marker: ${path.relative(repoRoot, file)}`);
    }
    if (/trivial replies are exempt/i.test(content)) {
      violations.push(`forbidden trivial-output exemption: ${path.relative(repoRoot, file)}`);
    }
  }

  const routerPath = path.join(agentRoot, "skill-router.json");
  try {
    const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
    const policy = router.mandatorySkillUsage?.outputSkillDisclosure;
    const exempt = router.mandatorySkillUsage?.exempt;

    if (policy?.policyId !== outputDisclosurePolicyId || policy?.required !== true) {
      violations.push("skill-router.json does not require universal output skill disclosure");
    }
    if (!Array.isArray(exempt) || exempt.length !== 0) {
      violations.push("skill-router.json must keep mandatorySkillUsage.exempt empty");
    }
  } catch (error) {
    violations.push(`could not validate skill-router.json disclosure policy: ${error.message}`);
  }

  return violations;
}

function validateOfficialReferencePolicy() {
  const violations = [];

  for (const file of officialReferencePolicyFiles) {
    if (!fs.existsSync(file)) {
      violations.push(`missing policy file: ${path.relative(repoRoot, file)}`);
      continue;
    }

    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(officialReferencePolicyId)) {
      violations.push(`missing ${officialReferencePolicyId} marker: ${path.relative(repoRoot, file)}`);
    }
  }

  for (const file of generatedBridgePolicyFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(officialReferencePolicyId)) {
      violations.push(`generated bridge is stale or missing policy marker: ${path.relative(repoRoot, file)}`);
    }
  }

  let referenceMap;
  try {
    referenceMap = JSON.parse(fs.readFileSync(officialReferenceMapPath, "utf8"));
  } catch (error) {
    violations.push(`could not read official-reference-map.json: ${error.message}`);
    return violations;
  }

  if (referenceMap.policyId !== officialReferencePolicyId) {
    violations.push("official-reference-map.json has the wrong policyId");
  }
  if (referenceMap.lessonsFile !== ".agent/memory/lessons-learned.md") {
    violations.push("official-reference-map.json must use .agent/memory/lessons-learned.md");
  }
  if (referenceMap.requiredUncertaintyPhrase !== "ini masih perlu dicek ulang") {
    violations.push("official-reference-map.json must preserve the required uncertainty phrase");
  }
  if (referenceMap.correctionPolicy?.updateLessonsBeforeContinuing !== true) {
    violations.push("official-reference-map.json must require lessons update before continuing");
  }
  if (referenceMap.fastChangingPolicy?.verifyBeforeAnswering !== true) {
    violations.push("official-reference-map.json must require pre-answer verification for fast-changing topics");
  }

  const topics = Array.isArray(referenceMap.topics) ? referenceMap.topics : [];
  const actualReferences = new Map(topics.map((topic) => [topic.name, topic.source]));

  if (topics.length !== expectedOfficialReferences.size) {
    violations.push(`official-reference-map.json must contain exactly ${expectedOfficialReferences.size} topics`);
  }
  if (actualReferences.size !== topics.length) {
    violations.push("official-reference-map.json contains duplicate topic names");
  }

  for (const [topic, source] of expectedOfficialReferences) {
    if (actualReferences.get(topic) !== source) {
      violations.push(`official-reference-map.json mismatch: ${topic} must map to ${source}`);
    }
  }
  for (const topic of actualReferences.keys()) {
    if (!expectedOfficialReferences.has(topic)) {
      violations.push(`official-reference-map.json contains unexpected topic: ${topic}`);
    }
  }

  const routerPath = path.join(agentRoot, "skill-router.json");
  const activeSkillsPath = path.join(agentRoot, "active-skills.json");

  try {
    const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
    const policy = router.officialReferenceVerification;
    const referenceRoute = (router.routes || []).find((route) =>
      (route.skills || []).includes("official-reference-verifier") &&
      !(route.skills || []).includes("lessons-capture"),
    );
    const routed = Boolean(referenceRoute);
    const correctionRoute = (router.routes || []).some((route) =>
      (route.skills || []).includes("official-reference-verifier") &&
      (route.skills || []).includes("lessons-capture"),
    );

    if (
      policy?.policyId !== officialReferencePolicyId ||
      policy?.required !== true ||
      policy?.topicCount !== expectedOfficialReferences.size
    ) {
      violations.push("skill-router.json does not enforce the official reference policy");
    }
    if (!routed) {
      violations.push("skill-router.json does not route official-reference-verifier");
    } else {
      const routeSignals = new Set(referenceRoute.when || []);
      for (const signal of expectedOfficialRouteSignals) {
        if (!routeSignals.has(signal)) {
          violations.push(`skill-router.json official reference route is missing ${signal}`);
        }
      }
      for (const signal of routeSignals) {
        if (!expectedOfficialRouteSignals.has(signal)) {
          violations.push(`skill-router.json official reference route has unexpected signal ${signal}`);
        }
      }
    }
    if (!correctionRoute) {
      violations.push("skill-router.json does not enforce the correction-to-lessons route");
    }
  } catch (error) {
    violations.push(`could not validate skill-router.json reference policy: ${error.message}`);
  }

  try {
    const activeSkills = JSON.parse(fs.readFileSync(activeSkillsPath, "utf8"));
    if (!(activeSkills.defaultSet || []).includes("official-reference-verifier")) {
      violations.push("active-skills.json defaultSet is missing official-reference-verifier");
    }
  } catch (error) {
    violations.push(`could not validate active-skills.json reference policy: ${error.message}`);
  }

  const lessonsSkillPath = path.join(skillsRoot, "lessons-capture", "SKILL.md");
  if (fs.existsSync(lessonsSkillPath)) {
    const lessonsSkill = fs.readFileSync(lessonsSkillPath, "utf8");
    if (!lessonsSkill.includes("Correction Gate - Update Sebelum Lanjut")) {
      violations.push("lessons-capture is missing the correction gate");
    }
  }

  return violations;
}

function validateFailClosedGovernancePolicy() {
  const violations = [];

  for (const file of failClosedPolicyFiles) {
    if (!fs.existsSync(file)) {
      violations.push(`missing fail-closed policy file: ${path.relative(repoRoot, file)}`);
      continue;
    }

    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(failClosedPolicyId)) {
      violations.push(`missing ${failClosedPolicyId} marker: ${path.relative(repoRoot, file)}`);
    }
    if (!content.includes("GOVERNANCE VIOLATION DETECTED")) {
      violations.push(`missing violation recovery phrase: ${path.relative(repoRoot, file)}`);
    }
  }

  for (const file of generatedBridgePolicyFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    if (!content.includes(failClosedPolicyId)) {
      violations.push(`generated bridge is stale or missing fail-closed marker: ${path.relative(repoRoot, file)}`);
    }
    if (!content.includes("GOVERNANCE VIOLATION DETECTED")) {
      violations.push(`generated bridge is missing violation recovery phrase: ${path.relative(repoRoot, file)}`);
    }
  }

  const routerPath = path.join(agentRoot, "skill-router.json");
  try {
    const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));
    const policy = router.governanceEnforcement;
    const expectedRecovery = [
      "stop-current-work",
      "disclose-violation",
      "invalidate-unverified-claims",
      "recover-missing-gates",
      "rerun-required-validation",
    ];
    const expectedCompletionBlocks = [
      "all-required-gates-pass",
      "required-validation-exits-successfully",
      "validation-evidence-is-reportable",
    ];

    if (
      policy?.policyId !== failClosedPolicyId ||
      policy?.required !== true ||
      policy?.mode !== "fail-closed" ||
      policy?.agentBypassAllowed !== false
    ) {
      violations.push("skill-router.json does not enforce fail-closed governance");
    }

    for (const action of expectedRecovery) {
      if (!(policy?.onViolation || []).includes(action)) {
        violations.push(`skill-router.json fail-closed recovery is missing ${action}`);
      }
    }
    for (const condition of expectedCompletionBlocks) {
      if (!(policy?.completionBlockedUntil || []).includes(condition)) {
        violations.push(`skill-router.json completion block is missing ${condition}`);
      }
    }

    const agentScopeReviewCommand = "node .agent/scripts/self-review-validator.mjs --scope agent";
    if (!(router.requiredValidation?.agentConfigChanged || []).includes(agentScopeReviewCommand)) {
      violations.push("skill-router.json agentConfigChanged validation is missing agent-scope self-review");
    }

    const governanceRoute = (router.routes || []).find((route) =>
      (route.skills || []).includes("session-boot") &&
      (route.skills || []).includes("self-review-gate"),
    );
    for (const validation of ["fail-closed-policy-present", "violation-recovery-defined"]) {
      if (!(governanceRoute?.validation || []).includes(validation)) {
        violations.push(`universal governance route is missing ${validation}`);
      }
    }
  } catch (error) {
    violations.push(`could not validate fail-closed governance policy: ${error.message}`);
  }

  const selfReviewValidatorPath = path.join(agentRoot, "scripts", "self-review-validator.mjs");
  if (!fs.existsSync(selfReviewValidatorPath)) {
    violations.push("missing self-review-validator.mjs");
  } else {
    const selfReviewValidator = fs.readFileSync(selfReviewValidatorPath, "utf8");
    if (!selfReviewValidator.includes("reviewScope === 'agent'")) {
      violations.push("self-review-validator.mjs is missing the isolated agent scope");
    }
  }

  return violations;
}

const topLevelDirs = listTopLevelDirs();
const skillDirs = listSkillDirs();
const manifest = readManifest();
const manifestEntries = Array.isArray(manifest.entries) ? manifest.entries : [];
const manifestSet = new Set(manifestEntries);

const missingFromManifest = skillDirs.filter((skill) => !manifestSet.has(skill));
const missingOnDisk = manifestEntries.filter((skill) => !fs.existsSync(path.join(skillsRoot, skill)));
const manifestWithoutSkillMd = manifestEntries.filter(
  (skill) =>
    fs.existsSync(path.join(skillsRoot, skill)) &&
    !fs.existsSync(path.join(skillsRoot, skill, "SKILL.md")),
);
const missingSupportFiles = requiredSupportFiles.filter((file) => !fs.existsSync(file));
const missingRequiredSkills = requiredSkills.filter(
  (skill) =>
    !fs.existsSync(path.join(skillsRoot, skill, "SKILL.md")) ||
    !manifestSet.has(skill),
);
const outputDisclosureViolations = validateOutputSkillDisclosurePolicy();
const officialReferenceViolations = validateOfficialReferencePolicy();
const failClosedGovernanceViolations = validateFailClosedGovernancePolicy();

if (missingFromManifest.length > 0) {
  fail("Some disk skills are missing from manifest.", missingFromManifest);
}

if (missingOnDisk.length > 0) {
  fail("Some manifest entries are missing on disk.", missingOnDisk);
}

if (manifestWithoutSkillMd.length > 0) {
  fail("Some manifest entries exist on disk but have no SKILL.md (not a real skill).", manifestWithoutSkillMd);
}

if (missingSupportFiles.length > 0) {
  fail(
    "Required agent guardrail files are missing.",
    missingSupportFiles.map((file) => path.relative(repoRoot, file).replaceAll(path.sep, "/")),
  );
}

if (missingRequiredSkills.length > 0) {
  fail("Required GSAP/frontend skills are incomplete.", missingRequiredSkills);
}

if (outputDisclosureViolations.length > 0) {
  fail("Universal output skill disclosure policy is incomplete.", outputDisclosureViolations);
}

if (officialReferenceViolations.length > 0) {
  fail("Official reference verification policy is incomplete.", officialReferenceViolations);
}

if (failClosedGovernanceViolations.length > 0) {
  fail("Fail-closed governance policy is incomplete.", failClosedGovernanceViolations);
}

if (process.exitCode) {
  process.exit();
}

console.log("OK: .agent skills are ready.");
console.log(`- Top-level directories: ${topLevelDirs.length}`);
console.log(`- Skills with SKILL.md: ${skillDirs.length}`);
console.log(`- Manifest entries: ${manifestEntries.length}`);
console.log(`- Required GSAP/frontend skills: ${requiredSkills.length}`);
console.log(`- Required guardrail files: ${requiredSupportFiles.length}`);
console.log(`- Official reference topics enforced: ${expectedOfficialReferences.size}`);
console.log("- Fail-closed governance: enforced");
