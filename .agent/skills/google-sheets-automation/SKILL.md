---
name: google-sheets-automation
description: Lightweight Google Sheets integration with standalone OAuth authentication. No MCP server required. Full read/write access.
risk: critical (security credentials exposure, data truncation, API rate limits triggers)
source: "Elite Agent Operations - Batch 9 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Google Sheets Standalone Integration

> **One-liner:** Guidelines for executing data syncs via local python sheets scripts, managing Google OAuth tokens securely, and validating range coordinates.

## When to Use

- When writing local scripts or automated cron jobs that interface with Google Sheets using Python.
- When configuring standalone OAuth authentication flows without using an external MCP server.
- When export-dumping system logs or database records to Google Workspace sheets.

## Why This Exists

Interacting with spreadsheets from local scripts requires secure authentication and clean payload formatting to prevent errors. If developer scripts store credentials or raw access tokens in source code, they risk exposing them in public repositories. Furthermore, passing raw text strings containing commas to CSV converters without proper escaping corrupts cell columns. Enforcing system keyring authentication, input sanitization, and structured range boundaries keeps integrations secure and reliable.

## ALWAYS DO THIS

- **Secure credentials using the system keyring** — Store OAuth access tokens using platform-specific credential managers rather than flat `.env` files.
- **Convert write payloads to JSON 2D arrays** — Wrap cell rows inside nested list formats (e.g. `[["row_val1", "row_val2"]]`) before running updates.
- **Escape sheet names with spaces in A1 notation** — Enclose sheet tab names containing space characters inside single quotes (e.g. `'Q1 Sales'!A1:B10`).
- **Validate authentication status before running scripts** — Run verification commands (e.g. `python scripts/auth.py status`) to check token validity before executing cron jobs.
- **Enforce limits on query bounds** — Declare row limits on ranges (e.g. `Sheet1!A1:Z500`) to avoid script timeouts when reading large spreadsheets.

## NEVER DO THIS

- ❌ **DO NOT** commit OAuth client secrets, refresh tokens, or credentials to version control. **Why fails:** Attackers scan public repositories for keys, exposing Google Workspace accounts to data theft. **Instead:** Load client secrets from local secure parameters or system environment keys.
- ❌ **DO NOT** write updates to the sheet using a loop of single-cell writes. **Why fails:** Rapidly consumes Google's 60 writes/minute limit, triggering API blockages. **Instead:** Group cell changes inside `update-range` or `batch-update` parameters.
- ❌ **DO NOT** use personal, unverified @gmail.com accounts for critical script integrations. **Why fails:** Google restricts unverified personal OAuth apps, causing consent screens to show scary warnings and expire tokens quickly. **Instead:** Use verified Google Workspace accounts.
- ❌ **DO NOT** use the raw format option (`--raw`) when writing formula cells. **Why fails:** The Google Sheets API treats the text as a literal string (e.g. `"=SUM(A1:A5)"`) rather than executing the formula. **Instead:** Keep raw flags disabled for calculated values.

---

## Standalone Authentication & Sync Pipeline

Using local helper scripts separates token management from main execution:

```
[scripts/auth.py status] ──> [Verify Keyring Token] ──> [Load sheets.py CLI] ──> [Format JSON 2D payload]
```

---

## Examples

### ✅ Good — Keyring Storage, JSON 2D Arrays, and Error Handling

#### 1. Standalone Python Sheets Sync Script (`scripts/sync_data.py`)
```python
import subprocess
import json
import os
import sys

def sync_records_to_google_sheet(spreadsheet_id: str, tab_name: str, records: list):
    # 1. Enforce spreadsheet ID read from safe environment parameters
    if not spreadsheet_id:
        print("[ERROR] Spreadsheet ID is missing.")
        sys.exit(1)

    # 2. Format records as a JSON 2D array (list of lists)
    rows_payload = []
    for item in records:
        rows_payload.append([item["id"], item["name"], str(item["amount"])])

    json_payload = json.dumps(rows_payload)
    
    # 3. Handle spaces in sheet names for A1 notation
    escaped_tab = f"'{tab_name}'" if " " in tab_name else tab_name
    range_notation = f"{escaped_tab}!A2:C{len(records) + 1}"

    # 4. Invoke local Python sheets helper to update cells
    try:
        result = subprocess.run(
            ["python", "scripts/sheets.py", "update-range", spreadsheet_id, range_notation, json_payload],
            capture_output=True,
            text=True,
            check=True
        )
        print("[SUCCESS] Sheets synchronized:", result.stdout.strip())
    except subprocess.CalledProcessError as err:
        print("[ERROR] Synchronization failed:", err.stderr)
        sys.exit(1)
```

