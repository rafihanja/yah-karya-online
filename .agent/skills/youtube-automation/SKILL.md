---
name: youtube-automation
description: Automate YouTube tasks via Rube MCP (Composio), covering video uploads, metadata management, playlist organization, and analytics extraction.
risk: critical (OAuth session leaks, api quota exhaustion, automated video removals)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# YouTube Automation (Composio / Rube MCP)

> **One-liner:** Guidelines for automating YouTube workflows using Rube MCP tools, managing OAuth session connections, implementing batch video fetching, and managing API quotas.

## When to Use

- When automating video uploads, title updates, description edits, or thumbnail replacements.
- When extracting channel analytics (subscriber counts, video view rates) or list data.
- When retrieving user subscription feeds, playlist structures, or comment lists.

## Why This Exists

The YouTube Data API v3 enforces a strict daily quota (default 10,000 units). Operations like search query calls cost 100 units, and video upload runs cost 1,600 units. If an automation script executes search queries repeatedly in a loop or re-uploads entire files when only metadata needs updating, the API quota will exhaust in minutes. Enforcing batch queries, metadata update operations, and OAuth tokens protection ensures system stability.

## ALWAYS DO THIS

- **Use metadata updates for edits** — Use metadata-specific endpoints (`YOUTUBE_UPDATE_VIDEO`) rather than re-uploading videos when correcting descriptions or titles.
- **Implement request caching systems** — Store video metadata and search query results inside a local cache layer (like Redis) to avoid redundant API queries.
- **Enforce batch ID lookups** — Fetch statistics for multiple videos inside a single request using batch queries (`YOUTUBE_GET_VIDEO_DETAILS_BATCH`) instead of single queries in a loop.
- **Verify OAuth connectivity first** — Verify that the Composio target connection shows as `ACTIVE` via `RUBE_MANAGE_CONNECTIONS` before executing API requests.
- **Sanitize tags and description data** — Validate that total tag characters are under 500 and description payload sizes are under 5,000 bytes.

## NEVER DO THIS

- ❌ **DO NOT** trigger search operations (`YOUTUBE_SEARCH_YOU_TUBE`) to list channel uploads. **Why fails:** Search commands consume 100 units of quota per call, exhausting daily limits. **Instead:** Convert the target channel ID (starts with `UC`) to an uploads playlist ID (replace `UC` with `UU`) and fetch items using `YOUTUBE_LIST_PLAYLIST_ITEMS` (costing only 1 unit).
- ❌ **DO NOT** pass local raw file paths inside the `videoFilePath` parameter of `YOUTUBE_UPLOAD_VIDEO` inside serverless runtimes. **Why fails:** Serverless platforms lack access to local directory structures, raising an path resolution error. **Instead:** Upload files to S3 bucket arrays and pass the S3 key parameter values inside execution schemas.
- ❌ **DO NOT** hardcode client secrets or Google OAuth refresh tokens inside code. **Why fails:** Exposes the channel to credential theft, allowing attackers to hijack, delete, or upload videos. **Instead:** Connect accounts via Composio connection interfaces or secure environment variables.
- ❌ **DO NOT** execute batch ID details requests with lists containing more than 50 video IDs. **Why fails:** Exceeds the maximum payload limit of the Graph API, causing the request to fail. **Instead:** Split the ID list into chunks of 40-50 elements and run calls sequentially or in batch threads.

---

## Quota Optimization Path

Optimizing query routes preserves daily API balances:

```
[Fetch Channel ID] ──> [Swap UC to UU] ──> [List Playlist Items (1 Unit)] ──> [Avoid Search (100 Units)]
```

---

## Examples

### ✅ Good — Quota-Preserving List Operations and Batch Ingestion

