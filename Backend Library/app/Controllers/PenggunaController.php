<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\PenggunaModel;

class PenggunaController extends ResourceController
{
    protected $format = "json";

    /**
     * GET /api/pengguna
     * Menampilkan semua daftar member (pengguna dengan role 'user')
     */
    public function index()
    {
        $model = new PenggunaModel();

        // Ambil semua pengguna yang memiliki role 'user'
        $data = $model->where("role", "user")->findAll();

        // Hilangkan password dari array agar aman tidak bocor ke frontend
        foreach ($data as &$user) {
            unset($user["password"]);
        }

        return $this->respond([
            "status" => 200,
            "pesan"  => "Berhasil mengambil data member",
            "data"   => $data,
        ], 200);
    }

    /**
     * POST /api/pengguna/register
     * Mendaftarkan user baru dengan role default 'user'
     */
    public function register()
    {
        $input = $this->request->getJSON(true);

        if (empty($input)) {
            return $this->fail([
                "status" => 400,
                "pesan"  => "Data tidak boleh kosong. Kirim JSON dengan Content-Type: application/json.",
            ], 400);
        }

        // Aturan Validasi
        $rules = [
            "nomor_identitas" => "required|is_unique[pengguna.nomor_identitas]",
            "username"        => "required|min_length[3]|is_unique[pengguna.username]",
            "email"           => "required|valid_email|is_unique[pengguna.email]",
            "password"        => "required|min_length[6]",
            "phone"           => "required|min_length[9]|max_length[15]",
            "gender"          => "required|in_list[Laki-laki,Perempuan]",
        ];

        $messages = [
            "nomor_identitas" => [
                "required"  => "Nomor identitas wajib diisi.",
                "is_unique" => "Nomor identitas sudah terdaftar.",
            ],
            "username" => [
                "required"   => "Username wajib diisi.",
                "min_length" => "Username minimal 3 karakter.",
                "is_unique"  => "Username sudah digunakan, coba yang lain.",
            ],
            "email" => [
                "required"    => "Email wajib diisi.",
                "valid_email" => "Format email tidak valid.",
                "is_unique"   => "Email sudah terdaftar.",
            ],
            "password" => [
                "required"   => "Password wajib diisi.",
                "min_length" => "Password minimal 6 karakter.",
            ],
            "phone" => [
                "required"   => "Nomor telepon wajib diisi.",
                "min_length" => "Nomor telepon minimal 9 digit.",
                "max_length" => "Nomor telepon maksimal 15 digit.",
            ],
            "gender" => [
                "required" => "Jenis kelamin wajib dipilih.",
                "in_list"  => "Jenis kelamin harus Laki-laki atau Perempuan.",
            ],
        ];

        if (!$this->validate($rules, $messages)) {
            return $this->fail([
                "status" => 400,
                "pesan"  => "Validasi gagal. Periksa data yang dikirim.",
                "errors" => $this->validator->getErrors(),
            ], 400);
        }

        $model = new PenggunaModel();

        // Siapkan data
        $dataInsert = [
            "nomor_identitas" => $input["nomor_identitas"],
            "username"        => $input["username"],
            "email"           => $input["email"],
            "phone"           => $input["phone"],
            "gender"          => $input["gender"],
            "password"        => password_hash($input["password"], PASSWORD_DEFAULT),
            "role"            => "user", 
        ];

        if ($model->insert($dataInsert)) {
            return $this->respondCreated([
                "status" => 201,
                "pesan"  => "Registrasi berhasil! Silakan login.",
            ]);
        }

        return $this->fail([
            "status" => 500,
            "pesan"  => "Registrasi gagal. Silakan coba lagi.",
            "errors" => $model->errors(),
        ], 500);
    }

    /**
     * POST /api/pengguna/login
     * Verifikasi username + password
     */
    public function login()
    {
        $input = $this->request->getJSON(true);

        if (empty($input) || empty($input["username"]) || empty($input["password"])) {
            return $this->fail([
                "status" => 400,
                "pesan"  => "Username dan password wajib diisi.",
            ], 400);
        }

        $model = new PenggunaModel();

        // Cari user. Pastikan returnType dari model adalah 'array'
        $user = $model->where("username", $input["username"])->first();

        // Jika user tidak ditemukan
        if (!$user) {
            return $this->fail([
                "status" => 401,
                "pesan"  => "Username tidak ditemukan.",
            ], 401);
        }

        // Verifikasi password
        if (!password_verify($input["password"], $user["password"])) {
            return $this->fail([
                "status" => 401,
                "pesan"  => "Password yang Anda masukkan salah.",
            ], 401);
        }

        // Safety check untuk role: Jika di database kolom role kosong/null, paksa jadi 'user'
        $userRole = $user["role"] ?? 'user';

        // Hapus password agar tidak bocor ke frontend
        unset($user["password"]);

        return $this->respond([
            "status" => 200,
            "pesan"  => "Login berhasil!",
            "role"   => $userRole, 
            "data"   => $user,
        ], 200);
    }

    /**
     * PUT /api/pengguna/(:num)
     * Update data member berdasarkan userID
     */
    public function update($id = null)
    {
        $input = $this->request->getJSON(true);
        
        if (empty($input)) {
            return $this->fail(["pesan" => "Data tidak boleh kosong"], 400);
        }

        $model = new PenggunaModel();
        
        // Cek apakah data dengan userID tersebut ada
        $user = $model->find($id);
        if (!$user) {
            return $this->failNotFound("Data pengguna tidak ditemukan");
        }

        // Siapkan data yang akan diupdate, jika kosong gunakan data lama
        $dataUpdate = [
            "username" => $input["username"] ?? $user["username"],
            "email"    => $input["email"] ?? $user["email"],
            "phone"    => $input["phone"] ?? $user["phone"],
            "gender"   => $input["gender"] ?? $user["gender"]
        ];

        // Jika password diisi dari frontend, hash password barunya
        if (!empty($input["password"])) {
            $dataUpdate["password"] = password_hash($input["password"], PASSWORD_DEFAULT);
        }

        if ($model->update($id, $dataUpdate)) {
            return $this->respond([
                "status" => 200,
                "pesan"  => "Data pengguna berhasil diupdate"
            ]);
        }

        return $this->fail(["pesan" => "Gagal update data pengguna", "errors" => $model->errors()], 500);
    }

    /**
     * DELETE /api/pengguna/(:num)
     * Hapus data member berdasarkan userID
     */
    public function delete($id = null)
    {
        $model = new PenggunaModel();
        
        // Cek apakah data dengan userID tersebut ada
        $user = $model->find($id);
        if (!$user) {
            return $this->failNotFound("Data pengguna tidak ditemukan");
        }

        if ($model->delete($id)) {
            return $this->respondDeleted([
                "status" => 200,
                "pesan"  => "Data pengguna berhasil dihapus"
            ]);
        }

        return $this->fail(["pesan" => "Gagal menghapus data pengguna"], 500);
    }
}