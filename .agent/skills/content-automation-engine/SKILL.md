---
name: content-automation-engine
description: Automated content production engine pipelines for YouTube Shorts, TikTok, and Instagram Reels, covering script generation, TTS synthesis, FFmpeg processing, and scheduled uploads.
risk: high (temp storage leaks, account bans for botting, FFmpeg processing crashes, OAuth credential leaks)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Content Automation Engine

> **One-liner:** Guidelines for constructing automated media pipelines, synthesizing voice-overs, assembling video layers using FFmpeg, and scheduling social uploads.

## When to Use

- When developing automated short-form video pipelines (YouTube Shorts, TikTok, Instagram Reels).
- When processing script narration into audio files via Text-to-Speech (TTS) libraries.
- When merging audio, static images, dynamic background music (BGM), and subtitle overlays using FFmpeg filters.

## Why This Exists

Automated media creation pipelines process massive binary video structures and temporary audio files. If temporary assets are not cleared after each run, the host server's disk space will quickly fill up. Additionally, sending raw emojis to TTS engines causes them to read out unicode descriptions (e.g. "thumbs up emoji") in the voice-over, ruining the content quality. Establishing clear asset cleanup procedures, subtitle sanitization rules, and resource-bounded FFmpeg commands prevents disk overflows and bad voice synthesis.

## ALWAYS DO THIS

- **Clean up temporary files in a `finally` block** — Delete temporary audio files, raw voice assets, and frames from disk immediately after uploading.
- **Sanitize scripts before sending to TTS** — Filter out emojis, special Markdown headers, and link URLs so the TTS engine only receives plain text.
- **Enforce image scaling filters in FFmpeg** — Scale images to portrait resolutions (1080x1920) and apply padding to prevent aspect ratio distortion or process failure.
- **Utilize OAuth tokens via secure environment variables** — Store refresh tokens and Google API client details in `.env` variables.
- **Apply volume mixing thresholds** — Downmix background music (BGM) to low volumes (e.g., 10-15%) so that it does not drown out the synthesized voice-over narration.

## NEVER DO THIS

- ❌ **DO NOT** pass raw emojis or text-based abbreviations (like "e.g.", "i.e.") directly to the TTS engine. **Why fails:** The TTS engine reads these symbols literally (e.g., pronouncing "smiley face emoji" or spelling out characters), resulting in unprofessional audio tracks. **Instead:** Strip emojis and expand abbreviations to full text (e.g., "for example") before TTS conversion.
- ❌ **DO NOT** run video compilation pipelines without clearing temp directories after completion or failure. **Why fails:** Accumulated high-resolution video chunks fill up server storage space, causing the server to freeze or crash due to disk space exhaustion. **Instead:** Wrap the pipeline inside a `try/finally` block that cleans up all intermediate files.
- ❌ **DO NOT** upload more than 5 automated videos per day on newly registered channels. **Why fails:** Social media platform algorithms flag rapid, programmatic uploads from fresh accounts as spam bots, resulting in account suspension. **Instead:** Queue uploads to post 1-3 times daily at spaced intervals.
- ❌ **DO NOT** use copyrighted music tracks as background audio in automated video assemblies. **Why fails:** YouTube and TikTok automated scanners detect copyright matches on upload, muting the video or taking down the content. **Instead:** Use royalty-free music files stored locally.

---

## Content Assembly & Compilation Flow

A structured asset flow processes source media into public posts safely:

```
[Trend Topic] ──> [Sanitize Narration] ──> [TTS & FFmpeg Processing] ──> [Upload Video] ──> [Clear Temp Files]
```

---

## Examples

### ✅ Good — Subprocess TTS Generation, Aspect-Ratio Scaling, and Temp Cleanup

```typescript
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

interface VideoParams {
  topic: string;
  narrationText: string;
  imagePaths: string[];
  bgmPath: string;
  outputPath: string;
}

// 1. Sanitize text inputs by removing emojis and markdown formatting
export function sanitizeNarrative(text: string): string {
  return text
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "")
    .replace(/[#*`_]/g, "")
    .trim();
}

