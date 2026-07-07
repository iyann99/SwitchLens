# 📸 SwitchLens v3 — Multi-Source Media Explorer

SwitchLens adalah platform penjelajah aset visual modern yang menggabungkan kekuatan API **Pexels** dan **Pixabay** ke dalam satu dashboard interaktif. Versi 3 membawa perubahan besar: sistem akun pengguna, penyimpanan favorit permanen berbasis cloud, dan navigasi baru yang lebih ringkas untuk mobile.

🔗 **Live:** [switchlens.vercel.app](https://switchlens.vercel.app)

---

## 🚀 Fitur Utama

- **Dual-Source Engine** — Menampilkan foto dan video secara *round-robin* dari Pexels dan Pixabay secara bersamaan.
- **Akun Pengguna (Supabase Auth)** — Sistem login/register penuh. Favorit kini tersimpan permanen di akun kamu, bisa diakses dari perangkat mana saja.
- **Favorit Berbasis Cloud** — Like/unlike foto & video langsung tersinkron ke database (Supabase), menggantikan sistem localStorage lama.
- **Hybrid API Auth** — Pengguna tanpa API key sendiri tetap bisa menjelajah lewat Cloudflare Worker sebagai *secure proxy*, dengan kuota gratis yang diatur otomatis (rate limit per perangkat).
- **Search History** — Riwayat pencarian tersimpan lokal, bisa diklik ulang, serta didukung **export/import** dalam format JSON untuk cadangan atau pindah perangkat.
- **UI Slider Navigasi** — Menu mobile kini terbagi jadi dua slide yang bisa di-swipe: (1) Riwayat pencarian + kategori populer, (2) Kembali, tema, akun, dan export/import riwayat — menjaga tampilan tetap ringkas di layar kecil.
- **PWA Ready** — Bisa di-install ke home screen, dengan service worker untuk pengalaman offline dasar.
- **Backend Proxy Shield** — Seluruh komunikasi ke Pexels, Pixabay, dan Supabase disembunyikan di balik Cloudflare Worker; tidak ada API key atau service key yang terekspos ke browser.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties |
| Hosting Frontend | Vercel |
| Backend / Proxy | Cloudflare Workers (JavaScript, tidak termasuk dalam repo ini) |
| Rate Limiting | Cloudflare Workers KV |
| Auth & Database | Supabase (Auth + Postgres) |
| Sumber Media | Pexels API & Pixabay API |

> **Catatan:** Source code Cloudflare Worker (proxy, rate limit, endpoint auth & favorit) dikelola terpisah langsung di Cloudflare Dashboard dan **tidak disertakan** dalam repository ini, karena berisi kredensial dan logic backend sensitif.

---

## 📁 Struktur Proyek

```
SwitchLens/
├── assets/           → Gambar, ikon, background
├── css/              → Stylesheet per halaman
├── icons/            → Ikon PWA & favicon
├── js/               → Seluruh logic frontend
│   ├── auth.js           → Login, register, session
│   ├── config.js         → Konfigurasi umum, favorit, modal
│   ├── main.js            → Render galeri foto
│   ├── video.js            → Render galeri video
│   ├── button.js            → Interaksi tombol (like, download, share)
│   ├── favorites.js          → Halaman koleksi favorit
│   ├── search-history.js      → Riwayat pencarian + export/import
│   ├── slider.js               → Navigasi swipe menu mobile
│   ├── landing.js               → Halaman landing
│   ├── guide.js                  → Halaman panduan API key
│   └── register-sw.js             → Registrasi service worker
├── favorites.html    → Halaman koleksi favorit
├── guide.html        → Panduan mendapatkan API key
├── home.html         → Dashboard utama penjelajah
├── index.html        → Landing page
├── login.html        → Halaman masuk
├── register.html     → Halaman daftar akun
├── sw.js             → Service worker (PWA)
└── vercel.json       → Header keamanan & konfigurasi deploy
```

---

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/iyann99/SwitchLens.git
cd SwitchLens
```

### 2. Setup Layanan Eksternal

Karena source code Worker tidak ada di repo ini, kamu perlu menyiapkan sendiri infrastruktur backend berikut agar aplikasi berfungsi penuh:

- **Cloudflare Worker** — sebagai proxy ke Pexels/Pixabay, endpoint auth, dan endpoint favorit.
- **Cloudflare KV Namespace** — dibuat dan di-bind ke Worker (cukup lewat Dashboard, tanpa perlu menulis kode tambahan; seluruh logic penghitungan sudah ada di dalam Worker itu sendiri).
- **Supabase Project** — untuk Auth (login/register) dan tabel `favorites`.

### 3. Deploy Frontend

Project ini adalah static site murni (tanpa build step), jadi bisa langsung di-deploy ke **Vercel**:

- Import repository ke Vercel
- Root Directory: `./`
- Build Command, Output Directory, Install Command: **kosongkan semua**
- Deploy

---

## 🔐 Keamanan

- Header keamanan (CSP, HSTS, X-Frame-Options, dll) diatur melalui `vercel.json`.
- Seluruh API key (Pexels, Pixabay) dan kredensial Supabase (Service Role Key) disimpan **hanya di Cloudflare Worker**, tidak pernah terekspos ke sisi klien.
- Autentikasi menggunakan JWT dari Supabase Auth, diverifikasi ulang oleh Worker pada setiap permintaan ke endpoint favorit.

---

## 👤 Developer

Dirancang dan dibangun oleh **Iyan99** sebagai proyek portofolio pengembangan web modern, responsif, dan berorientasi keamanan.

---

## 📄 Lisensi

Proyek ini bersifat privat dan dikembangkan untuk keperluan portofolio pribadi.
