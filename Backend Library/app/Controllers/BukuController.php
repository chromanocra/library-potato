<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\BukuModel;

class BukuController extends ResourceController
{
    protected $modelName = 'App\Models\BukuModel';
    protected $format    = 'json'; 

    // 1. Endpoint: GET /api/buku (Menampilkan semua buku)
    public function index()
    {
        $db      = \Config\Database::connect();
        $builder = $db->table('buku');
        $builder->select('buku.*, kategori.nama_kategori');
        $builder->join('kategori', 'kategori.kategoriID = buku.kategoriID', 'left');
        $query   = $builder->get();
        $data    = $query->getResultArray(); 
        
        // Memformat output agar sesuai dengan yang dibaca oleh Javascript di frontend
        $formattedData = array_map(function($item) {
            return [
                'id_buku'    => $item['bukuID'], // JS membaca 'id_buku'
                'judul'      => $item['judul_buku'], // JS membaca 'judul'
                'pengarang'  => $item['penulis'], // JS membaca 'pengarang'
                'penerbit'   => $item['penerbit'],
                'thn_terbit' => $item['tahun_terbit'],
                'kategori'   => $item['nama_kategori'] ?? '-',
                'id_kategori'=> $item['kategoriID'],
                'cover'      => $item['cover']
            ];
        }, $data);

        return $this->respond($formattedData);
    }

    // 2. Endpoint: GET /api/buku/(:num)
    public function show($id = null)
    {
        $data = $this->model->find($id);
        if ($data) {
            return $this->respond(['status' => 200, 'pesan' => 'Data buku ditemukan', 'data' => $data], 200);
        }
        return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
    }

    // 3. Endpoint: POST /api/buku (Menambahkan buku baru)
    public function create()
    {
        // Menggunakan getPost() karena data dikirim via FormData (multipart/form-data)
        $data = [
            'kategoriID'   => $this->request->getPost('kategori'),
            'judul_buku'   => $this->request->getPost('judul'),
            'penulis'      => $this->request->getPost('pengarang'),
            'penerbit'     => $this->request->getPost('penerbit'),
            'tahun_terbit' => $this->request->getPost('thn_terbit'),
            // isbn bisa diisi null atau generate otomatis jika tidak ada di form
            'isbn'         => null 
        ];

        // Proses Upload Cover
        $fileCover = $this->request->getFile('cover');
        if ($fileCover && $fileCover->isValid() && !$fileCover->hasMoved()) {
            $coverName = $fileCover->getRandomName();
            $fileCover->move(FCPATH . 'uploads/cover', $coverName);
            $data['cover'] = $coverName;
        } else {
            $data['cover'] = 'default.jpg'; // Sesuai default di database Anda
        }

        // Catatan: jml_halaman, deskripsi, isi_buku diabaikan karena tidak ada di database

        if ($this->model->insert($data)) {
            return $this->respondCreated(['status' => 201, 'pesan' => 'Buku berhasil ditambahkan']);
        }
        return $this->fail($this->model->errors());
    }

    // 4. Endpoint: POST /api/buku/(:num) (Mengubah data buku)
    // Walaupun fungsinya update, methodnya POST karena menerima file
    public function update($id = null)
    {
        $bukuLama = $this->model->find($id);
        if (!$bukuLama) {
            return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
        }

        $data = [
            'kategoriID'   => $this->request->getPost('kategori'),
            'judul_buku'   => $this->request->getPost('judul'),
            'penulis'      => $this->request->getPost('pengarang'),
            'penerbit'     => $this->request->getPost('penerbit'),
            'tahun_terbit' => $this->request->getPost('thn_terbit'),
        ];

        // Proses Update Cover (Opsional)
        $fileCover = $this->request->getFile('cover');
        if ($fileCover && $fileCover->isValid() && !$fileCover->hasMoved()) {
            $coverName = $fileCover->getRandomName();
            $fileCover->move(FCPATH . 'uploads/cover', $coverName);
            $data['cover'] = $coverName;
            
            // Hapus cover lama jika bukan default
            if (!empty($bukuLama['cover']) && $bukuLama['cover'] !== 'default.jpg' && file_exists(FCPATH . 'uploads/cover/' . $bukuLama['cover'])) {
                unlink(FCPATH . 'uploads/cover/' . $bukuLama['cover']);
            }
        }

        if ($this->model->update($id, $data)) {
            return $this->respond(['status' => 200, 'pesan' => 'Data buku berhasil diperbarui']);
        }
        return $this->fail($this->model->errors());
    }

    // 5. Endpoint: DELETE /api/buku/(:num) (Menghapus buku)
    public function delete($id = null)
    {
        $buku = $this->model->find($id);
        if (!$buku) {
            return $this->failNotFound("Buku dengan ID $id tidak ditemukan");
        }

        // Hapus file fisik Cover
        if (!empty($buku['cover']) && $buku['cover'] !== 'default.jpg' && file_exists(FCPATH . 'uploads/cover/' . $buku['cover'])) {
            unlink(FCPATH . 'uploads/cover/' . $buku['cover']);
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted(['status' => 200, 'pesan' => "Buku berhasil dihapus"]);
        }
    }
}