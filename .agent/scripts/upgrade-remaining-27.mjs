#!/usr/bin/env node
/**
 * upgrade-remaining-27.mjs
 * 
 * Upgrades the 27 remaining "Good" skills to "Excellent" by adding
 * contextual ALWAYS DO, NEVER DO, and When to Use sections.
 * 
 * Two strategies:
 * - THIN skills (10 lines or less): Full content rewrite with library-specific knowledge
 * - RICH skills (have content but missing headers): Derive and append sections
 * 
 * Usage:
 *   node .agent/scripts/upgrade-remaining-27.mjs --dry-run
 *   node .agent/scripts/upgrade-remaining-27.mjs --apply
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsRoot = path.join(__dirname, "..", "skills");
const isDryRun = !process.argv.includes("--apply");

// ── THIN SKILL TEMPLATES (full content for stub skills) ──────────────

const thinSkillContent = {
  "baffle-js": `---
name: baffle-js
description: A tiny javascript library for obfuscating and revealing text in DOM elements
---

# baffle-js

A tiny JavaScript library for obfuscating and revealing text in DOM elements.
Creates a scramble/decode text effect by cycling through random characters before revealing the final text.

## When to Use

- Adding text reveal/scramble animations to headings, hero text, or loading screens
- Creating hacker-style typing effects or cipher-decode transitions
- Building intro sequences where text appears with a randomized character effect
- Pairing with scroll-triggered animations for text-on-scroll reveals

## Key Concepts

### Basic Usage
\`\`\`js
import baffle from 'baffle';

// Select target elements and start obfuscation
const b = baffle('.my-text');
b.start();   // begin scrambling
b.reveal(1000); // reveal over 1 second
\`\`\`

### Configuration Options
\`\`\`js
baffle('.my-text', {
  characters: '█▓▒░<>/',  // custom character set
  speed: 50                // ms between character updates
});
\`\`\`

### Chaining with Callbacks
\`\`\`js
baffle('.title')
  .start()
  .reveal(1500, () => {
    console.log('Reveal complete');
  });
\`\`\`

## ALWAYS DO

- Call \`.stop()\` or \`.reveal()\` to end the animation — do not leave it cycling indefinitely
- Use \`requestAnimationFrame\`-friendly speed values (50ms+) to avoid jank
- Scope selectors tightly — baffle mutates \`textContent\` of every matched element
- Pair with CSS \`font-variant-numeric: tabular-nums\` for fixed-width character sets
- Clean up baffle instances on component unmount in SPA frameworks

## NEVER DO

- Do not use baffle on elements with child HTML — it replaces \`textContent\`, destroying inner markup
- Do not run multiple baffle instances on the same element simultaneously
- Do not use on accessibility-critical text without providing an \`aria-label\` with the real content
- Do not set speed below 16ms — it will not render faster than the browser's frame rate

## Limitations

- Only works on text nodes; does not preserve inner HTML structure
- No built-in scroll-trigger — pair with IntersectionObserver or GSAP ScrollTrigger
- Character set must be monospace-friendly for visual consistency
`,

  "barba-js": `---
name: barba-js
description: Fluid page transitions (SPA-like) without reloading
---

# barba-js

Fluid, SPA-like page transitions for multi-page websites without full reloads.
Barba.js intercepts link clicks, fetches the next page via AJAX, and swaps content containers with animated transitions.

## When to Use

- Building multi-page sites that need smooth transitions between pages (portfolio, agency sites)
- Adding cinematic page-enter/page-leave animations without converting to a SPA framework
- Creating branded transition effects (fade, slide, cover) between routes
- Pairing with GSAP or anime.js for custom transition choreography

## Key Concepts

### Basic Setup
\`\`\`js
import barba from '@barba/core';
import gsap from 'gsap';

barba.init({
  transitions: [{
    name: 'fade',
    leave(data) {
      return gsap.to(data.current.container, { opacity: 0, duration: 0.5 });
    },
    enter(data) {
      return gsap.from(data.next.container, { opacity: 0, duration: 0.5 });
    }
  }]
});
\`\`\`

### HTML Structure
\`\`\`html
<div data-barba="wrapper">
  <div data-barba="container" data-barba-namespace="home">
    <!-- page content -->
  </div>
</div>
\`\`\`

### Route-Specific Transitions
\`\`\`js
barba.init({
  transitions: [{
    name: 'to-portfolio',
    to: { namespace: ['portfolio'] },
    leave(data) { /* ... */ },
    enter(data) { /* ... */ }
  }]
});
\`\`\`

## ALWAYS DO

- Wrap page content in \`data-barba="wrapper"\` > \`data-barba="container"\` structure
- Re-initialize page-specific scripts in the \`enter\` or \`afterEnter\` hook (event listeners, scroll position, GSAP animations)
- Use \`data-barba-namespace\` to enable route-specific transitions
- Return a Promise or GSAP timeline from \`leave\`/\`enter\` so Barba knows when the animation finishes
- Reset scroll position in \`afterEnter\` unless preserving scroll is intentional
- Test with browser back/forward navigation — Barba hooks must handle popstate

## NEVER DO

- Do not forget to re-bind event listeners after page swap — old container DOM is destroyed
- Do not mix Barba with framework client-side routing (Next.js, Nuxt) — they conflict
- Do not omit the \`data-barba="wrapper"\` — Barba will silently fail
- Do not use inline \`<script>\` tags in page content expecting re-execution on swap
- Do not leave GSAP timelines from the previous page alive — kill them in \`leave\`

## Limitations

- Not compatible with SPA frameworks (React Router, Vue Router, Next.js)
- Scripts inside swapped containers do not re-execute by default
- Forms and third-party widgets may need manual re-initialization
`,

  "howler-js": `---
name: howler-js
description: Web audio library for interactive soundscapes
---

# howler-js

Cross-browser audio library that provides a simple, consistent API for playing sounds on the web.
Built on Web Audio API with HTML5 Audio fallback.

## When to Use

- Adding sound effects to web interactions (clicks, hovers, notifications)
- Building browser-based games with positional/spatial audio
- Creating ambient soundscapes or background music for immersive experiences
- Implementing audio players with playlist, seek, and volume controls

## Key Concepts

### Basic Playback
\`\`\`js
import { Howl } from 'howler';

const sound = new Howl({
  src: ['/sounds/click.webm', '/sounds/click.mp3'],
  volume: 0.5
});

sound.play();
\`\`\`

### Sprite Map (Multiple Sounds in One File)
\`\`\`js
const sfx = new Howl({
  src: ['/sounds/sprites.webm'],
  sprite: {
    click:  [0, 300],
    hover:  [400, 200],
    submit: [700, 500]
  }
});

sfx.play('click');
\`\`\`

### Spatial Audio
\`\`\`js
const ambient = new Howl({
  src: ['/sounds/rain.webm'],
  loop: true,
  volume: 0.3
});
ambient.pos(10, 0, 0); // x, y, z position
Howler.pos(0, 0, 0);   // listener position
\`\`\`

## ALWAYS DO

- Provide multiple audio formats (webm + mp3) for cross-browser support
- Preload sounds that need instant playback (\`preload: true\` is default)
- Use audio sprites for multiple short SFX to reduce HTTP requests
- Unload sounds when no longer needed (\`sound.unload()\`) to free memory
- Handle autoplay restrictions — trigger first sound from a user interaction event
- Set \`html5: true\` for long audio (music, podcasts) to enable streaming instead of full download

## NEVER DO

- Do not autoplay audio without user interaction — browsers will block it
- Do not create new Howl instances on every play — reuse instances
- Do not forget to call \`.unload()\` on SPA route changes — leaked audio continues playing
- Do not use only one audio format — Safari needs mp3/m4a, Firefox prefers webm/ogg
- Do not set volume above 1.0 — it clips and distorts

## Limitations

- Web Audio API support varies on older mobile browsers
- Autoplay policies require user gesture before first sound
- No built-in audio visualization — use Web Audio API analyzer nodes directly
`,

  "lenis-scroll": `---
name: lenis-scroll
description: Smooth scrolling using Lenis
---

# lenis-scroll

Lenis is a lightweight smooth scroll library that normalizes scroll behavior across browsers.
Creates butter-smooth, momentum-based scrolling with minimal configuration.

## When to Use

- Adding smooth, momentum-based scrolling to a website
- Normalizing scroll behavior across browsers (especially Firefox vs Chrome differences)
- Pairing with GSAP ScrollTrigger for smoother scroll-linked animations
- Building parallax or scroll-storytelling experiences that need consistent scroll velocity

## Key Concepts

### Basic Setup
\`\`\`js
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
\`\`\`

### Integration with GSAP ScrollTrigger
\`\`\`js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
\`\`\`

### Scroll-to Methods
\`\`\`js
lenis.scrollTo('#section-id');       // scroll to element
lenis.scrollTo(500);                 // scroll to pixel position
lenis.scrollTo('#id', { offset: -100, duration: 2 });
\`\`\`

## ALWAYS DO

- Call \`lenis.destroy()\` on component unmount or page transitions to prevent memory leaks
- Set \`gsap.ticker.lagSmoothing(0)\` when pairing with GSAP to avoid frame skips
- Use \`lenis.on('scroll', ScrollTrigger.update)\` to sync Lenis with GSAP ScrollTrigger
- Test on mobile devices — touch scroll behavior differs from desktop wheel events
- Set \`html, body { height: auto }\` in CSS to avoid Lenis fighting native scroll

## NEVER DO

- Do not use Lenis alongside other smooth scroll libraries (Locomotive Scroll, GSAP ScrollSmoother) — they conflict
- Do not forget the \`requestAnimationFrame\` loop — Lenis will not scroll without it
- Do not set \`overflow: hidden\` on \`<html>\` — Lenis needs native scroll to work
- Do not use CSS \`scroll-behavior: smooth\` alongside Lenis — they fight each other
- Do not ignore accessibility — provide a way to disable smooth scroll for users with vestibular disorders (\`prefers-reduced-motion\`)

## Limitations

- Adds a layer of abstraction over native scroll — may cause issues with some scroll-dependent features
- Not needed for simple sites — native scroll is sufficient
- Horizontal scroll support requires additional configuration
`,

  "locomotive-scroll": `---
name: locomotive-scroll
description: Smooth scrolling and parallax effects with intersection observer
---

# locomotive-scroll

Smooth scrolling library with built-in parallax, scroll-based class toggling, and speed modifiers.
Uses IntersectionObserver to detect elements entering the viewport.

## When to Use

- Building parallax scrolling effects with per-element speed control
- Adding scroll-triggered CSS class toggling (e.g., \`.is-inview\`)
- Creating smooth scroll experiences with built-in lerp-based interpolation
- Sites that need scroll-direction detection and progress tracking

## Key Concepts

### Basic Setup
\`\`\`js
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

const scroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  multiplier: 1,
  lerp: 0.1
});
\`\`\`

### Data Attributes
\`\`\`html
<div data-scroll-container>
  <section data-scroll-section>
    <h1 data-scroll data-scroll-speed="2">Parallax heading</h1>
    <p data-scroll data-scroll-class="fade-in" data-scroll-repeat="true">
      This fades in on every scroll into view
    </p>
  </section>
</div>
\`\`\`

### Scroll Events
\`\`\`js
scroll.on('scroll', (args) => {
  console.log(args.scroll.y);  // current scroll position
  console.log(args.direction); // 'up' or 'down'
});
\`\`\`

## ALWAYS DO

- Wrap all content in \`[data-scroll-container]\` > \`[data-scroll-section]\`
- Call \`scroll.destroy()\` on unmount and \`scroll.update()\` after DOM changes
- Import the Locomotive CSS file or replicate its required styles
- Use \`data-scroll-repeat="true"\` if you want re-triggering on scroll back
- Call \`scroll.update()\` after dynamic content loads (images, AJAX content)

## NEVER DO

- Do not mix Locomotive Scroll with Lenis or GSAP ScrollSmoother — they all override native scroll
- Do not forget \`data-scroll-section\` wrappers — Locomotive will misscalculate heights
- Do not use CSS \`position: fixed\` inside scroll containers without \`data-scroll-sticky\`
- Do not omit \`scroll.destroy()\` in SPAs — scroll listeners and transforms will stack
- Do not use \`data-scroll-speed\` on the container itself — only on child elements

## Limitations

- Locomotive Scroll v4 is mature but the maintainers recommend considering Lenis for new projects
- Resizing and dynamic content require manual \`.update()\` calls
- Not compatible with CSS \`scroll-behavior: smooth\`
`,

  "lottie-web": `---
name: lottie-web
description: Render After Effects animations natively on the web
---

# lottie-web

Renders Adobe After Effects animations exported as JSON (via Bodymovin plugin) directly in the browser.
Supports SVG, Canvas, and HTML renderers.

## When to Use

- Displaying After Effects animations on the web (icons, illustrations, loading spinners)
- Adding micro-interactions exported from After Effects or Lottie Creator
- Building animated illustrations that need to be resolution-independent (SVG renderer)
- Creating interactive animations that respond to scroll, hover, or click events

## Key Concepts

### Basic Setup
\`\`\`js
import lottie from 'lottie-web';

const anim = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/animations/hero.json'
});
\`\`\`

### Control Methods
\`\`\`js
anim.play();
anim.pause();
anim.stop();
anim.setSpeed(1.5);
anim.goToAndStop(30, true);  // go to frame 30
anim.setDirection(-1);        // reverse playback
\`\`\`

### Inline JSON Data
\`\`\`js
import animationData from './animation.json';

lottie.loadAnimation({
  container: el,
  renderer: 'svg',
  animationData: animationData  // inline instead of path
});
\`\`\`

## ALWAYS DO

- Use \`renderer: 'svg'\` for resolution-independent, accessible output
- Call \`anim.destroy()\` on component unmount to prevent memory leaks
- Optimize Lottie JSON files with LottieFiles optimizer before shipping to production
- Provide fallback content (static image or CSS animation) for when JS is disabled
- Use \`animationData\` (inline) instead of \`path\` (fetch) when the JSON is small and critical to LCP

## NEVER DO

- Do not load large Lottie files (>500KB JSON) without lazy-loading — they block the main thread during parse
- Do not use \`renderer: 'html'\` for complex animations — it has poor support for masks and effects
- Do not forget to call \`.destroy()\` — Lottie keeps internal RAF loops alive
- Do not use Lottie for simple animations achievable with CSS — it's overkill and adds bundle weight
- Do not embed animation JSON inline in HTML — use a separate file or dynamic import

## Limitations

- Not all After Effects features are supported — check Bodymovin compatibility matrix
- Canvas renderer does not support interactivity (click targets, hover)
- Large animations can be CPU-intensive on mobile devices
`,

  "react-three-fiber": `---
name: react-three-fiber
description: Taking Three.js and combining it with React. The pinnacle of 3D web experiences
---

# react-three-fiber

React renderer for Three.js. Declarative, component-based 3D scene composition using React patterns.
Everything in Three.js works in R3F — meshes, lights, materials, cameras, post-processing.

## When to Use

- Building 3D scenes, product configurators, or visualizations in a React/Next.js app
- Creating interactive 3D UI elements (3D cards, globes, data visualizations)
- Building WebGL games or experiences within a React ecosystem
- When you want the Three.js power with React's component model and state management

## Key Concepts

### Basic Scene
\`\`\`jsx
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  );
}
\`\`\`

### Animation with useFrame
\`\`\`jsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function SpinningBox() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
\`\`\`

### With drei Helpers
\`\`\`jsx
import { OrbitControls, Environment, Text } from '@react-three/drei';

<Canvas>
  <OrbitControls enableDamping />
  <Environment preset="sunset" />
  <Text fontSize={1} color="white">Hello 3D</Text>
</Canvas>
\`\`\`

## ALWAYS DO

- Use \`useFrame\` for per-frame updates — never use \`setInterval\` or \`requestAnimationFrame\` inside Canvas
- Dispose of geometries, materials, and textures manually or use \`drei\`'s auto-dispose
- Wrap Canvas in a fixed-size container — Canvas fills its parent's dimensions
- Use \`@react-three/drei\` for common helpers (OrbitControls, Environment, useGLTF, Text)
- Memoize heavy computations and geometries — React re-renders affect Three.js performance
- Use \`Suspense\` for async loading (models, textures, HDR environments)

## NEVER DO

- Do not create Three.js objects (new THREE.Mesh()) inside render — use JSX declarative syntax
- Do not use React state for per-frame animation values — it causes re-renders; use refs instead
- Do not forget to add lights — meshStandardMaterial/meshPhysicalMaterial are black without light
- Do not nest \`<Canvas>\` components — one Canvas per 3D viewport
- Do not import Three.js classes directly when R3F/drei provides a declarative equivalent

## Limitations

- React reconciliation adds overhead vs raw Three.js — not ideal for extreme performance scenarios
- Debugging 3D issues requires knowledge of both React and Three.js internals
- Server-Side Rendering (SSR) requires dynamic import with \`ssr: false\`
`,

  "redis": `---
name: redis
description: In-memory data structure store, used as a distributed, in-memory key-value database, cache and message broker
---

# redis

In-memory data structure store used as a cache, message broker, session store, and real-time database.
Supports strings, hashes, lists, sets, sorted sets, streams, and pub/sub.

## When to Use

- Caching frequently accessed data to reduce database load (query results, API responses)
- Managing user sessions in distributed/multi-server environments
- Building real-time features: leaderboards, rate limiters, pub/sub messaging
- Implementing job queues and background task processing (with BullMQ or similar)

## Key Concepts

### Basic Operations (Node.js with ioredis)
\`\`\`js
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// String
await redis.set('user:1:name', 'Rafi', 'EX', 3600); // expires in 1hr
const name = await redis.get('user:1:name');

// Hash
await redis.hset('user:1', { name: 'Rafi', role: 'admin' });
const user = await redis.hgetall('user:1');

// Sorted Set (leaderboard)
await redis.zadd('leaderboard', 100, 'player1', 200, 'player2');
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
\`\`\`

### Caching Pattern
\`\`\`js
async function getCached(key, fetchFn, ttl = 3600) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}
\`\`\`

### Pub/Sub
\`\`\`js
const sub = new Redis(process.env.REDIS_URL);
sub.subscribe('notifications');
sub.on('message', (channel, message) => {
  console.log(\`[\${channel}] \${message}\`);
});

// Publisher (separate connection)
await redis.publish('notifications', JSON.stringify({ type: 'alert', text: 'New order' }));
\`\`\`

## ALWAYS DO

- Set TTL (expiry) on cache keys — unbounded caches cause memory exhaustion
- Use separate Redis connections for pub/sub subscribers — subscribed connections cannot run other commands
- Use connection pooling in production (\`ioredis\` handles this by default)
- Serialize/deserialize with JSON.parse/JSON.stringify — Redis stores strings, not objects
- Use key prefixes and namespaces (\`app:users:1\`) to avoid collisions
- Monitor memory usage with \`INFO memory\` — Redis evicts keys under memory pressure

## NEVER DO

- Do not store large blobs (>1MB) in Redis — it's optimized for small, fast reads
- Do not use Redis as a primary database — it's volatile by default (data loss on restart without persistence)
- Do not use \`KEYS *\` in production — it blocks the single-threaded event loop; use \`SCAN\` instead
- Do not share a subscriber connection for regular commands — it will throw errors
- Do not hardcode Redis URLs — use environment variables for connection strings

## Limitations

- Single-threaded — CPU-bound Lua scripts or large KEYS scans block all clients
- Memory-bound — dataset must fit in RAM (or use Redis Cluster for sharding)
- Persistence (RDB/AOF) adds latency and disk I/O
`,

  "split-type": `---
name: split-type
description: Split text into characters, words, lines for animation
---

# split-type

Utility library that splits text DOM elements into individual characters, words, and/or lines,
wrapping each in a \`<span>\` for per-unit animation control.

## When to Use

- Animating text character-by-character, word-by-word, or line-by-line with GSAP, anime.js, or CSS
- Building staggered text reveal effects (typewriter, cascade, wave)
- Creating scroll-triggered text animations where each line/word animates independently
- Implementing kinetic typography or motion graphics on the web

## Key Concepts

### Basic Split
\`\`\`js
import SplitType from 'split-type';

const text = new SplitType('#my-heading', {
  types: 'chars, words, lines'
});

// text.chars  → array of <span> elements for each character
// text.words  → array of <span> elements for each word  
// text.lines  → array of <span> elements for each line
\`\`\`

### With GSAP Animation
\`\`\`js
import gsap from 'gsap';
import SplitType from 'split-type';

const text = new SplitType('.hero-title', { types: 'chars' });

gsap.from(text.chars, {
  y: 100,
  opacity: 0,
  stagger: 0.03,
  duration: 0.8,
  ease: 'power4.out'
});
\`\`\`

### Responsive Re-split (on Resize)
\`\`\`js
const text = new SplitType('.paragraph', { types: 'lines' });

window.addEventListener('resize', () => {
  text.split(); // re-split to recalculate line breaks
});
\`\`\`

## ALWAYS DO

- Call \`text.revert()\` before re-splitting or on component unmount to restore original DOM
- Re-split on window resize when using \`types: 'lines'\` — line breaks change with viewport width
- Set \`overflow: hidden\` on parent elements when animating \`y\` transforms for clip-reveal effects
- Use \`will-change: transform\` on split spans when animating transforms for GPU acceleration
- Ensure the text is fully rendered (fonts loaded) before splitting — use \`document.fonts.ready\`

## NEVER DO

- Do not split text before web fonts have loaded — line calculations will be wrong
- Do not forget to call \`.revert()\` in cleanup — split spans accumulate and break re-renders
- Do not use SplitType on elements with complex inner HTML (links, spans, em) without testing — it may break structure
- Do not apply \`display: inline\` to split line wrappers — lines need \`display: block\` for correct positioning
- Do not split very large text blocks (1000+ characters) without throttling — it creates many DOM nodes

## Limitations

- Splits are DOM-based — text must be rendered and visible for accurate line detection
- Inner HTML with nested elements may not split cleanly
- Requires re-splitting after font changes or container resize
`,

  "supabase": `---
name: supabase
description: Open source Firebase alternative with PostgreSQL, Auth, and Storage
---

# supabase

Open source Firebase alternative built on PostgreSQL. Provides database, authentication,
realtime subscriptions, edge functions, storage, and vector embeddings out of the box.

## When to Use

- Building full-stack apps that need auth, database, and storage without managing infrastructure
- Implementing real-time features (live cursors, chat, notifications) via Postgres changes
- Creating apps with Row Level Security (RLS) for fine-grained access control
- Rapid prototyping with a managed PostgreSQL database and instant REST/GraphQL APIs

## Key Concepts

### Client Setup
\`\`\`js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
\`\`\`

### CRUD Operations
\`\`\`js
// Read
const { data, error } = await supabase
  .from('posts')
  .select('id, title, author:profiles(name)')
  .eq('published', true)
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', content: 'World', user_id: userId })
  .select();

// Update
const { error } = await supabase
  .from('posts')
  .update({ title: 'Updated' })
  .eq('id', postId);
\`\`\`

### Realtime Subscriptions
\`\`\`js
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
\`\`\`

### Row Level Security (RLS)
\`\`\`sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can edit own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);
\`\`\`

## ALWAYS DO

- Enable Row Level Security (RLS) on every table — without it, the anon key exposes all data
- Use the \`anon\` key on the client and \`service_role\` key only on the server (never expose service_role)
- Handle errors from every Supabase call — \`{ data, error }\` pattern requires checking \`error\`
- Use \`.select()\` after \`.insert()\`/\`.update()\` to get the modified row back
- Unsubscribe from realtime channels on component unmount
- Use Supabase migrations (\`supabase db diff\`) instead of manual SQL for schema changes

## NEVER DO

- Do not expose the \`service_role\` key in client-side code — it bypasses all RLS policies
- Do not skip RLS policies — tables without RLS are publicly readable/writable via the API
- Do not use \`supabase.auth.getSession()\` for server-side auth validation — use \`supabase.auth.getUser()\` which validates the JWT
- Do not store files with predictable/guessable paths in public buckets without access controls
- Do not use Supabase client in server components without creating a server-specific client

## Limitations

- Free tier has connection limits and pauses inactive projects after 1 week
- Realtime has a concurrent connection limit per project
- Edge Functions run on Deno, not Node.js — not all npm packages are compatible
`,

  "playwright": `---
name: playwright
description: Framework for Web Testing and Automation. Allows testing Chromium, Firefox and WebKit with a single API
---

# playwright

End-to-end testing and browser automation framework by Microsoft.
Test across Chromium, Firefox, and WebKit with a single API. Supports auto-waiting, network interception, and parallel execution.

## When to Use

- Writing end-to-end (E2E) tests for web applications
- Automating browser workflows (form submission, scraping, screenshot generation)
- Testing cross-browser compatibility (Chrome, Firefox, Safari via WebKit)
- Visual regression testing with screenshot comparisons

## Key Concepts

### Basic Test
\`\`\`js
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
\`\`\`

### User Interactions
\`\`\`js
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
});
\`\`\`

### Page Object Model
\`\`\`js
class LoginPage {
  constructor(page) { this.page = page; }
  async login(email, password) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
\`\`\`

## ALWAYS DO

- Use role-based locators (\`getByRole\`, \`getByLabel\`, \`getByText\`) over CSS selectors
- Use Playwright's built-in auto-waiting — do not add manual \`sleep\`/\`waitForTimeout\`
- Run tests in parallel by default (\`fullyParallel: true\` in config)
- Use \`test.describe\` to group related tests and share setup via \`test.beforeEach\`
- Generate tests with \`npx playwright codegen\` for rapid prototyping
- Use \`expect(locator).toBeVisible()\` over \`expect(locator).toHaveCount(1)\`

## NEVER DO

- Do not use \`page.waitForTimeout()\` for synchronization — use auto-waiting or explicit assertions
- Do not use fragile CSS selectors (\`.btn-primary > span:nth-child(2)\`) — they break on UI changes
- Do not share state between parallel tests — each test gets a fresh browser context
- Do not hardcode test data — use fixtures or environment variables
- Do not test implementation details — test user-visible behavior

## Limitations

- WebKit engine is not identical to Safari — some Safari-specific bugs may not reproduce
- Does not support testing native mobile apps (use Appium for that)
- Parallel execution requires tests to be truly independent
`,

  "zdog": `---
name: zdog
description: Flat, round, designer-friendly pseudo-3D engine for canvas and SVG
---

# zdog

Pseudo-3D engine for canvas and SVG. Creates flat, round, illustrative 3D graphics
with a designer-friendly API. No WebGL required.

## When to Use

- Creating simple, illustrative 3D graphics (icons, logos, characters) without WebGL complexity
- Building interactive pseudo-3D animations for landing pages or portfolios
- When you want 3D-like visuals with the aesthetic of flat illustration
- Prototyping 3D ideas quickly without Three.js setup overhead

## Key Concepts

### Basic Scene
\`\`\`js
import Zdog from 'zdog';

const illo = new Zdog.Illustration({
  element: '.zdog-canvas',
  dragRotate: true
});

new Zdog.Ellipse({
  addTo: illo,
  diameter: 80,
  stroke: 20,
  color: '#636'
});

function animate() {
  illo.rotate.y += 0.03;
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}
animate();
\`\`\`

### Shape Primitives
\`\`\`js
// Rect
new Zdog.Rect({ addTo: illo, width: 60, height: 60, stroke: 10, color: '#E62' });

// Cone
new Zdog.Cone({ addTo: illo, diameter: 40, length: 60, stroke: false, color: '#636' });

// Cylinder
new Zdog.Cylinder({ addTo: illo, diameter: 40, length: 80, stroke: false, color: '#C25' });
\`\`\`

### Grouping and Hierarchy
\`\`\`js
const head = new Zdog.Anchor({ addTo: illo, translate: { y: -60 } });

new Zdog.Shape({
  addTo: head,
  stroke: 80,
  color: '#FDB'
});
// eyes, mouth etc. all addTo: head
\`\`\`

## ALWAYS DO

- Use \`Zdog.Anchor\` for grouping related shapes (like a scene graph)
- Call \`illo.updateRenderGraph()\` in the animation loop — Zdog does not auto-render
- Use \`dragRotate: true\` on \`Illustration\` for quick interactive demos
- Keep polygon counts low — Zdog renders via 2D canvas, not GPU-accelerated WebGL
- Cancel the animation \`requestAnimationFrame\` loop on unmount

## NEVER DO

- Do not use Zdog for complex 3D scenes with realistic lighting — it has no lighting model
- Do not expect WebGL performance — Zdog uses 2D canvas sorting, which slows with many shapes
- Do not apply textures or image maps — Zdog only supports flat colors and strokes
- Do not nest too many shapes deep — draw order sorting becomes expensive
- Do not forget to call \`updateRenderGraph()\` — nothing will appear on screen

## Limitations

- No lighting, shadows, or textures — purely flat-colored shapes
- Performance degrades with 100+ shapes (canvas 2D sorting)
- No built-in physics or raycasting
- Limited to the pseudo-3D aesthetic — not suitable for photorealistic rendering
`
};

