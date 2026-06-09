const API_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil session user dari 'user_logged_in' (Sama seperti di dashboard)
  const sessionUser = localStorage.getItem("user_logged_in");

  if (!sessionUser) {
    alert("Sesi telah habis atau ID tidak ditemukan. Silakan login kembali.");
    window.location.href = "../../Login/login.html";
    return;
  }

  const dataUser = JSON.parse(sessionUser);

  // Gunakan integer primary key userID untuk FK yang benar di tabel peminjaman.
  // dataUser.userID adalah kolom PK dari tabel pengguna yang dikembalikan saat login.
  const userID = dataUser.userID || dataUser.id;
  document.getElementById("userID").value = userID;

  // 2. Ambil Parameter dari URL (Mendukung 'id_buku' ATAU 'judul')
  const urlParams = new URLSearchParams(window.location.search);
  const idBuku = urlParams.get("id_buku");
  const judulBuku = urlParams.get("judul");

  if (idBuku) {
    // Jika ada id_buku, panggil langsung ID-nya
    loadDetailBukuById(idBuku);
  } else if (judulBuku) {
    // Jika adanya judul (dari fungsi alihkanKePeminjaman di dashboard), cari berdasarkan judul
    loadDetailBukuByJudul(judulBuku);
  } else {
    alert("Buku tidak ditemukan!");
    window.location.href = "dashboard.html";
    return;
  }

  // 3. Handle Submit Form
  document
    .getElementById("formPeminjaman")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const btnSubmit = this.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Memproses...';

      const now = new Date();
      const localNow = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );
      const sqlTanggalPinjam =
        localNow.toISOString().slice(0, 16).replace("T", " ") + ":00";

      const internalBatasKembali = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      const localBatasKembali = new Date(
        internalBatasKembali.getTime() -
          internalBatasKembali.getTimezoneOffset() * 60000,
      );
      const sqlBatasKembali =
        localBatasKembali.toISOString().slice(0, 16).replace("T", " ") + ":00";

      // ── FITUR 1: Payload disesuaikan dengan format yang diharapkan PeminjamanController
      // id_buku di form berisi nilai bukuID (sudah di-map oleh BukuController)
      const payload = {
        userID: document.getElementById("userID").value,
        batas_kembali: sqlBatasKembali,
        buku_yang_dipinjam: [
          {
            bukuID: document.getElementById("id_buku").value,
            qty: 1,
          },
        ],
      };

      try {
        const response = await fetch(`${API_URL}/peminjaman`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert("Buku Berhasil diPinjam!");
          window.location.href = "daftar_pinjam.html";
        } else {
          // ── FITUR 1: Tangkap error 400 stok habis dari server
          const result = await response.json();
          if (response.status === 400 && result.error) {
            // Pesan spesifik dari validasi stok
            alert("Gagal Meminjam: " + result.error);
          } else {
            // Pesan umum dari error lain
            alert(
              "Gagal: " +
                (result.messages?.error ||
                  result.pesan ||
                  result.message ||
                  "Terjadi kesalahan pada server."),
            );
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan jaringan. Pastikan server API berjalan.");
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML =
          '<i class="fas fa-paper-plane me-2"></i> Ajukan Pinjaman';
      }
    });
});

// FUNGSI JIKA MENCARI BERDASARKAN ID BUKU
async function loadDetailBukuById(id) {
  try {
    const response = await fetch(`${API_URL}/buku/${id}`);
    const result = await response.json();

    let book = result.data ? result.data : result;

    if (book && book.id_buku) {
      isiFormBuku(book);
    } else {
      alert("Buku tidak ditemukan di server.");
    }
  } catch (error) {
    console.error("Gagal mengambil data buku:", error);
  }
}

// FUNGSI JIKA MENCARI BERDASARKAN JUDUL BUKU (Sesuai Dashboard)
async function loadDetailBukuByJudul(judulTarget) {
  try {
    const response = await fetch(`${API_URL}/buku`);
    const result = await response.json();

    let data = [];
    if (Array.isArray(result)) data = result;
    else if (result.data && Array.isArray(result.data)) data = result.data;

    // Cari buku yang judulnya sama persis
    const book = data.find(
      (b) => b.judul && b.judul.toLowerCase() === judulTarget.toLowerCase(),
    );

    if (book) {
      isiFormBuku(book);
    } else {
      alert("Buku berdasarkan judul ini tidak ditemukan!");
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Gagal mengambil data buku:", error);
  }
}

// FUNGSI BANTUAN UNTUK MENGISI FORM
function isiFormBuku(book) {
  // Sesuaikan path cover seperti di dashboard
  let namaFileGambar =
    book.cover && book.cover !== "default.jpg" ? book.cover : "";
  let urlCover = namaFileGambar
    ? `http://localhost:8080/uploads/cover/${namaFileGambar}`
    : `../../images/a.png`;

  const elCover = document.getElementById("detailCover");
  elCover.src = urlCover;
  elCover.onerror = function () {
    this.src = "../../images/a.png";
  };

  document.getElementById("id_buku").value = book.id_buku || "";
  document.getElementById("kategori").value = book.kategori || "";
  document.getElementById("judul").value = book.judul || "";
  document.getElementById("pengarang").value = book.pengarang || "-";
  document.getElementById("penerbit").value = book.penerbit || "-";
  document.getElementById("thn_terbit").value = book.thn_terbit || "-";
}
