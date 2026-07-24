import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.join(__dirname, 'dado-4-7.html');

console.log('=== LANDING PAGE TEST: dado-4-7.html ===\n');

let passed = 0;
let failed = 0;
let warnings = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

function warn(condition, label) {
  if (!condition) {
    console.warn(`  ⚠️  ${label}`);
    warnings++;
  }
}

// Load HTML
if (!fs.existsSync(htmlFile)) {
  console.error('FATAL: dado-4-7.html not found');
  process.exit(1);
}

const html = fs.readFileSync(htmlFile, 'utf8');
console.log(`File size: ${(html.length / 1024).toFixed(1)} KB`);
console.log(`Lines: ${html.split('\n').length}\n`);

// ===== 1. STRUCTURE & SEO =====
console.log('--- 1. STRUCTURE & SEO ---');
assert(html.includes('<!DOCTYPE html>'), 'DOCTYPE html5 present');
assert(/<html[^>]*lang=/.test(html), 'html lang attribute present');
assert(/<title>[^<]+<\/title>/.test(html), 'Title tag present');
assert(/name=["']description["']/.test(html), 'Meta description present');
assert(/property=["']og:title["']/.test(html), 'OpenGraph title present');
assert(/property=["']og:description["']/.test(html), 'OpenGraph description present');
assert(/property=["']og:image["']/.test(html), 'OpenGraph image present');
assert(/name=["']twitter:card["']/.test(html), 'Twitter card present');
assert(html.includes('application/ld+json'), 'Schema.org JSON-LD present');
assert(html.includes('<nav'), 'Semantic nav element');
assert(html.includes('<main'), 'Semantic main element');
assert(html.includes('<section'), 'Semantic section element');
assert(html.includes('<footer'), 'Semantic footer element');

// ===== 2. DESIGN SYSTEM =====
console.log('\n--- 2. DESIGN SYSTEM ---');
assert(html.includes(':root'), 'CSS Custom Properties defined');
assert(html.toLowerCase().includes('#030712'), 'Background #030712');
assert(html.toLowerCase().includes('#06b6d4'), 'Accent Cyan #06b6d4');
assert(html.toLowerCase().includes('#8b5cf6'), 'Accent Violet #8b5cf6');
assert(html.toLowerCase().includes('#f43f5e'), 'Accent Rose #f43f5e');
assert(/backdrop-filter:\s*blur/i.test(html), 'Glassmorphism backdrop-filter blur');

// ===== 3. INTERACTIVE FEATURES =====
console.log('\n--- 3. INTERACTIVE FEATURES ---');
assert(html.includes('particle-canvas'), 'Canvas Particle Engine');
assert(html.includes('getContext'), 'Canvas getContext API used');
assert(html.includes('cursor-dot'), 'Custom cursor dot');
assert(html.includes('cursor-ring'), 'Custom cursor ring');
assert(html.includes('mousemove'), 'Mousemove event listener');
assert(html.includes('analytics-canvas'), 'Dashboard chart canvas');
assert(html.includes('Daily') && html.includes('Weekly') && html.includes('Monthly'), 'Dashboard tabs (Daily/Weekly/Monthly)');
assert(html.includes('pricing-toggle'), 'Pricing toggle switch');
assert(html.includes('data-monthly') && html.includes('data-annual'), 'Pricing data attributes');
assert(html.includes('faq-item'), 'FAQ accordion items');
assert(html.includes('aria-expanded'), 'FAQ aria-expanded attribute');
assert(html.includes('demo-modal'), 'Demo modal present');
assert(html.includes('Escape'), 'Escape key handler for modal');
assert(html.includes('contact-form'), 'Contact form present');
assert(html.includes('toast-container'), 'Toast notification system');
assert(html.includes('data-count'), 'Counter animation data attributes');
assert(html.includes('IntersectionObserver'), 'Scroll reveal with IntersectionObserver');
assert(html.includes('animateValue'), 'Pricing animation function');
assert(html.includes('requestAnimationFrame'), 'RAF for smooth animations');

// ===== 4. ACCESSIBILITY =====
console.log('\n--- 4. ACCESSIBILITY ---');
assert(html.includes('skip-link'), 'Skip navigation link');
const ariaCount = (html.match(/aria-/g) || []).length;
assert(ariaCount >= 10, `ARIA attributes present (${ariaCount} found)`);
assert(html.includes(':focus-visible'), 'Focus-visible styles');
assert(html.includes('prefers-reduced-motion'), 'Reduced motion media query');
assert(html.includes('role='), 'ARIA roles present');
assert(html.includes('aria-label'), 'aria-label attributes present');
assert(html.includes('aria-required'), 'aria-required on form fields');
assert(html.includes('aria-hidden'), 'aria-hidden on decorative elements');
assert(html.includes('.sr-only'), 'Screen reader only utility class');
const imgTags = (html.match(/<img/gi) || []).length;
assert(imgTags === 0, `No external img tags (uses SVG inline only: ${imgTags} found)`);

// ===== 5. CODE QUALITY =====
console.log('\n--- 5. CODE QUALITY ---');
assert(!html.includes('node_modules'), 'No node_modules references');
assert(!html.includes('TODO'), 'No TODO comments');
assert(!html.includes('FIXME'), 'No FIXME comments');
assert(html.includes("'use strict'"), 'Strict mode enabled');
warn(html.includes('addEventListener'), 'Event listeners attached (passive check)');

// ===== 6. JS SYNTAX VALIDATION =====
console.log('\n--- 6. JS SYNTAX VALIDATION ---');
// Find the main script block (not JSON-LD or type= scripts)
const allScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const mainScript = allScripts.find(m => !m[0].includes('type='));
if (mainScript) {
  try {
    new Function(mainScript[1]);
    assert(true, 'JavaScript syntax valid (no parse errors)');
  } catch (e) {
    assert(false, `JavaScript syntax error: ${e.message}`);
  }
} else {
  assert(false, 'No main script block found');
}
assert(allScripts.length >= 2, `Multiple script blocks present (${allScripts.length} found)`);

// ===== 7. SECTION COMPLETENESS =====
console.log('\n--- 7. SECTION COMPLETENESS ---');
const sections = [
  ['Hero Section', 'class="hero"'],
  ['Features Section', 'id="features"'],
  ['Dashboard Section', 'id="dashboard"'],
  ['Pricing Section', 'id="pricing"'],
  ['FAQ Section', 'id="faq"'],
  ['Contact Section', 'id="contact"'],
  ['Footer', 'class="footer"'],
  ['Navigation', 'class="nav"'],
  ['Modal', 'class="modal-overlay"'],
];

for (const [name, marker] of sections) {
  assert(html.includes(marker), `${name} present`);
}

// ===== SUMMARY =====
console.log('\n============================================');
console.log('TEST RESULTS SUMMARY');
console.log('============================================');
console.log(`✅ Passed:   ${passed}`);
console.log(`❌ Failed:   ${failed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`Total:      ${passed + failed + warnings}`);
console.log('============================================');

if (failed > 0) {
  console.error('\n🔴 SOME TESTS FAILED');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n🟡 ALL TESTS PASSED (with warnings)');
  process.exit(0);
} else {
  console.log('\n🟢 ALL TESTS PASSED');
  process.exit(0);
}
