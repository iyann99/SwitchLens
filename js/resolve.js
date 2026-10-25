(() => {
    const HISTORY_KEY = "switchlens_resolve_history_v1";
    const HISTORY_LIMIT = 15;
    const REQUEST_TIMEOUT_MS = 45000;
    const MEDIA_PREFIX = `${WORKER_BASE_URL}/media?`;

    const HOST_LABELS = [
        { label: "Pinterest", hosts: ["pinterest.", "pin.it"] },
        { label: "X (Twitter)", hosts: ["twitter.com", "x.com", "fxtwitter.com", "vxtwitter.com", "fixupx.com"] },
        { label: "Pixiv", hosts: ["pixiv.net"] },
        { label: "Bilibili", hosts: ["bilibili.com", "b23.tv"] },
        { label: "Instagram", hosts: ["instagram.com", "instagr.am"] }
    ];

    const els = {
        gate: document.getElementById("rsGate"),
        form: document.getElementById("rsForm"),
        input: document.getElementById("rsInput"),
        detect: document.getElementById("rsDetect"),
        submit: document.getElementById("rsSubmit"),
        paste: document.getElementById("rsPaste"),
        clear: document.getElementById("rsClear"),
        consentRow: document.getElementById("rsConsentRow"),
        consent: document.getElementById("rsConsent"),
        platforms: document.getElementById("rsPlatforms"),
        results: document.getElementById("rsResults"),
        maxBatch: document.getElementById("rsMaxBatch"),
        historySection: document.getElementById("rsHistorySection"),
        historyList: document.getElementById("rsHistoryList"),
        historyClear: document.getElementById("rsHistoryClear"),
        preview: document.getElementById("rsPreview"),
        previewBody: document.getElementById("rsPreviewBody"),
        previewClose: document.getElementById("rsPreviewClose")
    };

    const state = {
        maxBatch: 5,
        enabled: true,
        busy: false,
        lastFocus: null
    };

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function isTrustedMediaUrl(value) {
        return typeof value === "string" && value.startsWith(MEDIA_PREFIX);
    }

    function isHttpsUrl(value) {
        try {
            return new URL(value).protocol === "https:";
        } catch (e) {
            return false;
        }
    }

    function extractUrls(text) {
        const matches = String(text || "").match(/https?:\/\/[^\s<>"'`]+|(?:^|\s)(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"'`]+/gi) || [];
        const cleaned = matches.map((value) => value.trim().replace(/[.,;:!?)\]}]+$/, ""));
        return [...new Set(cleaned)];
    }

    function detectLabel(value) {
        let host = "";
        try {
            host = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase();
        } catch (e) {
            return null;
        }

        const entry = HOST_LABELS.find((item) =>
            item.hosts.some((base) =>
                base.endsWith(".") ? host.includes(base) && host.split(".").includes(base.slice(0, -1)) : host === base || host.endsWith(`.${base}`)
            )
        );
        return entry ? entry.label : null;
    }

    function updateDetect() {
        const urls = extractUrls(els.input.value);
        els.detect.textContent = "";

        if (urls.length === 0) return;

        const parts = urls.slice(0, state.maxBatch + 1).map((value) => detectLabel(value) || "tidak dikenal");
        const strong = el("strong", null, `${urls.length} tautan`);
        els.detect.append(strong, document.createTextNode(`: ${parts.join(", ")}`));

        if (urls.length > state.maxBatch) {
            els.detect.append(document.createTextNode(` (maksimal ${state.maxBatch})`));
        }
    }

    function readHistory() {
        try {
            const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
            return Array.isArray(parsed)
                ? parsed.filter((item) => item && isHttpsUrl(item.url)).slice(0, HISTORY_LIMIT)
                : [];
        } catch (e) {
            return [];
        }
    }

    function writeHistory(list) {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_LIMIT)));
        } catch (e) {
            return;
        }
    }

    function pushHistory(result) {
        if (!result || !isHttpsUrl(result.sourceUrl)) return;
        const entry = {
            url: result.sourceUrl,
            provider: String(result.providerLabel || result.provider || ""),
            title: String(result.title || "").slice(0, 100),
            at: Date.now()
        };
        const list = readHistory().filter((item) => item.url !== entry.url);
        list.unshift(entry);
        writeHistory(list);
        renderHistory();
    }

    function renderHistory() {
        const list = readHistory();
        els.historyList.textContent = "";
        els.historySection.hidden = list.length === 0;

        list.forEach((item) => {
            const li = el("li");
            const button = el("button", "rs-history-btn");
            button.type = "button";
            button.append(el("span", "rs-badge", item.provider || "Link"));
            button.append(el("span", "rs-history-text", item.title || item.url));
            button.addEventListener("click", () => {
                els.input.value = item.url;
                updateDetect();
                els.input.focus();
            });
            li.appendChild(button);
            els.historyList.appendChild(li);
        });
    }

    function openPreview(item, thumbnail, trigger) {
        if (!isTrustedMediaUrl(item.previewUrl)) return;

        state.lastFocus = trigger || document.activeElement;
        els.previewBody.textContent = "";

        if (item.type === "video") {
            const video = document.createElement("video");
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = "metadata";
            if (isTrustedMediaUrl(thumbnail)) video.poster = thumbnail;
            video.src = item.previewUrl;
            els.previewBody.appendChild(video);
        } else {
            const img = document.createElement("img");
            img.alt = item.filename || "Pratinjau media";
            img.referrerPolicy = "no-referrer";
            img.src = item.previewUrl;
            els.previewBody.appendChild(img);
        }

        els.preview.hidden = false;
        els.previewClose.focus();
    }

    function closePreview() {
        if (els.preview.hidden) return;
        els.preview.hidden = true;
        els.previewBody.textContent = "";
        if (state.lastFocus && typeof state.lastFocus.focus === "function") {
            state.lastFocus.focus();
        }
    }

    function triggerDownload(downloadUrl) {
        if (!isTrustedMediaUrl(downloadUrl)) return;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function copyText(text, button) {
        const original = button.textContent;
        try {
            await navigator.clipboard.writeText(text);
            button.textContent = "Tersalin ✓";
        } catch (e) {
            button.textContent = "Gagal menyalin";
        }
        setTimeout(() => {
            button.textContent = original;
        }, 1500);
    }

    function buildItemRow(item, result) {
        const row = el("li", "rs-item");
        const info = el("div", "rs-item-info", `${item.type === "video" ? "🎬" : "🖼️"} ${item.quality || (item.type === "video" ? "Video" : "Gambar")}`);
        const detail = [item.width && item.height ? `${item.width}×${item.height}` : "", item.filename].filter(Boolean).join(" · ");
        if (detail) info.appendChild(el("small", null, detail));
        row.appendChild(info);

        const previewBtn = el("button", "rs-btn rs-btn-ghost rs-btn-sm", "Pratinjau");
        previewBtn.type = "button";
        previewBtn.addEventListener("click", () => openPreview(item, result.thumbnail, previewBtn));

        const downloadBtn = el("button", "rs-btn rs-btn-primary rs-btn-sm", "⬇ Unduh");
        downloadBtn.type = "button";
        downloadBtn.style.marginLeft = "0";
        downloadBtn.style.minWidth = "0";
        downloadBtn.addEventListener("click", () => triggerDownload(item.downloadUrl));

        row.append(previewBtn, downloadBtn);
        return row;
    }

    function buildResultCard(result) {
        const card = el("article", "rs-card");

        if (isTrustedMediaUrl(result.thumbnail)) {
            const img = document.createElement("img");
            img.className = "rs-thumb";
            img.alt = "";
            img.loading = "lazy";
            img.referrerPolicy = "no-referrer";
            img.src = result.thumbnail;
            card.appendChild(img);
        } else {
            card.appendChild(el("div", "rs-thumb rs-thumb-empty", result.type === "video" ? "🎬" : "🖼️"));
        }

        const body = el("div");
        body.appendChild(el("h3", "rs-card-title", result.title || "Tanpa judul"));

        const meta = el("div", "rs-meta");
        meta.appendChild(el("span", "rs-badge", result.providerLabel || result.provider));
        if (result.author && result.author.name) {
            if (isHttpsUrl(result.author.url)) {
                const link = el("a", null, `${result.author.name} ${result.author.username || ""}`.trim());
                link.href = result.author.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                meta.appendChild(link);
            } else {
                meta.appendChild(el("span", null, `${result.author.name} ${result.author.username || ""}`.trim()));
            }
        }
        meta.appendChild(el("span", null, `${result.items.length} media`));
        if (result.cached) meta.appendChild(el("span", null, "⚡ cache"));
        body.appendChild(meta);

        const list = el("ul", "rs-items");
        result.items.forEach((item) => {
            if (isTrustedMediaUrl(item.previewUrl) && isTrustedMediaUrl(item.downloadUrl)) {
                list.appendChild(buildItemRow(item, result));
            }
        });
        body.appendChild(list);

        const foot = el("div", "rs-card-foot");

        if (result.items.length > 1) {
            const all = el("button", "rs-btn rs-btn-ghost rs-btn-sm", "Unduh semua");
            all.type = "button";
            all.addEventListener("click", () => {
                result.items.forEach((item, index) => {
                    setTimeout(() => triggerDownload(item.downloadUrl), index * 800);
                });
            });
            foot.appendChild(all);
        }

        if (isHttpsUrl(result.sourceUrl)) {
            const copy = el("button", "rs-btn rs-btn-ghost rs-btn-sm", "Salin tautan sumber");
            copy.type = "button";
            copy.addEventListener("click", () => copyText(result.sourceUrl, copy));
            foot.appendChild(copy);

            const open = el("a", "rs-btn rs-btn-ghost rs-btn-sm", "Buka sumber");
            open.href = result.sourceUrl;
            open.target = "_blank";
            open.rel = "noopener noreferrer";
            foot.appendChild(open);
        }

        foot.appendChild(el("small", "rs-meta", "Tautan unduhan berlaku 1 jam."));
        body.appendChild(foot);

        card.appendChild(body);
        return card;
    }

    function buildErrorCard(input, message) {
        const card = el("article", "rs-card rs-card-error");
        const body = el("div");
        body.appendChild(el("p", "rs-err-text", message));
        if (input) body.appendChild(el("p", "rs-err-src", input));
        card.appendChild(body);
        return card;
    }

    function setBusy(isBusy) {
        state.busy = isBusy;
        els.submit.disabled = isBusy;
        els.results.setAttribute("aria-busy", String(isBusy));
        els.submit.textContent = "";
        if (isBusy) {
            els.submit.append(el("span", "spinner-inline"), document.createTextNode("Memproses..."));
        } else {
            els.submit.textContent = "Resolve";
        }
    }

    function showLoadingCard(count) {
        els.results.textContent = "";
        const card = el("article", "rs-card rs-card-loading");
        const text = el("div");
        text.append(el("span", "spinner-inline"), document.createTextNode(`Memproses ${count} tautan...`));
        card.appendChild(text);
        els.results.appendChild(card);
    }

    function describeFailure(status, json) {
        if (status === 429) {
            const wait = json && json.retryAfter ? Math.ceil(json.retryAfter / 60) : 0;
            return `${(json && json.message) || "Batas penggunaan tercapai."}${wait ? ` Coba lagi sekitar ${wait} menit lagi.` : ""}`;
        }
        if (status === 503 && json && json.error === "feature_disabled") {
            return "Media Resolver belum diaktifkan di server. Hubungi admin.";
        }
        return (json && json.message) || "Terjadi kesalahan. Coba lagi.";
    }

    async function submit() {
        if (state.busy) return;

        if (!isLoggedIn()) {
            renderGate();
            return;
        }

        const urls = extractUrls(els.input.value);
        if (urls.length === 0) {
            showMessageModal("Tautan Kosong", "Tempel minimal satu tautan yang valid, misalnya dari Pinterest atau X.");
            return;
        }
        if (urls.length > state.maxBatch) {
            showMessageModal("Terlalu Banyak Tautan", `Maksimal ${state.maxBatch} tautan per permintaan.`);
            return;
        }

        if (!isAdvancedTosAccepted()) {
            if (!els.consent.checked) {
                showMessageModal("Persetujuan Diperlukan", "Centang pernyataan hak cipta di bawah form sebelum melanjutkan.");
                return;
            }
            acceptAdvancedTos();
            els.consentRow.hidden = true;
        }

        const payload = urls.length === 1 ? { url: urls[0] } : { urls };

        setBusy(true);
        showLoadingCard(urls.length);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(`${WORKER_BASE_URL}/resolve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            const json = await parseWorkerResponse(response);
            els.results.textContent = "";

            if (response.status === 401) {
                renderGate();
                return;
            }

            if (!response.ok || !json.success) {
                els.results.appendChild(buildErrorCard(urls.length === 1 ? urls[0] : "", describeFailure(response.status, json)));
                return;
            }

            const entries = json.result
                ? [{ input: urls[0], success: true, result: json.result }]
                : Array.isArray(json.results)
                  ? json.results
                  : [];

            entries.forEach((entry) => {
                if (entry.success && entry.result) {
                    els.results.appendChild(buildResultCard(entry.result));
                    pushHistory(entry.result);
                } else {
                    els.results.appendChild(buildErrorCard(entry.input, entry.message || "Gagal memproses tautan."));
                }
            });

            if (els.results.firstElementChild) {
                els.results.firstElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        } catch (error) {
            els.results.textContent = "";
            const message =
                error && error.name === "AbortError"
                    ? "Permintaan terlalu lama. Coba lagi beberapa saat lagi."
                    : "Tidak bisa terhubung ke server. Periksa koneksi internetmu.";
            els.results.appendChild(buildErrorCard("", message));
        } finally {
            clearTimeout(timer);
            setBusy(false);
        }
    }

    function renderGate() {
        const loggedIn = isLoggedIn();
        els.gate.textContent = "";
        els.gate.hidden = loggedIn && state.enabled;
        els.form.hidden = !(loggedIn && state.enabled);

        if (!loggedIn) {
            els.gate.append(el("p", null, "Media Resolver hanya tersedia untuk pengguna yang sudah masuk, supaya penggunaan tetap adil dan aman."));
            const link = el("a", "rs-btn rs-btn-primary", "Masuk / Daftar");
            link.href = "login.html";
            link.style.marginLeft = "0";
            els.gate.appendChild(link);
            return;
        }

        if (!state.enabled) {
            els.gate.append(el("p", null, "Fitur ini belum diaktifkan di server. Silakan coba lagi nanti."));
            return;
        }

        els.consentRow.hidden = isAdvancedTosAccepted();
    }

    function renderPlatforms(providers) {
        els.platforms.textContent = "";
        providers.forEach((provider) => {
            const chip = el("span", "rs-chip", provider.label);
            if (provider.experimental) chip.appendChild(el("span", "rs-chip-beta", "BETA"));
            if (Array.isArray(provider.examples) && provider.examples[0]) chip.title = provider.examples[0];
            els.platforms.appendChild(chip);
        });
    }

    async function loadProviders() {
        try {
            const response = await fetch(`${WORKER_BASE_URL}/resolve/providers`);
            if (!response.ok) throw new Error("providers_failed");
            const json = await response.json();
            state.enabled = json.enabled !== false;
            state.maxBatch = Number(json.maxBatch) || state.maxBatch;
            els.maxBatch.textContent = String(state.maxBatch);
            renderPlatforms(Array.isArray(json.providers) ? json.providers : []);
        } catch (e) {
            renderPlatforms(HOST_LABELS.map((item) => ({ label: item.label })));
        }
    }

    function applyTheme() {
        document.body.dataset.theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    }

    function bindEvents() {
        els.input.addEventListener("input", updateDetect);
        els.input.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                submit();
            }
        });

        els.submit.addEventListener("click", submit);

        els.clear.addEventListener("click", () => {
            els.input.value = "";
            els.results.textContent = "";
            updateDetect();
            els.input.focus();
        });

        els.paste.addEventListener("click", async () => {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                showMessageModal("Tidak Didukung", "Browser tidak mengizinkan membaca clipboard. Tempel manual dengan menekan lama di kolom input.");
                return;
            }
            try {
                const text = await navigator.clipboard.readText();
                els.input.value = text;
                updateDetect();
            } catch (e) {
                showMessageModal("Akses Ditolak", "Izin membaca clipboard ditolak. Tempel manual di kolom input.");
            }
        });

        els.historyClear.addEventListener("click", () => {
            writeHistory([]);
            renderHistory();
        });

        els.previewClose.addEventListener("click", closePreview);
        els.preview.addEventListener("click", (event) => {
            if (event.target === els.preview) closePreview();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closePreview();
        });

        window.addEventListener("storage", (event) => {
            if (event.key === "switchlens_session") renderGate();
        });
    }

    async function init() {
        applyTheme();
        bindEvents();
        renderHistory();
        await loadProviders();
        renderGate();
        updateDetect();
    }

    init();
})();
