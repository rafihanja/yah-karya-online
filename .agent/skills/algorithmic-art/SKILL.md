---
name: algorithmic-art
description: Create computational art movements, philosophy manifests, and interactive p5.js generative art experiences.
risk: medium (unseeded randomness breaks reproducibility, canvas performance lag, broken UI overlays)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Algorithmic Art

> **One-liner:** Guidelines for creating structured generative aesthetics and self-contained p5.js interactive art viewers utilizing seeded deterministic randomness.

## When to Use

- When building generative visual art pages (such as flow fields, geometric mandalas, recursion trees, or Voronoi packings).
- When implementing interactive canvases in web portfolios or standalone viewer sandboxes.
- When generating reproducible variations from seed inputs (Art Blocks patterns).

## Why This Exists

If generative art utilizes unseeded randomness (e.g. standard `Math.random()` or `random()`), the output changes completely on every refresh, rendering the artwork irreproducible. This lack of consistency makes it impossible for users to bookmark, share, or print specific visual compositions. Furthermore, building canvas layouts from scratch without systematic parameter controls blocks user exploration. Using seeded randomness with dedicated parameter sliders solves these issues.

## ALWAYS DO THIS

- **Implement Seeded Randomness** — Always configure `randomSeed(params.seed)` and `noiseSeed(params.seed)` in setup blocks to guarantee identical output for any given seed.
- **Synchronize with UI parameters** — Bind numeric parameters (like particle counts, speeds, or colors) to HTML range inputs to enable real-time canvas updates.
- **Enable canvas downloads** — Provide a download action (`saveCanvas('artwork_' + params.seed, 'png')`) to allow saving high-resolution compositions.
- **Provide reset controls** — Set up a reset trigger that restores parameters to their default values and redraws the canvas.
- **Debounce canvas resizing** — Listen to window resize events and resize the canvas dynamically with a slight debounce to prevent layout overflows.

## NEVER DO THIS

- ❌ **DO NOT** use unseeded `random()` or `noise()` calls in draw loops. **Why fails:** Creates flickering, randomized frame offsets on reload, breaking the deterministic nature of the composition. **Instead:** Always pass seed constants first.
- ❌ **DO NOT** design custom themes, dark-mode overrides, or custom fonts from scratch for the viewer UI. **Why fails:** Breaks brand consistency and looks amateurish. **Instead:** Inherit standard branding (e.g., Poppins/Lora fonts, light layout grids) from the base templates.
- ❌ **DO NOT** initialize the canvas size to fixed, static pixel values that exceed screen borders. **Why fails:** Clips the canvas on small displays or leaves massive empty margins. **Instead:** Set responsive dimensions bound to parent elements.
- ❌ **DO NOT** overload the draw loop with heavy calculations (e.g., executing nesting Voronoi loops on every frame). **Why fails:** Drops frame rates on mobile browsers. **Instead:** Pre-calculate arrays or call `noLoop()` for static compositions.

## Examples

### ✅ Good — Self-Contained p5.js Viewer with Seeded Randomness and Easing

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
  <style>
    body { margin: 0; font-family: 'Poppins', sans-serif; background: #fafafa; display: flex; }
    #sidebar { width: 300px; padding: 20px; border-right: 1px solid #eee; height: 100vh; }
    #canvas-container { flex-grow: 1; display: flex; align-items: center; justify-content: center; }
    .control-group { margin-bottom: 15px; }
    label { display: block; font-size: 0.85em; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>Generative Flow</h3>
    <div class="control-group">
      <label>Seed: <span id="seed-val">12345</span></label>
      <input type="number" id="seed" value="12345" onchange="updateSeed(this.value)">
    </div>
    <div class="control-group">
      <label>Line Count: <span id="count-val">200</span></label>
      <input type="range" id="count" min="50" max="500" value="200" oninput="updateParam('lineCount', this.value)">
    </div>
    <button onclick="saveArtwork()">Download PNG</button>
  </div>
  <div id="canvas-container"></div>

  <script>
    let params = {
      seed: 12345,
      lineCount: 200
    };

    function setup() {
      const canvas = createCanvas(600, 600);
      canvas.parent('canvas-container');
      noLoop();
    }

    function draw() {
      // 1. Configure seeded randomness for reproducibility
      randomSeed(params.seed);
      noiseSeed(params.seed);
      background(255);

      stroke(0, 100);
      noFill();

      // 2. Draw composition dynamically bound to parameters
      for (let i = 0; i < params.lineCount; i++) {
        let x = random(width);
        let y = random(height);
        ellipse(x, y, noise(x * 0.005, y * 0.005) * 100);
      }
    }

    function updateSeed(val) {
      params.seed = parseInt(val);
      document.getElementById('seed-val').innerText = val;
      redraw();
    }

    function updateParam(key, val) {
      params[key] = parseInt(val);
      document.getElementById(key + '-val').innerText = val;
      redraw();
    }

    function saveArtwork() {
      saveCanvas('flow_artwork_' + params.seed, 'png');
    }
  </script>
</body>
</html>
```

Why this passes: Uses seeded randomness, binds sliders to params, wraps container targets responsively, and features an inline save canvas handler.

### ❌ Bad — Unseeded Loops and Hardcoded Dimensions

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
</head>
<body>
  <!-- ERROR 1: Fails to provide any UI parameter controls or seed adjusters -->
  <script>
    function setup() {
      // ERROR 2: Hardcoded canvas width exceeding browser borders
      createCanvas(2000, 2000);
    }

    function draw() {
      // ERROR 3: Direct random call inside draw loop without seeds (flickers infinitely)
      background(random(255));
      ellipse(random(width), random(height), 50);
    }
  </script>
</body>
</html>
```

Why this fails: Lacks seeded parameters, triggers rapid flashing due to unseeded draw loops, has hardcoded dimensions, and provides no user control interfaces.

---

## Technical Design Archetypes

### Recursive Subdivision Blueprint
```javascript
function drawBranch(x, y, length, angle, depth) {
  if (depth === 0) return;
  
  // Calculate coordinates using deterministic noise
  let x2 = x + cos(angle) * length;
  let y2 = y + sin(angle) * length;
  
  line(x, y, x2, y2);
  
  let newLength = length * 0.7;
  let angleVar = noise(x * 0.01, y * 0.01) * 0.5;
  
  drawBranch(x2, y2, newLength, angle + angleVar, depth - 1);
  drawBranch(x2, y2, newLength, angle - angleVar, depth - 1);
}
```

---

## Failure Modes

- **Infinite Redraw Loop Crashes:** Parameter changes trigger recursive redraw loops that freeze the browser tab.
- **Output Mismatch:** Reloading the same seed produces completely different compositions due to unseeded noise variables.

## Validation

Cara memverifikasi kepatuhan penggunaan `algorithmic-art`:

1. **Verify seeded randomness configurations:**
   Ensure noiseSeed and randomSeed exist in setup/draw sequences:
   ```bash
   grep -rn "randomSeed(" src/
   ```
2. **Scan for saveCanvas handlers:**
   Ensure export png tools are bound to actions:
   ```bash
   grep -rn "saveCanvas(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membuat generative art:

> "Use the skill `algorithmic-art`. Read `.agent/skills/algorithmic-art/SKILL.md` before coding. Never use unseeded random variables. Always pass parameter sliders, bind seed inputs to deterministic `randomSeed` and `noiseSeed` states, optimize loop performance, and write self-contained HTML viewers."

## Related

- [canvas-design](../canvas-design/SKILL.md) — Visual principles.
- [gsap-performance](../gsap-performance/SKILL.md) — Thread optimization.
