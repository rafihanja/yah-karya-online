#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE
# ==============================================================================
# 1. READ-ONLY: Melakukan wc/grep tanpa mengubah kode.
# 2. SAFETY: Melacak file 'controller' yang memiliki jumlah baris tidak wajar.
# ==============================================================================

echo "⚖️ [Elite Security] Memulai Audit Arsitektur: Melacak Fat Controllers..."
echo "Controller dengan lebih dari 300 baris kode adalah indikasi kuat"
echo "bahwa Business Logic bocor ke tempat yang salah!"
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: Controller Obesitas (> 300 baris)"

# Menggunakan perintah 'find' untuk mencari file dengan kata 'controller' pada namanya,
# lalu menghitung jumlah barisnya dengan 'wc -l'.
FAT_CONTROLLERS=$(find "$TARGET_DIR" -type f -iname "*controller*.ts" -o -iname "*controller*.js" | xargs wc -l 2>/dev/null | awk '$1 > 300 {print $0}')

if [ -n "$FAT_CONTROLLERS" ]; then
    echo "🚨 [DANGER] Ditemukan Controller yang melebihi batas 300 baris kode!"
    echo "Refactor segera! Ekstrak kalkulasi dan operasi database ke dalam Service Layer."
    echo ""
    echo "$FAT_CONTROLLERS"
    echo ""
    echo "❌ [STATUS] Audit GAGAL. Arsitektur perlu pembersihan."
else
    echo "✅ [AMAN] Semua Controller memiliki ukuran ideal. Pemisahan tugas terjaga."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL."
fi
