---
name: performance-profiling
description: Performance profiling principles. Measurement, analysis, and optimization techniques.
risk: medium (profiling resource overheads, CPU trace parsing issues, profiling configuration errors)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Performance Profiling

> **One-liner:** Guidelines for establishing performance baselines, profiling CPU/memory utilization, and analyzing Core Web Vitals parameters.

## When to Use

- When diagnosing page load latency issues or diagnosing slow application runtime loops.
- When identifying memory leak issues (detached DOM nodes, growing heap size patterns).
- When validating bundle composition files or verifying Core Web Vitals indicators.

## Why This Exists

You cannot optimize what you do not measure. Developers often guess which code blocks are slow, leading to micro-optimizations that have no real impact while leaving the main bottlenecks untouched. Furthermore, ignoring layout shifts (CLS) or interactivity delays (INP) leads to poor Core Web Vitals rankings and lower user retention. Enforcing structured profiling workflows, recording performance marks, and analyzing memory dumps identifies the exact code lines causing issues.

## ALWAYS DO THIS

- **Establish performance baselines before optimizing** — Record performance data (such as using Chrome DevTools Performance audits) to identify bottlenecks.
- **Trace memory allocation using heap snapshots** — Use allocation timelines to identify growing memory heap sizes or detached DOM nodes.
- **Measure execution times using Performance APIs** — Use `performance.mark()` and `performance.measure()` to get precise execution timing data.
- **Audit bundle dependencies using build analyzers** — Run visual map tools to identify large packages or duplicate dependency imports.
- **Validate Core Web Vitals thresholds** — Verify that LCP is under 2.5 seconds, INP is under 200 milliseconds, and CLS is under 0.1.

## NEVER DO THIS

- ❌ **DO NOT** guess what causes performance issues. **Why fails:** Developers waste time rewriting code that is not actually the bottleneck, leaving the real issue unresolved. **Instead:** Run a profile trace to find the slowest operations.
- ❌ **DO NOT** profile applications under ideal development environments. **Why fails:** Fast development machines and local networks hide latency and rendering issues that real mobile users experience. **Instead:** Throttling CPU speeds and simulating slow 3G networks.
- ❌ **DO NOT** ignore layout shift indicators (CLS) during page loading. **Why fails:** Elements jump around as assets load, causing users to misclick buttons, which hurts user experience and SEO rankings. **Instead:** Set explicit image dimensions and reserve space with skeletal layouts.
- ❌ **DO NOT** run profiling sessions with third-party browser extensions enabled. **Why fails:** Browser extensions inject their own scripts and styles, skewing CPU traces and profiling results. **Instead:** Run audits inside incognito browser windows.

---

## Performance Profiling Lifecycle

Tracing bottlenecks requires measuring baselines, finding issues, and verifying fixes:

```
[Record Baseline] ──> [Trace CPU/Memory Bottlenecks] ──> [Apply Targeted Fix] ──> [Verify Improvements]
```

---

## Examples

### ✅ Good — Timing Audits using Performance APIs and Incognito Isolation

#### 1. Accessible Timing Measurement Script (`utils/perfTracker.ts`)
```typescript
export async function executeHeavyTaskWrapper(dataPayload: any[]): Promise<any[]> {
  const startMark = "heavyTaskStart";
  const endMark = "heavyTaskEnd";
  const measureName = "heavyTaskExecution";

  // 1. Record starting performance mark
  performance.mark(startMark);

  // Perform processing task
  const processed = dataPayload.map(item => ({
    ...item,
    processedAt: new Date().toISOString(),
    valueHash: item.value * 2
  }));

  // 2. Record ending performance mark and measure difference
  performance.mark(endMark);
  performance.measure(measureName, startMark, endMark);

  // 3. Log timing results programmatically
  const entries = performance.getEntriesByName(measureName);
  if (entries.length > 0) {
    const duration = entries[0].duration;
    console.log(`[PERFORMANCE] Heavy task duration: ${duration.toFixed(2)}ms`);
    
    // Clear marks to prevent memory accumulation
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  }

  return processed;
}
```

Why this passes: Uses precise Performance APIs, measures the target code block, logs the timing data, and cleans up marks to prevent memory leaks.

### ❌ Bad — Guesswork Optimizations and Unisolated Profiling

```typescript
// ERROR 1: Optimizing code without measuring baselines or recording metrics
export function unmeasuredProcessing(data: any[]) {
  // ERROR 2: Using imprecise Date.now() which is vulnerable to system clock shifts
  const start = Date.now(); 

  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(data[i]);
  }

  const end = Date.now();
  console.log("Took: " + (end - start) + "ms"); // ERROR 3: Imprecise logging that can't be traced in tooling
  return results;
}
```

Why this fails: Guesses the performance behavior, uses imprecise date timers, and lacks clean performance measurement integration.

---

## Failure Modes

- **The Guesswork Trap:** Optimizing code based on assumptions rather than performance traces.
- **The Ideal Network Bias:** Testing performance without throttling CPU speeds or network connection parameters.
- **The Browser Extension Skew:** Profiling with active extensions enabled, corrupting CPU and memory metrics.
- **The Detached DOM Leak:** Retaining references to deleted DOM nodes, causing memory leaks.
- **The Incomplete Audit Baseline:** Attempting to optimize performance without measuring baseline metrics first.
- **The Date Object Timer:** Using imprecise date timers instead of precise performance mark APIs.

## Validation

Audit performance markers, testing environments, and profiling logs:

1. **Verify that timing measurements use Performance APIs:**
   Check code files:
   ```bash
   grep -rn "performance.mark" src/ || grep -rn "performance.measure" src/
   # expected: Timing audits utilize Performance APIs rather than raw Date calls.
   ```
2. **Verify bundle analysis configuration files:**
   Check package configurations:
   ```bash
   grep -rn "webpack-bundle-analyzer" package.json || grep -rn "source-map-explorer" package.json
   # expected: Bundle analysis tools are configured in the repository.
   ```
3. **Verify presence of Lighthouse audit scripts:**
   Check audit scripts:
   ```bash
   ls -la scripts/lighthouse_audit.py 2>/dev/null || grep -rn "lighthouse" package.json
   # expected: Verify that automated performance audit configurations exist.
   ```
4. **Identify unindexed database queries during profiles:**
   Scan slow query logs to confirm no unindexed database operations occur.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk memprofilkan aplikasi:

> "Use the skill `performance-profiling`. Read `.agent/skills/performance-profiling/SKILL.md` before coding. Never guess where bottlenecks are or profile in un-throttled environments. Always establish baselines, use performance.mark APIs, trace memory allocations, and analyze bundle sizes."

## Related

- [performance-engineer](../performance-engineer/SKILL.md) — CPU thread cleanups.
- [performance-optimizer](../performance-optimizer/SKILL.md) — Query tuning workflows.
- [web-performance-optimization](../web-performance-optimization/SKILL.md) — Core assets caching.
