---
name: react-three-fiber
description: Taking Three.js and combining it with React. The pinnacle of 3D web experiences.
risk: medium (unnecessary React re-renders in animation frame loops, canvas layout breaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# React Three Fiber

> **One-liner:** Guidelines for declarative 3D scene composition in React/Next.js applications using React Three Fiber (R3F) and Drei helper libraries.

## When to Use

- When building 3D product configurators, visual galleries, or portfolios in React.
- When organizing complex WebGL layouts that map naturally to reusable React component states.
- When synchronizing 3D rendering updates with global React contexts or routing logic.

## Why This Exists

React is designed around state-driven UI updates and virtual DOM reconciliation. Three.js, on the other hand, runs in a high-frequency imperative render loop (60+ FPS). Bridging these two paradigms presents a major challenge: triggering React state changes inside the animation frame loop forces React to run full component reconciliation 60 times a second, which instantly tanks performance and causes major lagging. R3F solves this by providing direct, ref-based access to the underlying imperative Three.js objects through the `useFrame` hook, bypassing React's reconciliation system entirely.

## ALWAYS DO THIS

- **Use ref-based updates inside `useFrame`** — Perform high-frequency animations (like rotations, positions, or scales) directly on the `.current` property of a mutable `useRef` reference.
- **Wrap Canvas in a parent container with relative positioning** — The `<Canvas>` component automatically fills the width and height of its parent container. Make sure the parent element has explicit CSS dimensions.
- **Lazy-load models and textures using Suspense** — Wrap 3D assets loaded via Drei's `useGLTF` or `useTexture` hooks in `<Suspense fallback={<Loader />}>` tags to prevent UI thread blocking.
- **Use Drei helpers to simplify setup** — Leverage `@react-three/drei` components (like `<OrbitControls />`, `<Environment />`, or `<Stats />`) to write clean, declarative layout blocks.
- **Handle SSR compatibility in Next.js** — Dynamically import components containing `<Canvas>` elements with `ssr: false` configurations to avoid node hydration mismatch errors.

## NEVER DO THIS

- ❌ **DO NOT** trigger React `useState` updates inside the `useFrame` loop. **Why fails:** Triggers continuous re-render operations on every frame, causing performance to drop from 60 FPS to sub-10 FPS. **Instead:** Access and animate refs directly.
- ❌ **DO NOT** instantiate new Three.js assets (e.g. `new THREE.BoxGeometry()`) inside the render block of an active component. **Why fails:** The asset gets reconstructed from scratch on every component re-render, leaking memory and causing frame rate drops. **Instead:** Declare them declaratively via JSX elements (`<boxGeometry />`) or memoize them using `useMemo`.
- ❌ **DO NOT** omit light sources when utilizing physically correct materials like `meshStandardMaterial`. **Why fails:** The mesh renders completely black, leading to confusion. **Instead:** Add light elements (like `<ambientLight />` or `<directionalLight />`) to the scene.
- ❌ **DO NOT** nest multiple `<Canvas>` elements inside each other. **Why fails:** Creates separate WebGL context instances, which consumes excessive CPU/GPU resources and can lead to immediate crashes on mobile devices. **Instead:** Keep a single root Canvas and organize scenes inside logical JSX groups.

## Examples

### ✅ Good — Declarative Component with Ref-based useFrame Animation

```jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

function RotatingBox({ color }) {
  const meshRef = useRef();

  // 1. Perform high-frequency updates on refs to bypass React re-renders
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // 2. Geometries and materials are declared declaratively; R3F manages their lifecycle
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
  );
}

export default function Scene() {
  return (
    // 3. Canvas is wrapped in a sized container
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingBox color="hotpink" />
        <OrbitControls enableDamping />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
```

Why this passes: Animates via `useFrame` using mutable references, wraps `<Canvas>` inside a relative parent div with explicit sizing, and uses declarative geometries.

### ❌ Bad — React State updates inside useFrame and imperative instantiations

```jsx
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function BadCube() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // ERROR 1: Updating React state on every frame (triggers massive re-renders)
    setRotation({
      x: rotation.x + delta,
      y: rotation.y + delta,
    });
  });

  // ERROR 2: Creating a new geometry object inside the render cycle
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  return (
    <primitive object={new THREE.Mesh(geometry, material)} />
  );
}

export default function BadScene() {
  // ERROR 3: Canvas tag lacks parent dimensions wrapper (collapses to 0 height)
  return (
    <Canvas>
      <BadCube />
    </Canvas>
  );
}
```

Why this fails: Triggers state updates inside `useFrame`, constructs new imperative Three.js geometries/materials inside the render path, and lacks container sizing.

---

## Technical Performance Checklist
- **Component Re-renders:** Ensure components inside `<Canvas>` do not re-render when object transformations update.
- **Suspense Fallbacks:** Always declare load fallback elements to avoid showing a frozen layout while assets download.

---

## Failure Modes

- **Infinite Re-render Lag:** React state modifications inside `useFrame` cause the application to lag and drop frames.
- **Zero-Height Canvas Collapse:** The Canvas element renders as a 0px high box because the developer did not wrap it inside a CSS-sized container.

## Validation

Cara memverifikasi kepatuhan penggunaan `react-three-fiber`:

1. **Verify ref updates inside useFrame loops:**
   Ensure `useState` mutators do not exist inside `useFrame` callback blocks:
   ```bash
   grep -rn "useFrame(" src/
   # Verify the contents modify meshRef.current.position/rotation/scale directly
   ```
2. **Ensure dynamic loaders are wrapped in Suspense:**
   ```bash
   grep -rn "useGLTF(" src/
   # Ensure matching code is wrapped inside a <Suspense> tag
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menggunakan R3F:

> "Use the skill `react-three-fiber`. Read `.agent/skills/react-three-fiber/SKILL.md` before coding. Never trigger React states or call `useState` mutators inside `useFrame` blocks. Always perform high-frequency calculations on mutable refs, wrap parent components inside sized layout containers, and wrap dynamic assets inside Suspense blocks."

## Related

- [three-js-expert](../three-js-expert/SKILL.md) — Imperative optimizations.
- [threejs-fundamentals](../threejs-fundamentals/SKILL.md) — Basic scene structure.
