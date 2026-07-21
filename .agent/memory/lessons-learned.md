# Lessons Learned — Memori Lintas-Project

> Log pelajaran yang kekumpul dari tiap project. TUJUAN: bikin pengetahuan numpuk
> lintas-project (efek compounding), karena model AI sendiri ga belajar dari kamu.
>
> **Cara pakai:**
> - Di akhir project/fase, tambahkan entry pelajaran (manual atau pakai `capture-lesson.mjs`).
> - Kalau satu `tag` muncul >= 3x di sini, itu sinyal pola berulang → pertimbangkan
>   jadikan skill baru di `.agent/skills/` (lihat skill `lessons-capture`).
> - Diatur oleh skill: `.agent/skills/lessons-capture/SKILL.md`.
>
> **Format tiap entry:**
> ```
> ## YYYY-MM-DD — <nama-project>
> **Lesson:** <pelajaran konkret, 1-3 kalimat>
> **Tags:** tag-a, tag-b
> **Promote?:** yes | no | maybe
> ```

---

## 2026-06-23 — folderotakgsap (.agent kit)
**Lesson:** Sub-agent / task-agent ga otomatis bawa governance saat di-dispatch; harus diperintah eksplisit lewat aturan bridge (SUB-AGENT PROPAGATION). Tanpa itu, sub-agent ngoding tanpa prompt-amplifier/SESSION BOOT.
**Tags:** governance, sub-agent, bridge
**Promote?:** no

## 2026-06-23 — folderotakgsap (.agent kit)
**Lesson:** Skill library besar mayoritas jadi orphan (96.9%). Validator yang cuma cek "ada/sinkron" ngasih rasa aman palsu. Tambahkan deteksi orphan + broken-ref ke doctor biar disiplin kejaga otomatis.
**Tags:** governance, validation, cleanup
**Promote?:** no

## 2026-06-23 — folderotakgsap (.agent kit)
**Lesson:** Prompt user yang "hampir lengkap" sering bikin agent skip SESSION BOOT & phased-delivery. Tambahkan no-skip clause: prompt lengkap TIDAK membebaskan dari governance.
**Tags:** governance, prompt-amplifier
**Promote?:** no

## 2026-06-25 — parallax-sawah
**Lesson:** Gunakan Native SVG Mirroring (<use>) dan pecah SVG jadi DOM layer terpisah lewat skrip Python untuk menghindari sub-pixel gap/seam saat tiling SVG horizontal
**Tags:** gsap, svg, parallax, architecture
**Promote?:** no

## 2026-06-26 — parallax-hutan
**Lesson:** Untuk animasi parallax multi-layer berat (SVG), gunakan 'contain: layout style paint' di CSS untuk mencegah global reflow, dan hindari opacity 0 (gunakan 0.001) agar GPU tidak menghapus texture sehingga bebas glitch.
**Tags:** gsap, performance, css
**Promote?:** no

## 2026-06-26 — parallax-hutan
**Lesson:** Ketika menempatkan base elemen di posisi bawah dalam parallax 3D GSAP, pastikan melapisinya dengan background block solid (fog) di bawah viewport agar objek tidak terlihat menggantung (floating) saat elastic scroll atau resize ekstrem.
**Tags:** parallax, layout, css
**Promote?:** no


### Penggabungan Sawah (2.5D) & Hutan (3D Z-Axis)
- **Merger HTML Hati-hati:** Jangan gunakan Regex yang bisa secara tak sengaja memasukkan <!DOCTYPE html> dan <head> ke dalam elemen anak, ini akan membuat browser crash/blank screen saat render transisi.
- **Path Aset di Localhost:** Rute absolut atau rute mundur ../ sering diblokir oleh Live Server root. Jika menggabungkan environment, satukan dulu folder  ssets_3d secara fisik ke folder tujuan.
- **Performance Killer di GSAP:** DILARANG KERAS menggunakan filter: blur() pada container raksasa (100vw/100vh) yang berisi puluhan SVG resolusi tinggi. Ini akan menyebabkan lag ekstrim (drop FPS). Gunakan manipulasi opacity (crossfade murni) dengan force3D: true.
- **Ilusi Kedalaman (Depth Trick):** Untuk membuat parallax terasa sangat dalam tanpa memperpanjang SCROLL_LENGTH yang membuat jari user capek, lipat gandakan nilai translasi Z (WALK_DISTANCE), bukan jarak scrollnya.

