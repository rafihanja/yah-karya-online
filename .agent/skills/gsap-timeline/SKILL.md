---
name: gsap-timeline
description: Official GSAP skill for timelines — sequencing animations, position parameters, defaults, and labels.
risk: medium (nested triggers and animation conflicts)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# GSAP Timeline

> **One-liner:** Container for choreographing multiple tweens in sequence, overlap, or parallel with complete playback control.

## When to Use

- When building multi-step or sequenced animations where timing depends on previous steps.
- When coordinating multiple elements (e.g. staggering entry animations, custom text effects, or multidimensional parallax).
- When a complex scroll-driven sequence needs to be driven by a single `ScrollTrigger`.

## Why This Exists

Chaining separate animations using manual `delay` properties makes the code extremely fragile, hard to maintain, and prone to desynchronization. If the duration of one step changes, all subsequent delays must be recalculated manually. A `gsap.timeline()` provides a centralized playback head, allowing animations to inherit default configurations and be positioned relative to each other or labels seamlessly.

## ALWAYS DO THIS

- **Use the position parameter** — Use relative position strings (`"<"`, `">"`, `"+=0.5"`, `"-=0.2"`) to control timing instead of absolute numbers when elements need to coordinate.
- **Pass defaults to the timeline** — Set properties shared by children (e.g., `defaults: { duration: 0.5, ease: "power2.out" }`) in the timeline constructor to avoid redundant code.
- **Use labels for major checkpoints** — Use `tl.addLabel("labelName")` to mark checkpoints, making the timeline readable and allowing seeking to specific states.
- **Attach ScrollTrigger only to the timeline** — Put the `scrollTrigger` config object on the timeline constructor itself, never on individual child tweens within the timeline.
- **Kill timelines on component unmount** — Always clean up timelines using `.kill()` or context reversion (`useGSAP` or `gsap.context()`) to prevent orphaned timelines from consuming CPU.

## NEVER DO THIS

- ❌ **DO NOT** use `setTimeout` or manual `delay: X` in individual tweens to orchestrate sequences. **Why fails:** Leads to fragile timing structures that break easily during maintenance or frame drops. **Instead:** Use `gsap.timeline()` and position parameters.
- ❌ **DO NOT** nest a tween or timeline that has its own `ScrollTrigger` inside a parent timeline. **Why fails:** Causes conflict of control over the playhead, resulting in glitches, broken start/end coordinates, and jumping animations. **Instead:** Keep ScrollTrigger only at the top-level timeline.
- ❌ **DO NOT** recreate timelines inside high-frequency loops, resize events, or React render paths. **Why fails:** Causes severe memory leaks, CPU spikes, and duplicate conflicting animations running concurrently. **Instead:** Instantiate the timeline once in setup hooks (e.g., `useGSAP` with empty dependency array) and store its reference.

## Examples

### ✅ Good — Structured Sequence with Defaults and Labels

```javascript
import gsap from "gsap";

export function initEntranceAnimation() {
  const tl = gsap.timeline({
    defaults: { duration: 0.6, ease: "power3.out" }
  });

  tl.addLabel("start")
    .from(".hero-bg", { scale: 1.1, opacity: 0 })
    .from(".hero-title", { y: 30, opacity: 0 }, "<0.2") // Starts 0.2s after .hero-bg starts
    .from(".hero-desc", { y: 20, opacity: 0 }, "<0.2")  // Starts 0.2s after .hero-title starts
    .addLabel("interactive", "+=0.1")
    .from(".hero-cta", { scale: 0.8, opacity: 0, ease: "back.out(1.7)" }, "interactive");

  return tl;
}
```

Why this passes: Uses `defaults` to keep child tweens clean, establishes explicit labels, and structures overlapping steps using relative position strings (`<0.2`).

### ❌ Bad — Hardcoded Delays and Unmanaged Sequence

