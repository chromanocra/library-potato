// Konfigurasi URL API Backend CodeIgniter 4 Anda
const BASE_URL_API = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", function () {
  // ============================================================
  // 1. PROTEKSI HALAMAN — cek session login dari localStorage
  // ============================================================
  const sessionUser = localStorage.getItem("user_logged_in");

  if (!sessionUser) {
    // Belum login sama sekali → tendang ke halaman login
    alert("Akses ditolak! Silakan login terlebih dahulu.");
    window.location.href = "../Login/login.html";
    return;
  }

  const dataUser = JSON.parse(sessionUser);

  if (dataUser.role !== "user") {
    // Role bukan user → tidak boleh masuk dashboard user
    alert("Anda tidak memiliki akses ke halaman ini!");
    window.location.href = "../Login/login.html";
    return;
  }

  // Tampilkan nama user yang sedang login
  document.getElementById("nama-user").innerText = dataUser.username;

  // Jalankan Animasi Alert Selamat Datang selama 5 detik
  const welcomeAlert = document.getElementById("welcome-alert");
  welcomeAlert.style.display = "block";
  setTimeout(function () {
    welcomeAlert.classList.add("alert-fade-out");
    setTimeout(function () {
      welcomeAlert.style.display = "none";
    }, 500);
  }, 5000);

  // 2. AMBIL DATA BUKU PERTAMA KALI
  muatDataBuku();

  // 3. LOGIKA FILTER/PENCARIAN BUKU KETIKA USER MENGETIK
  const inputSearch = document.getElementById("keyword");
  inputSearch.addEventListener("input", function (e) {
    const kataKunci = e.target.value.toLowerCase();
    muatDataBuku(kataKunci);
  });

  // 4. LOGIKA TOMBOL LOGOUT
  document.getElementById("btn-logout").addEventListener("click", function () {
    // 1. Hapus data login dari browser
    localStorage.removeItem("user_logged_in");

    // 2. Redirect ke login dengan ?from=logout
    // WAJIB pakai ?from=logout agar login.js tidak auto-forward balik ke dashboard
    window.location.href = "../Login/login.html?from=logout";
  });
});

// FUNGSI UTAMA UNTUK AMBIL DATA DARI API CI4
async function muatDataBuku(filterKataKunci = "") {
  const wadahBuku = document.getElementById("wadah-buku");

  try {
    // Panggil endpoint API buku kamu
    const response = await fetch(`${BASE_URL_API}/buku`);
    const listBuku = await response.json();

    if (response.ok) {
      wadahBuku.innerHTML = ""; // Kosongkan loader teks

      // Filter data secara real-time di sisi client jika user mengetik di kolom search
      const dataTerfilter = listBuku.filter(
        (buku) =>
          buku.judul.toLowerCase().includes(filterKataKunci) ||
          buku.kategori.toLowerCase().includes(filterKataKunci),
      );

      if (dataTerfilter.length === 0) {
        wadahBuku.innerHTML =
          '<p class="text-muted text-center w-100 mt-4">Buku yang dicari tidak ditemukan.</p>';
        return;
      }

      // Looping data dan render ke dalam Bootstrap Card & Modal detail
      dataTerfilter.forEach((item) => {
        // Batasi judul jika lebih dari 3 kata (Fungsi pengganti str_word_count PHP)
        let arrayJudul = item.judul.split(" ");
        let judulPendek =
          arrayJudul.length > 3
            ? arrayJudul.slice(0, 3).join(" ") + "..."
            : item.judul;

        // Path cover gambar ke server CI4 kamu
        let urlCover = `http://localhost:8080/imgDB/${item.cover}`;

        let templateCard = `
                    <div class="card" style="width: 10rem;">
                      <div class="card border-0 mb-8" style="background-color:rgb(255,255,255);box-shadow: 0px 0px 11px 3px rgba(0,0,0,0.07);overflow:hidden;">
                        <div id="wrapThumbnail">
                          <img src="${urlCover}" class="card-img-top" alt="coverBuku" style="width: 250px; aspect-ratio: 8/12;">
                          <div id="thumbnailCard">
                            <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#cek${item.id_buku}">Cek Buku</button>
                          </div>
                        </div>
                        <div class="card-body">
                          <h5 class="card-text" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                            <strong>Judul :</strong> ${judulPendek}
                          </h5>
                          <center>
                            <li class="list-group-item">Kategori : ${item.kategori}</li>
                          </center>
                        </div>
                      </div>
                    </div>

                    <div id="cek${item.id_buku}" class="modal fade bd-example-modal" tabindex="-1" role="dialog" aria-hidden="true">
                      <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content">
                          <div class="modal-body">
                            <div class="row">
                              <div class="col-md-5">
                                <img src="${urlCover}" class="img-thumbnail" alt="coverBuku" height="300px">
                              </div>
                              <div class="col-md-7 pl-3">
                                <div class="dropdown-divider"></div>
                                <h3 class="pt-1 pb-1">${item.judul}</h3>
                                <div class="dropdown-divider"></div>
                                <h5 class="pt-1 pb-1" style="margin: 0;">Kategori : ${item.kategori}</h5>
                                <div class="dropdown-divider"></div>
                                <p class="pt-1 pb-1" style="margin: 0;">Deskripsi : ${item.deskripsi || "Tidak ada deskripsi."}</p>
                              </div>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Batal</button>
                            <button onclick="pinjamBuku('${item.id_buku}')" class="btn btn-success">Pinjam Buku ?</button>
                          </div>
                        </div>
                      </div>
                    </div>
                `;
        wadahBuku.innerHTML += templateCard;
      });
    } else {
      wadahBuku.innerHTML =
        '<p class="text-danger text-center w-100">Gagal mengambil data dari server API.</p>';
    }
  } catch (error) {
    console.error("Koneksi Error:", error);
    wadahBuku.innerHTML =
      '<p class="text-danger text-center w-100">Tidak dapat terhubung ke Backend. Pastikan Apache & php spark serve menyala!</p>';
  }
}

// Fungsi Trigger Pinjam Buku (Nanti bisa disambungkan ke API Pinjam)
function pinjamBuku(idBuku) {
  alert(`Request pinjam untuk Buku ID: ${idBuku} berhasil dikirim ke sistem!`);
}
