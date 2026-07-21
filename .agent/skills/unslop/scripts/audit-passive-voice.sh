#!/bin/bash

# ==============================================================================
# THESIS AUDIT NOTE
# ==============================================================================
# Melacak penggunaan kalimat pasif berlebih (di- ..., ter- ...)
# ==============================================================================

echo "🧼 [Thesis Detector] Memulai Audit Unslop: Melacak Kalimat Pasif..."
echo "Teks dengan dominasi kalimat pasif terdeteksi kuat sebagai tulisan AI."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"."}
FILES=$(find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.txt" \) 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "⚠️ Tidak ada file draf tulisan ditemukan."
  exit 0
fi

echo "🔎 Pengecekan: Rasio Kata Pasif (di-, ter-)"

for FILE in $FILES; do
    # Menghitung kasar frekuensi kata dengan imbuhan pasif (diasumsikan bhs Indonesia)
    PASSIVE_COUNT=$(grep -ioE "\b(di|ter)[a-z]{3,}\b" "$FILE" | wc -l)
    WORD_COUNT=$(wc -w < "$FILE")
    
    if [ "$WORD_COUNT" -gt 0 ]; then
        # Jika lebih dari 10% tulisan adalah kata pasif, itu mencurigakan.
        RATIO=$(( PASSIVE_COUNT * 100 / WORD_COUNT ))
        if [ "$RATIO" -gt 10 ]; then
            echo "🚨 [DANGER] File $FILE: Kalimat Pasif Terlalu Tinggi ($RATIO%)."
            echo "Ubah susunan kalimat menjadi Aktif (me-)."
        else
            echo "✅ [AMAN] File $FILE: Rasio kalimat pasif wajar ($RATIO%)."
        fi
    fi
done
echo "----------------------------------------------------------------"
echo "Selesai."
