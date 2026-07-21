---
name: howler-js
description: Web audio library for interactive soundscapes and browser-based audio environments.
risk: low (audio playback latency, browser autoplay policy blocks, memory leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# howler-js

> **One-liner:** Robust cross-browser audio playback wrapper built on the Web Audio API with automatic fallback to HTML5 Audio streaming.

## When to Use

- When implementing sound effects (clicks, hovers, micro-interactions) triggered by user interactions.
- When designing browser-based games or 3D visualizers requiring directional spatial audio.
- When creating ambient soundscapes or background music playlists for immersive spatial experiences.

## Why This Exists

Native web audio formats and APIs are notoriously inconsistent across client platforms (for instance, Safari requires different mime-types compared to Firefox). The standard HTML5 `<audio>` tag has high click-to-play latency and is unsuitable for fast sound effects. Furthermore, modern browsers enforce strict autoplay prevention policies that completely block sound initialization until a user interacts with the page. `howler-js` normalizes formats and autoplay restrictions. However, creating new sound instances on every click causes heavy memory leaks.

## ALWAYS DO THIS

- **Provide fallback formats** — Specify multiple source mime-types (e.g. `src: ['sound.webm', 'sound.mp3']`) to guarantee playback on all browsers.
- **Unload instances on unmount** — Always invoke `soundInstance.unload()` when navigating away or unmounting to terminate background decoders.
- **Delay playback until user gesture** — Wrap sound trigger bindings inside click or mouse interaction events to satisfy browser autoplay requirements.
- **Set `html5: true` for long tracks** — Enable HTML5 Audio mode for background music or long recordings to stream data directly instead of buffering the entire file in memory.
- **Group short effects into Audio Sprites** — Bundle multiple short interface sounds into a single audio file and map them via sprites to minimize HTTP connection overhead.

## NEVER DO THIS

- ❌ **DO NOT** create a new `Howl` instance every time an interaction callback triggers (e.g., on button hover). **Why fails:** Instantiates a new Web Audio buffer source node on every click, leaking memory and crashing the browser's audio context after a few clicks. **Instead:** Instantiate the sound once globally or in a hook, and call `.play()` on the existing instance.
- ❌ **DO NOT** autoplay background audio on page load. **Why fails:** Modern browsers immediately block unmuted audio contexts on load, throwing console exceptions and locking down page scripts. **Instead:** Present a visible "Enable Sound" button to register a user-initiated gesture first.
- ❌ **DO NOT** let background audio continue playing during route changes. **Why fails:** Users navigate to another page, but the old soundtrack keeps looping, creating a frustrating experience. **Instead:** Clean up and call `.stop()` or `.unload()` in page exit lifecycles.
- ❌ **DO NOT** set the player volume above `1.0` in software configurations. **Why fails:** Truncates waveform boundaries, resulting in digital audio clipping and speaker distortion. **Instead:** Keep max volumes at `1.0` and manage physical systems.

## Examples

### ✅ Good — Global Sound Instance and Playback on User Interaction

```javascript
import { Howl } from "howler";

// 1. Instantiate the sound object once at the module level (or in a persistent provider)
const menuClickSfx = new Howl({
  // Webm is smaller and higher quality, mp3 serves as Safari fallback
  src: ["/audio/click.webm", "/audio/click.mp3"],
  volume: 0.4,
  preload: true
});

export function handleUserInteraction() {
  // 2. Play the preloaded instance within a user-initiated click callback (satisfies browser policy)
  if (menuClickSfx.state() === "loaded") {
    menuClickSfx.play();
  } else {
    // If not loaded yet, wait or trigger load manually
    menuClickSfx.load();
    menuClickSfx.once("load", () => {
      menuClickSfx.play();
    });
  }
}

// 3. Cleanup handler (e.g. on global application destroy)
export function destroyAudio() {
  menuClickSfx.unload();
}
```

Why this passes: Reuses a single preloaded `Howl` instance, provides webm/mp3 fallbacks, triggers playback via a user action, and includes an `.unload()` path.

### ❌ Bad — Multi-Instance Spawning on Hover Event

```javascript
import { Howl } from "howler";

// ERROR 1: Triggered on every hover event, spawning hundreds of instances
export function onHoverButton() {
  // ERROR 2: Creating a new Howl instance on every callback trigger (memory leak)
  const sound = new Howl({
    src: ["/audio/hover-beep.mp3"] // ERROR 3: Missing fallback webm format
  });
  
  sound.play();
  
  // ERROR 4: No unload or cleanup method executed
}
```

Why this fails: Spawns duplicate audio contexts on every hover event, leaks memory resources, lacks audio format fallbacks, and triggers audio context warnings in the console.

---

## Technical Sprites Blueprint
Combine multiple sound effects into a single file to reduce HTTP requests:
```javascript
const interfaceSounds = new Howl({
  src: ["/audio/interface-sprites.webm", "/audio/interface-sprites.mp3"],
  sprite: {
    click: [0, 200],    // [offset (ms), duration (ms)]
    success: [400, 800],
    warning: [1400, 500]
  }
});

// Trigger via sprite key
interfaceSounds.play("click");
```

---

## Failure Modes

- **Silent Autoplay Block:** The page loads and animations play, but no audio triggers. The console shows `AudioContext was not allowed to start. It must be resumed after a user gesture`.
- **Background Audio Leak:** The user navigates from the product presentation to the pricing page, but the presentation background music continues looping indefinitely.

## Validation

Cara memverifikasi kepatuhan penggunaan `howler-js`:

1. **Verify howler instances are not spawned inside callbacks:**
   Check that `new Howl` is not declared inside events or render hooks:
   ```bash
   grep -rn "new Howl" src/
   # Ensure these instantiations are placed at module top-levels or wrapped in persistent states
   ```
2. **Scan for unload calls:**
   Ensure unload cleanup calls exist in component hooks:
   ```bash
   grep -rn "\.unload()" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan Howler.js:

> "Use the skill `howler-js`. Read `.agent/skills/howler-js/SKILL.md` before coding. Never instantiate `new Howl()` inside event loops, click callbacks, or render loops. Reuse a single instance, declare webm + mp3 fallback paths, preload assets, and always invoke `unload()` on unmount to free up the Web Audio thread."

## Related

- [scroll-experience](../scroll-experience/SKILL.md) — Immersive scroll audio mapping.
- [gsap-performance](../gsap-performance/SKILL.md) — Frame optimization.
