---
name: gemini-api-dev
description: The Gemini API provides access to Google's advanced AI models. Implements text generation, multimodal understanding, function calling, and structured outputs.
risk: medium (deprecated SDK usage, exposed keys, rate limit blocks, JSON schema drifts)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Gemini API Development

> **One-liner:** Guidelines for developing with the unified Google GenAI SDK (`@google/genai`), implementing function calling, enforcing structured schema generation, and handling rate limits.

## When to Use

- When integrating Google's Gemini models into applications using official SDKs.
- When configuring multimodal data parsers (images, audio, video) for prompt feeds.
- When migrating legacy codebases from the deprecated `@google/generative-ai` package to the unified `@google/genai` SDK.

## Why This Exists

Google's legacy generative AI SDKs (like `@google/generative-ai` in JS or `google-generativeai` in Python) are deprecated. Continuing to use these old libraries results in deprecation errors and blocks access to advanced features like structured outputs and native code execution. Additionally, failing to verify the response `finishReason` can lead to silent errors when requests are truncated or blocked by safety filters. Enforcing the unified `@google/genai` SDK, explicit schema constraints, and status parsing ensures high reliability.

## ALWAYS DO THIS

- **Use the unified google-genai SDK** — Import from the new `@google/genai` (JS/TS) or `google-genai` (Python) packages instead of legacy versions.
- **Request structured JSON outputs** — Define structured schema constraints using the `responseSchema` and `responseMimeType: "application/json"` parameters to ensure predictable responses.
- **Check the finishReason code** — Always inspect the response `finishReason` (e.g. `STOP`, `MAX_TOKENS`, `SAFETY`) to verify the generation completed successfully before parsing text.
- **Implement rate-limiting backoff** — Wrap API calls in retry loops configured with exponential backoff to handle rate limits (`HTTP 429`).
- **Configure parameters explicitly** — Set `temperature`, `maxOutputTokens`, and safety settings explicitly in the generation config object.

## NEVER DO THIS

- ❌ **DO NOT** import or use the deprecated legacy libraries `@google/generative-ai` (JS) or `google-generativeai` (Python). **Why fails:** These packages are outdated, lack support for newer model APIs, and will eventually be retired, breaking the application. **Instead:** Use the unified `@google/genai` SDK.
- ❌ **DO NOT** parse response text directly without validating the `finishReason` key first. **Why fails:** If the response was cut off due to token limits or blocked by safety filters, the output will be partial or empty, causing JSON parsing crashes. **Instead:** Verify that `finishReason === 'STOP'`.
- ❌ **DO NOT** expose raw Gemini API keys directly in client-side codebases or public files. **Why fails:** Attackers can extract the key from browser bundles and use it to run up charges on your Google Cloud billing account. **Instead:** Route requests through a secure backend server.
- ❌ **DO NOT** hardcode model names or configuration parameters directly in application files. **Why fails:** Prevents shifting queries to newer models when updates occur, requiring a full code rebuild for minor changes. **Instead:** Configure model names in environment variables.

---

## Unified GenAI SDK Integration Flow

Unified client setups route queries and validate response states before processing outputs:

```
[App Request] ──> [GoogleGenAI Client] ──> [Query gemini-3-flash-preview] ──> [Check finishReason == 'STOP']
                                                                                      ├── YES ──> [Parse JSON Output]
                                                                                      └── NO  ──> [Handle Truncation/Error]
```

---

## Examples

### ✅ Good — JavaScript Unified SDK, Structured Schema, and FinishReason Checks

```typescript
// Import the unified Google GenAI SDK
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// 1. Initialize client using the unified SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define validation schemas
const TaskResponseSchema = z.object({
  taskName: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedHours: z.number().positive()
});

export async function generateStructuredTask(promptText: string) {
  try {
    // 2. Call model using the unified models manager API
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL_NAME || "gemini-3-flash-preview",
      contents: promptText,
      config: {
        // Enforce structured JSON output matching Zod schema
        responseMimeType: "application/json",
        responseSchema: TaskResponseSchema,
        temperature: 0.2,
        maxOutputTokens: 1000
      }
    });

    // 3. Always inspect finishReason before parsing text
    const candidate = response.candidates?.[0];
    if (!candidate || candidate.finishReason !== "STOP") {
      throw new Error(`Generation did not complete successfully. Reason: ${candidate?.finishReason}`);
    }

    const text = response.text;
    if (!text) {
      throw new Error("Received empty response from Gemini API");
    }

    // Validate the parsed output structure
    const parsedData = JSON.parse(text);
    return TaskResponseSchema.parse(parsedData);
  } catch (error) {
    console.error("❌ Gemini API query or validation failed:", error);
    throw error;
  }
}
```

