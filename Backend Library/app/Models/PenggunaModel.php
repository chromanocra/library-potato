<?php

namespace App\Models;

use CodeIgniter\Model;

class PenggunaModel extends Model
{
    // Nama tabel di database
    protected $table = "pengguna";
    // Primary key
    protected $primaryKey = "userID";
    protected $useAutoIncrement = true;

    // Kolom yang boleh diisi dari Postman (penggunaID gak usah karena auto increment)
    protected $allowedFields = [
        "nomor_identitas",
        "role",
        "username",
        "email",
        "gender",
        "phone",
        "status",
        "created_at",
        "updated_at",
        "password",
    ];

    // Urusan waktu otomatis
    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
