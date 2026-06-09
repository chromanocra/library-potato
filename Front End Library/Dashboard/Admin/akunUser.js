// akunUser.js — Admin: Manajemen Data Anggota

const API_URL = "http://localhost:8080/api";
let dataMemberGlobal = [];
let currentEditUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  initHalaman();
  loadMember();

  // ── Submit Edit Member ─────────────────────────────────────────────────────
  const formEditMember = document.getElementById("formEditMember");
  if (formEditMember) {
    formEditMember.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!currentEditUserId) {
        alert("Gagal: ID User tidak ditemukan.");
        return;
      }

      const elNama = document.getElementById("editNama");
      const elPassword = document.getElementById("editPassword");
      const elEmail =
        document.getElementById("editEmail") ||
        document.getElementById("editKelas");
      const elPhone =
        document.getElementById("editPhone") ||
        document.getElementById("editJurusan");
      const elGender =
        document.getElementById("editGender") ||
        document.getElementById("editAlamat");

      const btnSubmit = this.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Menyimpan...';

      const payload = {
        username: elNama ? elNama.value : "",
        password: elPassword ? elPassword.value : "",
        email: elEmail ? elEmail.value : "",
        phone: elPhone ? elPhone.value : "",
        gender: elGender ? elGender.value : "",
      };

      try {
        const response = await fetch(
          `${API_URL}/pengguna/${currentEditUserId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          const modalEl = document.getElementById("modalEditMember");
          const modal =
            bootstrap.Modal.getInstance(modalEl) ||
            new bootstrap.Modal(modalEl);
          modal.hide();
          loadMember();
          alert("Data member berhasil diupdate!");
        } else {
          const result = await response.json();
          alert("Gagal: " + (result.pesan || "Terjadi kesalahan pada server."));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Terjadi kesalahan jaringan.");
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML =
          '<i class="fas fa-save me-2"></i>Simpan Perubahan';
      }
    });
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Apakah Anda yakin ingin keluar?")) {
        localStorage.clear();
        window.location.href = "../../Index Utama/index.html";
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
function initHalaman() {
  const sessionRaw = localStorage.getItem("user_logged_in");
  let username = "AdminFapus";
  if (sessionRaw) {
    try {
      username = JSON.parse(sessionRaw).username || username;
    } catch (_) {}
  }
  const elDropdown = document.getElementById("sessUsernameDropdown");
  if (elDropdown) elDropdown.innerText = `Halo, ${username}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAD MEMBER — GET /api/pengguna
// ─────────────────────────────────────────────────────────────────────────────
async function loadMember() {
  const tbody = document.getElementById("tableMemberBody");
  if (!tbody) return;

  try {
    const response = await fetch(`${API_URL}/pengguna`);
    const result = await response.json();

    let data = [];
    if (Array.isArray(result)) data = result;
    else if (result.data && Array.isArray(result.data)) data = result.data;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:30px;">Belum ada data member.</td></tr>`;
      return;
    }

    dataMemberGlobal = data;
    let html = "";

    data.forEach((item, index) => {
      // ── Status badge ──────────────────────────────────────────────────
      const isSuspended = item.status === "suspended";
      const statusBadge = isSuspended
        ? '<span class="badge-akun-suspended"><i class="fas fa-user-slash me-1"></i>Dinonaktifkan</span>'
        : '<span class="badge-akun-aktif"><i class="fas fa-user-check me-1"></i>Aktif</span>';

      // ── Suspend / Unsuspend button ────────────────────────────────────
      const suspendLabel = isSuspended ? "Aktifkan" : "Suspend";
      const suspendClass = isSuspended ? "btn-unsuspend" : "btn-suspend";
      const suspendIcon = isSuspended ? "fa-user-check" : "fa-user-slash";
      const suspendBtn = `
                <button class="btn-action ${suspendClass}"
                        onclick="toggleSuspendMember('${item.userID}', '${item.status || "active"}', '${item.username}')"
                        title="${suspendLabel} Akun">
                    <i class="fas ${suspendIcon}"></i>
                </button>`;

      html += `
                <tr>
                    <td align="center">${index + 1}</td>
                    <td>${item.nomor_identitas || "-"}</td>
                    <td>${item.username || "-"}</td>
                    <td>${item.email || "-"}</td>
                    <td>${item.phone || "-"}</td>
                    <td>${item.gender || "-"}</td>
                    <td align="center">${statusBadge}</td>
                    <td align="center" style="white-space:nowrap;">
                        <button class="btn-action btn-edit"
                                onclick="bukaModalEdit('${item.userID}')"
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete"
                                onclick="hapusMember('${item.userID}', '${item.username}')"
                                title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${suspendBtn}
                    </td>
                </tr>`;
    });

    tbody.innerHTML = html;

    // DataTables (aman, terpisah dari try/catch fetch)
    if (typeof $ !== "undefined" && $.fn && $.fn.DataTable) {
      try {
        if ($.fn.DataTable.isDataTable("#dataTable"))
          $("#dataTable").DataTable().destroy();
        $("#dataTable").DataTable({
          language: {
            search: "Cari Anggota:",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_–_END_ dari _TOTAL_ anggota",
            paginate: { previous: "Sebelumnya", next: "Berikutnya" },
          },
        });
      } catch (e) {
        console.warn("DataTables init gagal:", e.message);
      }
    }
  } catch (err) {
    console.error("Error memuat member:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">
            <i class="fas fa-plug me-2"></i>Gagal memuat data dari server. Pastikan API berjalan.
        </td></tr>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUKA MODAL EDIT
// ─────────────────────────────────────────────────────────────────────────────
function bukaModalEdit(userID) {
  const member = dataMemberGlobal.find((m) => m.userID == userID);
  if (!member) return;

  currentEditUserId = member.userID;

  const titleEl = document.getElementById("titleEditNama");
  if (titleEl) titleEl.innerText = member.username;

  if (document.getElementById("editNisn"))
    document.getElementById("editNisn").value = member.nomor_identitas || "";
  if (document.getElementById("editNama"))
    document.getElementById("editNama").value = member.username || "";
  if (document.getElementById("editPassword"))
    document.getElementById("editPassword").value = "";

  const elEmail =
    document.getElementById("editEmail") ||
    document.getElementById("editKelas");
  const elPhone =
    document.getElementById("editPhone") ||
    document.getElementById("editJurusan");
  const elGender =
    document.getElementById("editGender") ||
    document.getElementById("editAlamat");
  if (elEmail) elEmail.value = member.email || "";
  if (elPhone) elPhone.value = member.phone || "";
  if (elGender) elGender.value = member.gender || "";

  const modalEl = document.getElementById("modalEditMember");
  const modal =
    bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.show();
}

// ─────────────────────────────────────────────────────────────────────────────
// HAPUS MEMBER — DELETE /api/pengguna/{id}
// ─────────────────────────────────────────────────────────────────────────────
async function hapusMember(userID, username) {
  if (
    !confirm(
      `Yakin ingin menghapus akun "${username}"?\n\nData peminjaman terkait juga akan terhapus.`,
    )
  )
    return;

  try {
    const response = await fetch(`${API_URL}/pengguna/${userID}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadMember();
      alert("Akun berhasil dihapus.");
    } else {
      alert("Gagal menghapus akun.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Terjadi kesalahan jaringan.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE SUSPEND — PUT /api/pengguna/{id}/suspend
//
// Endpoint ini men-toggle status antara 'active' dan 'suspended'.
// Backend juga mencegah user yang suspended dari login.
// ─────────────────────────────────────────────────────────────────────────────
async function toggleSuspendMember(userID, currentStatus, username) {
  const isSuspended = currentStatus === "suspended";
  const aksi = isSuspended ? "Aktifkan kembali" : "Nonaktifkan (Suspend)";

  const konfirmasi = confirm(
    `${aksi} akun "${username}"?\n\n` +
      (isSuspended
        ? "User akan bisa login kembali."
        : "User tidak akan bisa login. Gunakan fitur ini jika ada denda belum dibayar atau buku terlambat dikembalikan."),
  );
  if (!konfirmasi) return;

  try {
    const response = await fetch(`${API_URL}/pengguna/${userID}/suspend`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (response.ok) {
      alert(`✅ ${result.pesan}`);
      loadMember(); // Refresh tabel untuk update badge status
    } else {
      alert("Gagal: " + (result.pesan || "Terjadi kesalahan."));
    }
  } catch (err) {
    console.error("Error toggleSuspend:", err);
    alert("Terjadi kesalahan jaringan.");
  }
}
