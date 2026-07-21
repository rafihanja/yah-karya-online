---
name: design-taste-frontend
description: Use when building high-agency frontend interfaces with strict design taste, calibrated color, responsive layout, and motion rules.
risk: safe
source: "Elite Agent Operations - Batch 3D (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# High-Agency Frontend Design Standard

> **One-liner:** Non-negotiable visual, spacing, typography, and motion guidelines to override generic AI coding biases and build premium interfaces.

## When to Use

- When reviewing or authoring high-end user interfaces (Hero sections, bento grids, pricing pages).
- When configuring visual physics parameters (Framer Motion spring rates, staggered reveals).
- When determining design layouts (combating centered grid blocks, card fatigue, or oversaturated neon glow patterns).

## Why This Exists

Generic AI-generated layouts are easily recognizable by their reliance on centered text blocks, high-contrast purple/blue gradients, and boxed card container structures. These design clichés fail to convey brand premium quality. Enforcing offset layout layouts, desaturated custom color palettes, and motion spring physics (like avoiding linear animations in favor of weighty springs) ensures interfaces look highly refined and professional.

## ALWAYS DO THIS

- **Calibrate color palettes around absolute neutral bases** — Restrict accent color configurations to a single desaturated tone (saturation < 80%) overlaying slate, zinc, or charcoal bases.
- **Implement split-screen or asymmetric layout structures** — Break default center-alignment biases by left-aligning display typography or creating unbalanced content/asset panels.
- **Enforce spring-based motion curves over linear easing** — Apply custom spring physics parameter rates (e.g. `type: "spring", stiffness: 100, damping: 20`) to all interactive elements.
- **Secure mobile stability using dynamic viewports** — Apply dynamic viewport units (e.g. `min-h-[100dvh]`) for full-screen hero containers instead of `h-screen`.
- **Implement refraction glass borders** — Style translucent layers using thin, semi-transparent inner borders (`border-white/10`) and subtle inset shadows instead of plain borders.

## NEVER DO THIS

- ❌ **DO NOT** use default startup color palettes (such as high-contrast purple-to-blue text gradients or purple button glows = ❌). **Why fails:** Creates a generic, cliché "AI-designed startup" look. **Instead:** Use dark slate, deep emerald, electric teal, or warm neutral tones.
- ❌ **DO NOT** use generic card containers to group data inside information-dense screens (density > 7). **Why fails:** Overcrowds the interface, causing visual clutter. **Instead:** Group categories using negative spacing, thin top borders, or dividers (`divide-y`).
- ❌ **DO NOT** use emojis in code, typography layouts, alt descriptions, or text copy. **Why fails:** Degrades the professional tone of premium designs. **Instead:** Use vector SVG icons or premium icon sets (Radix, Phosphor).
- ❌ **DO NOT** animate layout height, width, top, or left properties directly. **Why fails:** Triggers continuous browser layout recalculations, causing frame drops on mobile. **Instead:** Animate using transform parameters (`scale`, `translate3d`, `opacity`).

---

## High-Agency Spacing & Color Calibration Pipeline

Enforcing layout offsets and material refraction filters across components:

```
[Zinc/Charcoal Base] ──> [Asymmetric Left-Align Grid] ──> [Spring Hover States] ──> [Refraction Glass Borders]
```

---

## Examples

### ✅ Good — Split Layout, Geist Typography, Spring Hover, and Glass Refraction

#### 1. Premium Split Feature Section Component (`components/FeatureHero.tsx`)
```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function FeatureHero() {
  return (
    /* 1. min-h-[100dvh] prevents mobile layout jumping */
    <section className="relative min-h-[100dvh] flex items-center bg-slate-950 px-6 py-20 overflow-hidden">
      {/* 2. Asymmetric left-aligned grid layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Text Block Content (Left-aligned, taking 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-400">
            System Architecture
          </span>
          <h1 className="mt-4 font-sans text-5xl md:text-7xl font-bold tracking-tight text-white leading-none">
            Designed to scale. <br /> Built to last.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-[50ch] leading-relaxed">
            Configure dynamic pipelines using our optimized core framework, completely free of generic layout constraints.
          </p>
          
          {/* Spring-based CTA button with edge refraction styling */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md focus:outline-none"
          >
            Get Started
            <ArrowRight size={16} weight="bold" />
          </motion.button>
        </div>

        {/* Visual Panel (Asymmetric display, taking 5 cols) */}
        <div className="lg:col-span-5 relative w-full aspect-square bg-gradient-to-tr from-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent_50%)]" />
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            {/* Visual content placeholder */}
            [System Visualization]
          </div>
        </div>

      </div>
    </section>
  );
}
```

