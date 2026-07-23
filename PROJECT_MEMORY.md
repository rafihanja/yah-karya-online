# Project Memory — The Grand Overload: Elite Agent Workspace (`folderotakgsap`)

> File ini ditulis otomatis oleh AI. JANGAN dihapus.
> Fungsinya: Menjaga kesinambungan memori dan konteks proyek di repositori `folderotakgsap` (`rafihanja/yah-karya-online`).
> Terakhir diupdate: 2026-07-23T17:31:00+07:00

---

## 1. Ringkasan Project
- **Apa ini:** Repositori **"Brankas Memori & Konfigurasi Elite Agent"** milik **Rafi Hanja** untuk Antigravity IDE & AI coding tools. Berisi 162 Skill Elite, aturan tata kelola agen (*Agent Governance*), skrip utilitas Python Computer Vision (`finger_blur.py`, `demo_headroom.py`), dan konfigurasi lingkungan pengembang.
- **Repositori Git:** `https://github.com/rafihanja/folderotakgsap.git` (`rafihanja/yah-karya-online`).
- **Dibuat untuk:** Solo Founder / Elite Developer workspace management & multi-device memory sync.

---

## 2. Teknologi & Stack yang Dipakai
- **AI Agent System:** `.agent/` (162 Elite Skills, Rules, Validator Scripts, Skill Router).
- **Python Utilities:** Python 3, OpenCV (`cv2`), MediaPipe (`mediapipe`), `yt-dlp` (asynchronous YouTube audio downloader), Windows MCI API (audio playback).
- **Node.js Tooling:** `.agent/scripts/` (skill validators, doctor, index generator, self-review validator).
- **CLI Bridge Integration:** Anthropic Claude Code CLI (`.claude/settings.json`), OpenAI Codex CLI (`.codex`).

---

## 3. Struktur Repositori
```
folderotakgsap/
├── .agent/                    # Folder Utama Agent Governance & 162 Skills
│   ├── rules/                 # Aturan wajib agent (evidence-first, fail-closed, dll)
│   ├── skills/                # 162 Katalog Skill (session-boot, gsap, python, dll)
│   └── scripts/               # Script penguji & validator agent internal
├── .agents/                   # Workspace agent customization bridge
├── .claude/                   # Konfigurasi Claude CLI
├── .cursor/                   # Konfigurasi Cursor IDE bridge
├── cyber-creator/             # Sub-modul / workspace creator tools
├── finger_blur.py             # Script Python deteksi pose V/peace & blur otomatis
├── demo_headroom.py           # Script Python utilitas visual
├── nyoba.py                   # Script eksperimen Python
├── Foto Kita Blur - Sal Priadi.m4a # Aset audio pendukung finger_blur.py
├── AGENTS.md                  # Universal Agent Rules Bridge
├── CLAUDE.md                  # Claude CLI Guidelines Bridge
├── README.md                  # Dokumentasi Utama Repositori
└── PROJECT_MEMORY.md          # File Memori Tunggal Repositori Ini
```

---

## 4. Keputusan Desain & Aturan Utama
1. **Source of Truth Workspace:** Memory file di repositori ini mendokumentasikan sistem `.agent` dan script Python lokal di folder `folderotakgsap`.
2. **Fail-Closed Governance:** Setiap pergerakan agent substantif wajib mematuhi 7 pilar pre-flight di `.agent/skills/` dan menghasilkan header `I AM CRAZY`.
3. **Multi-Device Portable Sync:** Seluruh konfigurasi `.agent` dan `PROJECT_MEMORY.md` di-track oleh Git untuk sinkronisasi instan antar laptop/device.

---

## 5. Progress & Status Terkini
| Modul / Komponen | Status | Catatan |
|---|---|---|
| **Agent Governance (.agent)** | ✅ Active (100%) | 162 Skills, 0 issues. Red Team Audit 2x (Claude CLI + Antigravity) — 15 celah ditemukan & ditambal |
| **Red Team Audit (Claude CLI)** | ✅ Selesai | 7 celah: fail-closed voluntary compliance, process.exit(1) untuk 3 script, content drift detection |
| **Red Team Audit (Antigravity)** | ✅ Selesai | 8 celah BARU: full-repo scan (bukan hardcoded dirs), .md/.html secret scan, PROJECT_MEMORY check, Node v16+ guard |
| **Python Finger Blur (finger_blur.py)** | ✅ Stable | Deteksi V-sign (MediaPipe) + blur dinamis + audio 'Foto Kita Blur' (yt-dlp) |
| **Landing Page Storytelling (Antigravity)** | ✅ Selesai | `hasilantigravity.html` — 2003 baris, GSAP+Three.js+Lenis+Splitting.js, 8 Section, custom cursor, glassmorphism, 3D tilt cards |
| **Landing Page Storytelling (Gemini 3.6)** | ✅ Selesai | Generasi file `hasilgemini36flash.html` (GSAP, Three.js, Lenis, Splitting.js, 8 Section) |
| **Landing Page Storytelling (Gemini 3.5)** | ✅ Selesai | Generasi file `hasilgemini35flash.html` (GSAP, Three.js, Lenis, Splitting.js, 8 Section) |
| **Landing Page Storytelling (Gemini 3.1 Pro)** | ✅ Selesai | Generasi file `hasilgemini31pro.html` (GSAP, Three.js, Lenis, Splitting.js, 8 Section) |
| **Project Memory Alignment** | ✅ Selesai | `PROJECT_MEMORY.md` diperbarui sesuai konteks repo `folderotakgsap` |

---

## 6. Catatan untuk Sesi Berikutnya
- Repositori ini adalah rumah dari sistem `.agent` & memori Antigravity.
- Jika melakukan pengujian `.agent` governance, gunakan:
  ```bash
  node .agent/scripts/validate-agent-skills.mjs
  node .agent/scripts/agent-doctor.mjs
  ```
