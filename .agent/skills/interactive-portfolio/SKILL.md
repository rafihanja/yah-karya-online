---
name: interactive-portfolio
description: Architecting high-converting, responsive portfolios that showcase projects and convert visits to opportunities.
risk: low (broken contact CTAs, missing mobile layouts)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Interactive Portfolio

> **One-liner:** Guidelines for structuring and styling personal developer portfolios that load in under 3 seconds, perform on mobile, and convert visits to opportunities.

## When to Use

- When planning the site architecture of a personal developer or designer portfolio.
- When designing project showcase components, case studies, or contact CTA blocks.
- When adding hover visual effects or micro-animations to portfolio links.

## Why This Exists

Hiring managers spend an average of 30 seconds scanning a developer's portfolio. If the site has slow loading times, lacks clear CTAs, or is not mobile-responsive, visitors will bounce before seeing any work. Portfolios must be structured to immediately communicate who you are, what you build, and how to get in touch.

## ALWAYS DO THIS

- **Include a clear contact CTA** — Place prominent "Let's work together" action buttons in the hero, project gallery, and footer sections.
- **Ensure mobile responsiveness** — Design mobile-first layout cards with tap targets of at least 44px for navigation links.
- **Showcase project impact** — Use clear, metrics-driven descriptions (e.g. "Increased loading speed by 40%") instead of generic statements (e.g. "Built a website").
- **Expose source code links** — Provide visible, direct links to live demo deployments and clean GitHub code repositories.
- **Implement lazy-loading on images** — Compress screenshots to WebP format and use lazy-loading to keep initial load times under 3 seconds.

## NEVER DO THIS

- ❌ **DO NOT** hide primary content behind complex interactive triggers or loading loops. **Why fails:** Hiring managers will not wait or click through layers of UI just to read your resume details. **Instead:** Keep primary info immediately visible and readable.
- ❌ **DO NOT** launch a portfolio without real-device mobile testing. **Why fails:** Layouts that look fine in browser DevTools often break on physical phone viewports, blocking navigation. **Instead:** Test layouts on Safari iOS and Chrome Android.
- ❌ **DO NOT** include tutorial clones or generic CRUD apps in your featured project list. **Why fails:** Blends in with thousands of other applicants, showing no unique problem-solving depth. **Instead:** Highlight original side projects or open-source contributions.
- ❌ **DO NOT** create a contact section with a form-only layout. **Why fails:** Forms add friction, and mail servers can fail. **Instead:** Provide direct `mailto:` links alongside a "Copy Email" button.

---

## Technical Conversion Checklist
Ensure these key metrics are met:
- **Load Time:** Main paint under 3 seconds on slow 3G networks.
- **Tap Targets:** Interactive buttons must be at least 44px by 44px.
- **CTA Count:** A minimum of 3 clear contact triggers across the page.

---

## Examples

### ✅ Good — Clean Modular Portfolio Layout with Clear CTAs

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- 1. Ensure correct viewport mapping for mobile screens -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera | Creative Engineer</title>
  <style>
    body { font-family: 'Outfit', sans-serif; margin: 0; padding: 20px; background: #fafafa; }
    .hero { min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
    .cta-btn { display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 4px; min-height: 44px; margin-top: 15px; }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .project-card { border: 1px solid #eee; padding: 15px; border-radius: 6px; background: #fff; }
  </style>
</head>
<body>
  <!-- 2. Clear Hero with value proposition and CTA -->
  <header class="hero">
    <h1>Hi, I'm Alex Rivera.</h1>
    <p>I build lightweight, high-performance web systems utilizing React and WebGL.</p>
    <div>
      <a href="mailto:alex@rivera.dev" class="cta-btn">Let's work together</a>
    </div>
  </header>

  <main>
    <h2>Featured Work</h2>
    <div class="project-grid">
      <!-- 3. Metrics-driven project details with demo links -->
      <article class="project-card">
        <h3>System 01</h3>
        <p>Reduced user database sync latency by 45% using customized caching pipelines.</p>
        <div>
          <a href="https://github.com/alex/sys01" target="_blank" rel="noopener">Source Code</a> | 
          <a href="https://sys01.dev" target="_blank" rel="noopener">Live Demo</a>
        </div>
      </article>
    </div>
  </main>
</body>
</html>
```

Why this passes: Declares responsive viewports, places direct mailto actions in the hero, features metrics-oriented project cards, and includes live links.

### ❌ Bad — Interactive Loader Hiding Content and Lacking CTAs

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ERROR 1: Missing mobile viewport meta tag -->
  <title>My Portfolio</title>
</head>
<body>
  <!-- ERROR 2: Confusing, non-skippable loader that blocks page access -->
  <div id="interactive-loader">
    <p>Loading 3D Portfolio Universe (Please Wait 10 Seconds)...</p>
  </div>

  <div class="content" style="display:none;">
    <h1>Welcome to my website</h1>
    <!-- ERROR 3: Tutorial project clone with no metrics, code links, or CTAs -->
    <div class="project">
      <h3>Basic ToDo List</h3>
      <p>I built a standard todo list following a YouTube video tutorial.</p>
    </div>
  </div>
</body>
</html>
```

Why this fails: Lacks responsive viewports, hides content behind a slow non-skippable loader, features simple tutorial clones, and contains no contact CTAs.

---

## Failure Modes

- **Zero Conversion Glitch:** The portfolio generates page views but zero contacts because the email link is hidden behind a contact form that fails to submit.
- **Mobile Page Overflow:** Desktop-first column layouts clip content on mobile screens, making links hard to tap.

## Validation

Cara memverifikasi kepatuhan penggunaan `interactive-portfolio`:

1. **Verify viewport meta tag exists:**
   Ensure HTML layouts map viewport tags:
   ```bash
   grep -rn "viewport" src/
   ```
2. **Scan for mailto links:**
   Ensure contact CTA channels exist:
   ```bash
   grep -rn "mailto:" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mendesain portofolio:

> "Use the skill `interactive-portfolio`. Read `.agent/skills/interactive-portfolio/SKILL.md` before coding. Never hide main content behind slow, non-skippable loaders. Always define viewport scaling tags, place direct mailto contact CTAs across layout sections, use metrics-driven project descriptions, and link to source code."

## Related

- [scroll-experience](../scroll-experience/SKILL.md) — Viewport triggered reveals.
- [3d-web-experience](../3d-web-experience/SKILL.md) — 3D element rendering bounds.