## 2026-06-27 — parallax-ocean (Sawah -> Hutan -> Laut Unification)
**Lesson:** Saat menggabungkan beberapa 'universe' parallax (Sawah, Hutan, Laut) dalam satu HTML menggunakan GSAP Timeline `scrub`, pastikan tag `</div>` penutup dari setiap section universe sudah lengkap. Tag pembungkus yang tidak tertutup akan menyebabkan seluruh elemen universe berikutnya masuk sebagai *child*, sehingga opacity `0` dari universe sebelumnya akan ikut "menelan" atau menyembunyikan elemen universe yang baru tanpa menghasilkan error di konsol.
**Tags:** html, debugging, gsap, timeline, css-stacking
**Promote?:** no

## 2026-07-01 — motion-renderer (Motion Studio Pro)
**Lesson:** Template string (backtick) di dalam fungsi JavaScript yang mengandung sub-template literal WAJIB diescaping dengan `\`` bukan `"` atau `'`. Satu unescaped backtick di dalam template function akan memicu `SyntaxError: Unexpected identifier` di browser pada saat runtime, bukan saat penulisan, sehingga sulit dideteksi tanpa `node -c`.
**Tags:** javascript, syntax, template-literal, debugging
**Promote?:** no

## 2026-07-01 — motion-renderer (Motion Studio Pro)
**Lesson:** Instruksi batas jumlah baris minimum ("minimal 600 baris") di dalam prompt AI justru memicu LLM untuk menulis kode bloat/berulang atau memotong kode di tengah. Ganti dengan aturan "zero-placeholder + kode utuh" sebagai prioritas utama; panjang kode akan mengikuti secara alami dari kedalaman implementasi visual.
**Tags:** prompt-engineering, llm, canvas, dewa-prompter
**Promote?:** no

## 2026-07-01 — motion-renderer (Motion Studio Pro)
**Lesson:** LLM yang menulis canvas animation sering melakukan Hex Alpha Bug: warna seperti `#56b3fa` digabung langsung dengan nilai alpha menggunakan `.replace("ALPHA", 0.9)` menghasilkan string `#56b3fa0.9` yang tidak valid di Canvas API. Solusinya: instruksikan LLM lewat aturan eksplisit untuk selalu membuat helper `hexToRgba(hex, alpha)` jika warna dinamis dengan opacity diperlukan.
**Tags:** canvas, color, prompt-engineering, debugging, llm
**Promote?:** maybe

## 2026-07-01 — motion-renderer (Motion Studio Pro)
**Lesson:** Canvas API `draw(ctx, time, width, height)` bisa dipakai sebagai engine latar belakang website interaktif (hero section, background animasi, dll) dengan menempatkan `<canvas>` di posisi `fixed` z-index rendah di belakang konten HTML biasa. Ini menciptakan tampilan website yang terasa seperti motion graphics microstock premium, dan semua aturan 51-rule prompt generator yang sudah dibuat berlaku penuh untuk usecase ini.
**Tags:** canvas, website, ui-design, gsap, motion-graphics
**Promote?:** yes

## 2026-07-01 — portfolio-rafih (Canvas BG Upgrade)
**Lesson:** Saat memicu ulang loop requestAnimationFrame (seperti setelah menonaktifkan Performance/Pause mode), selalu simpan ID frame animasinya dan panggil cancelAnimationFrame sebelum memulai loop baru. Tanpa ini, pengguna yang mengklik tombol toggle performa secara cepat akan menumpuk thread rendering paralel di background, yang menyebabkan beban CPU/GPU berlipat ganda dan lagging parah.
**Tags:** javascript, requestAnimationFrame, performance, render-loop, debugging
**Promote?:** maybe
## 2026-07-10 — D:\gsap .agent governance
**Lesson:** Ketika skill library sudah 0 issue dan semua skill Excellent, jangan mass-rewrite atas nama upgrade. Naikkan kualitas dengan governance gate yang menutup gap nyata, wire ke router/manifest, lalu buktikan dengan validator dan baseline ratchet.
**Tags:** governance, skill-library, validation
**Promote?:** no

## 2026-07-14 — D:\gsap .agent mobile skill bundle
**Lesson:** When an on-demand skill bundle is restored, run quality audit immediately; newly added bundle skills can be structurally valid but remain Good/deep-audit noisy until ALWAYS/NEVER/Validation/example gates are added.
**Tags:** governance, skill-library, validation, mobile
**Promote?:** no

