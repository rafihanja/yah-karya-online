#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE (Elite Agent Standards)
# ==============================================================================
# Script ini diaudit untuk:
# 1. READ-ONLY: Tidak ada perintah (rm, mv, >, >>, chmod, chown) yang dapat
#    mengubah file. Hanya melakukan pencarian teks.
# 2. PRIVILEGE: Tidak butuh akses root/sudo.
# 3. SAFETY: Menggunakan perintah grep yang aman (no remote exec, no eval).
# ==============================================================================

echo "🔍 [Elite Security] Memulai Audit Potensi GSAP Memory Leak..."
echo "Mencari file yang masih menggunakan useEffect mentah bersama GSAP..."
echo "----------------------------------------------------------------"

# Mencari pattern "useEffect" dan "gsap." di dalam file yang sama (.js, .jsx, .ts, .tsx)
# tetapi TIDAK mengandung "useGSAP".
# Ini adalah tanda bahaya utama terjadinya memory leak di React 18+.

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan. Audit dibatalkan."
  exit 1
fi

# Mencari file yang mengandung 'useEffect'
FILES_WITH_USEEFFECT=$(grep -rl "useEffect" "$TARGET_DIR" --include=\*.{js,jsx,ts,tsx})

LEAK_FOUND=0

for file in $FILES_WITH_USEEFFECT; do
    # Jika file tersebut memanggil gsap tapi tidak pakai useGSAP, dan tidak ada ctx.revert()
    if grep -q "gsap\." "$file"; then
        if ! grep -q "useGSAP" "$file"; then
            if ! grep -q "revert()" "$file"; then
                echo "🚨 [DANGER] Potensi Memory Leak Terdeteksi!"
                echo "File: $file"
                echo "Alasan: Ditemukan penggunaan 'useEffect' dengan 'gsap' TANPA 'useGSAP' atau 'revert()'."
                echo ""
                LEAK_FOUND=1
            fi
        fi
    fi
done

if [ $LEAK_FOUND -eq 0 ]; then
    echo "✅ [AMAN] Tidak ditemukan potensi memory leak pada kode GSAP di dalam direktori $TARGET_DIR."
else
    echo "❌ [GAGAL] Segera refactor file di atas menggunakan useGSAP!"
fi

echo "----------------------------------------------------------------"
echo "Audit Selesai."
