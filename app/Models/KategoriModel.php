<?php

namespace App\Models;
use CodeIgniter\Model;

class KategoriModel extends Model
{
    // Nama tabel di database
    protected $table = "kategori";

    // Primary key
    protected $primaryKey = "kategoriID";
    protected $useAutoIncrement = true;

    // Kolom yang boleh diisi dari Postman (kategoriID gak usah karena auto increment)
    protected $allowedFields = ["nama_kategori", "deskripsi"];

    // Urusan waktu otomatis
    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
