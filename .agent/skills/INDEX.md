<!-- MANDATORY_SKILL_INDEX -->
# Skill Index — SEMUA Skill (.agent/skills)

> **AUTO-GENERATED — jangan edit tangan.** Regenerate:
> `node .agent/scripts/generate-skill-index.mjs`

## Cara Pakai (WAJIB)

1. **Scan SELURUH index ini dulu** tiap task substantif — semua skill di repo
   ada di sini, tidak ada yang disembunyikan. Ini pengganti asumsi "cuma
   file tertentu": kamu melihat semua opsi, bukan cuma yang kebetulan match keyword.
2. Silang-cek dengan `.agent/skill-router.json` untuk sinyal routing.
3. **Baca `SKILL.md` PENUH** hanya untuk skill yang benar-benar relevan dengan task —
   jangan mengklaim skill tanpa membuka file-nya (anti-hallucination gate).
4. Tetap mulai output dengan header I AM CRAZY dan sebut skill yang dipakai.

Legend set: `default` = selalu aktif; `task:<set>` = task-set di active-skills.json;
`on-demand:<bundle>` = perlu restore lebih dulu (`node .agent/scripts/restore-skill-bundle.mjs <bundle>`).

**Total skill: 162** — di antaranya 48 default-set.

---

### 3d-web-experience
- **Set:** task:animation-3d
- **Kapan dipakai:** Architecting and optimizing immersive 3D experiences for the web.
- **Path:** `.agent/skills/3d-web-experience/SKILL.md`

### accessibility-compliance-accessibility-audit
- **Set:** task:accessibility
- **Kapan dipakai:** Conduct accessibility audits, identify barriers, and provide WCAG 2.2 AA remediation guidance.
- **Path:** `.agent/skills/accessibility-compliance-accessibility-audit/SKILL.md`

### ai-engineer
- **Set:** task:ai-llm
- **Kapan dipakai:** Build production-ready LLM applications, advanced RAG systems, and intelligent agents. Implements vector search, multimodal AI, agent orchestration, and enterprise AI integrations.
- **Path:** `.agent/skills/ai-engineer/SKILL.md`

### algolia-search
- **Set:** task:frontend-ui
- **Kapan dipakai:** Expert patterns for Algolia search implementation, indexing strategies, React InstantSearch, and relevance tuning.
- **Path:** `.agent/skills/algolia-search/SKILL.md`

### algorithmic-art
- **Set:** task:animation-3d
- **Kapan dipakai:** Create computational art movements, philosophy manifests, and interactive p5.js generative art experiences.
- **Path:** `.agent/skills/algorithmic-art/SKILL.md`

### animejs-animation
- **Set:** task:animation-3d
- **Kapan dipakai:** Advanced JavaScript animation library skill for creating complex, high-performance web animations.
- **Path:** `.agent/skills/animejs-animation/SKILL.md`

### antigravity-design-expert
- **Set:** task:animation-3d
- **Kapan dipakai:** Core UI/UX engineering skill for building highly interactive, spatial, weightless, and glassmorphism-based web interfaces using GSAP and 3D CSS.
- **Path:** `.agent/skills/antigravity-design-expert/SKILL.md`

### api-design-principles
- **Set:** task:node-api
- **Kapan dipakai:** Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs.
- **Path:** `.agent/skills/api-design-principles/SKILL.md`

### api-patterns
- **Set:** default, task:backend-db
- **Kapan dipakai:** API design principles. REST vs GraphQL vs tRPC, standard response formats, versioning, rate limiting.
- **Path:** `.agent/skills/api-patterns/SKILL.md`

### api-security-best-practices
- **Set:** task:node-api
- **Kapan dipakai:** Implement secure API design patterns including authentication, authorization, input validation, rate limiting, and protection against common API vulnerabilities.
- **Path:** `.agent/skills/api-security-best-practices/SKILL.md`

### arsitek-pikiran
- **Set:** task:planning-prd
- **Kapan dipakai:** Arsitek Pikiran - strategic planner untuk mengubah ide mentah, ambigu, atau berisiko menjadi rencana eksekusi 5 fase yang jelas. Gunakan saat user meminta strategi, roadmap, arsitektur awal, scope MVP, atau pemecahan ide sebelum dibuat PRD…
- **Path:** `.agent/skills/arsitek-pikiran/SKILL.md`

### astro
- **Set:** task:frontend-ui
- **Kapan dipakai:** Build content-focused websites with Astro — zero JS by default, islands architecture, multi-framework components, and Markdown/MDX support.
- **Path:** `.agent/skills/astro/SKILL.md`

### auth-implementation-patterns
- **Set:** task:auth
- **Kapan dipakai:** Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.
- **Path:** `.agent/skills/auth-implementation-patterns/SKILL.md`

### auto-pro-standards
- **Set:** default
- **Kapan dipakai:** Otomatis terapkan standar keamanan OWASP, SEO, performa Core Web Vitals, dan aksesibilitas WCAG ke setiap project — tanpa user perlu minta.
- **Path:** `.agent/skills/auto-pro-standards/SKILL.md`

### avoid-ai-writing
- **Set:** default
- **Kapan dipakai:** Audit and rewrite content to remove categories of AI writing patterns with replacement tables.
- **Path:** `.agent/skills/avoid-ai-writing/SKILL.md`

### backend-architect
- **Set:** default, task:backend-db
- **Kapan dipakai:** Master software architect specializing in modern architecture, microservices, and clean code.
- **Path:** `.agent/skills/backend-architect/SKILL.md`

