async function getVideos(query, pageNum, language) {
    try {
        loading = true;

        if (pageNum === 1) {
            gallery.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Mengambil video...</p>';
        }

        let combinedVideos = [];

        if (pexelsToken || pixabayToken) {
            let pexelsVideos = [];
            let pixabayVideos = [];

            if (pexelsToken) {
                const pexelsQuery = query === "curated" ? "popular" : query; 
                const pexelsURL = query === "curated" 
                    ? `${pexelsBaseURL}/videos/popular?page=${pageNum}&per_page=8`
                    : `${pexelsBaseURL}/videos/search?query=${pexelsQuery}&page=${pageNum}&per_page=8`;

                try {
                    const pexelsRes = await fetch(pexelsURL, { headers: { 'Authorization': pexelsToken } });
                    if (pexelsRes.status === 401) {
                        handleUnauthorizedError('Pexels');
                    } else if (pexelsRes.ok) {
                        const data = await pexelsRes.json();
                        pexelsVideos = data.videos.map(vid => ({
                            provider: 'Pexels',
                            author: vid.user.name,
                            title: `Video oleh ${vid.user.name}`,
                            thumbnail: vid.image,
                            videoSrc: vid.video_files.find(f => f.quality === 'hd' || f.quality === 'sd')?.link || vid.video_files[0]?.link
                        }));
                    }
                } catch (e) { console.error(e); }
            }

            if (pixabayToken) {
                const pixabayQuery = query === "curated" ? "" : encodeURIComponent(query);
                const pixabayURL = `${pixabayBaseURL}/videos/?key=${pixabayToken}&q=${pixabayQuery}&page=${pageNum}&per_page=8&lang=${language}`;

                try {
                    const pixabayRes = await fetch(pixabayURL);
                    if (pixabayRes.status === 401 || pixabayRes.status === 400) {
                        handleUnauthorizedError('Pixabay');
                    } else if (pixabayRes.ok) {
                        const data = await pixabayRes.json();
                        pixabayVideos = data.hits.map(vid => ({
                            provider: 'Pixabay',
                            author: vid.user,
                            title: vid.tags || 'Pixabay Video',
                            thumbnail: `https://i.vimeocdn.com/video/${vid.picture_id}_640x360.jpg`,
                            videoSrc: vid.videos.medium?.url || vid.videos.small?.url
                        }));
                    }
                } catch (e) { console.error(e); }
            }
            
            combinedVideos = [...pexelsVideos, ...pixabayVideos];
        }
        else {
            try {
                const workerUrl = `${typeof WORKER_BASE_URL !== 'undefined' ? WORKER_BASE_URL : ''}/videos?query=${query}&page=${pageNum}&lang=${language}`;
                const response = await fetch(workerUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    combinedVideos = data.videos || data || [];
                    
                    if (typeof incrementFreeUsage === 'function') {
                        incrementFreeUsage(combinedVideos.length);
                    }
                } else {
                    console.error("Worker error atau limit dari server");
                }
            } catch (err) {
                console.error("Gagal fetch dari worker:", err);
            }
        }

        if (pageNum === 1) gallery.innerHTML = "";

        if (combinedVideos.length === 0 && pageNum === 1) {
            gallery.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Video tidak ditemukan.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        combinedVideos.forEach(({ author, title, thumbnail, videoSrc, provider }) => {
            const card = document.createElement("div");
            card.className = "media-card video-card";
            card.setAttribute("data-video", videoSrc);
            
            const favStatus = isFavorite(thumbnail) ? '❤️' : '🤍';
            const favClass = isFavorite(thumbnail) ? 'active' : '';

            card.innerHTML = `
                <div class="image-wrapper">
                    <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='assets/no-image.jpg';">
                    <div class="play-icon" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:2rem; color:white; text-shadow: 0 0 10px rgba(0,0,0,0.5); pointer-events:none;">&#9658;</div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${title}</h3>
                    <div class="card-footer">
                        <span class="api-tag">${author} (${provider})</span>
                        <div class="card-actions">
                            <button class="action-btn btn-fav ${favClass}" data-type="video" data-src="${thumbnail}" data-highres="${videoSrc}" data-title="${title}" data-author="${author}" data-provider="${provider}" data-thumbnail="${thumbnail}">
                                ${favStatus}
                            </button>
                            <button class="action-btn btn-download" data-url="${videoSrc}">⬇️</button>
                        </div>
                    </div>
                </div>
            `;
            fragment.appendChild(card);
        });

        gallery.appendChild(fragment);

    } catch (err) {
        if (pageNum === 1) {
            gallery.innerHTML = '<p style="text-align:center; width:100%; color:red;">Gagal memuat video. Coba lagi.</p>';
        }
    } finally {
        loading = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnVideo = document.getElementById("modeSwitcher");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");

    if (btnVideo) {
        btnVideo.addEventListener("click", () => {
            if (currentMode === "photo") {
                currentMode = "video";
                btnVideo.innerText = "Photo";
                btnVideo.classList.add("active-mode");
            } else {
                currentMode = "photo";
                btnVideo.innerText = "Video";
                btnVideo.classList.remove("active-mode");
            }
            
            page = 1;
            gallery.innerHTML = "";
            triggerFetch();
        });
    }

    gallery.addEventListener("click", (e) => {
        const videoCard = e.target.closest(".video-card");
        if (videoCard && currentMode === "video") {
            e.stopPropagation(); 
            const videoUrl = videoCard.getAttribute("data-video");

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

            videoPlayer.style.display = "block";
            videoPlayer.src = videoUrl;
            lightbox.classList.add("open");
        }
    });

    const closeAndStopVideo = () => {
        const videoPlayer = document.getElementById("lightboxVideo");
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = "";
            videoPlayer.style.display = "none";
        }
        if (lightboxImg) lightboxImg.style.display = "block"; 
    };

    const closeBtn = document.getElementById("closeLightbox");
    if(closeBtn) closeBtn.addEventListener("click", closeAndStopVideo);
    
    if(lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeAndStopVideo();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
            closeAndStopVideo();
            lightbox.classList.remove("open");
        }
    });
});
