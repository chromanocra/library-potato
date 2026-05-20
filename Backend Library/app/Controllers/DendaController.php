<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
class DendaController extends ResourceController
{
    protected $modelName = 'App\Models\DendaModel';
    protected $format    = 'json';

    // Endpoint: POST /api/denda
    public function create()
    {
        $data = $this->request->getJSON();

        // Simpan data ke database
        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Denda berhasil dibuat',
                'data'   => $data
            ]);
        } else {
            // return $this->fail('Gagal membuat denda', 500);  
            return $this->fail($this->model->errors());
        }
    }
}