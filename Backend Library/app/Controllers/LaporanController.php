<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class LaporanController extends ResourceController
{
    protected $format = 'json';

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/laporan/ai
    // Body: { "bulan": 6, "tahun": 2026 }
    // Requires GEMINI_API_KEY in .env
    // ─────────────────────────────────────────────────────────────────────────
    public function generateAI()
    {
        $input = $this->request->getJSON();

        $bulan = isset($input->bulan) ? (int) $input->bulan : (int) date('m');
        $tahun = isset($input->tahun) ? (int) $input->tahun : (int) date('Y');

        if ($bulan < 1 || $bulan > 12) {
            return $this->fail('Bulan tidak valid (1–12)', 400);
        }

        $db = \Config\Database::connect();

        // 1. Total transaksi bulan ini
        $totalPeminjaman = (int) ($db->query("
            SELECT COUNT(*) AS total FROM peminjaman
            WHERE MONTH(tanggal_pinjam) = ? AND YEAR(tanggal_pinjam) = ?
        ", [$bulan, $tahun])->getRow()->total ?? 0);

        // 2. Breakdown per-status
        $statusRows = $db->query("
            SELECT status, COUNT(*) AS jumlah FROM peminjaman
            WHERE MONTH(tanggal_pinjam) = ? AND YEAR(tanggal_pinjam) = ?
            GROUP BY status
        ", [$bulan, $tahun])->getResultArray();

        // 3. Top 5 buku paling sering dipinjam
        $topBuku = $db->query("
            SELECT b.judul_buku, COUNT(d.bukuID) AS total_dipinjam
            FROM   detail d
            JOIN   buku        b  ON d.bukuID    = b.bukuID
            JOIN   peminjaman  p  ON d.pinjamID  = p.pinjamID
            WHERE  MONTH(p.tanggal_pinjam) = ? AND YEAR(p.tanggal_pinjam) = ?
            GROUP  BY d.bukuID, b.judul_buku
            ORDER  BY total_dipinjam DESC
            LIMIT  5
        ", [$bulan, $tahun])->getResultArray();

        // 4. Total harga/denda terkumpul
        $totalDenda = (float) ($db->query("
            SELECT COALESCE(SUM(total_denda), 0) AS total FROM peminjaman
            WHERE  MONTH(tanggal_pinjam) = ? AND YEAR(tanggal_pinjam) = ?
            AND    status IN ('Dipinjam', 'Dikembalikan')
        ", [$bulan, $tahun])->getRow()->total ?? 0);

        // 5. Top 3 peminjam paling aktif
        $topPeminjam = $db->query("
            SELECT pg.username, pg.nomor_identitas, COUNT(p.pinjamID) AS total_pinjam
            FROM   peminjaman p
            JOIN   pengguna   pg ON p.userID = pg.userID
            WHERE  MONTH(p.tanggal_pinjam) = ? AND YEAR(p.tanggal_pinjam) = ?
            GROUP  BY p.userID, pg.username, pg.nomor_identitas
            ORDER  BY total_pinjam DESC
            LIMIT  3
        ", [$bulan, $tahun])->getResultArray();

        // Nama bulan Bahasa Indonesia
        $namaBulan = [
            1=>'Januari', 2=>'Februari', 3=>'Maret',    4=>'April',
            5=>'Mei',     6=>'Juni',     7=>'Juli',      8=>'Agustus',
            9=>'September',10=>'Oktober',11=>'November',12=>'Desember',
        ];

        // Format teks untuk prompt
        $statusText = empty($statusRows)
            ? 'Tidak ada transaksi'
            : implode(', ', array_map(fn($s) => "{$s['status']}: {$s['jumlah']}", $statusRows));

        $topBukuText = empty($topBuku)
            ? 'Tidak ada data'
            : implode('; ', array_map(fn($b) => "{$b['judul_buku']} ({$b['total_dipinjam']}x)", $topBuku));

        $topPeminjamText = empty($topPeminjam)
            ? 'Tidak ada data'
            : implode('; ', array_map(fn($p) => "{$p['username']} ({$p['total_pinjam']} pinjaman)", $topPeminjam));

        $bulanLabel = $namaBulan[$bulan];

        $prompt = <<<PROMPT
Kamu adalah "FAPUS AI", analis sistem perpustakaan digital yang profesional dan insightful.

Berdasarkan data perpustakaan FAPUS untuk bulan **{$bulanLabel} {$tahun}** di bawah ini, tulis sebuah **Laporan Ringkasan Eksekutif** yang komprehensif dalam **Bahasa Indonesia yang profesional**.

---
**DATA STATISTIK BULAN {$bulanLabel} {$tahun}:**
- Total Transaksi Peminjaman : {$totalPeminjaman} transaksi
- Breakdown Status           : {$statusText}
- Total Harga/Denda Terkumpul: Rp {$totalDenda}
- 5 Buku Paling Populer      : {$topBukuText}
- 3 Anggota Paling Aktif     : {$topPeminjamText}
---

**FORMAT OUTPUT (gunakan HTML bersih yang akan dirender di browser):**

1. **Ringkasan Eksekutif** — paragraf naratif singkat (2–3 kalimat) tentang kondisi perpustakaan bulan ini
2. **Analisis Tren** — 3 insight penting menggunakan `<ul><li>` dengan penjelasan tiap poin
3. **Rekomendasi Strategis** — 3 rekomendasi spesifik dan actionable menggunakan `<ol><li>`
4. **Skor Kesehatan Perpustakaan** — nilai 0–100 dalam tag `<strong>` dengan warna sesuai skor, beserta alasan singkat (1–2 kalimat)

Gunakan tag HTML: `<h3>`, `<h4>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<hr>`, `<span style="color:...">`.
Jangan gunakan tag `<html>`, `<body>`, atau `<head>`.
PROMPT;

        // ── Kirim ke Google Gemini API ────────────────────────────────────────
        $apiKey = env('GEMINI_API_KEY', '');

        if (empty($apiKey)) {
            return $this->fail(
                'GEMINI_API_KEY belum dikonfigurasi. Tambahkan GEMINI_API_KEY=your_key di file .env',
                500
            );
        }

        $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

        $requestBody = json_encode([
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature'     => 0.7,
                'maxOutputTokens' => 2048,
            ],
        ]);

        $ch = curl_init($geminiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $requestBody,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);

        $rawResponse = curl_exec($ch);
        $httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError   = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return $this->fail('cURL Error: ' . $curlError, 500);
        }

        if ($httpCode !== 200) {
            return $this->fail('Gemini API Error (HTTP ' . $httpCode . '): ' . $rawResponse, 502);
        }

        $decoded = json_decode($rawResponse, true);
        $aiHtml  = $decoded['candidates'][0]['content']['parts'][0]['text']
                   ?? '<p class="text-danger">Tidak ada respons dari AI. Silakan coba lagi.</p>';

        return $this->respond([
            'status'     => 200,
            'bulan'      => $bulanLabel,
            'tahun'      => $tahun,
            'statistics' => [
                'total_peminjaman' => $totalPeminjaman,
                'total_denda'      => $totalDenda,
                'top_buku'         => $topBuku,
                'top_peminjam'     => $topPeminjam,
            ],
            'ai_summary' => $aiHtml,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/laporan/export
    // Query params: ?bulan=6&tahun=2026
    // ─────────────────────────────────────────────────────────────────────────
    public function exportCSV()
    {
        $bulan = (int) $this->request->getGet('bulan') ?: (int) date('m');
        $tahun = (int) $this->request->getGet('tahun') ?: (int) date('Y');

        $db = \Config\Database::connect();

        $data = $db->query("
            SELECT
                p.pinjamID,
                pg.username AS nama_user,
                b.judul_buku,
                p.tanggal_pinjam,
                p.batas_kembali,
                p.tanggal_kembali,
                p.status,
                p.total_denda
            FROM peminjaman p
            LEFT JOIN pengguna pg ON p.userID = pg.userID
            LEFT JOIN (
                SELECT pinjamID, MIN(bukuID) AS bukuID
                FROM detail
                GROUP BY pinjamID
            ) d ON p.pinjamID = d.pinjamID
            LEFT JOIN buku b ON d.bukuID = b.bukuID
            WHERE MONTH(p.tanggal_pinjam) = ? AND YEAR(p.tanggal_pinjam) = ?
            ORDER BY p.tanggal_pinjam ASC
        ", [$bulan, $tahun])->getResultArray();

        $filename = "Laporan_Peminjaman_{$bulan}_{$tahun}.xls";

        // Membangun struktur HTML table yang dapat dibaca oleh MS Excel
        $html = '<html><head><meta charset="UTF-8"></head><body>';
        $html .= '<h2 style="text-align: center;">Laporan Peminjaman Perpustakaan</h2>';
        $html .= '<h4 style="text-align: center;">Bulan: ' . $bulan . ' / Tahun: ' . $tahun . '</h4>';
        $html .= '<table border="1" style="border-collapse: collapse; width: 100%;">';
        
        // Header
        $html .= '<tr style="background-color: #16a34a; color: white; font-weight: bold;">';
        $html .= '<th>ID Peminjaman</th>';
        $html .= '<th>Nama Pengguna</th>';
        $html .= '<th>Judul Buku</th>';
        $html .= '<th>Tanggal Pinjam</th>';
        $html .= '<th>Batas Kembali</th>';
        $html .= '<th>Tanggal Kembali</th>';
        $html .= '<th>Status</th>';
        $html .= '<th>Total Denda</th>';
        $html .= '</tr>';

        // Data
        foreach ($data as $row) {
            $html .= '<tr>';
            $html .= '<td>' . htmlspecialchars($row['pinjamID']) . '</td>';
            $html .= '<td>' . htmlspecialchars($row['nama_user'] ?? '-') . '</td>';
            $html .= '<td>' . htmlspecialchars($row['judul_buku'] ?? '-') . '</td>';
            $html .= '<td>' . htmlspecialchars($row['tanggal_pinjam']) . '</td>';
            $html .= '<td>' . htmlspecialchars($row['batas_kembali']) . '</td>';
            $html .= '<td>' . htmlspecialchars($row['tanggal_kembali'] ?? '-') . '</td>';
            $html .= '<td>' . htmlspecialchars($row['status']) . '</td>';
            $html .= '<td>' . htmlspecialchars($row['total_denda']) . '</td>';
            $html .= '</tr>';
        }

        $html .= '</table></body></html>';

        // Gunakan response CI4 untuk memicu download Excel (.xls)
        return $this->response->download($filename, $html)
                              ->setContentType('application/vnd.ms-excel');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/laporan/archive
    // ─────────────────────────────────────────────────────────────────────────
    public function archive()
    {
        $input = $this->request->getJSON();
        $bulan = isset($input->bulan) ? (int) $input->bulan : (int) date('m');
        $tahun = isset($input->tahun) ? (int) $input->tahun : (int) date('Y');

        $db = \Config\Database::connect();
        
        $db->transStart();

        // Pindahkan data ke arsip_peminjaman
        $db->query("
            INSERT INTO arsip_peminjaman (pinjamID, userID, tanggal_pinjam, batas_kembali, tanggal_kembali, status, total_denda)
            SELECT pinjamID, userID, tanggal_pinjam, batas_kembali, tanggal_kembali, status, total_denda
            FROM peminjaman
            WHERE MONTH(tanggal_pinjam) = ? AND YEAR(tanggal_pinjam) = ?
            AND status IN ('Dikembalikan', 'Ditolak')
        ", [$bulan, $tahun]);

        // Hapus data dari peminjaman
        $db->query("
            DELETE FROM peminjaman
            WHERE MONTH(tanggal_pinjam) = ? AND YEAR(tanggal_pinjam) = ?
            AND status IN ('Dikembalikan', 'Ditolak')
        ", [$bulan, $tahun]);

        $db->transComplete();

        if ($db->transStatus() === false) {
            return $this->fail('Gagal mengarsipkan data', 500);
        }

        return $this->respond([
            'status' => 200,
            'pesan' => "Data peminjaman Selesai/Ditolak bulan $bulan tahun $tahun berhasil diarsipkan."
        ]);
    }
}
