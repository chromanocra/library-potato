<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class KategoriController extends ResourceController
{
    // Kasih tahu Controller ini pakai Model yang mana
    protected $modelName = 'App\Models\KategoriModel';
    
    // Set format output ke JSON (Wajib untuk API)
    protected $format    = 'json'; 

    // 1. Endpoint: GET /api/kategori (Menampilkan semua kategori)
    public function index()
    {
        // Ambil semua data dari tabel kategori lewat Model
        $data = $this->model->findAll();
        
        return $this->respond([
            'status' => 200,
            'pesan'  => 'Berhasil mengambil data kategori',
            'data'   => $data
        ], 200);
    }

    // 2. Endpoint: GET /api/kategori/(:num) (Menampilkan 1 kategori spesifik)
    public function show($id = null)
    {
        // Cari kategori berdasarkan kategoriID
        $data = $this->model->find($id);
        
        // Jika datanya ada
        if ($data) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Data kategori ditemukan',
                'data'   => $data
            ], 200);
        }

        // Jika datanya tidak ada (ID tidak valid)
        return $this->failNotFound("Kategori dengan ID $id tidak ditemukan");
    }

    // Postingan untuk menambahkan kategori baru bisa ditambahkan di sini (create)
    public function create()
    {
        // Menangkap data JSON yang dikirim oleh user/frontend
        $data = $this->request->getJSON();

        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Kategori berhasil ditambahkan',
                'data'   => $data
            ]);
        }

        return $this->fail($this->model->errors());
    }


    // Putingan untuk update kategori bisa ditambahkan di sini (update)
    public function update($id = null)
    {
        // Menangkap data JSON yang dikirim oleh user/frontend
        $data = $this->request->getJSON();

        if ($this->model->update($id, $data)) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Kategori berhasil diupdate',
                'data'   => $data
            ]);
        }

        return $this->fail($this->model->errors());
    }

     // Delete kategori bisa ditambahkan di sini (delete)
     public function delete($id = null)
     {
         if ($this->model->delete($id)) {
             return $this->respondDeleted([
                 'status' => 200,
                 'pesan'  => 'Kategori berhasil dihapus',
             ]);
         }

         return $this->failNotFound("Kategori dengan ID $id tidak ditemukan");
     }
}