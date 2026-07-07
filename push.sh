#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# SwitchLens — Push ke GitHub via Termux
# ============================================================
# Jalankan dari dalam folder project (yang berisi home.html, dll)
# Contoh: cd storage/shared/Acode/Project1/SwitchLens && bash push.sh
# ============================================================

set -e  # Hentikan skrip jika ada perintah yang gagal

echo "📂 Lokasi saat ini: $(pwd)"
echo ""

# ==========================
# CEK APAKAH SUDAH GIT REPO
# ==========================

if [ ! -d ".git" ]; then
  echo "⚠️  Folder ini belum jadi git repository."
  read -p "Inisialisasi git di sini dan hubungkan ke remote? (y/n): " initGit
  if [ "$initGit" = "y" ]; then
    git init
    read -p "Masukkan URL remote (contoh: https://github.com/iyann99/SwitchLens.git): " remoteUrl
    git remote add origin "$remoteUrl"
    git branch -M main
  else
    echo "Dibatalkan."
    exit 1
  fi
fi

# ==========================
# STATUS SINGKAT
# ==========================

echo ""
echo "📋 Perubahan yang terdeteksi:"
git status --short
echo ""

# ==========================
# COMMIT MESSAGE
# ==========================

read -p "📝 Pesan commit (kosongkan untuk pesan default): " commitMsg
if [ -z "$commitMsg" ]; then
  commitMsg="Update SwitchLens — $(date '+%Y-%m-%d %H:%M')"
fi

# ==========================
# ADD, COMMIT, PUSH
# ==========================

git add .
git commit -m "$commitMsg" || {
  echo "ℹ️  Tidak ada perubahan untuk di-commit."
  exit 0
}

echo ""
echo "🚀 Mendorong ke GitHub..."
git push origin main

echo ""
echo "✅ Selesai! Perubahan berhasil di-push ke GitHub."
