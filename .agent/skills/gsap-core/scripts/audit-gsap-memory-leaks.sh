#!/bin/bash

# ==============================================================================
# PERFORMANCE AUDIT NOTE
# ==============================================================================
# Melacak penggunaan GSAP di dalam useEffect tanpa fungsi cleanup.
# ==============================================================================

echo "🟢 [Elite Animasi] Memulai Audit GSAP: Melacak Memory Leak..."
echo "Mencari pemanggilan gsap.to/from di dalam useEffect yang mengabaikan cleanup."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 0
fi

echo "🔎 Pengecekan: GSAP telanjang di dalam useEffect"

# Regex melacak file yang memuat useEffect dan gsap, tapi tidak memuat useGSAP atau gsap.context
FILES=$(grep -rnlE "useEffect.*gsap\.(to|from|timeline)" "$TARGET_DIR" --include=\*.{tsx,jsx})

VIOLATION=0

for FILE in $FILES; do
    # Periksa apakah file ini menggunakan mekanisme pelindung (useGSAP atau ctx.revert)
    HAS_PROTECTION=$(grep -iE "(useGSAP|gsap\.context|revert\(\)|kill\(\))" "$FILE")
    
    if [ -z "$HAS_PROTECTION" ]; then
        echo "🚨 [MEMORY LEAK] File $FILE menggunakan GSAP di dalam useEffect tanpa pengaman!"
        echo "Solusi: Bungkus dengan useGSAP() atau kembalikan fungsi cleanup return () => ctx.revert();"
        VIOLATION=1
    fi
done

echo "----------------------------------------------------------------"
if [ $VIOLATION -eq 1 ]; then
    echo "❌ [STATUS] Audit GAGAL. Tingkat Ancaman: LAG PARAH."
else
    echo "✅ [STATUS] Audit BERHASIL. Animasi Anda aman dari Memory Leak."
fi
