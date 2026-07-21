---
name: gemini-api-integration
description: Use when integrating Google Gemini API into projects. Covers model selection, multimodal inputs, streaming, function calling, and production best practices.
risk: high (API key leak, deprecated SDK methods, rate-limit bans, silent safety blockages)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Gemini API Integration

> **One-liner:** Guidelines for integrating Google Gemini models using the unified GenAI client, configuring file uploads, setting safety parameters, and handling response streaming.

## When to Use

- When developing applications that query Gemini models for chat, completion, or structured reasoning.
- When configuring media streams (large files, audio, video) using the Gemini File API.
- When configuring dynamic tool execution using function declarations and call handlers.

## Why This Exists

Integrations that rely on deprecated Google AI SDKs (`@google/generative-ai`) face network errors and lack access to newer reasoning models. Additionally, if an integration passes large base64 media payloads (> 20MB) directly in chat messages instead of uploading them via the File API first, requests crash due to HTTP payload size limits. Enforcing the unified client, the File API helper, safety filter tracking, and streaming outputs ensures robust AI integrations.

## ALWAYS DO THIS

- **Use the GenAI client constructor** — Instantiate the client using `import { GoogleGenAI } from "@google/genai"` and let the SDK load the key from the `GEMINI_API_KEY` environment variable.
- **Upload large files via the File API** — Use the files manager client (`ai.files.upload`) to upload media files larger than 20MB prior to prompting.
- **Set persistent system instructions** — Define systemic context inside the client configuration using the `systemInstruction` property of the generation config.
- **Implement streaming for chat interfaces** — Use `ai.models.generateContentStream` to stream chunks to frontend interfaces, lowering perceived latency.
- **Track safety blockages** — Check response safety ratings inside candidates lists to identify and log content blocked by safety filters.

## NEVER DO THIS

- ❌ **DO NOT** import the legacy client libraries (`@google/generative-ai` or `google-generativeai`). **Why fails:** These libraries are deprecated, do not support modern reasoning model configurations, and will eventually be shut down. **Instead:** Install and use the unified `@google/genai` library.
- ❌ **DO NOT** pass raw base64 strings of large media files directly inside the content generation payload. **Why fails:** Large payloads exceed the API gateway limit, returning immediate HTTP 413 Payload Too Large errors. **Instead:** Upload media objects via the File API using `ai.files.upload()`.
- ❌ **DO NOT** assume prompt queries will execute successfully without rate-limiting controls. **Why fails:** Spikes in request frequency trigger immediate rate limits (HTTP 429), leaving the application unresponsive. **Instead:** Implement client-side queue throttling with exponential backoff retries.
- ❌ **DO NOT** configure safety settings to be completely disabled in production applications. **Why fails:** Exposes the application to generating harmful, unsafe, or highly toxic outputs, violating system guidelines. **Instead:** Explicitly configure standard safety thresholds in the config block.

---

## Media Upload & Prompting Pipeline

For files larger than 20MB, upload via the File API before passing the URI reference to the model:

```
[Local File] ──> [ai.files.upload()] ──> [File URI Reference] ──> [ai.models.generateContent()] ──> [Response]
```

---

## Examples

### ✅ Good — Unified SDK, File Upload, and Streaming Content

#### 1. Uploading Files and Querying Content
```typescript
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize the unified GenAI SDK client
const ai = new GoogleGenAI({});

export async function analyzeLargeMediaFile(filePath: string, mimeType: string) {
  // 1. Upload the file using the files manager API
  const uploadResponse = await ai.files.upload({
    file: filePath,
    mimeType: mimeType
  });

  // 2. Query content using the uploaded file's URI reference
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      uploadResponse, // Passes the file reference object directly
      "Extract the key summary points from this document."
    ],
    config: {
      temperature: 0.2,
      systemInstruction: "You are a helpful data analyst."
    }
  });

  return response.text;
}
```

#### 2. Streaming Response Chunks
```typescript
export async function streamCodeExplanation(promptText: string, onChunk: (text: string) => void) {
  // Call the streaming generator endpoint
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: promptText,
    config: {
      temperature: 0.5
    }
  });

  // Iterate over incoming chunks as they arrive
  for await (const chunk of responseStream) {
    const textChunk = chunk.text;
    if (textChunk) {
      onChunk(textChunk);
    }
  }
}
```

Why this passes: Uses the unified `@google/genai` library, uploads files via the file manager API, handles file URI references, and runs content generation over non-blocking streams.

### ❌ Bad — Inline Base64 Blobs, Deprecated Configs, and Lacking Stream Handlers

```typescript
// ERROR 1: Importing the deprecated legacy SDK library
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function badAnalyzeFile(filePath: string) {
  const fileData = fs.readFileSync(filePath);
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // ERROR 2: Passing raw base64 data inline for a large file (causes HTTP 413)
  const result = await model.generateContent([
    "Summarize this:",
    {
      inlineData: {
        data: fileData.toString("base64"),
        mimeType: "video/mp4"
      }
    }
  ]);
  
  // ERROR 3: Direct text returns without streaming for large outputs (high latency)
  return result.response.text();
}
```

Why this fails: Imports the deprecated legacy SDK, attaches large binary data directly inline, and returns outputs without streaming support.

---

## Failure Modes

- **The HTTP 413 Payload Collapse:** Passing raw base64 data for files > 20MB, causing request crashes at the API gateway layer.
- **The Legacy Library Lockout:** Querying endpoints using legacy library methods, raising runtime property resolve exceptions.
- **The Silent Block Failure:** Assuming a prompt returned text successfully when it was blocked by safety filters, causing null property reads.
- **The Cold Chat Latency Spike:** Requesting long answers without streaming, causing the user interface to hang for seconds.
- **The Function Call Loop Trap:** Lacking a step-iteration limit on function call resolvers, letting tools execute recursively.

## Validation

Audit Google GenAI integration properties for model types and handlers:

1. **Verify that the deprecated SDK is not referenced in package configurations:**
   Check package dependencies:
   ```bash
   grep -rn "@google/generative-ai" package.json 2>/dev/null
   # expected: zero matches. Dependencies list only '@google/genai'.
   ```
2. **Verify that the File API upload method is used for file references:**
   Verify files uploads logic in codebase:
   ```bash
   grep -rn "\.files\.upload" src/ lib/ 2>/dev/null
   # expected: Found references to files.upload for file management routes.
   ```
3. **Verify that content generation routes use the correct unified models manager syntax:**
   Verify code signatures:
   ```bash
   grep -rn "models\.generateContent" src/ 2>/dev/null
   # expected: Checks model calls match the new SDK format.
   ```
4. **Identify rate-limit handling blocks:**
   Verify retry mechanisms exist on model queries:
   ```bash
   grep -rn "retry" src/services/ai/ 2>/dev/null
   # expected: Client queries are wrapped in retry handler logic.
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi integrasi model:

> "Use the skill `gemini-api-integration`. Read `.agent/skills/gemini-api-integration/SKILL.md` before coding. Never import deprecated SDK libraries or send large base64 files inline. Always use the unified client constructor, run file uploads through the File API, check candidate safety logs, and use content streaming."

## Related

- [ai-engineer](../ai-engineer/SKILL.md) — Production LLM workflows.
- [gemini-api-dev](../gemini-api-dev/SKILL.md) — Gemini SDK setups.
- [llm-structured-output](../llm-structured-output/SKILL.md) — JSON schema parsing.
