---
name: web-audio-engineering
description: Advanced patterns for Web Audio API, real-time frequency analysis (FFT), canvas audio visualizers, and linking sound waves to GSAP animations.
risk: medium (autoplay browser block, hardware audio context leak, canvas jitter animation)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Audio & Visualizer Engineering

> **One-liner:** Modular routing architecture for Web Audio API AudioNode and safe synchronization of real-time FFT frequency analysis to canvas/GSAP animation loops.

## When to Use

- Designing visual music players, browser games with dynamic sound effects, or interactive generative art installations.
- Synchronizing visual element animations (DOM/Canvas) with real-time bass/mid/treble frequency analysis.
- Implementing microphone inputs (UserMedia) for interactive voice visualizers.

## Why This Exists

Web Audio API works by linking modular nodes (AudioNodes) inside an AudioContext. This hardware-bound audio context is limited in browsers. If a developer creates a new AudioContext instantiation (`new AudioContext()`) every time a song is played or a button is clicked, the browser will quickly exhaust the hardware audio output channels and freeze all audio playback. Additionally, autoplay security policies force browsers to block audio initialization without active user gestures (clicks/taps).

## ALWAYS DO THIS

- **Use a global singleton AudioContext** — Lazily instantiate a single `AudioContext` instance and share it across all audio playback modules to prevent hardware resource leaks.
- **Activate audio only via user click interactions** — Always call `.resume()` on the `AudioContext` inside click/touch event handlers to bypass autoplay block policies.
- **Pre-allocate frequency data arrays** — Initialize the `Uint8Array` buffer once during setup, and update its contents within the loop using `.getByteFrequencyData(array)` to avoid GC (Garbage Collector) overhead.
- **Apply animation smoothing** — Smooth out jagged visual animations by using linear interpolation (lerp) or short-duration `gsap.to()` transitions (e.g., 0.05 seconds).
- **Disconnect nodes on unmount** — Call `.disconnect()` on audio source nodes and terminate canvas rendering loops when components unmount.

## NEVER DO THIS

- ❌ **NEVER** instantiate a `new AudioContext()` inside a loop, tick function, or animation frame render loop (`requestAnimationFrame`). **Why fails:** Causes hardware resource leaks, freezing audio playback in the browser. **Instead:** Reuse a global singleton context.
- ❌ **NEVER** trigger automatic audio playback without wrapping it in a user-initiated interaction. **Why fails:** Blocked by the browser, throwing the error "AudioContext was not allowed to start". **Instead:** Bind the sound play trigger to a play button click/tap event.
- ❌ **NEVER** allocate memory for FFT data arrays (like `new Uint8Array()`) inside a render loop. **Why fails:** Generates continuous garbage collection cycles, causing rendering stutters (micro-stutters) in visualizer frame rates. **Instead:** Define the array once outside the loop.

---

## Technical Routing Diagram

Standard AudioNode routing flow:
```
[HTML5 Audio Source] ──> [AnalyserNode (FFT)] ──> [GainNode (Volume)] ──> [AudioContext.destination (Speakers)]
```

---

## Examples

### ✅ Good — Global Audio Context with Frequency Analysis and Unmount Cleanup

```javascript
import gsap from "gsap";

let globalAudioCtx = null;

export class VisualizerEngine {
  constructor(audioElement, canvasElement) {
    this.audioElement = audioElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
  }

  init() {
    // 1. Singleton pattern: Reuse global AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }

    // 2. Create analyser and connect node routing
    this.analyser = globalAudioCtx.createAnalyser();
    this.analyser.fftSize = 256;

    const source = globalAudioCtx.createMediaElementSource(this.audioElement);
    source.connect(this.analyser);
    this.analyser.connect(globalAudioCtx.destination);

    // 3. Pre-allocate data array outside render loop
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  start() {
    // 4. Resume context via gesture handler to bypass autoplay block
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);
      
      // Update array values without instantiation
      this.analyser.getByteFrequencyData(this.dataArray);
      
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Render simple bars
      const barWidth = this.canvas.width / this.dataArray.length;
      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = this.dataArray[i] * 1.5;
        this.ctx.fillStyle = `rgb(${this.dataArray[i]}, 100, 250)`;
        this.ctx.fillRect(i * barWidth, this.canvas.height - barHeight, barWidth - 2, barHeight);
      }
    };
    draw();
  }

  destroy() {
    // 5. Total cleanup: cancel animation frames and disconnect nodes
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
```