// ── RICH SKILL UPGRADE (derive ALWAYS/NEVER from content) ────────────

function deriveAlwaysNever(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const always = [];
  const never = [];
  
  // Track current section to skip certain sections
  let currentSection = '';
  const skipSections = /limitation|caveat|related|reference|example|copy-paste|workflow|bundle|gate|phase/i;
  
  for (const line of lines) {
    const headingMatch = line.match(/^#{2,4}\s+(.*)$/);
    if (headingMatch) {
      currentSection = headingMatch[1];
      continue;
    }
    
    if (skipSections.test(currentSection)) continue;
    
    const trimmed = line.trim();
    
    // ✅ emoji lines → ALWAYS
    if (/^[-*]\s*✅\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s*✅\s+/, '').replace(/\*\*/g, '');
      if (text.length > 15 && text.length < 200) always.push(text);
    }
    
    // ❌ emoji lines → NEVER  
    if (/^[-*]\s*❌\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s*❌\s+/, '').replace(/\*\*/g, '');
      if (text.length > 15 && text.length < 200) never.push(text);
    }
    
    // Leading imperative: "Always ...", "Must ...", "Ensure ..."
    if (/^[-*]\s+(Always|Must|Ensure|Require|Implement|Use|Set up|Configure|Include|Add|Create|Define|Validate)\b/i.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
      if (text.length > 15 && text.length < 200 && !always.some(a => a === text)) {
        always.push(text);
      }
    }
    
    // Leading prohibition: "Never ...", "Don't ...", "Do not ...", "Avoid ..."
    if (/^[-*]\s+(Never|Don'?t|Do not|Avoid|Stop)\b/i.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
      if (text.length > 15 && text.length < 200 && !never.some(n => n === text)) {
        never.push(text);
      }
    }
  }
  
  return {
    always: always.slice(0, 10),
    never: never.slice(0, 10)
  };
}

