#!/bin/bash

# ==============================================================================
# SECURITY AUDIT NOTE
# ==============================================================================
# 1. READ-ONLY: Melakukan grep tanpa mengubah file.
# 2. SAFETY: Melacak router API yang tidak memiliki versi di depannya.
# ==============================================================================

echo "🌐 [Elite Security] Memulai Audit API: Melacak Unversioned API Routes..."
echo "Mencari definisi rute yang mengabaikan pola /api/v[X]/..."
echo "----------------------------------------------------------------"

TARGET_DIR=${1:-"src"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️ Direktori $TARGET_DIR tidak ditemukan."
  exit 1
fi

echo "🔎 Pengecekan: Definisi Router Tanpa Versi"
# Asumsi kita menggunakan express: router.get('/users' ... atau app.use('/api/users')
# Ini mengecek deklarasi string url yang dimulai dengan '/api/' TAPI tidak diikuti 'v\d'
BAD_ROUTES=$(grep -rnE "('/api/(?!v[0-9]+/).*')" "$TARGET_DIR" --include=\*.{ts,js})

if [ -n "$BAD_ROUTES" ]; then
    echo "🚨 [DANGER] Ditemukan pendefinisian rute API tanpa tag versi!"
    echo "Tambahkan versi! Contoh: '/api/v1/...'"
    echo ""
    echo "$BAD_ROUTES"
    echo ""
    echo "❌ [STATUS] Audit GAGAL."
else
    echo "✅ [AMAN] Semua API Anda terlihat sudah mendukung sistem Versioning."
    echo "----------------------------------------------------------------"
    echo "✅ [STATUS] Audit BERHASIL."
fi
