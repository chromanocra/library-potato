// Konfigurasi URL API Utama kamu
const URL_API_PINJAM = "http://localhost:8080/api/peminjaman";
const URL_API_USER   = "http://localhost:8080/api/user"; // Endpoint data user/anggota
const URL_API_BUKU   = "http://localhost:8080/api/buku"; // Endpoint data buku

document.addEventListener("DOMContentLoaded", () => {
    muatRiwayatPeminjaman();

    const formPinjam = document.getElementById("form-peminjaman");
    if (formPinjam) {
        formPinjam.addEventListener("submit", buatPeminjamanBaru);
    }
});

// ==========================================
// 1. FUNGSI GET: MENAMPILKAN RIWAYAT PINJAM
// ==========================================
async function muatRiwayatPeminjaman() {
    const wadahRiwayat = document.getElementById("wadah-riwayat");
    if (!wadahRiwayat) return;

    try {
        const respon = await fetch(URL_API_PINJAM);
        const hasilJson = await respon.json();

        if (respon.ok) {
            wadahRiwayat.innerHTML = ""; 
            const listPinjam = hasilJson.data || [];

            if (listPinjam.length === 0) {
                wadahRiwayat.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada riwayat transaksi peminjaman.</td></tr>`;
                return;
            }

            listPinjam.forEach((item) => {
                let statusBadge = item.status === "kembali" 
                    ? `<span class="badge bg-success">Dikembalikan</span>` 
                    : `<span class="badge bg-warning text-dark">Dipinjam</span>`;

                let row = `
                    <tr>
                        <td><strong>#${item.pinjamID}</strong></td>
                        <td>${item.userID}</td>
                        <td>${item.batas_kembali || '-'}</td>
                        <td>${item.status ? statusBadge : '<span class="badge bg-secondary">Aktif</span>'}</td>
                    </tr>
                `;
                wadahRiwayat.innerHTML += row;
            });
        } else {
            wadahRiwayat.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal mengambil data dari server.</td></tr>`;
        }
    } catch (error) {
        console.error("Error Get Peminjaman:", error);
        wadahRiwayat.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Koneksi Error. Cek Console!</td></tr>`;
    }
}

// ==========================================
// 2. FUNGSI POST: VALIDASI & TRANSAKSI BARU
// ==========================================
async function buatPeminjamanBaru(event) {
    event.preventDefault(); 

    // Ambil value input dari form HTML
    const usernameInput = document.getElementById("username").value.trim();
    const batas_kembali = document.getElementById("batas_kembali").value;
    const inputJudulBuku = document.querySelectorAll(".form-buku-judul");
    const inputBukuQty = document.querySelectorAll(".form-buku-qty");

    let finalUserID = null;
    let bukuYangDipinjam = [];

    try {
        // --- STEP 1: VALIDASI USERNAME KE DATABASE ---
        const responUser = await fetch(`${URL_API_USER}?search=${usernameInput}`);
        const dataUser = await responUser.json();
        const listUser = dataUser.data || dataUser || [];

        // Cari user yang username-nya pas/cocok murni
        const userDitemukan = listUser.find(u => (u.username || "").toLowerCase() === usernameInput.toLowerCase());

        if (!userDitemukan) {
            alert(`❌ Username "${usernameInput}" tidak ditemukan di database! Silakan daftar dahulu.`);
            return;
        }
        // Ambil ID aslinya untuk dilempar ke transaksi peminjaman
        finalUserID = userDitemukan.userID; 

        // --- STEP 2: AMBIL DATA SEMUA BUKU UNTUK COCOKAN JUDUL & STOK ---
        const responBuku = await fetch(URL_API_BUKU);
        const dataBuku = await responBuku.json();
        const daftarBukuDB = dataBuku.data || dataBuku || [];

        // --- STEP 3: CONVERT JUDUL BUKU MENJADI ID BUKU VIA LOOPING ---
        for (let i = 0; i < inputJudulBuku.length; i++) {
            let judulInput = inputJudulBuku[i].value.trim();
            let kuantitas = parseInt(inputBukuQty[i].value) || 1;

            if (judulInput !== "") {
                // Cari buku di DB yang judulnya sama persis
                const bukuDitemukan = daftarBukuDB.find(b => (b.judul_buku || "").toLowerCase() === judulInput.toLowerCase());

                if (!bukuDitemukan) {
                    alert(`❌ Buku dengan judul "${judulInput}" tidak ditemukan di perpustakaan!`);
                    return;
                }

                // Cek ketersediaan stok buku
                let stokTersedia = parseInt(bukuDitemukan.stok) || 0;
                if (stokTersedia < kuantitas) {
                    alert(`❌ Stok buku "${bukuDitemukan.judul_buku}" tidak cukup! (Sisa stok: ${stokTersedia})`);
                    return;
                }

                // Push object struktur ID Buku dan Qty yang diinginkan PeminjamanController
                bukuYangDipinjam.push({
                    bukuID: bukuDitemukan.bukuID,
                    qty: kuantitas
                });
            }
        }

        // Validasi jika tidak ada buku sama sekali yang diinput secara valid
        if (bukuYangDipinjam.length === 0) {
            alert("Silakan isi minimal satu judul buku yang ingin dipinjam.");
            return;
        }

        // --- STEP 4: BUNGKUS PAYLOAD DAN KIRIM KE CONTROLLER ---
        const payloadData = {
            userID: finalUserID, // Referensi ID hasil pengecekan DB
            batas_kembali: batas_kembali,
            buku_yang_dipinjam: bukuYangDipinjam
        };

        console.log("Payload Final Siap Kirim:", payloadData);

        const responPinjam = await fetch(URL_API_PINJAM, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadData)
        });

        const hasilResponse = await responPinjam.json();

        if (responPinjam.ok || responPinjam.status === 201) {
            alert("🎉 " + (hasilResponse.pesan || "Peminjaman berhasil dibuat!"));
            document.getElementById("form-peminjaman").reset();
            const modalEl = document.getElementById("modalTambahPinjam");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            muatRiwayatPeminjaman(); // Refresh tabel
        } else {
            alert("❌ Gagal: " + (hasilResponse.messages || hasilResponse.error || "Terjadi kesalahan server."));
        }

    } catch (error) {
        console.error("Proses Transaksi Error:", error);
        alert("Terjadi kegagalan sistem saat memvalidasi data transaksi.");
    }

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const judulBukuDariDashboard = urlParams.get('judul');
    const actionForm = urlParams.get('action');

    // Jika datang dari dashboard bawa parameter judul dan action=tambah
    if (actionForm === 'tambah' && judulBukuDariDashboard) {
        // 1. Otomatis isi judul buku ke kolom input baris pertama
        const inputJudulUtama = document.querySelector(".form-buku-judul");
        if (inputJudulUtama) {
            inputJudulUtama.value = decodeURIComponent(judulBukuDariDashboard);
        }

        // 2. Otomatis buka form modal "Tambah Pinjam" agar user tinggal isi username
        const modalTambah = document.getElementById("modalTambahPinjam");
        if (modalTambah) {
            const instanceModal = new bootstrap.Modal(modalTambah);
            instanceModal.show();
        }
    }
});

}