export async function generateContentPipeline(params: VideoParams) {
  const tempDir = path.join(process.cwd(), "temp_assets");
  await fs.mkdir(tempDir, { recursive: true });

  const tempVoicePath = path.join(tempDir, `voice_${Date.now()}.mp3`);
  const sanitizedText = sanitizeNarrative(params.narrationText);

  try {
    // 2. Synthesize audio file via edge-tts CLI tool
    console.log("🔊 Generating voice track via Edge TTS...");
    const escapedText = sanitizedText.replace(/"/g, '\\"');
    await execAsync(`edge-tts --voice "en-US-GuyNeural" --text "${escapedText}" --write-media "${tempVoicePath}"`);

    // 3. Assemble video with vertical aspect ratio (1080x1920) and pad layouts
    console.log("🎬 Compiling video layers with FFmpeg...");
    const imageInputs = params.imagePaths.map((img) => `-loop 1 -t 5 -i "${img}"`).join(" ");
    
    // Scale images to vertical video frames (1080x1920) and add black pads
    const scaleFilters = params.imagePaths
      .map((_, i) => `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`)
      .join(";");
      
    const concatFilter = params.imagePaths.map((_, i) => `[v${i}]`).join("") + `concat=n=${params.imagePaths.length}:v=1:a=0[outv]`;

    // 4. Mix voice-over track and background music safely
    const command = `ffmpeg -y ${imageInputs} -i "${tempVoicePath}" -i "${params.bgmPath}" ` +
      `-filter_complex "${scaleFilters};${concatFilter};[${params.imagePaths.length + 1}:a]volume=0.12[bgm];[${params.imagePaths.length}:a][bgm]amix=inputs=2:duration=first[outa]" ` +
      `-map "[outv]" -map "[outa]" -c:v libx264 -preset medium -c:a aac -shortest -pix_fmt yuv420p "${params.outputPath}"`;

    await execAsync(command);
    console.log(`✅ Success! Video compiled at: ${params.outputPath}`);
  } catch (error) {
    console.error("❌ Content pipeline error:", error);
    throw error;
  } finally {
    // 5. Always clean up temporary media assets
    console.log("🧹 Cleaning up temporary audio assets...");
    try {
      await fs.rm(tempVoicePath, { force: true });
    } catch (cleanupErr) {
      console.warn("Failed to delete temp voice file:", cleanupErr);
    }
  }
}
```

Why this passes: Cleans scripts of emojis, handles Edge-TTS CLI processes, uses vertical scaling/padding filters, mixes audio safely, and cleans up temp files in a `finally` block.

### ❌ Bad — Emoji TTS Inputs, No Frame Scaling, and Leftover Temp Files

```typescript
import { exec } from "child_process";

// ERROR 1: Sending scripts with emojis directly to the TTS engine
const dirtyScript = "Wow! look at this! 🚀🔥 Unbelievable facts! 🧠";

export async function compileUnsafe(images: string[], audio: string, out: string) {
  // ERROR 2: Edge-tts subprocess execution without shell sanitization checks
  exec(`edge-tts --text "${dirtyScript}" --write-media temp.mp3`, (err) => {
    
    // ERROR 3: Building videos without scaling filters (crashes if source images differ in resolution)
    const imageList = images.map(img => `-i ${img}`).join(" ");
    const cmd = `ffmpeg -y ${imageList} -i temp.mp3 -c:v libx264 ${out}`;
    
    exec(cmd, (err2) => {
       console.log("Video compiled successfully.");
       // ERROR 4: Leaves temp.mp3 on disk, clogging up storage space
    });
  });
}
```

Why this fails: Fails to strip emojis, executes unsanitized shell inputs, ignores frame resolution mismatches in FFmpeg, and leaves temporary files on disk.

---

## Failure Modes

- **The Disk Starvation:** Leaving temporary voice files on disk, filling up the storage space of the host server.
- **The Emoji TTS Spellout:** The voice assistant reading out "rocket emoji fire emoji" at the start of the video.
- **FFmpeg Frame Size Mismatch:** Compiling images with different aspect ratios, which throws an error and aborts the pipeline.

## Validation

Cara memverifikasi kepatuhan penggunaan `content-automation-engine`:

1. **Verify that temp files are cleaned up in finally blocks:**
   Check code files for directory or file deletion commands:
   ```bash
   grep -rn "fs.rm" src/
   # Confirm cleanup hooks are set
   ```
2. **Verify emoji sanitization scripts:**
   Confirm regex pattern filters exist for stripping emojis:
   ```bash
   grep -rn "replace(" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk membangun content pipeline:

> "Use the skill `content-automation-engine`. Read `.agent/skills/content-automation-engine/SKILL.md` before coding. Never pass raw emojis to TTS engines. Always clean up temporary files in finally blocks, scale and pad source frames in FFmpeg, and keep tokens secure."

## Related

- [youtube-automation](../youtube-automation/SKILL.md) — Video uploads setups.
- [secrets-management](../secrets-management/SKILL.md) — API credentials storage safety.
- [env-fortress](../env-fortress/SKILL.md) — Variable configurations.
