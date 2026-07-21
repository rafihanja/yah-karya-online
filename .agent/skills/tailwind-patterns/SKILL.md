---
name: tailwind-patterns
description: Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design token architecture.
risk: safe
source: "Elite Agent Operations - Batch 3D (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Tailwind CSS v4 Patterns

> **One-liner:** Guidelines for utilizing Tailwind CSS v4 features, declaring CSS-first theme configurations via `@theme`, and implementing container queries.

## When to Use

- When building interfaces in modern codebases utilizing Tailwind CSS v4.
- When configuring theme variables inside the primary CSS entrypoint (e.g. `global.css`) instead of legacy config files.
- When designing responsive widgets that scale based on container dimensions rather than viewport sizes.

## Why This Exists

Tailwind CSS v4 introduces a CSS-first configuration engine, replacing the JavaScript-based config files with CSS `@theme` declarations. If developers continue using legacy JavaScript configuration models or rely exclusively on viewport media queries (`md:`, `lg:`), reusable components will break when nested inside sidebar columns or modals. Enforcing container queries (`@container`), structural `@theme` tokens, and semantic grouping of classes keeps styling clean and responsive.

## ALWAYS DO THIS

- **Declare design tokens in CSS files using @theme directives** — Extend color parameters, typography scales, and keyframes inside CSS entrypoints using `@theme` blocks.
- **Implement container queries for reusable widgets** — Wrap cards or profile elements in `@container` scopes and scale layouts using container breakpoint modifiers (e.g. `@md:flex-row`).
- **Group utility classes logically** — Organize classes in markup following standard priority ordering: layout $\rightarrow$ spacing $\rightarrow$ typography $\rightarrow$ visuals $\rightarrow$ animations $\rightarrow$ interactivity.
- **Enforce theme variables via native CSS properties** — Read extended values inside custom stylesheet routines using standard CSS `var()` declarations mapping to extended theme keys.
- **Combine modifier states consistently** — Order modifier states predictably (e.g. `hover:dark:bg-indigo-600` or `focus:disabled:opacity-50`) to keep markup legible.

## NEVER DO THIS

- ❌ **DO NOT** use legacy JavaScript configurations (`tailwind.config.js` = ❌) in projects running pure Tailwind CSS v4. **Why fails:** The v4 engine bypasses JS config resolution, causing theme extensions to fail silently. **Instead:** Write custom variables directly inside `@theme` blocks inside the main CSS file.
- ❌ **DO NOT** use viewport media queries (`md:`, `lg:` = ❌) for leaf widgets designed for nesting. **Why fails:** Viewport queries scale according to browser window width, causing layout collapse when the widget is nested in a narrow grid or sidebar. **Instead:** Query the containing wrapper size using `@container`.
- ❌ **DO NOT** use complex negative margins or translate values to align layouts. **Why fails:** Breaks baseline document layouts, leading to layout shifts on dynamic screens. **Instead:** Structure spacing using Flexbox, CSS Grid, and gap properties.
- ❌ **DO NOT** apply raw hex properties inside class overrides (e.g. `bg-[#123456]` = ❌). **Why fails:** Breaks dark mode mappings and theme integrity. **Instead:** Register the custom color within `@theme` blocks and invoke it semantic-style.

---

## Tailwind v4 CSS-First Pipeline

Configuring and applying design system variables directly within CSS files:

```
[global.css (@theme)] ──> [Component Container (@container)] ──> [Container breakpoints (@md:grid-cols-2)]
```

---

## Examples

### ✅ Good — CSS-First Configuration and Container Queries Scaling

#### 1. Tailwind v4 CSS Theme Entry Point (`src/global.css`)
```css
@import "tailwindcss";

/* 1. Declare theme configuration variables using CSS-first syntax */
@theme {
  --color-brand-mint: #2dd4bf;
  --color-brand-deep: #115e59;
  
  --font-display: "Outfit", sans-serif;
  
  --animate-float: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
}
```