function appendSections(content, alwaysList, neverList) {
  let result = content.replace(/\r\n/g, '\n').trimEnd();
  
  // Find insertion point: before ## Limitations if exists, else at end
  const limIdx = result.search(/^## Limitations/m);
  const insertBefore = limIdx > -1 ? limIdx : result.length;
  
  let sections = '';
  
  if (alwaysList.length > 0) {
    sections += '\n\n## ALWAYS DO\n\n';
    sections += alwaysList.map(a => `- ${a}`).join('\n');
  }
  
  if (neverList.length > 0) {
    sections += '\n\n## NEVER DO\n\n';
    sections += neverList.map(n => `- ${n}`).join('\n');
  }
  
  if (limIdx > -1) {
    result = result.slice(0, insertBefore) + sections + '\n\n' + result.slice(insertBefore);
  } else {
    result = result + sections + '\n';
  }
  
  return result;
}

// ── MAIN ─────────────────────────────────────────────────────────────

const RXALWAYS = /always\s+do/i;
const RXNEVER = /never\s+do/i;
const RXWHEN = /when\s+to\s+use/i;

let upgraded = 0;
let skipped = 0;
const issues = [];

// Get all Good skills (has content but <2 quality sections)
const skillDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const skill of skillDirs) {
  const skillMd = path.join(skillsRoot, skill, "SKILL.md");
  if (!fs.existsSync(skillMd)) continue;
  
  const content = fs.readFileSync(skillMd, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  const lines = content.split("\n").filter(l => l.trim().length > 0 && !l.startsWith("#"));
  
  if (bytes < 200 || lines.length <= 2) continue; // Skip weak/empty
  
  const hasAlways = RXALWAYS.test(content);
  const hasNever = RXNEVER.test(content);
  const hasWhen = RXWHEN.test(content);
  const sectionsFound = [hasAlways, hasNever, hasWhen].filter(Boolean).length;
  
  if (sectionsFound >= 2) continue; // Already excellent
  
  // Check if this is a thin skill with full template
  if (thinSkillContent[skill]) {
    const newContent = thinSkillContent[skill];
    if (isDryRun) {
      console.log(`  ✅ ${skill} → FULL REWRITE (thin → rich)`);
    } else {
      fs.writeFileSync(skillMd, newContent, "utf8");
      console.log(`  ✅ ${skill} → FULL REWRITE applied`);
    }
    upgraded++;
    continue;
  }
  
  // Rich skill — derive ALWAYS/NEVER from content
  const { always, never } = deriveAlwaysNever(content);
  
  const needAlways = !hasAlways && always.length >= 3;
  const needNever = !hasNever && never.length >= 3;
  
  if (!needAlways && !needNever) {
    // Not enough content to derive — flag for manual review
    issues.push(skill);
    console.log(`  ⚠️  ${skill} → insufficient derivable content (always=${always.length}, never=${never.length})`);
    continue;
  }
  
  const addAlways = needAlways ? always : [];
  const addNever = needNever ? never : [];
  
  const newContent = appendSections(content, addAlways, addNever);
  
  if (isDryRun) {
    const parts = [];
    if (addAlways.length) parts.push(`+ALWAYS DO(${addAlways.length})`);
    if (addNever.length) parts.push(`+NEVER DO(${addNever.length})`);
    console.log(`  ✅ ${skill} → ${parts.join(', ')}`);
  } else {
    fs.writeFileSync(skillMd, newContent, "utf8");
    const parts = [];
    if (addAlways.length) parts.push(`+ALWAYS DO(${addAlways.length})`);
    if (addNever.length) parts.push(`+NEVER DO(${addNever.length})`);
    console.log(`  ✅ ${skill} → ${parts.join(', ')} applied`);
  }
  upgraded++;
}

console.log(`\nUpgraded: ${upgraded} | Issues: ${issues.length}`);
if (issues.length > 0) {
  console.log(`\nSkills needing manual review:\n  ${issues.join('\n  ')}`);
}
if (isDryRun) {
  console.log(`\n(DRY RUN — no files written. Re-run with --apply to write.)`);
}
