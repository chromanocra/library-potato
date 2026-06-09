// assets/js/peminjaman.js

const API_URL = "http://localhost:8080/api";

document.addEventListener('DOMContentLoaded', () => {
    // Menampilkan username pengguna saat ini
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('usernameDisplay').innerText = username;

    loadPeminjamanUser();

    // Fungsi Logout
    document.getElementById('btnLogout').addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });
});

async function loadPeminjamanUser() {
    const tbody = document.getElementById('tablePeminjamanBody');
    const alertContainer = document.getElementById('alertContainer');
    const totalHargaDisplay = document.getElementById('totalHargaDisplay');

    try {
        // Asumsi API mengembalikan daftar pinjaman milik user yang sedang login
        const response = await fetch(`${API_URL}/peminjaman/user`, {
            headers: {
                // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Jika pakai JWT
            }
        }); 
        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada riwayat peminjaman buku.</td></tr>';
            alertContainer.innerHTML = '';
            totalHargaDisplay.innerText = '0';
            return;
        }

        let tableHTML = '';
        let totalHarga = 0;
        let showPeringatanBayar = false;
        let showPeringatanKembali = false;

        data.forEach((item, index) => {
            const coverPath = item.cover ? `http://localhost/backend-fapus/public/imgDB/${item.cover}` : '/CSSJS/images/a.png';
            
            // Konversi harga ke format angka (menghilangkan Rp dan titik)
            let hargaAngka = parseFloat(item.harga.toString().replace(/[^0-9]/g, '')) || 0;
            totalHarga += hargaAngka;

            // Logic Status & Actions
            let actionHTML = '';
            if (item.status == '0') {
                showPeringatanBayar = true;
                actionHTML = `
                    <span class="badge bg-warning text-dark mb-2">Menunggu Persetujuan</span><br>
                    <button class="btn btn-danger btn-sm w-100" onclick="batalPinjam(${item.peminjaman_id})">Batal Pinjam?</button>
                `;
            } else if (item.status == '1') {
                showPeringatanKembali = true;
                actionHTML = `
                    <button class="btn btn-success btn-sm w-100 mb-1" onclick="bacaBuku(${item.id_buku})">
                        <i class="fas fa-book-open"></i> Baca Buku
                    </button>
                    <button class="btn btn-warning btn-sm w-100 text-dark fw-bold" onclick="kembalikanBuku(${item.peminjaman_id})">
                        Kembalikan
                    </button>
                `;
            } else if (item.status == '2') {
                actionHTML = `<span class="badge bg-danger">Tidak Disetujui</span>`;
            }

            tableHTML += `
                <tr class="align-middle text-center">
                    <td>${index + 1}</td>
                    <td>
                        <img src="${coverPath}" alt="Cover" width="60px" style="border-radius: 4px; object-fit: cover; aspect-ratio: 8/12;" onerror="this.src='/CSSJS/images/a.png'">
                    </td>
                    <td class="text-start">${item.judul}</td>
                    <td>${item.nama_petugas || '-'}</td>
                    <td>${item.no_petugas || '-'}</td>
                    <td>${item.harga}</td>
                    <td>${item.tgl_pinjam}</td>
                    <td>${item.tgl_kembali}</td>
                    <td>${actionHTML}</td>
                </tr>
            `;
        });

        // Set Table Body
        tbody.innerHTML = tableHTML;

        // Set Alerts
        let alertsHTML = '';
        if (showPeringatanBayar) {
            alertsHTML += `
                <div class="alert alert-danger mx-3 mt-3 text-center mb-0">
                    <strong>Peringatan!</strong> Jika sudah bayar, Silahkan kirim bukti transaksi ke nomor yang tertera jika ingin membaca buku.
                </div>
            `;
        }
        if (showPeringatanKembali) {
            alertsHTML += `
                <div class="alert alert-warning mx-3 mt-3 text-center text-dark mb-0">
                    Klik <strong>"Kembalikan"</strong> Jika Sudah Tenggat Pada Waktunya.
                </div>
            `;
        }
        alertContainer.innerHTML = alertsHTML;

        // Set Total Harga
        totalHargaDisplay.innerText = totalHarga.toLocaleString('id-ID');

        // Init DataTable
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            $('#dataTable').DataTable().destroy();
        }
        $('#dataTable').DataTable({
            "language": {
                "emptyTable": "Tidak ada data yang tersedia pada tabel ini"
            }
        });

    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Terjadi kesalahan saat memuat data.</td></tr>';
    }
}

// Fungsi Batal Pinjam
async function batalPinjam(id) {
    if (confirm('Anda Yakin Ingin Membatalkan Pinjaman?')) {
        try {
            const response = await fetch(`${API_URL}/peminjaman/batal/${id}`, {
                method: 'POST' // Atau DELETE sesuai API kamu
            });
            
            if (response.ok) {
                loadPeminjamanUser();
            } else {
                alert('Gagal membatalkan peminjaman.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Kesalahan jaringan.');
        }
    }
}

// Fungsi Kembalikan Buku
async function kembalikanBuku(id) {
    if (confirm('Anda Yakin Ingin Mengembalikan Buku?')) {
        try {
            const response = await fetch(`${API_URL}/peminjaman/kembali/${id}`, {
                method: 'POST' // Atau PUT sesuai API kamu
            });
            
            if (response.ok) {
                loadPeminjamanUser();
            } else {
                alert('Gagal mengembalikan buku.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Kesalahan jaringan.');
        }
    }
}

// Fungsi Buka Halaman Baca Buku
function bacaBuku(id_buku) {
    // Alihkan ke halaman baca buku
    window.open(`bacabuku.html?id_buku=${id_buku}`, '_blank');
}