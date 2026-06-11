<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class RakController extends ResourceController
{
    protected $modelName = 'App\Models\RakModel';
    
    protected $format    = 'json'; 

    public function index()
    {
        $data = $this->model->findAll();
        
        return $this->respond([
            'status' => 200,
            'pesan'  => 'Berhasil mengambil data Rak',
            'data'   => $data
        ], 200);
    }

    public function show($id = null)
    {
        $data = $this->model->find($id);
        
        if ($data) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Data Rak ditemukan',
                'data'   => $data
            ], 200);
        }

        return $this->failNotFound("Rak dengan ID $id tidak ditemukan");
    }

    public function create()
    {
        $data = $this->request->getJSON();

        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Rak berhasil ditambahkan',
                'data'   => $data
            ]);
        }

        return $this->fail($this->model->errors());
    }

    public function update($id = null)
    {
        $data = $this->request->getJSON();

        if ($this->model->update($id, $data)) {
            return $this->respond([
                'status' => 200,
                'pesan'  => 'Rak berhasil diupdate',
                'data'   => $data
            ]);
        }

        return $this->fail($this->model->errors());
    }

    public function delete($id = null)
    {
        if ($this->model->delete($id)) {
            return $this->respondDeleted([
                'status' => 200,
                'pesan'  => 'Rak berhasil dihapus',
            ]);
        }

        return $this->failNotFound("Rak dengan ID $id tidak ditemukan");
    }
}