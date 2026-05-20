<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
class ReservasiController extends ResourceController
{
    protected $modelName = 'App\Models\ReservasiModel';
    protected $format    = 'json';

    // Endpoint: POST /api/reservasi
    public function create()
    {
        $data = $this->request->getJSON();

        // Simpan data ke database
        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Reservasi berhasil dibuat',
                'data'   => $data
            ]);
        } else {
            // return $this->fail('Gagal membuat reservasi', 500);
            return $this->fail($this->model->errors());
        }
    }
}