```javascript
import gsap from "gsap";

export function badAnimation() {
  // Fragile: manual delays instead of a timeline
  gsap.from(".hero-bg", { scale: 1.1, opacity: 0, duration: 0.6 });
  
  // If the background duration changes, these delays become incorrect
  gsap.from(".hero-title", { y: 30, opacity: 0, duration: 0.6, delay: 0.2 });
  gsap.from(".hero-desc", { y: 20, opacity: 0, duration: 0.6, delay: 0.4 });
  gsap.from(".hero-cta", { scale: 0.8, opacity: 0, duration: 0.6, delay: 0.7 });
}
```

Why this fails: Lacks a centralized timeline container, making it impossible to control playback (e.g. pause, reverse, restart) and highly prone to timing mismatches.

## Creating and Controlling Timelines

### Timeline Options (constructor)
- **paused: true** — Creates the timeline paused; call `.play()` or seek to start.
- **repeat: -1** / **yoyo: true** — Loop the timeline infinitely, bouncing back and forth.
- **onComplete**, **onStart**, **onUpdate** — Timeline-level callbacks for orchestrating side effects.

### Position Parameter Cheat Sheet
- **`<`**: Starts when the **previous** tween starts (overlap).
- **`<=0.2`**: Starts 0.2s after the **previous** tween starts.
- **`>0.1`**: Starts 0.1s after the **previous** tween ends (gap).
- **`+=0.5`**: Starts 0.5s after the **entire timeline's** current end.
- **`"labelName"`**: Starts exactly at the specified label.

### Playback Methods
- **`tl.play()`** / **`tl.pause()`**
- **`tl.reverse()`** — Plays backward from the current playhead.
- **`tl.restart()`** — Plays from the beginning.
- **`tl.time(seconds)`** — Seeks to a specific timestamp.
- **`tl.progress(0-1)`** — Seeks to a percentage of the animation.
- **`tl.kill()`** — Instantly terminates the timeline and frees memory.

## Failure Modes

- **Timeline Jumps:** Animating properties of the same element in parallel nested timelines can cause layout jumps.
- **Strict Mode Double Trigger:** In React, if cleanup is missing, strict mode renders the timeline twice, creating double-bound events.
- **Orphaned Timelines:** Timelines driving hidden DOM nodes consume layout-thrashing cycles even when invisible.

## Validation

Cara memverifikasi kepatuhan penggunaan `gsap-timeline`:

1. **Pengecekan Struktur Statis (Grep):**
   ```bash
   # Pastikan tidak ada ScrollTrigger yang bersarang di dalam child tween timeline
   grep -rn "scrollTrigger" --include="*.js" --include="*.jsx" --include="*.tsx" src/ | grep -v "gsap.timeline"
   ```
2. **Pengecekan Konsol Browser:**
   Pastikan tidak ada peringatan tentang properti yang tidak dikenali atau unmounted targets.
3. **Validasi Build:**
   ```bash
   npm run build
   # Pastikan build sukses tanpa error sintaksis GSAP
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menulis animasi menggunakan GSAP:

> "Gunakan skill `gsap-timeline`. Sebelum menulis kode, baca `.agent/skills/gsap-timeline/SKILL.md` terlebih dahulu. Jangan pernah gunakan delay manual untuk orchestration. Selalu gunakan `gsap.timeline()` dengan defaults, gunakan position parameter (`<`, `>`, label) untuk overlap, dan letakkan ScrollTrigger hanya pada konfigurasi timeline utama."

## Related

- [gsap-core](file:///d:/gsap/.agent/skills/gsap-core/SKILL.md) — Fundamental GSAP concepts and properties.
- [gsap-scrolltrigger](file:///d:/gsap/.agent/skills/gsap-scrolltrigger/SKILL.md) — Link timelines directly to scroll gestures.
- [gsap-react](file:///d:/gsap/.agent/skills/gsap-react/SKILL.md) — Managing GSAP timelines in React environments.
