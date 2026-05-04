<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

class StokController extends ResourceController
{
    protected $modelName = 'App\Models\StokModel';
    protected $format    = 'json';

    public function index()
    {
        return $this->respond(['status' => 200, 'data' => $this->model->findAll()]);
    }

    public function show($id = null)
    {
        $data = $this->model->find($id);
        if (!$data) return $this->failNotFound('Data stok tidak ditemukan');
        return $this->respond(['status' => 200, 'data' => $data]);
    }

    public function update($id = null)
    {
        $data = $this->request->getJSON();
        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 200, 'pesan' => 'Stok berhasil diupdate']);
        }
        return $this->fail($this->model->errors());
    }
}