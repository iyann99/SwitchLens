echo "📂 Lokasi saat ini: $(pwd)"
echo ""

git config --global --add safe.directory "$(pwd)" 2>/dev/null || true

# ==========================
# CEK APAKAH SUDAH GIT REPO
# ==========================

if [ ! -d ".git" ]; then
  echo "⚠️  Folder ini belum jadi git repository."
  read -p "Inisialisasi git di sini? (y/n): " initGit
  if [ "$initGit" = "y" ]; then
    git init
    git branch -M main
  else
    echo "Dibatalkan."
    exit 1
  fi
fi

# ==========================
# CEK / PASANG REMOTE "origin"
# ==========================

currentRemote=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$currentRemote" ]; then
  echo ""
  echo "⚠️  Remote 'origin' belum terpasang."
  read -p "Masukkan URL remote (contoh: https://github.com/iyann99/SwitchLens.git): " remoteUrl

  if [ -z "$remoteUrl" ]; then
    echo "❌ URL tidak boleh kosong. Dibatalkan."
    exit 1
  fi

  git remote add origin "$remoteUrl"
  echo "✅ Remote 'origin' berhasil ditambahkan: $remoteUrl"
else
  echo "🔗 Remote 'origin' sudah terpasang: $currentRemote"
fi

# Verifikasi ulang, pastikan remote benar-benar ada sebelum lanjut
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "❌ Gagal memasang remote 'origin'. Coba jalankan ulang skrip ini."
  exit 1
fi

# ==========================
# STATUS SINGKAT
# ==========================

echo ""
echo "📋 Perubahan yang terdeteksi:"
git status --short
echo ""

# ==========================
# ADD & COMMIT
# ==========================

git add .

if git diff --cached --quiet; then
  echo "ℹ️  Tidak ada perubahan baru untuk di-commit."
else
  read -p "📝 Pesan commit (kosongkan untuk pesan default): " commitMsg
  if [ -z "$commitMsg" ]; then
    commitMsg="Update SwitchLens — $(date '+%Y-%m-%d %H:%M')"
  fi
  git commit -m "$commitMsg"
fi

# ==========================
# PUSH
# ==========================

echo ""
echo "🚀 Mendorong ke GitHub (branch: main)..."

if git push -u origin main; then
  echo ""
  echo "✅ Selesai! Perubahan berhasil di-push ke GitHub."
else
  echo ""
  echo "⚠️  Push ditolak. Kemungkinan besar branch 'main' di GitHub sudah punya isi berbeda."
  echo ""
  echo "Pilih salah satu:"
  echo "  1) Gabungkan riwayat GitHub dengan lokal (aman, tidak menghapus apapun)"
  echo "  2) Timpa paksa isi GitHub dengan isi lokal (force push, isi lama di GitHub akan hilang)"
  echo "  3) Batalkan"
  read -p "Pilihan (1/2/3): " pushChoice

  case "$pushChoice" in
    1)
      echo "🔄 Menggabungkan riwayat..."
      if git pull origin main --allow-unrelated-histories; then
        echo "🚀 Mencoba push lagi..."
        git push -u origin main
      else
        echo "❌ Gagal menggabungkan riwayat. Mungkin ada conflict yang perlu diselesaikan manual."
        exit 1
      fi
      ;;
    2)
      echo "🚨 Menimpa paksa isi GitHub..."
      git push -u origin main --force
      ;;
    *)
      echo "Dibatalkan."
      exit 1
      ;;
  esac

  echo ""
  echo "✅ Selesai! Perubahan berhasil di-push ke GitHub."
fi
