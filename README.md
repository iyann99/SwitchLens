<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b22d,100:0a3d2c&height=200&section=header&text=SwitchLens&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Multi-Source%20Media%20Discovery%20Platform&descAlignY=58&descSize=18" width="100%"/>

<a href="https://switchlens.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&pause=1000&color=00B22D&center=true&vCenter=true&width=600&lines=Cari+foto+%26+video+dari+6+sumber+sekaligus;Pexels+%C2%B7+Pixabay+%C2%B7+Unsplash+%C2%B7+Pinterest+%C2%B7+Bing+%C2%B7+YouTube;Disimpan+ke+akunmu%2C+bisa+diakses+di+mana+saja." alt="Typing SVG" />
</a>

<br/>

[![Live Demo](https://img.shields.io/badge/Live-switchlens.vercel.app-00b22d?style=for-the-badge&logo=vercel&logoColor=white)](https://switchlens.vercel.app)
[![Made with](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)]()
[![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)]()
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)]()

</div>

---

## 📸 Tentang SwitchLens

**SwitchLens** adalah dashboard penjelajah aset visual yang menggabungkan hasil pencarian dari **enam sumber sekaligus** — Pexels, Pixabay, Unsplash, Pinterest, Bing Image, dan YouTube — ke dalam satu galeri terpadu. Dibangun murni dengan Vanilla JavaScript tanpa framework, ditenagai oleh Cloudflare Workers sebagai *secure backend proxy*, dan Supabase sebagai lapisan otentikasi serta penyimpanan koleksi pengguna.

