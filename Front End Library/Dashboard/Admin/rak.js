const API_URL = 'http://localhost:8080/api'; // Sesuaikan dengan URL Backend kamu
let modalRakInstance;

document.addEventListener('DOMContentLoaded', () => {
    modalRakInstance = new bootstrap.Modal(document.getElementById('modalRak'));
    loadDataRak();

    // Event Submit Form (Handle Tambah & Edit)
    document.getElementById('formRak').addEventListener('submit', simpanRak);
});

// 1. Fungsi Mengambil Data Rak (GET)
async function loadDataRak() {
    const tbody = document.getElementById('tableRakBody'); // Sesuai HTML: tableRakBody
    try {
        const response = await fetch(`${API_URL}/rak`);
        const result = await response.json();

        // Hancurkan DataTable lama jika ada sebelum mengisi ulang data
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            $('#dataTable').DataTable().destroy();
        }

        tbody.innerHTML = ''; // Pastikan tabel dibersihkan

        // Hanya masukkan data jika ada (TIDAK PERLU membuat <tr> untuk pesan kosong)
        if (result.data && result.data.length > 0) {
            result.data.forEach((rak, index) => {
                const idRak = rak.id || rak.id || rak.id;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td class="fw-bold">${rak.nama_rak}</td>
                    <td>${rak.lokasi || '-'}</td>
                    <td style="text-align: center;">
                        <button class="btn-action btn-edit" onclick="bukaModalEditRak(${idRak}, '${rak.nama_rak}', '${rak.lokasi || ''}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="hapusRak(${idRak})" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Inisialisasi ulang DataTables setelah data masuk (atau kosong)
        $('#dataTable').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.10.24/i18n/Indonesian.json",
                // Tambahkan pesan custom di sini agar DataTables yang mengaturnya secara aman
                "emptyTable": "Belum ada data rak."
            }
        });

    } catch (error) {
        console.error('Error load rak:', error);

        // Jika DataTable belum diinisialisasi, kita cegah error tampilan
        if ($.fn.DataTable.isDataTable('#dataTable')) {
            $('#dataTable').DataTable().destroy();
        }
        tbody.innerHTML = '';

        // Buat DataTable menampilkan pesan error gagal memuat
        $('#dataTable').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.10.24/i18n/Indonesian.json",
                "emptyTable": "Gagal memuat data dari server."
            }
        });
    }
}

// 2. Buka Modal Tambah (Nama fungsi diganti sesuai onclick di HTML kamu)
function bukaModalTambahRak() {
    document.getElementById('formRak').reset();
    document.getElementById('rakID').value = ''; // Kosongkan ID
    document.getElementById('modalRakTitle').innerText = 'Tambah Rak';
    modalRakInstance.show();
}

// 3. Buka Modal Edit (Nama fungsi disesuaikan dengan tombol aksi tabel)
function bukaModalEditRak(id, nama_rak, lokasi) {
    document.getElementById('rakID').value = id;
    document.getElementById('inputNamaRak').value = nama_rak; // Sesuai HTML: inputNamaRak
    document.getElementById('inputLokasi').value = lokasi;   // Sesuai HTML: inputLokasi
    document.getElementById('modalRakTitle').innerText = 'Edit Rak';
    modalRakInstance.show();
}

// 4. Simpan Data (POST untuk Tambah, PUT untuk Edit)
async function simpanRak(e) {
    e.preventDefault();

    // Tambahkan baris ini untuk mengecek apakah fungsi dipanggil
    console.log("Fungsi simpanRak berhasil dipanggil!");

    const btnSubmit = document.getElementById('btnSubmitRak');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = 'Menyimpan...';

    const id = document.getElementById('rakID').value;
    const isEdit = id !== ''; // Kalau ID ada isinya, berarti Edit

    // Ambil value berdasarkan ID input yang benar di HTML kamu
    const payload = {
        nama_rak: document.getElementById('inputNamaRak').value,
        lokasi: document.getElementById('inputLokasi').value
    };

    const url = isEdit ? `${API_URL}/rak/${id}` : `${API_URL}/rak`;
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
            modalRakInstance.hide();
            loadDataRak(); // Refresh tabel otomatis
            alert(isEdit ? 'Data rak berhasil diupdate!' : 'Rak baru berhasil ditambahkan!');
        } else {
            alert('Gagal: ' + (result.pesan || 'Terjadi kesalahan pada server.'));
        }
    } catch (error) {
        console.error('Error simpan rak:', error);
        alert('Terjadi kesalahan jaringan.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Simpan Data';
    }
}

// 5. Hapus Data (DELETE)
async function hapusRak(id) {
    if (!confirm('Yakin ingin menghapus rak ini?')) return;

    try {
        const response = await fetch(`${API_URL}/rak/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            loadDataRak();
            alert('Rak berhasil dihapus!');
        } else {
            alert('Gagal menghapus rak.');
        }
    } catch (error) {
        console.error('Error hapus rak:', error);
        alert('Terjadi kesalahan jaringan.');
    }
}