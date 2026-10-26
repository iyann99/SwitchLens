const pexelsBaseURL = "https://api.pexels.com/v1";
const pixabayBaseURL = "https://pixabay.com/api";
const WORKER_BASE_URL = "https://iyan99-as.pradikaaprilianto9.workers.dev";

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const gallery = document.getElementById('gallery-grid');


const ADVANCED_MODE_KEY = "switchlens_advanced_mode_enabled";
const ADVANCED_TOS_KEY = "switchlens_advanced_tos_accepted";
let advancedModeEnabled = localStorage.getItem(ADVANCED_MODE_KEY) === "true" && typeof isLoggedIn === "function" && isLoggedIn();

function isAdvancedTosAccepted() {
    return localStorage.getItem(ADVANCED_TOS_KEY) === "true";
}

function acceptAdvancedTos() {
    localStorage.setItem(ADVANCED_TOS_KEY, "true");
}

function isAdvancedModeActive() {
    return advancedModeEnabled && isLoggedIn();
}

function setAdvancedMode(enabled) {
    advancedModeEnabled = enabled;
    localStorage.setItem(ADVANCED_MODE_KEY, enabled ? "true" : "false");
    const toggleBtn = document.getElementById('advancedSearchToggle');
    if (toggleBtn) {
        toggleBtn.classList.toggle('active', enabled);
        toggleBtn.textContent = enabled ? '🔓 Advanced Search: ON' : '🔒 Advanced Search';
    }
}

function handleAdvancedSearchClick() {
    if (!isLoggedIn()) {
        showMessageModal("Login Diperlukan", "Silakan masuk atau daftar akun terlebih dahulu untuk menggunakan Advanced Search.");
        return;
    }


    if (advancedModeEnabled) {
        setAdvancedMode(false);
        return;
    }

    if (isAdvancedTosAccepted()) {
        setAdvancedMode(true);
        return;
    }

    showAdvancedTosModal();
}

function showAdvancedTosModal() {
    const modal = document.getElementById('advancedTosModal');
    if (modal) modal.style.display = 'flex';
}

function hideAdvancedTosModal() {
    const modal = document.getElementById('advancedTosModal');
    if (modal) modal.style.display = 'none';
}


let page = 1;
let loading = false;
let currentQuery = "curated";
let currentMode = "photo";
let searchGeneration = 0;
let hasMore = true;
let emptyStreak = 0;
let failedPage = 1;

const REQUEST_TIMEOUT_MS = 25000;
const MAX_EMPTY_STREAK = 3;

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

function setLoaderVisible(visible) {
    const loaderEl = document.getElementById('loader');
    if (loaderEl) loaderEl.style.display = visible ? 'block' : 'none';
}

function resetPagination() {
    hasMore = true;
    emptyStreak = 0;
    clearGalleryNotice();
    setLoaderVisible(true);
}

function endPagination() {
    hasMore = false;
    setLoaderVisible(false);
}

function countVisibleCards() {
    if (!gallery) return 0;
    return Array.from(gallery.querySelectorAll('.media-card')).filter(card => card.style.display !== 'none').length;
}

function showAllHiddenNotice() {
    renderGalleryMessage('Semua hasil disembunyikan oleh filter sumber.', {
        kind: 'filter',
        action: {
            label: 'Tampilkan semua sumber',
            handler: () => {
                saveDisabledProviders([]);
                applyProviderFilterToGallery();
                clearGalleryNotice();
                hasMore = true;
                emptyStreak = 0;
                setLoaderVisible(true);
                if (typeof rewatchLoader === 'function') rewatchLoader();
            }
        }
    });
}

function registerPageResult(addedVisible) {
    if (addedVisible > 0) {
        emptyStreak = 0;
    } else {
        emptyStreak += 1;
        if (countVisibleCards() === 0 && gallery.querySelector('.media-card')) {
            endPagination();
            showAllHiddenNotice();
            return;
        }
        if (emptyStreak >= MAX_EMPTY_STREAK) endPagination();
    }
    if (hasMore && typeof rewatchLoader === 'function') rewatchLoader();
}

function clearGalleryNotice(kind) {
    if (!gallery) return;
    const selector = kind ? `.gallery-notice[data-kind="${kind}"]` : '.gallery-notice';
    gallery.querySelectorAll(selector).forEach(node => node.remove());
}