## 2026-07-15 — D:\gsap universal skill disclosure
**Lesson:** A skill-disclosure rule must be wired into canonical governance, router state, generated adapters, and a validator. Documentation alone cannot prevent trivial replies or status updates from silently skipping the required skill declaration.
**Tags:** governance, validation, skill-library, bridge
**Promote?:** no

## 2026-07-15 - D:\gsap official reference verification
**Lesson:** Daftar referensi teknis yang hanya disalin ke prompt atau bridge mudah
drift dan tidak membuktikan agent benar-benar melakukan source-check. Simpan mapping
dalam satu JSON kanonis, route lewat skill khusus, paksa correction-to-lessons gate,
dan validasi marker plus seluruh pasangan topik/sumber secara otomatis.
**Tags:** governance, official-reference, lessons
**Promote?:** no

## 2026-07-16 — mantra-riset (Fase 2: Docx upload & SQLite migration)
**Lesson:** Parsing file docx server-side dengan `mammoth` secara inline menggunakan `Buffer.from(arrayBuffer)` menghindari penyimpanan file fisik di server. Melakukan `ALTER TABLE` dinamis menggunakan try-catch di database initializer Next.js sangat efektif untuk menjaga kompatibilitas database tanpa membebani deployment lokal.
**Tags:** nextjs, mammoth, docx, sqlite, migration
**Promote?:** no

## 2026-07-16 — mantra-riset (Fase 4: Streaming & Background Citations)
**Lesson:** Next.js App Router API Routes mendukung streaming via ReadableStream. Untuk menjamin keandalan streaming Gemini API, buat wrapper fallback ke static call (dan mock stream array) jika model preview/stream mengalami error 404/500, agar data tetap terkirim ke client dan tersimpan di database SQLite lokal.
**Tags:** nextjs, streaming, gemini, fallback, integration-test
**Promote?:** no

## 2026-07-16 — Umanra (Fase 5 & 6: Data Center & Citations)
**Lesson:** Untuk menjamin data riset AI konsisten dan bebas dari halusinasi angka/profil (khususnya Bab IV Hasil & Pembahasan), pisahkan pengolahan data ke dalam "Pusat Data Olahan" (Data Center) terstruktur di SQLite. Lalu susun parser XML untuk menyuntikkan data tersebut ke prompt AI secara eksplisit sebagai "Source of Truth" tunggal.
**Tags:** sqlite, database, prompt-engineering, data-center, consistency
**Promote?:** no

## 2026-07-20 — folderotakgsap (rebrand I AM CRAZY)
**Lesson:** Saat prompt user menyebut tahun/versi standar (mis. "OWASP 2026"), verifikasi eksistensinya dulu — edisi resmi terkini adalah OWASP Top 10:2025, "2026" tidak ada. Ikut menulis versi yang tidak eksis demi terlihat patuh = halusinasi. WCAG masih 2.2 (3.0 draft), Core Web Vitals pakai INP bukan FID (sejak 2024-03-12). Koreksi dengan fakta, jangan ikut mengarang.
**Tags:** governance, official-reference, anti-hallucination, versioning
**Promote?:** maybe

## 2026-07-20 — folderotakgsap (rebrand I AM CRAZY)
**Lesson:** Rebrand string identitas output yang di-enforce hook (mis. `stop-gate.mjs` yang me-`test()` header) WAJIB atomik: skill + hook + generator adapter sekaligus, kalau tidak governance loop putus (output di-reject selamanya or bridge revert saat regen). Validator di repo ini cek HTML-comment marker, BUKAN string display — jadi rebrand aman selama marker dipertahankan. Selalu petakan enforcement-dependency sebelum rename.
**Tags:** governance, bridge, hook, rebrand, enforcement
**Promote?:** no

## 2026-07-21 — folderotakgsap (official-reference correction)
**Lesson:** Ketika membandingkan model AI terkini di tahun 2026, pastikan tidak berasumsi bahwa Claude Sonnet terbaru adalah 3.5. Anthropic telah merilis Claude Sonnet 5 pada 30 Juni 2026. Lakukan web search aktif untuk memverifikasi versi rilis temporal guna menghindari asumsi salah/halusinasi versi.
**Tags:** governance, official-reference, versioning, anti-hallucination
**Promote?:** no
