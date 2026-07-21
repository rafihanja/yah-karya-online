---
name: shader-programming-glsl
description: Expert guide for writing efficient GLSL shaders (Vertex/Fragment) for web and game engines.
risk: medium (GPU parallelism bottlenecks, compiler syntax compilation faults, black screen errors)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Shader Programming GLSL

> **One-liner:** Guidelines for writing high-performance WebGL vertex and fragment shaders using GLSL, avoiding GPU branch divergence and optimizing math compilation.

## When to Use

- When implementing custom visual styles, procedural terrains, or flow distortions on the GPU.
- When programming vertex manipulation (such as waving flags, ocean waves, or particle trails).
- When coding complex fragment effects (like post-processing lens flares, chromatic aberration, or custom gradient noise).

## Why This Exists

GPUs process operations in massive parallel tracks (SIMD architecture). When a shader contains dynamic conditional branches (`if/else` statements that resolve differently for neighboring pixels), the GPU is forced to execute *both* paths for all threads in that execution unit. This behavior (known as branch divergence) dramatically slows down rendering performance. By utilizing mathematical functions (like `step`, `smoothstep`, and `mix`), developers can replace branches with raw math operations that execute instantly on all parallel GPU threads.

## ALWAYS DO THIS

- **Use mathematical functions instead of conditional statements** — Employ `step()`, `smoothstep()`, and `mix()` to mask, clamp, or blend pixels without using conditional `if` blocks.
- **Specify float precision declarations** — Always declare precision boundaries (e.g. `precision mediump float;`) at the very top of fragment shaders.
- **Pack coordinates via Swizzling** — Take advantage of vector swizzling (like `color.rgba` or `color.zyx`) to copy and format color channel data in a single GPU tick.
- **Pre-calculate CPU constants** — Compute static parameters once on the CPU and pass them into the shader as `uniform` values, rather than performing calculations inside the shader.
- **Verify UV coordinate limits** — Keep in mind that input UV texture coordinates range from 0.0 to 1.0.

## NEVER DO THIS

- ❌ **DO NOT** use dynamic conditional branches (`if-else`) inside loops or hot fragment paths. **Why fails:** Disables parallel thread optimization, causing frame drops and rendering lag. **Instead:** Mask pixel operations using math equations.
- ❌ **DO NOT** execute static math operations (like calculating `PI * 2.0` or constant division scales) inside the shader. **Why fails:** Wastes precious GPU cycles calculating the same value for millions of pixels. **Instead:** Hardcode the final calculated constants directly or pass them as uniforms.
- ❌ **DO NOT** import raw external texture files without setting fallback parameters. **Why fails:** The shader compiles, but displays a solid black screen if texture coordinates mismatch or fail to load. **Instead:** Validate texture mapping logic first.

---

## Technical Design Archetypes

### Dynamic Edge Interpolation Math
Compare the following math equivalents:
- **Branching (Bad):** `if (x < 0.5) col = a; else col = b;`
- **Math Masking (Good):** `float mask = step(0.5, x); vec3 col = mix(a, b, mask);`

---

## Examples

### ✅ Good — Monochromatic Radial Gradient without Conditional Branches

```glsl
// Fragment Shader
precision mediump float;

// 1. Declare inputs passed from host CPU/Vertex stages
uniform float uTime;
varying vec2 vUv;

void main() {
  // 2. Calculate distance from coordinate center (0.5, 0.5)
  vec2 center = vec2(0.5);
  float dist = distance(vUv, center);

  // 3. Create smooth radial mask without using IF conditions
  float edge = 0.4 + sin(uTime) * 0.05;
  float mask = smoothstep(edge, edge - 0.02, dist);

  // 4. Interpolate final color channels using math
  vec3 colorA = vec3(0.1, 0.5, 0.8);
  vec3 colorB = vec3(0.05, 0.05, 0.1);
  vec3 finalColor = mix(colorB, colorA, mask);

  gl_FragColor = vec4(finalColor, 1.0);
}
```

Why this passes: Declares medium precision limits, calculates radial distances using fast built-in vectors, masks edges smoothly using `smoothstep`, and replaces `if` checks with a clean `mix` blend.

### ❌ Bad — Fragment Shader with Heavy Branching and Missing Declarations

```glsl
// ERROR 1: Missing float precision declaration (fails compilation on some browsers)

varying vec2 vUv;
uniform float uTime;

void main() {
  vec3 col = vec3(0.0);

  // ERROR 2: Heavy conditional branching (forces execution of both branches, killing performance)
  if (vUv.x > 0.5) {
    col = vec3(1.0, 0.0, 0.0);
  } else {
    // ERROR 3: Redundant math calculations executed on every single pixel
    float constantScale = 3.14159 * 2.0; 
    col = vec3(0.0, sin(uTime * constantScale), 1.0);
  }

  // ERROR 4: Outputting un-clamped coordinates directly without W alpha bounds
  gl_FragColor = vec4(col, vUv.y);
}
```

Why this fails: Omits floating-point precision standards, triggers execution path divergence with conditional checks, performs redundant constant calculations on the GPU, and leaves alpha boundaries un-clamped.

---

## Failure Modes

- **Black Backdrop Errors:** The canvas displays as a black screen because the float precision declaration was omitted, or because `gl_Position.w` is mapped to 0.0.
- **Rendering Lag on Mobile:** Fragment shaders containing nested `if/else` checks cause frame rates to drop on mobile devices.

## Validation

Cara memverifikasi kepatuhan penggunaan `shader-programming-glsl`:

1. **Verify precision declarations:**
   Ensure precision boundaries exist at the top of GLSL shader files:
   ```bash
   grep -rn "precision " src/
   ```
2. **Scan for if-else statements inside shader codes:**
   Review instances of branching to determine if they can be optimized using step/mix math functions:
   ```bash
   grep -rn "if (" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk memprogram shader:

> "Use the skill `shader-programming-glsl`. Read `.agent/skills/shader-programming-glsl/SKILL.md` before coding. Never use dynamic conditional branches (`if-else`) inside pixel loops. Always declare medium float precision bounds, pre-calculate constant equations on the CPU, and use step/mix math functions for color masking."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — GPU pipeline.
- [threejs-fundamentals](../threejs-fundamentals/SKILL.md) — Basic scene structure.
