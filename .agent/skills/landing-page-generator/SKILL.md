---
name: landing-page-generator
description: Generates high-converting Next.js/React landing pages with Tailwind CSS. Uses PAS, AIDA, and BAB frameworks for optimized copy/components (Heroes, Features, Pricing). Focuses on Core Web Vitals/SEO.
risk: safe
source: "Elite Agent Operations - Batch 3G (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Conversion Landing Page Engineering

> **One-liner:** Guidelines for constructing high-converting landing pages using copy frameworks (PAS, AIDA, BAB) and optimizing Core Web Vitals.

## When to Use

- When building customer-facing landing pages, marketing funnels, or SaaS product checkout paths.
- When applying structural copy frameworks (PAS: Problem-Agitate-Solution, AIDA: Attention-Interest-Desire-Action, BAB: Before-After-Bridge).
- When optimizing layouts to meet strict Core Web Vitals targets (TTFB < 200ms, LCP < 1.2s, CLS < 0.1).

## Why This Exists

Marketing landing pages are the primary entry point for converting visitors into customers. If pages load slowly, display layout shifts during rendering, or rely on vague copy (like "Learn more"), conversion rates drop significantly. Enforcing structural copy frameworks, preloading hero assets, setting explicit image dimensions to prevent layout shifts, and positioning CTAs clearly above the fold ensures landing pages load instantly and convert visitors effectively.

## ALWAYS DO THIS

- **Structure copy using structured frameworks** — Apply PAS, AIDA, or BAB frameworks consistently to guide users from pain points to solutions.
- **Preload above-the-fold hero images** — Set the `priority` attribute on hero images to ensure they load early and reduce Largest Contentful Paint (LCP) times.
- **Set explicit dimensions on media placeholders** — Define static width/height ratios on all images to prevent Cumulative Layout Shift (CLS).
- **Position primary CTAs above the fold** — Ensure primary action buttons are visible on mobile screens (under 768px) without requiring vertical scrolling.
- **Inject structured JSON-LD schemas** — Embed FAQPage, Product, or Organization structured schemas to improve search engine indexing.

## NEVER DO THIS

- ❌ **DO NOT** use vague copy on primary call-to-action buttons (e.g. "Submit", "Sign Up", or "Learn More" = ❌). **Why fails:** Vague copy fails to communicate immediate value, lowering conversion rates. **Instead:** Use active, benefit-driven copy (e.g. "Start Free Trial" or "Get Instant Access").
- ❌ **DO NOT** defer loading above-the-fold layout assets. **Why fails:** Increases LCP times, leading to user abandonment. **Instead:** Preload hero images and prioritize critical stylesheets.
- ❌ **DO NOT** use centered hero layouts for dense, feature-heavy SaaS pages. **Why fails:** Overcrowds the viewport and limits the space available for visual proof points. **Instead:** Use asymmetric split-screen layouts.
- ❌ **DO NOT** import heavy third-party tracking scripts synchronously in the document header. **Why fails:** Blocks initial page rendering, increasing TTFB and TBT. **Instead:** Load tracking scripts asynchronously or defer them until user interaction.

---

## Landing Page Optimization & SEO Pipeline

Applying frameworks, optimizing media loading, and verifying metadata:

```
[Copy Framework (PAS/AIDA)] ──> [Asymmetric Split Layout] ──> [Preloaded Hero Asset] ──> [JSON-LD Schema Integration]
```

---

## Examples

### ✅ Good — PAS Copy, Preloaded Hero, and Structured Schema Mappings

