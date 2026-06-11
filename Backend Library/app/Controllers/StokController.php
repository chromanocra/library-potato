<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class StokController extends ResourceController
{
    protected $modelName = '';
    protected $format    = 'json';

    // 1. Ambil Semua Data Stok (GET /api/stok)
    public function index()
    {
        $db      = \Config\Database::connect();
        $builder = $db->table('stok');

        // SELECT dari tabel STOK sebagai primary, JOIN buku untuk judul
        $builder->select('stok.stokID, stok.bukuID, buku.judul_buku AS judul, stok.total_copy, stok.avail_copy, stok.borrowed_copy, stok.damaged_copy, stok.lost_copy');
        $builder->join('buku', 'buku.bukuID = stok.bukuID', 'left');

        $query = $builder->get();
        $data  = $query->getResultArray();

        return $this->respond([
            'status' => 200,
            'data'   => $data
        ]);
    }

    // 2. Ambil Detail Satu Data Stok (GET /api/stok/{id})
    public function show($id = null)
    {
        $db      = \Config\Database::connect();
        $builder = $db->table('stok');

        $builder->select('stok.stokID, stok.bukuID, buku.judul_buku AS judul, stok.total_copy, stok.avail_copy, stok.borrowed_copy, stok.damaged_copy, stok.lost_copy');
        $builder->join('buku', 'buku.bukuID = stok.bukuID', 'left');
        $builder->where('stok.stokID', $id);

        $data = $builder->get()->getRowArray();

        if ($data) {
            return $this->respond([
                'status' => 200,
                'data'   => $data
            ]);
        }

        return $this->failNotFound("Stok dengan ID $id tidak ditemukan");
    }

    // 3. Tambah Data Stok Baru (POST /api/stok)
    public function create()
    {
        $db   = \Config\Database::connect();
        $data = $this->request->getJSON(true);

        if (empty($data)) {
            return $this->fail('Data yang dikirim kosong');
        }

        $simpan = $db->table('stok')->insert($data);

        if ($simpan) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Stok buku baru berhasil ditambahkan'
            ]);
        }

        return $this->fail('Gagal menambahkan stok baru');
    }

    // 4. Update Data Stok (PUT /api/stok/{id})
    public function update($id = null)
    {
        $db   = \Config\Database::connect();
        $data = $this->request->getJSON(true);

        if (empty($data)) {
            return $this->fail('Tidak ada data yang diubah');
        }

        $update = $db->table('stok')->where('stokID', $id)->update($data);

        if ($update) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Stok berhasil diupdate'
            ]);
        }

        return $this->fail('Gagal memperbarui data stok atau tidak ada perubahan data');
    }
}