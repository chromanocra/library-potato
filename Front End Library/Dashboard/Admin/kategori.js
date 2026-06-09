// assets/js/kategori.js

const API_URL = "http://localhost:8080/api";

document.addEventListener('DOMContentLoaded', () => {
    initHalaman();
    loadKategori();

    // Handle Form Tambah Kategori
    const formKategori = document.getElementById('formKategori');
    if (formKategori) {
        formKategori.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const kategori = document.getElementById('inputKategori').value;
            const btnSubmit = this.querySelector('button[type="submit"]');
            
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = 'Menyimpan...';

            try {
                const response = await fetch(`${API_URL}/kategori`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Disesuaikan dengan field database 'nama_kategori'
                    body: JSON.stringify({ nama_kategori: kategori })
                });

                const result = await response.json();

                if (response.ok) {
                    // Tutup Modal & Reset
                    const modalEl = document.getElementById('modalTambahKategori');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modalInstance.hide();
                    
                    this.reset();
                    loadKategori();
                    alert('Data berhasil ditambah.');
                } else {
                    alert(result.message || 'Gagal menambahkan kategori, silakan cek kembali.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan jaringan saat menambahkan kategori.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Simpan Data'; 
            }
        });
    }

    // Handle Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if(confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.clear();
                window.location.href = '../../Index Utama/index.html';
            }
        });
    }
});

function initHalaman() {
    // Generate Tanggal (Aman dari error jika elemen belum ada)
    const dateObj = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.innerText = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    // Session Display
    const userDropdown = document.getElementById('sessUsernameDropdown');
    if (userDropdown) {
        userDropdown.innerText = localStorage.getItem('username') || 'Admin';
    }

    const roleElement = document.getElementById('sessRole');
    if (roleElement) {
        roleElement.innerText = localStorage.getItem('role') || 'Petugas';
    }
}

async function loadKategori() {
    const tbody = document.getElementById('tableKategoriBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/kategori`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        // Mengambil array data dari object response (untuk menghindari foreach error)
        let data = [];
        if (Array.isArray(result)) {
            data = result;
        } else if (result.data && Array.isArray(result.data)) {
            data = result.data;
        } else if (result.messages && Array.isArray(result.messages)) {
            data = result.messages; 
        } else {
            console.error("Format data tidak dikenali:", result);
            throw new Error("Format data tidak sesuai");
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Belum ada data kategori</td></tr>';
            return;
        }

        let tableHTML = '';
        data.forEach((item, index) => {
            // Pemanggilan item disesuaikan dengan struktur kolom database
            tableHTML += `
                <tr>
                    <td align="center">${index + 1}</td>
                    <td align="center">${item.nama_kategori}</td>
                    <td align="center">
                        <button class="btn btn-action btn-delete" onclick="hapusKategori(${item.kategoriID}, '${item.nama_kategori}')" title="Hapus Kategori">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = tableHTML;

        // Init DataTable
        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            if ($.fn.DataTable.isDataTable('#dataTable')) {
                $('#dataTable').DataTable().destroy();
            }
            $('#dataTable').DataTable();
        }

    } catch (error) {
        console.error('Error memuat kategori:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Gagal memuat data dari server. Pastikan backend CodeIgniter 4 sedang berjalan.</td></tr>';
    }
}

async function hapusKategori(id, namaKategori) {
    if (confirm(`Apakah kategori "${namaKategori}" ingin anda hapus? Jika anda hapus maka data buku dengan kategori ini juga akan terhapus!`)) {
        try {
            const response = await fetch(`${API_URL}/kategori/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadKategori();
            } else {
                alert('Gagal menghapus kategori.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }
}