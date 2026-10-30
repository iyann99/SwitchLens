<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b22d,100:0a3d2c&height=200&section=header&text=SwitchLens&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Multi-Source%20Media%20Discovery%20Platform&descAlignY=58&descSize=18" width="100%"/>

<a href="https://switchlens.my.id">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&pause=1000&color=00B22D&center=true&vCenter=true&width=700&lines=Cari+foto+%26+video+dari+12+sumber+sekaligus;Pexels+%C2%B7+Pixabay+%C2%B7+Unsplash+%C2%B7+Wikimedia+%C2%B7+NASA+%C2%B7+Pinterest+%C2%B7+YouTube;Ditemani+Smart+Search+AI%2C+disimpan+ke+akunmu." alt="Typing SVG" />
</a>

<br/>

[![Live Demo](https://img.shields.io/badge/Live-switchlens.my.id-00b22d?style=for-the-badge&logo=vercel&logoColor=white)](https://switchlens.my.id)
[![Made with](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)]()
[![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20GPT--4o--mini-8e44ad?style=for-the-badge&logo=googlegemini&logoColor=white)]()
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)]()

</div>

---

## 📸 Tentang SwitchLens

**SwitchLens** adalah dashboard penjelajah aset visual yang menggabungkan hasil pencarian dari **banyak sumber sekaligus** dalam satu galeri terpadu. **Pexels dan Pixabay** menjadi dua sumber inti sejak versi pertama, didampingi Unsplash, Wikimedia Commons, dan NASA Image and Video Library di mode standar. Lewat **Advanced Search**, pengguna yang login dapat memperluas pencarian ke Pinterest, Bing Image, Pixiv, Wallhaven, Danbooru, YouTube, dan Bilibili.

Dilengkapi **Smart Search AI** (Gemini dengan fallback GPT-4o-mini) yang menerjemahkan permintaan santai menjadi pencarian gambar yang relevan, serta **Media Resolver** untuk pratinjau dan unduhan media dari tautan postingan. Frontend dibangun murni dengan Vanilla JavaScript tanpa framework; autentikasi dan penyimpanan koleksi memakai Supabase.

