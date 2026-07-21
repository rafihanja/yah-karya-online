---
name: observability-engineer
description: Build production-ready monitoring, logging, and tracing systems. Implements comprehensive observability strategies, SLI/SLO management, and incident response workflows.
risk: high (telemetry overhead, missing alert paths, trace propagation gaps, data leakage in logs)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Observability Engineer

> **One-liner:** Guidelines for instrumenting distributed tracing via OpenTelemetry, managing SLIs/SLOs availability budgets, aggregating logs, and setting up alerting thresholds.

## When to Use

- When configuring centralized log aggregators (ELK, Loki) or tracing systems (Jaeger, AWS X-Ray).
- When defining Service Level Indicators (SLIs) and Service Level Objectives (SLOs) for product endpoints.
- When instrumenting backend services with OpenTelemetry SDK tracing APIs.

## Why This Exists

Without distributed tracing, diagnosing performance regressions or timeouts across microservices is extremely difficult, relying on log time guesses. Additionally, if application loggers record sensitive parameters (such as passwords, credit cards, or authorization headers) in stdout streams, the system violates privacy rules. Enforcing OpenTelemetry traces, secure log scrubbing middlewares, and alert metrics thresholds prevents production blindspots.

## ALWAYS DO THIS

- **Instrument distributed trace context propagation** — Propagate trace context headers (W3C Trace Context) across network boundaries in HTTP/gRPC requests.
- **Scrub sensitive data from log payloads** — Implement input filters inside log handlers to redact credentials, tokens, or PII before writing.
- **Define actionable alert objectives** — Base alerts on Service Level Objective (SLO) error budget burn rates to reduce alert fatigue.
- **Set tracing sample rates** — Configure trace samplers (e.g. 5-10% probabilistic sampling) to reduce telemetry overhead and cost.
- **Correlate logs, metrics, and traces** — Include the active `trace_id` and `span_id` in log strings to quickly trace errors.

## NEVER DO THIS

- ❌ **DO NOT** use console stdout logs (`console.log()` or print statements) as the primary telemetry channel for production APIs. **Why fails:** Console logs lack structured formatting, timestamps, or trace context links, making logs parsing and alerts configuration impossible. **Instead:** Use a structured logging library like Winston or Pino.
- ❌ **DO NOT** record sensitive user parameters (like passwords, keys, or SSNs) in log payloads. **Why fails:** Exposes PII and credentials to logging dashboards, violating privacy standards. **Instead:** Scrub input keys matching secret regex patterns.
- ❌ **DO NOT** alert on simple CPU/RAM usage spikes. **Why fails:** High resource usage is normal during spikes; alerting on them causes noise and fatigue. **Instead:** Alert on user-facing symptoms like error rate spikes or latency SLO violations.
- ❌ **DO NOT** initialize tracer spans inside loop conditions without closing them. **Why fails:** Causes memory leaks and telemetry processing overflows, degrading API latency. **Instead:** Close spans immediately inside `finally` blocks.

---

## Distributed Trace Context Propagation Flow

Passing tracing headers across service boundaries ensures single trace timelines:

```
[Service A] ──(Injects traceparent Header)──> [HTTP Request] ──> [Service B (Extracts Context)] ──> [Single Trace Timeline]
```

---

## Examples

### ✅ Good — Structured Logging, OpenTelemetry Spans, and Context Propagation

