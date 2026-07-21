#!/bin/bash

# ==============================================================================
# THESIS AUDIT NOTE
# ==============================================================================
# Melacak pola bahasa khas robot/ChatGPT di dalam file .txt, .md, atau .tex
# ==============================================================================

echo "🕵️ [Thesis Detector] Memulai Audit Bahasa: Melacak Jejak AI..."
echo "Mencari frasa berbunga-bunga, kaku, dan pembuka basa-basi."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"."}
FILES=$(find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.tex" \) 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "⚠️ Tidak ada file draf tulisan ditemukan."
  exit 0
fi

echo "🔎 Pengecekan: Frasa Terlarang"

# Daftar regex frasa AI
PATTERN="(Penting untuk dicatat|Kesimpulannya|Di era digital|komprehensif|revolusioner|Perlu ditekankan)"
BAD_TEXT=$(grep -rniE "$PATTERN" "$TARGET_DIR" --include=\*.{md,txt,tex} 2>/dev/null)

if [ -n "$BAD_TEXT" ]; then
    echo "🚨 [DANGER] Turnitin Alert! Ditemukan kalimat beraroma ChatGPT:"
    echo "$BAD_TEXT"
    echo ""
    echo "❌ Segera ganti dengan bahasa manusia (Cek forbidden-ai-words.md)."
else
    echo "✅ [AMAN] Bebas dari pola kata kunci AI murahan. Mantap."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Lolos Uji Bahasa."
fi