🔗 **Coba langsung:** [switchlens.my.id](https://switchlens.my.id)

---

## 🆕 Changelog

<details open>
<summary><strong>v5.0.2 — Sumber Baru, Media Resolver & Stabilitas</strong></summary>
<br>

**Fitur Baru**
- 🔗 **Media Resolver** (`resolve.html`) — tempel tautan postingan (maksimal 5 sekaligus) dari **Pinterest, X (Twitter), Pixiv, Bilibili, dan Instagram (beta)**, lalu pratinjau dan unduh foto/video aslinya. Hanya untuk pengguna login; persetujuan hak cipta dicatat sekali.
- 🌐 **Sumber baru di Advanced Search** — **Pixiv** dan **Bilibili**, serta **Wallhaven** (wallpaper, hanya konten aman) dan **Danbooru** (ilustrasi anime, hanya rating umum). **Openverse** (gambar berlisensi terbuka) tersedia sebagai sumber opsional. Seluruhnya muncul di beranda, pencarian, dan Smart Search AI, serta dapat disaring lewat Provider Filter.
- 🔐 **Verifikasi keamanan yang lebih jelas** — widget verifikasi di halaman masuk dan daftar dimuat secara manual, menampilkan kode kesalahan yang bisa ditindaklanjuti, membatasi percobaan ulang otomatis, dan menyediakan tombol **Coba lagi**.
- 🎚️ **Pesan filter sumber** — saat semua hasil tersembunyi oleh Provider Filter, galeri kini menampilkan penjelasan beserta tombol **Tampilkan semua sumber**, bukan halaman kosong.
- 📈 **Progres unduhan** (ukuran/persen) pada tombol Unduh galeri.
- 🌍 **Domain baru** `switchlens.my.id`; seluruh tautan kanonis, Open Graph, sitemap, dan robots diperbarui.
- 🧭 **Landing page diperbarui** — menampilkan Smart Search AI, Advanced Search, Media Resolver, dan Filter Sumber.

**Perbaikan Bug**
- 🐞 **Loading tanpa batas** — permintaan kini memiliki batas waktu; saat gagal tampil pesan dengan tombol **Coba lagi**, dan pemuatan otomatis berhenti ketika hasil habis atau beberapa halaman berturut-turut kosong.
- 🐞 **Pencarian lambat** — satu sumber yang macet tidak lagi menahan seluruh hasil pencarian.
- 🐞 **Pratinjau Instagram pecah** di Media Resolver — gambar yang gagal dimuat kini diganti penanda, dan pengambilan media Instagram lebih tangguh.
- 🐞 Tombol **Bagikan** ikut membuka lightbox karena handler tidak berhenti; pesan error berjudul "Berhasil!" pada kegagalan share juga diperbaiki, dan pembatalan share tidak lagi dianggap error.
- 🐞 File unduhan galeri tersimpan **tanpa ekstensi**; kini ekstensi ditentukan dari tipe konten/URL.
- 🐞 `favorites.html` memuat `config.js` sebelum `auth.js`, sehingga halaman rusak untuk pengguna dengan Advanced Search aktif. Urutan diperbaiki dan `config.js` kini defensif.
- 🐞 Hasil pencarian lama bisa menimpa pencarian baru (race condition) pada galeri foto/video; kini memakai penanda generasi.
- 🐞 Kuota habis sebelumnya tampil sebagai "tidak ada foto/video"; kini menampilkan pesan kuota.
- 🐞 Fungsi kuota gratis terdefinisi ganda di `config.js` dan teks "100 konten" tidak sesuai konstanta; dirapikan.
- 🐞 **Service Worker** — daftar aset offline dilengkapi (Smart Search AI, filter sumber, pencarian mengambang), dan respons error tidak lagi tersimpan di cache.

</details>

<details>
<summary><strong>v4.5.1 — Bug Fix & Security Patch</strong></summary>
<br>

**Keamanan (CodeQL)**
- 🛡️ **DOM XSS pada pemutar media** (`video.js`, `button.js`) — URL video/foto resolusi tinggi yang diambil dari atribut `data-*` kini divalidasi (`isSafeMediaUrl`) sebelum di-assign ke `.src`; hanya URL berprotokol `http:`/`https:` yang diteruskan.
- 🛡️ **HTML injection pada modal API Key** (`config.js`) — nilai token Pexels/Pixabay kini di-escape (`escapeHtml`) sebelum disisipkan ke `innerHTML` modal.
- 🛡️ **Incomplete URL substring sanitization** (`sw.js`) — pengecekan domain dinamis (`pexels.com`, `pixabay.com`, `unsplash.com`, domain API) yang sebelumnya memakai `hostname.includes()` (rentan dilewati domain seperti `notpexels.com.evil.net`) diganti dengan pencocokan exact-match/subdomain yang aman.

**Sesi & Autentikasi**
- 🔑 **Sesi kedaluwarsa tidak terdeteksi** (`auth.js`) — `isLoggedIn()` sebelumnya hanya memeriksa keberadaan token, bukan validitasnya. Kini token JWT di-decode untuk memeriksa klaim `exp`; sesi yang sudah habis masa berlakunya otomatis dibersihkan.
- 🔑 **Permintaan ke server gagal diam-diam saat token kedaluwarsa** — seluruh pemanggilan endpoint terautentikasi (favorit, Smart Search AI) kini melalui fungsi pembaca respons terpusat, yang mendeteksi respons `401` dan menampilkan notifikasi "Sesi Berakhir" alih-alih gagal tanpa keterangan.
- 🔑 **Toggle Advanced Search tidak persisten** (`config.js`) — status aktif/nonaktif sebelumnya hanya disimpan di variabel sementara dan reset setiap kali berpindah halaman. Kini disimpan di `localStorage`, sehingga status tetap konsisten antara `home.html` dan `ai-search.html`.
- 🔑 **Duplikasi fungsi `isLoggedIn()`** — sebelumnya didefinisikan di dua file (`auth.js` dan `config.js`) dengan perilaku berbeda, dan pemenangnya bergantung pada urutan `<script>` di tiap halaman. Kini hanya satu definisi di `auth.js` sebagai sumber kebenaran tunggal.

</details>

<details>
<summary><strong>v4.5 — Smart Search AI & Integrasi Wikimedia Commons</strong></summary>
<br>

- 🤖 **Smart Search AI** — asisten obrolan baru (`ai-search.html`) yang memahami permintaan bahasa natural pengguna dan otomatis memicu pencarian gambar yang relevan, lengkap dengan riwayat percakapan tersimpan per akun (Supabase).
- 🧠 **AI Ganda dengan Fallback** — Gemini (`gemini-flash-latest`) sebagai model utama, otomatis beralih ke GPT-4o-mini apabila Gemini gagal atau kena limit, seluruhnya diproses di sisi server agar API key tidak pernah terekspos ke klien.
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
- Proxy download di sisi server untuk mengatasi pembatasan CORS saat mengunduh berkas.
- Kepatuhan penuh terhadap ketentuan atribusi & pelaporan penggunaan API Unsplash.
- Perbaikan thumbnail video Pixabay yang sebelumnya tidak tampil.

</details>

<details>
<summary><strong>v3.0 — Akun Pengguna & Favorit Berbasis Cloud</strong></summary>
<br>

- Sistem akun penuh (login/register) melalui Supabase Auth.
- Koleksi favorit dipindahkan dari `localStorage` ke database cloud, tersinkron di semua perangkat.
- Pembatasan laju permintaan di sisi server.
- Riwayat pencarian dengan dukungan *export/import* JSON.
- Navigasi menu mobile menggunakan model *slider* dua panel.

</details>

---

## 🚀 Fitur Utama

| Kategori | Deskripsi |
|---|---|
| 🖼️ **Sumber Konten** | Pexels dan Pixabay sebagai sumber inti, didampingi Unsplash, Wikimedia Commons, dan NASA di mode standar. Pinterest, Bing Image, Pixiv, Wallhaven, Danbooru, YouTube, dan Bilibili aktif di Advanced Search. Semua digabung secara *round-robin* dalam satu galeri. |
| 🤖 **Smart Search AI** | Asisten obrolan (Gemini, fallback GPT-4o-mini) yang memahami permintaan bahasa natural dan otomatis memicu pencarian gambar yang relevan, dengan riwayat percakapan tersimpan per akun. |
| 🔐 **Akun & Favorit** | Login/registrasi melalui Supabase Auth; koleksi favorit tersimpan permanen di akun dan bisa diakses dari perangkat mana pun. |
| 🔗 **Media Resolver** | Ambil media asli dari tautan Pinterest, X, Pixiv, Bilibili, dan Instagram (beta). Hanya untuk pengguna login. |
| 🛡️ **Advanced Search** | Sumber tambahan pihak ketiga hanya aktif melalui persetujuan eksplisit pengguna, disertai *disclaimer* tanggung jawab penggunaan konten. |
| 🎚️ **Provider Filter** | Nonaktifkan sumber tertentu secara instan dari tampilan galeri tanpa memuat ulang halaman. |
| 🧠 **Hybrid API Auth** | Pengguna tanpa API key pribadi tetap bisa menjelajah Pexels & Pixabay melalui kuota gratis; pengguna dengan API key sendiri mendapat akses tanpa batas. |
| 🕓 **Riwayat Pencarian** | Tersimpan lokal, dapat diklik ulang, serta mendukung *export/import* JSON. |
| 📲 **PWA Ready** | Dapat dipasang ke *home screen* dengan pengalaman *offline-first* dasar melalui Service Worker. |
| 🧱 **Kredensial Aman** | Seluruh kunci API dan rahasia hanya berada di sisi server, tidak pernah terekspos ke klien. |

---

## 🛠️ Tech Stack

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

| Layer | Teknologi |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties — tanpa framework/build step |
| Hosting Frontend | Vercel (static hosting) |
| Auth & Database | Supabase (Auth + PostgreSQL) |
| AI Engine | Google Gemini sebagai model utama, OpenAI GPT-4o-mini sebagai fallback otomatis |
| Sumber Media | Pexels, Pixabay, Unsplash, Wikimedia Commons, NASA, serta sumber tambahan di Advanced Search |

> **Catatan:** Repository ini hanya berisi **frontend** SwitchLens. Layanan backend dikelola secara privat dan **tidak open-source**.

---

## 📁 Struktur Proyek

```
SwitchLens/
├── assets/                    → Gambar, ikon, background
├── css/                       → Stylesheet per halaman
├── icons/                     → Ikon PWA & favicon
├── js/
│   ├── auth.js                → Login, register, manajemen sesi
│   ├── turnstile.js           → Pemuat widget verifikasi keamanan
│   ├── config.js              → Konfigurasi umum, favorit, modal
│   ├── main.js                → Render galeri foto
│   ├── video.js               → Render galeri video
│   ├── button.js              → Interaksi tombol (like, download, share)
│   ├── favorites.js           → Halaman koleksi favorit
│   ├── search-history.js      → Riwayat pencarian + export/import
│   ├── slider.js              → Navigasi swipe menu mobile
│   ├── floating-search.js     → Search bar mengambang
│   ├── provider-filter.js     → Filter sumber konten (client-side)
│   ├── ai-search.js           → Chat AI, riwayat obrolan, trigger pencarian
│   ├── resolve.js             → Halaman Media Resolver
│   ├── landing.js             → Halaman landing
│   ├── guide.js               → Halaman panduan API key
│   └── register-sw.js         → Registrasi service worker
├── ai-search.html             → Smart Search AI
├── favorites.html             → Koleksi favorit
├── guide.html                 → Panduan mendapatkan API key
├── home.html                  → Dashboard utama
├── index.html                 → Landing page
├── login.html                 → Halaman masuk
├── register.html              → Halaman daftar
├── resolve.html               → Media Resolver
├── sw.js                      → Service worker (PWA)
├── sitemap.xml / robots.txt   → SEO
├── push.sh                    → Script automasi git add/commit/push
└── vercel.json                → Header keamanan & konfigurasi deploy
```

---

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/iyann99/SwitchLens.git
cd SwitchLens
```

### 2. Deploy Frontend

Proyek ini adalah *static site* murni tanpa proses build, sehingga bisa langsung di-deploy ke **Vercel**:

1. Import repository ke Vercel
2. Root Directory: `./`
3. Build Command, Output Directory, Install Command: **kosongkan semua**
4. Deploy

> Karena backend tidak disertakan, fitur pencarian, akun, favorit, AI, dan Media Resolver memerlukan layanan backend yang kompatibel. Alamat layanan diatur di `js/config.js`.

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
- Seluruh kredensial dan kunci API disimpan **hanya di sisi server**, tidak pernah terekspos ke klien.
- Autentikasi menggunakan JWT dari Supabase Auth, diverifikasi ulang pada setiap permintaan sensitif (favorit, Advanced Search, riwayat & percakapan AI).
- Widget verifikasi keamanan melindungi halaman masuk dan daftar.
- Advanced Search memerlukan persetujuan eksplisit pengguna atas ketentuan penggunaan, karena sebagian sumber tidak selalu menyediakan metadata lisensi yang lengkap. Wallhaven dan Danbooru hanya menampilkan konten yang aman.
- Smart Search AI hanya menerjemahkan permintaan pengguna menjadi *keyword* pencarian; AI tidak menghasilkan gambar sendiri dan tetap mengikuti mode standar/Advanced yang aktif.
- Media Resolver hanya melayani media dari provider yang didukung, melalui tautan yang kedaluwarsa dalam waktu singkat.
- Unduhan dilayani lewat lapisan keamanan khusus, sekaligus memenuhi kewajiban atribusi sesuai ketentuan Unsplash & Wikimedia Commons.

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
