// daftar_pinjam.js — Riwayat Peminjaman User (VIEW ONLY)
//
// Halaman ini hanya menampilkan daftar peminjaman user yang sedang login.
// User TIDAK bisa membuat peminjaman baru dari sini.
// Semua pinjaman dibuat via halaman Daftar Buku → detail_pinjam.html.
//
// FIX: Auth guard menggunakan DOM injection (bukan redirect) untuk mencegah
// infinite loop saat halaman dibuka langsung via Live Server / file path lokal.

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tableReservasiBody");

  // ── Auth guard: DOM injection, BUKAN window.location.href ─────────────────
  const sessionRaw = localStorage.getItem("user_logged_in");

  if (!sessionRaw) {
    if (tbody) {
      tbody.innerHTML = `
                <tr><td colspan="7" class="text-center py-5">
                    <div class="alert alert-warning d-inline-block mb-0">
                        <i class="fas fa-lock me-2"></i>
                        Silakan <a href="../../Login/login.html" class="alert-link">Login</a>
                        untuk melihat riwayat peminjaman.
                    </div>
                </td></tr>`;
    }
    return; // Hentikan di sini — tidak ada redirect = tidak ada loop
  }

  let dataUser;
  try {
    dataUser = JSON.parse(sessionRaw);
  } catch (_) {
    localStorage.removeItem("user_logged_in");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
                Sesi rusak. Silakan login ulang.
            </td></tr>`;
    }
    return;
  }

  // Tampilkan nama user
  const elUsername = document.getElementById("usernameDisplay");
  if (elUsername) elUsername.innerText = dataUser.username || "User";

  // Muat data reservasi user ini
  const userID = dataUser.userID || dataUser.id;
  if (!userID) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ID pengguna tidak ditemukan dalam sesi. Silakan login ulang.
            </td></tr>`;
    }
    return;
  }

  loadReservasiUser(userID);

  // Logout
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Apakah Anda yakin ingin logout?")) {
        localStorage.clear();
        window.location.href = "../../Login/login.html";
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ambil dan render riwayat reservasi milik user
// GET /api/reservasi/user/{userID}
// ─────────────────────────────────────────────────────────────────────────────
async function loadReservasiUser(userID) {
  const tbody = document.getElementById("tableReservasiBody");
  if (!tbody) return;

  try {
    const response = await fetch(`${API_BASE}/reservasi/user/${userID}`);

    if (!response.ok) {
      tbody.innerHTML = `
                <tr><td colspan="7" class="text-center py-4">
                    <div class="alert alert-warning d-inline-block mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Server merespons dengan status <strong>${response.status}</strong>.
                        Periksa API backend.
                    </div>
                </td></tr>`;
      return;
    }

    const result = await response.json();

    let data = Array.isArray(result)
      ? result
      : result.data && Array.isArray(result.data)
        ? result.data
        : [];

    if (data.length === 0) {
      tbody.innerHTML = `
                <tr><td colspan="7" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox me-2"></i>
                    Anda belum memiliki riwayat reservasi buku.<br>
                    <a href="dashboard.html" class="btn btn-success btn-sm mt-3">
                        <i class="fas fa-book me-1"></i>Telusuri Buku
                    </a>
                </td></tr>`;
      return;
    }

    let html = "";
    data.forEach((item, index) => {
      // Cover buku
      const cover =
        item.cover && item.cover !== "default.jpg"
          ? `http://localhost:8080/uploads/cover/${item.cover}`
          : "../../images/a.png";

      // ── Badge status ──────────────────────────────────────────────────
      const statusKey = (item.status_reservasi || "").toLowerCase();
      let statusBadge;
      switch (statusKey) {
        case "pending":
          statusBadge =
            '<span class="badge-pending">Pending</span>';
          break;

        case "approved":
          statusBadge =
            '<span class="badge-dipinjam">Approved</span>';
          break;

        case "cancelled":
          statusBadge =
            '<span class="badge-ditolak">Cancelled</span>';
          break;

        case "complete":
          statusBadge =
            '<span class="badge-dikembalikan">Complete</span>';
          break;

        default:
          statusBadge =
            '<span class="badge bg-secondary">Unknown</span>';
      }

      // ── Kolom Harga/Denda ─────────────────────────────────────────────
      // Pending = belum ada harga (admin yang tentukan saat approve)
      // let dendaHtml;
      // if (statusKey === "pending") {
      //   dendaHtml =
      //     '<em class="text-warning fw-semibold"><i class="fas fa-hourglass-half me-1"></i>Menunggu Admin</em>';
      // } else if (statusKey === "ditolak") {
      //   dendaHtml = '<span class="text-muted">—</span>';
      // } else {
      //   const nominal = parseFloat(item.total_denda) || 0;
      //   dendaHtml =
      //     nominal > 0
      //       ? `<span class="text-danger fw-bold">Rp ${nominal.toLocaleString("id-ID")}</span>`
      //       : '<span class="text-muted">Rp 0</span>';
      // }

      html += `
<tr class="text-center align-middle">
    <td>${index + 1}</td>

    <td>
        <img
            src="${cover}"
            style="width:50px;height:70px;object-fit:cover;border-radius:4px;"
            onerror="this.src='../../images/a.png'"
        >
    </td>

    <td class="text-start">
        ${item.judul_buku || "-"}
    </td>

    <td>
        ${formatTgl(item.tgl_reservasi)}
    </td>

    <td>
        ${formatTgl(item.expired_at)}
    </td>

    <td>
        ${statusBadge}
    </td>
</tr>
`;
    });

    tbody.innerHTML = html;

    // Init DataTables — terpisah agar error DT tidak menghapus data yang sudah dirender
    initDT();
  } catch (err) {
    // Network error — DOM injection, TIDAK ada reload/redirect
    console.error("loadReservasiUser error:", err);
    tbody.innerHTML = `
            <tr><td colspan="7" class="text-center py-5">
                <div class="alert alert-danger d-inline-block text-start mb-0" style="max-width:420px;">
                    <i class="fas fa-plug me-2"></i>
                    <strong>Gagal terhubung ke server API.</strong><br>
                    <small class="text-muted">Pastikan backend CI4 berjalan di
                    <code>${API_BASE}</code></small>
                </div>
            </td></tr>`;
  }
}

function formatTgl(str) {
  if (!str) return "-";
  const d = new Date(str);
  return isNaN(d)
    ? str
    : d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
}

function initDT() {
  if (typeof $ === "undefined" || !$.fn || !$.fn.DataTable) return;
  try {
    if ($.fn.DataTable.isDataTable("#dataTable"))
      $("#dataTable").DataTable().destroy();
    $("#dataTable").DataTable({
      order: [[0, "desc"]],
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ data",
        info: "Menampilkan _START_–_END_ dari _TOTAL_ entri",
        paginate: { previous: "Sebelumnya", next: "Berikutnya" },
        emptyTable: "Tidak ada data peminjaman.",
      },
    });
  } catch (e) {
    console.warn("DataTables init gagal (data tetap tampil):", e.message);
  }
}
