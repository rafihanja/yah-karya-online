# Master SKILL.md Template — Surgical Precision Standard

> **Purpose:** Template referensi untuk SEMUA SKILL.md upgrade dalam Skill Revolution.
> **Audience:** Claude (Claude Code) dan Gemini (Antigravity).
> **Rule emas:** ADD value, JANGAN HAPUS. Kalau original sudah punya sebagian point, isi yang KOSONG saja.
> **Reference quality:** `.agent/skills/session-boot/SKILL.md`, `.agent/skills/deep-thinking-enforcer/SKILL.md`.

---

## 10-Point Quality Checklist

Sebelum tandai skill `done`, verifikasi 10 point ini ada SEMUA di SKILL.md:

| # | Section | Wajib? | Catatan |
|---|---|---|---|
| 1 | Frontmatter YAML (`---` + `name:` + `description:`) | ✅ Wajib | Description 1 kalimat, spesifik. Jangan generic. |
| 2 | `## When to Use` | ✅ Wajib | Trigger spesifik (dependency:X, file:Y, request:Z), bukan "kapan saja" |
| 3 | `## Why This Exists` | ✅ Wajib | Problem yang dipecahkan + akibat kalau skill tidak dipakai |
| 4 | `## ALWAYS DO THIS` | ✅ Wajib | Tindakan konkret + verifiable (command, file path, code pattern) |
| 5 | `## NEVER DO THIS` | ✅ Wajib | Anti-pattern + failure mode (kenapa salah, dampak nyata) |
| 6 | `## Examples` (good + bad minimum) | ✅ Wajib | Kode/contoh dari REPO INI atau dunia nyata, bukan placeholder |
| 7 | `## Validation` | ✅ Wajib | Command (npm/node/grep/playwright) + expected output |
| 8 | `## Failure Modes` atau Evidence Gates | ✅ Wajib | "Tanda kalau skill ini di-skip oleh agent" |
| 9 | `## Sub-Agent Propagation` | ✅ Wajib | Instruksi 1 paragraf untuk diteruskan ke sub-agent |
| 10 | Single Language (ID atau EN) | ✅ Wajib | Jangan campur. Cek dengan: hitung kata "yang/untuk/dan" vs "the/for/and" |

## Struktur File (template skeleton)

```markdown
---
name: <skill-slug>
description: <1 kalimat spesifik. Mention library/tool concrete + use case>
---

# <Skill Title>

> **One-liner:** <Inti skill dalam 1 baris pendek>

## When to Use

- Saat user/agent <trigger spesifik 1>
- Saat file/dependency <trigger spesifik 2>
- Saat ada permintaan <trigger spesifik 3>

## Why This Exists

<Paragraph: problem yang muncul tanpa skill ini. Contoh nyata dari repo/industri.>

## ALWAYS DO THIS

- <Action 1: konkret, verifiable. Sebut command/file/pattern>
- <Action 2: ...>
- <Action 3: ...>

## NEVER DO THIS

- ❌ <Anti-pattern 1>. **Why fails:** <dampak konkret>. **Instead:** <fix>.
- ❌ <Anti-pattern 2>. **Why fails:** ... **Instead:** ...
- ❌ <Anti-pattern 3>. ...

## Examples

### ✅ Good — <judul: konteks kapan ini cocok>

\`\`\`<bahasa>
<kode konkret, real, repo-aware kalau bisa>
\`\`\`

Why this passes: <1-2 kalimat alasan>.

### ❌ Bad — <judul: anti-pattern yang biasa muncul>

\`\`\`<bahasa>
<kode anti-pattern>
\`\`\`

Why this fails: <konsekuensi: bug, leak, slow, broken UX, dll>.

### 🟡 Edge Case — <judul opsional kalau ada nuansa>

<Penjelasan kasus yang sering bikin agent salah>.

## Failure Modes

- <Pola 1 yang menandakan agent skip skill ini>
- <Pola 2: claim tanpa verifikasi>
- <Pola 3: ...>

## Validation

Cara verifikasi agent benar-benar pakai skill ini:

1. **<Check 1>** — \`<command>\` → expected \`<output>\`
2. **<Check 2>** — <action verifikasi manual>
3. **<Check 3>** — ...

## Sub-Agent Propagation

Saat dispatch sub-agent yang menyentuh <area skill ini>, sertakan:

> "Pakai skill `<skill-name>`. Baca `.agent/skills/<skill-name>/SKILL.md` dulu. Wajib ikuti ALWAYS/NEVER DO. Output akhir wajib sertakan validation command + result."

## Related

- `<skill-name-related-1>` — <1 baris kenapa related>
- `<skill-name-related-2>` — <1 baris>
- `<eksternal source resmi, kalau ada>` — <URL + license catatan>
```

