// peminjaman.js — Admin Manajemen Peminjaman (Fapus)
//
// FIX INFINITE LOOP:
// Auth guard TIDAK menggunakan window.location.href.
// Redirect-based guard menyebabkan infinite loop saat halaman dibuka
// langsung via Live Server atau path file lokal (misalnya, sesi kosong →
// redirect ke login.html → login.html redirect balik → loop).
// SOLUSI: Inject pesan error ke DOM dan hentikan eksekusi dengan return.

const API_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tablePeminjamanBody");

  // ── 1. AUTH GUARD — DOM injection, BUKAN window.location.href ─────────────
  const sessionRaw = localStorage.getItem("user_logged_in");

  if (!sessionRaw) {
    if (tbody) {
      tbody.innerHTML = `
                <tr><td colspan="9" class="text-center py-5">
                    <div class="alert alert-warning d-inline-block mb-0">
                        <i class="fas fa-lock me-2"></i>
                        <strong>Sesi tidak ditemukan.</strong>
                        Silakan <a href="../../Login/login.html" class="alert-link">Login</a> terlebih dahulu.
                    </div>
                </td></tr>`;
    }
    return; // ← Hentikan di sini. Tidak ada redirect = tidak ada loop.
  }

  let dataUser;
  try {
    dataUser = JSON.parse(sessionRaw);
  } catch (_) {
    localStorage.removeItem("user_logged_in");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Data sesi rusak. Hapus cache browser dan login ulang.
            </td></tr>`;
    }
    return;
  }

  if (dataUser.role !== "admin") {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">
                <i class="fas fa-ban me-2"></i>
                Akses ditolak: halaman ini hanya untuk Admin.
            </td></tr>`;
    }
    return;
  }

  // ── 2. Tampilkan nama admin ────────────────────────────────────────────────
  const username = dataUser.username || "Admin";
  const elDropdown = document.getElementById("sessUsernameDropdown");
  const elDisplay = document.getElementById("usernameDisplay");
  if (elDropdown) elDropdown.innerText = `Halo, ${username}`;
  if (elDisplay) elDisplay.innerText = username;

  // ── 3. Muat data tabel ─────────────────────────────────────────────────────
  loadPeminjaman();

  // ── 4. Logout ──────────────────────────────────────────────────────────────
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = "../../Index Utama/index.html";
      }
    });
  }

  // ── 5. Tambah Peminjaman Manual ────────────────────────────────────────────
  loadDropdownUsers();
  loadDropdownBuku();

  const formManual = document.getElementById("formTambahPeminjaman");
  if (formManual) {
    formManual.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      const payload = {
        userID: document.getElementById("addManualUser").value,
        bukuID: document.getElementById("addManualBuku").value,
        batas_kembali: document.getElementById("addManualBatas").value
      };

      try {
        const res = await fetch(`${API_URL}/peminjaman/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (res.ok) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: result.pesan || "Peminjaman manual berhasil ditambahkan.",
            timer: 2000,
            showConfirmButton: false
          });
          const modalEl = document.getElementById("modalTambahPeminjaman");
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          formManual.reset();
          loadPeminjaman();
        } else {
          Swal.fire("Gagal!", result.pesan || "Terjadi kesalahan.", "error");
        }
      } catch (err) {
        Swal.fire("Error!", "Gagal terhubung ke server.", "error");
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH DATA DROPDOWN MANUAL
// ─────────────────────────────────────────────────────────────────────────────
async function loadDropdownUsers() {
  try {
    const res = await fetch(`${API_URL}/pengguna`);
    const data = await res.json();
    const select = document.getElementById("addManualUser");
    if (!select) return;

    let html = '<option selected disabled value="">Pilih Anggota</option>';
    const users = Array.isArray(data) ? data : (data.data || []);
    users.forEach(u => {
      if (u.role !== 'admin') {
        html += `<option value="${u.userID || u.id_pengguna}">${u.username} (${u.nomor_identitas || '-'})</option>`;
      }
    });
    select.innerHTML = html;
  } catch (err) {
    console.error("Gagal memuat daftar pengguna:", err);
  }
}

async function loadDropdownBuku() {
  try {
    const res = await fetch(`${API_URL}/buku`);
    const result = await res.json();
    const select = document.getElementById("addManualBuku");
    if (!select) return;

    const books = Array.isArray(result) ? result : (result.data || []);
    let html = '<option selected disabled value="">Pilih Buku</option>';
    books.forEach(b => {
      const avail = b.avail_copy || 0;
      html += `<option value="${b.id_buku}" ${avail <= 0 ? 'disabled' : ''}>${b.judul} (Tersedia: ${avail})</option>`;
    });
    select.innerHTML = html;
  } catch (err) {
    console.error("Gagal memuat daftar buku:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatTanggal(str) {
  if (!str) return "-";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRupiah(n) {
  const val = parseFloat(n) || 0;
  return val > 0 ? "Rp " + val.toLocaleString("id-ID") : "-";
}

// ─────────────────────────────────────────────────────────────────────────────
// DataTables — inisialisasi aman di luar try/catch fetch utama.
// Error DataTables tidak akan pernah menghapus data yang sudah dirender.
// ─────────────────────────────────────────────────────────────────────────────
function initDataTable() {
  if (typeof $ === "undefined" || !$.fn || !$.fn.DataTable) {
    console.warn("DataTables tidak tersedia; tabel tampil tanpa paginasi.");
    return;
  }
  try {
    if ($.fn.DataTable.isDataTable("#dataTable"))
      $("#dataTable").DataTable().destroy();
    $("#dataTable").DataTable({
      order: [[0, "desc"]],
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ data",
        info: "Menampilkan _START_–_END_ dari _TOTAL_ entri",
        paginate: {
          first: "Awal",
          last: "Akhir",
          next: "Lanjut",
          previous: "Mundur",
        },
        emptyTable: "Belum ada data peminjaman.",
      },
    });
  } catch (e) {
    console.warn("DataTables init gagal (data tetap ditampilkan):", e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD PEMINJAMAN — GET /api/peminjaman
// ─────────────────────────────────────────────────────────────────────────────
async function loadPeminjaman() {
  const tbody = document.getElementById("tablePeminjamanBody");
  if (!tbody) return;

  tbody.innerHTML = `
        <tr><td colspan="9" class="text-center py-4" style="color:#6b7280;">
            <i class="fas fa-spinner fa-spin me-2"></i> Memuat data peminjaman...
        </td></tr>`;

  let data = [];

  try {
    const response = await fetch(`${API_URL}/peminjaman`);

    if (!response.ok) {
      // Server error (4xx/5xx) — tampilkan status code, JANGAN reload
      tbody.innerHTML = `
                <tr><td colspan="9" class="text-center py-4">
                    <div class="alert alert-warning d-inline-block mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Server merespons dengan status <strong>${response.status}</strong>.
                        Periksa API backend.
                    </div>
                </td></tr>`;
      return;
    }

    const result = await response.json();
    data = Array.isArray(result)
      ? result
      : result.data && Array.isArray(result.data)
        ? result.data
        : [];
  } catch (err) {
    // Network error / JSON parse error — DOM injection, TIDAK ada reload/redirect
    console.error("loadPeminjaman fetch error:", err);
    tbody.innerHTML = `
            <tr><td colspan="9" class="text-center py-5">
                <div class="alert alert-danger d-inline-block text-start mb-0" style="max-width:460px;">
                    <i class="fas fa-plug me-2"></i>
                    <strong>Gagal terhubung ke server API.</strong><br>
                    <small class="text-muted">Pastikan server CI4 berjalan di
                    <code>${API_URL}</code> dan CORS aktif.</small>
                </div>
            </td></tr>`;
    return;
  }

  if (data.length === 0) {
    tbody.innerHTML = "";
    initDataTable();
    return;
  }

  const statusMap = {
    pending:
      '<span class="badge-status badge-pending"><i class="fas fa-clock me-1"></i>Pending</span>',
    dipinjam:
      '<span class="badge-status badge-borrowed"><i class="fas fa-book-open me-1"></i>Dipinjam</span>',
    dikembalikan:
      '<span class="badge-status badge-returned"><i class="fas fa-check me-1"></i>Dikembalikan</span>',
    ditolak:
      '<span class="badge-status badge-ditolak"><i class="fas fa-times me-1"></i>Ditolak</span>',
    late: '<span class="badge-status badge-late"><i class="fas fa-exclamation me-1"></i>Terlambat</span>',
  };

  let html = "";
  data.forEach((item, i) => {
    const cover =
      item.cover_buku && item.cover_buku !== "default.jpg"
        ? `http://localhost:8080/uploads/cover/${item.cover_buku}`
        : "../../images/a.png";

    const statusKey = (item.status || "").toLowerCase();
    const statusBadge =
      statusMap[statusKey] ||
      `<span class="badge-status badge-borrowed">${item.status || "-"}</span>`;

    let actionBtn = "";
    if (statusKey === "pending") {
      actionBtn = `
                <button class="btn-action btn-approve" onclick="approveItem(${item.pinjamID})" title="Setujui">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-reject" onclick="rejectItem(${item.pinjamID})" title="Tolak">
                    <i class="fas fa-times"></i>
                </button>`;
    } else if (statusKey === "dipinjam" || statusKey === "late") {
      actionBtn = `
                <button class="btn-action btn-kembali" onclick="prosesPengembalian(${item.pinjamID})" title="Kembalikan">
                    <i class="fas fa-undo"></i>
                </button>`;
    } else {
      actionBtn =
        '<span class="text-muted small"><i class="fas fa-check-double"></i></span>';
    }

    html += `
            <tr align="center">
                <td>${i + 1}</td>
                <td><img src="${cover}" class="cover-img" alt="Cover"
                         onerror="this.onerror=null;this.src='../../images/a.png'"></td>
                <td class="text-start fw-medium">${item.judul_buku || '<em class="text-muted">N/A</em>'}</td>
                <td>
                    <div class="fw-medium">${item.nama_user || "-"}</div>
                    <div class="text-muted small">${item.nomor_identitas || "-"}</div>
                </td>
                <td>${formatTanggal(item.tanggal_pinjam)}</td>
                <td>${formatTanggal(item.batas_kembali)}</td>
                <td class="text-danger fw-medium">${formatRupiah(item.total_denda)}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            </tr>`;
  });

  tbody.innerHTML = html;

  // DataTables SETELAH innerHTML diset — error DT tidak bisa menghapus data
  initDataTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE — PUT /api/peminjaman/{id}/approve
// ─────────────────────────────────────────────────────────────────────────────
async function approveItem(pinjamID) {
  const { isConfirmed } = await Swal.fire({
    title: "<strong>Setujui Peminjaman</strong>",
    html: `<p class="text-muted">Transaksi <strong>#${pinjamID}</strong></p>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-check me-1"></i> Setujui',
    cancelButtonText: "Batal",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280"
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/peminjaman/${pinjamID}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();

    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "Disetujui!",
        text: result.pesan,
        timer: 2000,
        showConfirmButton: false,
      });
      loadPeminjaman();
    } else {
      Swal.fire(
        "Gagal!",
        result.messages?.error || result.pesan || "Terjadi kesalahan.",
        "error",
      );
    }
  } catch (_) {
    Swal.fire("Error!", "Kesalahan jaringan. Pastikan API berjalan.", "error");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REJECT — PUT /api/peminjaman/{id}/reject
// ─────────────────────────────────────────────────────────────────────────────
async function rejectItem(pinjamID) {
  const { isConfirmed } = await Swal.fire({
    title: "Tolak Peminjaman?",
    html: `<p class="text-muted">Transaksi <strong>#${pinjamID}</strong> akan ditolak.<br>Stok buku akan dipulihkan otomatis.</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-times me-1"></i> Ya, Tolak!',
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/peminjaman/${pinjamID}/reject`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "Ditolak!",
        text: result.pesan,
        timer: 2000,
        showConfirmButton: false,
      });
      loadPeminjaman();
    } else {
      Swal.fire(
        "Gagal!",
        result.messages?.error || result.pesan || "Terjadi kesalahan.",
        "error",
      );
    }
  } catch (_) {
    Swal.fire("Error!", "Kesalahan jaringan.", "error");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KEMBALIKAN — PUT /api/peminjaman/kembali/{id}
// ─────────────────────────────────────────────────────────────────────────────
async function prosesPengembalian(pinjamID) {
  const { isConfirmed } = await Swal.fire({
    title: "Proses Pengembalian?",
    text: `Konfirmasi pengembalian buku untuk transaksi #${pinjamID}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-undo me-1"></i> Kembalikan',
    cancelButtonText: "Batal",
    confirmButtonColor: "#3b82f6",
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/peminjaman/${pinjamID}/kembali`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const resultText = await res.json();
    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: resultText.pesan || "Buku berhasil dikembalikan.",
        timer: 3000,
        showConfirmButton: true,
      });
      loadPeminjaman();
    } else {
      const r = await res.json();
      Swal.fire("Gagal!", r.pesan || "Kesalahan server.", "error");
    }
  } catch (_) {
    Swal.fire("Error!", "Kesalahan jaringan.", "error");
  }
}
