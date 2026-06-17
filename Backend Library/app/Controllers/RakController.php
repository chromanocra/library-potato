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
        $json = $this->request->getJSON();

        $data = [
            'nama_rak' => $json->nama_rak ?? '',
            'lokasi'   => $json->lokasi ?? ''
        ];

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
        // WAJIB menggunakan getJSON() karena frontend mengirim data via fetch API 'application/json'
        $json = $this->request->getJSON();

        // Cek apakah data JSON berhasil ditangkap
        if ($json) {
            $data = [
                'nama_rak' => $json->nama_rak,
                'lokasi'   => $json->lokasi
            ];
        } else {
            // Fallback jika dikirim lewat format lain
            $data = [
                'nama_rak' => $this->request->getRawInputVar('nama_rak'),
                'lokasi'   => $this->request->getRawInputVar('lokasi')
            ];
        }

        // Lakukan proses update ke database menggunakan Model
        $this->model->update($id, $data);

        return $this->respond([
            'status' => 200,
            'pesan' => 'Data rak berhasil diupdate'
        ]);
    }

    public function delete($id = null)
    {
        // Pastikan ID ada dan valid
        if ($id) {
            // Eksekusi hapus ke database
            $this->model->delete($id);

            return $this->respondDeleted([
                'status' => 200,
                'pesan' => 'Data rak berhasil dihapus'
            ]);
        }

        return $this->failNotFound('ID Rak tidak ditemukan');
    }
}
