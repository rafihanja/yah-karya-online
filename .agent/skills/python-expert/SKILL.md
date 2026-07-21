---
name: python-expert
description: Ultimate Python expertise. Use this skill when writing, reviewing, or designing Python code architecture. Prioritizes best practices, modern type hints, memory efficiency, and clean code (SOLID).
risk: safe
source: "Skill Revolution - Phase 7 (Claude upgrade to 10-point standard)"
---

# Python Expert (Master Level)

Active when handling `.py` files or designing Python-based logic, backend, data science, or automation in this repo.

## When to Use

- Writing, reviewing, or structuring Python code (asset scripts, `test_*.py`, automation bots).
- Heavy pixel manipulation (checkerboard removal, luma-keying) needing memory/perf optimization.
- Integrating external libs (OpenCV, Pillow, Playwright, asyncio) with I/O-bound or CPU-bound concerns.

## Why This Exists

Python's dynamic typing and forgiving runtime hide bugs that only surface at scale: bare `except` swallowing `KeyboardInterrupt`, `+=` on strings causing O(n²) memory churn, mutable default arguments sharing state across calls, unclosed PIL images leaking file handles, `requests` without timeouts hanging CI forever. This skill encodes modern Python (3.9+) discipline — explicit type hints, structured logging, proper concurrency, and runtime probes — to make those bugs unwriteable.

## ALWAYS DO THIS

### 1. Modern Explicit Type Hints
Use PEP 585/604 syntax (`list[str]`, `str | None`), never `List[str]` or `Optional[str]`. Public functions must declare arg and return types.
```python
def process_images(files: list[str]) -> dict[str, bool]:
    return {f: True for f in files if f.endswith(".png")}
```

### 2. Structured Logging
Never use `print()` for debug/error in utility or production scripts. Use the `logging` module.
```python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
```

### 3. Concurrency for Batch Work
Use `ThreadPoolExecutor` for I/O-bound, `ProcessPoolExecutor` for CPU-bound. Always `with`-scoped so executors shut down cleanly.
```python
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor() as executor:
    list(executor.map(clean_single_image, images))
```

### 4. Context Managers for Resources
File handles, sockets, DB connections, OpenCV captures — always `with` so `__exit__` releases on exception.

## NEVER DO THIS

### 1. Bare Except
`except:` or `except Exception:` swallows `KeyboardInterrupt`, `SystemExit`, and `NameError`. Catch specific exceptions.
```python
# WRONG
try: img = Image.open(path)
except: return None

# RIGHT
try: img = Image.open(path)
except FileNotFoundError as e:
    logger.error(f"Missing file: {e}")
    raise
```

### 2. String Accumulation in Loops
`+=` on strings inside loops causes O(n²) memory churn (strings are immutable).
```python
# WRONG
txt = ""
for item in big_data: txt += item + "\n"

# RIGHT
txt = "\n".join(big_data)
```

### 3. Mutable Default Arguments
`def f(items=[])` shares one list across all calls — classic Python footgun.
```python
# WRONG
def add(item, items=[]): items.append(item); return items

# RIGHT
def add(item, items=None):
    if items is None: items = []
    items.append(item); return items
```

## Failure Modes

- **The Silent subprocess Failure:** `subprocess.run` without `check=True` ignores non-zero returncode; downstream code thinks the command succeeded. **Fix:** always `check=True` or inspect `result.returncode`.
- **The PIL File-Handle Leak:** opening images in a loop without `with Image.open(...) as img:` leaks handles → "Too many open files" on Linux. **Fix:** always `with` context manager.
- **The asyncio Double-Loop Crash:** calling `asyncio.run()` from an async context (Jupyter, Playwright handler) raises `RuntimeError: asyncio.run() cannot be called from a running event loop`. **Fix:** `await` directly inside async functions; reserve `asyncio.run()` for the top-level entrypoint only.
- **The Pandas Chained Assignment Trap:** `df[df.col > 0]["other"] = x` triggers `SettingWithCopyWarning` and may not mutate the original frame. **Fix:** `.loc[df.col > 0, "other"] = x`.
- **The pathlib / os.path Slash War:** mixing `pathlib.Path` and `os.path` on Windows produces backslash/forward-slash confusion that breaks downstream tooling. **Fix:** pick one; prefer `pathlib.Path` end-to-end and `.as_posix()` only when feeding cross-platform tools.
- **The requests Forever-Hang:** default `requests.get(url)` blocks forever if the server stalls — classic hung-CI cause. **Fix:** always pass `timeout=(connect, read)`, e.g. `timeout=(5, 30)`.

## Validation

1. **Syntax & import check:**
   ```bash
   python -m py_compile path/to/script.py
   ```
   Catches `SyntaxError` and missing-import-on-import-time bugs without running the script.

2. **Type check (if mypy/pyright configured):**
   ```bash
   mypy path/to/script.py --strict
   # OR
   pyright path/to/script.py
   ```
   Confirms type hints match actual usage. Skip only if the project has no type-check tooling and adding it is out of scope.

3. **Lint:**
   ```bash
   ruff check path/to/script.py
   # OR
   python -m flake8 path/to/script.py
   ```
   Catches unused imports, undefined names, bare except, mutable defaults.

4. **Smoke run on real sample:**
   For asset scripts, run on a small known input and compare output to a golden file:
   ```bash
   python path/to/script.py samples/small.png && python -c "from PIL import Image; print(Image.open('out.png').size)"
   ```
   Static checks miss runtime errors (missing DLLs, wrong OpenCV version, file-handle leaks).

## Sub-Agent Propagation

When dispatching a sub-agent for Python work:

> "Use the skill `python-expert`. Read `.agent/skills/python-expert/SKILL.md` before coding. Never use bare `except`, mutable default args, string `+=` in loops, or `requests` without `timeout=`. Always use PEP 585/604 type hints, `with` for resources, structured `logging` (not `print`), and run `python -m py_compile` + `ruff check` before claiming done."

## Related

- [python-asset-pipeline](../python-asset-pipeline/SKILL.md) — OpenCV/Pillow asset-build scripts specifically
- [verification-before-completion](../verification-before-completion/SKILL.md) — generic completion gate
