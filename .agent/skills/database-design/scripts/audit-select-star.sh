#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE
# ==============================================================================
# 1. READ-ONLY: Melakukan grep tanpa mengubah kode.
# 2. SAFETY: Mencegah pola SELECT * yang membengkakkan memori jaringan.
# ==============================================================================

echo "🗄️ [Elite Security] Memulai Audit Database: Deteksi 'SELECT *'..."
echo "SELECT * menarik semua kolom dari tabel, memperlambat jaringan,"
echo "dan mengekspos kolom rahasia seperti 'password_hash'."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: Kueri SQL Barbar (SELECT *)"
# Regex mencari kemunculan SELECT * (case insensitive) dalam file source
# Mengabaikan file bash ini sendiri atau markdown
BAD_QUERIES=$(grep -rniE "SELECT \*" "$TARGET_DIR" --include=\*.{ts,js,go,py,php,java})

if [ -n "$BAD_QUERIES" ]; then
    echo "🚨 [DANGER] Ditemukan kejahatan performa: Kueri SELECT *!"
    echo "Segera definisikan kolom secara spesifik (misal: SELECT id, name)."
    echo ""
    echo "$BAD_QUERIES"
    echo ""
    echo "❌ [STATUS] Audit GAGAL. Optimalkan kueri Anda."
else
    echo "✅ [AMAN] Anda adalah developer beradab. Tidak ada SELECT *."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL."
fi