function renderGalleryMessage(text, { retry = false, replace = false, action = null, kind = '' } = {}) {
    if (!gallery) return;
    if (replace) gallery.innerHTML = '';
    clearGalleryNotice();

    const notice = document.createElement('div');
    notice.className = 'gallery-notice';
    if (kind) notice.setAttribute('data-kind', kind);

    const message = document.createElement('p');
    message.textContent = text;
    notice.appendChild(message);

    if (retry) {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'gallery-retry';
        retryBtn.textContent = 'Coba lagi';
        retryBtn.addEventListener('click', retryLoad);
        notice.appendChild(retryBtn);
    }

    if (action) {
        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'gallery-retry';
        actionBtn.textContent = action.label;
        actionBtn.addEventListener('click', action.handler);
        notice.appendChild(actionBtn);
    }

    gallery.appendChild(notice);
}

function handleLoadFailure(pageNum, timedOut) {
    failedPage = pageNum;
    endPagination();
    renderGalleryMessage(
        timedOut
            ? 'Server terlalu lama merespons. Periksa koneksi lalu coba lagi.'
            : 'Gagal memuat data. Coba lagi.',
        { retry: true, replace: pageNum === 1 }
    );
}

function retryLoad() {
    clearGalleryNotice();
    hasMore = true;
    emptyStreak = 0;
    setLoaderVisible(true);
    page = failedPage;
    triggerFetch();
}

let pexelsToken = localStorage.getItem("pexels_token") || "";
let pixabayToken = localStorage.getItem("pixabay_token") || "";

function showMessageModal(title, msg, showCloseBtn = true) {
    const msgModal = document.getElementById("messageModal");
    const titleEl = document.getElementById("messageTitle");
    const msgEl = document.getElementById("messageBody");
    const closeBtn = document.getElementById("closeMessageBtn");
    
    if (msgModal && titleEl && msgEl) {
        titleEl.innerText = title;
        msgEl.innerText = msg;
        if (closeBtn) {
            closeBtn.style.display = showCloseBtn ? "inline-block" : "none";
        }
        msgModal.style.display = "flex";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const closeMsgBtn = document.getElementById("closeMessageBtn");
    const msgModal = document.getElementById("messageModal");
    
    if (closeMsgBtn) {
        closeMsgBtn.addEventListener("click", () => {
            if (msgModal) msgModal.style.display = "none";
        });
    }
});

const MIME_EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov"
};

function ensureFilenameExtension(name, mime, sourceUrl) {
    if (/\.[a-z0-9]{2,5}$/i.test(name)) return name;

    let ext = MIME_EXTENSIONS[(mime || "").split(";")[0].trim().toLowerCase()] || "";
    if (!ext) {
        try {
            const match = new URL(sourceUrl).pathname.match(/\.([a-z0-9]{2,5})$/i);
            if (match) ext = match[1].toLowerCase();
        } catch (e) {
            ext = "";
        }
    }

    return ext ? `${name}.${ext}` : name;
}

function setMessageBody(text) {
    const bodyEl = document.getElementById("messageBody");
    if (bodyEl) bodyEl.innerText = text;
}

function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

async function downloadMedia(url, filename, downloadLocation = null) {
    try {
        showMessageModal("Mengunduh", "Memulai proses unduh file. Silakan tunggu...", false);

        const baseName = (filename || "SwitchLens-Media").replace(/[^a-zA-Z0-9._-]/g, "_");
        let proxyUrl;

        if (typeof url === "string" && url.startsWith(`${WORKER_BASE_URL}/media?`)) {
            const signedUrl = new URL(url);
            signedUrl.searchParams.set("d", "1");
            signedUrl.searchParams.set("n", baseName);
            proxyUrl = signedUrl.toString();
        } else {
            proxyUrl = `${WORKER_BASE_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(baseName)}`;

            if (downloadLocation) {
                proxyUrl += `&downloadLocation=${encodeURIComponent(downloadLocation)}`;
            }
        }

        const response = await fetch(proxyUrl);
        if (response.status === 429) {
            hideMessageModal();
            showMessageModal("Terlalu Banyak Unduhan", "Batas unduhan sementara tercapai. Coba lagi beberapa saat lagi.");
            return;
        }
        if (!response.ok) {
            throw new Error("Proxy download gagal");
        }

        const total = parseInt(response.headers.get("Content-Length") || "0", 10);
        const contentType = response.headers.get("Content-Type") || "";
        const finalName = ensureFilenameExtension(baseName, contentType, url);

        let blob;
        if (response.body && response.body.getReader) {
            const reader = response.body.getReader();
            const chunks = [];
            let received = 0;
            let lastUpdate = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.byteLength;

                const now = Date.now();
                if (now - lastUpdate > 250) {
                    lastUpdate = now;
                    setMessageBody(
                        total
                            ? `Mengunduh ${formatBytes(received)} dari ${formatBytes(total)} (${Math.round((received / total) * 100)}%)`
                            : `Mengunduh ${formatBytes(received)}...`
                    );
                }
            }
            blob = new Blob(chunks, { type: contentType });
        } else {
            blob = await response.blob();
        }

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = finalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

        hideMessageModal();
    } catch (error) {
        console.error("Gagal mengunduh:", error);
        showMessageModal("Gagal", "File tidak dapat diunduh saat ini. Silakan buka gambar secara penuh dan simpan manual.");
    }
}