### backend-dev-guidelines
- **Set:** task:node-api
- **Kapan dipakai:** Senior backend engineer operating guidelines for production-grade services under strict architectural and reliability constraints.
- **Path:** `.agent/skills/backend-dev-guidelines/SKILL.md`

### backend-security-coder
- **Set:** task:security-coding
- **Kapan dipakai:** Hands-on backend security coding expert — input validation, parameterized queries, secure auth, CSRF/SSRF prevention, secure logging. Untuk implementasi (bukan audit).
- **Path:** `.agent/skills/backend-security-coder/SKILL.md`

### baffle-js
- **Set:** task:animation-3d
- **Kapan dipakai:** Obfuscate and reveal text in DOM elements with hacker/cipher scramble effects.
- **Path:** `.agent/skills/baffle-js/SKILL.md`

### barba-js
- **Set:** task:animation-3d
- **Kapan dipakai:** Fluid page transitions (SPA-like) without reloading for multi-page websites.
- **Path:** `.agent/skills/barba-js/SKILL.md`

### baseline-ui
- **Set:** task:frontend-ui
- **Kapan dipakai:** Validates animation durations, enforces typography scale, checks component accessibility, and prevents layout anti-patterns in Tailwind CSS projects.
- **Path:** `.agent/skills/baseline-ui/SKILL.md`

### canvas-design
- **Set:** task:animation-3d
- **Kapan dipakai:** Design principles for visual layouts, spatial composition, grid hierarchy, and clinical typography in digital canvases.
- **Path:** `.agent/skills/canvas-design/SKILL.md`

### cc-skill-security-review
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Code-level security review checklist for 10 critical areas (secrets, inputs, SQL, auth, XSS, CSRF, rate limits, sensitive data, blockchain, and dependencies) for pre-merge and pre-deploy audits.
- **Path:** `.agent/skills/cc-skill-security-review/SKILL.md`

### clerk-auth
- **Set:** task:auth
- **Kapan dipakai:** Expert patterns for Clerk auth implementation, middleware, organizations, webhooks, and user sync.
- **Path:** `.agent/skills/clerk-auth/SKILL.md`

### cloudflare-workers-expert
- **Set:** task:serverless
- **Kapan dipakai:** Expert in Cloudflare Workers and the Edge Computing ecosystem. Covers Wrangler, KV, D1, Durable Objects, and R2 storage.
- **Path:** `.agent/skills/cloudflare-workers-expert/SKILL.md`

### code-reviewer
- **Set:** default, task:quality
- **Kapan dipakai:** Elite code review expert specializing in modern AI-powered code review.
- **Path:** `.agent/skills/code-reviewer/SKILL.md`

### codebase-audit-pre-push
- **Set:** default, task:git-devops, task:quality
- **Kapan dipakai:** Deep audit before GitHub push - removes junk files, dead code, security holes, and optimization issues.
- **Path:** `.agent/skills/codebase-audit-pre-push/SKILL.md`

### content-automation-engine
- **Set:** default, task:bot-automation
- **Kapan dipakai:** Automated content production engine pipelines for YouTube Shorts, TikTok, and Instagram Reels, covering script generation, TTS synthesis, FFmpeg processing, and scheduled uploads.
- **Path:** `.agent/skills/content-automation-engine/SKILL.md`

### database
- **Set:** default, task:backend-db
- **Kapan dipakai:** Database development and operations workflow covering SQL, NoSQL, database design, migrations, optimization, and data engineering.
- **Path:** `.agent/skills/database/SKILL.md`

### database-admin
- **Set:** task:backend-db
- **Kapan dipakai:** Expert database administrator specializing in modern cloud databases, automation, and reliability engineering.
- **Path:** `.agent/skills/database-admin/SKILL.md`

### database-design
- **Set:** default, task:backend-db
- **Kapan dipakai:** Database design principles, indexing strategy, prevention of N+1 queries, and normalization.
- **Path:** `.agent/skills/database-design/SKILL.md`

### deep-thinking-enforcer
- **Set:** default
- **Kapan dipakai:** Wajib digunakan untuk memaksa agent berpikir mendalam, perlahan, dan detail sebelum bertindak. Mencegah eksekusi prematur dan asumsi dangkal.
- **Path:** `.agent/skills/deep-thinking-enforcer/SKILL.md`

### deployment-validation-config-validate
- **Set:** task:deploy
- **Kapan dipakai:** Create validation schemas, verify environment variables consistency, and validate configurations at application startup.
- **Path:** `.agent/skills/deployment-validation-config-validate/SKILL.md`

### design-taste-frontend
- **Set:** task:frontend-ui
- **Kapan dipakai:** Use when building high-agency frontend interfaces with strict design taste, calibrated color, responsive layout, and motion rules.
- **Path:** `.agent/skills/design-taste-frontend/SKILL.md`

### dewa-prompter-v2
- **Set:** task:planning-prd
- **Kapan dipakai:** Dewa Prompter v2 - arsitek prompt untuk mengubah PRD, roadmap, atau rencana fase yang sudah disetujui menjadi Prompt Master eksekusi untuk agen koding AI seperti Cursor, Claude Code, Bolt, GPT, atau Gemini. Gunakan saat pengguna meminta pr…
- **Path:** `.agent/skills/dewa-prompter-v2/SKILL.md`

### drizzle-orm-expert
- **Set:** task:backend-db
- **Kapan dipakai:** Expert in Drizzle ORM for TypeScript — schema design, relational queries, migrations, and serverless database integration.
- **Path:** `.agent/skills/drizzle-orm-expert/SKILL.md`

