// Konfigurasi URL API Backend CodeIgniter 4 Anda
const BASE_URL_API = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Sistem Dashboard Diinisialisasi...");

  const sessionUser = localStorage.getItem("user_logged_in");

  // 1. PROTEKSI HALAMAN (LOGIN CHECK)
  if (!sessionUser) {
    alert("Akses ditolak! Silakan login terlebih dahulu.");
    window.location.href = "../../Login/login.html";
    return;
  }

  const dataUser = JSON.parse(sessionUser);

  // Pastikan yang login adalah user biasa
  if (dataUser.role !== "user") {
    alert("Anda tidak memiliki akses ke halaman ini!");
    window.location.href = "../../Login/login.html";
    return;
  }

  // Tampilkan nama user yang sedang login
  const elNamaUser = document.getElementById("nama-user");
  if (elNamaUser) {
    elNamaUser.innerText = dataUser.username || "Member";
  }

  // ========================================================
  // PERBAIKAN: TAMPILKAN BANNER SELAMAT DATANG (TANPA DIHAPUS/DIHILANGKAN)
  // ========================================================
  const welcomeAlert = document.getElementById("welcome-alert");
  if (welcomeAlert) {
    welcomeAlert.style.display = "block";
    welcomeAlert.classList.add("welcome-banner-show"); // Memicu animasi fade-in smooth ke atas
  }

  // 2. JALANKAN FUNGSI UTAMA
  muatDataBuku();

  // 3. LOGIKA FILTER/PENCARIAN BUKU KETIKA USER MENGETIK
  const inputSearch = document.getElementById("keyword");
  if (inputSearch) {
    inputSearch.addEventListener("input", function (e) {
      const kataKunci = e.target.value.toLowerCase();
      muatDataBuku(kataKunci);
    });
  }
});


