#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE (Elite Agent Standards)
# ==============================================================================
# Script ini diaudit untuk:
# 1. READ-ONLY: Tidak ada operasi write/delete.
# 2. PRIVILEGE: Dijalankan sebagai standar user.
# 3. SAFETY: Escaping regex yang sangat ketat untuk mendeteksi hex hardcode.
# ==============================================================================

echo "🎨 [Elite Security] Memulai Audit Anti-Pattern Tailwind CSS..."
echo "Mencari warna Hex Hardcode (Arbitrary Values) di dalam class..."
echo "Contoh pelanggaran: text-[#FF0000] atau bg-[#123456]"
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

# 1. Mencari Arbitrary Hex Colors
# Regex mendeteksi format class yang mengandung -[#...]
echo "🔎 Pengecekan: Arbitrary Hex Colors"
BAD_HEX=$(grep -rnE "[-:]\[#[0-9a-fA-F]{3,8}\]" "$TARGET_DIR" --include=\*.{html,jsx,tsx,vue,svelte})

if [ -n "$BAD_HEX" ]; then
    echo "🚨 [DANGER] Ditemukan warna hardcode. Segera pindahkan ke design tokens CSS (@theme)!"
    echo "$BAD_HEX"
    echo ""
    echo "❌ [STATUS] Audit GAGAL. Bersihkan kode Anda."
else
    echo "✅ [AMAN] Tidak ada warna hardcode yang terdeteksi. Token sistem terjaga."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL. Kode UI bersih."
fi