## Rule Bahasa per Skill

1. **Cek bahasa dominan original** sebelum edit.
2. **Pilih satu:** ID atau EN.
3. **Konsisten penuh** — termasuk heading, bullet, code comments.
4. **Pengecualian aman:** istilah teknis tetap EN (CSS, GSAP, ScrollTrigger, will-change, dll).

## Rule Code Examples

1. **Prioritas 1:** kode dari project ini (`parallax-sawah/`, `tes/`, dll) — paling tinggi nilainya.
2. **Prioritas 2:** kode dari doc resmi library (GSAP docs, React docs, MDN).
3. **Prioritas 3:** kode adaptasi dari open-source license aman (MIT/Apache/BSD/ISC).
4. **Tidak boleh:** placeholder generic kayak `// your code here`, atau snippet >50 baris diambil mentah.

## Rule "Jangan Hapus Value"

Sebelum simpan SKILL.md hasil edit, banding line count:

```bash
wc -l .agent/skills/<skill>/SKILL.md
```

- Kalau **hasil LEBIH PENDEK** dari original → highly suspicious. Cek dulu apa yang hilang.
- Kalau original punya **section unik** (mis. "Catatan Rafi", anekdot project) → WAJIB pertahankan.
- Kalau menggabungkan section, **simpan semua substance**, cuma reorganize header.

## Validation Per Skill (sebelum tandai `done`)

```bash
# 1. Format check
node .agent/scripts/validate-agent-skills.mjs

# 2. Audit gap
node .agent/scripts/deep-skill-audit.mjs

# 3. Spot check 10-point manual
grep -c "^## " .agent/skills/<skill>/SKILL.md  # harus >= 7 section utama
grep -i "NEVER\|JANGAN\|❌" .agent/skills/<skill>/SKILL.md  # harus ada
grep -i "validat\|valida\|verif" .agent/skills/<skill>/SKILL.md  # harus ada
grep -ic "```" .agent/skills/<skill>/SKILL.md  # >= 2 (good + bad example minimum)
```

Kalau salah satu fail → balik ke editor sebelum mark `done`.

## Update Status File

Setelah selesai per skill:

```json
// Edit .agent/temp/skill-revolution-status.json
{
  "skills": {
    "<skill-name>": {
      "status": "done",
      "owner": "<gemini|claude>",
      "lastUpdate": "<ISO timestamp>",
      "notes": "<1 baris singkat>"
    }
  }
}
```

Setelah selesai per batch:
- Update `summary` counts
- Pindah skill dari `owns[me].skills` ke `completed[me].<phase>` di `skill-upgrade-lock.json`
- Tulis ringkasan ke `.remember/remember.md` (Gemini) atau update `PROJECT_MEMORY.md` section 6 (Claude saja)

## Anti-Slop Self-Check (sebelum claim done)

3 pertanyaan WAJIB jawab "ya":

1. Apakah aku **baca SKILL.md original** dari awal sampai akhir? (bukan cuma scan)
2. Apakah aku **tambah minimal 1 contoh konkret** yang spesifik repo/library, bukan generic?
3. Apakah aku **bisa rerun validation command** dan dapat output yang aku tulis di section Validation?

Kalau ada satu "tidak" → balik kerjakan ulang, jangan claim done.
