---
name: llm-structured-output
description: Get reliable JSON, enums, and typed objects from LLMs using response_format, tool_use, and schema-constrained decoding.
risk: medium (schema validation failures, refusal response exceptions, model latency spikes, invalid ref references)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# LLM Structured Output

> **One-liner:** Guidelines for enforcing schema constraints (Zod/Pydantic) in LLM APIs, handling structured responses with strict JSON modes, checking candidate refusals, and routing retry logic on validation errors.

## When to Use

- When building software pipelines where LLM outputs are directly consumed by code (such as database updates or UI components).
- When configuring schema structures in OpenAI (`response_format` with `json_schema`), Anthropic (`tool_choice`), or Gemini (`responseSchema`).
- When parsing raw unstructured text into typed data models.

## Why This Exists

If an application requests structured data from an LLM without configuring token-level schema constraints (e.g. relying only on system prompt instructions like "return JSON"), the model can return invalid JSON or omit required fields, crashing downstream parsers. Additionally, using loose JSON modes (like `{ type: "json_object" }` in OpenAI) without a strict schema guarantees valid syntax but not schema compliance. Enforcing Zod/Pydantic validation schemas, setting `strict: true` (or equivalent options), and handling error retry loops prevents runtime parsing failures.

## ALWAYS DO THIS

- **Enforce strict JSON schemas** — Define explicit models (Zod in JS/TS, Pydantic in Python) and pass them as native schema constraints to the model client constructor.
- **Set schema strictness parameters** — Set `"strict": true` (OpenAI) or equivalent flags to activate constrained decoding, preventing the model from outputting non-conforming tokens.
- **Inspect candidate refusal codes** — Check for safety refusals (e.g. `refusal` or `blockReason`) before accessing parsed results to prevent property access crashes.
- **Provide field-level descriptions** — Write explicit descriptions inside schemas for all fields to guide the model's extraction logic.
- **Implement schema validation retry loops** — Wrap parsing queries in try-catch blocks that feed validation errors back into the model for self-correction.

## NEVER DO THIS

- ❌ **DO NOT** use generic JSON modes (like `{ type: "json_object" }`) without defining a schema. **Why fails:** The model guarantees valid JSON syntax but not schema compliance; it can return arbitrary keys or incorrect data types, crashing application code. **Instead:** Always pass a structured JSON schema.
- ❌ **DO NOT** parse LLM response strings directly without checking for model refusal flags. **Why fails:** If the prompt triggers safety blocks, the model returns a refusal string or `null` instead of JSON; parsing the response directly will throw a syntax error. **Instead:** Check the refusal attribute before parsing.
- ❌ **DO NOT** define schema fields without descriptions. **Why fails:** Vague field names (like `status` or `flag`) confuse the model, causing it to return incorrect values. **Instead:** Add explicit, detailed descriptions to every field.
- ❌ **DO NOT** configure schemas with nested structures deeper than 3 levels. **Why fails:** Deep nesting increases latency and increases the probability of hitting output token limits before the JSON structure closes. **Instead:** Flatten schemas where possible.

---

## Constrained Decoding Generation Flow

Strict JSON schemas restrict the model's output vocabularies to guarantee compliant formats:

```
[System Schema] ──> [Token-level Constrained Decoder] ──> [Guaranteed Valid JSON Syntax & Keys]
                                                                        │
                                [Zod / Pydantic Verification] ◄─────────┘ (Ensures semantic bounds)
```

---

## Examples

### ✅ Good — Zod Structured Response with OpenAI Strict Mode

