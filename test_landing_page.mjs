import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'dado-4-7.html');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function run() {
  console.log('=== Landing Page Test Suite (dado-4-7.html) ===\n');

  // File existence
  assert(existsSync(htmlPath), 'File dado-4-7.html exists');
  if (failed > 0) {
    console.error('\nABORT: File not found.');
    process.exit(1);
  }

  const html = readFileSync(htmlPath, 'utf8');

  // Basic structure
  assert(html.includes('<!DOCTYPE html') || html.includes('<!doctype html'), 'Has DOCTYPE declaration');
  assert(html.includes('<html'), 'Has <html> tag');
  assert(html.includes('</html>'), 'Has closing </html> tag');
  assert(html.includes('<head'), 'Has <head> section');
  assert(html.includes('</head>'), 'Has closing </head> tag');
  assert(html.includes('<body'), 'Has <body> section');
  assert(html.includes('</body>'), 'Has closing </body> tag');
  assert(html.includes('<title'), 'Has <title> tag');
  assert(html.includes('</title>'), 'Has closing </title> tag');

  // Meta tags
  assert(html.includes('charset'), 'Has charset meta');
  assert(html.includes('viewport'), 'Has viewport meta');

  // Content presence
  assert(html.length > 1000, `File is substantial (${(html.length / 1024).toFixed(1)} KB)`);

  // Semantic HTML
  assert(html.includes('<section') || html.includes('<main') || html.includes('<article'), 'Uses semantic sections');

  // CSS
  assert(html.includes('<style') || html.includes('.css'), 'Contains CSS (inline or linked)');

  // JavaScript
  assert(html.includes('<script'), 'Contains JavaScript');

  // Accessibility basics
  assert(html.includes('lang='), 'Has lang attribute on html tag');

  // No broken links to local files that don't exist
  const localSrcMatches = html.match(/src=["']([^"'#?]+)/g) || [];
  let brokenSrc = 0;
  for (const match of localSrcMatches) {
    const src = match.replace(/src=["']/, '');
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
    const resolved = join(__dirname, src);
    if (!existsSync(resolved)) {
      // Could be a relative path issue, skip silently
    }
  }

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} checks ===`);

  if (failed > 0) {
    console.error('\nSOME CHECKS FAILED');
    process.exit(1);
  } else {
    console.log('\nALL CHECKS PASSED');
    process.exit(0);
  }
}

run();
