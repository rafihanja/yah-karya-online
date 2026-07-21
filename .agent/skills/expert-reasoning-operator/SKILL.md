---
name: expert-reasoning-operator
description: "Always-on untuk setiap task substantif; gunakan juga saat user meminta kemampuan maksimal, expert reasoning, 1000x/1000x lipat, upgrade aturan/skill, atau task berdampak lintas-file; memaksa evidence ledger, risk budget, alternatif, dan validasi sebelum eksekusi."
---

# Expert Reasoning Operator

> One-liner: Ubah "kerahkan kemampuan maksimal" menjadi protokol kerja yang bisa diaudit, bukan sekadar gaya bicara percaya diri.

## When to Use

- Untuk setiap task substantif: kode, config, desain, review, security, deployment, debugging, konten project, atau perubahan aturan.
- Saat user memakai kata seperti "maksimal", "expert", "tingkat ahli", "1000x", "1000x lipat", "1000 kali lipat", "gas total", "jangan asal", atau "transparan semua".
- Saat task menyentuh aturan agent, skill library, router, manifest, adapter, workflow, atau file `.agent`.
- Saat task lintas-file punya risiko regresi, data hilang, security leak, atau salah scope.
- Saat hasil akhir harus membandingkan beberapa opsi sebelum mengambil keputusan engineering.

## Why This Exists

Tanpa skill ini, instruksi "pakai kemampuan maksimal" sering berubah menjadi output panjang tetapi tidak lebih benar. Repo ini butuh mode yang terukur: bukti lokal dulu, risiko eksplisit, alternatif yang dibandingkan, validasi nyata, dan batas scope yang jujur. Skill ini melengkapi `deep-thinking-enforcer`: deep-thinking membuat risk model, skill ini membuat operator kerja yang bisa diverifikasi dari awal sampai akhir.

## ALWAYS DO THIS

- Tulis scope operasional singkat sebelum eksekusi: file area yang masuk scope, file area yang tidak disentuh, dan asumsi yang dipakai.
- Jangan menunggu trigger manual dari user; protokol ini otomatis berlaku untuk task substantif.
- Normalisasi bahasa hiperbolik seperti "1000x lipat" menjadi quality protocol: lebih banyak bukti lokal, risk model lebih tajam, alternatif yang dibandingkan, dan validasi lebih kuat.
- Buat evidence ledger: pisahkan fakta dari file lokal, output command, dokumentasi resmi, dan asumsi yang belum diverifikasi.
- Tetapkan risk budget minimal 3 risiko konkret untuk repo ini, lalu pasangkan dengan mitigasi dan command validasi.
- Bandingkan minimal 2 pendekatan saat mengubah rule, skill, arsitektur, dependency, database, auth, deployment, atau shared UI.
- Ikat setiap klaim "selesai" ke bukti: file changed, command run, exit/result, dan risiko tersisa.
- Jika worktree dirty, sebutkan sebelum edit dan batasi perubahan ke file yang memang ada dalam scope.

## NEVER DO THIS

- Jangan mass-edit skill library hanya karena user bilang "upgrade semua". Why fails: baseline yang sudah hijau bisa turun dan regresi sulit dilacak. Instead: jalankan audit dulu, lalu upgrade target yang punya gap nyata.
- Jangan klaim "semua aturan sudah dipakai" tanpa menyebut file/router/skill yang benar-benar dibaca. Why fails: itu ghost-skill claim. Instead: sebut exact file dan exact validation.
- Jangan menyembunyikan dirty worktree atau perubahan user. Why fails: agent bisa menimpa kerja yang bukan miliknya. Instead: baca `git status --short`, lalu edit hanya file scope.
- Jangan menjawab dengan esai umum tanpa acceptance criteria. Why fails: user tidak bisa membedakan improvement nyata dari filler. Instead: tulis gate yang bisa dicek ulang.

## Examples

### Good - upgrade skill library berbasis bukti

```text
Scope: .agent only; app code tidak disentuh.
Evidence: audit-skill-quality -> 150 Excellent, 0 Good/Weak/Empty.
Decision: tidak mass-edit 150 skill; tambah rule max-capability dan skill operator karena gap ada di governance transparency.
Validation: validate-agent-skills, agent-doctor, deep-skill-audit, audit-skill-quality.
Risk: worktree dirty; mitigasi dengan patch scoped ke .agent.
```

Why this passes: keputusan berasal dari command output, bukan asumsi, dan ada batas scope plus validasi.

### Bad - performative expert mode

```text
Saya akan menggunakan kemampuan maksimal dan mengupgrade semuanya agar jauh lebih bagus.
```

Why this fails: tidak ada file, tidak ada audit, tidak ada risk budget, tidak ada validasi, dan tidak jelas apa yang berubah.

### Edge Case - user minta "langsung gas"

Kalau user minta langsung jalan, agent boleh lanjut dengan asumsi terbaik, tetapi asumsi itu harus ditulis singkat. Contoh: "Saya anggap scope hanya `.agent`, karena app code sedang dirty dan request menyebut aturan/skill."

## Failure Modes

- Agent langsung edit banyak file tanpa audit awal.
- Final answer menyebut skill yang tidak dibaca atau tidak memengaruhi keputusan.
- Tidak ada perbandingan pendekatan untuk perubahan shared/governance.
- Validasi hanya berupa "looks good" tanpa command.
- Risiko tersisa ditulis "none" saat worktree masih dirty atau validasi belum lengkap.

## Validation

Cara memverifikasi skill ini benar-benar dipakai:

1. Route skill harus terdaftar:
   ```powershell
   Select-String -Path .agent\skill-router.json -Pattern "expert-reasoning-operator"
   ```
   Expected: minimal 1 match.
2. Skill library tetap sehat:
   ```powershell
   node .agent\scripts\audit-skill-quality.mjs
   node .agent\scripts\deep-skill-audit.mjs
   ```
   Expected: `Good/Weak/Empty` tetap 0 dan deep audit `Total Issues: 0`.
3. Agent config tetap sinkron:
   ```powershell
   node .agent\scripts\validate-agent-skills.mjs
   node .agent\scripts\agent-doctor.mjs
   ```
   Expected: kedua command exit 0.
4. Final response harus menyebut evidence, files changed, validation result, dan remaining risk.

## Sub-Agent Propagation

Saat dispatch sub-agent untuk task berisiko atau lintas-file, sertakan:

> "Use `expert-reasoning-operator`. Read `.agent/skills/expert-reasoning-operator/SKILL.md` first. State scope, evidence ledger, risk budget, compared approach, validation command/result, and remaining risk. Do not mass-edit or claim done without command evidence."

## Related

- `deep-thinking-enforcer` - membuat analisis akar masalah dan edge case.
- `mandatory-skill-usage` - memastikan skill dipilih dari router, bukan tebakan.
- `self-review-gate` - menahan output sampai validasi selesai.
- `.agent/rules/max-capability-protocol.md` - rule portable untuk mode kemampuan maksimal.
