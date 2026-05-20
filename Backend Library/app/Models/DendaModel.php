<?php

namespace App\Models;
use CodeIgniter\Model;

class DendaModel extends Model
{
    protected $table = "denda";
    protected $primaryKey = "dendaID";
    protected $useAutoIncrement = true;

    // Sesuaikan nama kolom ini dengan yang ada di database lu
    protected $allowedFields = [
        "pinjamID",
        "jumlah_denda",
        "status_denda",
        "tanggal_bayar",
    ];

    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