### elite-gsap-react-architecture
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Standar mutlak untuk penggunaan GSAP di React/Next.js menggunakan hook useGSAP untuk mencegah memory leak.
- **Path:** `.agent/skills/elite-gsap-react-architecture/SKILL.md`

### env-fortress
- **Set:** default, task:git-devops
- **Kapan dipakai:** Configuration security and secrets management for all development environments, covering Zod schema validation, Git exclusion configs, and leak preventions.
- **Path:** `.agent/skills/env-fortress/SKILL.md`

### environment-setup-guide
- **Set:** task:deploy
- **Kapan dipakai:** Guide developers through setting up development environments with proper tools, dependencies, and configurations.
- **Path:** `.agent/skills/environment-setup-guide/SKILL.md`

### expert-reasoning-operator
- **Set:** default, task:quality
- **Kapan dipakai:** Always-on untuk setiap task substantif; gunakan juga saat user meminta kemampuan maksimal, expert reasoning, 1000x/1000x lipat, upgrade aturan/skill, atau task berdampak lintas-file; memaksa evidence ledger, risk budget, alternatif, dan va…
- **Path:** `.agent/skills/expert-reasoning-operator/SKILL.md`

### expo-api-routes
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Guidelines for creating API routes in Expo Router with EAS Hosting
- **Path:** `.agent/skills/expo-api-routes/SKILL.md`

### expo-deployment
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Deploy Expo apps to production with EAS Build, EAS Submit, app store release metadata, OTA update channels, staged rollouts, rollback planning, and production validation.
- **Path:** `.agent/skills/expo-deployment/SKILL.md`

### expo-dev-client
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Build and distribute Expo development clients locally or via TestFlight
- **Path:** `.agent/skills/expo-dev-client/SKILL.md`

### expo-tailwind-setup
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Set up Tailwind CSS v4 in Expo with react-native-css and NativeWind v5 for universal styling
- **Path:** `.agent/skills/expo-tailwind-setup/SKILL.md`

### framer-motion
- **Set:** task:animation-3d
- **Kapan dipakai:** Production-ready declarative animations for React and Next.js.
- **Path:** `.agent/skills/framer-motion/SKILL.md`

### frontend-api-integration-patterns
- **Set:** task:frontend-ui
- **Kapan dipakai:** Production-ready patterns for integrating frontend applications with backend APIs, including race condition handling, request cancellation, retry strategies, error normalization, and UI state management.
- **Path:** `.agent/skills/frontend-api-integration-patterns/SKILL.md`

### frontend-design
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Core UI/UX engineering standards for typography scales, visual hierarchies, modern color palettes, layout layering, and responsive grids.
- **Path:** `.agent/skills/frontend-design/SKILL.md`

### frontend-dev-guidelines
- **Set:** task:frontend-ui
- **Kapan dipakai:** Architectural and performance coding standards for React, TypeScript, Suspense-first dynamic rendering, code organization, and type safety.
- **Path:** `.agent/skills/frontend-dev-guidelines/SKILL.md`

### frontend-developer
- **Set:** default
- **Kapan dipakai:** Core technical standards for React 19, Next.js 15, semantic HTML, client-side state management, and responsive layouts.
- **Path:** `.agent/skills/frontend-developer/SKILL.md`

### frontend-mobile-development-component-scaffold
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Scaffold production-ready React or React Native components with TypeScript props, accessible interactions, platform-aware styling, tests, stories, and barrel exports. Use for component generation or refactors that need repeatable structure.
- **Path:** `.agent/skills/frontend-mobile-development-component-scaffold/SKILL.md`

### frontend-security-coder
- **Set:** task:security-coding
- **Kapan dipakai:** Hands-on frontend security coding — XSS prevention, safe DOM manipulation, CSP setup, secure forms, token storage, clickjacking protection. Untuk implementasi (bukan audit).
- **Path:** `.agent/skills/frontend-security-coder/SKILL.md`

### gemini-api-dev
- **Set:** task:ai-llm
- **Kapan dipakai:** The Gemini API provides access to Google's advanced AI models. Implements text generation, multimodal understanding, function calling, and structured outputs.
- **Path:** `.agent/skills/gemini-api-dev/SKILL.md`

### gemini-api-integration
- **Set:** task:ai-llm
- **Kapan dipakai:** Use when integrating Google Gemini API into projects. Covers model selection, multimodal inputs, streaming, function calling, and production best practices.
- **Path:** `.agent/skills/gemini-api-integration/SKILL.md`

### git-survival-guide
- **Set:** default, task:git-devops
- **Kapan dipakai:** Git version control survival patterns for developers, covering push protection recoveries, commit credentials purging, rebase conflict resolutions, and history recovery.
- **Path:** `.agent/skills/git-survival-guide/SKILL.md`

### github-actions-templates
- **Set:** task:cicd
- **Kapan dipakai:** Production-ready GitHub Actions workflow patterns for testing, building, and deploying applications.
- **Path:** `.agent/skills/github-actions-templates/SKILL.md`

### google-sheets-automation
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Lightweight Google Sheets integration with standalone OAuth authentication. No MCP server required. Full read/write access.
- **Path:** `.agent/skills/google-sheets-automation/SKILL.md`

### googlesheets-automation
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Automate Google Sheets operations (read, write, format, filter, manage spreadsheets) via Rube MCP (Composio). Read/write data, manage tabs, apply formatting, and search rows programmatically.
- **Path:** `.agent/skills/googlesheets-automation/SKILL.md`

### gsap-core
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** GreenSock Animation Platform. Standard industri untuk animasi web performan.
- **Path:** `.agent/skills/gsap-core/SKILL.md`