function hideMessageModal() {
    const modal = document.getElementById("messageModal");
    if (modal) modal.style.display = "none";
}

let favoritesCache = [];
let favoritesCacheLoaded = false;
let favoritesCacheLoadFailed = false;

async function loadFavoritesCache() {
    favoritesCacheLoadFailed = false;

    if (!isLoggedIn()) {
        favoritesCache = [];
        favoritesCacheLoaded = true;
        return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${WORKER_BASE_URL}/favorites`, {
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`
            },
            signal: controller.signal
        });
        const data = await parseWorkerResponse(response);
        if (data.success) {
            favoritesCache = data.favorites || [];
        } else {
            favoritesCache = [];
            favoritesCacheLoadFailed = true;
        }
    } catch (err) {
        console.error("Gagal memuat daftar favorite:", err);
        favoritesCache = [];
        favoritesCacheLoadFailed = true;
    } finally {
        clearTimeout(timeoutId);
    }

    favoritesCacheLoaded = true;

    if (gallery && gallery.children.length > 0) {
        document.querySelectorAll('.btn-fav').forEach(btn => {
            const src = btn.dataset.src;
            const fav = isFavorite(src);
            btn.classList.toggle('active', fav);
            btn.innerText = fav ? '❤️' : '🤍';
        });
    }
}

function getFavorites() {
    return favoritesCache;
}

function isFavorite(srcUrl) {
    return favoritesCache.some(item => item.src === srcUrl);
}

