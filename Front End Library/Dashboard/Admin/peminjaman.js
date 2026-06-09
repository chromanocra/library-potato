// assets/js/peminjaman.js

const API_URL = "http://localhost:8080/api";
let dataPeminjamanGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
    initHalaman();
    loadPeminjaman();

    // Setup Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if(confirm('Apakah Anda yakin ingin keluar?')) {
                localStorage.clear();
                window.location.href = '../../Index Utama/index.html';
            }
        });
    }
});

function initHalaman() {
    const username = localStorage.getItem('username') || 'AdminFapus';
    
    const userDropdown = document.getElementById('sessUsernameDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (userDropdown) userDropdown.innerText = `Halo, ${username}`;
    if (usernameDisplay) usernameDisplay.innerText = username;
}

// Format tanggal dari YYYY-MM-DD HH:MM:SS menjadi DD/MM/YYYY
function formatTanggal(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format angka ke format Rupiah
function formatRupiah(angka) {
    if (!angka) return 'Rp 0';
    return 'Rp ' + parseFloat(angka).toLocaleString('id-ID');
}

async function loadPeminjaman() {
    const tbody = document.getElementById('tablePeminjamanBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/peminjaman`); // Sesuaikan endpoint API Anda
        const result = await response.json();

        let data = [];
        if (Array.isArray(result)) {
            data = result;
        } else if (result.data && Array.isArray(result.data)) {
            data = result.data;
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 30px;">Belum ada data peminjaman</td></tr>';
            return;
        }

        dataPeminjamanGlobal = data;
        let tableHTML = '';
        
        data.forEach((item, index) => {
            // Asumsi properti join dari API: item.judul_buku, item.cover_buku, item.nama_user, item.nomor_identitas
            
            let statusBadge = '';
            let actionBtn = '';

            // Penentuan Warna Badge Status
            if (item.status === 'borrowed') {
                statusBadge = '<span class="badge-status badge-borrowed">Dipinjam</span>';
                actionBtn = `<button class="btn-action btn-kembali" onclick="prosesPengembalian(${item.pinjamID})" title="Proses Pengembalian"><i class="fas fa-check"></i></button>`;
            } else if (item.status === 'returned') {
                statusBadge = '<span class="badge-status badge-returned">Dikembalikan</span>';
                actionBtn = `<span class="text-muted"><i class="fas fa-check-double"></i> Selesai</span>`;
            } else if (item.status === 'late') {
                statusBadge = '<span class="badge-status badge-late">Terlambat</span>';
                actionBtn = `<button class="btn-action btn-kembali" onclick="prosesPengembalian(${item.pinjamID})" title="Proses Pengembalian & Denda"><i class="fas fa-exclamation-triangle"></i></button>`;
            }

            // Gambar default jika cover tidak ada
            const coverImage = item.cover_buku ? `../../images/${item.cover_buku}` : '../../images/default-book.png';
            
            tableHTML += `
                <tr align="center">
                    <td>${index + 1}</td>
                    <td><img src="${coverImage}" class="cover-img" alt="Cover Buku"></td>
                    <td class="text-start fw-medium">${item.judul_buku || 'Judul Tidak Tersedia'}</td>
                    <td>
                        <div class="fw-medium">${item.nama_user || '-'}</div>
                        <div class="text-muted small">${item.nomor_identitas || '-'}</div>
                    </td>
                    <td>${formatTanggal(item.tanggal_pinjam)}</td>
                    <td>${formatTanggal(item.batas_kembali)}</td>
                    <td class="text-danger fw-medium">${item.total_denda > 0 ? formatRupiah(item.total_denda) : '-'}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });

        tbody.innerHTML = tableHTML;

        // Inisialisasi DataTables
        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            if ($.fn.DataTable.isDataTable('#dataTable')) {
                $('#dataTable').DataTable().destroy();
            }
            $('#dataTable').DataTable({
                "language": {
                    "search": "Cari:",
                    "lengthMenu": "Tampilkan _MENU_ data",
                    "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
                    "paginate": {
                        "first": "Awal",
                        "last": "Akhir",
                        "next": "Lanjut",
                        "previous": "Mundur"
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error memuat data peminjaman:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Gagal memuat data dari server. Pastikan API berjalan.</td></tr>';
    }
}

// Fungsi untuk menangani aksi pengembalian buku
async function prosesPengembalian(pinjamID) {
    if (confirm(`Apakah Anda yakin ingin memproses pengembalian untuk transaksi ini (ID: ${pinjamID})?`)) {
        try {
            // Sesuaikan endpoint dan method dengan API pengembalian Anda
            const response = await fetch(`${API_URL}/peminjaman/kembali/${pinjamID}`, {
                method: 'PUT', // Atau POST, tergantung desain API Anda
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert('Buku berhasil dikembalikan!');
                loadPeminjaman(); // Refresh tabel
            } else {
                const result = await response.json();
                alert('Gagal memproses pengembalian: ' + (result.pesan || 'Kesalahan server.'));
            }
        } catch (error) {
            console.error('Error proses pengembalian:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }
}