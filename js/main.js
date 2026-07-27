const browserLang = navigator.language;
const lang = browserLang.startsWith('id') ? 'id' : 'en';

async function getPhotos(query, pageNum, language) {
    const loaderEl = document.getElementById('loader');
    
    try {
        loading = true;
        if (pageNum === 1) {
            gallery.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Mengambil foto...</p>';
        }

        let combinedPhotos = [];

        if (pexelsToken || pixabayToken) {
            let pexelsPhotos = [];
            let pixabayPhotos = [];

            if (pexelsToken) {
                try {
                    const pexelsURL = query === "curated" 
                        ? `${pexelsBaseURL}/curated?page=${pageNum}&per_page=15`
                        : `${pexelsBaseURL}/search?query=${query}&page=${pageNum}&per_page=15`;

                    const response = await fetch(pexelsURL, {
                        headers: { 'Authorization': pexelsToken, "Accept-Language": language }
                    });

                    if (response.status === 401) {
                        handleUnauthorizedError('Pexels');
                    } else if (response.ok) {
                        const data = await response.json();
                        pexelsPhotos = data.photos.map(p => ({
                            photographer: p.photographer,
                            alt: p.alt,
                            medium: p.src.medium,
                            large: p.src.large2x,
                            provider: 'Pexels'
                        }));
                    }
                } catch (err) { console.error("Pexels fetch error:", err); }
            }

            if (pixabayToken) {
                try {
                    const pixabayQuery = query === "curated" ? "" : encodeURIComponent(query);
                    const response = await fetch(`${pixabayBaseURL}/?key=${pixabayToken}&q=${pixabayQuery}&page=${pageNum}&per_page=15&lang=${language}&image_type=photo`);

                    if (response.status === 400 || response.status === 401) {
                         handleUnauthorizedError('Pixabay');
                    } else if (response.ok) {
                        const data = await response.json();
                        pixabayPhotos = data.hits.map(p => ({
                            photographer: p.user,
                            alt: p.tags,
                            medium: p.webformatURL,
                            large: p.largeImageURL, 
                            provider: 'Pixabay'
                        }));
                    }
                } catch (err) { console.error("Pixabay fetch error:", err); }
            }
            
            combinedPhotos = [...pexelsPhotos, ...pixabayPhotos];
        } 
        else {
            try {
                const isAdvanced = typeof isAdvancedModeActive === 'function' && isAdvancedModeActive();
                const workerUrl = `${typeof WORKER_BASE_URL !== 'undefined' ? WORKER_BASE_URL : ''}/photos?query=${query}&page=${pageNum}&lang=${language}${isAdvanced ? '&advanced=true' : ''}`;

                const fetchHeaders = {};
                if (isAdvanced && typeof getAccessToken === 'function') {
                    fetchHeaders['Authorization'] = `Bearer ${getAccessToken()}`;
                }

                const response = await fetch(workerUrl, { headers: fetchHeaders });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    combinedPhotos = data.photos || data || []; 
                    
                    if (typeof incrementFreeUsage === 'function') {
                        incrementFreeUsage(combinedPhotos.length);
                    }
                } else {
                    console.error("Worker error atau limit dari server");
                }
            } catch (err) {
                console.error("Gagal fetch dari worker:", err);
            }
        }

        if (pageNum === 1) gallery.innerHTML = "";

        if (combinedPhotos.length === 0) {
            if (pageNum === 1) {
                gallery.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Tidak ada foto yang ditemukan.</p>';
            }
            if (loaderEl) loaderEl.style.display = "none";
            return;
        } else {
            if (loaderEl) loaderEl.style.display = "block";
        }

        const fragment = document.createDocumentFragment();
        combinedPhotos.forEach(({ photographer, alt, medium, large, provider, profileUrl, downloadLocation }) => {
            const card = document.createElement("div");
            card.className = "media-card photo-card";
            
            const favStatus = isFavorite(medium) ? '❤️' : '🤍';
            const favClass = isFavorite(medium) ? 'active' : '';

            const attributionHtml = profileUrl
                ? `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="photographer-link">${photographer}</a> (${provider})`
                : `${photographer} (${provider})`;

            card.innerHTML = `
                <div class="image-wrapper">
                    <img src="${medium}" data-highres="${large}" alt="${alt || 'Photo'}" loading="lazy" class="lazy-photo-img">
                </div>
                <div class="card-info">
                    <h3 class="card-title">${alt || 'Untitled'}</h3>
                    <div class="card-footer">
                        <span class="api-tag">${attributionHtml}</span>
                        <div class="card-actions">
                            <button class="action-btn btn-fav ${favClass}" data-type="photo" data-src="${medium}" data-highres="${large}" data-title="${alt || 'Untitled'}" data-author="${photographer}" data-provider="${provider}">
                                ${favStatus}
                            </button>
                            <button class="action-btn btn-download" data-url="${large}" ${downloadLocation ? `data-download-location="${downloadLocation}"` : ''}>⬇️</button>
                      <button class="action-btn btn-share" 
                              data-url="${large}" 
                              data-title="${alt || 'Untitled'}">
                              🔗
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

        if (typeof applyProviderFilterToGallery === 'function') {
            applyProviderFilterToGallery();
        }

    } catch (err) {
        console.error("Gagal mengambil foto:", err);
        if (pageNum === 1) {
            gallery.innerHTML = '<p style="text-align:center; width:100%; color:red;">Gagal memuat data. Coba lagi.</p>';
        }
    } finally {
        loading = false;
    }
}

const loader = document.querySelector('#loader');

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !loading) {
        page++;
        triggerFetch();
    }
});

if (loader) observer.observe(loader);

document.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
        lightbox.classList.remove("open");
        
        const lightboxImg = document.getElementById("lightboxImg");
        if (lightboxImg) lightboxImg.src = ""; 
    }
});
