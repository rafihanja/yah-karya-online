---
name: web-artifacts-builder
description: To build powerful frontend claude.ai artifacts, follow these steps.
risk: safe
source: "Elite Agent Operations - Batch 3G (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Artifacts Engineering

> **One-liner:** Guidelines for constructing self-contained interactive front-end previews using single-file HTML scripts and CDN dependencies.

## When to Use

- When building standalone interactive UI mockups, visual charts dashboards, or animations playgrounds designed to run instantly inside browser previews.
- When bundling layouts containing all styling, logic scripts, and SVG icon sets inside a single file code block.
- When creating fast interactive prototypes before splitting code components into modular workspace files.

## Why This Exists

Browser artifacts (like those previewed inside IDE layouts or LLM dashboard side panels) operate in sandboxed browser contexts. If an artifact depends on local files, custom workspace imports, or relative assets paths, the preview window will render empty blocks. Enforcing self-contained single-file layouts, loading external dependencies exclusively via public Content Delivery Networks (CDNs), and writing responsive layouts ensures prototypes load instantly and run correctly.

## ALWAYS DO THIS

- **Build fully self-contained preview files** — Include all stylesheet templates, logic scripts, and layouts markup within a single HTML file.
- **Import dependencies via public CDNs** — Load library integrations (Tailwind CSS, GSAP, Lucide Icons) using explicit HTTP secure URLs.
- **Define unique element identifiers** — Verify that all interactive elements carry unique `id` attributes to avoid selector collisions.
- **Ensure responsive mobile scaling** — Configure mobile-first viewport meta tags and Tailwind width constraints to prevent layout clipping.
- **Implement fallback data structures** — Seed mockup data arrays directly in JavaScript tags to shield the preview from database exceptions.

## NEVER DO THIS

- ❌ **DO NOT** use relative file imports (e.g. `<script src="./utils.js">` or `@import "./theme.css"` = ❌) in artifact code. **Why fails:** The preview sandbox cannot resolve local file paths, resulting in script errors. **Instead:** Embed styling and logic scripts directly in style and script tags.
- ❌ **DO NOT** require secret API keys or backend connections. **Why fails:** Previews run client-side only and will fail to resolve credentials, while exposing keys. **Instead:** Mock API requests and simulate successful/failure responses.
- ❌ **DO NOT** write blocking infinite loops inside canvas rendering animations. **Why fails:** Freezes the browser preview panel, forcing a hard tab reload. **Instead:** Route animations through `requestAnimationFrame` hooks.
- ❌ **DO NOT** use default system emoji characters to represent interactive elements. **Why fails:** Degrades the professional aesthetic of premium mockups. **Instead:** Load vector icon libraries via CDN.

---

## Web Artifacts Sandboxing & Preview Pipeline

Bundling assets, loading CDN scripts, and rendering independent preview screens:

```
[Single HTML File] ──> [Load Tailwind/GSAP via CDN] ──> [Seed Mock Data] ──> [Render Sandboxed Preview]
```

---

## Examples

### ✅ Good — Self-Contained HTML, CDN Imports, and Local Mock Data

#### 1. Premium Interactive Dashboard Artifact (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Analytics Dashboard</title>
  
  {/* 1. Import all stylesheet assets and script libraries via secure public CDNs */}
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    /* Scoped visual overrides mapped cleanly to standard properties */
    .glass-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col p-6">

  <!-- Interactive Grid Container -->
  <main class="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
    
    <!-- User Card Panel -->
    <div class="glass-card p-8 rounded-3xl shadow-2xl flex flex-col items-start">
      <div class="p-4 bg-sky-500/10 text-sky-400 rounded-2xl">
        <i data-lucide="activity" class="size-6"></i>
      </div>
      <h3 class="mt-6 text-xl font-bold">System Status</h3>
      <p class="mt-2 text-sm text-slate-400 leading-relaxed">
        Monitoring dynamic pipelines execution status. Everything is running smoothly.
      </p>
      
      <!-- Primary touch-safe CTA button -->
      <button
        id="btn-simulate"
        class="mt-8 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-xl transition-all duration-200 focus:outline-none min-h-[44px]"
      >
        Simulate Action
      </button>
    </div>

  </main>

  <script>
    // Initialize vector icon library loaded via CDN
    lucide.createIcons();

    // 2. Local mock data to keep the artifact independent of backend services
    const systemMetrics = [45, 62, 89, 32, 54];

    // Snappy spring-based GSAP animation
    document.getElementById("btn-simulate").addEventListener("click", () => {
      gsap.to(".glass-card", {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    });
  </script>
</body>
</html>
```

Why this passes: Bundles all markup, styling, and logic in a single file, loads dependencies from public CDNs, uses local mock data, and handles animations using a CDN-loaded GSAP library.

### ❌ Bad — Local File Imports, Missing Viewport Metas, and Inline script dependencies

```html
<!-- ERROR 1: Missing standard viewport meta tag (breaks mobile layout layout scaling) -->
<html>
<head>
  <!-- ERROR 2: Relative stylesheet path fails to load inside the sandbox preview -->
  <link rel="stylesheet" href="./styles/dashboard.css" />
</head>
<body>
  <div>
    <!-- ERROR 3: Generic emoji icons instead of vector assets -->
    <h3>System Status Dashboard 🚀</h3> 
    
    <!-- ERROR 4: Relative script path fails to execute -->
    <script src="./scripts/charts.js"></script>
  </div>
</body>
</html>
```

Why this fails: Omits the viewport meta tag, references local relative assets (`dashboard.css`, `charts.js`), and uses generic emojis in the layout.

---

## Failure Modes

- **The Sandbox Path Block:** Referencing relative files (e.g. `./script.js`), causing preview render failures.
- **The Missing Viewport Wrap:** Omitting mobile viewport meta tags, causing layout wrapping bugs on mobile screens.
- **The API Key Leak:** Storing private access tokens inside public client scripts.
- **The Animation Page Freeze:** Writing infinite loop scripts without requestAnimationFrame callbacks, freezing the preview.
- **The Selector Collision:** Reusing element IDs across different sections, causing script execution failures.

## Validation

Verify CDN structures, file self-containment, and viewport attributes:

1. **Verify that the artifact is bundled into a single file:**
   Scan code for external local script references:
   ```bash
   grep -rn "src=\"\./" src/ 2>/dev/null
   # expected: zero matches. Scripts are embedded directly or loaded via CDN.
   ```
2. **Scan for secure public CDN protocols:**
   Ensure dependency imports use HTTPS:
   ```bash
   grep -rn "src=\"http://" src/ 2>/dev/null
   # expected: zero matches. Libraries are loaded over secure HTTPS connections.
   ```
3. **Verify presence of viewport meta tags:**
   Check for responsive head tags:
   ```bash
   grep -rn "name=\"viewport\"" src/ 2>/dev/null
   # expected: Main index files define responsive viewport properties.
   ```
4. **Identify arbitrary layout parameters:**
   Ensure margins and paddings conform to standard spacing scales.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun Artifak Web:

> "Use the skill `web-artifacts-builder`. Read `.agent/skills/web-artifacts-builder/SKILL.md` before coding. Never reference local stylesheets/scripts or use relative asset paths. Always bundle resources in a single HTML file, load libraries via secure CDNs, and mock API data."

## Related

- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Asymmetric alignment rules.
- [tailwind-design-system](../tailwind-design-system/SKILL.md) — Layout tokens styling.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Pre-audit checks.