Why this passes: Uses a singleton AudioContext, resumes context explicitly on gesture, pre-allocates data arrays, and cancels the animation frame loop on destroy.

### ❌ Bad — Repeated Context Instantiation on Play and Over-Allocation of Array

```javascript
// ERROR 1: Repeated AudioContext instantiation inside a play function (causes hardware leaks)
export function playBadSound(audioElement) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext(); // Triggers hardware context exhaustion
  
  const source = ctx.createMediaElementSource(audioElement);
  const analyser = ctx.createAnalyser();
  source.connect(analyser);
  analyser.connect(ctx.destination);

  function animate() {
    requestAnimationFrame(animate);
    
    // ERROR 2: New array allocation in every single render frame (overloads GC)
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    
    // ERROR 3: Missing cleanup hooks to cancel the animation frame loop
  }
  animate();
}
```

Why this fails: Re-instantiates `AudioContext` on play, allocates a new `Uint8Array` in every render frame, and runs the animation loop indefinitely (memory leaks).

---

## Failure Modes

- **Context Limit Exceeded Crash:** Audio fails to play because the number of active `AudioContext` instances exceeds the browser's maximum hardware threshold.
- **Autoplay Console Block:** The browser console outputs autoplay policy errors, and music fails to sound without user interaction.
- **FFT Garbage Collector Stutter:** Visualizer frames hitch because `Uint8Array` buffers are allocated inside `requestAnimationFrame`. Mitigation: allocate analyser buffers once during initialization.
- **Zombie Render Loop:** Audio visualizer continues calling `requestAnimationFrame` after route change or component unmount. Mitigation: store the frame id and cancel it in cleanup.
- **Disconnected Graph Silence:** Audio nodes are connected in the wrong order or never reach `AudioContext.destination`, producing a silent visualizer. Mitigation: verify the source -> analyser -> gain -> destination chain explicitly.
- **Microphone Permission Dead-End:** User denies `getUserMedia`, but UI stays in loading state. Mitigation: handle permission errors with a visible fallback state and no dangling analyser loop.
- **Clipping Gain Spike:** Bass-reactive gain or bar scaling exceeds safe values and causes distortion. Mitigation: clamp analyser-derived values before feeding gain or GSAP transforms.

## Validation

How to verify compliance with `web-audio-engineering` rules:

1. **Verify singleton AudioContext checks:**
   Ensure contexts are reused, not instanced multiple times:
   ```bash
   grep -rn "new AudioContext" src/
   ```
2. **Scan for Uint8Array instantiations in render loops:**
   Ensure buffer data arrays are defined outside render loops:
   ```bash
   grep -rn "new Uint8Array" src/
   ```
3. **Verify cleanup hooks for render loops:**
   Ensure animation frames are cancelled when visualizers stop:
   ```bash
   grep -rn "cancelAnimationFrame" src/
   ```
4. **Verify autoplay gesture handling:**
   Ensure audio context resume is tied to click/touch handlers, not automatic load:
   ```bash
   grep -rn "resume()" src/
   ```

## Sub-Agent Propagation

When instructing a sub-agent to program an audio visualizer:

> "Use the `web-audio-engineering` skill. Read `.agent/skills/web-audio-engineering/SKILL.md` before coding. DO NOT instantiate a new AudioContext in render loops or multiple times on click handlers. Always use a singleton pattern, call `.resume()` inside click gesture handlers, instantiate buffer arrays outside render loops, and cancel rendering loops on component unmount."

## Related

- `howler-js` — Audio sprite playing patterns.
- `gsap-performance` — Synchronization animation loop benchmarks.
