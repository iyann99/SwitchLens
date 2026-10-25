function getSanitizedMediaUrl(url) {
    if (!url || typeof url !== "string") return null;
    try {
        const parsed = new URL(url, window.location.href);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
        return parsed.href;
    } catch (e) {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const gallery = document.getElementById("gallery-grid");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const sortSelect = document.getElementById("sortFav");
    const searchInput = document.getElementById("searchFav");

    function renderFavorites(data) {
        gallery.innerHTML = ""; 

        if (data.length === 0) {
            gallery.innerHTML = `
                <p style="text-align:center; width:100%; color:var(--text-secondary); padding: 40px 0;">
                    Data tidak ditemukan. Coba kata kunci lain atau tambahkan media baru ke favorit!
                </p>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        data.forEach(item => {
            const safeSrc = getSanitizedMediaUrl(item.src);
            const safeHighres = getSanitizedMediaUrl(item.highres);
            const safeThumbnail = item.thumbnail ? getSanitizedMediaUrl(item.thumbnail) : null;

            if (!safeSrc && !safeThumbnail) return;

            const card = document.createElement("div");
            card.className = `media-card ${item.type === "video" ? "video-card" : "photo-card"}`;

            if (item.type === "video") {
                card.dataset.video = safeHighres || "";
            }

            const safeTitle = escapeHtml(item.title || "Untitled");
            const safeAuthor = escapeHtml(item.author || "Unknown");
            const safeProvider = escapeHtml(item.provider || "");
            const displaySrc = item.type === "video" ? safeThumbnail : safeSrc;

            card.innerHTML = `
                <div class="image-wrapper">
                    <img
                        src="${escapeHtml(displaySrc || "")}"
                        data-highres="${escapeHtml(safeHighres || "")}"
                        alt="${safeTitle}"
                        loading="lazy"
                        class="lazy-photo-img">

                    ${
                        item.type === "video"
                            ? `
                            <div class="play-icon"
                                style="position:absolute;
                                       top:50%;
                                       left:50%;
                                       transform:translate(-50%,-50%);
                                       font-size:2rem;
                                       color:white;
                                       text-shadow:0 0 10px rgba(0,0,0,.5);
                                       pointer-events:none;">
                                &#9658;
                            </div>
                            `
                            : ""
                    }
                </div>

                <div class="card-info">
                    <h3 class="card-title">${safeTitle}</h3>

                    <div class="card-footer">
                        <span class="api-tag">
                            ${safeAuthor} (${safeProvider})
                        </span>

                        <div class="card-actions">
                            <button
                                class="action-btn btn-fav active"
                                data-type="${escapeHtml(item.type || "")}"
                                data-src="${escapeHtml(safeSrc || "")}"
                                data-highres="${escapeHtml(safeHighres || "")}"
                                data-title="${safeTitle}"
                                data-author="${safeAuthor}"
                                data-provider="${safeProvider}"
                                data-thumbnail="${escapeHtml(safeThumbnail || "")}">
                                ❤️
                            </button>

                            <button
                                class="action-btn btn-download"
                                data-url="${escapeHtml(safeHighres || "")}">
                                ⬇️
                            </button>
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(card);
        });

        gallery.appendChild(fragment);

        gallery.querySelectorAll('.lazy-photo-img').forEach(img => {
            img.addEventListener('error', function onImgError() {
                this.removeEventListener('error', onImgError);
                this.src = 'assets/no-image.jpg';
            });
        });
    }

    function filterAndSort() {
        let favData = getFavorites();
        const sortMethod = sortSelect ? sortSelect.value : "newest";
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";

        if (searchQuery) {
            favData = favData.filter(item => {
                const titleMatch = (item.title || "").toLowerCase().includes(searchQuery);
                const authorMatch = (item.author || "").toLowerCase().includes(searchQuery);
                const providerMatch = (item.provider || "").toLowerCase().includes(searchQuery);
                return titleMatch || authorMatch || providerMatch;
            });
        }

        switch (sortMethod) {
            case "newest":
                favData.reverse(); 
                break;
            case "oldest":
                break;
            case "az":
                favData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                break;
            case "za":
                favData.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
                break;
            case "provider":
                favData.sort((a, b) => (a.provider || "").localeCompare(b.provider || ""));
                break;
        }

        renderFavorites(favData);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", filterAndSort);
    }
    
    if (searchInput) {
        searchInput.addEventListener("input", filterAndSort);
    }

    if (!isLoggedIn()) {
        gallery.innerHTML = `
            <p style="text-align:center; width:100%; color:var(--text-secondary); padding: 40px 0;">
                Silakan <a href="login.html">masuk</a> untuk melihat dan menyimpan koleksi favorit kamu.
            </p>
        `;
    } else {
        gallery.innerHTML = `
            <p style="text-align:center; width:100%; color:var(--text-secondary); padding: 40px 0;">
                Memuat koleksi favorit...
            </p>
        `;

        await loadFavoritesCache();

        if (typeof favoritesCacheLoadFailed !== "undefined" && favoritesCacheLoadFailed) {
            gallery.innerHTML = `
                <div style="text-align:center; width:100%; padding: 40px 0;">
                    <p style="color:var(--text-secondary); margin-bottom: 12px;">
                        Gagal memuat koleksi favorit. Periksa koneksi internet kamu.
                    </p>
                    <button id="retryLoadFavBtn" class="action-btn" style="padding: 8px 20px;">
                        Coba Lagi
                    </button>
                </div>
            `;
            document.getElementById("retryLoadFavBtn")?.addEventListener("click", async () => {
                gallery.innerHTML = `
                    <p style="text-align:center; width:100%; color:var(--text-secondary); padding: 40px 0;">
                        Memuat koleksi favorit...
                    </p>
                `;
                await loadFavoritesCache();
                if (typeof favoritesCacheLoadFailed !== "undefined" && favoritesCacheLoadFailed) {
                    filterAndSort();
                    const notice = document.createElement("p");
                    notice.style.cssText = "text-align:center; width:100%; color:var(--text-secondary); padding: 10px 0;";
                    notice.textContent = "Masih gagal memuat. Coba beberapa saat lagi.";
                    gallery.prepend(notice);
                } else {
                    filterAndSort();
                }
            });
        } else {
            filterAndSort();
        }
    }

    gallery.addEventListener("click", (e) => {
        
        const btnDl = e.target.closest(".btn-download");
        if (btnDl) {
            e.stopPropagation();
            if (typeof downloadMedia === "function") {
                downloadMedia(btnDl.dataset.url, "SwitchLens_Aset");
            }
            return;
        }

        const btnFav = e.target.closest(".btn-fav");
        if (btnFav) {
            e.stopPropagation();
            const d = btnFav.dataset;
            const itemData = {
                type: d.type, 
                src: d.src, 
                highres: d.highres,
                title: d.title, 
                author: d.author, 
                provider: d.provider, 
                thumbnail: d.thumbnail
            };
            
            if (typeof toggleFavorite === "function") {
                toggleFavorite(itemData, btnFav);
            }

            filterAndSort();
            return;
        }

        const card = e.target.closest(".media-card");
        if (!card) return;

        if (card.classList.contains("video-card")) {
            if (lightboxImg) lightboxImg.style.display = "none";

            let videoPlayer = document.getElementById("lightboxVideo");
            if (!videoPlayer) {
                videoPlayer = document.createElement("video");
                videoPlayer.id = "lightboxVideo";
                videoPlayer.controls = true;
                videoPlayer.autoplay = true;
                videoPlayer.style.maxWidth = "100%";
                videoPlayer.style.maxHeight = "80vh";
                lightbox.appendChild(videoPlayer);
            }

            videoPlayer.src = card.dataset.video;
            videoPlayer.style.display = "block";
            lightbox.classList.add("open");
            return;
        }

        const img = card.querySelector("img");
        if (img && lightboxImg) {
            let videoPlayer = document.getElementById("lightboxVideo");
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.src = "";
                videoPlayer.style.display = "none";
            }

            lightboxImg.style.display = "block";
            lightboxImg.src = img.dataset.highres || img.src;
            lightbox.classList.add("open");
        }
    });

    function closeLightbox() {
        const videoPlayer = document.getElementById("lightboxVideo");
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = "";
            videoPlayer.style.display = "none";
        }

        if (lightboxImg) {
            lightboxImg.src = "";
            lightboxImg.style.display = "block";
        }
        lightbox.classList.remove("open");
    }

    document.getElementById("closeLightbox")?.addEventListener("click", closeLightbox);

    lightbox?.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    const toggle = document.getElementById("themeToggle");
    let theme = localStorage.getItem("theme");
    if (!theme) {
        theme = "light";
    }
    document.body.dataset.theme = theme;
    toggle.checked = theme === "dark";
    
    toggle.addEventListener("change", () => {
    
        const newTheme = toggle.checked
            ? "dark"
            : "light";
    
        document.body.dataset.theme = newTheme;
        localStorage.setItem("theme", newTheme);
    });
});
