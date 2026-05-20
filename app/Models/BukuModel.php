<?php

namespace App\Models;

use CodeIgniter\Model;

class BukuModel extends Model
{
    // Nama tabel di database Anda
    protected $table = "buku";

    // Primary key dari tabel buku
    protected $primaryKey = "bukuID";

    // Aktifkan auto increment karena bukuID menggunakan AUTO_INCREMENT
    protected $useAutoIncrement = true;

    // Kolom apa saja yang boleh diisi/diubah melalui API nanti
    protected $allowedFields = [
        "kategoriID",
        "judul_buku",
        "penulis",
        "penerbit",
        "tahun_terbit",
        "isbn",
    ];

    // Karena di tabel Anda ada created_at dan updated_at, kita suruh CI4 urus otomatis
    protected $useTimestamps = true;
    protected $createdField = "created_at";
    protected $updatedField = "updated_at";
}
