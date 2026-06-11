const API_URL = 'http://localhost:8080/api'; 
let modalStokInstance;
let tableDataTable; // Tempat menyimpan instance DataTable agar tidak di-destroy terus-menerus

document.addEventListener('DOMContentLoaded', () => {
    modalStokInstance = new bootstrap.Modal(document.getElementById('modalStok'));
    
    // Inisialisasi DataTables pakai bahasa lokal (Biar gak nyari file keluar)
    tableDataTable = $('#dataTable').DataTable({
        "language": {
            "search": "Cari:",
            "lengthMenu": "Tampilkan _MENU_ data",
            "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
            "zeroRecords": "Data tidak ditemukan",
            "emptyTable": "Tidak ada data stok di database",
            "paginate": {
                "next": "Berikutnya",
                "previous": "Sebelumnya"
            }
        }
    });

    loadDataStok();
    loadOpsiBuku(); 

    document.getElementById('formStok').addEventListener('submit', simpanStok);
});

// Fungsi Mengambil Opsi Judul Buku untuk Dropdown (GET /api/buku)
async function loadOpsiBuku() {
    const selectBuku = document.getElementById('inputBukuID');
    try {
        const response = await fetch('http://localhost:8080/api/buku'); // sesuaikan url api kamu
        const result = await response.json();

        selectBuku.innerHTML = '<option value="">-- Pilih Judul Buku --</option>';
        
        const dataBuku = Array.isArray(result) ? result : (result.data || []);
        
        if (dataBuku.length > 0) {
            dataBuku.forEach(buku => {
                const option = document.createElement('option');
                option.value = buku.id_buku;  // Membaca id_buku dari controller
                option.textContent = buku.judul; // Membaca judul dari controller
                selectBuku.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error load opsi buku:', error);
    }
}

// Ambil Semua Data Stok Perpustakaan (GET /api/stok) - VERSI AMAN
async function loadDataStok() {
    try {
        const response = await fetch(`${API_URL}/stok`);
        const result = await response.json();

        // Bersihkan data lama di tabel tanpa menghancurkan (destroy) instansinya
        tableDataTable.clear();

        if (result.data && result.data.length > 0) {
            result.data.forEach((stok, index) => {
                const namaBuku = stok.judul || `ID Buku: #${stok.bukuID}`;
                
                // Gunakan cara resmi DataTables untuk menambah baris (row.add)
                const node = tableDataTable.row.add([
                    index + 1,
                    `<span class="fw-bold text-dark">${namaBuku}</span>`,
                    `<span class="badge bg-secondary fs-6">${stok.total_copy}</span>`,
                    `<span class="badge bg-success fs-6">${stok.avail_copy}</span>`,
                    `<span class="badge bg-primary fs-6">${stok.borrowed_copy || 0}</span>`,
                    `<span class="badge bg-warning text-dark fs-6">${stok.damaged_copy || 0}</span>`,
                    `<span class="badge bg-danger fs-6">${stok.lost_copy || 0}</span>`,
                    `<div style="text-align: center;">
                        <button type="button" class="btn-action btn-edit" onclick="bukaModalEditStok(${stok.stokID})" title="Edit Rincian">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>`
                ]).node();

                // Tambahkan class background merah jika stok habis (0)
                if (stok.avail_copy == 0) {
                    $(node).addClass('table-danger');
                }
            });
        }

        // Gambar ulang tabel dengan data baru
        tableDataTable.draw(false);

    } catch (error) {
        console.error('Error load data stok:', error);
        alert('Gagal mengambil data dari server perpustakaan.');
    }
}

// Fungsi Buka Modal Tambah Stok
function bukaModalTambahStok() {
    document.getElementById('formStok').reset();
    document.getElementById('stokID').value = '';
    document.getElementById('inputBukuID').disabled = false; 
    document.getElementById('modalStokTitle').innerText = 'Tambah Rincian Stok';
    modalStokInstance.show();
}

// Fungsi Ambil Detail & Buka Modal Edit
async function bukaModalEditStok(id) {
    try {
        const response = await fetch(`${API_URL}/stok/${id}`);
        const result = await response.json();

        if (response.ok && result.data) {
            const data = result.data;
            
            document.getElementById('stokID').value = data.stokID;
            document.getElementById('inputBukuID').value = data.bukuID;
            document.getElementById('inputBukuID').disabled = true; // Kunci biar ga bisa dituker judul bukunya

            document.getElementById('inputTotalCopy').value = data.total_copy;
            document.getElementById('inputAvailCopy').value = data.avail_copy;
            document.getElementById('inputBorrowedCopy').value = data.borrowed_copy || 0;
            document.getElementById('inputDamagedCopy').value = data.damaged_copy || 0;
            document.getElementById('inputLostCopy').value = data.lost_copy || 0;

            document.getElementById('modalStokTitle').innerText = 'Update Rincian Stok';
            modalStokInstance.show();
        }
    } catch (error) {
        console.error('Error detail stok:', error);
        alert('Terjadi kesalahan koneksi jaringan.');
    }
}

// Eksekusi Simpan Data (POST / PUT)
async function simpanStok(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById('btnSubmitStok');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Menyimpan...';

    const id = document.getElementById('stokID').value;
    const isEdit = id !== '';

    const payload = {
        bukuID: Number(document.getElementById('inputBukuID').value),
        total_copy: Number(document.getElementById('inputTotalCopy').value),
        avail_copy: Number(document.getElementById('inputAvailCopy').value),
        borrowed_copy: Number(document.getElementById('inputBorrowedCopy').value),
        damaged_copy: Number(document.getElementById('inputDamagedCopy').value),
        lost_copy: Number(document.getElementById('inputLostCopy').value)
    };

    const url = isEdit ? `${API_URL}/stok/${id}` : `${API_URL}/stok`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok || result.status === 200 || result.status === 201) {
            modalStokInstance.hide();
            await loadDataStok(); // Ambil data baru secara asinkronus
            alert(isEdit ? 'Stok buku berhasil diperbarui!' : 'Stok buku baru berhasil ditambahkan!');
        } else {
            alert('Gagal: ' + (result.pesan || 'Gagal memproses data stok.'));
        }
    } catch (error) {
        console.error('Error proses stok:', error);
        alert('Terjadi kesalahan jaringan.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan Data';
    }
}