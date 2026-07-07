const AUTH_STORAGE_KEY = "switchlens_session";

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(sessionData) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isLoggedIn() {
  const session = getSession();
  return !!(session && session.access_token);
}

function getAccessToken() {
  const session = getSession();
  return session ? session.access_token : null;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

function showAuthError(message) {
  const errorBox = document.getElementById("authError");
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = false;
  errorBox.classList.remove("auth-success");
}

function showRegisterSuccess(message) {
  const errorBox = document.getElementById("authError");
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = false;
  errorBox.classList.add("auth-success");
}

function hideAuthError() {
  const errorBox = document.getElementById("authError");
  if (!errorBox) return;
  errorBox.hidden = true;
  errorBox.classList.remove("auth-success");
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

document.addEventListener("DOMContentLoaded", () => {

  if (isLoggedIn() && (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html"))) {
    window.location.href = "home.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAuthError();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = document.getElementById("loginSubmit");

      if (!email || !password) {
        showAuthError("Email dan password wajib diisi.");
        return;
      }

      setButtonLoading(submitBtn, true, "Memproses...", "Masuk");

      try {
        const response = await fetch(`${WORKER_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
          showAuthError(data.message || "Gagal masuk. Periksa email dan password kamu.");
          setButtonLoading(submitBtn, false, "Memproses...", "Masuk");
          return;
        }

        saveSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user
        });

        window.location.href = "home.html";

      } catch (err) {
        showAuthError("Tidak bisa terhubung ke server. Periksa koneksi internet kamu.");
        setButtonLoading(submitBtn, false, "Memproses...", "Masuk");
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAuthError();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const passwordConfirm = document.getElementById("passwordConfirm").value;
      const submitBtn = document.getElementById("registerSubmit");

      if (!email || !password || !passwordConfirm) {
        showAuthError("Semua kolom wajib diisi.");
        return;
      }

      if (password.length < 6) {
        showAuthError("Password minimal 6 karakter.");
        return;
      }

      if (password !== passwordConfirm) {
        showAuthError("Konfirmasi password tidak cocok.");
        return;
      }

      setButtonLoading(submitBtn, true, "Memproses...", "Daftar");

      try {
        const response = await fetch(`${WORKER_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!data.success) {
          showAuthError(data.message || "Gagal mendaftar. Coba lagi.");
          setButtonLoading(submitBtn, false, "Memproses...", "Daftar");
          return;
        }

        window.location.href = "login.html?registered=1";

      } catch (err) {
        showAuthError("Tidak bisa terhubung ke server. Periksa koneksi internet kamu.");
        setButtonLoading(submitBtn, false, "Memproses...", "Daftar");
      }
    });
  }

});
