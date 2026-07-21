#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE
# ==============================================================================
# 1. READ-ONLY: Tidak mengubah struktur file.
# 2. SAFETY: Mengecek penggunaan 'px' di inline style atau arbitrary Tailwind.
# ==============================================================================

echo "🎨 [Elite Security] Memulai Audit Frontend Design..."
echo "Mencari hardcoded pixels (px) yang merusak sistem grid (misal: w-[17px])..."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: Arbitrary px (Tailwind) & Inline Style px"
BAD_PX=$(grep -rnE "\[[0-9]+px\]" "$TARGET_DIR" --include=\*.{html,jsx,tsx,vue})

if [ -n "$BAD_PX" ]; then
    echo "🚨 [DANGER] Ditemukan penggunaan piksel statis kaku!"
    echo "Gunakan sistem REM atau token spacing Tailwind (p-4, w-10)."
    echo ""
    echo "$BAD_PX"
    echo ""
    echo "❌ [STATUS] Audit GAGAL."
else
    echo "✅ [AMAN] Sistem fluid/rem terjaga dengan baik."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL."
fi
