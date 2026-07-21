import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");
const routerPath = path.join(repoRoot, ".agent", "skill-router.json");

const ignoredDirs = new Set([
  ".agent",
  ".agents",
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
]);

function exists(root, file) {
  return fs.existsSync(path.join(root, file));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function packageManager(root) {
  if (exists(root, "pnpm-lock.yaml")) return "pnpm";
  if (exists(root, "yarn.lock")) return "yarn";
  if (exists(root, "package-lock.json")) return "npm";
  if (exists(root, "bun.lockb") || exists(root, "bun.lock")) return "bun";
  return null;
}

function dependencyNames(pkg) {
  return new Set([
    ...Object.keys(pkg?.dependencies || {}),
    ...Object.keys(pkg?.devDependencies || {}),
  ]);
}

function detectAt(root) {
  const relativeRoot = path.relative(repoRoot, root).replaceAll(path.sep, "/") || ".";
  const markers = [];
  const frameworks = [];
  const dependencies = [];
  const files = [];
  const validationCommands = [];
  const routeSignals = [];

  const pkgPath = path.join(root, "package.json");
  const pkg = exists(root, "package.json") ? readJson(pkgPath) : null;
  const deps = dependencyNames(pkg);
  const manager = packageManager(root);

  if (pkg) {
    markers.push("package.json");
    files.push("package.json");
    if (manager) markers.push(`${manager}-lock`);

    for (const dep of deps) {
      dependencies.push(dep);
      routeSignals.push(`dependency:${dep}`);
    }

    if (deps.has("next") || exists(root, "next.config.js") || exists(root, "next.config.mjs")) {
      frameworks.push("nextjs");
      routeSignals.push("framework:nextjs");
    }
    if (deps.has("vite") || exists(root, "vite.config.js") || exists(root, "vite.config.ts")) {
      frameworks.push("vite");
      routeSignals.push("framework:vite");
    }
    if (deps.has("react")) frameworks.push("react");
    if (deps.has("vue")) frameworks.push("vue");
    if (deps.has("svelte")) frameworks.push("svelte");
    if (deps.has("gsap")) routeSignals.push("dependency:gsap");
    if (deps.has("@gsap/react")) routeSignals.push("dependency:@gsap/react");

    const scripts = pkg.scripts || {};
    for (const name of ["lint", "test", "build", "typecheck", "check"]) {
      if (scripts[name]) validationCommands.push(`${manager || "npm"} run ${name}`);
    }
  }

  if (exists(root, "index.html")) {
    markers.push("index.html");
    files.push("index.html");
    frameworks.push("static-web");
    routeSignals.push("framework:static-web", "file:index.html");
  }

  if (exists(root, "Code.gs") || exists(root, "appsscript.json")) {
    markers.push("apps-script");
    frameworks.push("google-apps-script");
    if (exists(root, "Code.gs")) routeSignals.push("file:Code.gs");
    if (exists(root, "appsscript.json")) routeSignals.push("file:appsscript.json");
  }

  if (exists(root, "requirements.txt") || exists(root, "pyproject.toml")) {
    markers.push("python");
    frameworks.push("python");
  }

  if (exists(root, "tsconfig.json")) files.push("tsconfig.json");
  if (exists(root, "tailwind.config.js") || exists(root, "tailwind.config.ts")) files.push("tailwind.config");

  return {
    root: relativeRoot,
    markers: [...new Set(markers)],
    packageManager: manager,
    frameworks: [...new Set(frameworks)],
    dependencies: dependencies.sort(),
    validationCommands: [...new Set(validationCommands)],
    routeSignals: [...new Set(routeSignals)].sort(),
  };
}

function candidateRoots() {
  const roots = [repoRoot];

  for (const entry of fs.readdirSync(repoRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || ignoredDirs.has(entry.name)) continue;

    const absolutePath = path.join(repoRoot, entry.name);
    const hasProjectMarker = [
      "package.json",
      "index.html",
      "Code.gs",
      "appsscript.json",
      "requirements.txt",
      "pyproject.toml",
    ].some((file) => exists(absolutePath, file));

    if (hasProjectMarker) roots.push(absolutePath);
  }

  return roots;
}

function routeSkills(project) {
  const router = readJson(routerPath);
  if (!router) return [];

  const signals = new Set(project.routeSignals);
  const matched = [];

  for (const route of router.routes || []) {
    const routeSignals = route.when || [];
    if (routeSignals.some((signal) => signals.has(signal))) {
      matched.push({
        when: routeSignals.filter((signal) => signals.has(signal)),
        skills: route.skills || [],
        validation: route.validation || [],
      });
    }
  }

  return matched;
}

const projects = candidateRoots()
  .map(detectAt)
  .filter((project) => project.markers.length > 0)
  .map((project) => ({ ...project, matchedRoutes: routeSkills(project) }));

console.log(
  JSON.stringify(
    {
      repoRoot,
      projectCount: projects.length,
      projects,
    },
    null,
    2,
  ),
);