async function toggleFavorite(data, btnElement) {

    if (!isLoggedIn()) {
        showMessageModal("Login Diperlukan", "Silakan masuk atau daftar akun terlebih dahulu untuk menyimpan favorit.");
        return;
    }

    const alreadyFav = isFavorite(data.src);

    if (alreadyFav) {
        favoritesCache = favoritesCache.filter(item => item.src !== data.src);
        if (btnElement) {
            btnElement.innerText = '🤍';
            btnElement.classList.remove('active');
        }
    } else {
        favoritesCache.push(data);
        if (btnElement) {
            btnElement.innerText = '❤️';
            btnElement.classList.add('active');
        }
    }

    try {
        if (alreadyFav) {
            const response = await fetch(`${WORKER_BASE_URL}/favorites`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify({ src: data.src })
            });
            const result = await parseWorkerResponse(response);
            if (!result.success) throw new Error(result.message || "Gagal menghapus favorite");
        } else {
            const response = await fetch(`${WORKER_BASE_URL}/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(data)
            });
            const result = await parseWorkerResponse(response);
            if (!result.success) throw new Error(result.message || "Gagal menambah favorite");
        }
    } catch (err) {
        console.error("toggleFavorite error:", err);
        if (alreadyFav) {
            favoritesCache.push(data);
            if (btnElement) {
                btnElement.innerText = '❤️';
                btnElement.classList.add('active');
            }
        } else {
            favoritesCache = favoritesCache.filter(item => item.src !== data.src);
            if (btnElement) {
                btnElement.innerText = '🤍';
                btnElement.classList.remove('active');
            }
        }
        showMessageModal("Gagal", "Terjadi kesalahan saat menyimpan favorite. Silakan coba lagi.");
    }
}

const tokenModal = document.querySelector('.token-modal:not(#messageModal)');

if (tokenModal) {
    tokenModal.innerHTML = `
        <div class="modal-box">
            <h2>API Setup</h2>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">
                Masukkan minimal salah satu token untuk menikmati fitur. Kamu bisa menambahkan atau memperbarui token kapan saja.
            </p>
            
            <label style="display:block; text-align:left; margin-bottom:5px; font-weight:bold; font-size:0.85rem;">Pexels API Key:</label>
            <input id="tokenInputPexels" type="text" placeholder="Kosongkan jika tidak ada" style="width:100%; margin-bottom:15px;" value="${escapeHtml(pexelsToken)}">
            
            <label style="display:block; text-align:left; margin-bottom:5px; font-weight:bold; font-size:0.85rem;">Pixabay API Key:</label>
            <input id="tokenInputPixabay" type="text" placeholder="Kosongkan jika tidak ada" style="width:100%; margin-bottom:15px;" value="${escapeHtml(pixabayToken)}">
            
            <a href="guide.html" class="register">Belum ada API Key?</a>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="closeModalBtn" style="background: #ccc; color: #333; display: none;">Batal</button>
                <button id="saveToken">Simpan</button>
            </div>
        </div>
    `;
}

function showModal(allowCancel = false) {
    if (!tokenModal) return;
    tokenModal.style.display = "flex";
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.style.display = allowCancel ? "block" : "none";
    }
}

function hideModal() {
    if (tokenModal) tokenModal.style.display = "none";
}

async function validateTokenDirectly(token, type) {
    if (!navigator.onLine) return "offline";
    try {
        if (type === 'pexels') {
            const res = await fetch(`${pexelsBaseURL}/search?query=nature&per_page=1`, {
                headers: { 'Authorization': token }
            });
            return res.status !== 401 && res.ok;
        } else {
            const res = await fetch(`${pixabayBaseURL}/?key=${token}&q=nature&per_page=1`);
            return res.ok;
        }
    } catch {
        return "network_error";
    }
}

const saveTokenBtn = document.getElementById('saveToken');
if (saveTokenBtn) {
    saveTokenBtn.addEventListener("click", async () => {
        if (!navigator.onLine) {
            showMessageModal("Koneksi Terputus", "Kamu sedang offline! Aktifkan koneksi internet untuk menyimpan dan memverifikasi token.");
            return;
        }

        const pexelsInput = document.getElementById('tokenInputPexels').value.trim();
        const pixabayInput = document.getElementById('tokenInputPixabay').value.trim();

        if (!pexelsInput && !pixabayInput) {
            showMessageModal("Perhatian", "Mohon masukkan minimal salah satu token (Pexels atau Pixabay)!");
            return;
        }

        const saveBtnEl = document.getElementById('saveToken');
        saveBtnEl.innerText = "Memverifikasi...";
        saveBtnEl.disabled = true;

        let pexelsValid = true;
        let pixabayValid = true;

        if (pexelsInput) pexelsValid = await validateTokenDirectly(pexelsInput, 'pexels');
        if (pixabayInput) pixabayValid = await validateTokenDirectly(pixabayInput, 'pixabay');

        saveBtnEl.innerText = "Simpan";
        saveBtnEl.disabled = false;

        if (pexelsValid === "network_error" || pixabayValid === "network_error") {
            showMessageModal("Network Error", "Gagal terhubung ke server. Silahkan coba beberapa saat lagi.");
            return;
        }

        if (pexelsInput && pexelsValid !== true) {
            showMessageModal("Token Tidak Valid", "Token Pexels tidak valid! Silakan periksa kembali.");
            return;
        }
        if (pixabayInput && pixabayValid !== true) {
            showMessageModal("Token Tidak Valid", "Token Pixabay tidak valid! Silakan periksa kembali.");
            return;
        }

        if (pexelsInput) {
            localStorage.setItem("pexels_token", pexelsInput);
            pexelsToken = pexelsInput;
        } else {
            localStorage.removeItem("pexels_token");
            pexelsToken = "";
        }

        if (pixabayInput) {
            localStorage.setItem("pixabay_token", pixabayInput);
            pixabayToken = pixabayInput;
        } else {
            localStorage.removeItem("pixabay_token");
            pixabayToken = "";
        }

        hideModal();
        gallery.innerHTML = "";
        page = 1;
        triggerFetch();
    });
}

const closeModalBtn = document.getElementById('closeModalBtn');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideModal);
}

const MAX_FREE_CONTENT = 10000;

function getFreeUsage() {
    return parseInt(localStorage.getItem('switchlens_free_usage')) || 0;
}

function incrementFreeUsage(amount) {
    let current = getFreeUsage();
    localStorage.setItem('switchlens_free_usage', current + amount);
}

function isFreeTierEligible() {
    return getFreeUsage() < MAX_FREE_CONTENT;
}

function triggerFetch() {
    if (!pexelsToken && !pixabayToken) {
        
        if (!isFreeTierEligible()) {
            if (gallery) {
                gallery.innerHTML = `
                    <div style="text-align:center; width:100%; padding: 40px 20px;">
                        <h3 style="color:var(--text-primary); margin-bottom: 10px;">Limit Gratis Habis</h3>
                        <p style="color:var(--text-secondary); line-height: 1.6;">
                            Kuota ${MAX_FREE_CONTENT.toLocaleString('id-ID')} konten gratis via API bawaan telah habis. <br>
                            Silakan masukkan API Key kamu sendiri di menu untuk lanjut menjelajah tanpa batas!
                        </p>
                    </div>
                `;
            }
            
            showModal(false);
            return;
        }
    }
    
    const lang = navigator.language.startsWith('id') ? 'id' : 'en';
    
    if (currentMode === "photo" && typeof getPhotos === "function") {
        getPhotos(currentQuery, page, lang);
    } else if (currentMode === "video" && typeof getVideos === "function") {
        getVideos(currentQuery, page, lang);
    }
}


function handleUnauthorizedError(provider) {
    if (provider === 'Pexels') {
        localStorage.removeItem("pexels_token");
        pexelsToken = "";
        showMessageModal("Ada masalah pada token!", "Token Pexels kamu tidak valid atau telah kedaluwarsa!");
    } else if (provider === 'Pixabay') {
        localStorage.removeItem("pixabay_token");
        pixabayToken = "";
        showMessageModal("Ada masalah pada token!", "Token Pixabay kamu tidak valid atau telah kedaluwarsa!");
    }
    showModal(true);
}

document.addEventListener("DOMContentLoaded", async () => {
    const logo = document.querySelector('.logo-container');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if (e.currentTarget.getAttribute('href') === '#') {
                e.preventDefault();
                showModal(true);
            }
        });
    }

    renderAuthNav();
    await loadFavoritesCache();

    const advancedToggleBtn = document.getElementById('advancedSearchToggle');
    if (advancedToggleBtn) {
        advancedToggleBtn.addEventListener('click', handleAdvancedSearchClick);
        setAdvancedMode(isAdvancedModeActive());
    }

    const advancedTosAgreeBtn = document.getElementById('advancedTosAgreeBtn');
    if (advancedTosAgreeBtn) {
        advancedTosAgreeBtn.addEventListener('click', () => {
            acceptAdvancedTos();
            hideAdvancedTosModal();
            setAdvancedMode(true);
        });
    }

    const advancedTosCancelBtn = document.getElementById('advancedTosCancelBtn');
    if (advancedTosCancelBtn) {
        advancedTosCancelBtn.addEventListener('click', hideAdvancedTosModal);
    }

    if (gallery && !window.location.pathname.includes('favorites.html')) {
        triggerFetch();
    }
});


function renderAuthNav() {
    const slot = document.getElementById('authNavSlot');
    if (!slot) return;

    slot.innerHTML = "";

    const authBtn = document.createElement(isLoggedIn() ? 'button' : 'a');
    authBtn.className = 'btn-history-action auth-nav-btn';

    if (isLoggedIn()) {
        authBtn.textContent = 'Keluar';
        authBtn.addEventListener('click', () => logout());
    } else {
        authBtn.textContent = 'Masuk / Daftar';
        authBtn.href = 'login.html';
    }

    slot.appendChild(authBtn);
}

window.addEventListener('offline', () => {
    showMessageModal("Koneksi Terputus", "Mode offline aktif. Beberapa gambar atau video mungkin gagal dimuat.");
});

window.addEventListener('online', () => {
    console.log("Koneksi pulih.");
    if(gallery && (gallery.children.length === 0 || gallery.innerHTML.includes("Gagal"))) {
        if (!window.location.pathname.includes('favorites.html')) {
            triggerFetch();
        }
    }
});
