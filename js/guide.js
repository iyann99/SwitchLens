document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.guide-img').forEach(img => {
        img.addEventListener('error', function onImgError() {
            this.removeEventListener('error', onImgError);
            this.src = 'assets/no-image.jpg';
        });
    });

    const sliders = document.querySelectorAll('.screenshot-slider');
    
    let lightbox = document.getElementById('guideLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'guideLightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 41, 30, 0.9);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        lightbox.innerHTML = `
            <span id="closeGuideLightbox" style="position: absolute; top: 20px; right: 30px; color: white; font-size: 2.5rem; font-weight: bold; cursor: pointer; user-select: none;">&times;</span>
            <img id="guideLightboxImg" src="" alt="" style="max-width: 90%; max-height: 85vh; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.3s ease;">
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = document.getElementById('guideLightboxImg');
    const closeBtn = document.getElementById('closeGuideLightbox');

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.style.opacity = '1';
        lightbox.style.pointerEvents = 'auto';
        lightboxImg.style.transform = 'scale(1)';
    }

    function closeLightbox() {
        lightbox.style.opacity = '0';
        lightbox.style.pointerEvents = 'none';
        lightboxImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
    
    sliders.forEach(slider => {
        let isDown = false;
        let startX, startY;
        let scrollLeft;
        let moved = false;

        slider.querySelectorAll('img').forEach(img => {
            img.style.pointerEvents = 'auto';
            img.style.userSelect = 'none';
        });

        slider.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            moved = false;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', (e) => {
            isDown = false;
            slider.style.cursor = 'grab';
            
            if (!moved && e.target.tagName === 'IMG') {
                openLightbox(e.target.src, e.target.alt);
            }
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            const walkX = (x - startX) * 1.5;
            
            if (Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5) {
                moved = true;
            }
            
            if (moved) {
                e.preventDefault();
                slider.scrollLeft = scrollLeft - walkX;
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(section => {
        observer.observe(section);
    });
});