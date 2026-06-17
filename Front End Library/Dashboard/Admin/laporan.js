const API_BASE = 'http://localhost:8080/api';

// ── Inisialisasi halaman ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('user_logged_in');
    if (!session) {
        alert('Akses ditolak! Silakan login.');
        window.location.href = '../../Login/login.html';
        return;
    }
    const dataUser = JSON.parse(session);
    if (dataUser.role !== 'admin') {
        alert('Halaman ini hanya untuk Admin.');
        window.location.href = '../../Index Utama/index.html';
        return;
    }
    document.getElementById('adminName').innerText = `Halo, ${dataUser.username || 'Admin'}`;

    // Isi dropdown tahun (5 tahun ke belakang + tahun ini)
    const now = new Date();
    const tahunSekarang = now.getFullYear();
    const selectTahun = document.getElementById('selectTahun');
    for (let t = tahunSekarang; t >= tahunSekarang - 4; t--) {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        selectTahun.appendChild(opt);
    }

    // Set default ke bulan & tahun saat ini
    document.getElementById('selectBulan').value = now.getMonth() + 1;
    document.getElementById('selectTahun').value = tahunSekarang;

    // Event: generate & export & archive
    document.getElementById('btnGenerate').addEventListener('click', generateReport);
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
    document.getElementById('btnArchive').addEventListener('click', archivePeminjaman);

    // Logout
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('user_logged_in');
            window.location.href = '../../Index Utama/index.html';
        }
    });
});

// ── Generate AI Report ──────────────────────────────────────────────────
async function generateReport() {
    const bulan = parseInt(document.getElementById('selectBulan').value);
    const tahun = parseInt(document.getElementById('selectTahun').value);
    const btn = document.getElementById('btnGenerate');

    // Tampilkan spinner, sembunyikan hasil lama
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('aiResultCard').style.display = 'none';
    document.getElementById('statsStrip').style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menganalisis...';

    try {
        const response = await fetch(`${API_BASE}/laporan/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bulan, tahun }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.messages?.error || data.pesan || 'Terjadi kesalahan pada server.');
        }

        // ── Isi strip statistik ─────────────────────────────────────────
        const stats = data.statistics || {};
        document.getElementById('stat-total').innerText = (stats.total_peminjaman || 0).toLocaleString('id-ID');
        document.getElementById('stat-denda').innerText = 'Rp ' + ((stats.total_denda || 0)).toLocaleString('id-ID');
        document.getElementById('stat-topbuku').innerText =
            stats.top_buku && stats.top_buku.length > 0
                ? stats.top_buku[0].judul_buku.split(' ').slice(0, 3).join(' ') + '...'
                : '-';

        // ── Tampilkan hasil AI ──────────────────────────────────────────
        document.getElementById('resultPeriode').innerText = `${data.bulan} ${data.tahun}`;
        document.getElementById('aiResultBody').innerHTML = data.ai_summary || '<p>Tidak ada respons.</p>';

        document.getElementById('statsStrip').style.removeProperty('display');
        document.getElementById('statsStrip').style.display = 'grid';
        document.getElementById('aiResultCard').style.display = 'block';

        // Scroll ke hasil
        document.getElementById('aiResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        document.getElementById('aiResultCard').style.display = 'block';
        document.getElementById('aiResultBody').innerHTML =
            `<div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Gagal generate laporan:</strong> ${err.message}
        <br><small class="mt-1 d-block">Pastikan: (1) Backend CI4 berjalan, (2) GEMINI_API_KEY sudah diisi di file <code>.env</code></small>
    </div>`;
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic me-2"></i>Generate AI Report';
    }
}

// ── Export CSV ──────────────────────────────────────────────────────────
function exportCSV() {
    const bulan = document.getElementById('selectBulan').value;
    const tahun = document.getElementById('selectTahun').value;
    window.location.href = `${API_BASE}/laporan/export?bulan=${bulan}&tahun=${tahun}`;
}

// ── Archive Peminjaman ────────────────────────────────────────────────
async function archivePeminjaman() {
    const bulan = document.getElementById('selectBulan').value;
    const tahun = document.getElementById('selectTahun').value;
    if (!confirm(`Yakin ingin mengarsipkan peminjaman yang Selesai/Ditolak pada bulan ${bulan} ${tahun}?\n\nData akan dipindahkan ke arsip_peminjaman.`)) return;

    try {
        const response = await fetch(`${API_BASE}/laporan/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bulan: parseInt(bulan), tahun: parseInt(tahun) }),
        });
        const result = await response.json();
        if (response.ok) {
            alert('Arsip Berhasil: ' + result.pesan);
        } else {
            alert('Gagal: ' + (result.pesan || 'Kesalahan server.'));
        }
    } catch (err) {
        alert('Terjadi kesalahan jaringan.');
    }
}

// ── Salin hasil ke clipboard ────────────────────────────────────────────
function copyResult() {
    const text = document.getElementById('aiResultBody').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check me-1"></i>Tersalin!';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-copy me-1"></i>Salin', 2000);
    });
}