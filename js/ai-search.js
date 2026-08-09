let currentConversationId = null;

document.addEventListener("DOMContentLoaded", async () => {
    if (!isLoggedIn()) {
        showMessageModal(
            "Login Diperlukan",
            "Silakan masuk atau daftar akun terlebih dahulu untuk menggunakan Smart Search AI."
        );
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return;
    }

    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendChatBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const advancedToggle = document.getElementById("aiAdvancedToggle");
    const sidebar = document.getElementById("conversationsSidebar");
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");

    const deleteConfirmModal = document.getElementById("deleteConfirmModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const deleteConfirmBody = document.getElementById("deleteConfirmBody");

    let deleteConfirmationResolver = null;

    if (typeof isAdvancedModeActive === "function") {
        advancedToggle.checked = isAdvancedModeActive();
    }

    advancedToggle.addEventListener("change", () => {
        if (
            advancedToggle.checked &&
            typeof isAdvancedModeActive === "function" &&
            !isAdvancedModeActive()
        ) {
            advancedToggle.checked = false;

            showMessageModal(
                "Advanced Search Belum Aktif",
                "Aktifkan Advanced Search terlebih dahulu lewat menu di halaman utama (☰ > Advanced Search) sebelum menyertakannya di sini."
            );
        }
    });

    toggleSidebarBtn?.addEventListener("click", () => {
        sidebar.classList.add("open");
    });

    closeSidebarBtn?.addEventListener("click", () => {
        sidebar.classList.remove("open");
    });

    function showDeleteConfirmation(title) {
        return new Promise(resolve => {
            deleteConfirmationResolver = resolve;

            const safeTitle = title || "percakapan ini";

            deleteConfirmBody.textContent = `“${safeTitle}” akan dihapus dan tidak dapat dipulihkan.`;

            deleteConfirmModal.classList.add("open");
            deleteConfirmModal.setAttribute("aria-hidden", "false");

            requestAnimationFrame(() => {
                confirmDeleteBtn.focus();
            });
        });
    }

    function closeDeleteConfirmation(result) {
        if (!deleteConfirmationResolver) return;

        const resolve = deleteConfirmationResolver;

        deleteConfirmationResolver = null;

        deleteConfirmModal.classList.remove("open");
        deleteConfirmModal.setAttribute("aria-hidden", "true");

        resolve(result);
    }

    cancelDeleteBtn?.addEventListener("click", () => {
        closeDeleteConfirmation(false);
    });

    confirmDeleteBtn?.addEventListener("click", () => {
        closeDeleteConfirmation(true);
    });

    deleteConfirmModal?.addEventListener("click", e => {
        if (e.target === deleteConfirmModal) {
            closeDeleteConfirmation(false);
        }
    });

    document.addEventListener("keydown", e => {
        if (
            e.key === "Escape" &&
            deleteConfirmModal?.classList.contains("open")
        ) {
            closeDeleteConfirmation(false);
        }
    });

    async function loadConversations() {
        try {
            const response = await fetch(
                `${WORKER_BASE_URL}/ai/conversations`,
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`
                    }
                }
            );

            const data = await response.json();

            renderConversationsList(data.conversations || []);
        } catch (err) {
            console.error("Gagal memuat daftar percakapan:", err);
        }
    }

    function renderConversationsList(conversations) {
        const list = document.getElementById("conversationsList");

        list.innerHTML = "";

        if (conversations.length === 0) {
            list.innerHTML = `
                <p class="ai-empty-note">
                    Belum ada percakapan.
                </p>
            `;

            return;
        }

        conversations.forEach(conv => {
            const item = document.createElement("div");

            item.className = "ai-conversation-item";

            if (conv.id === currentConversationId) {
                item.classList.add("active");
            }

            item.innerHTML = `
                <span class="ai-conv-title">
                    ${escapeHtml(conv.title)}
                </span>

                <span
                    class="ai-conv-delete"
                    title="Hapus"
                >
                    🗑️
                </span>
            `;

            item.querySelector(".ai-conv-title").addEventListener(
                "click",
                () => {
                    openConversation(conv.id);

                    sidebar.classList.remove("open");
                }
            );

            item.querySelector(".ai-conv-delete").addEventListener(
                "click",
                async e => {
                    e.stopPropagation();

                    const confirmed = await showDeleteConfirmation(conv.title);

                    if (confirmed) {
                        await deleteConversation(conv.id);
                    }
                }
            );

            list.appendChild(item);
        });
    }

    async function deleteConversation(conversationId) {
        try {
            const response = await fetch(
                `${WORKER_BASE_URL}/ai/conversations?conversationId=${encodeURIComponent(conversationId)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`
                    }
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Gagal menghapus percakapan.");
            }

            if (conversationId === currentConversationId) {
                currentConversationId = null;
                resetChatView();
            }

            await loadConversations();
        } catch (err) {
            console.error("Gagal menghapus percakapan:", err);

            showMessageModal(
                "Gagal",
                err.message || "Tidak dapat menghapus percakapan. Coba lagi."
            );
        }
    }

    async function openConversation(conversationId) {
        currentConversationId = conversationId;

        chatMessages.innerHTML = "";

        try {
            const response = await fetch(
                `${WORKER_BASE_URL}/ai/messages?conversationId=${conversationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`
                    }
                }
            );

            const data = await response.json();

            (data.messages || []).forEach(msg => {
                renderMessage(msg.role, msg.content, msg.images || null);
            });

            scrollChatToBottom();

            await loadConversations();
        } catch (err) {
            showMessageModal("Gagal", "Tidak dapat memuat riwayat percakapan.");
        }
    }

    function resetChatView() {
        chatMessages.innerHTML = `
            <div class="ai-welcome-message">

                <h2>
                    👋 Halo! Aku Smart Search AI
                </h2>

                <p>
                    Ceritakan gambar seperti apa yang kamu cari,
                    atau ajak aku ngobrol santai.
                </p>

            </div>
        `;
    }

    newChatBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(
                `${WORKER_BASE_URL}/ai/conversations`,
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`
                    }
                }
            );

            const data = await response.json();

            if (data.success && data.conversation) {
                currentConversationId = data.conversation.id;

                resetChatView();

                await loadConversations();

                sidebar.classList.remove("open");
            }
        } catch (err) {
            showMessageModal("Gagal", "Tidak dapat membuat percakapan baru.");
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();

        if (!message) return;

        if (!currentConversationId) {
            try {
                const response = await fetch(
                    `${WORKER_BASE_URL}/ai/conversations`,
                    {
                        method: "POST",

                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`
                        }
                    }
                );

                const data = await response.json();

                if (data.success && data.conversation) {
                    currentConversationId = data.conversation.id;

                    resetChatView();
                }
            } catch (err) {
                showMessageModal("Gagal", "Tidak dapat memulai percakapan.");

                return;
            }
        }

        chatInput.value = "";

        chatInput.style.height = "auto";

        sendBtn.disabled = true;

        renderMessage("user", message, null);

        scrollChatToBottom();

        const typingEl = renderTypingIndicator();

        try {
            const historyPayload = collectHistoryForContext();

            const response = await fetch(`${WORKER_BASE_URL}/ai/chat`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    Authorization: `Bearer ${getAccessToken()}`
                },

                body: JSON.stringify({
                    conversationId: currentConversationId,

                    message,

                    history: historyPayload,

                    advanced: advancedToggle.checked
                })
            });

            const data = await response.json();

            typingEl.remove();

            if (!data.success) {
                renderMessage(
                    "assistant",

                    data.message || "Maaf, terjadi kesalahan. Coba lagi.",

                    null
                );
            } else {
                renderMessage(
                    "assistant",

                    data.reply,

                    data.searchResults || null
                );
            }

            scrollChatToBottom();

            await loadConversations();
        } catch (err) {
            typingEl.remove();

            renderMessage(
                "assistant",

                "Tidak bisa terhubung ke server. Periksa koneksi internet kamu.",

                null
            );
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            sendMessage();
        }
    });

    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";

        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    function renderMessage(role, content, images) {
        const welcome = chatMessages.querySelector(".ai-welcome-message");

        if (welcome) {
            welcome.remove();
        }

        const wrapper = document.createElement("div");

        wrapper.className = `ai-message ${role}`;

        const bubble = document.createElement("div");

        bubble.className = "ai-message-bubble";

        bubble.textContent = content;

        wrapper.appendChild(bubble);

        if (role === "assistant" && images && images.length > 0) {
            const toggleBtn = document.createElement("button");

            toggleBtn.className = "ai-image-drawer-toggle";

            toggleBtn.textContent = `🖼️ Lihat ${images.length} gambar hasil pencarian`;

            const drawer = document.createElement("div");

            drawer.className = "ai-image-drawer";

            images.slice(0, 10).forEach(img => {
                const card = document.createElement("div");

                card.className = "ai-drawer-card";

                card.innerHTML = `
                        <img
                            src="${img.medium}"
                            alt="${escapeHtml(img.alt || "Hasil pencarian")}"
                            loading="lazy"
                            class="lazy-photo-img"
                        >

                        <span class="ai-drawer-provider">
                            ${img.provider}
                        </span>
                    `;

                card.addEventListener("click", () => {
                    window.open(
                        img.large || img.medium,

                        "_blank",

                        "noopener,noreferrer"
                    );
                });

                drawer.appendChild(card);
            });

            toggleBtn.addEventListener("click", () => {
                const isOpen = drawer.classList.toggle("open");

                toggleBtn.textContent = isOpen
                    ? "🔼 Sembunyikan gambar"
                    : `🖼️ Lihat ${images.length} gambar hasil pencarian`;
            });

            wrapper.appendChild(toggleBtn);

            wrapper.appendChild(drawer);
        }

        chatMessages.appendChild(wrapper);

        wrapper.querySelectorAll(".lazy-photo-img").forEach(img => {
            img.addEventListener(
                "error",

                function onImgError() {
                    this.removeEventListener("error", onImgError);

                    this.src = "assets/no-image.jpg";
                }
            );
        });
    }

    function renderTypingIndicator() {
        const el = document.createElement("div");

        el.className = "ai-typing-indicator";

        el.textContent = "Sedang mengetik...";

        chatMessages.appendChild(el);

        scrollChatToBottom();

        return el;
    }

    function collectHistoryForContext() {
        const bubbles = Array.from(
            chatMessages.querySelectorAll(".ai-message")
        );

        return bubbles.slice(-10).map(el => ({
            role: el.classList.contains("user") ? "user" : "assistant",

            content: el.querySelector(".ai-message-bubble").textContent
        }));
    }

    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(str) {
        const div = document.createElement("div");

        div.textContent = str;

        return div.innerHTML;
    }

    await loadConversations();
});