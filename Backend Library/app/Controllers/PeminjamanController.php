<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class PeminjamanController extends ResourceController
{
    protected $modelName = "App\Models\PeminjamanModel";
    protected $format = "json";

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/peminjaman  —  Admin: semua transaksi dengan JOIN lengkap
    // ─────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $db = \Config\Database::connect();

        $data = $db
            ->query(
                "
            SELECT
                p.pinjamID   AS pinjamID,
                p.userID,
                p.tanggal_pinjam,
                p.batas_kembali,
                p.tanggal_kembali,
                p.status,
                p.total_denda,
                pg.nomor_identitas,
                pg.username       AS nama_user,
                b.judul_buku,
                b.cover           AS cover_buku
            FROM peminjaman p
            LEFT JOIN pengguna pg ON p.userID = pg.userID
            LEFT JOIN (
                SELECT pinjamID, MIN(bukuID) AS bukuID
                FROM   detail
                GROUP  BY pinjamID
            ) d ON p.pinjamID = d.pinjamID
            LEFT JOIN buku b ON d.bukuID = b.bukuID
            ORDER BY p.pinjamID DESC
        ",
            )
            ->getResultArray();

        return $this->respond(["status" => 200, "data" => $data]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/peminjaman/user/{userID}  —  Riwayat milik satu pengguna
    // ─────────────────────────────────────────────────────────────────────────
    public function userHistory($userID = null)
    {
        if (!$userID) {
            return $this->fail("userID wajib disertakan", 400);
        }

        $db = \Config\Database::connect();

        $data = $db
            ->query(
                "
            SELECT
                p.pinjamID   AS pinjamID,
                p.tanggal_pinjam,
                p.batas_kembali,
                p.tanggal_kembali,
                p.status,
                p.total_denda,
                pg.username       AS nama_user,
                pg.nomor_identitas,
                b.judul_buku,
                b.cover           AS cover_buku
            FROM peminjaman p
            LEFT JOIN pengguna pg ON p.userID = pg.userID
            LEFT JOIN (
                SELECT pinjamID, MIN(bukuID) AS bukuID
                FROM   detail
                GROUP  BY pinjamID
            ) d ON p.pinjamID = d.pinjamID
            LEFT JOIN buku b ON d.bukuID = b.bukuID
            WHERE p.userID = ?
            ORDER BY p.pinjamID DESC
        ",
                [$userID],
            )
            ->getResultArray();

        return $this->respond(["status" => 200, "data" => $data]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/peminjaman  —  User mengajukan pinjaman baru (status: Pending)
    // ─────────────────────────────────────────────────────────────────────────
    public function create()
    {
        return $this->fail(
            'Peminjaman tidak boleh dibuat langsung. Gunakan Reservasi.',
            400
        );
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/peminjaman/{id}/approve  —  Admin menyetujui + set harga
    // ─────────────────────────────────────────────────────────────────────────
    public function approve($id = null)
    {
        $peminjaman = $this->model->find($id);
        if (!$peminjaman) {
            return $this->failNotFound("Data peminjaman tidak ditemukan");
        }
        if ($peminjaman["status"] !== "Pending") {
            return $this->fail(
                "Hanya transaksi berstatus Pending yang dapat disetujui",
                400,
            );
        }

        $input = $this->request->getJSON();
        $harga = isset($input->harga) ? (float) $input->harga : 0;

        $this->model->update($id, [
            "status" => "Dipinjam",
            "total_denda" => $harga,
        ]);

        return $this->respond([
            "status" => 200,
            "pesan" => "Peminjaman berhasil disetujui!",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/peminjaman/{id}/reject  —  Admin menolak + pulihkan stok
    // ─────────────────────────────────────────────────────────────────────────
    public function reject($id = null)
    {
        $peminjaman = $this->model->find($id);
        if (!$peminjaman) {
            return $this->failNotFound("Data peminjaman tidak ditemukan");
        }
        if ($peminjaman["status"] !== "Pending") {
            return $this->fail(
                "Hanya transaksi berstatus Pending yang dapat ditolak",
                400,
            );
        }

        // Pulihkan stok semua buku dalam transaksi ini
        $stokModel = new \App\Models\StokModel();
        $detailModel = new \App\Models\DetailModel();

        $details = $detailModel->where("pinjamID", $id)->findAll();
        foreach ($details as $detail) {
            $stok = $stokModel->where("bukuID", $detail["bukuID"])->first();
            if ($stok) {
                $stokModel->update($stok["stokID"], [
                    "avail_copy" =>
                    (int) $stok["avail_copy"] + (int) $detail["qty"],
                    "borrowed_copy" => max(
                        0,
                        (int) $stok["borrowed_copy"] - (int) $detail["qty"],
                    ),
                ]);
            }
        }

        $this->model->update($id, ["status" => "Ditolak"]);

        return $this->respond([
            "status" => 200,
            "pesan" => "Peminjaman ditolak dan stok buku telah dipulihkan.",
        ]);
    }
}