#### 1. High-Converting Hero Section Component (`components/HeroSplit.tsx`)
```tsx
import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HeroSplit() {
  // 1. Copy structured using PAS (Problem-Agitate-Solution) framework
  return (
    <section className="relative min-h-[90dvh] flex items-center bg-slate-950 px-6 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs text-sky-400 font-medium">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
            Integrates with your existing workflow
          </div>
          
          {/* PROBLEM H1: Highlight the visitor's pain point */}
          <h1 className="mt-6 font-sans text-4xl md:text-6xl font-bold tracking-tight text-white leading-none">
            Stop losing leads to slow loading pages.
          </h1>
          
          {/* AGITATE Paragraph: Emphasize the cost of not solving the problem */}
          <p className="mt-6 text-lg text-slate-400 max-w-[50ch] leading-relaxed">
            Every second of delay costs you 7% in conversions. Your competitors are already optimizing. Stop wasting ad spend on sluggish layouts.
          </p>
          
          {/* SOLUTION Actions: Clear value-driven CTA above the fold */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 active:scale-98 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-200 focus:outline-none min-h-[44px]">
              Start Optimizing Free
              <ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-sm transition-all duration-200 focus:outline-none min-h-[44px]">
              See Speed Proof
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-sky-500" />
            <span>No credit card required • Instant setup</span>
          </div>
        </div>

        {/* Right Column: Visual Preloaded Image */}
        <div className="lg:col-span-5 relative w-full aspect-[4/3] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://picsum.photos/seed/dashboard/800/600"
            alt="Product Analytics Dashboard"
            className="w-full h-full object-cover"
            /* 2. Explicit markup instructs the browser to preload above-the-fold assets */
            loading="eager"
          />
        </div>

      </div>
    </section>
  );
}
```

Why this passes: Structures copy using the PAS framework, uses active, benefit-driven CTA button text, positions critical actions above the fold, and preloads the hero image using the `loading="eager"` attribute.

### ❌ Bad — Center-Aligned Cliché, Vague CTAs, and Non-Preloaded Images

```tsx
// ERROR 1: Centered hero with generic, benefit-free headline
export function BadHero() {
  return (
    <section className="py-20 text-center bg-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-serif text-gray-900">
          Welcome to our site! 
        </h1>
        <p className="mt-4 text-gray-600">
          We provide high-quality services for global clients worldwide.
        </p>

        {/* ERROR 2: Vague CTA text fails to communicate immediate value */}
        <button className="mt-6 px-4 py-2 bg-blue-600 text-white">
          Learn More
        </button>

        {/* ERROR 3: Lazy loading above-the-fold images increases LCP */}
        <img
          src="/dashboard.png"
          alt="dashboard"
          loading="lazy" 
        />
      </div>
    </section>
  );
}
```

Why this fails: Uses a centered layout with a generic headline, features vague CTA text ("Learn More"), and delays initial rendering by lazy loading an above-the-fold image.

---

## Failure Modes

- **The client:load Abuse:** Setting immediate loading directives on all components, erasing Astro's performance benefits.
- **The Static Secret Leak:** Storing private access keys inside static page compilers, rendering keys into static HTML files.
- **The Media Load Overhead:** Hiding a framework component using CSS media queries while loading it on unneeded device viewports.
- **The getStaticPaths Omission:** Triggering compilation failures by omitting static path resolver exports on dynamic pages.
- **The Raw Template Injection XSS:** Injecting unverified html inputs using the `set:html` attribute, creating security vulnerabilities.

## Validation

Verify copy structures, CTA labels, and image loading strategies:

1. **Verify that above-the-fold images are preloaded:**
   Check image loading attributes in hero components:
   ```bash
   grep -rn "loading=" src/components/Hero 2>/dev/null
   # expected: Above-the-fold images use eager loading configurations.
   ```
2. **Scan for vague CTA labels:**
   Ensure action buttons use benefit-driven text:
   ```bash
   grep -rn "Learn More\|Click Here\|Submit" src/ 2>/dev/null
   # expected: zero matches. Action buttons communicate clear benefits.
   ```
3. **Verify presence of structured schema definitions:**
   Check for JSON-LD schema blocks in pages:
   ```bash
   grep -rn "application/ld+json" src/pages/ 2>/dev/null
   # expected: Landing pages include structured organization or product schemas.
   ```
4. **Identify arbitrary layout parameters:**
   Ensure widths and paddings conform to standard spacing scales.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun halaman landing:

> "Use the skill `landing-page-generator`. Read `.agent/skills/landing-page-generator/SKILL.md` before coding. Never use vague CTA copy or lazy load above-the-fold images. Always structure layouts with copy frameworks (PAS/AIDA), preload hero assets, and include JSON-LD schemas."

## Related

- [seo-fundamentals](../seo-fundamentals/SKILL.md) — Tag hierarchies and metadata.
- [ui-ux-designer](../ui-ux-designer/SKILL.md) — 8px spacing scales.
- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Visual alignment guidelines.
