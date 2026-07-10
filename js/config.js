const pexelsBaseURL = "https://api.pexels.com/v1";
const pixabayBaseURL = "https://pixabay.com/api";
const WORKER_BASE_URL = "https://iyan99-as.pradikaaprilianto9.workers.dev";

const gallery = document.getElementById('gallery-grid');


const ADVANCED_TOS_KEY = "switchlens_advanced_tos_accepted";
let advancedModeEnabled = false;

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

async function downloadMedia(url, filename, downloadLocation = null) {
    try {
        showMessageModal("Mengunduh", "Memulai proses unduh file (Bisa memakan waktu tergantung ukuran file). Silakan tunggu...", false);

        const safeFilename = (filename || "SwitchLens-Media").replace(/[^a-zA-Z0-9._-]/g, "_");
        let proxyUrl = `${WORKER_BASE_URL}/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(safeFilename)}`;

        if (downloadLocation) {
            proxyUrl += `&downloadLocation=${encodeURIComponent(downloadLocation)}`;
        }

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error("Proxy download gagal");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        document.getElementById("messageModal").style.display = "none";
    } catch (error) {
        console.error("Gagal mengunduh:", error);
        showMessageModal("Gagal", "File tidak dapat diunduh saat ini. Silakan buka gambar secara penuh dan simpan manual.");
    }
}

let favoritesCache = [];
let favoritesCacheLoaded = false;

async function loadFavoritesCache() {
    if (!isLoggedIn()) {
        favoritesCache = [];
        favoritesCacheLoaded = true;
        return;
    }

    try {
        const response = await fetch(`${WORKER_BASE_URL}/favorites`, {
            headers: {
                "Authorization": `Bearer ${getAccessToken()}`
            }
        });
        const data = await response.json();

        if (data.success) {
            favoritesCache = data.favorites || [];
        } else {
            favoritesCache = [];
        }
    } catch (err) {
        console.error("Gagal memuat daftar favorite:", err);
        favoritesCache = [];
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
            const result = await response.json();
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
            const result = await response.json();
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
            <input id="tokenInputPexels" type="text" placeholder="Kosongkan jika tidak ada" style="width:100%; margin-bottom:15px;" value="${pexelsToken}">
            
            <label style="display:block; text-align:left; margin-bottom:5px; font-weight:bold; font-size:0.85rem;">Pixabay API Key:</label>
            <input id="tokenInputPixabay" type="text" placeholder="Kosongkan jika tidak ada" style="width:100%; margin-bottom:15px;" value="${pixabayToken}">
            
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
                            Kuota 100 konten gratis via API bawaan telah habis. <br>
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
