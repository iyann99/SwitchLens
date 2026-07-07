document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("sliderTrack");
  const viewport = document.querySelector(".slider-viewport");
  const dots = document.querySelectorAll(".slide-dot");

  if (!track || !viewport) return;

  let currentSlide = 0;
  const totalSlides = track.children.length;

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    track.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goToSlide(i));
  });

  viewport.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    track.classList.add("dragging");
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const baseOffset = -currentSlide * (100 / totalSlides);
    const dragOffsetPercent = (diff / viewport.offsetWidth) * (100 / totalSlides);
    track.style.transform = `translateX(${baseOffset + dragOffsetPercent}%)`;
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("dragging");

    const diff = currentX - startX;
    const threshold = viewport.offsetWidth * 0.15;

    if (diff > threshold && currentSlide > 0) {
      goToSlide(currentSlide - 1);
    } else if (diff < -threshold && currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    } else {
      goToSlide(currentSlide);
    }

    startX = 0;
    currentX = 0;
  });
  
  goToSlide(0);
});
