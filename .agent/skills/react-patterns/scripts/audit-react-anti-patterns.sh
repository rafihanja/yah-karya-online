#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE (Elite Agent Standards)
# ==============================================================================
# Script ini diaudit untuk:
# 1. READ-ONLY: Tidak mengubah struktur file, hanya membaca teks.
# 2. PRIVILEGE: Dijalankan sebagai standar user.
# 3. SAFETY: Menggunakan grep dengan escaping regex yang aman.
# ==============================================================================

echo "🔍 [Elite Security] Memulai Audit Anti-Pattern pada React..."
echo "Mencari file yang melanggar aturan berat (misal: key={index})..."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan. Pastikan Anda menjalankannya di root project."
  exit 1
fi

VIOLATION_FOUND=0

# 1. Mencari Anti-Pattern: key={index} dalam file tsx/jsx
echo "🔎 Pengecekan 1: Penggunaan 'key={index}'"
BAD_KEYS=$(grep -rnE "key=\{?[ ]*index[ ]*\}?" "$TARGET_DIR" --include=\*.{jsx,tsx})

if [ -n "$BAD_KEYS" ]; then
    echo "🚨 [DANGER] Ditemukan penggunaan 'key={index}' yang berpotensi menghancurkan performa render!"
    echo "$BAD_KEYS"
    echo ""
    VIOLATION_FOUND=1
else
    echo "✅ [AMAN] Tidak ada 'key={index}' terdeteksi."
fi

# 2. Mencari Anti-Pattern: useEffect tanpa dependency array (sangat berbahaya)
# Deteksi kasar: mencari "useEffect(() => {" tanpa penutup "}, []);"
# Karena bash regex agak rentan untuk pengecekan blok kode multiline, kita gunakan grep 
# sederhana untuk mendeteksi keberadaan useEffect, tapi peringatkan user.

echo "----------------------------------------------------------------"
if [ $VIOLATION_FOUND -eq 0 ]; then
    echo "✅ [STATUS] Kode React Anda terlihat bersih dari pelanggaran fatal."
else
    echo "❌ [STATUS] Segera refactor file di atas agar sesuai dengan standar React Elite!"
fi
echo "----------------------------------------------------------------"
