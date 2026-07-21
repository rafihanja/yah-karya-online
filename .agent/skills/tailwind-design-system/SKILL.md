---
name: tailwind-design-system
description: Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.
risk: safe
source: "Elite Agent Operations - Batch 3D (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Tailwind Design System

> **One-liner:** Guidelines for constructing design system tokens, theming schemas, component variants, and accessibility layouts using Tailwind CSS.

## When to Use

- When configuring global themes, color configurations, and layout variables inside `tailwind.config.js` or CSS files.
- When creating unified responsive component libraries with dynamic focus styles, dark-modes, and glass layers.
- When organizing utility classes into clean reusable classes using standard CSS parameters.

## Why This Exists

Scaling a frontend codebase without a unified design system leads to styling inconsistencies and bloated CSS files. If developers write custom margins, arbitrary colors, or inconsistent rounded values on every page, interfaces look mismatched. Enforcing standard Tailwind theme extensions, configuring accessible color tokens, and separating layout variants keeps style controls cohesive.

## ALWAYS DO THIS

- **Extend theme parameters dynamically** — Extend configurations (colors, font-scales, animations) inside the Tailwind theme settings instead of overriding default properties directly.
- **Use standard semantic prefix variables** — Define semantic utility classes (e.g. `bg-primary`, `text-secondary`, `border-muted`) to ensure consistent theming.
- **Implement focus outline classes for accessibility** — Add explicit focus rings classes (e.g. `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`) to all button elements.
- **Enforce theme-controlled dark mode** — Structure dark mode styling using the `dark:` prefix class selectors (e.g. `bg-white dark:bg-slate-950`).
- **Leverage spacing tokens instead of arbitrary values** — Restrict layout dimensions to defined Tailwind sizes (e.g. `p-4` / `gap-8`) instead of using arbitrary configurations (like `p-[17px]`).

## NEVER DO THIS

- ❌ **DO NOT** use arbitrary color values directly inside layouts (e.g. `text-[#F03E3E]` = ❌). **Why fails:** Disables token mapping, making global color palette swaps impossible. **Instead:** Register the custom color in the configuration file and reference it by name (e.g. `text-red-coral`).
- ❌ **DO NOT** use the `@apply` directive to write large component bundles in CSS. **Why fails:** Bloats the final CSS bundle size and defeats the purpose of utility class trees. **Instead:** Rely on utility classes in component code or extract styles into distinct React components.
- ❌ **DO NOT** hardcode fixed theme text sizes without applying line-height properties. **Why fails:** Causes line overlaps when text wraps on narrow viewports. **Instead:** Define text sizes with paired leading rates (e.g. `text-xl/normal` or `text-2xl/leading-relaxed`).
- ❌ **DO NOT** override core layout structures synchronously. **Why fails:** Breaks native layouts, causing element clipping. **Instead:** Apply fluid flexbox or grid layouts.

---

## Tailwind Theming Architecture Pipeline

Extending layout tokens and styling properties through configuration files:

```
[tailwind.config.js (Theme Tokens)] ──> [globals.css (Base Styles)] ──> [Semantic Classes] ──> [Utility Variants]
```

---

## Examples

### ✅ Good — Extended Theme Configuration and Variant Component Layouts

#### 1. Tailwind Configuration File (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 1. Extend theme tokens dynamically instead of overriding cores
      colors: {
        brand: {
          50: "#f5f3ff",
          500: "#6366f1",
          900: "#312e81",
        },
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
      },
      borderRadius: {
        premium: "1.25rem", // Custom unified design system radius
      },
    },
  },
  plugins: [],
};
```

#### 2. Reusable Button Component with Variants (`components/Button.tsx`)
```tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  // Define variant combinations using unified Tailwind utility tokens
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-premium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none";
  
  const variantStyles = {
    primary: "bg-brand-500 text-white hover:bg-brand-900 shadow-sm shadow-brand-500/10",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

Why this passes: Extends theme color parameters safely, configures semantic name mappings (brand, primary), formats variants cleanly using class combinations, and applies accessibility-compliant focus outline styling.

### ❌ Bad — Hardcoded Colors, Insecure Focus States, and Over-applied Apply Commands

```css
/* ERROR 1: Overuse of @apply to write traditional CSS files */
.btn-primary {
  @apply bg-[#6366f1] text-white px-5 py-2; 
  /* ERROR 2: Hardcoded arbitrary color in CSS file bypassed the config */
  border: 1px solid #312e81; 
  outline: none; /* ERROR 3: Removing outline breaks keyboard accessibility */
}
```

Why this fails: Overuses `@apply` to reconstruct monolithic classes in CSS files, bypasses theme tokens using raw arbitrary colors, and removes default browser outlines without replacing them with focus-ring styling.

---

## Failure Modes

- **The Arbitrary Value Overuse:** Using inline arbitrary variables (`bg-[#6366f1]`) instead of extending the config, breaking theming systems.
- **The Inaccessible Outline Hide:** Setting `outline: none` without configuring focus rings, locking keyboard users out.
- **The CSS Bloat @apply:** Recreating traditional stylesheet hierarchies using `@apply` commands, generating duplicate output.
- **The Text Clipping Overlap:** Specifying text scale tokens (`text-3xl`) without adjusting line height (`leading`) parameters.
- **The Dark Mode Static Fallback:** Hardcoding neutral backgrounds (`bg-white`) without writing dark mode classes (`dark:bg-slate-950`).
- **The Custom Scale Overwrite:** Replacing the default theme namespace instead of using the `extend` key, losing access to core utilities.

## Validation

Verify configuration boundaries, focus rings, and arbitrary style parameters:

1. **Verify that arbitrary color declarations are avoided:**
   Find inline color hashes in component files:
   ```bash
   grep -rn "bg-\[#\|text-\[#" src/ 2>/dev/null
   # expected: zero matches. Layouts reference configured theme colors.
   ```
2. **Scan for outline: none settings without focus rings:**
   Identify inaccessible elements:
   ```bash
   grep -rn "outline-none" src/ | grep -v "focus-visible" 2>/dev/null
   # expected: Elements containing outline-none declarations apply focus-visible ring styles.
   ```
3. **Verify correct theme extend structures:**
   Ensure configurations extend rather than wipe core layout variables:
   ```bash
   grep -rn "extend:" tailwind.config.js 2>/dev/null
   # expected: Custom definitions reside inside extend blocks.
   ```
4. **Identify layout-level database calls:**
   Ensure layout files don't run excessive queries.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan penataan Tailwind CSS:

> "Use the skill `tailwind-design-system`. Read `.agent/skills/tailwind-design-system/SKILL.md` before coding. Never write arbitrary hex values in components or override baseline config namespaces. Always configure extend configurations, semantic names, and focus rings."

## Related

- [tailwind-patterns](../tailwind-patterns/SKILL.md) — Tailwind CSS styling configurations.
- [design-taste-frontend](../design-taste-frontend/SKILL.md) — Front-end visual structures.
- [shadcn](../shadcn/SKILL.md) — Component integration standards.
