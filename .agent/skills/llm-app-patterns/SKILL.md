---
name: llm-app-patterns
description: Production-ready patterns for building LLM applications, inspired by Dify and industry best practices.
risk: medium (token billing spikes, context window overflows, semantic cache drifts, hallucination risks)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# LLM Application Patterns

> **One-liner:** Guidelines for designing production-ready RAG architectures, selecting chunking bounds, configuring agent loops, managing semantic caches, and tracing LLM pipelines.

## When to Use

- When architecting RAG (Retrieval-Augmented Generation) ingestion and query pipelines.
- When selecting embedding databases, chunk overlaps, and similarity search parameters.
- When orchestrating multi-agent systems, ReAct loops, or plan-and-execute workflows.

## Why This Exists

Scaling LLM applications from a prototype to production introduces critical challenges. If a RAG pipeline ingests documents using arbitrary chunk sizes without overlaps, semantic meaning gets split across boundaries, causing the model to generate incorrect or hallucinated responses. Additionally, running autonomous agents without loop execution limits or fallback model paths can lead to infinite API query loops and high token bills during outages. Enforcing semantic chunking overlaps, structured output schemas, rate-limiting backoffs, and tracing secures LLM application runtimes.

## ALWAYS DO THIS

- **Implement hybrid semantic and keyword search** — Combine vector search with keyword search (BM25) using Reciprocal Rank Fusion (RRF) to retrieve relevant context.
- **Configure semantic chunk overlaps** — Always set a token overlap buffer (e.g., 50-100 tokens) between consecutive document chunks to preserve sentence boundaries.
- **Trace LLM execution spans** — Integrate telemetry loggers (such as OpenTelemetry, LangSmith, or Langfuse) to trace latencies, token counts, and prompts.
- **Cap agent execution steps** — Establish a maximum iteration count on ReAct and plan-execute agents to prevent infinite loops.
- **Enforce schema validation on models** — Wrap model calls in structured output schemas (such as Zod or JSON schemas) to ensure outputs can be parsed reliably.

## NEVER DO THIS

- ❌ **DO NOT** segment documents into chunks without configuring a token overlap buffer. **Why fails:** Splits key phrases and contexts across boundaries, leaving matching vectors incomplete and causing the LLM to hallucinate or return incomplete answers. **Instead:** Define a chunk size with a 10-15% token overlap buffer.
- ❌ **DO NOT** trigger autonomous agent execution loops without setting a maximum step execution limit. **Why fails:** If the agent encounters a tool validation error, it will run queries in an infinite loop, causing API token billing costs to spike. **Instead:** Hardcode a step limit (e.g. `max_iterations = 5`) in the loop runner.
- ❌ **DO NOT** pass raw, unvalidated outputs from LLM calls directly to database write queries or shell script execution triggers. **Why fails:** Language models are non-deterministic; hallucinations or prompt injections can result in SQL syntax errors, database corruption, or arbitrary command execution. **Instead:** Validate all outputs against strict schemas or run them in sandboxes.
- ❌ **DO NOT** cache LLM queries using simple string matches when prompt templates contain dynamic, changing variables (like current time or user IDs). **Why fails:** Results in cache misses or returns stale data to the wrong users. **Instead:** Implement semantic caching utilizing vector distance checks or exclude dynamic metadata from cache keys.

---

## Hybrid Search Retrieval Flow

Combining keyword and semantic results using Reciprocal Rank Fusion (RRF) optimizes context retrieval:

```
                  ┌──> Semantic Search (Vector similarity) ──┐
[User Query] ────┤                                          ├──> RRF Rank Merger ──> [Top Contexts]
                  └──> Keyword Search (BM25 Match) ──────────┘
```

---

## Examples

### ✅ Good — Production RAG Pipeline with Overlaps and Hybrid Search

