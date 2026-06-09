// ============================================================
// PROTEKSI HALAMAN ADMIN — cek session dari localStorage
// ============================================================
const sessionRaw = localStorage.getItem("user_logged_in");

if (!sessionRaw) {
  // Belum login sama sekali → tendang ke halaman login
  alert("Akses ditolak! Silakan login terlebih dahulu.");
  window.location.href = "../Login/login.html";
} else {
  const dataUser = JSON.parse(sessionRaw);

  if (dataUser.role !== "admin") {
    // Role bukan admin → tidak boleh masuk halaman ini
    alert("Anda tidak memiliki akses ke halaman Admin!");
    window.location.href = "../Dashboard/dashboard.html";
  }
}

// ============================================================
// HANDLER SETELAH DOM SIAP
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  const dataUser = JSON.parse(localStorage.getItem("user_logged_in"));

  // Tampilkan nama admin yang sedang login (jika ada elemennya di HTML)
  const elNama = document.getElementById("nama-user");
  if (elNama) elNama.innerText = dataUser.username;

  // ---- Tombol Logout ----
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      // Hapus sesi dari localStorage
      localStorage.removeItem("user_logged_in");

      // WAJIB ?from=logout agar login.js tidak auto-forward balik ke sini
      window.location.href = "../../Index Utama/index.html?from=logout";
    });
  }
});
