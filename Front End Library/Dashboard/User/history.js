// assets/js/history_user.js

const API_URL = 'http://localhost/backend-fapus/public/api';

document.addEventListener('DOMContentLoaded', () => {
    // Set display username
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('usernameDisplay').innerText = username;

    loadHistoryUser();

    // Logout Function
    document.getElementById('btnLogout').addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });
});

async function loadHistoryUser() {
    const tbody = document.getElementById('tableHistoryBody');

    try {
        // Endpoint untuk mengambil riwayat buku spesifik user yang login
        const response = await fetch(`${API_URL}/history/user`, {
            headers: {
                // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Jika menggunakan auth token
            }
        });
        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Belum ada riwayat buku.</td></tr>';
            return;
        }

        let tableHTML = '';
        data.forEach((item, index) => {
            const coverPath = item.cover ? `http://localhost/backend-fapus/public/imgDB/${item.cover}` : '/CSSJS/images/a.png';
            
            tableHTML += `
                <tr class="align-middle text-center">
                    <td>${index + 1}</td>
                    <td>
                        <img src="${coverPath}" alt="Cover" width="60px" style="border-radius: 4px; object-fit: cover; aspect-ratio: 8/12;" onerror="this.src='/CSSJS/images/a.png'">
                    </td>
                    <td class="text-start">${item.judul}</td>
                    <td>${item.nisn || '-'}</td>
                    <td>${item.nama}</td>
                    <td>${item.nama_petugas || '-'}</td>
                    <td>${item.tgl_pinjam}</td>
                    <td>${item.tgl_kembali}</td>
                </tr>
            `;
        });

        tbody.innerHTML = tableHTML;

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
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Terjadi kesalahan saat memuat data.</td></tr>';
    }
}