Why this passes: Passes values as a JSON 2D array, escapes tab names containing spaces, reads the sheet ID from config variables, and handles script execution errors.

### ❌ Bad — Hardcoded Keys, Flat String Payloads, and Un-escaped ranges

```python
import subprocess

# ERROR 1: Exposing credentials and hardcoding spreadsheets parameters
def bad_sync(data):
    # ERROR 2: Hardcoded ID is exposed in source code
    sheet_id = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" 

    for idx, item in enumerate(data):
        # ERROR 3: Un-escaped tab name with spaces triggers parsing errors
        range_notation = f"Q1 Sales!A{idx + 2}"
        
        # ERROR 4: Writing cell updates in a loop causes API rate limits blockages
        # ERROR 5: Passing a flat string instead of a JSON 2D array fails API validation
        payload = f"{item['id']},{item['name']}"

        subprocess.run([
            "python", "scripts/sheets.py", "update-range", sheet_id, range_notation, payload
        ])
```

Why this fails: Hardcodes spreadsheet IDs, runs single update scripts inside a loop (triggering rate limits), omits single quotes around sheet names containing spaces, and passes a flat CSV string instead of a 2D JSON array.

---

## Failure Modes

- **The Version Control Leak:** Committing client secrets or access tokens directly to Git repositories.
- **The Loop Write Lockout:** Executing single cell updates inside loops, triggering Google's rate limits.
- **The Flat String Format Reject:** Passing flat arrays or plain text strings for data values instead of 2D JSON arrays.
- **The Space Character Parse Error:** Omitting single quotes around sheet names containing spaces in A1 notation.
- **The Raw Formula Omission:** Passing formula strings while the `--raw` flag is active, blocking calculations.
- **The Gmail Consent Expiry:** Running critical scripts using unverified personal Gmail accounts, causing tokens to expire.

## Validation

Audit script payload structures, credentials exclusions, and authentication checks:

1. **Verify that no credentials files are tracked in Git:**
   Check git tracking:
   ```bash
   git status --ignored | grep -E "credentials\.json|token\.json"
   # expected: Credentials and tokens are ignored by Git.
   ```
2. **Verify values payloads formatting:**
   Check Python sync scripts:
   ```bash
   grep -rn "json.dumps(" scripts/ 2>/dev/null
   # expected: Value payloads are stringified as JSON arrays.
   ```
3. **Verify authentication status checks:**
   Verify auth checks in scripts:
   ```bash
   grep -rn "auth.py status" scripts/ 2>/dev/null
   # expected: Verify that automation tasks check auth status before running.
   ```
4. **Identify write calls executed inside loop blocks:**
   Scan code files for `sheets.py` calls inside loops to confirm updates are grouped.

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk melakukan integrasi Google Sheets standalone:

> "Use the skill `google-sheets-automation`. Read `.agent/skills/google-sheets-automation/SKILL.md` before coding. Never commit credentials to version control or run update scripts inside loops. Always pass data as JSON 2D arrays, escape sheet names containing spaces, and store tokens using system keyrings."

## Related

- [googlesheets-automation](../googlesheets-automation/SKILL.md) — Rube MCP tool guides.
- [env-fortress](../env-fortress/SKILL.md) — Git secrets exclusions.
- [nodejs-backend-patterns](../nodejs-backend-patterns/SKILL.md) — Backend environments setup.