#### 2. Reusable Card Component with Container Sizing (`components/UserCard.tsx`)
```tsx
import React from "react";

interface UserCardProps {
  name: string;
  role: string;
  imageUrl: string;
}

export function UserCard({ name, role, imageUrl }: UserCardProps) {
  return (
    /* Define container query context at the parent node */
    <div className="@container w-full">
      {/* 
        Semantic Grouping Order:
        1. Layout: flex flex-col items-center
        2. Spacing: p-6 gap-4
        3. Visuals: rounded-2xl bg-white/50 border border-slate-200
        4. Container Query responsive behavior: @md:flex-row @md:p-8
      */}
      <div className="flex flex-col items-center p-6 gap-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:border-teal-500 @md:flex-row @md:p-8 @md:gap-6">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-full border-2 border-teal-500 object-cover animate-float"
        />
        
        {/* Align text elements based on container breakpoints */}
        <div className="text-center @md:text-left">
          <h4 className="font-display text-lg font-bold text-slate-900">{name}</h4>
          <p className="text-sm font-medium text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}
```

Why this passes: Configures theme variables utilizing the new Tailwind v4 CSS-first `@theme` syntax, defines container query boundaries, uses container breakpoints (`@md:flex-row`), and structures spacing logically.

### ❌ Bad — Legacy JS Configs, Viewport Query Dependencies, and Arbitrary Sizing

```tsx
// ERROR 1: Component scales layout based on viewport queries (causes collapse in sidebars)
export function BadCard({ name, role }: any) {
  return (
    /* ERROR 2: Viewport query md:flex-row fails when nested in a narrow side column */
    <div className="flex flex-col md:flex-row items-center p-[20px] bg-[#115e59]">
      {/* ERROR 3: Hardcoded arbitrary padding (p-[20px]) and hex colors (bg-[#115e59]) */}
      <div>
        <h3>{name}</h3>
        <p>{role}</p>
      </div>
    </div>
  );
}
```

Why this fails: Scales component logic using viewport query tags (`md:`), maps properties to arbitrary values (`p-[20px]`, `bg-[#115e59]`), and lacks container query configurations.

---

## Failure Modes

- **The Legacy JS Config Trap:** Writing `tailwind.config.js` settings in a v4 codebase, causing extensions to be ignored.
- **The Sidebar Viewport Collapse:** Using viewport query modifiers (`md:`) inside sidebar widgets, resulting in squashed layouts.
- **The Arbitrary Value Overdose:** Massively applying arbitrary hashes (`text-[#115e59]`) instead of extending the theme.
- **The Class Soup Clutter:** Mixing typography, layout, and interactivity utility tags in a random order.
- **The Missing Container Context:** Applying container query breakpoint triggers (`@md:`) without declaring the parent context class (`@container`).

## Validation

Verify CSS definitions, container queries, and class groupings:

1. **Verify that tailwind.config.js is omitted in v4 project directories:**
   Scan directory for legacy JavaScript configuration files:
   ```bash
   find . -maxdepth 2 -name "tailwind.config.js" 2>/dev/null
   # expected: v4 directories omit legacy configuration scripts.
   ```
2. **Scan for container query usage:**
   Check components for container modifiers:
   ```bash
   grep -rn "@container" src/ 2>/dev/null
   # expected: Nested reusable components declare parent container scopes.
   ```
3. **Verify CSS theme extensions syntax:**
   Verify main CSS files declare variables within `@theme` blocks:
   ```bash
   grep -rn "@theme" src/ 2>/dev/null
   # expected: Custom theme keys are declared inside CSS-first @theme structures.
   ```
4. **Identify arbitrary styling class overrides:**
   Ensure components don't include unconfigured arbitrary hex codes.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Tailwind CSS v4:

> "Use the skill `tailwind-patterns`. Read `.agent/skills/tailwind-patterns/SKILL.md` before coding. Never use tailwind.config.js in v4 projects or query viewports for nested leaf components. Always configure theme properties via CSS @theme blocks, declare @container contexts, and group utilities logically."

## Related

- [tailwind-design-system](../tailwind-design-system/SKILL.md) — Design tokens configurations.
- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Typography scales.
- [shadcn](../shadcn/SKILL.md) — Modular components integration.