Why this passes: Uses the unified `@google/genai` SDK, targets the modern client endpoints, enforces structured schemas, validates `finishReason === 'STOP'`, and handles parser errors.

### ❌ Bad — Legacy SDK Usage, Missing FinishReason Checks, and Exposed Keys

```typescript
// ERROR 1: Importing the deprecated legacy SDK
import { GoogleGenerativeAI } from "@google/generative-ai"; 

// ERROR 2: Hardcoding vulnerable API keys in code files
const genAI = new GoogleGenerativeAI("AIzaSyActualKeyExposedInCode..."); 

export async function badGenerate(prompt: string) {
  // ERROR 3: Querying using legacy model names and direct generator clients
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
  const result = await model.generateContent(prompt);
  
  // ERROR 4: Directly returning response text without verifying finishReason
  // Will throw a syntax error if the output is truncated or blocked
  const data = JSON.parse(result.response.text()); 
  return data;
}
```

Why this fails: Imports the deprecated legacy SDK, hardcodes sensitive API keys, uses deprecated models, and parses output text without verifying the finish state.

---

## Failure Modes

- **The Legacy Import Crash:** Deploying code that uses the outdated `@google/generative-ai` package, causing dependency resolve failures on modern runtimes.
- **The Silent Truncation Parse:** Attempting to parse truncated JSON strings when the model hits output token limits because `finishReason` was not checked.
- **The exposed client key billing:** Committing raw keys to frontend repositories, allowing third parties to copy the key and abuse the API.
- **The Legacy Model Deprecation:** Calling deprecated models (like `gemini-1.5-flash`), which returns error codes once Google retires the endpoints.
- **The Rate-Limit Timeout Lock:** Spawning high-frequency requests without exponential backoff retry loops, causing requests to fail during spikes.
- **The Code Execution Sandbox Drift:** Relying on python code execution features without capturing sandbox timeout limits.

## Validation

Validate Google GenAI SDK integration and connection setups:

1. **Verify that the deprecated legacy SDK is not imported:**
   Check code files for old import structures:
   ```bash
   grep -rn "@google/generative-ai" src/ lib/ 2>/dev/null
   # expected: zero matches. All files import '@google/genai'.
   ```
2. **Verify that finishReason checks are implemented:**
   Verify response parsing blocks in code:
   ```bash
   grep -rn "finishReason" src/ | grep -v "STOP"
   # expected: Verify that 'STOP' checks are associated with finishReason lookups.
   ```
3. **Verify API connectivity and version compatibility using curl:**
   ```bash
   curl -s "https://generativelanguage.googleapis.com/\$discovery/rest?version=v1beta" | grep -o "v1beta" | head -n 1
   # expected: "v1beta" - verifies the Discovery REST endpoint is reachable.
   ```
4. **Confirm environment variable configurations:**
   Verify that keys are not hardcoded:
   ```bash
   grep -rn "GEMINI_API_KEY" config/ 2>/dev/null
   # expected: Keys are loaded from process.env configurations.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengintegrasikan Gemini API:

> "Use the skill `gemini-api-dev`. Read `.agent/skills/gemini-api-dev/SKILL.md` before coding. Never import deprecated SDKs (like @google/generative-ai) or expose API keys. Always use the unified @google/genai SDK, enforce structured JSON schemas, verify response finishReasons, and implement retry limits."

## Related

- [ai-engineer](../ai-engineer/SKILL.md) — Production LLM workflows.
- [gemini-api-integration](../gemini-api-integration/SKILL.md) — Multi-model routers.
- [llm-structured-output](../llm-structured-output/SKILL.md) — JSON schema parsing.
