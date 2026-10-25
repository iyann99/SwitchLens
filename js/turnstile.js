/**
 * Cloudflare Turnstile — pemuat widget yang tahan banting.
 *
 * Mengapa explicit render (bukan <div class="cf-turnstile"> otomatis):
 *  - Widget bawaan mencoba ulang tanpa batas saat error, sehingga terlihat
 *    "restart sendiri, putih, error lagi" dan penyebabnya tidak pernah tampil.
 *  - Di sini kode error ditampilkan ke pengguna, percobaan ulang otomatis
 *    dibatasi, dan error konfigurasi (domain belum didaftarkan) TIDAK diulang
 *    karena mengulang tidak akan pernah menyelesaikannya.
 *
 * Sitekey dibaca dari atribut data-sitekey pada #turnstileWidget.
 * auth.js tetap memakai turnstile.getResponse() / turnstile.reset() seperti
 * sebelumnya (hanya ada satu widget per halaman).
 */
(function () {
  "use strict";

  var MAX_AUTO_RETRIES = 2;
  var RETRY_DELAY_MS = 1500;
  var API_WAIT_TIMEOUT_MS = 15000;
  var API_POLL_MS = 100;

  // Error yang disebabkan konfigurasi sitekey/domain — mengulang percuma.
  var CONFIG_ERRORS = /^(110[0-9]{3}|400[0-9]{3}|600010)$/;

  var container = document.getElementById("turnstileWidget");
  var statusBox = document.getElementById("turnstileStatus");
  if (!container) return;

  var siteKey = container.getAttribute("data-sitekey");
  var widgetId = null;
  var autoRetries = 0;
  var retryTimer = null;

  function logError(message, detail) {
    if (window.console && console.error) console.error("[Turnstile] " + message, detail || "");
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.hidden = true;
    statusBox.textContent = "";
  }

  function showStatus(message, withRetryButton) {
    if (!statusBox) return;
    statusBox.textContent = message + " ";
    if (withRetryButton) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "turnstile-retry";
      btn.textContent = "Coba lagi";
      btn.addEventListener("click", function () {
        autoRetries = 0;
        clearStatus();
        resetWidget();
      });
      statusBox.appendChild(btn);
    }
    statusBox.hidden = false;
  }

  function resetWidget() {
    if (widgetId === null || !window.turnstile) return;
    try {
      window.turnstile.reset(widgetId);
    } catch (err) {
      logError("reset gagal", err);
    }
  }

  function describeError(code) {
    var suffix = code ? " (kode " + code + ")" : "";
    if (CONFIG_ERRORS.test(String(code))) {
      return "Verifikasi keamanan belum dikonfigurasi untuk domain ini" + suffix +
        ". Hubungi admin situs.";
    }
    return "Verifikasi keamanan gagal dimuat" + suffix +
      ". Coba matikan VPN/pemblokir iklan/mode hemat data, lalu ulangi.";
  }

  function onError(code) {
    logError("error widget", code);

    if (CONFIG_ERRORS.test(String(code))) {
      showStatus(describeError(code), false);
      return true; // ditangani; hentikan retry otomatis bawaan
    }

    if (autoRetries < MAX_AUTO_RETRIES) {
      autoRetries += 1;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(resetWidget, RETRY_DELAY_MS * autoRetries);
      showStatus("Memuat ulang verifikasi keamanan (" + autoRetries + "/" + MAX_AUTO_RETRIES + ")...", false);
      return true;
    }

    showStatus(describeError(code), true);
    return true;
  }

  function renderWidget() {
    try {
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        theme: container.getAttribute("data-theme") || "light",
        retry: "never",               // retry dikendalikan oleh onError di atas
        "refresh-expired": "auto",
        callback: function () {
          autoRetries = 0;
          clearStatus();
        },
        "error-callback": onError,
        "expired-callback": function () { /* refresh-expired menangani */ },
        "timeout-callback": function () { onError("timeout"); }
      });
    } catch (err) {
      logError("render gagal", err);
      showStatus("Verifikasi keamanan tidak dapat ditampilkan.", true);
    }
  }

  function waitForApi() {
    var waited = 0;
    var timer = setInterval(function () {
      if (window.turnstile && typeof window.turnstile.render === "function") {
        clearInterval(timer);
        renderWidget();
        return;
      }
      waited += API_POLL_MS;
      if (waited >= API_WAIT_TIMEOUT_MS) {
        clearInterval(timer);
        logError("api.js tidak termuat (kemungkinan diblokir jaringan/ad-blocker/CSP)");
        showStatus(
          "Skrip verifikasi keamanan tidak termuat. Matikan pemblokir iklan/VPN lalu muat ulang halaman.",
          false
        );
      }
    }, API_POLL_MS);
  }

  if (!siteKey) {
    logError("data-sitekey tidak ditemukan");
    showStatus("Konfigurasi verifikasi keamanan tidak lengkap.", false);
    return;
  }

  waitForApi();
})();