### gsap-frameworks
- **Set:** default
- **Kapan dipakai:** Official GSAP skill for Vue, Svelte, and other non-React frameworks — lifecycle, scoping selectors, and cleanup on unmount.
- **Path:** `.agent/skills/gsap-frameworks/SKILL.md`

### gsap-horizontal-parallax
- **Set:** default
- **Kapan dipakai:** Official architecture for building robust 2.5D horizontal scroll parallax experiences using GSAP ScrollTrigger.
- **Path:** `.agent/skills/gsap-horizontal-parallax/SKILL.md`

### gsap-performance
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Official GSAP skill for performance optimization — GPU transforms, will-change layer promotion, avoiding layout thrashing, and high-frequency quickTo.
- **Path:** `.agent/skills/gsap-performance/SKILL.md`

### gsap-plugins
- **Set:** default
- **Kapan dipakai:** Official GSAP skill for GSAP plugins — registration, ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, MorphSVG, DrawSVG, and MotionPath.
- **Path:** `.agent/skills/gsap-plugins/SKILL.md`

### gsap-react
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Official GSAP skill for React — integration, useGSAP hook, scoping refs, contextSafe, and StrictMode compatibility.
- **Path:** `.agent/skills/gsap-react/SKILL.md`

### gsap-scrolltrigger
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Official GSAP skill for ScrollTrigger — scroll-driven timelines, pinning, scrub, and containerAnimation.
- **Path:** `.agent/skills/gsap-scrolltrigger/SKILL.md`

### gsap-timeline
- **Set:** default, task:gsap-ui
- **Kapan dipakai:** Official GSAP skill for timelines — sequencing animations, position parameters, defaults, and labels.
- **Path:** `.agent/skills/gsap-timeline/SKILL.md`

### gsap-utils
- **Set:** default
- **Kapan dipakai:** Official GSAP skill for gsap.utils — clamp, mapRange, normalize, interpolate, random, snap, toArray, wrap, and pipe helper utilities.
- **Path:** `.agent/skills/gsap-utils/SKILL.md`

### howler-js
- **Set:** task:animation-3d
- **Kapan dipakai:** Web audio library for interactive soundscapes and browser-based audio environments.
- **Path:** `.agent/skills/howler-js/SKILL.md`

### interactive-portfolio
- **Set:** task:animation-3d
- **Kapan dipakai:** Architecting high-converting, responsive portfolios that showcase projects and convert visits to opportunities.
- **Path:** `.agent/skills/interactive-portfolio/SKILL.md`

### javascript-testing-patterns
- **Set:** task:testing-quality
- **Kapan dipakai:** Comprehensive guide for implementing robust testing strategies in JavaScript/TypeScript applications using modern testing frameworks and best practices.
- **Path:** `.agent/skills/javascript-testing-patterns/SKILL.md`

### landing-page-generator
- **Set:** task:frontend-ui
- **Kapan dipakai:** Generates high-converting Next.js/React landing pages with Tailwind CSS. Uses PAS, AIDA, and BAB frameworks for optimized copy/components (Heroes, Features, Pricing). Focuses on Core Web Vitals/SEO.
- **Path:** `.agent/skills/landing-page-generator/SKILL.md`

### laravel-expert
- **Set:** default, task:backend-db
- **Kapan dipakai:** Senior Laravel Engineer role for production-grade, maintainable, and idiomatic Laravel solutions.
- **Path:** `.agent/skills/laravel-expert/SKILL.md`

### lenis-scroll
- **Set:** task:animation-3d
- **Kapan dipakai:** Smooth scrolling using Lenis, normalized scroll behavior, and integration with GSAP ScrollTrigger.
- **Path:** `.agent/skills/lenis-scroll/SKILL.md`

### lessons-capture
- **Set:** default, task:reference-verification
- **Kapan dipakai:** Lessons Capture - disiplin biar pengetahuan numpuk lintas-project (compounding). Gunakan di akhir project/fase, saat retrospektif, atau saat ketemu pola/bug yang kemungkinan bakal berulang, serta setiap kali user mengoreksi jawaban teknis.…
- **Path:** `.agent/skills/lessons-capture/SKILL.md`

### llm-app-patterns
- **Set:** task:ai-llm
- **Kapan dipakai:** Production-ready patterns for building LLM applications, inspired by Dify and industry best practices.
- **Path:** `.agent/skills/llm-app-patterns/SKILL.md`

### llm-structured-output
- **Set:** task:ai-llm
- **Kapan dipakai:** Get reliable JSON, enums, and typed objects from LLMs using response_format, tool_use, and schema-constrained decoding.
- **Path:** `.agent/skills/llm-structured-output/SKILL.md`

### locomotive-scroll
- **Set:** task:animation-3d
- **Kapan dipakai:** Smooth scrolling and parallax effects with intersection observer and custom scroll-trigger proxies.
- **Path:** `.agent/skills/locomotive-scroll/SKILL.md`

### lottie-web
- **Set:** task:animation-3d
- **Kapan dipakai:** Render After Effects animations natively on the web using Adobe After Effects JSON exports.
- **Path:** `.agent/skills/lottie-web/SKILL.md`

### mobile-design
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** (Mobile-First · Touch-First · Platform-Respectful)
- **Path:** `.agent/skills/mobile-design/SKILL.md`

### mobile-developer
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Develop React Native, Flutter, Expo, SwiftUI, or Android apps with modern architecture, native integrations, offline sync, performance optimization, secure storage, testing, CI/CD, and app store readiness.
- **Path:** `.agent/skills/mobile-developer/SKILL.md`

