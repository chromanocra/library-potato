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

        return $this->respond([
            'status'       => 200,
            'total_books'  => $totalBooks,
            'total_users'  => $totalUsers,
            'active_loans' => $activeLoans,
        ]);
    }
}
