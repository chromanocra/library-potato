<?php
namespace App\Models;
use CodeIgniter\Model;

class StokModel extends Model
{
    protected $table = "stok";
    protected $primaryKey = "stokID";
    protected $useAutoIncrement = true;
    protected $allowedFields = [
        "bukuID",
        "total_copy",
        "avail_copy",
        "borrowed_copy",
        "reserved_copy",
        "damaged_copy",
        "lost_copy",
    ];
    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