### mobile-security-coder
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Implement secure mobile code for React Native, Expo, Flutter, iOS, and Android with input validation, secure storage, WebView hardening, deep link safety, certificate pinning, privacy controls, and OWASP MASVS-style verification.
- **Path:** `.agent/skills/mobile-security-coder/SKILL.md`

### monorepo-multi-bot
- **Set:** default, task:git-devops
- **Kapan dipakai:** Workspace management for multiple bots and projects inside a single repository, covering workspaces configuration, shared code libraries, and selective environment setup.
- **Path:** `.agent/skills/monorepo-multi-bot/SKILL.md`

### neon-postgres
- **Set:** task:backend-db
- **Kapan dipakai:** Expert patterns for Neon serverless Postgres, branching, connection pooling, and Prisma/Drizzle integration.
- **Path:** `.agent/skills/neon-postgres/SKILL.md`

### nextjs-app-router-patterns
- **Set:** default, task:nextjs
- **Kapan dipakai:** Comprehensive patterns for Next.js 14+ App Router architecture, Server Components, and modern full-stack React development.
- **Path:** `.agent/skills/nextjs-app-router-patterns/SKILL.md`

### nextjs-best-practices
- **Set:** default, task:nextjs
- **Kapan dipakai:** Next.js App Router principles. Server Components, data fetching, routing patterns.
- **Path:** `.agent/skills/nextjs-best-practices/SKILL.md`

### nextjs-supabase-auth
- **Set:** task:auth, task:frontend-ui
- **Kapan dipakai:** Expert integration of Supabase Auth with Next.js App Router using @supabase/ssr helpers and HTTP-only cookies.
- **Path:** `.agent/skills/nextjs-supabase-auth/SKILL.md`

### nodejs-backend-patterns
- **Set:** default, task:backend-db
- **Kapan dipakai:** Comprehensive guidance for building scalable, maintainable, and production-ready Node.js backend applications with modern frameworks, architectural patterns, and best practices.
- **Path:** `.agent/skills/nodejs-backend-patterns/SKILL.md`

### nodejs-best-practices
- **Set:** task:node-api
- **Kapan dipakai:** Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying.
- **Path:** `.agent/skills/nodejs-best-practices/SKILL.md`

### nosql-expert
- **Set:** task:node-api
- **Kapan dipakai:** Expert guidance for distributed NoSQL databases (Cassandra, DynamoDB). Focuses on mental models, query-first modeling, single-table design, and avoiding hot partitions.
- **Path:** `.agent/skills/nosql-expert/SKILL.md`

### observability-engineer
- **Set:** task:observability
- **Kapan dipakai:** Build production-ready monitoring, logging, and tracing systems. Implements comprehensive observability strategies, SLI/SLO management, and incident response workflows.
- **Path:** `.agent/skills/observability-engineer/SKILL.md`

### official-reference-verifier
- **Set:** default, task:quality, task:reference-verification
- **Kapan dipakai:** Wajib untuk task yang menyentuh 33 topik pada official-reference-map.json; memaksa pengecekan sumber utama, pre-flight lessons, cross-check sebelum delivery, dan pencatatan koreksi user sebelum lanjut.
- **Path:** `.agent/skills/official-reference-verifier/SKILL.md`

### openapi-spec-generation
- **Set:** task:node-api
- **Kapan dipakai:** Generate and maintain OpenAPI 3.1 specifications from code, design-first specs, and validation patterns.
- **Path:** `.agent/skills/openapi-spec-generation/SKILL.md`

### performance-engineer
- **Set:** task:performance
- **Kapan dipakai:** Optimasi FPS layar, kecepatan muat, pencegahan re-render, dan perlindungan memori.
- **Path:** `.agent/skills/performance-engineer/SKILL.md`

### performance-optimizer
- **Set:** task:performance
- **Kapan dipakai:** Identifies and fixes performance bottlenecks in code, databases, and APIs. Measures before and after to prove improvements.
- **Path:** `.agent/skills/performance-optimizer/SKILL.md`

### performance-profiling
- **Set:** task:performance
- **Kapan dipakai:** Performance profiling principles. Measurement, analysis, and optimization techniques.
- **Path:** `.agent/skills/performance-profiling/SKILL.md`

### phased-delivery
- **Set:** default
- **Kapan dipakai:** Pecah project jadi fase kecil, jelaskan hasil tiap fase, cek di browser, minta persetujuan sebelum lanjut. Anti 'ngoding semua sekaligus lalu bilang selesai'.
- **Path:** `.agent/skills/phased-delivery/SKILL.md`

### playwright
- **Set:** task:testing-quality
- **Kapan dipakai:** Framework for Web Testing and Automation. Allows testing Chromium, Firefox, and WebKit with a single API.
- **Path:** `.agent/skills/playwright/SKILL.md`

### postgres-best-practices
- **Set:** task:backend-db
- **Kapan dipakai:** Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
- **Path:** `.agent/skills/postgres-best-practices/SKILL.md`

### prd-architect-pro
- **Set:** task:planning-prd
- **Kapan dipakai:** PRD Architect Pro - senior product manager untuk mengubah ide, roadmap, atau hasil Arsitek Pikiran menjadi PRD.md ringkas, testable, dan siap menjadi acuan build. Gunakan saat user meminta PRD, spesifikasi produk, scope MVP, acceptance cri…
- **Path:** `.agent/skills/prd-architect-pro/SKILL.md`

