<?php

namespace App\Models;

use CodeIgniter\Model;

class ReservasiModel extends Model
{
    protected $table = 'reservasi';
    protected $primaryKey = 'reservasiID';

    protected $allowedFields = [
        'userID',
        'bukuID',
        'tgl_reservasi',
        'expired_at',
        'status_reservasi'
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}