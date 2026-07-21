#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE (Elite Agent Standards)
# ==============================================================================
# Script ini diaudit untuk:
# 1. READ-ONLY: Tidak mengubah struktur file, hanya membaca teks.
# 2. PRIVILEGE: Dijalankan sebagai standar user.
# 3. SAFETY: Escaping regex khusus untuk deteksi elemen HTML dasar.
# ==============================================================================

echo "🕷️ [Elite Security] Memulai SEO Audit: Mencari Missing Alt Tags..."
echo "Menganalisis file HTML/JSX/TSX untuk tag <img> yang tidak memiliki atribut 'alt'."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

# 1. Deteksi gambar tanpa alt
# Logika regex: Cari `<img` yang TIDAK diikuti oleh `alt=` hingga tag penutup `>`
# Karena regex bash terbatas, kita menggunakan pendekatan multi-step:
# Ambil baris dengan <img, kecualikan baris yang memiliki "alt=".
echo "🔎 Pengecekan: <img> tanpa atribut 'alt'"
BAD_IMGS=$(grep -rnE "<img[^>]*>" "$TARGET_DIR" --include=\*.{html,jsx,tsx,vue} | grep -v "alt=")

if [ -n "$BAD_IMGS" ]; then
    echo "🚨 [DANGER] Ditemukan gambar yang tidak memiliki atribut 'alt'!"
    echo "Ini adalah dosa besar untuk SEO dan Aksesibilitas."
    echo ""
    echo "$BAD_IMGS"
    echo ""
    echo "❌ [STATUS] Audit GAGAL. Harap perbaiki sebelum deploy."
else
    echo "✅ [AMAN] Semua tag <img> memiliki atribut 'alt'."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL. Skor SEO Anda aman."
fi