### product-design
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Design de produto nivel Apple — sistemas visuais, UX flows, acessibilidade, linguagem visual proprietaria, design tokens, prototipagem e handoff. Cobre Figma, design systems, tipografia, cor, espacamento, motion design e principios de desi…
- **Path:** `.agent/skills/product-design/SKILL.md`

### project-memory
- **Set:** default
- **Kapan dipakai:** Anti-amnesia: AI wajib baca PROJECT_MEMORY.md di awal sesi dan update di akhir fase. Menjaga kontinuitas lintas sesi, hari, dan device.
- **Path:** `.agent/skills/project-memory/SKILL.md`

### prompt-amplifier
- **Set:** default
- **Kapan dipakai:** Jangan langsung ngoding. Tanya dulu (maks 5 pertanyaan), jelaskan rencana, minta persetujuan, baru eksekusi. Ubah permintaan sederhana jadi brief profesional.
- **Path:** `.agent/skills/prompt-amplifier/SKILL.md`

### prompt-engineering
- **Set:** task:ai-llm
- **Kapan dipakai:** Expert guide on prompt engineering patterns, best practices, and optimization techniques. Use when user wants to improve prompts, learn prompting strategies, or debug agent behavior.
- **Path:** `.agent/skills/prompt-engineering/SKILL.md`

### python-asset-pipeline
- **Set:** default
- **Kapan dipakai:** Expert guidelines for building portable Python-based visual asset processing pipelines (OpenCV, contours, SVG path extraction, deterministic seeding, and clashing transform wrappers).
- **Path:** `.agent/skills/python-asset-pipeline/SKILL.md`

### python-expert
- **Set:** default
- **Kapan dipakai:** Ultimate Python expertise. Use this skill when writing, reviewing, or designing Python code architecture. Prioritizes best practices, modern type hints, memory efficiency, and clean code (SOLID).
- **Path:** `.agent/skills/python-expert/SKILL.md`

### react-best-practices
- **Set:** default, task:nextjs
- **Kapan dipakai:** Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel.
- **Path:** `.agent/skills/react-best-practices/SKILL.md`

### react-component-performance
- **Set:** task:nextjs
- **Kapan dipakai:** Diagnose slow React components and suggest targeted performance fixes.
- **Path:** `.agent/skills/react-component-performance/SKILL.md`

### react-modernization
- **Set:** task:frontend-ui
- **Kapan dipakai:** Master React version upgrades, class to hooks migration, concurrent features adoption, and codemods for automated transformation.
- **Path:** `.agent/skills/react-modernization/SKILL.md`

### react-native-architecture
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Architect production React Native and Expo apps with feature boundaries, navigation, state management, native module isolation, offline-first data, performance budgets, testing gates, and EAS-aware release structure.
- **Path:** `.agent/skills/react-native-architecture/SKILL.md`

### react-nextjs-development
- **Set:** task:frontend-ui
- **Kapan dipakai:** React and Next.js 14+ application development with App Router, Server Components, TypeScript, Tailwind CSS, and modern frontend patterns.
- **Path:** `.agent/skills/react-nextjs-development/SKILL.md`

### react-patterns
- **Set:** task:frontend-ui
- **Kapan dipakai:** Elite React 18+ Architecture and Performance Patterns.
- **Path:** `.agent/skills/react-patterns/SKILL.md`

### react-state-management
- **Set:** task:frontend-ui
- **Kapan dipakai:** Master modern React state management with Redux Toolkit, Zustand, Jotai, and React Query.
- **Path:** `.agent/skills/react-state-management/SKILL.md`

### react-three-fiber
- **Set:** task:animation-3d
- **Kapan dipakai:** Taking Three.js and combining it with React. The pinnacle of 3D web experiences.
- **Path:** `.agent/skills/react-three-fiber/SKILL.md`

### redis
- **Set:** task:cache
- **Kapan dipakai:** In-memory data structure store, used as a distributed, in-memory key-value database, cache, session store, and message broker.
- **Path:** `.agent/skills/redis/SKILL.md`

### screen-reader-testing
- **Set:** task:accessibility
- **Kapan dipakai:** Practical guide to testing web applications with screen readers for comprehensive accessibility validation.
- **Path:** `.agent/skills/screen-reader-testing/SKILL.md`

### scroll-experience
- **Set:** task:animation-3d
- **Kapan dipakai:** Expert in building immersive scroll-driven experiences - parallax storytelling, scroll animations, and interactive narratives.
- **Path:** `.agent/skills/scroll-experience/SKILL.md`

### secrets-management
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Secure secrets management practices for CI/CD pipelines using Vault, AWS Secrets Manager, and other tools.
- **Path:** `.agent/skills/secrets-management/SKILL.md`

### security-audit
- **Set:** default, task:quality
- **Kapan dipakai:** Comprehensive security auditing workflow covering web application testing, API security, penetration testing, vulnerability scanning, and security hardening.
- **Path:** `.agent/skills/security-audit/SKILL.md`

### self-review-gate
- **Set:** default
- **Kapan dipakai:** Audit internal wajib sebelum deliver. Checklist kode, keamanan, UI/UX, SEO, performa, dan file. Kalau ada yang gagal, perbaiki dulu — jangan kirim hasil setengah jadi.
- **Path:** `.agent/skills/self-review-gate/SKILL.md`

### sentry-automation
- **Set:** task:observability
- **Kapan dipakai:** Automate Sentry tasks via Rube MCP (Composio) to triage issues, configure alert rules, track releases, and monitor crons.
- **Path:** `.agent/skills/sentry-automation/SKILL.md`

