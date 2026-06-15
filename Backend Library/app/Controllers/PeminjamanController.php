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
        $db = \Config\Database::connect();
        $data = $this->request->getJSON();

        if (
            !isset($data->userID) ||
            !isset($data->batas_kembali) ||
            !isset($data->buku_yang_dipinjam)
        ) {
            return $this->fail(
                "Data userID, batas_kembali, dan buku_yang_dipinjam wajib diisi",
                400,
            );
        }

        // Validasi stok sebelum memulai transaksi DB
        $stokModel = new \App\Models\StokModel();
        foreach ($data->buku_yang_dipinjam as $buku) {
            $stok = $stokModel->where("bukuID", $buku->bukuID)->first();
            if (!$stok || (int) $stok["avail_copy"] <= 0) {
                return $this->response->setStatusCode(400)->setJSON([
                    "error" => "Stok buku tidak tersedia / sedang dipinjam",
                ]);
            }
        }

        $db->transStart();

        // Simpan header peminjaman — status Pending, denda = 0
        $this->model->insert([
            "userID" => $data->userID,
            "tanggal_pinjam" => $data->tanggal_pinjam ?? date('Y-m-d H:i:s'),
            "batas_kembali" => $data->batas_kembali,
            "status" => "Pending",
            "total_denda" => 0,
        ]);
        $pinjamID = $this->model->getInsertID();

        $detailModel = new \App\Models\DetailModel();
        foreach ($data->buku_yang_dipinjam as $buku) {
            $qty = isset($buku->qty) ? (int) $buku->qty : 1;

            $detailModel->insert([
                "pinjamID" => $pinjamID,
                "bukuID" => $buku->bukuID,
                "qty" => $qty,
            ]);

            // Reservasi stok (sementara dikurangi; dipulihkan saat ditolak)
            $stok = $stokModel->where("bukuID", $buku->bukuID)->first();
            $stokModel->update($stok["stokID"], [
                "avail_copy" => max(0, (int) $stok["avail_copy"] - $qty),
                "borrowed_copy" => (int) $stok["borrowed_copy"] + $qty,
            ]);
        }

        $db->transComplete();

        if ($db->transStatus() === false) {
            $errorDB = $db->error();
            $errorModel = $this->model->errors();
            $errorDetail = $detailModel->errors();
            $errorStok = $stokModel->errors();
            return $this->fail("Gagal menyimpan peminjaman: DB " . json_encode($errorDB) . " | pinjamID: " . $pinjamID . " | Peminjaman " . json_encode($errorModel) . " | Detail " . json_encode($errorDetail) . " | Stok " . json_encode($errorStok), 500);
        }

        return $this->respondCreated([
            "status" => 201,
            "pesan" => "Pengajuan berhasil! Menunggu persetujuan Admin.",
            "pinjamID" => $pinjamID,
        ]);
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

        $this->model->update($id, [
            "status" => "Dipinjam",
            "total_denda" => 0, // Reset denda
        ]);

        return $this->respond([
            "status" => 200,
            "pesan" => "Peminjaman berhasil disetujui!",
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/peminjaman/{id}/kembali  —  Buku dikembalikan, hitung denda
    // ─────────────────────────────────────────────────────────────────────────
    public function kembalikan($id = null)
    {
        $peminjaman = $this->model->find($id);
        if (!$peminjaman) {
            return $this->failNotFound("Data peminjaman tidak ditemukan");
        }
        if ($peminjaman["status"] !== "Dipinjam") {
            return $this->fail("Buku belum/tidak sedang dipinjam", 400);
        }

        // Hitung denda: 25000 per minggu keterlambatan
        $batasKembali = new \DateTime($peminjaman['batas_kembali']);
        $tglKembali = new \DateTime(); // Hari ini
        
        $totalDenda = 0;
        if ($tglKembali > $batasKembali) {
            $selisihHari = $tglKembali->diff($batasKembali)->days;
            $mingguTerlambat = ceil($selisihHari / 7);
            $totalDenda = $mingguTerlambat * 25000;
        }

        $this->model->update($id, [
            "status" => "Dikembalikan",
            "tanggal_kembali" => $tglKembali->format('Y-m-d H:i:s'),
            "total_denda" => $totalDenda
        ]);

        // Pulihkan stok buku
        $stokModel = new \App\Models\StokModel();
        $detailModel = new \App\Models\DetailModel();

        $details = $detailModel->where("pinjamID", $id)->findAll();
        foreach ($details as $detail) {
            $stok = $stokModel->where("bukuID", $detail["bukuID"])->first();
            if ($stok) {
                $stokModel->update($stok["stokID"], [
                    "avail_copy" => (int) $stok["avail_copy"] + (int) $detail["qty"],
                    "borrowed_copy" => max(0, (int) $stok["borrowed_copy"] - (int) $detail["qty"]),
                ]);
            }
        }

        return $this->respond([
            "status" => 200,
            "pesan" => "Buku berhasil dikembalikan. Total denda: Rp " . number_format($totalDenda, 0, ',', '.'),
            "denda" => $totalDenda
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

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/peminjaman/manual  —  Admin membuat peminjaman manual
    // ─────────────────────────────────────────────────────────────────────────
    public function manual()
    {
        $db = \Config\Database::connect();
        $data = $this->request->getJSON();

        if (!isset($data->userID) || !isset($data->batas_kembali) || !isset($data->bukuID)) {
            return $this->fail("Data userID, batas_kembali, dan bukuID wajib diisi", 400);
        }

        $stokModel = new \App\Models\StokModel();
        $stok = $stokModel->where("bukuID", $data->bukuID)->first();
        if (!$stok || (int) $stok["avail_copy"] <= 0) {
            return $this->fail("Stok buku tidak tersedia", 400);
        }

        $db->transStart();

        // Status langsung Dipinjam karena Admin yang buat
        $this->model->insert([
            "userID" => $data->userID,
            "batas_kembali" => $data->batas_kembali,
            "status" => "Dipinjam",
            "total_denda" => 0,
            "tanggal_pinjam" => date('Y-m-d H:i:s')
        ]);
        $pinjamID = $this->model->getInsertID();

        $detailModel = new \App\Models\DetailModel();
        $detailModel->insert([
            "pinjamID" => $pinjamID,
            "bukuID" => $data->bukuID,
            "qty" => 1,
        ]);

        // Kurangi avail_copy, tambah borrowed_copy
        $stokModel->update($stok["stokID"], [
            "avail_copy" => max(0, (int) $stok["avail_copy"] - 1),
            "borrowed_copy" => (int) $stok["borrowed_copy"] + 1,
        ]);

        $db->transComplete();

        if ($db->transStatus() === false) {
            return $this->fail("Gagal menyimpan peminjaman manual", 500);
        }

        return $this->respondCreated([
            "status" => 201,
            "pesan" => "Peminjaman manual berhasil dibuat!",
            "pinjamID" => $pinjamID,
        ]);
    }
}
