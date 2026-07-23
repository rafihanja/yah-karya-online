import fs from 'fs';
import path from 'path';
import { execFileSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const scopeIndex = args.indexOf('--scope');
const reviewScope = scopeIndex >= 0 ? args[scopeIndex + 1] : 'full';

if (!['full', 'agent'].includes(reviewScope)) {
    console.error(`Unknown self-review scope: ${reviewScope || '(missing)'}`);
    console.error('Valid scopes: full, agent');
    process.exit(1);
}

console.log('==================================================');
console.log('🔍 AUTOMATED SELF-REVIEW GATE VALIDATOR STARTING');
console.log('==================================================\n');

let failed = false;
const failures = [];
const warnings = [];

// Helper to log status
function logPass(message) {
    console.log(`[✅ PASS] ${message}`);
}
function logFail(message) {
    console.log(`[❌ FAIL] ${message}`);
    failed = true;
    failures.push(message);
}
function logWarn(message) {
    console.log(`[⚠️ WARN] ${message}`);
    warnings.push(message);
}

// Agent-only changes need deterministic governance checks, not unrelated app E2E.
if (reviewScope === 'agent') {
    console.log('--- Agent Governance Scope ---');
    const checks = [
        ['validate-agent-skills', 'validate-agent-skills.mjs', []],
        ['agent-doctor', 'agent-doctor.mjs', []],
        ['deep-skill-audit', 'deep-skill-audit.mjs', []],
        ['audit-skill-quality', 'audit-skill-quality.mjs', []],
        ['adapter-dry-run', 'export-agent-adapters.mjs', ['--dry-run']],
    ];

    for (const [label, scriptName, scriptArgs] of checks) {
        try {
            const scriptPath = path.join(__dirname, scriptName);
            execFileSync(process.execPath, [scriptPath, ...scriptArgs], {
                cwd: rootDir,
                encoding: 'utf8',
                stdio: 'pipe',
            });
            logPass(`${label} passed.`);
        } catch (error) {
            const detail = (error.stderr || error.stdout || error.message || '').toString().trim();
            logFail(`${label} failed${detail ? `: ${detail}` : '.'}`);
        }
    }

    // Check PROJECT_MEMORY.md exists (governance requires it)
    const projectMemoryPath = path.join(rootDir, 'PROJECT_MEMORY.md');
    if (fs.existsSync(projectMemoryPath)) {
        logPass('PROJECT_MEMORY.md exists.');
    } else {
        logFail('PROJECT_MEMORY.md is missing — governance requires it for cross-session continuity.');
    }

    console.log('\n==================================================');
    console.log('AGENT-SCOPE SELF-REVIEW RESULTS');
    console.log('==================================================');
    console.log(`PASS: ${failed ? 'NO' : 'YES'}`);
    console.log(`Total Failures: ${failures.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    process.exit(failed ? 1 : 0);
}

// 1. Check Python syntax
console.log('--- Checking Python Syntax ---');
try {
    const pyFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.py'));
    let pyPass = true;
    for (const pyFile of pyFiles) {
        const filePath = path.join(rootDir, pyFile);
        try {
            execSync(`python -m py_compile "${filePath}"`, { stdio: 'ignore' });
        } catch (e) {
            logFail(`Python Syntax Error inside: ${pyFile}`);
            pyPass = false;
        }
    }
    if (pyPass && pyFiles.length > 0) {
        logPass(`All ${pyFiles.length} Python root scripts compiled successfully.`);
    }
} catch (e) {
    logWarn(`Could not read root python files or python compiler not available: ${e.message}`);
}

// 2. Check for Hardcoded Absolute Paths
console.log('\n--- Scanning for Hardcoded Paths & Cache Keys ---');
// Scan ENTIRE repo root recursively, not just hardcoded subdirectories.
// Exclusions: .git, node_modules, .agent (governance files are scanned separately by agent-doctor).
const forbiddenPatterns = [
    /C:\/Users\/[a-zA-Z0-9_.-]+\/\.gemini\/antigravity-ide/gi,
    /d:\/gsap/gi,
    /C:\\Users\\/gi
];
const scanExtensions = new Set(['.html', '.js', '.py', '.css', '.json', '.md']);
const scanExcludeDirs = new Set(['.git', 'node_modules', '.agent', '.cursor', '.agents']);
let hardcodedPathFound = false;

function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!scanExcludeDirs.has(item)) {
                scanDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (scanExtensions.has(ext)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                for (const pattern of forbiddenPatterns) {
                    // Reset lastIndex for global regex
                    pattern.lastIndex = 0;
                    if (pattern.test(content)) {
                        logFail(`Hardcoded absolute path / cache pattern found in: ${path.relative(rootDir, fullPath)}`);
                        hardcodedPathFound = true;
                        break;
                    }
                }
            }
        }
    }
}

scanDirectory(rootDir);
if (!hardcodedPathFound) {
    logPass('No hardcoded path/cache patterns found across the entire repo.');
}

// 3. Scan for Hardcoded Secrets / Credentials
console.log('\n--- Scanning for Hardcoded Credentials & Secrets ---');
const secretKeys = [/api[-_]?key/i, /secret/i, /password/i, /token/i];
const rawValueCheck = /['"`][a-zA-Z0-9_\-+=]{20,}['"`]/; // Check for raw long alphanumeric tokens
// Include .md and .html — agents often leak API keys in markdown docs and inline scripts
const secretScanExtensions = new Set(['.js', '.py', '.env', '.json', '.md', '.html', '.ts', '.mjs']);
const secretScanExcludeFiles = new Set(['package.json', 'package-lock.json', '.antigravity-install-manifest.json']);

function scanSecrets(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!scanExcludeDirs.has(item)) {
                scanSecrets(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (secretScanExtensions.has(ext)) {
                if (secretScanExcludeFiles.has(item)) continue;
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    for (const key of secretKeys) {
                        if (key.test(line) && rawValueCheck.test(line)) {
                            // Exclude obvious template or mock variables
                            if (!line.includes('process.env') && !line.includes('os.environ')) {
                                logWarn(`Possible secret / raw API key found in ${path.relative(rootDir, fullPath)} at line ${index + 1}: ${line.trim()}`);
                            }
                        }
                    }
                });
            }
        }
    }
}
scanSecrets(rootDir);
logPass('Secrets scanning complete (review warnings, if any).');