```python
import numpy as np
from typing import List, Dict, Any

class ProductionRAGPipeline:
    def __init__(self, vector_db_client, embedding_model):
        self.db = vector_db_client
        self.embedder = embedding_model
        # 1. Enforce chunk settings with a clear semantic overlap buffer
        self.chunk_size = 512
        self.chunk_overlap = 50 

    def chunk_document(self, text: str) -> List[str]:
        words = text.split()
        chunks = []
        # Create sliding window chunks with overlap
        step = self.chunk_size - self.chunk_overlap
        for i in range(0, len(words), step):
            chunk = " ".join(words[i:i + self.chunk_size])
            chunks.append(chunk)
        return chunks

    def retrieve_hybrid_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        # 2. Extract query embeddings
        query_vector = self.embedder.embed(query)

        # 3. Retrieve and merge using hybrid vector and keyword searches
        vector_results = self.db.vector_query(query_vector, limit=top_k * 2)
        keyword_results = self.db.keyword_query(query, limit=top_k * 2)

        # Merge results using Reciprocal Rank Fusion (RRF)
        merged_docs = self._reciprocal_rank_fusion(vector_results, keyword_results, limit=top_k)
        return merged_docs

    def _reciprocal_rank_fusion(self, list_a: List[Dict], list_b: List[Dict], limit: int) -> List[Dict]:
        scores = {}
        for rank, doc in enumerate(list_a):
            scores[doc["id"]] = scores.get(doc["id"], 0.0) + (1.0 / (60.0 + rank))
        for rank, doc in enumerate(list_b):
            scores[doc["id"]] = scores.get(doc["id"], 0.0) + (1.0 / (60.0 + rank))
            
        sorted_ids = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        # Return merged documents based on combined scores
        return [next(d for d in list_a + list_b if d["id"] == doc_id) for doc_id, _ in sorted_ids]
```

Why this passes: Configures a chunk overlap buffer, retrieves contexts using hybrid searches, merges results using Reciprocal Rank Fusion (RRF), and implements clear parameters.

### ❌ Bad — Zero Overlaps, Unchecked Agent Runs, and raw parsing

```python
class BadRAGAndAgent:
    def __init__(self, vector_db):
        self.db = vector_db

    # ERROR 1: Chunking text arbitrarily without a token overlap buffer
    def bad_chunking(self, text: str) -> list:
        # Hard split every 500 characters breaks words and semantic sentences
        return [text[i:i+500] for i in range(0, len(text), 500)]

    # ERROR 2: Running agent loops without setting a maximum iteration cap
    def bad_agent_loop(self, task: str):
        prompt = f"Solve this task: {task}. Run tools as needed."
        
        # ERROR 3: Infinite while loop can query the API repeatedly during failures
        while True: 
            response = call_llm(prompt)
            if "Final Answer:" in response:
                return response
            
            tool_call = parse_tool(response)
            result = run_tool(tool_call)
            prompt += f"\nTool Result: {result}"
```

Why this fails: Splts text chunks without overlap buffers, routes model generation through an infinite while loop without step caps, and lacks error handling.

---

## Failure Modes

- **The Chunk Split Incoherence:** Splitting numbers or names across chunk boundaries, causing incorrect RAG retrieval.
- **The Infinite Agent Execution:** Running agent loop workflows without step limit thresholds, resulting in high token bills.
- **The Empty Context Hallucination:** Querying RAG pipelines for topics missing from the vector index without setting fallback outputs.
- **The Semantic Cache Spill:** Returning cached outputs to users based on generic similarity thresholds, exposing data to unauthorized users.
- **The Telemetry Lag Lock:** Spawning tracing spans synchronously in hot paths, adding latency to API response times.
- **The Prompt Drift Divergence:** Modifying system instructions without updating RAG context builders, causing mismatched outputs.

## Validation

Audit LLM application patterns for RAG chunk boundaries and agent loops:

1. **Verify that document splitters define a non-zero overlap threshold:**
   Check splitters in ingestion files:
   ```bash
   grep -rn "chunk_overlap" src/ lib/ 2>/dev/null
   # expected: chunk_overlap is set to a value > 0 (typically 50-100 tokens).
   ```
2. **Verify that agent execution workflows implement step limiters:**
   Verify loop limits in agent files:
   ```bash
   grep -rn "max_iterations\|max_steps" src/agents/ 2>/dev/null
   # expected: Found explicit loop cap variables on all ReAct/Agent loops.
   ```
3. **Verify hybrid search configurations via database schema tests:**
   Check search endpoints configurations:
   ```bash
   grep -rn "reciprocal_rank_fusion\|RRF" src/services/ 2>/dev/null
   # expected: Verification of search rank merging functions in RAG routes.
   ```
4. **Inspect tracing span logs:**
   Confirm telemetry traces compile and export latency statistics without blocking request execution paths.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi LLM pipeline:

> "Use the skill `llm-app-patterns`. Read `.agent/skills/llm-app-patterns/SKILL.md` before coding. Never partition ingestion texts without overlap buffers or run agent loops without max iteration boundaries. Always use hybrid search, log spans, and validate outputs."

## Related

- [ai-engineer](../ai-engineer/SKILL.md) — Production LLM workflows.
- [gemini-api-integration](../gemini-api-integration/SKILL.md) — Unified client SDKs.
- [llm-structured-output](../llm-structured-output/SKILL.md) — JSON schema parsing.
