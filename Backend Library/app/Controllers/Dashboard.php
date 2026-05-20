<?php

namespace App\Controllers;

class Dashboard extends BaseController
{
    protected $helpers = ['url'];

    public function index()
    {
        $db = \Config\Database::connect();

        $query = $db->query("SELECT * FROM buku");
        $hasil = $query->getResultArray();

        $data = [
            'judul' => 'Perpustakaan CI4',
            'buku'  => $hasil
        ];

        return view('index', $data);
    }
}