// 4. HTML Semantic, SEO & Accessibility Check
console.log('\n--- HTML SEO & Accessibility Verification ---');
const htmlFiles = [];
function findHtmlFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!scanExcludeDirs.has(item)) {
                findHtmlFiles(fullPath);
            }
        } else if (item.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    }
}
// Scan entire repo root for HTML files, not just hardcoded subdirectories
findHtmlFiles(rootDir);

for (const htmlFile of htmlFiles) {
    const content = fs.readFileSync(htmlFile, 'utf8');
    const filename = path.relative(rootDir, htmlFile);
    
    // Skip HTML fragments/defs that do not have a DOCTYPE or <html> wrapper
    if (!content.trim().toLowerCase().startsWith('<!doctype html') && !content.toLowerCase().includes('<html')) {
        continue;
    }
    
    // Check <title>
    if (!content.includes('<title>') || !content.includes('</title>')) {
        logFail(`Missing <title> tag in HTML file: ${filename}`);
    } else {
        const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
        if (!titleMatch || !titleMatch[1].trim()) {
            logFail(`Title tag is empty in HTML file: ${filename}`);
        }
    }

    // Check meta description
    if (!content.includes('name="description"') && !content.includes('name=\'description\'')) {
        logWarn(`Missing meta description tag in HTML file: ${filename}`);
    }

    // Check image alt tags
    const imgTags = content.match(/<img[^>]+>/g) || [];
    let missingAltCount = 0;
    for (const img of imgTags) {
        if (!img.includes('alt=') && !img.includes('alt=""')) {
            missingAltCount++;
        }
    }
    if (missingAltCount > 0) {
        logWarn(`HTML file ${filename} has ${missingAltCount} img tag(s) missing an 'alt' attribute.`);
    }
}
logPass('HTML structural validation complete.');

// 5. Check for Duplicate PROJECT_MEMORY.md
console.log('\n--- Checking for Duplicated Project Memory Files ---');
const memoryFiles = [];
function findMemoryFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            if (item !== '.git' && item !== 'node_modules' && item !== '.agent') {
                findMemoryFiles(fullPath);
            }
        } else if (item.toLowerCase() === 'project_memory.md') {
            memoryFiles.push(fullPath);
        }
    }
}
findMemoryFiles(rootDir);
if (memoryFiles.length > 1) {
    // Other subdirectories in the monorepo can have separate memories, so issue a warning instead of a hard crash
    logWarn(`Multiple PROJECT_MEMORY.md files found: ${memoryFiles.map(f => path.relative(rootDir, f)).join(', ')}`);
} else {
    logPass('No duplicate PROJECT_MEMORY.md detected.');
}

// 6. Running Playwright Automated End-to-End Tests
console.log('\n--- Running Playwright End-to-End Tests ---');
const testScriptPath = path.join(rootDir, 'test_parallax.py');
if (fs.existsSync(testScriptPath)) {
    try {
        console.log('Executing: python test_parallax.py...');
        const testOutput = execSync('python test_parallax.py', { encoding: 'utf8' });
        console.log(testOutput);
        logPass('Playwright scroll transition and console audit tests passed successfully!');
    } catch (e) {
        logFail(`Playwright test script execution failed!\nStdout/Stderr:\n${e.stdout || ''}\n${e.stderr || ''}`);
    }
} else {
    logWarn('Playwright test script test_parallax.py not found. Skipping E2E checks.');
}

// Final Summary
console.log('\n==================================================');
console.log('🏁 SELF-REVIEW GATE RESULTS SUMMARY');
console.log('==================================================');
console.log(`PASS: ${failed ? '❌ NO' : '✅ YES'}`);
console.log(`Total Failures: ${failures.length}`);
console.log(`Total Warnings: ${warnings.length}`);
if (failures.length > 0) {
    console.log('\nCritical failures to resolve:');
    failures.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
    process.exit(1);
} else {
    console.log('\nAll core checks passed! You are ready to deliver this phase.');
    process.exit(0);
}
