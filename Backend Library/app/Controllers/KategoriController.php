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
        $data = $this->model->find($id);
        
        if ($data) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Data kategori ditemukan',
                'data'   => $data
            ], 200);
        }

        return $this->failNotFound("Kategori dengan ID $id tidak ditemukan");
    }

    // 3. Endpoint: POST /api/kategori (Menambahkan kategori baru)
    public function create()
    {
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

    // 4. Endpoint: PUT /api/kategori/(:num) (Update kategori)
    public function update($id = null)
    {
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

     // 5. Endpoint: DELETE /api/kategori/(:num) (Menghapus kategori)
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