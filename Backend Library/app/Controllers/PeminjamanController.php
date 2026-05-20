<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class PeminjamanController extends ResourceController
{
    protected $modelName = 'App\Models\PeminjamanModel';
    protected $format    = 'json';

    // Endpoint: GET /api/peminjaman
    public function index()
    {
        return $this->respond([
            'status' => 200,
            'data'   => $this->model->findAll()
        ], 200);
    }

    // Endpoint: POST /api/peminjaman (Menyimpan Peminjaman + Detail Sekaligus)
    public function create()
    {
        // Panggil database untuk fitur "Transaksi Aman"
        $db = \Config\Database::connect();
        $data = $this->request->getJSON();

        // Validasi input dasar
        if (!isset($data->userID) || !isset($data->batas_kembali) || !isset($data->buku_yang_dipinjam)) {
            return $this->fail('Data userID, batas_kembali, dan buku_yang_dipinjam wajib diisi', 400);
        }

        // Mulai Transaksi (Kalau ada yang gagal di tengah jalan, semua dibatalkan/rollback)
        $db->transStart();

        // 1. Simpan data ke tabel `peminjaman`
        $peminjamanData = [
            'userID'        => $data->userID,
            'batas_kembali' => $data->batas_kembali,
            // status dan tanggal_pinjam otomatis diurus oleh database/model
        ];
        $this->model->insert($peminjamanData);
        
        // Ambil pinjamID yang barusan dibuat
        $pinjamID = $this->model->getInsertID();

        // 2. Simpan data ke tabel `detail`
        $detailModel = new \App\Models\DetailModel();
        foreach ($data->buku_yang_dipinjam as $buku) {
            $detailModel->insert([
                'pinjamID' => $pinjamID,
                'bukuID'   => $buku->bukuID,
                'qty'      => isset($buku->qty) ? $buku->qty : 1 // Default qty 1 kalau gak dikirim
            ]);
        }

        // Selesai Transaksi
        $db->transComplete();

        // Cek apakah transaksi sukses atau ada yang nyangkut
        if ($db->transStatus() === false) {
            return $this->fail('Gagal menyimpan peminjaman dan detailnya', 500);
        }

        return $this->respondCreated([
            'status'   => 201,
            'pesan'    => 'Peminjaman dan detail berhasil dibuat!',
            'pinjamID' => $pinjamID
        ]);
    }
}