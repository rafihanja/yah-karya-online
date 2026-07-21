---
name: shadcn
description: Manages shadcn/ui components and projects, providing context, documentation, and usage patterns for building modern design systems.
risk: safe
source: "Elite Agent Operations - Batch 3D (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# shadcn/ui Design System Integration

> **One-liner:** Guidelines for initializing shadcn/ui components, composing compound Radix UI elements, and customizing layouts using CSS theme tokens.

## When to Use

- When adding new interactive components (dialogs, select selectors, inputs groups) from the shadcn registry via CLI commands.
- When customizing spacing, icons positioning, or states in existing `components/ui/` files.
- When configuring theme color tokens (`--background`, `--primary`) within global CSS files.

## Why This Exists

Unlike traditional monolithic component libraries installed as package dependencies, shadcn/ui installs components as raw source code. This grants developers complete control over the layout files but demands strict composition standards. If developers wrap triggers inside nested elements without using the Radix `asChild` prop, browser clicks fail. Similarly, omitting accessibility title parameters in portals like sheets triggers screen-reader errors.

## ALWAYS DO THIS

- **Enforce Radix asChild configurations on custom triggers** — Add the `asChild` prop to triggers when nesting custom buttons (e.g. `<DialogTrigger asChild><Button>...</Button></DialogTrigger>`) to prevent duplicate wrapper nodes.
- **Provide semantic labels on overlay components** — Ensure all overlay components (`Dialog`, `Sheet`, `Drawer`) contain a descriptive title element (`DialogTitle` / `SheetTitle`) for accessibility.
- **Group layout parameters using Flexbox gaps** — Use Tailwind gap utilities (`gap-4`) instead of deprecated spacer commands (like `space-y-4`) to structure spacing.
- **Define fallback options in dynamic avatars** — Set an `AvatarFallback` node inside all avatar configurations to handle image load exceptions gracefully.
- **Use the package runner to install components** — Execute CLI commands matching the workspace package manager (e.g. `npx shadcn@latest add button`).

## NEVER DO THIS

- ❌ **DO NOT** install components as external npm dependencies or attempt to edit source code inside `node_modules` paths. **Why fails:** Components are designed to be copied directly into the project repository (usually under `@/components/ui/`). **Instead:** Invoke the CLI generator and modify files inside the workspace.
- ❌ **DO NOT** use inline arbitrary values to override component color schemes (e.g. `className="bg-[#2dd4bf]"` = ❌). **Why fails:** Disables theme mapping, breaking dark mode integrations. **Instead:** Reference configured design tokens (e.g. `bg-primary` or custom color variables).
- ❌ **DO NOT** apply dimensions utility sizing to icons nested inside buttons. **Why fails:** Icons size parameters (e.g. `w-4 h-4`) conflict with components styling variables. **Instead:** Use the `data-icon` attribute (e.g. `data-icon="inline-start"`) to handle sizing automatically.
- ❌ **DO NOT** override layout heights or positioning values using `!important` flags. **Why fails:** Blocks variant configurations, leading to styling regressions. **Instead:** Modify the source component code or configure custom theme tokens.

---

## shadcn CLI & Integration Pipeline

Adding and composing local design system primitives safely:

```
[npx shadcn search] ──> [npx shadcn add] ──> [Verify components/ui/ Code] ──> [Radix compound composition]
```

---

## Examples

### ✅ Good — Compound Dialog Composition, asChild Triggers, and Semantic Colors

#### 1. Accessible Compound Dialog Component (`components/ConfirmDeleteModal.tsx`)
```tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

export function ConfirmDeleteModal() {
  return (
    <Dialog>
      {/* 1. Use asChild to transfer click events directly to the child Button */}
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete Item
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          {/* 2. Accessible DialogTitle required for screen readers */}
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </DialogDescription>
        </DialogHeader>
        
        {/* 3. Spacing structured using flex gap layout */}
        <DialogFooter className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Confirm Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

Why this passes: Configures compound components using nested Radix triggers, applies `asChild` to transfer event handlers correctly, declares an accessible `DialogTitle`, uses flex layouts with `gap-2` for spacing, and references semantic button colors (`destructive`).

### ❌ Bad — Insecure Triggers nesting, Missing Titles, and Arbitrary Override Spacing

```tsx
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BadModal() {
  return (
    <Dialog>
      {/* ERROR 1: Missing asChild triggers layout wrapping error & click traps */}
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>

      {/* ERROR 2: Missing DialogTitle/DialogDescription triggers accessibility warnings */}
      <DialogContent className="space-y-4"> 
        {/* ERROR 3: Deprecated space-y utility class */}
        <p>Confirm operations below</p>
        
        {/* ERROR 4: Arbitrary background override */}
        <div className="bg-[#FF0000] p-4">Danger Zone</div> 
      </DialogContent>
    </Dialog>
  );
}
```

Why this fails: Omits the `asChild` prop on `DialogTrigger` when wrapping a interactive button component, lacks accessible titles/descriptions inside `DialogContent`, uses deprecated `space-y-4` layout classes, and uses hardcoded arbitrary hex properties (`bg-[#FF0000]`).

---

## Failure Modes

- **The Duplicate Trigger Click:** Omitting the `asChild` prop on triggers, wrapping buttons in extra interactive elements.
- **The Silent Accessibility Audit:** Omitting titles inside sheets or dialogs, triggering screen-reader validation blocks.
- **The space-y Flex Collapse:** Using deprecated `space-y` classes inside flexbox layouts, causing layout alignment failures.
- **The Icon Sizing Conflict:** Applying custom sizing classes (`size-4`) to buttons icons, conflicting with native stylings.
- **The Stale Registry Override:** Overwriting a component using the CLI without checking local diffs, erasing customizations.
- **The node_modules Edit:** Modifying UI component styles inside `node_modules` instead of local project directories.

## Validation

Verify configuration boundaries, trigger configurations, and accessibility structures:

1. **Verify that dialog structures declare Title elements:**
   Check for DialogTitle declarations:
   ```bash
   grep -rn "<DialogContent" src/ -A 5 | grep -v "DialogTitle" 2>/dev/null
   # expected: zero matches. All DialogContent portals contain DialogTitle elements.
   ```
2. **Scan for DialogTrigger wrappers lacking asChild:**
   Identify nesting violations:
   ```bash
   grep -rn "<DialogTrigger" src/ | grep -v "asChild" 2>/dev/null
   # expected: zero matches. Dialog triggers nesting custom buttons configure asChild.
   ```
3. **Verify correct spacer usage:**
   Ensure flex directories avoid deprecated classes:
   ```bash
   grep -rn "space-y-" src/ 2>/dev/null
   # expected: Spacing parameters utilize flex layouts with gap-n.
   ```
4. **Identify arbitrary styling class overrides:**
   Ensure component directories are placed within src.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan shadcn/ui:

> "Use the skill `shadcn`. Read `.agent/skills/shadcn/SKILL.md` before coding. Never import components as npm libraries or bypass asChild decorators on nested triggers. Always verify DialogTitle declarations, flex gap layouts, and local diff files."

## Related

- [tailwind-design-system](../tailwind-design-system/SKILL.md) — CSS variables parameters.
- [ui-a11y](../ui-a11y/SKILL.md) — Accessibility compliance models.
- [react-nextjs-development](../react-nextjs-development/SKILL.md) — Client-side boundary rules.
