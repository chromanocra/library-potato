<?php

namespace App\Models;

use CodeIgniter\Model;

class BukuModel extends Model
{
    protected $table = "buku";
    protected $primaryKey = "bukuID";
    protected $useAutoIncrement = true;

    // Disinkronkan dengan kolom di database phpMyAdmin Anda
    protected $allowedFields = [
        "kategoriID",
        "judul_buku",
        "cover",
        "penulis",
        "penerbit",
        "tahun_terbit",
        "isbn"
    ];

    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}