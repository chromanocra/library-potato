// assets/js/buku.js

const API_URL = "http://localhost:8080/api";
let dataBukuGlobal = [];
let dataKategoriGlobal = [];
let currentEditIdBuku = null;

document.addEventListener('DOMContentLoaded', () => {
    initHalaman();
    loadKategori();
    loadRak();
    loadBuku();

    // 1. Submit Tambah Buku 
    const formTambahBuku = document.getElementById('formTambahBuku');
    if (formTambahBuku) {
        formTambahBuku.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Menyimpan...';

            const formData = new FormData(this);

            try {
                const response = await fetch(`${API_URL}/buku`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const modalEl = document.getElementById('modalTambahBuku');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modalInstance.hide();

                    formTambahBuku.reset();
                    loadBuku();
                    alert('Data buku berhasil ditambahkan!');
                } else {
                    const result = await response.json();
                    alert('Gagal: ' + (result.pesan || 'Terjadi kesalahan di server.'));
                }
            } catch (error) {
                console.error('Error saat tambah buku:', error);
                alert('Terjadi kesalahan jaringan.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Simpan Data';
            }
        });
    }

    // 2. Submit Edit Buku
    const formEditBuku = document.getElementById('formEditBuku');
    if (formEditBuku) {
        formEditBuku.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!currentEditIdBuku) {
                alert("Gagal: ID Buku tidak ditemukan.");
                return;
            }

            const btnSubmit = this.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Mengupdate...';

            const formData = new FormData();
            formData.append('judul', document.getElementById('editJudul').value);
            formData.append('pengarang', document.getElementById('editPengarang').value);
            formData.append('penerbit', document.getElementById('editPenerbit').value);
            formData.append('thn_terbit', document.getElementById('editThnTerbit').value);

            if (document.getElementById('editIsbn')) {
                formData.append('isbn', document.getElementById('editIsbn').value);
            }

            formData.append('kategoriID', document.getElementById('editKategori').value);
            formData.append('rakID', document.getElementById('editRak').value);
            formData.append('sinopsis', document.getElementById('editSinopsis').value);

            // Ambil file cover jika user memilih file baru
            const inputCover = document.getElementById('editCover');
            if (inputCover && inputCover.files.length > 0) {
                formData.append('cover', inputCover.files[0]);
            }

            try {
                // KIRIM SEBAGAI POST MURNI TANPA EMBEL-EMBEL _METHOD PUT
                const response = await fetch(`${API_URL}/buku/${currentEditIdBuku}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok || result.status === 200) {
                    // Tutup modal secara otomatis
                    const modalEl = document.getElementById('modalEditBuku');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modalInstance.hide();

                    // Refresh data tabel & beri notifikasi
                    loadBuku();
                    alert('Data buku berhasil diperbarui!');
                } else {
                    alert('Gagal: ' + (result.pesan || 'Terjadi kesalahan pada server.'));
                }
            } catch (error) {
                console.error('Error saat edit buku:', error);
                alert('Terjadi kesalahan jaringan.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa fa-save me-1"></i> Update Data';
            }
        });
    }

    // Setup Logout dengan path ../../index.html
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar dari aplikasi Fapus?')) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '../../Index Utama/index.html'; // Path menuju halaman utama
            }
        });
    }
});

function initHalaman() {
    const username = localStorage.getItem('username') || 'Admin';
    const userDropdown = document.getElementById('sessUsernameDropdown');
    if (userDropdown) userDropdown.innerText = `Halo, ${username}`;
}

// Memuat data Kategori untuk Dropdown
async function loadKategori() {
    try {
        const response = await fetch(`${API_URL}/kategori`);
        const result = await response.json();

        let data = [];
        if (Array.isArray(result)) data = result;
        else if (result.data && Array.isArray(result.data)) data = result.data;

        dataKategoriGlobal = data;

        const selectAdd = document.getElementById('addKategori');
        const selectEdit = document.getElementById('editKategori');

        let optionsHTML = '<option selected disabled value="">-- Pilih Kategori --</option>';
        data.forEach(kat => {
            const idKat = kat.kategoriID || kat.id_kategori;
            optionsHTML += `<option value="${idKat}">${kat.nama_kategori}</option>`;
        });

        if (selectAdd) selectAdd.innerHTML = optionsHTML;
        if (selectEdit) selectEdit.innerHTML = optionsHTML;

    } catch (error) {
        console.error("Gagal memuat kategori:", error);
    }
}

// Memuat data Rak untuk Dropdown
async function loadRak() {
    try {
        const response = await fetch(`${API_URL}/rak`);
        const result = await response.json();

        let data = [];
        if (Array.isArray(result)) data = result;
        else if (result.data && Array.isArray(result.data)) data = result.data;

        const selectAdd = document.getElementById('addRak');
        const selectEdit = document.getElementById('editRak');

        let optionsHTML = '<option selected disabled value="">Pilih Rak</option>';
        data.forEach(rak => {
            optionsHTML += `<option value="${rak.id}">${rak.nama_rak} - ${rak.lokasi}</option>`;
        });

        if (selectAdd) selectAdd.innerHTML = optionsHTML;
        if (selectEdit) selectEdit.innerHTML = optionsHTML;

    } catch (error) {
        console.error("Gagal memuat rak:", error);
    }
}

// Memuat data Buku untuk Tabel
async function loadBuku() {
    const tbody = document.getElementById('tableBukuBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/buku`);
        const result = await response.json();

        let data = [];
        if (Array.isArray(result)) data = result;
        else if (result.data && Array.isArray(result.data)) data = result.data;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding: 30px;">Belum ada data buku</td></tr>';
            return;
        }

        dataBukuGlobal = data;
        let tableHTML = '';

        data.forEach((item, index) => {
            const coverImg = item.cover ? `http://localhost:8080/uploads/cover/${item.cover}` : '../../images/default-book.png';

            tableHTML += `
                <tr>
                    <td align="center">${index + 1}</td>
                    <td align="center">
                        <img src="${coverImg}" alt="Cover" style="width: 50px; height: 70px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    </td>
                    <td>${item.id_buku || '-'}</td>
                    <td class="fw-medium">${item.judul || '-'}</td>
                    <td>${item.pengarang || '-'}</td>
                    <td>${item.penerbit || '-'}</td>
                    <td>${item.thn_terbit || '-'}</td>
                    <td>${item.isbn || '-'}</td>
                    <td>${item.kategori || '-'}</td>
                    <td align="center" style="white-space: nowrap;">
                        <button class="btn-action btn-edit" onclick="bukaModalEdit('${item.id_buku}')" title="Edit Buku">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="hapusBuku('${item.id_buku}', '${item.judul}')" title="Hapus Buku">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = tableHTML;

        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            if ($.fn.DataTable.isDataTable('#dataTable')) {
                $('#dataTable').DataTable().destroy();
            }
            $('#dataTable').DataTable();
        }

    } catch (error) {
        console.error('Error memuat buku:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Gagal memuat data dari server.</td></tr>';
    }
}

function bukaModalEdit(id_buku) {
    const buku = dataBukuGlobal.find(b => b.id_buku == id_buku);

    if (buku) {
        currentEditIdBuku = buku.id_buku;

        const titleEl = document.getElementById('titleEditBuku');
        if (titleEl) titleEl.innerText = buku.judul;

        document.getElementById('editJudul').value = buku.judul;
        document.getElementById('editPengarang').value = buku.pengarang;
        document.getElementById('editPenerbit').value = buku.penerbit;
        document.getElementById('editThnTerbit').value = buku.thn_terbit;

        if (document.getElementById('editIsbn') && buku.isbn) {
            document.getElementById('editIsbn').value = buku.isbn;
        }

        const selectKat = document.getElementById('editKategori');
        if (selectKat) {
            const katId = buku.kategoriID || buku.id_kategori;
            if (katId) selectKat.value = katId;
        }

        const selectRak = document.getElementById('editRak');
        if (selectRak && buku.rakID) {
            selectRak.value = buku.rakID;
        }

        const inputSinopsis = document.getElementById('editSinopsis');
        if (inputSinopsis) {
            inputSinopsis.value = buku.sinopsis || '';
        }

        const previewCover = document.getElementById('previewEditCover');
        if (previewCover) {
            previewCover.src = buku.cover ? `http://localhost:8080/uploads/cover/${buku.cover}` : '../../images/default-book.png';
        }

        const coverLama = document.getElementById('editCoverLama');
        if (coverLama) coverLama.value = buku.cover || '';

        const inputCover = document.getElementById('editCover');
        if (inputCover) inputCover.value = "";

        const modalEl = document.getElementById('modalEditBuku');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

async function hapusBuku(id_buku, judul) {
    if (confirm(`Apakah Anda yakin ingin menghapus Buku "${judul}"?\nFile cover juga akan ikut terhapus di server.`)) {
        try {
            const response = await fetch(`${API_URL}/buku/${id_buku}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadBuku();
                alert('Buku berhasil dihapus.');
            } else {
                alert('Gagal menghapus buku. Pastikan tidak ada data peminjaman yang terikat.');
            }
        } catch (error) {
            console.error('Error saat hapus buku:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }


    let currentStokIdBuku = null;

    // Buka Modal Stok
    function bukaModalStok(id_buku, total, avail) {
        currentStokIdBuku = id_buku;
        document.getElementById('editTotalCopy').value = total || 0;
        document.getElementById('editAvailCopy').value = avail || 0;

        const modalEl = document.getElementById('modalEditStok');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }

    // Event Listener Submit Update Stok
    document.addEventListener('DOMContentLoaded', () => {
        const formEditStok = document.getElementById('formEditStok');
        if (formEditStok) {
            formEditStok.addEventListener('submit', async function (e) {
                e.preventDefault();
                if (!currentStokIdBuku) return;

                const btnSubmit = this.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = 'Menyimpan...';

                const formData = new FormData(this);

                try {
                    const response = await fetch(`${API_URL}/buku/${currentStokIdBuku}/stok`, {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok || result.status === 200) {
                        const modalEl = document.getElementById('modalEditStok');
                        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        modalInstance.hide();

                        loadBuku(); // Refresh Data Tabel
                        alert('Stok berhasil diperbarui!');
                    } else {
                        alert('Gagal: ' + (result.pesan || 'Terjadi kesalahan pada server.'));
                    }
                } catch (error) {
                    console.error('Error saat update stok:', error);
                    alert('Terjadi kesalahan jaringan.');
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Update Stok';
                }
            });
        }
    });

}