// Konfigurasi URL API Backend CodeIgniter 4 Anda
const BASE_URL_API = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Sistem Dashboard Diinisialisasi...");

  const sessionUser = localStorage.getItem("user_logged_in");

  // 1. PROTEKSI HALAMAN (LOGIN CHECK)
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
  const elNamaUser = document.getElementById("nama-user");
  if (elNamaUser) {
    elNamaUser.innerText = dataUser.username;
  }

  // Jalankan Animasi Alert Selamat Datang selama 5 detik (jika elemennya ada)
  const welcomeAlert = document.getElementById("welcome-alert");
  if (welcomeAlert) {
    welcomeAlert.style.display = "block";
    setTimeout(function () {
      welcomeAlert.classList.add("alert-fade-out");
      setTimeout(function () {
        welcomeAlert.style.display = "none";
      }, 500);
    }, 5000);
  }

  // 2. JALANKAN FUNGSI UTAMA (Menyalakan Fungsi Muat Buku saat halaman terbuka)
  muatDataBuku();

  // 3. LOGIKA FILTER/PENCARIAN BUKU KETIKA USER MENGETIK
  const inputSearch = document.getElementById("keyword");
  if (inputSearch) {
    inputSearch.addEventListener("input", function (e) {
      const kataKunci = e.target.value.toLowerCase();
      muatDataBuku(kataKunci); // Panggil ulang fungsi dengan kata kunci
    });
  }

  // 4. LOGIKA TOMBOL LOGOUT
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      // Hapus data login dari browser
      localStorage.removeItem("user_logged_in");
      // Redirect ke login dengan ?from=logout
      window.location.href = "../Login/login.html?from=logout";
    });
  }
});


// FUNGSI UTAMA UNTUK AMBIL DATA DARI API CI4
async function muatDataBuku(filterKataKunci = "") {
  console.log("1. Fungsi muatDataBuku mulai berjalan...");
  const wadahBuku = document.getElementById("wadah-buku");

  // Pengecekan krusial: Apakah ID wadah-buku ada di HTML?
  if (!wadahBuku) {
    console.error("CCTV ERROR: Elemen dengan id='wadah-buku' TIDAK DITEMUKAN di file HTML kamu!");
    return; 
  }

  try {
    console.log("2. Memanggil API Backend...");
    const respon = await fetch(`${BASE_URL_API}/buku`);
    console.log("3. Status Respon API:", respon.status);

    const hasilJson = await respon.json(); 
    console.log("4. Bentuk Asli Data API:", hasilJson);

    // Deteksi otomatis apakah data dibungkus 'data' atau langsung array mentah
    let listBuku = [];
    if (Array.isArray(hasilJson)) {
      listBuku = hasilJson; 
    } else if (hasilJson.data && Array.isArray(hasilJson.data)) {
      listBuku = hasilJson.data; 
    } else {
      console.warn("CCTV PERINGATAN: Format data dari API tidak dikenali sebagai Array!", hasilJson);
    }

    if (respon.ok) {
      wadahBuku.innerHTML = ""; // Kosongkan teks loading "Sedang memuat data buku..."

    // Filter data secara real-time di sisi client jika user mengetik di kolom search
  const dataTerfilter = listBuku.filter(
  (buku) =>
    (buku.judul_buku && buku.judul_buku.toLowerCase().includes(filterKataKunci.toLowerCase())) ||
    (buku.kategori_buku && buku.kategori_buku.toLowerCase().includes(filterKataKunci.toLowerCase()))
  );

      if (dataTerfilter.length === 0) {
        wadahBuku.innerHTML = '<p class="text-muted text-center w-100 mt-4">Buku yang dicari tidak ditemukan atau data kosong.</p>';
        return;
      }

      // Looping data dan render ke dalam Bootstrap Card & Modal detail
dataTerfilter.forEach((item) => {
        // 👇 PERBAIKAN LOGIKA KATEGORI (Ada fallback ke kategoriID jika nama_kategori belum ke-join)
        let kategoriBuku = item.nama_kategori || item.kategoriID || "Kategori Tidak Diketahui";

        let judulAsli = item.judul_buku || "Tanpa Judul";
        let arrayJudul = judulAsli.split(" ");
        let judulPendek = arrayJudul.length > 3 ? arrayJudul.slice(0, 3).join(" ") + "..." : judulAsli;

        let namaFileGambar = item.cover_buku || item.cover || "default.jpg"; 
        let urlCover = `http://localhost:8080/imgDB/${namaFileGambar}`;

        console.log("Mencetak buku dengan judul:", item.judul_buku);
        let templateCard = `
            <div class="card m-2" style="width: 12rem; display: inline-block;">
              <img src="${urlCover}" 
                  class="card-img-top"
                  alt="coverBuku"
                  style="height: 210px; object-fit: cover;">
              <div class="card-body text-center">
                  <h6 style="font-weight:bold; color:black;">
                      ${judulPendek}
                  </h6>
                  
                  <small class="text-muted d-block mb-2">
                  <span style="color: blue; font-weight: 500;">${kategoriBuku}</span>
                  </small>
                  
                  <button type="button"
                      class="btn btn-success btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#cek${item.bukuID}">
                      Cek Buku
                  </button>
              </div>
            </div>

            <div id="cek${item.bukuID}" class="modal fade" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Detail Buku</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body text-center">
                    <img src="${urlCover}" class="img-thumbnail mb-3" style="max-height: 260px; object-fit: cover;">
                    <h4 class="font-weight-bold">${judulAsli}</h4>
                    
                    <p><strong>Kategori:</strong> <span style="color: blue;">${kategoriBuku}</span></p>
                    
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
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
    wadahBuku.innerHTML = '<p class="text-danger text-center w-100">Gagal memuat sistem. Cek F12 Console!</p>';
  }
}

// Fungsi Trigger Pinjam Buku
function pinjamBuku(idBuku) {
  alert(`Request pinjam untuk Buku ID: ${idBuku} berhasil dikirim ke sistem!`);
}