```typescript
import axios from "axios";

const GOOGLE_API = "https://www.googleapis.com/youtube/v3";
const oauthToken = process.env.YOUTUBE_OAUTH_TOKEN;
if (!oauthToken) throw new Error("YOUTUBE_OAUTH_TOKEN environment variable is missing");

// 1. Convert Channel ID to Uploads Playlist ID to save quota (1 unit instead of 100)
export function getUploadsPlaylistId(channelId: string): string {
  if (!channelId.startsWith("UC")) {
    throw new Error("Invalid channel ID structure");
  }
  return "UU" + channelId.slice(2);
}

// 2. Fetch upload list securely using the playlist items endpoint
export async function fetchLatestUploads(channelId: string, maxResults = 10) {
  const playlistId = getUploadsPlaylistId(channelId);
  const url = `${GOOGLE_API}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${oauthToken}` }
  });
  return response.data.items; // List of video summaries
}

// 3. Batch query video statistics to fetch data inside a single call (saves quota)
export async function fetchVideoStatsBatch(videoIds: string[]) {
  // Guardrail: Chunk list to comply with Graph API limits (max 50)
  const CHUNK_SIZE = 45;
  const results = [];

  for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
    const chunk = videoIds.slice(i, i + CHUNK_SIZE);
    const idsParam = chunk.join(",");
    const url = `${GOOGLE_API}/videos?part=statistics,contentDetails&id=${idsParam}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${oauthToken}` }
    });
    results.push(...response.data.items);
  }

  return results;
}
```

Why this passes: Avoids high-cost search queries, uses uploads playlists, handles token safety, chunks batch operations under the 50-item limit, and uses timing-safe variables.

### ❌ Bad — High Quota Consumption Search Loops and Hardcoded Credentials

```typescript
import axios from "axios";

// ERROR 1: Hardcoding sensitive OAuth credentials in source files
const AUTH_KEY = "ya29.a0AQvPy..."; 

// ERROR 2: Triggering expensive search calls to list channel uploads
export async function getLatestVideosUnoptimized(channelName: string) {
  // Consumes 100 units of quota per call!
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelName}&type=video&maxResults=10`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${AUTH_KEY}` }
  });

  const videos = response.data.items;
  const stats = [];

  // ERROR 3: Requesting statistics inside a loop (creates N queries, exhausting quota)
  for (const video of videos) {
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id.videoId}`;
    const detailRes = await axios.get(detailUrl, {
      headers: { Authorization: `Bearer ${AUTH_KEY}` }
    });
    stats.push(detailRes.data.items[0]);
  }

  return stats;
}
```

Why this fails: Hardcodes credentials, lists uploads using search queries (100 units), query statistics inside a loop (N units), and lacks input validation checks.

---

## Failure Modes

- **The Quota Lockout:** Exhausting the 10,000 unit API limit within the first hour of the day due to search commands inside loops.
- **The Empty Response:** Attempting to query private or deleted video statistics in batch requests, resulting in missing indexes.
- **Raw File Path Crash:** Passing a local path (like `C:\video.mp4`) in a serverless function, raising file read errors.

## Validation

Cara memverifikasi kepatuhan penggunaan `youtube-automation`:

1. **Verify that no search operations are used for listing uploads:**
   Verify code checks call playlistItems:
   ```bash
   grep -rn "playlistItems" src/
   # Confirm no search endpoints are active for listing
   ```
2. **Verify batch query chunk sizes:**
   Ensure chunking limits do not exceed 50 items:
   ```bash
   grep -rn "slice(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengotomasi YouTube:

> "Use the skill `youtube-automation`. Read `.agent/skills/youtube-automation/SKILL.md` before coding. Never run search operations to list channel videos or execute single API details inside loops. Always convert channel IDs to uploads playlists, chunk batch stats to under 50 elements, and manage tokens via env vars."

## Related

- [youtube-summarizer](../youtube-summarizer/SKILL.md) — Transcript processors.
- [secrets-management](../secrets-management/SKILL.md) — OAuth key safety configs.
- [content-automation-engine](../content-automation-engine/SKILL.md) — Auto content pipelines.
