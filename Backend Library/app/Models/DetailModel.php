<?php
namespace App\Models;
use CodeIgniter\Model;

class DetailModel extends Model
{
    protected $table = "detail";
    protected $primaryKey = "detailID";
    protected $useAutoIncrement = true;
    protected $allowedFields = ["pinjamID", "bukuID", "qty"];
    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
