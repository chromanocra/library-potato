<?php

namespace App\Models;

use CodeIgniter\Model;

class RakModel extends Model
{
    // Nama tabel di database
    protected $table = "rak";
    // Primary key
    protected $primaryKey = "rakID";
    protected $useAutoIncrement = true;

    // Kolom yang boleh diisi dari Postman
    protected $allowedFields = [
        "nama_rak",
        "lokasi"
    ];
}