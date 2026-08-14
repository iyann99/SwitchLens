function isSafeMediaUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
        const parsed = new URL(url, window.location.href);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch (e) {
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const menuBar = document.getElementById("menuBar");
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active");
      menuBar.classList.toggle("show");
    });
  
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeLightbox = document.getElementById("closeLightbox");
  
    const gallery = document.getElementById('gallery-grid');

    gallery.addEventListener("click", (e) => {
        const btnDl = e.target.closest('.btn-download');
        if (btnDl) {
            e.stopPropagation();
            downloadMedia(btnDl.dataset.url, 'SwitchLens_Aset', btnDl.dataset.downloadLocation || null);
            return;
        }
        
        const btnShare = e.target.closest('.btn-share');
        if (btnShare) {
            e.stopPropagation();
            const { url, title } = btnShare.dataset;
    
            if (navigator.share) {
                navigator.share({
                    title: 'SwitchLens Shared Media',
                    text: `Lihat gambar keren ini: ${title}`,
                    url: url
                })
                .then(() => showMessageModal('Berhasil!', 'Berhasil dibagikan!'))
                .catch((err) => showMessageModal('Berhasil!', 'Gagal membagikan:', err));
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    showMessageModal("Berhasil!", "Link berhasil disalin ke clipboard!");
                });
            }
        }

        const btnFav = e.target.closest('.btn-fav');
        if (btnFav) {
            e.stopPropagation();
            const d = btnFav.dataset;
            const itemData = {
                type: d.type, src: d.src, highres: d.highres,
                title: d.title, author: d.author, provider: d.provider, thumbnail: d.thumbnail
            };
            
            toggleFavorite(itemData, btnFav);

            if (window.location.pathname.includes('favorites.html')) {
                btnFav.closest('.media-card').remove();
                if(gallery.children.length === 0) {
                    gallery.innerHTML = '<p style="text-align:center; width:100%;">Belum ada favorit yang disimpan.</p>';
                }
            }
            return;
        }

        const card = e.target.closest(".photo-card");
        if (card && currentMode === "photo") {
            const imgEl = card.querySelector(".image-wrapper img");
            const highresUrl = imgEl.getAttribute("data-highres") || imgEl.src;
            if (isSafeMediaUrl(highresUrl)) {
                lightboxImg.src = highresUrl;
                lightbox.classList.add("open");
            } else {
                console.warn("Gambar ditolak: URL tidak valid atau tidak aman.", highresUrl);
            }
        }
    });
  
    closeLightbox.addEventListener("click", () => {
      lightbox.classList.remove("open");
    });
  
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("open");
      }
    });
  
    const buttons = document.querySelectorAll('.cat-tag');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            let keyword = button.textContent.trim();
            if (keyword === "Semua") keyword = "curated";
            
            currentQuery = keyword;
            page = 1;
            gallery.innerHTML = "";
            
            triggerFetch();
        });
    });
  
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (!query) return;
        
        currentQuery = query;
        page = 1;
        gallery.innerHTML = "";
  
        document.querySelectorAll('.cat-tag').forEach(btn => btn.classList.remove('active'));
        triggerFetch();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchBtn.click();
        }
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
