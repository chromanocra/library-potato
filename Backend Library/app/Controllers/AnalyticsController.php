<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class AnalyticsController extends ResourceController
{
    protected $format = 'json';

    /**
     * GET /api/analytics
     * Mengembalikan ringkasan statistik untuk Admin Dashboard.
     */
    public function index()
    {
        $db = \Config\Database::connect();

        // Total koleksi buku
        $totalBooks = (int) $db->table('buku')->countAll();

        // Total anggota aktif (hanya role = 'user', bukan admin)
        $totalUsers = (int) $db->table('pengguna')
            ->where('role', 'user')
            ->countAll();

        // Peminjaman aktif = belum ada tanggal pengembalian
        $activeLoans = (int) $db->table('peminjaman')
            ->where('tanggal_kembali IS NULL', null, false)
            ->countAll();

        // Buku paling sering dipinjam (Top 5)
        $topBooks = $db->query("
            SELECT b.judul_buku, COUNT(d.bukuID) as total_dipinjam
            FROM detail d
            JOIN buku b ON d.bukuID = b.bukuID
            GROUP BY d.bukuID, b.judul_buku
            ORDER BY total_dipinjam DESC
            LIMIT 5
        ")->getResultArray();

        return $this->respond([
            'status'       => 200,
            'total_books'  => $totalBooks,
            'total_users'  => $totalUsers,
            'active_loans' => $activeLoans,
            'top_books'    => $topBooks,
        ]);
    }
}
