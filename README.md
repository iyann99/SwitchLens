<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b22d,100:0a3d2c&height=200&section=header&text=SwitchLens&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Multi-Source%20Media%20Discovery%20Platform&descAlignY=58&descSize=18" width="100%"/>

<a href="https://switchlens.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&pause=1000&color=00B22D&center=true&vCenter=true&width=700&lines=Cari+foto+%26+video+dari+7+sumber+sekaligus;Pexels+%C2%B7+Pixabay+%C2%B7+Unsplash+%C2%B7+Wikimedia+%C2%B7+Pinterest+%C2%B7+Bing+%C2%B7+YouTube;Ditemani+Smart+Search+AI%2C+disimpan+ke+akunmu." alt="Typing SVG" />
</a>

<br/>

[![Live Demo](https://img.shields.io/badge/Live-switchlens.vercel.app-00b22d?style=for-the-badge&logo=vercel&logoColor=white)](https://switchlens.vercel.app)
[![Made with](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Backend](https://img.shields.io/badge/Backend-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)]()
[![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)]()
[![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20GPT--4o--mini-8e44ad?style=for-the-badge&logo=googlegemini&logoColor=white)]()
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)]()

</div>

---

## 📸 Tentang SwitchLens

**SwitchLens** adalah dashboard penjelajah aset visual yang menggabungkan hasil pencarian dari **tujuh sumber sekaligus**, dengan **Pexels dan Pixabay sebagai dua sumber inti** sejak versi pertama (porsi hasil terbanyak di setiap pencarian), didampingi Unsplash dan Wikimedia Commons di mode standar, serta Pinterest, Bing Image, dan YouTube sebagai perluasan opsional lewat Advanced Search — semuanya digabung ke dalam satu galeri terpadu. Dilengkapi **Smart Search AI**, asisten obrolan berbasis Gemini (dengan fallback GPT-4o-mini) yang bisa menerjemahkan permintaan santai pengguna menjadi pencarian gambar yang relevan. Dibangun murni dengan Vanilla JavaScript tanpa framework, ditenagai oleh Cloudflare Workers sebagai *secure backend proxy*, dan Supabase sebagai lapisan otentikasi serta penyimpanan koleksi pengguna.

🔗 **Coba langsung:** [switchlens.vercel.app](https://switchlens.vercel.app)

---

## 🆕 Changelog

<details open>
<summary><strong>v4.5.1 — Bug Fix & Security Patch</strong></summary>
<br>

**Keamanan (CodeQL)**
- 🛡️ **DOM XSS pada pemutar media** (`video.js`, `button.js`) — URL video/foto resolusi tinggi yang diambil dari atribut `data-*` kini divalidasi (`isSafeMediaUrl`) sebelum di-assign ke `.src`; hanya URL berprotokol `http:`/`https:` yang diteruskan.
- 🛡️ **HTML injection pada modal API Key** (`config.js`) — nilai token Pexels/Pixabay kini di-escape (`escapeHtml`) sebelum disisipkan ke `innerHTML` modal.
- 🛡️ **Incomplete URL substring sanitization** (`sw.js`) — pengecekan domain dinamis (`pexels.com`, `pixabay.com`, `unsplash.com`, `workers.dev`) yang sebelumnya memakai `hostname.includes()` (rentan dilewati domain seperti `notpexels.com.evil.net`) diganti dengan pencocokan exact-match/subdomain yang aman.

**Sesi & Autentikasi**
- 🔑 **Sesi kedaluwarsa tidak terdeteksi** (`auth.js`) — `isLoggedIn()` sebelumnya hanya memeriksa keberadaan token, bukan validitasnya. Kini token JWT di-decode untuk memeriksa klaim `exp`; sesi yang sudah habis masa berlakunya otomatis dibersihkan.
- 🔑 **Permintaan ke Worker gagal diam-diam saat token kedaluwarsa** — seluruh pemanggilan endpoint terautentikasi (favorit, Smart Search AI) kini melalui `parseWorkerResponse()`, yang mendeteksi respons `401` dan menampilkan notifikasi "Sesi Berakhir" alih-alih gagal tanpa keterangan.
- 🔑 **Toggle Advanced Search tidak persisten** (`config.js`) — status aktif/nonaktif sebelumnya hanya disimpan di variabel sementara dan reset setiap kali berpindah halaman. Kini disimpan di `localStorage`, sehingga status tetap konsisten antara `home.html` dan `ai-search.html`.
- 🔑 **Duplikasi fungsi `isLoggedIn()`** — sebelumnya didefinisikan di dua file (`auth.js` dan `config.js`) dengan perilaku berbeda, dan pemenangnya bergantung pada urutan `<script>` di tiap halaman. Kini hanya satu definisi di `auth.js` sebagai sumber kebenaran tunggal.

</details>

<details>
<summary><strong>v4.5 — Smart Search AI & Integrasi Wikimedia Commons</strong></summary>
<br>

- 🤖 **Smart Search AI** — asisten obrolan baru (`ai-search.html`) yang memahami permintaan bahasa natural pengguna dan otomatis memicu pencarian gambar yang relevan, lengkap dengan riwayat percakapan tersimpan per akun (Supabase).
- 🧠 **AI Ganda dengan Fallback** — Gemini (`gemini-flash-latest`) sebagai model utama, otomatis beralih ke GPT-4o-mini apabila Gemini gagal atau kena limit, seluruhnya diproses di sisi Worker agar API key tidak pernah terekspos ke klien.
- 🗂️ **Riwayat Obrolan AI** — percakapan tersimpan di database, dapat dibuka kembali, dan dihapus melalui modal konfirmasi khusus.
- 🖼️ **Integrasi Wikimedia Commons** — ditambahkan sebagai sumber keempat pada mode pencarian **standar** (bukan Advanced Search), karena berlisensi terbuka dan tidak memerlukan API key.
- ⚖️ **Rebalance Round-Robin** — proporsi hasil per sumber disesuaikan ulang: mode standar kini menggabungkan Pexels, Pixabay, Unsplash & Wikimedia; mode Advanced menambahkan Pinterest & Bing di atasnya.
- 🔀 **Provider Filter diperbarui** — opsi filter sumber pada dashboard kini turut mencakup hasil dari Wikimedia.

</details>

<details>
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
| 🖼️ **Sumber Konten** | Tujuh penyedia media terintegrasi, digabung secara *round-robin* dalam satu galeri. **Pexels** dan **Pixabay** menjadi sumber inti sejak awal — masing-masing memasok porsi hasil terbanyak (6 gambar/permintaan di mode standar) berkat API key resmi dan katalog terbesar. **Unsplash** (5 gambar/permintaan) dan **Wikimedia Commons** (5 gambar/permintaan, publik tanpa API key) melengkapi mode standar. **Pinterest**, **Bing Image**, dan **YouTube** hanya aktif di Advanced Search. |
| 🤖 **Smart Search AI** | Asisten obrolan (Gemini, fallback GPT-4o-mini) yang memahami permintaan bahasa natural dan otomatis memicu pencarian gambar yang relevan, dengan riwayat percakapan tersimpan per akun. |
| 🔐 **Akun & Favorit** | Login/registrasi melalui Supabase Auth; koleksi favorit tersimpan permanen di akun dan bisa diakses dari perangkat mana pun. |
| 🛡️ **Advanced Search** | Sumber tambahan pihak ketiga (Pinterest, Bing, YouTube) hanya aktif melalui persetujuan eksplisit pengguna, disertai *disclaimer* tanggung jawab penggunaan konten. |
| 🎚️ **Provider Filter** | Nonaktifkan sumber tertentu secara instan dari tampilan galeri tanpa perlu memuat ulang halaman. |
| 🧠 **Hybrid API Auth** | Pengguna tanpa API key pribadi tetap bisa menjelajah Pexels & Pixabay melalui kuota gratis (rate-limited) via Worker; pengguna dengan API key sendiri mendapat akses tanpa batas. |
| 🕓 **Riwayat Pencarian** | Tersimpan lokal, dapat diklik ulang, serta didukung *export/import* dalam format JSON. |
| 📲 **PWA Ready** | Dapat dipasang ke *home screen* dengan pengalaman *offline-first* dasar melalui Service Worker. |
| 🧱 **Backend Proxy Shield** | Seluruh kredensial (API key, Service Role key, kunci AI) hanya berada di Cloudflare Worker — tidak pernah terekspos ke klien. |

> **Proporsi hasil per pencarian (mode standar):** Pexels 6 · Pixabay 6 · Unsplash 5 · Wikimedia 5. Mode Advanced menyesuaikan ke Pexels 4 · Pixabay 4 · Unsplash 3 · Wikimedia 3 · Pinterest 3 · Bing 3, agar total hasil tetap seimbang setelah dua sumber tambahan masuk.

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
| Auth & Database | Supabase (Auth + PostgreSQL, termasuk tabel `favorites`, `ai_conversations`, `ai_messages`) |
| Sumber Media | **Pexels API** & **Pixabay API** (dua sumber inti, wajib API key), Unsplash API, Wikimedia Commons API (publik, tanpa key), serta layanan pencarian pihak ketiga (mode Advanced Search) |
| AI Engine | Google Gemini (`gemini-flash-latest`) sebagai model utama, OpenAI GPT-4o-mini sebagai fallback otomatis |

> **Catatan:** Source code Cloudflare Worker (proxy media, proxy download, rate limiting, endpoint auth, favorit & AI chat) dikelola terpisah langsung di Cloudflare Dashboard dan **tidak disertakan** dalam repository ini karena berisi kredensial dan logic backend sensitif.

---

## 📁 Struktur Proyek

```
SwitchLens/
├── assets/                    → Gambar, ikon, background
├── css/                       → Stylesheet per halaman
│   ├── home.css
│   ├── auth.css
│   ├── guide.css
│   ├── landing.css
│   └── ai-search.css          → Stylesheet halaman Smart Search AI
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
│   ├── ai-search.js                      → Logika chat AI, riwayat obrolan, trigger pencarian
│   ├── landing.js                         → Halaman landing
│   ├── guide.js                            → Halaman panduan API key
│   └── register-sw.js                       → Registrasi service worker
├── ai-search.html             → Halaman Smart Search AI (chat)
├── favorites.html             → Halaman koleksi favorit
├── guide.html                 → Panduan mendapatkan API key
├── home.html                  → Dashboard utama penjelajah
├── index.html                 → Landing page
├── login.html                 → Halaman masuk
├── register.html              → Halaman daftar akun
├── sw.js                      → Service worker (PWA)
├── push.sh                    → Script automasi git add/commit/push interaktif
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
| **Cloudflare Worker** | Proxy ke seluruh sumber media, proxy download berkas, endpoint auth, favorit, dan endpoint AI chat |
| **Cloudflare KV Namespace** | Rate limiting — cukup dibuat & di-*bind* lewat Dashboard, tanpa kode tambahan |
| **Supabase Project** | Autentikasi (login/register) serta tabel `favorites`, `ai_conversations`, dan `ai_messages` |
| **Pexels API** | Daftar di [pexels.com/api](https://www.pexels.com/api/) untuk mendapatkan API Key — sumber inti pertama, wajib diisi agar pencarian foto & video berjalan |
| **Pixabay API** | Daftar di [pixabay.com/api/docs](https://pixabay.com/api/docs/) untuk mendapatkan API Key — sumber inti kedua, wajib diisi berdampingan dengan Pexels |
| **Unsplash Application** | Daftar di [unsplash.com/developers](https://unsplash.com/developers) untuk mendapatkan Access Key |
| **Google AI Studio (Gemini)** | Daftar di [aistudio.google.com](https://aistudio.google.com) untuk mendapatkan API key model `gemini-flash-latest` (AI utama) |
| **OpenAI Platform** | Daftar di [platform.openai.com](https://platform.openai.com) untuk mendapatkan API key `gpt-4o-mini` sebagai fallback AI |

> Wikimedia Commons **tidak memerlukan API key** — endpoint publiknya langsung dipanggil oleh Worker. Pexels dan Pixabay, sebaliknya, adalah sumber wajib: tanpa kedua key ini, hasil pencarian standar akan kehilangan porsi terbesarnya (masing-masing 6 dari total gambar per permintaan).

### 3. Deploy Frontend

Proyek ini adalah *static site* murni tanpa proses build, sehingga bisa langsung di-deploy ke **Vercel**:

1. Import repository ke Vercel
2. Root Directory: `./`
3. Build Command, Output Directory, Install Command: **kosongkan semua**
4. Deploy

---

## 🤖 Automation Script — `push.sh`

Script Bash interaktif di root proyek untuk mempercepat alur `git add → commit → push`, tanpa perlu mengetik ulang perintah Git setiap kali ada perubahan.

**Cara pakai:**

```bash
chmod +x push.sh   # sekali saja, agar bisa dieksekusi
./push.sh
```

**Yang dilakukan script ini secara berurutan:**

| Tahap | Perilaku |
|---|---|
| 🔍 **Deteksi Git Repo** | Jika folder belum jadi repository, script menawarkan `git init` otomatis dan mengatur branch default ke `main`. |
| 🔗 **Deteksi Remote `origin`** | Jika remote belum terpasang, script meminta URL repository lalu menjalankan `git remote add origin`. |
| 📋 **Ringkasan Perubahan** | Menampilkan `git status --short` sebelum staging, agar perubahan bisa ditinjau dulu. |
| 📝 **Commit Interaktif** | Meminta pesan commit; jika dikosongkan, otomatis memakai format `Update SwitchLens — YYYY-MM-DD HH:MM`. Melewati commit jika tidak ada perubahan yang di-*stage*. |
| 🚀 **Push ke `main`** | Menjalankan `git push -u origin main`. |
| ⚠️ **Penanganan Push Ditolak** | Jika push gagal (riwayat berbeda), script menawarkan tiga pilihan: **(1)** gabungkan riwayat via `git pull --allow-unrelated-histories`, **(2)** timpa paksa dengan `git push --force`, atau **(3)** batalkan. |

> **Catatan:** Opsi *force push* akan menimpa riwayat commit di GitHub secara permanen. Gunakan hanya jika benar-benar yakin isi lokal adalah versi yang ingin dipertahankan.

---

## 🔐 Keamanan & Kepatuhan

- Header keamanan (CSP, HSTS, X-Frame-Options, Permissions-Policy, dll) diterapkan melalui `vercel.json`.
- Seluruh kredensial (API key Pexels/Pixabay/Unsplash, kunci Gemini & OpenAI, Supabase Service Role Key) disimpan **hanya di Cloudflare Worker**, tidak pernah terekspos ke sisi klien.
- Autentikasi menggunakan JWT dari Supabase Auth, diverifikasi ulang oleh Worker pada setiap permintaan sensitif (favorit, mode Advanced Search, riwayat & percakapan AI).
- Fitur Advanced Search (Pinterest, Bing Image, YouTube) memerlukan persetujuan eksplisit pengguna atas ketentuan penggunaan, karena sebagian sumber tidak selalu menyediakan metadata lisensi yang lengkap.
- Smart Search AI hanya menerjemahkan permintaan pengguna menjadi *keyword* pencarian melalui fungsi `fetchPhotos()` yang sama dengan pencarian biasa — AI tidak menghasilkan gambar sendiri, dan tetap mengikuti mode standar/Advanced yang aktif di sisi klien.
- Seluruh unduhan foto dan video diproksikan melalui Worker untuk menghindari pembatasan CORS, sekaligus memenuhi kewajiban atribusi dan pelaporan penggunaan sesuai ketentuan API Unsplash & Wikimedia Commons.

---

## 👤 Developer

<div align="center">

Dirancang dan dibangun oleh **Iyann99**
sebagai proyek portofolio pengembangan web modern, responsif, dan berorientasi keamanan.

[![GitHub](https://img.shields.io/badge/GitHub-iyann99-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/iyann99)

</div>

---

## 📄 Lisensi

SwitchLens merupakan proyek open-source yang dikembangkan sebagai proyek portofolio pribadi.

Kode sumber SwitchLens dilisensikan di bawah MIT License. Lisensi ini mengizinkan penggunaan, penyalinan, modifikasi, dan distribusi kode dengan tetap mempertahankan pemberitahuan hak cipta dan lisensi yang berlaku.

Untuk ketentuan lengkap, silakan lihat file [![MIT License](https://img.shields.io/badge/License-MIT-00b22d?style=flat-square)](https://github.com/iyann99/SwitchLens?tab=MIT-1-ov-file).

Catatan: Lisensi ini hanya berlaku untuk kode dan materi yang dibuat oleh pengembang SwitchLens. Aset, library, layanan, dan materi pihak ketiga tetap mengikuti lisensi dan ketentuan masing-masing.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a3d2c,100:00b22d&height=100&section=footer" width="100%"/>
