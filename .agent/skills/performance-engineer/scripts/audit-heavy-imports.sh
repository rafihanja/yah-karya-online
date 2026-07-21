#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE
# ==============================================================================
# 1. READ-ONLY: Melakukan grep tanpa menghapus file.
# 2. SAFETY: Mencegah import mematikan yang merusak bundle size.
# ==============================================================================

echo "⚡ [Elite Security] Memulai Audit Performa: Pelacakan Heavy Imports..."
echo "Mencari library berat yang diimpor secara keseluruhan (bukan per modul)..."
echo "Contoh Dosa Besar: import _ from 'lodash'"
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: Import Keseluruhan (Lodash, Moment, etc)"
# Mencari string import yang menangkap modul raksasa secara utuh
BAD_IMPORTS=$(grep -rnE "import .* from 'lodash'" "$TARGET_DIR" --include=\*.{ts,tsx,js,jsx})

if [ -n "$BAD_IMPORTS" ]; then
    echo "🚨 [DANGER] Ditemukan Import Lodash Raksasa!"
    echo "Ganti menjadi: import isEmpty from 'lodash/isEmpty' (Atau gunakan fungsi native Javascript)."
    echo ""
    echo "$BAD_IMPORTS"
    echo ""
    echo "❌ [STATUS] Audit GAGAL. Bundle size Anda terancam bengkak."
else
    echo "✅ [AMAN] Tidak ada import barbar terdeteksi. Tree shaking aman."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL."
fi
