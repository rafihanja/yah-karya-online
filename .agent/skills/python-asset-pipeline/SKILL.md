---
name: python-asset-pipeline
description: "Expert guidelines for building portable Python-based visual asset processing pipelines (OpenCV, contours, SVG path extraction, deterministic seeding, and clashing transform wrappers)."
---

# Python Asset Pipeline — Kaidah Pemrosesan Aset Visual & SVG

> **One-liner:** Panduan wajib bagi agen AI saat menulis skrip utilitas pemroses gambar (OpenCV) dan pembuat visual layout HTML di repositori ini agar kodenya aman, portabel, deterministik, dan bebas bentrokan CSS.

## Why This Exists

Asset generator Python di repo ini memengaruhi HTML visual yang besar dan mudah rusak oleh path lokal, random layout yang berubah-ubah, atau transform CSS yang saling menimpa. Skill ini memaksa pipeline aset tetap portabel, deterministik, dan aman untuk diulang oleh agent lain tanpa bergantung pada mesin pembuat pertama.

## When to Use

Gunakan skill ini ketika kamu diminta membuat atau memodifikasi:
1. Skrip pemrosesan gambar dengan OpenCV (`cv2`) untuk memisahkan siluet, mengekstrak kontur, atau menghapus latar belakang.
2. Skrip generator Python (seperti `build_*.py`) yang menghasilkan berkas HTML/CSS untuk parallax atau visual di browser.
3. Skrip utilitas ekspor SVG/vektor dari gambar mentah.

## ALWAYS DO THIS

## Core Mandates

### 1. Portabilitas Path Mutlak (Zero Hardcoded Paths)
Jangan pernah berasumsi bahwa skrip akan dijalankan di komputer yang sama. Dilarang keras menuliskan *hardcoded path* absolut dari mesin developer atau root workspace lokal.
*   **Wajib:** Tentukan direktori relatif terhadap lokasi file skrip saat ini.
    ```python
    import os
    
    # Dapatkan direktori skrip saat ini
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Gabungkan secara aman menggunakan os.path.join
    source_dir = os.path.join(base_dir, 'assets_source')
    dest_dir = os.path.join(base_dir, 'parallax-sawah', 'assets_3d', 'ocean_svg')
    ```
*   **Pencegahan Crash:** Selalu buat folder tujuan menggunakan `os.makedirs(dest_dir, exist_ok=True)`. Jika folder sumber tidak ditemukan, tampilkan pesan peringatan di `sys.stderr` alih-alih membiarkan skrip mengalami crash.

### 2. Deterministic Layout (Random Seeding)
Skrip generator sering kali mengacak posisi objek visual agar terlihat alami. Namun, tanpa inisialisasi seed, posisi objek akan bergeser terus setiap kali skrip dijalankan, merusak layout desain.
*   **Wajib:** Lakukan pemanggilan `random.seed(value)` di baris awal sebelum menggunakan fungsi acak apa pun.
    ```python
    import random
    
    # Inisialisasi seed agar hasil render deterministik & repeatable
    random.seed(42)
    ```

### 3. Solusi Clashing Transform CSS (Div Wrapper)
Jika elemen visual diberikan animasi CSS (seperti `.anim-hover` atau `.anim-swim` yang menggeser koordinat menggunakan `transform: translateY`), browser akan menimpa seluruh inline style `transform` asli milik elemen tersebut.
*   **Wajib:** Jangan menaruh class animasi CSS langsung pada tag gambar/elemen yang memiliki inline transform statis (seperti `scaleX` flip atau `rotate`). Bungkus elemen tersebut dalam tag pembungkus (wrapper):
    ```python
    # Outer div untuk posisi (absolute) dan animasi CSS (translate)
    html += f'<div class="{anim}" style="position: absolute; top: {top}px; left: {left}vw; width: {width}vw; animation-delay: {delay};">\n'
    # Inner img untuk filter kedalaman dan transform statis (flip/rotate)
    html += f'    <img src="assets_3d/fauna/{svg_id}.png" class="color-entity {depth_class}" style="position: relative; width: 100%; transform: scaleX({scale_x}) rotate({rotate}deg);" alt="{svg_id}">\n'
    html += f'</div>\n'
    ```

