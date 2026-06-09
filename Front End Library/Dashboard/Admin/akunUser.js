// assets/js/member.js

const API_URL = "http://localhost:8080/api";
let dataMemberGlobal = [];
let currentEditUserId = null; // Variabel baru untuk menyimpan userID yang sedang diedit

document.addEventListener('DOMContentLoaded', () => {
    initHalaman();
    loadMember();

    // Submit Edit Member
    const formEditMember = document.getElementById('formEditMember');
    if (formEditMember) {
        formEditMember.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentEditUserId) {
                alert("Gagal: ID User tidak ditemukan.");
                return;
            }

            // Mengambil elemen secara aman dengan fallback
            const elNama = document.getElementById('editNama');
            const elPassword = document.getElementById('editPassword');
            const elEmail = document.getElementById('editEmail') || document.getElementById('editKelas');
            const elPhone = document.getElementById('editPhone') || document.getElementById('editJurusan');
            const elGender = document.getElementById('editGender') || document.getElementById('editAlamat');

            const btnSubmit = this.querySelector('button[type="submit"]');
            
            // Payload data yang akan dikirim ke backend
            const payload = {
                username: elNama ? elNama.value : '', 
                password: elPassword ? elPassword.value : '',
                email: elEmail ? elEmail.value : '', 
                phone: elPhone ? elPhone.value : '', 
                gender: elGender ? elGender.value : '' 
            };

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = 'Menyimpan...';

            try {
                // Menembak endpoint menggunakan userID (contoh: /pengguna/9)
                const response = await fetch(`${API_URL}/pengguna/${currentEditUserId}`, {
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const modalEl = document.getElementById('modalEditMember');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modalInstance.hide();
                    
                    loadMember();
                    alert('Data member berhasil diupdate!');
                } else {
                    const result = await response.json();
                    alert('Gagal: ' + (result.pesan || 'Terjadi kesalahan pada server.'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan jaringan.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa fa-save me-2"></i>Save';
            }
        });
    }

    // Logout
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
    if (userDropdown) {
        userDropdown.innerText = `Halo, ${username}`;
    }

    const roleElement = document.getElementById('sessRole');
    if (roleElement) {
        roleElement.innerText = localStorage.getItem('role') || 'Petugas';
    }
}

async function loadMember() {
    const tbody = document.getElementById('tableMemberBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/pengguna`);
        const result = await response.json();

        let data = [];
        if (Array.isArray(result)) {
            data = result;
        } else if (result.data && Array.isArray(result.data)) {
            data = result.data;
        } else if (result.messages && Array.isArray(result.messages)) {
            data = result.messages; 
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 30px;">Belum ada data member</td></tr>';
            return;
        }

        dataMemberGlobal = data;
        let tableHTML = '';
        
        data.forEach((item, index) => {
            // Perhatikan onClick sekarang mengirimkan item.userID, bukan item.nomor_identitas
            tableHTML += `
                <tr>
                    <td align="center">${index + 1}</td>
                    <td>${item.nomor_identitas || '-'}</td>
                    <td>${item.username || '-'}</td>
                    <td>${item.email || '-'}</td>
                    <td>${item.phone || '-'}</td>
                    <td>${item.gender || '-'}</td>
                    <td align="center" style="white-space: nowrap;">
                        <button class="btn btn-warning btn-sm" onclick="bukaModalEdit('${item.userID}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="hapusMember('${item.userID}', '${item.username}')" title="Hapus">
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
        console.error('Error memuat member:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Gagal memuat data dari server.</td></tr>';
    }
}

// Parameter diganti menerima userID
function bukaModalEdit(userID) {
    const member = dataMemberGlobal.find(m => m.userID == userID);
    
    if (member) {
        currentEditUserId = member.userID; // Simpan userID yang sedang diedit ke global
        
        const titleEl = document.getElementById('titleEditNama');
        if(titleEl) titleEl.innerText = member.username;
        
        if (document.getElementById('editNisn')) document.getElementById('editNisn').value = member.nomor_identitas;
        if (document.getElementById('editNama')) document.getElementById('editNama').value = member.username;
        
        if (document.getElementById('editEmail')) {
            document.getElementById('editEmail').value = member.email;
        } else if (document.getElementById('editKelas')) {
             document.getElementById('editKelas').value = member.email;
        }

        if (document.getElementById('editPhone')) {
            document.getElementById('editPhone').value = member.phone;
        } else if (document.getElementById('editJurusan')) {
             document.getElementById('editJurusan').value = member.phone;
        }

        if (document.getElementById('editGender')) {
            document.getElementById('editGender').value = member.gender;
        } else if (document.getElementById('editAlamat')) {
             document.getElementById('editAlamat').value = member.gender;
        }
        
        if (document.getElementById('editPassword')) document.getElementById('editPassword').value = "";

        const modalEl = document.getElementById('modalEditMember');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// Parameter pertama diganti menerima userID
async function hapusMember(userID, username) {
    if (confirm(`Apakah Anda yakin ingin menghapus Akun - ${username}?\n\nCatatan: Data peminjaman terkait member ini juga akan terhapus.`)) {
        try {
            // Menembak endpoint delete menggunakan userID
            const response = await fetch(`${API_URL}/pengguna/${userID}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadMember();
                alert('Akun berhasil dihapus.');
            } else {
                alert('Gagal menghapus akun.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan jaringan.');
        }
    }
}