### seo-audit
- **Set:** task:seo
- **Kapan dipakai:** Diagnose and audit SEO issues affecting crawlability, indexation, rankings, and organic performance.
- **Path:** `.agent/skills/seo-audit/SKILL.md`

### seo-fundamentals
- **Set:** task:seo
- **Kapan dipakai:** Generative Engine Optimization for AI search engines (ChatGPT, Claude, Perplexity) and crawlers.
- **Path:** `.agent/skills/seo-fundamentals/SKILL.md`

### seo-meta-optimizer
- **Set:** task:seo
- **Kapan dipakai:** Creates optimized meta titles, descriptions, and URL suggestions based on character limits and best practices. Generates compelling, keyword-rich metadata.
- **Path:** `.agent/skills/seo-meta-optimizer/SKILL.md`

### seo-schema
- **Set:** task:seo
- **Kapan dipakai:** Detect, validate, and generate Schema.org structured data. JSON-LD format preferred.
- **Path:** `.agent/skills/seo-schema/SKILL.md`

### seo-sitemap
- **Set:** task:seo
- **Kapan dipakai:** Analyze existing XML sitemaps or generate new ones with industry templates. Validates format, URLs, and structure.
- **Path:** `.agent/skills/seo-sitemap/SKILL.md`

### session-boot
- **Set:** default, task:quality
- **Kapan dipakai:** Wajib di awal setiap output agent. Memaksa disclosure skill pada jawaban trivial dan header I AM CRAZY lengkap pada output substantif sebelum konten lain.
- **Path:** `.agent/skills/session-boot/SKILL.md`

### shadcn
- **Set:** task:frontend-ui
- **Kapan dipakai:** Manages shadcn/ui components and projects, providing context, documentation, and usage patterns for building modern design systems.
- **Path:** `.agent/skills/shadcn/SKILL.md`

### shader-programming-glsl
- **Set:** task:animation-3d
- **Kapan dipakai:** Expert guide for writing efficient GLSL shaders (Vertex/Fragment) for web and game engines.
- **Path:** `.agent/skills/shader-programming-glsl/SKILL.md`

### skill-excellence-ratchet
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Quality ratchet — skill library hanya boleh naik kualitasnya, tidak boleh turun. Mewajibkan deep thinking, objektivitas, belajar dari contoh eksternal yang aman, dan pertumbuhan skill yang terus-menerus (compounding). Gunakan saat menambah…
- **Path:** `.agent/skills/skill-excellence-ratchet/SKILL.md`

### skill-upgrader
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Meta-skill untuk meng-upgrade skill library dari Good ke Excellent secara sistematis. Gunakan saat ada perintah "upgrade skill", "perbaiki skill", "maksimalin skill", atau saat quality audit menunjukkan skill masih di level Good. Referensi…
- **Path:** `.agent/skills/skill-upgrader/SKILL.md`

### spline-3d-integration
- **Set:** task:animation-3d
- **Kapan dipakai:** Use when adding interactive 3D scenes from Spline.design to web projects.
- **Path:** `.agent/skills/spline-3d-integration/SKILL.md`

### split-type
- **Set:** task:animation-3d
- **Kapan dipakai:** Split text into characters, words, and lines for stagger and reveal typography animations.
- **Path:** `.agent/skills/split-type/SKILL.md`

### supabase
- **Set:** default, task:backend-db
- **Kapan dipakai:** Open source Firebase alternative with PostgreSQL, Auth, and Storage.
- **Path:** `.agent/skills/supabase/SKILL.md`

### systematic-debugging
- **Set:** task:testing-quality
- **Kapan dipakai:** Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.
- **Path:** `.agent/skills/systematic-debugging/SKILL.md`

### tailwind-design-system
- **Set:** task:frontend-ui
- **Kapan dipakai:** Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.
- **Path:** `.agent/skills/tailwind-design-system/SKILL.md`

### tailwind-patterns
- **Set:** task:frontend-ui
- **Kapan dipakai:** Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design token architecture.
- **Path:** `.agent/skills/tailwind-patterns/SKILL.md`

### tanstack-query-expert
- **Set:** task:frontend-ui
- **Kapan dipakai:** Expert in TanStack Query (React Query) — asynchronous state management.
- **Path:** `.agent/skills/tanstack-query-expert/SKILL.md`

### telegram-bot-builder
- **Set:** task:bot-automation
- **Kapan dipakai:** Expert in building Telegram bots that solve real problems - from simple automation to complex AI-powered bots.
- **Path:** `.agent/skills/telegram-bot-builder/SKILL.md`

### telegram-mini-app
- **Set:** task:bot-automation
- **Kapan dipakai:** Expert in building Telegram Mini Apps (TWA) - web apps that run inside Telegram with native-like experience.
- **Path:** `.agent/skills/telegram-mini-app/SKILL.md`

### test-driven-development
- **Set:** task:testing-quality
- **Kapan dipakai:** Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle.
- **Path:** `.agent/skills/test-driven-development/SKILL.md`

### three-js-expert
- **Set:** task:animation-3d
- **Kapan dipakai:** 3D WebGL library for advanced graphics and WebGL scene optimizations.
- **Path:** `.agent/skills/three-js-expert/SKILL.md`

### threejs-fundamentals
- **Set:** task:animation-3d
- **Kapan dipakai:** Three.js scene setup, cameras, renderer, Object3D hierarchy, and coordinate systems.
- **Path:** `.agent/skills/threejs-fundamentals/SKILL.md`