### 4. OpenCV Contour Handling & Simplification
Saat melakukan vektorisasi siluet gambar menjadi path SVG:
*   **Penyaringan Noise:** Selalu urutkan kontur yang didapat berdasarkan luas area dan hanya proses kontur terbesar untuk menghindari noise mengapung di udara.
    ```python
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest_contour = max(contours, key=cv2.contourArea)
    ```
*   **Penyederhanaan Vektor:** Gunakan `cv2.approxPolyDP` untuk membatasi jumlah *vertices* (titik sudut) kontur agar ukuran berkas SVG hasil tidak membengkak (bloated). Sesuaikan epsilon secara dinamis berdasarkan keliling kontur:
    ```python
    epsilon = 1.0 * cv2.arcLength(largest_contour, True) / 1000.0
    approx = cv2.approxPolyDP(largest_contour, epsilon, True)
    ```

### 5. Efisiensi Alokasi Memori
*   Hindari penggabungan string bertumpuk (`+=`) di dalam loop besar yang memproses ratusan aset.
*   Gunakan list untuk menampung string kode, lalu gabungkan di akhir menggunakan `"\n".join(lines_list)` demi penghematan memori CPU yang signifikan.

---

## NEVER DO THIS

*   **JANGAN** membiarkan skrip mengembalikan *silent failure* (fungsi `return` kosong tanpa log) jika pembacaan gambar gagal. Selalu berikan info log kegagalan.
*   **JANGAN** mencampur sistem unit koordinat (seperti menggunakan `px` untuk top/tinggi dan `vw` untuk left/lebar) di kanvas yang sama jika didesain untuk layar responsif. Konsistenlah menggunakan unit berbasis viewport (`vw`/`vh`).

## Failure Modes

- **Path Lokal Bocor:** Script berisi path absolut dari mesin developer sehingga gagal di CI atau perangkat lain. Mitigasi: resolve semua path dari `__file__` dan scan string path absolut sebelum commit.
- **Output Tidak Deterministik:** Posisi fauna/asset berubah setiap run karena random seed tidak dikunci. Mitigasi: panggil `random.seed(...)` sebelum layout generation dan cek `git diff --exit-code` setelah dua run.
- **Transform CSS Bertabrakan:** Class animasi dan transform statis ditempel pada elemen yang sama, menyebabkan flip/rotate hilang. Mitigasi: pakai wrapper untuk animasi, inner element untuk transform statis.
- **Kontur Noise Terpilih:** OpenCV mengambil contour kecil dari noise transparan, menghasilkan SVG rusak. Mitigasi: filter berdasarkan area dan proses contour terbesar yang valid.
- **Silent Asset Failure:** Gambar gagal dibaca tetapi script lanjut tanpa log, membuat HTML kehilangan asset. Mitigasi: tulis error ke `stderr` dan gagal eksplisit untuk input wajib.


## Validation

Validation for `python-asset-pipeline`:

1. **Verify relative paths execution:**
   Jalankan skrip generator dari direktori mana pun untuk memastikan tidak ada ketergantungan path absolut:
   ```bash
   python build_color_final.py
   ```
2. **Verify randomized seeding output consistency:**
   Bandingkan hash keluaran dari dua kali eksekusi berturut-turut untuk memastikan output bersifat deterministik (deterministik):
   ```bash
   python build_color_final.py
   git diff --exit-code
   ```
3. **Verify DOM nesting compliance:**
   Cari elemen `.color-entity` di dalam file HTML yang dihasilkan untuk memeriksa apakah ia memiliki element wrapper div pembungkus yang sesuai:
   ```bash
   grep -rn "color-entity" parallax-sawah/index.html
   ```
4. **Scan for hardcoded local paths:**
   Pastikan script dan skill tidak menyimpan path absolut dari mesin developer:
   ```bash
   rg -n "Users/|/home/|d:/gsap" --glob "*.py" --glob "SKILL.md"
   ```

## Sub-Agent Propagation

Saat mengirim sub-agent untuk pipeline aset Python, sertakan instruksi ini:

> "Use `python-asset-pipeline`. Read `.agent/skills/python-asset-pipeline/SKILL.md` before editing. Use paths relative to `__file__`, lock random seeds, keep animation wrappers separate from static transforms, handle OpenCV contour noise explicitly, and validate with generator reruns plus a hardcoded-path scan."
