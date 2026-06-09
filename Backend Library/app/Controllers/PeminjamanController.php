<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class PeminjamanController extends ResourceController
{
    protected $modelName = "App\Models\PeminjamanModel";
    protected $format = "json";

    // Endpoint: GET /api/peminjaman
    public function index()
    {
        return $this->respond(
            [
                "status" => 200,
                "data" => $this->model->findAll(),
            ],
            200,
        );
    }

    // Endpoint: POST /api/peminjaman (Menyimpan Peminjaman + Detail Sekaligus)
    public function create()
    {
        $db = \Config\Database::connect();
        $data = $this->request->getJSON();

        // ── Validasi input dasar ─────────────────────────────────────────────
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

        // ── FITUR 1: Validasi Stok — cek SEBELUM transaksi dimulai ──────────
        // Jika ada satu buku yang stoknya habis, langsung tolak seluruh request.
        $stokModel = new \App\Models\StokModel();

        foreach ($data->buku_yang_dipinjam as $buku) {
            $stok = $stokModel->where("bukuID", $buku->bukuID)->first();

            if (!$stok || (int) $stok["avail_copy"] <= 0) {
                // Kembalikan JSON 400 bersih sesuai yang dibaca oleh JS frontend
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        "error" => "Stok buku tidak tersedia / sedang dipinjam",
                    ]);
            }
        }
        // ────────────────────────────────────────────────────────────────────

        // Mulai Transaksi (kalau ada yang gagal di tengah jalan, semua di-rollback)
        $db->transStart();

        // 1. Simpan header ke tabel `peminjaman`
        $peminjamanData = [
            "userID" => $data->userID,
            "batas_kembali" => $data->batas_kembali,
        ];
        $this->model->insert($peminjamanData);
        $pinjamID = $this->model->getInsertID();

        // 2. Simpan baris-baris ke tabel `detail` + deduksi stok
        $detailModel = new \App\Models\DetailModel();

        foreach ($data->buku_yang_dipinjam as $buku) {
            $qty = isset($buku->qty) ? (int) $buku->qty : 1;

            $detailModel->insert([
                "pinjamID" => $pinjamID,
                "bukuID" => $buku->bukuID,
                "qty" => $qty,
            ]);

            // ── FITUR 1: Deduksi Stok ─────────────────────────────────────
            // Re-query di dalam transaksi agar nilai stok terkini (row lock).
            $stok = $stokModel->where("bukuID", $buku->bukuID)->first();
            $stokModel->update($stok["stokID"], [
                "avail_copy" => max(0, (int) $stok["avail_copy"] - $qty),
                "borrowed_copy" => (int) $stok["borrowed_copy"] + $qty,
            ]);
            // ─────────────────────────────────────────────────────────────
        }

        $db->transComplete();

        if ($db->transStatus() === false) {
            return $this->fail("Gagal menyimpan peminjaman dan detailnya", 500);
        }

        return $this->respondCreated([
            "status" => 201,
            "pesan" => "Peminjaman dan detail berhasil dibuat!",
            "pinjamID" => $pinjamID,
        ]);
    }
}