Why this passes: Avoids centered hero bias in favor of asymmetric split layouts, uses `min-h-[100dvh]` to prevent mobile jumping, applies spring animation physics, implements custom color configurations (Teal accent on dark Slate), and uses a refraction border structure.

### ❌ Bad — Centered Cliché Hero, Purple Gradient Text, and h-screen Layouts

```tsx
// ERROR 1: Using h-screen causes layout glitches on iOS Safari browsers
export default function BadHero() {
  return (
    <section className="h-screen flex items-center justify-center bg-black text-center">
      <div>
        {/* ERROR 2: Generic centered layout layout */}
        {/* ERROR 3: Purple-to-blue text gradient is an overused AI design cliché */}
        <h1 className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent text-8xl font-serif">
          Unleash Next-Gen Power! 🚀 
          {/* ERROR 4: Emojis and filler words like 'Unleash' degrade tone */}
        </h1>
        
        {/* ERROR 5: Hardcoded box shadow and linear transition on button */}
        <button style={{ 
          boxShadow: "0 0 20px #8b5cf6", 
          transition: "0.2s linear" 
        }}>
          Get Started
        </button>
      </div>
    </section>
  );
}
```

Why this fails: Hardcodes `h-screen`, centers the layout, uses an overused purple-to-blue gradient, includes emojis and generic copy, uses custom linear animation parameters, and styles a solid neon shadow.

---

## Failure Modes

- **The Center Alignment Trap:** Defaulting to center-aligned text layouts inside hero sections, creating a generic design.
- **The Purple Neon Glow:** Applying purple-to-blue text gradients and glow borders on buttons.
- **The h-screen Mobile Jump:** Using `h-screen` for full-page wrappers, causing content shifts on mobile.
- **The Emoji Code Injection:** Using emojis inside text copy, placeholders, or button labels.
- **The Card Grid Fatigue:** Boxing all dashboard metrics inside generic card wraps, creating visual clutter.
- **The Linear Animation Slide:** Using linear animation rates instead of custom weighty spring parameters.

## Validation

Verify layout structures, color configurations, and viewport units:

1. **Verify that full-screen containers avoid h-screen:**
   Find `h-screen` occurrences in component files:
   ```bash
   grep -rn "h-screen" src/ 2>/dev/null
   # expected: zero matches. Layouts use min-h-[100dvh] for viewport sizing.
   ```
2. **Scan for color gradient text clichés:**
   Ensure text gradients do not use purple-to-blue combinations:
   ```bash
   grep -rn "from-purple-" src/ | grep "to-blue-" 2>/dev/null
   # expected: zero matches. Color selections are calibrated and clean.
   ```
3. **Verify presence of spring animation parameters:**
   Check motion configurations:
   ```bash
   grep -rn "transition={" src/ -A 5 | grep -i "spring"
   # expected: Interactive components use spring physics animation parameters.
   ```
4. **Identify emoji indicators in text:**
   Confirm code files contain zero emojis.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menerapkan desain beresolusi tinggi:

> "Use the skill `design-taste-frontend`. Read `.agent/skills/design-taste-frontend/SKILL.md` before coding. Never write centered layouts with purple-to-blue gradients or h-screen containers. Always enforce asymmetric layouts, desaturated neutrals, spring transitions, and zero emojis."

## Related

- [frontend-design](../frontend-design/SKILL.md) — Spacing system guidelines.
- [tailwind-design-system](../tailwind-design-system/SKILL.md) — Config theme variables.
- [baseline-ui](../baseline-ui/SKILL.md) — Visual alignment audits.
