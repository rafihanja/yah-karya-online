---
name: web-scraper
description: Multi-strategy web data extraction with dynamic fallback checks, content classification, and output format wrappers.
risk: medium (IP bans, rate limit locks, DOM layout changes, memory leaks from open browsers)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Scraper

> **One-liner:** Guidelines for constructing robust web scrapers, extracting static HTML via HTTP requests, automating dynamic single-page applications (SPAs) with Playwright, and extracting structured JSON-LD schemas.

## When to Use

- When extracting pricing grids, product details, catalogs, or FAQ tables from public websites.
- When performing scheduled content monitoring or differential updates check between scraping runs.
- When parsing structured schema tags (`application/ld+json`) from pages.

## Why This Exists

Static HTTP fetching (like axios or curl) fails silently when target websites render their contents dynamically using JavaScript frameworks (like React, Vue, or Angular), returning empty template tags. Conversely, spawning headless browsers for static, lightweight sites is extremely slow and wastes server resources. Standardizing on reconnaissance analysis, applying automated fallbacks, and sanitizing extracted whitespace characters prevents execution bottlenecks.

## ALWAYS DO THIS

- **Verify page type before choosing a strategy** — Inspect the initial markup for loading spinners or SPA framework mount nodes (like `#root` or `#app`) to determine if browser automation is required.
- **Isolate browser contexts and close tabs** — Always wrap browser actions inside `try/finally` blocks and call `browser.close()` (or `page.close()`) to prevent zombie browser processes.
- **Normalize and trim extracted text** — Clean up leading/trailing whitespaces, decode HTML entities (e.g. `&amp;` to `&`), and replace newlines inside cells with spaces.
- **Extract structured JSON-LD schemas first** — Query `<script type="application/ld+json">` elements directly; structured metadata is more robust than parsing volatile CSS classes.
- **Configure request timeouts and delay intervals** — Set explicit timeouts (max 30 seconds) and space out consecutive requests by at least 2 seconds.

## NEVER DO THIS

- ❌ **DO NOT** use static HTTP request libraries (like `axios` or `fetch`) to scrape data from client-side SPA applications. **Why fails:** Returns the bare template shell without the dynamically loaded content, resulting in empty or incomplete data arrays. **Instead:** Launch a headless browser instance using Playwright or Puppeteer to let the page hydrate before extracting data.
- ❌ **DO NOT** execute web scraping tasks without wrapping browser resource lifecycles inside `try/finally` blocks. **Why fails:** If an extraction throws an error, the browser engine remains running as a zombie process, consuming memory until the server crashes. **Instead:** Close pages and browser instances inside a `finally` block.
- ❌ **DO NOT** use brittle, positional CSS selectors (like `div > div > span:nth-child(3)`) to extract data. **Why fails:** Even minor styling modifications by site updates will break the selector path, yielding empty results. **Instead:** Match data using semantic attributes (e.g., `itemprop`, `data-testid`, or role locators).
- ❌ **DO NOT** scrape pages behind authentication walls or attempt to bypass CAPTCHA challenges. **Why fails:** Bypassing CAPTCHAs violates terms of service and prompts immediate IP blocks. **Instead:** Request explicit API keys or use user-supplied cookies.

---

## Scraper Strategy Decision Tree

Choosing the correct strategy optimizes extraction speed and preserves server memory:

```
[Recon URL] ── Is SPA or JS-heavy? ──> YES ──> [Playwright Browser Strategy] ──> [Close Browser]
                                    └── NO  ──> [Static HTTP Fetch Strategy]
```

---

## Examples

### ✅ Good — Playwright Scraper with Timeout Guards, JSON-LD Fallbacks, and Cleanup

