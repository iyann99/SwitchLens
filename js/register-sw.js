if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW terdaftar'))
      .catch(err => console.error('SW gagal daftar:', err));
  });
}
