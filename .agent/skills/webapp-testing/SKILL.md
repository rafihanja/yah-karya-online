---
name: webapp-testing
description: To test local web applications, write native Python Playwright scripts.
risk: medium (local port bindings, Python subprocess execution, visual screenshot audits)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Web Application Testing (Python)

> **One-liner:** Guidelines for writing native Python Playwright scripts to audit local web servers, manage server lifecycles, and capture rendered page states.

## When to Use

- When writing Python-based Playwright scripts to test local web interfaces (like index.html or dynamic dev ports).
- When verifying scroll animations, GSAP interactions, or console output safety in a headless browser.
- When configuring local test environments using the `with_server.py` lifecycle utility.

## Why This Exists

Testing local frontend files directly from the file system (e.g. using `file:///` URLs) fails to reproduce real-world network loads, path routing, or CORS configurations. In dynamic apps, checking element presence before Javascript components are fully hydrated produces false positive passes or instant failures. Setting up a local server wrapper and using network-idle checks ensures that tests run against realistic, fully-hydrated DOM structures.

## ALWAYS DO THIS

- **Verify script configurations using `--help` first** — Run any helper script with the `--help` flag before executing to check command parameters.
- **Enforce network-idle wait states** — Use `page.wait_for_load_state("networkidle")` after navigating to ensure JavaScript and images are fully loaded.
- **Wrap execution with server lifecycle tools** — Use `scripts/with_server.py` to start local servers before executing test scripts and shut them down afterwards.
- **Close browser instances explicitly** — Ensure `browser.close()` is called inside a `try/finally` block to prevent orphaned headless browser processes from consuming CPU.
- **Utilize synchronous APIs** — Write test automations using `sync_playwright` to maintain clean, sequential script execution.

## NEVER DO THIS

- ❌ **DO NOT** execute web tests on dynamic apps immediately after page navigation without waiting. **Why fails:** The test runs against an unhydrated DOM shell before JavaScript executes, causing element assertions to fail. **Instead:** Wait for `networkidle` load state.
- ❌ **DO NOT** launch browsers in headed mode (`headless=False`) inside headless CI/CD pipeline environments. **Why fails:** Headless environments lack graphical display servers (X11), causing the script to crash immediately. **Instead:** Set `headless=True` by default and capture screenshots for visual reviews.
- ❌ **DO NOT** use static sleep commands (like `time.sleep(5)` or `page.wait_for_timeout(5000)`). **Why fails:** Introduces arbitrary delays that slow down test runs and fail in slow environments. **Instead:** Wait for specific DOM elements using `page.wait_for_selector()`.
- ❌ **DO NOT** leave dangling server ports bound after test suite crashes. **Why fails:** Prevents subsequent runs from binding to the same port, blocking pipeline execution. **Instead:** Wrap the test runner inside a cleanup script that catches process exits.

---

## E2E Server Lifecycle Workflow

Using `with_server.py` manages server startup, execution of the test suite, and port cleanups:

```
[Start Command] ──> [with_server.py binds port] ──> [runs test script] ──> [closes port & shuts down]
```

---

## Examples

### ✅ Good — Synced Playwright Script with Server wrappers

```python
# test_ui.py
from playwright.sync_api import sync_playwright
import sys

def verify_homepage():
    # 1. Initiate synchronized playwright context
    with sync_playwright() as p:
        # 2. Launch headless chromium
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page()
            # Navigate to target local port
            page.goto("http://localhost:5173")
            
            # 3. Wait for hydration before verifying
            page.wait_for_load_state("networkidle")
            
            # 4. Perform assertion checks
            title = page.title()
            print(f"Verified page title: {title}")
            assert "Galaxy Experience" in title
            
            # Verify no errors on console
            errors = []
            page.on("pageerror", lambda err: errors.append(err))
            
            # Take visual snapshot for review
            page.screenshot(path="screenshot_dashboard.png")
            assert len(errors) == 0, f"Encountered console errors: {errors}"
            
        finally:
            # 5. Clean up resource layers
            browser.close()

if __name__ == "__main__":
    verify_homepage()
```

To run this script with a local dynamic server wrapper:
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python test_ui.py
```

Why this passes: Starts the local server automatically, waits for network idle, captures console errors, takes a visual review screenshot, and closes the browser context.

### ❌ Bad — Naked Runs, Static Waits, and No Cleanups

```python
# test_ui_unoptimized.py
import time
from playwright.sync_api import sync_playwright

p = sync_playwright().start()
# ERROR 1: Running in headed mode on headless environment
browser = p.chromium.launch(headless=False) 
page = browser.new_page()

# ERROR 2: Direct file system loading without server context
page.goto("file:///path/to/index.html") 

# ERROR 3: Static timeout wait (flaky and slow)
time.sleep(5) 

# ERROR 4: Asserting elements without safety validations
assert page.locator(".galaxy-card").is_visible()

# ERROR 5: Missing browser.close() call leaving zombie processes
```

Why this fails: Loads files using direct file protocols, sleeps statically, runs headed by default, and leaves browser contexts open on process exits.

---

## Failure Modes

- **Zombie Port Allocations:** Failing to clean up local web servers when a Python assertion fails, blocking the next run.
- **Blank Screen Capture:** Snapping screenshots before the dynamic application resolves loaders or network assets.
- **Headed Crash in pipelines:** Running test code containing `headless=False` inside container pipelines.

## Validation

Cara memverifikasi kepatuhan penggunaan `webapp-testing`:

1. **Verify that no static python sleep commands exist:**
   Ensure no `time.sleep` triggers inside automation scripts:
   ```bash
   grep -rn "time.sleep" scripts/
   # Expected: no matches found
   ```
2. **Execute Python E2E check script:**
   Verify the local flow test passes:
   ```bash
   python test_parallax.py
   # Expected: ALL PARALLAX FLOW TESTS PASSED
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk menguji local webapps:

> "Use the skill `webapp-testing`. Read `.agent/skills/webapp-testing/SKILL.md` before coding. Never write static python time delays or run headed browser scripts in headless CI. Always run tests using `with_server.py` wrappers, wait for networkidle, and close browsers in finally blocks."

## Related

- [playwright](../playwright/SKILL.md) — Node-based Playwright E2E.
- [javascript-testing-patterns](../javascript-testing-patterns/SKILL.md) — Custom assertions.
- [verification-before-completion](../verification-before-completion/SKILL.md) — Success checks.