```typescript
import { chromium } from "playwright";

interface ExtractedProduct {
  name: string;
  price: string;
  url: string;
}

export async function scrapeProductDetails(targetUrl: string): Promise<ExtractedProduct[]> {
  // 1. Launch browser with safe headless flags
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  try {
    const page = await browser.newPage();
    
    // 2. Set strict timeouts for navigation (max 30 seconds)
    await page.goto(targetUrl, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    // 3. Extract JSON-LD structured schemas first
    const jsonLdData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts)
        .map((script) => {
          try {
            return JSON.parse(script.textContent || "");
          } catch {
            return null;
          }
        })
        .filter((data) => data && data["@type"] === "Product");
    });

    if (jsonLdData.length > 0) {
      console.log("✅ Successfully extracted product details from JSON-LD schema.");
      return jsonLdData.map((item: any) => ({
        name: (item.name || "").trim(),
        price: (item.offers?.price || "N/A").toString().trim(),
        url: targetUrl
      }));
    }

    // 4. Fallback: Parse the DOM using semantic selectors
    console.log("⚠️ JSON-LD not found. Falling back to DOM parsing...");
    const products = await page.evaluate((url) => {
      const cards = document.querySelectorAll('[itemtype="http://schema.org/Product"]');
      return Array.from(cards).map((card) => {
        const nameNode = card.querySelector('[itemprop="name"]');
        const priceNode = card.querySelector('[itemprop="price"]');
        
        return {
          name: nameNode?.textContent?.replace(/\s+/g, " ").trim() || "N/A",
          price: priceNode?.textContent?.replace(/\s+/g, " ").trim() || "N/A",
          url: url
        };
      });
    }, targetUrl);

    return products;
  } catch (error) {
    console.error(`❌ Web scraping failed for ${targetUrl}:`, error);
    throw error;
  } finally {
    // 5. Always release browser resources to prevent memory leaks
    await browser.close();
  }
}
```

Why this passes: Launches browser within safety contexts, sets explicit navigation timeouts, extracts JSON-LD scripts first, sanitizes strings, and closes resources inside a `finally` block.

### ❌ Bad — Static Scraper for SPA, Positional Selectors, and Zombie Browsers

```typescript
import axios from "axios";
import * as cheerio from "cheerio";

// ERROR 1: Trying to scrape a JS-rendered React site using a static HTTP fetcher (will return empty HTML)
export async function scrapeReactAppUnsafe(url: string) {
  const response = await axios.get(url); 
  const $ = cheerio.load(response.data);
  const data: any[] = [];

  // ERROR 2: Using brittle positional selectors that break on layout changes
  $("div > div > ul > li:nth-child(2) > span").each((i, elem) => {
    // ERROR 3: Direct parsing without cleanup or null safety checks
    data.push({
      title: $(elem).text(), 
      price: $(elem).next().text()
    });
  });

  // ERROR 4: No error logging or fallback strategy if the selector returns empty
  return data;
}
```

Why this fails: Uses static axios fetchers on JS dynamic apps, uses fragile positional selectors, lacks text sanitization, and lacks try/catch exception wrappers.

---

## Failure Modes

- **The Zombie Browser Lock:** Crashing during evaluations without closing browsers, causing RAM starvation on the host server.
- **The Empty Hydration Return:** Fetching SPA pages without waiting for DOM networks to go idle, returning empty list containers.
- **The Class Selector Drift:** Scraping elements using auto-generated Tailwind class tags (e.g. `.css-1x2y3z`), which change on compilation.

## Validation

Cara memverifikasi kepatuhan penggunaan `web-scraper`:

1. **Verify that browser instances are wrapped in finally blocks:**
   Check code files for browser termination hooks:
   ```bash
   grep -rn "browser.close(" src/
   # Confirm cleanup is registered
   ```
2. **Verify target selectors are semantic:**
   Inspect code templates for positional selector patterns:
   ```bash
   grep -rn "nth-child" src/
   # Ensure select strings do not use brittle hierarchies
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk mengonfigurasi web scraper:

> "Use the skill `web-scraper`. Read `.agent/skills/web-scraper/SKILL.md` before coding. Never scrape client-side hydrated SPA views using static fetch libraries. Always manage browser closures inside finally blocks, verify JSON-LD tags first, and use semantic element selectors."

## Related

- [playwright](../playwright/SKILL.md) — E2E test tools.
- [webapp-testing](../webapp-testing/SKILL.md) — Server lifecycle runs.
- [avoid-ai-writing](../avoid-ai-writing/SKILL.md) — Text cleanup methods.
