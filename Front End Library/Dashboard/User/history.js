// history.js — Riwayat Peminjaman User (Fapus)

const API_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  // ── Proteksi + Ambil Session ──────────────────────────────────────────────
  const sessionRaw = localStorage.getItem("user_logged_in");
  if (!sessionRaw) {
    alert("Sesi habis. Silakan login kembali.");
    window.location.href = "../../Login/login.html";
    return;
  }

  const dataUser = JSON.parse(sessionRaw);

  // Tampilkan nama user di header alert
  document.getElementById("usernameDisplay").innerText =
    dataUser.username || dataUser.nomor_identitas || "User";

  // Muat riwayat milik user yang sedang login
  const userID = dataUser.userID || dataUser.id;
  loadHistoryUser(userID);

  // ── Logout ────────────────────────────────────────────────────────────────
  document.getElementById("btnLogout").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.clear();
      window.location.href = "../../Login/login.html";
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ambil riwayat dari GET /api/peminjaman/user/{userID}
// ─────────────────────────────────────────────────────────────────────────────
async function loadHistoryUser(userID) {
  const tbody = document.getElementById("tablePeminjamanBody");
  if (!tbody) return;

  if (!userID) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-danger">User ID tidak ditemukan. Coba login ulang.</td></tr>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/peminjaman/user/${userID}`);
    const result = await response.json();

    let data = [];
    if (Array.isArray(result)) data = result;
    else if (result.data && Array.isArray(result.data)) data = result.data;

    data = data.filter(item => {
      const status = (item.status || "").toLowerCase();
      return status === "dikembalikan" || status === "ditolak" || status === "selesai";
    });

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-muted py-4">Belum ada riwayat peminjaman buku.</td></tr>';
      return;
    }

    let html = "";

    data.forEach((item, index) => {
      const coverSrc =
        item.cover_buku && item.cover_buku !== "default.jpg"
          ? `http://localhost:8080/uploads/cover/${item.cover_buku}`
          : "../../images/a.png";

      let badgeHtml = "";
      const status = (item.status || "").toLowerCase();
      if (status === "pending") {
        badgeHtml = '<span class="badge-status badge-pending"><i class="fas fa-clock me-1"></i>Menunggu</span>';
      } else if (status === "dipinjam") {
        badgeHtml = '<span class="badge-status badge-dipinjam"><i class="fas fa-book-open me-1"></i>Dipinjam</span>';
      } else if (status === "dikembalikan") {
        badgeHtml = '<span class="badge-status badge-dikembalikan"><i class="fas fa-check me-1"></i>Dikembalikan</span>';
      } else if (status === "ditolak") {
        badgeHtml = '<span class="badge-status badge-ditolak"><i class="fas fa-times me-1"></i>Ditolak</span>';
      } else {
        badgeHtml = `<span class="badge-status bg-secondary">${item.status || "-"}</span>`;
      }

      let dendaHtml = "";
      if (status === "pending") {
        dendaHtml = '<em class="text-warning small">Menunggu</em>';
      } else if (status === "ditolak") {
        dendaHtml = '<span class="text-muted small">-</span>';
      } else {
        const nominal = parseFloat(item.total_denda) || 0;
        dendaHtml = nominal > 0
            ? `<span class="text-danger fw-bold">Rp ${nominal.toLocaleString("id-ID")}</span>`
            : '<span class="text-success fw-bold">Gratis</span>';
      }

      const tglPinjam = formatTanggal(item.tanggal_pinjam);
      const batasKembali = formatTanggal(item.batas_kembali);

      html += `
            <tr align="center">
                <td>${index + 1}</td>
                <td><img src="${coverSrc}" alt="Cover" style="height: 70px; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null;this.src='../../images/a.png'"></td>
                <td class="text-start fw-medium">${item.judul_buku || "-"}</td>
                <td>${tglPinjam}</td>
                <td>${batasKembali}</td>
                <td>${dendaHtml}</td>
                <td>${badgeHtml}</td>
            </tr>`;
    });

    tbody.innerHTML = html;

    // Initialize DataTables
    if (typeof $ !== "undefined" && $.fn.DataTable) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }
      $("#dataTable").DataTable({
        order: [[0, "desc"]],
        language: {
          search: "Cari:",
          lengthMenu: "Tampilkan _MENU_ entri",
          info: "Menampilkan _START_–_END_ dari _TOTAL_ entri",
          paginate: {
            first: "Awal",
            last: "Akhir",
            next: "Lanjut",
            previous: "Mundur",
          },
          emptyTable: "Belum ada riwayat peminjaman.",
        },
      });
    }

  } catch (error) {
    console.error("Error memuat riwayat:", error);
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-danger">Gagal memuat data. Pastikan server API berjalan.</td></tr>';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format YYYY-MM-DD HH:MM:SS → DD/MM/YYYY
// ─────────────────────────────────────────────────────────────────────────────
function formatTanggal(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
