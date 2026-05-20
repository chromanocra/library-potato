<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class BukuController extends ResourceController
{
    // Kasih tahu Controller ini pakai Model yang mana
    protected $modelName = 'App\Models\BukuModel';
    
    // Set format output ke JSON (Wajib untuk API)
    protected $format    = 'json'; 

    // 1. Endpoint: GET /api/buku (Menampilkan semua buku)
    public function index()
    {
        // Ambil semua data dari tabel buku lewat Model
        $data = $this->model->findAll();
        
        return $this->respond([
            'status' => 200,
            'pesan'  => 'Berhasil mengambil data buku',
            'data'   => $data
        ], 200);
    }

    // 2. Endpoint: GET /api/buku/(:num) (Menampilkan 1 buku spesifik)
    public function show($id = null)
    {
        // Cari buku berdasarkan bukuID
        $data = $this->model->find($id);
        
        // Jika datanya ada
        if ($data) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Data buku ditemukan',
                'data'   => $data
            ], 200);
        }

        // Jika datanya tidak ada (ID tidak valid)
        return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
    }

    // 3. Endpoint: POST /api/buku (Menambahkan buku baru)
    public function create()
    {
        // Menangkap data JSON yang dikirim oleh user/frontend
        $data = $this->request->getJSON();

        // Menyimpan data ke database melalui Model
        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Buku berhasil ditambahkan',
                'data'   => $data
            ]);
        }

        // Jika gagal (misal ada field yang salah), tampilkan error
        return $this->fail($this->model->errors());
    }

    // 4. Endpoint: PUT /api/buku/(:num) (Mengubah data buku)
    public function update($id = null)
    {
        // Menangkap data JSON yang baru
        $data = $this->request->getJSON();

        // Cek dulu apakah buku dengan ID tersebut ada di database
        if (!$this->model->find($id)) {
            return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
        }

        // Lakukan update data
        if ($this->model->update($id, $data)) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Data buku berhasil diperbarui'
            ], 200);
        }

        return $this->fail($this->model->errors());
    }

    // 5. Endpoint: DELETE /api/buku/(:num) (Menghapus buku)
    public function delete($id = null)
    {
        // Cek dulu apakah buku ada
        if (!$this->model->find($id)) {
            return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
        }

        // Hapus data
        if ($this->model->delete($id)) {
            return $this->respondDeleted([
                'status' => 200,
                'pesan'  => "Buku dengan ID $id berhasil dihapus"
            ]);
        }
    }
}