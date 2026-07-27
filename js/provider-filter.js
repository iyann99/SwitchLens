const PROVIDER_FILTER_KEY = "switchlens_disabled_providers";

function getDisabledProviders() {
    try {
        const raw = localStorage.getItem(PROVIDER_FILTER_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveDisabledProviders(list) {
    localStorage.setItem(PROVIDER_FILTER_KEY, JSON.stringify(list));
}

function isProviderDisabled(providerName) {
    return getDisabledProviders().includes(providerName);
}

function applyProviderFilterToGallery() {
    const disabled = getDisabledProviders();
    const gallery = document.getElementById("gallery-grid");
    if (!gallery) return;

    gallery.querySelectorAll(".media-card").forEach((card) => {
        const tag = card.querySelector(".api-tag");
        if (!tag) return;

        const favBtn = card.querySelector(".btn-fav");
        const provider = favBtn?.dataset?.provider;
        if (!provider) return;

        card.style.display = disabled.includes(provider) ? "none" : "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const fab = document.getElementById("providerFilterFab");
    const modal = document.getElementById("providerFilterModal");
    const closeBtn = document.getElementById("closeProviderFilterBtn");
    const filterButtons = document.querySelectorAll(".provider-filter-btn");
    const allBtn = document.querySelector(".provider-filter-btn.provider-all");

    if (!fab || !modal) return;

    function renderButtonStates() {
        const disabled = getDisabledProviders();

        filterButtons.forEach((btn) => {
            const provider = btn.dataset.provider;
            if (provider === "all") return;
            btn.classList.toggle("provider-disabled", disabled.includes(provider));
        });
    }

    fab.addEventListener("click", () => {
        renderButtonStates();
        modal.style.display = "flex";
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const provider = btn.dataset.provider;

            if (provider === "all") {
                saveDisabledProviders([]);
                renderButtonStates();
                applyProviderFilterToGallery();
                return;
            }

            let disabled = getDisabledProviders();

            if (disabled.includes(provider)) {
                disabled = disabled.filter((p) => p !== provider);
            } else {
                disabled.push(provider);
            }

            saveDisabledProviders(disabled);
            renderButtonStates();
            applyProviderFilterToGallery();
        });
    });

    applyProviderFilterToGallery();
});
