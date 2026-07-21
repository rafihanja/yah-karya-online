#!/usr/bin/env node
/**
 * upgrade-final-13.mjs
 * 
 * Hand-crafted ALWAYS DO + NEVER DO sections for the 13 skills
 * that couldn't be auto-derived.
 * 
 * Usage:
 *   node .agent/scripts/upgrade-final-13.mjs --dry-run
 *   node .agent/scripts/upgrade-final-13.mjs --apply
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.join(__dirname, "..", "skills");
const isDryRun = !process.argv.includes("--apply");

const sections = {
  "3d-web-experience": {
    always: [
      "Optimize 3D models before loading — use Draco/meshopt compression and reduce polygon counts",
      "Provide 2D image fallbacks for mobile devices and low-end hardware",
      "Use `<Suspense>` with loading indicators for async 3D asset loading",
      "Test on real mobile devices — GPU performance varies wildly across phones",
      "Dispose of geometries, materials, and textures when no longer needed to prevent memory leaks",
      "Use LOD (Level of Detail) for complex scenes — show simpler meshes at distance"
    ],
    never: [
      "Do not load uncompressed GLB/GLTF models larger than 5MB without lazy loading",
      "Do not use 3D for purely decorative elements that add no interaction value — it wastes GPU resources",
      "Do not skip mobile testing — a scene that runs at 60fps on desktop may crawl at 10fps on mobile",
      "Do not create new Three.js objects inside React render cycles — use refs and useFrame",
      "Do not forget to add lights when using PBR materials (meshStandardMaterial) — they render black without light"
    ]
  },
  
  "deployment-validation-config-validate": {
    always: [
      "Define a validation schema (Zod, Joi, JSON Schema) for every config file before deployment",
      "Validate configs at application startup — fail fast with clear error messages",
      "Test config changes in staging before production deployment",
      "Use environment-specific config files with a shared base (base.yaml + prod.yaml override)",
      "Log which config values are loaded at startup (redacting secrets) for debugging"
    ],
    never: [
      "Do not deploy without validating all required environment variables are present",
      "Do not hardcode secrets or credentials in config files — use a secrets manager",
      "Do not allow config changes to bypass CI/CD validation pipelines",
      "Do not trust user-provided config values without schema validation and sanitization",
      "Do not use different config formats across environments — standardize on one (YAML, TOML, or JSON)"
    ]
  },
  
  "gemini-api-dev": {
    always: [
      "Use the latest model names (gemini-3-pro-preview, gemini-3-flash-preview) — older model names are deprecated",
      "Set `temperature`, `maxOutputTokens`, and `topP` explicitly for reproducible outputs",
      "Handle API errors with retry logic and exponential backoff — rate limits and transient failures are common",
      "Use structured output (`responseMimeType: 'application/json'` + `responseSchema`) for programmatic consumption",
      "Validate and sanitize user input before sending to the API — prevent prompt injection"
    ],
    never: [
      "Do not use deprecated model names (gemini-2.5-*, gemini-2.0-*, gemini-1.5-*) — they are legacy",
      "Do not expose your API key in client-side code — proxy through a backend endpoint",
      "Do not send sensitive/PII data to the API without reviewing Google's data usage policies",
      "Do not ignore the `finishReason` in responses — it indicates truncation, safety blocks, or errors",
      "Do not hardcode API keys — use environment variables and a secrets manager"
    ]
  },
  
  "google-sheets-automation": {
    always: [
      "Authenticate via `python scripts/auth.py login` before first use",
      "Use A1 notation for range references (e.g., `Sheet1!A1:B10`)",
      "Pass values as JSON 2D arrays for write operations",
      "Check `auth.py status` to verify authentication before running automated scripts",
      "Use `--format json` for programmatic processing of sheet data"
    ],
    never: [
      "Do not expose OAuth tokens or credentials in scripts or version control",
      "Do not use the `--raw` flag unless you specifically want to prevent formula parsing",
      "Do not assume sheet names — use `get-metadata` to discover available sheets first",
      "Do not run batch-update without testing the request JSON on a copy of the spreadsheet first",
      "Do not use personal Gmail accounts — this skill requires Google Workspace"
    ]
  },
  
  "llm-app-patterns": {
    always: [
      "Implement structured output schemas for all LLM responses used programmatically",
      "Add retry logic with exponential backoff for API calls — LLM services have transient failures",
      "Log prompts, responses, and latencies for debugging and cost monitoring",
      "Use streaming for user-facing responses to reduce perceived latency",
      "Validate and sanitize all user inputs before including them in prompts"
    ],
    never: [
      "Do not hardcode API keys or model names — use environment variables and configuration",
      "Do not send unvalidated user input directly into system prompts — this enables prompt injection",
      "Do not ignore token limits — count tokens before sending and handle truncation gracefully",
      "Do not rely on LLM output format without schema validation — models can produce unexpected structures",
      "Do not skip cost estimation before scaling — LLM API costs grow linearly with usage"
    ]
  },
  
  "nextjs-supabase-auth": {
    always: [
      "Use `createServerClient` from `@supabase/ssr` for server-side auth in App Router",
      "Implement middleware to refresh sessions and protect routes server-side",
      "Use `supabase.auth.getUser()` (not `getSession()`) for server-side JWT validation",
      "Create separate Supabase clients for server components, client components, and middleware",
      "Enable Row Level Security (RLS) on all tables — the anon key is exposed to the client"
    ],
    never: [
      "Do not use `createClient` from `@supabase/supabase-js` directly — use the SSR package for Next.js",
      "Do not expose the `service_role` key in client-side code or middleware — it bypasses all RLS",
      "Do not trust `getSession()` on the server — its JWT is from cookies and could be tampered with",
      "Do not skip middleware session refresh — expired sessions cause auth errors on navigation",
      "Do not store auth tokens in localStorage when using Next.js — use httpOnly cookies via the SSR helpers"
    ]
  },
  
  "performance-profiling": {
    always: [
      "Measure before optimizing — establish a baseline with Lighthouse or DevTools Performance tab",
      "Profile on real devices and slow network conditions, not just fast dev machines",
      "Fix the biggest bottleneck first — prioritize by impact, not ease",
      "Use RUM (Real User Monitoring) data for production performance insights",
      "Re-measure after every change to validate the improvement and catch regressions"
    ],
    never: [
      "Do not guess at performance problems — profile first, then optimize",
      "Do not micro-optimize before addressing the dominant bottleneck",
      "Do not use `KEYS *` in Redis or unindexed queries in databases during profiling — they skew results",
      "Do not optimize prematurely — wait until you have evidence of a real performance issue",
      "Do not ignore Core Web Vitals targets (LCP < 2.5s, INP < 200ms, CLS < 0.1)"
    ]
  },
  
  "postgres-best-practices": {
    always: [
      "Use indexes on columns used in WHERE, JOIN, and ORDER BY clauses",
      "Enable connection pooling (PgBouncer, Supabase pooler) for production workloads",
      "Use `EXPLAIN ANALYZE` to verify query plans before deploying complex queries",
      "Set appropriate column types — prefer `text` over `varchar(n)`, use `timestamptz` not `timestamp`",
      "Use database migrations for all schema changes — never modify production schemas manually"
    ],
    never: [
      "Do not use `SELECT *` in production queries — specify only the columns you need",
      "Do not create indexes on every column — each index adds write overhead and storage cost",
      "Do not use `DELETE` for bulk data removal — use `TRUNCATE` or partitioned tables",
      "Do not store large binary files in Postgres directly — use external storage with references",
      "Do not run long-running transactions — they hold locks and block other queries"
    ]
  },
  
  "telegram-bot-builder": {
    always: [
      "Use webhook mode (not polling) for production deployments — it's more reliable and scalable",
      "Implement rate limiting to comply with Telegram's API limits (30 msg/sec to different users)",
      "Handle errors gracefully with user-friendly messages — Telegram users expect instant responses",
      "Use inline keyboards and callback queries for interactive bot flows",
      "Validate and sanitize all user input before processing — bots receive arbitrary text"
    ],
    never: [
      "Do not expose your bot token in client-side code or public repositories",
      "Do not send more than 30 messages per second globally or 1 message per second to the same chat",
      "Do not use polling mode in production on serverless platforms — it wastes resources and connections",
      "Do not store sensitive user data without encryption — comply with privacy regulations",
      "Do not ignore Telegram's Bot API update format — always check `update.message` exists before accessing fields"
    ]
  },
  
  "telegram-mini-app": {
    always: [
      "Validate the `initData` hash on your backend server to verify the request is from Telegram",
      "Use the Telegram Web App SDK (`window.Telegram.WebApp`) for native-like interactions",
      "Implement responsive design — Mini Apps render in Telegram's webview at various screen sizes",
      "Use `WebApp.ready()` to signal the app is loaded and hide the loading indicator",
      "Handle the back button with `WebApp.BackButton` instead of browser navigation"
    ],
    never: [
      "Do not trust `initData` on the client side without server-side HMAC validation — it can be spoofed",
      "Do not use full-page reloads — Mini Apps should feel like native app screens",
      "Do not ignore the Telegram color scheme — use `WebApp.themeParams` for consistent styling",
      "Do not store user tokens in localStorage without the Telegram CloudStorage API",
      "Do not skip testing in the actual Telegram app — browser previews miss webview-specific quirks"
    ]
  },
  
  "threejs-fundamentals": {
    always: [
      "Dispose of geometries, materials, and textures when removing objects from the scene",
      "Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to cap resolution on high-DPI screens",
      "Handle window resize by updating camera aspect ratio and renderer size",
      "Use `requestAnimationFrame` for the render loop — never `setInterval`",
      "Set up a proper scene graph hierarchy using `Object3D` groups for logical grouping"
    ],
    never: [
      "Do not create new materials or geometries inside the animation loop — create once, reuse",
      "Do not forget to call `renderer.dispose()` when destroying the Three.js instance",
      "Do not use `renderer.setPixelRatio(window.devicePixelRatio)` without capping — Retina screens will tank performance",
      "Do not mix coordinate systems — Three.js uses right-handed Y-up by default",
      "Do not add lights without purpose — each light adds a render pass (especially shadow-casting lights)"
    ]
  },
  
  "vercel-deployment": {
    always: [
      "Use `vercel.json` for custom headers, rewrites, and redirects configuration",
      "Set environment variables in the Vercel dashboard — never commit them to the repository",
      "Use preview deployments for PRs to test changes before merging to production",
      "Configure `regions` in `vercel.json` to deploy serverless functions close to your users",
      "Use ISR (Incremental Static Regeneration) or on-demand revalidation instead of full rebuilds"
    ],
    never: [
      "Do not expose environment variables prefixed with `NEXT_PUBLIC_` unless they are truly public",
      "Do not exceed the 50MB serverless function size limit — use edge functions or split logic",
      "Do not use `fs` module in serverless functions without bundling the files — the filesystem is ephemeral",
      "Do not deploy database migrations from Vercel build scripts — run them separately with explicit control",
      "Do not ignore build logs — Vercel surfaces warnings about missing optimizations and misconfigurations"
    ]
  },
  
  "web-design-guidelines": {
    always: [
      "Fetch the latest guidelines from the source URL before each review — rules may be updated",
      "Output findings in the `file:line` format as specified in the fetched guidelines",
      "Check against all rules in the guidelines, not just a subset",
      "Ask the user which files to review if no file or pattern argument is provided",
      "Report both violations and the specific guideline rule being violated"
    ],
    never: [
      "Do not use cached/stale guidelines — always fetch fresh from the source URL",
      "Do not skip rules from the guidelines selectively — apply all rules consistently",
      "Do not auto-fix violations without showing the user the findings first",
      "Do not apply guidelines meant for web interfaces to non-web files (scripts, configs)",
      "Do not report false positives — verify each finding against the actual rule text"
    ]
  }
};

// ── INJECTION LOGIC ──────────────────────────────────────────────────

let upgraded = 0;
let errors = 0;

for (const [skill, { always, never }] of Object.entries(sections)) {
  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  
  if (!fs.existsSync(skillMd)) {
    console.log(`  ❌ ${skill} → SKILL.md not found`);
    errors++;
    continue;
  }
  
  let content = fs.readFileSync(skillMd, "utf8").replace(/\r\n/g, "\n");
  
  // Check if already has both sections
  if (/always\s+do/i.test(content) && /never\s+do/i.test(content)) {
    console.log(`  ⏭️  ${skill} → already has ALWAYS DO + NEVER DO`);
    continue;
  }
  
  // Build sections to insert
  let insert = "";
  
  if (!/always\s+do/i.test(content) && always.length > 0) {
    insert += "\n\n## ALWAYS DO\n\n";
    insert += always.map(a => `- ${a}`).join("\n");
  }
  
  if (!/never\s+do/i.test(content) && never.length > 0) {
    insert += "\n\n## NEVER DO\n\n";
    insert += never.map(n => `- ${n}`).join("\n");
  }
  
  if (insert === "") {
    console.log(`  ⏭️  ${skill} → nothing to add`);
    continue;
  }
  
  // Find insertion point: before ## Limitations or ## Related Skills or at end
  const limMatch = content.match(/^## (Limitations|Related Skills)/m);
  
  if (limMatch) {
    const idx = content.indexOf(limMatch[0]);
    content = content.slice(0, idx) + insert.trimStart() + "\n\n" + content.slice(idx);
  } else {
    content = content.trimEnd() + insert + "\n";
  }
  
  if (isDryRun) {
    const parts = [];
    if (always.length) parts.push(`+ALWAYS DO(${always.length})`);
    if (never.length) parts.push(`+NEVER DO(${never.length})`);
    console.log(`  ✅ ${skill} → ${parts.join(", ")}`);
  } else {
    fs.writeFileSync(skillMd, content, "utf8");
    const parts = [];
    if (always.length) parts.push(`+ALWAYS DO(${always.length})`);
    if (never.length) parts.push(`+NEVER DO(${never.length})`);
    console.log(`  ✅ ${skill} → ${parts.join(", ")} applied`);
  }
  upgraded++;
}

console.log(`\nUpgraded: ${upgraded} | Errors: ${errors}`);
if (isDryRun) {
  console.log(`\n(DRY RUN — no files written. Re-run with --apply to write.)`);
}
