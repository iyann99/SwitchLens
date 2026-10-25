const SEARCH_HISTORY_KEY = "switchlens_search_history";
const MAX_HISTORY_ITEMS = 15;

function getSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(historyArr) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(historyArr));
}

function addSearchHistory(query) {
  if (!query || !query.trim()) return;
  const trimmed = query.trim();

  let history = getSearchHistory();

  history = history.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
  history.unshift(trimmed);

  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  saveSearchHistory(history);
  renderSearchHistory();
}

function removeSearchHistory(query) {
  let history = getSearchHistory();
  history = history.filter(item => item !== query);
  saveSearchHistory(history);
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = document.getElementById("historyTags");
  if (!container) return;

  const history = getSearchHistory();

  if (history.length === 0) {
    container.innerHTML = `<span class="history-empty">Belum ada riwayat pencarian.</span>`;
    return;
  }

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  history.forEach(query => {
    const chip = document.createElement("span");
    chip.className = "history-tag";
    chip.dataset.query = query;

    const label = document.createElement("span");
    label.textContent = query;
    chip.appendChild(label);

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-history";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSearchHistory(query);
    });
    chip.appendChild(removeBtn);

    chip.addEventListener("click", () => {
      const searchInput = document.getElementById("searchInput");
      const searchBtn = document.getElementById("searchBtn");
      if (searchInput) searchInput.value = query;
      if (searchBtn) searchBtn.click();
    });

    fragment.appendChild(chip);
  });

  container.appendChild(fragment);
}

function exportSearchHistory() {
  const history = getSearchHistory();

  if (history.length === 0) {
    if (typeof showMessageModal === "function") {
      showMessageModal("Riwayat Kosong", "Belum ada riwayat pencarian untuk diekspor.");
    }
    return;
  }

  const payload = {
    app: "SwitchLens",
    exportedAt: new Date().toISOString(),
    history
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `switchlens-history-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importSearchHistoryFromFile(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const importedHistory = Array.isArray(parsed) ? parsed : parsed.history;

      if (!Array.isArray(importedHistory)) {
        throw new Error("Format file tidak valid.");
      }

      let current = getSearchHistory();

      importedHistory.forEach(query => {
        if (typeof query === "string" && query.trim()) {
          current = current.filter(item => item.toLowerCase() !== query.toLowerCase());
          current.unshift(query.trim());
        }
      });

      if (current.length > MAX_HISTORY_ITEMS) {
        current = current.slice(0, MAX_HISTORY_ITEMS);
      }

      saveSearchHistory(current);
      renderSearchHistory();

      if (typeof showMessageModal === "function") {
        showMessageModal("Berhasil", "Riwayat pencarian berhasil diimpor.");
      }
    } catch (err) {
      console.error("Gagal impor riwayat:", err);
      if (typeof showMessageModal === "function") {
        showMessageModal("Gagal", "File tidak valid atau rusak. Pastikan file adalah hasil export SwitchLens.");
      }
    }
  };

  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  renderSearchHistory();

  const exportBtn = document.getElementById("exportHistoryBtn");
  const importBtn = document.getElementById("importHistoryBtn");
  const importFileInput = document.getElementById("importHistoryFile");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportSearchHistory);
  }

  if (importBtn && importFileInput) {
    importBtn.addEventListener("click", () => importFileInput.click());

    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importSearchHistoryFromFile(file);
      importFileInput.value = "";
    });
  }

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      addSearchHistory(searchInput.value);
    });
  }
});
