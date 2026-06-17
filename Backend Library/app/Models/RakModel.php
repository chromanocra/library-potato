<?php

namespace App\Models;

use CodeIgniter\Model;

class RakModel extends Model
{
    protected $table = 'rak';

    protected $primaryKey = 'id';

    protected $useAutoIncrement = true;

    protected $returnType = 'array';

    protected $allowedFields = [
        'nama_rak',
        'lokasi'
    ];
}