🔗 **Coba langsung:** [switchlens.vercel.app](https://switchlens.vercel.app)

---

## 🆕 Changelog

<details open>
<summary><strong>v4.0 — Advanced Search, Provider Filter & UX Overhaul</strong></summary>
<br>

- 🔍 **Advanced Search Mode** — sumber tambahan (Pinterest, Bing Image, YouTube) sebagai opsi *opt-in*, wajib login dan menyetujui *disclaimer* penggunaan konten pihak ketiga sebelum diaktifkan.
- 🎯 **Floating Provider Filter** — tombol mengambang untuk menonaktifkan sumber tertentu dari tampilan secara instan (client-side, tanpa fetch ulang), preferensi tersimpan per perangkat.
- 🔎 **Floating Search Bar** — kolom pencarian mengambang statis di bawah header, saling sinkron dengan search bar di menu navigasi.
- 🖱️ **Perbaikan Gestur Mobile** — swipe horizontal pada kategori dan riwayat pencarian tidak lagi bentrok dengan gestur buka/tutup menu.
- ▶️ **Penanganan Video Eksternal** — video hasil pencarian YouTube kini memicu modal konfirmasi sebelum membuka tab baru, lengkap dengan tautan langsung ke kanal pembuat video.
- 🐞 Perbaikan *centering* indikator loading di layar lebar, dan sinkronisasi Service Worker agar tidak menyajikan versi aplikasi yang kedaluwarsa.

</details>

<details>
<summary><strong>v3.5 — Integrasi Unsplash & Proxy Download</strong></summary>
<br>

- Unsplash ditambahkan sebagai sumber foto ketiga (*round-robin* bersama Pexels & Pixabay).
- Proxy download melalui Worker untuk mengatasi pembatasan CORS saat mengunduh berkas.
- Kepatuhan penuh terhadap ketentuan atribusi & pelaporan penggunaan API Unsplash.
- Perbaikan thumbnail video Pixabay yang sebelumnya tidak tampil.

</details>

<details>
<summary><strong>v3.0 — Akun Pengguna & Favorit Berbasis Cloud</strong></summary>
<br>

- Sistem akun penuh (login/register) melalui Supabase Auth.
- Koleksi favorit dipindahkan dari `localStorage` ke database cloud, tersinkron di semua perangkat.
- Rate limiting permintaan berbasis Cloudflare Workers KV.
- Riwayat pencarian dengan dukungan *export/import* JSON.
- Navigasi menu mobile menggunakan model *slider* dua panel.

</details>

---

## 🚀 Fitur Utama

| Kategori | Deskripsi |
|---|---|
| 🖼️ **Sumber Konten** | Enam penyedia media terintegrasi: Pexels, Pixabay, Unsplash, Pinterest, Bing Image, dan YouTube, digabung secara *round-robin* dalam satu galeri. |
| 🔐 **Akun & Favorit** | Login/registrasi melalui Supabase Auth; koleksi favorit tersimpan permanen di akun dan bisa diakses dari perangkat mana pun. |
| 🛡️ **Advanced Search** | Sumber tambahan pihak ketiga hanya aktif melalui persetujuan eksplisit pengguna, disertai *disclaimer* tanggung jawab penggunaan konten. |
| 🎚️ **Provider Filter** | Nonaktifkan sumber tertentu secara instan dari tampilan galeri tanpa perlu memuat ulang halaman. |
| 🧠 **Hybrid API Auth** | Pengguna tanpa API key pribadi tetap bisa menjelajah melalui kuota gratis (rate-limited) via Worker; pengguna dengan API key sendiri mendapat akses tanpa batas. |
| 🕓 **Riwayat Pencarian** | Tersimpan lokal, dapat diklik ulang, serta didukung *export/import* dalam format JSON. |
| 📲 **PWA Ready** | Dapat dipasang ke *home screen* dengan pengalaman *offline-first* dasar melalui Service Worker. |
| 🧱 **Backend Proxy Shield** | Seluruh kredensial (API key, Service Role key) hanya berada di Cloudflare Worker — tidak pernah terekspos ke klien. |

---

## 🛠️ Tech Stack

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

| Layer | Teknologi |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties — tanpa framework/build step |
| Hosting Frontend | Vercel (static hosting) |
| Backend / Proxy | Cloudflare Workers *(source terpisah, tidak termasuk repo ini)* |
| Rate Limiting | Cloudflare Workers KV |
| Auth & Database | Supabase (Auth + PostgreSQL) |
| Sumber Media | Pexels API, Pixabay API, Unsplash API, serta layanan pencarian pihak ketiga (mode Advanced Search) |

> **Catatan:** Source code Cloudflare Worker (proxy media, proxy download, rate limiting, endpoint auth & favorit) dikelola terpisah langsung di Cloudflare Dashboard dan **tidak disertakan** dalam repository ini karena berisi kredensial dan logic backend sensitif.

---

## 📁 Struktur Proyek

```
SwitchLens/
├── assets/                    → Gambar, ikon, background
├── css/                       → Stylesheet per halaman
│   ├── home.css
│   ├── auth.css
│   ├── guide.css
│   └── landing.css
├── icons/                     → Ikon PWA & favicon
├── js/
│   ├── auth.js                 → Login, register, manajemen sesi
│   ├── config.js                → Konfigurasi umum, favorit, modal
│   ├── main.js                   → Render galeri foto
│   ├── video.js                   → Render galeri video
│   ├── button.js                   → Interaksi tombol (like, download, share)
│   ├── favorites.js                 → Halaman koleksi favorit
│   ├── search-history.js             → Riwayat pencarian + export/import
│   ├── slider.js                      → Navigasi swipe menu mobile
│   ├── floating-search.js              → Search bar mengambang
│   ├── provider-filter.js               → Filter sumber konten (client-side)
│   ├── landing.js                        → Halaman landing
│   ├── guide.js                           → Halaman panduan API key
│   └── register-sw.js                      → Registrasi service worker
├── favorites.html             → Halaman koleksi favorit
├── guide.html                 → Panduan mendapatkan API key
├── home.html                  → Dashboard utama penjelajah
├── index.html                 → Landing page
├── login.html                 → Halaman masuk
├── register.html              → Halaman daftar akun
├── sw.js                      → Service worker (PWA)
└── vercel.json                → Header keamanan & konfigurasi deploy
```

---

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/iyann99/SwitchLens.git
cd SwitchLens
```

### 2. Siapkan Layanan Eksternal

Karena source code Worker tidak disertakan dalam repo ini, siapkan sendiri infrastruktur backend berikut agar aplikasi berfungsi penuh:

| Layanan | Kegunaan |
|---|---|
| **Cloudflare Worker** | Proxy ke seluruh sumber media, proxy download berkas, endpoint auth, dan endpoint favorit |
| **Cloudflare KV Namespace** | Rate limiting — cukup dibuat & di-*bind* lewat Dashboard, tanpa kode tambahan |
| **Supabase Project** | Autentikasi (login/register) dan tabel `favorites` |
| **Unsplash Application** | Daftar di [unsplash.com/developers](https://unsplash.com/developers) untuk mendapatkan Access Key |

### 3. Deploy Frontend

Proyek ini adalah *static site* murni tanpa proses build, sehingga bisa langsung di-deploy ke **Vercel**:

1. Import repository ke Vercel
2. Root Directory: `./`
3. Build Command, Output Directory, Install Command: **kosongkan semua**
4. Deploy

---

## 🔐 Keamanan & Kepatuhan

- Header keamanan (CSP, HSTS, X-Frame-Options, Permissions-Policy, dll) diterapkan melalui `vercel.json`.
- Seluruh kredensial (API key Pexels/Pixabay/Unsplash, Supabase Service Role Key) disimpan **hanya di Cloudflare Worker**, tidak pernah terekspos ke sisi klien.
- Autentikasi menggunakan JWT dari Supabase Auth, diverifikasi ulang oleh Worker pada setiap permintaan sensitif (favorit, mode Advanced Search).
- Fitur Advanced Search (Pinterest, Bing Image, YouTube) memerlukan persetujuan eksplisit pengguna atas ketentuan penggunaan, karena sebagian sumber tidak selalu menyediakan metadata lisensi yang lengkap.
- Seluruh unduhan foto dan video diproksikan melalui Worker untuk menghindari pembatasan CORS, sekaligus memenuhi kewajiban atribusi dan pelaporan penggunaan sesuai ketentuan API Unsplash.

---

## 👤 Developer

<div align="center">

Dirancang dan dibangun oleh **Iyan99**
sebagai proyek portofolio pengembangan web modern, responsif, dan berorientasi keamanan.

[![GitHub](https://img.shields.io/badge/GitHub-iyann99-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/iyann99)

</div>

---

## 📄 Lisensi

Proyek ini bersifat privat dan dikembangkan untuk keperluan portofolio pribadi.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a3d2c,100:00b22d&height=100&section=footer" width="100%"/>
