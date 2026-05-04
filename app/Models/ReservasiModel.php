<?php

namespace App\Models;
use CodeIgniter\Model;

class ReservasiModel extends Model
{
    protected $table            = 'reservasi';
    protected $primaryKey       = 'reservasiID';
    protected $useAutoIncrement = true;

    // Sesuaikan nama kolom ini dengan yang ada di database lu
    protected $allowedFields    = ['userID', 'bukuID', 'tgl_reservasi', 'status_reservasi','expired_at'];

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
}