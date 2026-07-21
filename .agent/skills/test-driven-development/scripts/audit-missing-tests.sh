#!/bin/bash

# ==============================================================================
# QA AUDIT NOTE
# ==============================================================================
# Mencari file service atau logika yang tidak memiliki pasangan file `.test.ts`.
# ==============================================================================

echo "🧪 [Elite QA] Memulai Audit TDD: Melacak File Tanpa Test..."
echo "Hanya berlaku untuk folder /services atau /utils."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src/services"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 0
fi

echo "🔎 Pengecekan: Rasio File vs Test"

FILES=$(find "$TARGET_DIR" -type f -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts")

for FILE in $FILES; do
    BASENAME=$(basename "$FILE" .ts)
    DIRNAME=$(dirname "$FILE")
    
    # Mencari apakah ada file pasangan .test.ts atau .spec.ts
    if [ ! -f "$DIRNAME/$BASENAME.test.ts" ] && [ ! -f "$DIRNAME/$BASENAME.spec.ts" ]; then
        echo "🚨 [MISSING] File $FILE tidak memiliki pengawal Test!"
    fi
done

echo "----------------------------------------------------------------"
echo "✅ Pengecekan Selesai. Pastikan komponen kritis tertutup oleh Unit Test."