```typescript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const client = new OpenAI();

// 1. Define explicit Zod schema with field descriptions
const CustomerInvoiceSchema = z.object({
  vendorName: z.string().describe("The name of the company issuing the invoice"),
  totalAmount: z.number().positive().describe("The total invoice balance in USD"),
  dueDate: z.string().describe("ISO 8601 formatted due date, e.g. YYYY-MM-DD"),
  lineItems: z.array(
    z.object({
      description: z.string().describe("Description of item or service"),
      amount: z.number().positive().describe("Cost of line item")
    })
  ).describe("Detailed breakdown of invoice lines")
});

export async function parseInvoiceText(unstructuredText: string) {
  try {
    // 2. Request parsing using strict schema constraints
    const response = await client.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "Extract structured invoice parameters from the provided text." },
        { role: "user", content: unstructuredText }
      ],
      // Enforce strict schema constraints
      response_format: zodResponseFormat(CustomerInvoiceSchema, "invoice_parser")
    });

    const message = response.choices[0].message;

    // 3. Inspect refusal before processing results
    if (message.refusal) {
      throw new Error(`Invoice extraction refused by model safety guidelines: ${message.refusal}`);
    }

    const invoiceData = message.parsed;
    if (!invoiceData) {
      throw new Error("Received empty parsed output from model");
    }

    // 4. Run application validation checks
    return CustomerInvoiceSchema.parse(invoiceData);
  } catch (error) {
    console.error("❌ Failed to extract structured invoice data:", error);
    throw error;
  }
}
```

Why this passes: Configures a strict Zod schema, passes it to the `response_format` configuration, inspects model refusal states before parsing, and runs final validation checks.

### ❌ Bad — Loose JSON Modes, Indefinite Casing, and Missing Validation Checks

```typescript
import OpenAI from "openai";
const client = new OpenAI();

// ERROR 1: Requesting loose JSON mode without an explicit schema
export async function badInvoiceParse(text: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    // ERROR 2: Weak JSON mode guarantees syntax but not keys structures
    response_format: { type: "json_object" }, 
    messages: [
      { role: "system", content: "Extract invoice vendorName and totalAmount as JSON." },
      { role: "user", content: text }
    ]
  });

  const rawJson = response.choices[0].message.content || "";
  
  // ERROR 3: Parsing raw string directly without refusal checks or schema validation
  const data = JSON.parse(rawJson);
  
  // ERROR 4: Accessing properties without verification can raise undefined type errors
  return {
    vendor: data.vendorName.toUpperCase(), // Throws type error if vendorName is missing
    amount: data.totalAmount
  };
}
```

Why this fails: Uses loose JSON modes without schema constraints, parses strings directly without check parameters, and lacks model refusal verification.

---

## Failure Modes

- **The Loose JSON Mode Divergence:** Requesting JSON mode without schemas, leading to missing keys or unexpected types under load.
- **The Refusal Key Crash:** Attempting to parse responses that were refused by safety blocks, causing type errors.
- **The Deep Ref Nesting Timeout:** Constructing schemas with deep nesting or recursive references, leading to high latency.
- **The Non-Nullable Optional Panic:** Omitting default values for optional fields, forcing the model to generate placeholder data.
- **The Enum Casing Drift:** Defining strict enums (e.g. `["Shipped", "Pending"]`) while the model generates lowercase values, failing validation.
- **The Schema Violation Attempt:** Querying strict mode endpoints with schemas containing unsupported parameters (like `additionalProperties: true`), causing immediate API errors.

## Validation

Audit structured output schemas for Zod/Pydantic validation parameters:

1. **Verify that response formats enforce strict JSON schemas:**
   Check code files for format configurations:
   ```bash
   grep -rn "zodResponseFormat" src/
   # expected: Structured endpoint queries pass schema formats.
   ```
2. **Verify that OpenAI strict mode schemas disable additional properties:**
   Verify schema configs in code:
   ```bash
   grep -rn "strict" src/ | grep -v "use strict"
   # expected: Schema configurations set "strict": true.
   ```
3. **Verify model refusal verification logic:**
   Verify response candidate checks:
   ```bash
   grep -rn "refusal" src/ 2>/dev/null
   # expected: Verify that refusal states are checked before accessing parsed payloads.
   ```
4. **Identify schema structure boundaries:**
   Confirm schemas do not exceed 3 levels of nesting or contain recursive references to ensure fast decoding times.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi structured outputs:

> "Use the skill `llm-structured-output`. Read `.agent/skills/llm-structured-output/SKILL.md` before coding. Never use loose JSON modes without schemas or omit model refusal checks. Always use strict schema constraints (Zod/Pydantic), define field-level descriptions, and validate results."

## Related

- [ai-engineer](../ai-engineer/SKILL.md) — Production LLM workflows.
- [gemini-api-dev](../gemini-api-dev/SKILL.md) — Gemini SDK setups.
- [gemini-api-integration](../gemini-api-integration/SKILL.md) — Unified integration routes.
