<?php

namespace App\Models;
use CodeIgniter\Model;

class PeminjamanModel extends Model
{
    protected $table = "peminjaman";
    protected $primaryKey = "peminjamanID";
    protected $useAutoIncrement = true;

    // Sesuaikan nama kolom ini dengan yang ada di database lu
    protected $allowedFields = [
        "userID",
        "tanggal_pinjam",
        "batas_kembali",
        "tanggal_kembali",
        "status",
        "total_denda",
    ];

    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
