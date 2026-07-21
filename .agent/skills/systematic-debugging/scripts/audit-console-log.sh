#!/bin/bash

# ==============================================================================
# QA AUDIT NOTE
# ==============================================================================
# Melacak console.log yang tertinggal di source code sebelum rilis.
# ==============================================================================

echo "🧹 [Elite QA] Memulai Audit Debugging: Melacak sisa console.log..."
echo "console.log() di produksi membuang CPU dan berisiko membocorkan data."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: console.log, console.warn, console.info"

# Mencari console.log di file ts/js (mengabaikan file test)
BAD_LOGS=$(grep -rnE "console\.(log|info|warn)\(" "$TARGET_DIR" \
  --include=\*.{ts,js,tsx,jsx} \
  --exclude=\*.{test.ts,spec.ts,test.js,spec.js})

if [ -n "$BAD_LOGS" ]; then
    echo "🚨 [WARNING] Ditemukan jejak debugging yang lupa dihapus:"
    echo "$BAD_LOGS"
    echo ""
    echo "❌ Hapus atau ganti dengan library Logger sejati (contoh: Winston/Pino)."
else
    echo "✅ [AMAN] Kode bersih dari jejak debugging murahan."
fi