// FUNGSI UTAMA UNTUK AMBIL DATA DARI API CI4
async function muatDataBuku(filterKataKunci = "") {
  console.log("1. Fungsi muatDataBuku mulai berjalan...");
  const wadahBuku = document.getElementById("wadah-buku");

  if (!wadahBuku) {
    console.error("CCTV ERROR: Elemen dengan id='wadah-buku' TIDAK DITEMUKAN di file HTML kamu!");
    return; 
  }

  try {
    console.log("2. Memanggil API Backend...");
    const respon = await fetch(`${BASE_URL_API}/buku`);
    const hasilJson = await respon.json(); 

    let listBuku = [];
    if (Array.isArray(hasilJson)) {
      listBuku = hasilJson; 
    } else if (hasilJson.data && Array.isArray(hasilJson.data)) {
      listBuku = hasilJson.data; 
    }

    if (respon.ok) {
      wadahBuku.innerHTML = ""; 

      // Filter Data Berdasarkan Kata Kunci
      const dataTerfilter = listBuku.filter(
        (buku) =>
          (buku.judul && buku.judul.toLowerCase().includes(filterKataKunci.toLowerCase())) ||
          (buku.kategori && buku.kategori.toLowerCase().includes(filterKataKunci.toLowerCase()))
      );

      if (dataTerfilter.length === 0) {
        wadahBuku.innerHTML = '<p class="text-muted text-center w-100 mt-4">Buku yang dicari tidak ditemukan atau data kosong.</p>';
        return;
      }

      dataTerfilter.forEach((item) => {
        let kategoriBuku = item.kategori || "Kategori Tidak Diketahui";
        let judulAsli = item.judul || "Tanpa Judul";
        let arrayJudul = judulAsli.split(" ");
        let judulPendek = arrayJudul.length > 3 ? arrayJudul.slice(0, 3).join(" ") + "..." : judulAsli;

        let namaFileGambar = item.cover && item.cover !== 'default.jpg' ? item.cover : ""; 
        let urlCover = namaFileGambar ? `http://localhost:8080/uploads/cover/${namaFileGambar}` : `../../images/a.png`;

        let judulAman = judulAsli.replace(/'/g, "\\'");

        // Struktur HTML untuk Card & Modal (dengan desain modern)
        let templateCard = `
            <div class="card m-2" style="width: 12rem; display: inline-block; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <img src="${urlCover}" 
                  class="card-img-top"
                  alt="${judulAsli}"
                  style="height: 250px; object-fit: cover;"
                  onerror="this.onerror=null; this.src='../../images/a.png'">
              <div class="card-body text-center d-flex flex-column justify-content-between p-2" style="height: 120px;">
                  <h6 style="font-weight:bold; color:black; font-size: 14px; margin-bottom: 5px;" title="${judulAsli}">
                      ${judulPendek}
                  </h6>
                  <small class="text-muted d-block mb-2">
                    <span style="color: blue; font-weight: 500; font-size: 12px;">${kategoriBuku}</span>
                  </small>
                  <button type="button"
                      class="btn btn-success btn-sm w-100 mt-auto"
                      data-bs-toggle="modal"
                      data-bs-target="#cek${item.id_buku}">
                      Cek Buku
                  </button>
              </div>
            </div>

            <div class="modal fade" id="cek${item.id_buku}" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
                  
                  <div class="modal-header border-0" style="background: linear-gradient(135deg, #1a8a42 0%, #10632b 100%); padding: 20px 25px;">
                    <h5 class="modal-title fw-bold text-white d-flex align-items-center">
                      <i class="fas fa-book-open me-2"></i> Informasi Buku
                    </h5>
                    <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>

                  <div class="modal-body position-relative" style="background-color: #f8fbfa; padding: 0 0 30px 0;">
                    <div style="height: 120px; background: linear-gradient(135deg, #1a8a42 0%, #10632b 100%); border-radius: 0 0 50% 50% / 0 0 40px 40px;"></div>

                    <div class="text-center px-4" style="margin-top: -85px;">
                      <div class="d-inline-block bg-white p-1 rounded-3 mb-3" style="box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <img src="${urlCover}" class="img-fluid rounded-2" alt="Cover Buku" style="height: 220px; width: 150px; object-fit: cover;" onerror="this.onerror=null; this.src='../../images/a.png'">
                      </div>
                      
                      <h4 class="fw-bold text-dark mb-2" style="font-size: 1.4rem; line-height: 1.3;">${judulAsli}</h4>
                      
                      <div class="mb-4">
                        <span class="badge shadow-sm" style="background-color: #e8f5e9; color: #1a8a42; border: 1px solid #c8e6c9; font-size: 0.85rem; padding: 7px 16px; font-weight: 600;">
                          <i class="fas fa-tag me-1"></i> <span>${kategoriBuku}</span>
                        </span>
                      </div>
                      
                      <div class="card border-0 shadow-sm rounded-4 text-start mx-auto" style="background-color: #ffffff;">
                        <div class="card-body p-3 px-4">
                          <div class="d-flex align-items-center mb-2 pb-2 border-bottom">
                            <div class="text-center" style="width: 35px; color: #1a8a42;"><i class="fas fa-user-edit"></i></div>
                            <div class="text-muted" style="width: 100px; font-size: 0.9rem;">Pengarang</div>
                            <div class="fw-semibold text-dark flex-grow-1" style="font-size: 0.95rem;">${item.pengarang || '-'}</div>
                          </div>
                          
                          <div class="d-flex align-items-center mb-2 pb-2 border-bottom">
                            <div class="text-center" style="width: 35px; color: #1a8a42;"><i class="fas fa-building"></i></div>
                            <div class="text-muted" style="width: 100px; font-size: 0.9rem;">Penerbit</div>
                            <div class="fw-semibold text-dark flex-grow-1" style="font-size: 0.95rem;">${item.penerbit || '-'}</div>
                          </div>
                          
                          <div class="d-flex align-items-center">
                            <div class="text-center" style="width: 35px; color: #1a8a42;"><i class="fas fa-calendar-alt"></i></div>
                            <div class="text-muted" style="width: 100px; font-size: 0.9rem;">Tahun</div>
                            <div class="fw-semibold text-dark flex-grow-1" style="font-size: 0.95rem;">${item.thn_terbit || '-'}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div class="modal-footer border-0 d-flex justify-content-center gap-2 pb-4 pt-1" style="background-color: #f8fbfa;">
                    <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal" style="border-radius: 10px; font-weight: 500; border: 1px solid #dee2e6; color: #000000;">Batal</button>
                    <button type="button" onclick="alihkanKePeminjaman('${judulAman}')" class="btn btn-success px-4 shadow-sm" style="background-color: #1a8a42; border-color: #1a8a42; border-radius: 10px; font-weight: 600;" data-bs-dismiss="modal">
                      <i class="fas fa-bookmark me-1"></i> Pinjam Buku Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
        `;
        wadahBuku.innerHTML += templateCard;
      });

      console.log("5. Render buku ke HTML sukses!");
    } else {
      wadahBuku.innerHTML = '<p class="text-danger text-center w-100">Gagal mengambil data dari server API.</p>';
    }
  } catch (error) {
    console.error("CCTV ERROR KONEKSI/SINTAKS:", error);
    wadahBuku.innerHTML = '<p class="text-danger text-center w-100">Gagal memuat sistem. Pastikan backend API berjalan!</p>';
  }
}

function alihkanKePeminjaman(judulBuku) {
  const judulEncoded = encodeURIComponent(judulBuku);
  window.location.href = `detail_pinjam.html?judul=${judulEncoded}&action=tambah`;
}