```typescript
import { trace, context, propagation } from "@opentelemetry/api";
import pino from "pino";

// Initialize structured logger with redaction keys
const logger = pino({
  redact: {
    paths: ["req.headers.authorization", "password", "creditCard"],
    censor: "[REDACTED]"
  }
});

const tracer = trace.getTracer("payment-service");

export async function processUserOrderPayment(orderId: string, paymentDetails: any) {
  // 1. Initialize tracer span
  return await tracer.startActiveSpan("processPayment", async (span) => {
    try {
      span.setAttribute("order.id", orderId);
      logger.info({ orderId, traceId: span.spanContext().traceId }, "Processing user order payment");

      // Mock remote payment API fetch with context propagation headers
      const headers = {};
      propagation.inject(context.active(), headers);

      const response = await fetch("https://api.payments.com/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers // Injects W3C traceparent headers
        },
        body: JSON.stringify({ orderId, amount: paymentDetails.amount })
      });

      if (!response.ok) {
        throw new Error(`Payment gateway failed with status ${response.status}`);
      }

      span.setStatus({ code: 1 }); // OK
      return await response.json();
    } catch (error: any) {
      // 2. Track exception traces securely
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message }); // ERROR
      logger.error({ error, orderId }, "❌ Failed payment processing");
      throw error;
    } finally {
      // 3. Ensure span always closes
      span.end();
    }
  });
}
```

Why this passes: Configures structured loggers with automated keys redaction, initiates and closes tracer spans, records query metrics inside spans, and propagates trace contexts.

### ❌ Bad — Plain Console Logs, Unscrubbed PII, and Lacking Tracing Contexts

```typescript
// ERROR 1: Using plain console stdout statements for production logging
export async function badProcessPayment(orderId: string, paymentDetails: any) {
  // ERROR 2: Logging unscrubbed sensitive payment details (credit card)
  console.log(`Processing payment for order ${orderId}:`, paymentDetails); 

  try {
    // ERROR 3: Mock fetch lacking trace context propagation headers
    const response = await fetch("https://api.payments.com/charge", {
      method: "POST",
      body: JSON.stringify(paymentDetails)
    });
    
    return await response.json();
  } catch (error) {
    // ERROR 4: Logging raw error dumps without trace correlation IDs
    console.error("Payment failed", error); 
    throw error;
  }
}
```

Why this fails: Uses plain console logging, logs raw sensitive data, queries external APIs without trace propagation, and logs errors without trace correlation links.

---

## Failure Modes

- **The Telemetry Overhead Lag:** Configuring high-frequency trace sampling (e.g. 100%) on hot endpoints, adding latency to requests.
- **The Telemetry PII Spill:** Logging unscrubbed credentials or credit cards to log aggregators.
- **The Broken Trace Split:** Querying microservices without context headers, splitting single transactions into separate traces.
- **The Alert Fatigue Flood:** Setting alerts on raw resource limits (like CPU > 80%), causing on-call fatigue.
- **The Orphaned Span Leak:** Leaving spans open during execution errors, causing memory leaks.
- **The Empty Error Budget Outage:** Exhausting error budgets without triggering automatic deployments blocks.

## Validation

Audit observability setup for tracing spans, log sanitation, and error budgets:

1. **Verify that no plain console logs are used in API routes:**
   Check code files for console logs:
   ```bash
   grep -rn "console.log(" src/ | grep -v "node_modules" 2>/dev/null
   # expected: zero matches in production API route files.
   ```
2. **Verify that tracer spans are closed correctly:**
   Verify spans closing patterns:
   ```bash
   grep -rn "span\.end(" src/ 2>/dev/null
   # expected: Every started span has a matching .end() call in a finally block.
   ```
3. **Verify OpenTelemetry context headers propagation:**
   Verify header injections in code:
   ```bash
   grep -rn "propagation\.inject" src/ 2>/dev/null
   # expected: Outgoing HTTP client requests inject telemetry headers.
   ```
4. **Identify log redaction configurations:**
   Check logger setups to confirm keys like `password` or `authorization` are redacted.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi observability:

> "Use the skill `observability-engineer`. Read `.agent/skills/observability-engineer/SKILL.md` before coding. Never write plain console.log statements or log unscrubbed PII. Always use structured loggers, wrap operations in OpenTelemetry spans, propagate trace contexts, and verify span closing."

## Related

- [sentry-automation](../sentry-automation/SKILL.md) — Managed issue tracking.
- [nodejs-best-practices](../nodejs-best-practices/SKILL.md) — Production runtime logs.
- [api-security-best-practices](../api-security-best-practices/SKILL.md) — Data compliance rules.