### typescript-expert
- **Set:** task:frontend-ui
- **Kapan dipakai:** TypeScript and JavaScript expert with type-level programming, performance optimization, and modular configurations.
- **Path:** `.agent/skills/typescript-expert/SKILL.md`

### ui-a11y
- **Set:** task:accessibility
- **Kapan dipakai:** Audit a StyleSeed-based component or page for WCAG 2.2 AA issues and apply practical accessibility fixes where the code makes them safe.
- **Path:** `.agent/skills/ui-a11y/SKILL.md`

### ui-ux-designer
- **Set:** task:frontend-ui
- **Kapan dipakai:** Create interface designs, wireframes, and design systems. Masters user research, accessibility standards, and modern design tools.
- **Path:** `.agent/skills/ui-ux-designer/SKILL.md`

### unslop
- **Set:** default
- **Kapan dipakai:** Post-process AI-generated text to strip AI writing patterns (slop) before publishing.
- **Path:** `.agent/skills/unslop/SKILL.md`

### upgrading-expo
- **Set:** on-demand:mobile(installed), task:mobile
- **Kapan dipakai:** Upgrade Expo SDK versions safely by reviewing release notes, applying `expo install --fix`, migrating config and deprecated APIs, validating native dependencies, and testing iOS/Android/web builds.
- **Path:** `.agent/skills/upgrading-expo/SKILL.md`

### vercel-deployment
- **Set:** default, task:deploy
- **Kapan dipakai:** Expert knowledge for deploying to Vercel with Next.js, Edge configurations, and environments isolation.
- **Path:** `.agent/skills/vercel-deployment/SKILL.md`

### verification-before-completion
- **Set:** default, task:quality, task:reference-verification
- **Kapan dipakai:** Claiming work is complete without verification is dishonesty, not efficiency.
- **Path:** `.agent/skills/verification-before-completion/SKILL.md`

### wcag-audit-patterns
- **Set:** task:accessibility
- **Kapan dipakai:** Comprehensive guide to auditing web content against WCAG 2.2 guidelines with actionable remediation strategies.
- **Path:** `.agent/skills/wcag-audit-patterns/SKILL.md`

### web-artifacts-builder
- **Set:** task:frontend-ui
- **Kapan dipakai:** To build powerful frontend claude.ai artifacts, follow these steps.
- **Path:** `.agent/skills/web-artifacts-builder/SKILL.md`

### web-audio-engineering
- **Set:** default, task:animation-3d
- **Kapan dipakai:** Advanced patterns for Web Audio API, real-time frequency analysis (FFT), canvas audio visualizers, and linking sound waves to GSAP animations.
- **Path:** `.agent/skills/web-audio-engineering/SKILL.md`

### web-design-guidelines
- **Set:** unrouted (lihat router)
- **Kapan dipakai:** Review files for compliance with Web Interface Guidelines.
- **Path:** `.agent/skills/web-design-guidelines/SKILL.md`

### web-mobile-joystick
- **Set:** task:animation-3d
- **Kapan dipakai:** Expert patterns for implementing virtual joysticks and touch camera swipes in Three.js for mobile browsers.
- **Path:** `.agent/skills/web-mobile-joystick/SKILL.md`

### web-performance-optimization
- **Set:** default, task:performance
- **Kapan dipakai:** Optimize website and web application performance including loading speed, Core Web Vitals, bundle size, caching strategies, and runtime performance.
- **Path:** `.agent/skills/web-performance-optimization/SKILL.md`

### web-scraper
- **Set:** task:bot-automation
- **Kapan dipakai:** Multi-strategy web data extraction with dynamic fallback checks, content classification, and output format wrappers.
- **Path:** `.agent/skills/web-scraper/SKILL.md`

### web-security-testing
- **Set:** task:security-coding
- **Kapan dipakai:** Hands-on web app security testing workflow — 7 fase OWASP Top 10 (recon, injection, XSS, auth, access control, headers, reporting). Untuk pentest dan bug bounty.
- **Path:** `.agent/skills/web-security-testing/SKILL.md`

### webapp-testing
- **Set:** task:testing-quality
- **Kapan dipakai:** To test local web applications, write native Python Playwright scripts.
- **Path:** `.agent/skills/webapp-testing/SKILL.md`

### whatsapp-bot-architecture
- **Set:** default, task:bot-automation
- **Kapan dipakai:** Production-grade architecture for WhatsApp bots using whatsapp-web.js or Baileys, covering session management, anti-ban throttling, message queues, and error recovery.
- **Path:** `.agent/skills/whatsapp-bot-architecture/SKILL.md`

### whatsapp-cloud-api
- **Set:** task:bot-automation
- **Kapan dipakai:** Integration with WhatsApp Business Cloud API (Meta), covering messages, templates, HMAC-SHA256 webhooks, and automation boilerplates.
- **Path:** `.agent/skills/whatsapp-cloud-api/SKILL.md`

### youtube-automation
- **Set:** task:bot-automation
- **Kapan dipakai:** Automate YouTube tasks via Rube MCP (Composio), covering video uploads, metadata management, playlist organization, and analytics extraction.
- **Path:** `.agent/skills/youtube-automation/SKILL.md`

### youtube-summarizer
- **Set:** task:bot-automation
- **Kapan dipakai:** Extract transcripts from YouTube videos and generate comprehensive, detailed summaries using intelligent analysis frameworks.
- **Path:** `.agent/skills/youtube-summarizer/SKILL.md`

### zdog
- **Set:** task:animation-3d
- **Kapan dipakai:** Flat, round, designer-friendly pseudo-3D engine for canvas and SVG.
- **Path:** `.agent/skills/zdog/SKILL.md`
