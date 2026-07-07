document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.feature-card');
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.6s ease-out";
    observer.observe(card);
  });
});

    document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("landingTokenModal");
    const openBtn = document.getElementById("openTokenModalBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const saveBtn = document.getElementById("saveToken");
    const pexelsInput = document.getElementById("tokenInputPexels");
    const pixabayInput = document.getElementById("tokenInputPixabay");

    function loadSavedTokens() {
        pexelsInput.value = localStorage.getItem("pexels_token") || "";
        pixabayInput.value = localStorage.getItem("pixabay_token") || "";
    }

    openBtn.addEventListener("click", () => {
        loadSavedTokens();
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    saveBtn.addEventListener("click", () => {
        const pexelsVal = pexelsInput.value.trim();
        const pixabayVal = pixabayInput.value.trim();

        if (!pexelsVal && !pixabayVal) {
            alert("Mohon masukkan minimal salah satu token!");
            return;
        }

        if (pexelsVal) localStorage.setItem("pexels_token", pexelsVal);
        else localStorage.removeItem("pexels_token");

        if (pixabayVal) localStorage.setItem("pixabay_token", pixabayVal);
        else localStorage.removeItem("pixabay_token");

        alert("Token berhasil disimpan! Silakan masuk ke dashboard utama.");
        modal.style.display = "none";
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