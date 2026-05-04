<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class PenggunaController extends ResourceController
{
    protected $modelName = 'App\Models\PenggunaModel';
    protected $format    = 'json';

    // Endpoint: POST /api/login
    public function login()
    {
        // Tangkap data JSON dari Postman (misal user kirim email dan password)
        $input = $this->request->getJSON();

        // Validasi input kosong
        if (!$input || !isset($input->email) || !isset($input->password)) {
            return $this->fail('Email dan password harus diisi', 400);
        }

        // Cari user berdasarkan email lewat Model
        $user = $this->model->where('email', $input->email)->first();

        // Jika user tidak ditemukan
        if (!$user) {
            return $this->failNotFound('User tidak ditemukan');
        }

        // Cek password (karena kita baru belajar, asumsikan password belum di-hash/encrypt)
        if ($user['password'] !== $input->password) {
            return $this->fail('Password salah', 401);
        }

        // Jika login sukses, kembalikan data user (TANPA passwordnya)
        unset($user['password']);

        return $this->respond([
            'status' => 200,
            'pesan'  => 'Login berhasil!',
            'role'   => $user['role'], // Bakal ketahuan dia admin atau user
            'data'   => $user
        ], 200);
    }

    // Endpoint: POST /api/register
    // Endpoint: POST /api/register
    public function register()
    {
        $data = $this->request->getJSON(true);

        // 1. Buat Aturan Validasi (Cek email harus unik di tabel pengguna)
        $aturan = [
            'email'    => 'required|valid_email|is_unique[pengguna.email]',
            'username' => 'required',
            'password' => 'required'
        ];

        // 2. Jalankan Validasi
        if (!$this->validate($aturan)) {
            // Jika validasi gagal (misal email sudah dipakai)
            return $this->fail([
                'status' => 400,
                'pesan'  => 'Data tidak valid',
                'error'  => $this->validator->getErrors()
            ]);
        }

        // 3. Simpan data ke database (kalau validasi lolos)
        if ($this->model->insert($data)) {
            return $this->respondCreated([
                'status' => 201,
                'pesan'  => 'Registrasi berhasil',
                'data'   => $data
            ]);
        }

        // Jika ada gagal dari sisi model
        return $this->fail($this->model->errors());
    }
}
