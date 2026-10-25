document.addEventListener("DOMContentLoaded", () => {
    const floatingWrapper = document.getElementById("floatingSearchWrapper");
    const floatingInput = document.getElementById("floatingSearchInput");
    const floatingBtn = document.getElementById("floatingSearchBtn");
    const menuBarSearchInput = document.getElementById("searchInput");
    const menuBarSearchBtn = document.getElementById("searchBtn");
    const menuBarSearchWrapper = document.querySelector("#menuBar .search-wrapper");
    const menuBtn = document.getElementById("menuBtn");
    const menuBar = document.getElementById("menuBar");

    if (!floatingWrapper || !floatingInput || !floatingBtn) return;

    function triggerSearchFromFloating() {
        const query = floatingInput.value.trim();
        if (!query) return;

        if (menuBarSearchInput) {
            menuBarSearchInput.value = query;
        }

        if (menuBarSearchBtn) {
            menuBarSearchBtn.click();
        }
    }

    floatingBtn.addEventListener("click", triggerSearchFromFloating);

    floatingInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            triggerSearchFromFloating();
        }
    });

    if (menuBarSearchInput) {
        menuBarSearchInput.addEventListener("input", () => {
            floatingInput.value = menuBarSearchInput.value;
        });
    }

    if (menuBarSearchWrapper) {
        menuBarSearchWrapper.classList.add("hidden-by-floating");
    }

    if (menuBtn && menuBar && menuBarSearchWrapper) {
        menuBtn.addEventListener("click", () => {
            requestAnimationFrame(() => {
                const isOpen = menuBar.classList.contains("show");
                floatingWrapper.classList.toggle("hidden", isOpen);
                menuBarSearchWrapper.classList.toggle("hidden-by-floating", !isOpen);
            });
        });
    }
});
