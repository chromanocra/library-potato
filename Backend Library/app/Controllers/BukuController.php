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
        $builder->select('buku.*, kategori.nama_kategori, stok.total_copy, stok.avail_copy');
        $builder->join('kategori', 'kategori.kategoriID = buku.kategoriID', 'left');
        $builder->join('stok', 'stok.bukuID = buku.bukuID', 'left');
        $query   = $builder->get();
        $data    = $query->getResultArray();

        // Memformat output agar sesuai dengan yang dibaca oleh Javascript di frontend
        $formattedData = array_map(function ($item) {
            return [
                'id_buku'    => $item['bukuID'], // JS membaca 'id_buku'
                'judul'      => $item['judul_buku'], // JS membaca 'judul'
                'pengarang'  => $item['penulis'], // JS membaca 'pengarang'
                'penerbit'   => $item['penerbit'],
                'thn_terbit' => $item['tahun_terbit'],
                'kategori'   => $item['nama_kategori'] ?? '-',
                'id_kategori' => $item['kategoriID'],
                'cover'      => $item['cover'],
                'total_copy' => $item['total_copy'] ?? 0,
                'avail_copy' => $item['avail_copy'] ?? 0
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
        $data = [
            'kategoriID'   => $this->request->getPost('kategoriID') ?: $this->request->getPost('kategori'),
            'judul_buku'   => $this->request->getPost('judul'),
            'penulis'      => $this->request->getPost('pengarang'),
            'penerbit'     => $this->request->getPost('penerbit'),
            'tahun_terbit' => $this->request->getPost('thn_terbit'),
            'isbn'         => $this->request->getPost('isbn')
        ];

        $fileCover = $this->request->getFile('cover');

        if ($fileCover && $fileCover->isValid() && !$fileCover->hasMoved()) {
            $coverName = $fileCover->getRandomName();

            if (!is_dir(FCPATH . 'uploads/cover')) {
                mkdir(FCPATH . 'uploads/cover', 0777, true);
            }

            $fileCover->move(FCPATH . 'uploads/cover', $coverName);

            $data['cover'] = $coverName;
        } else {
            $data['cover'] = 'default.jpg';
        }

        if ($this->model->insert($data)) {

            $bukuID = $this->model->getInsertID();

            $db = \Config\Database::connect();

            $db->table('stok')->insert([
                'bukuID'        => $bukuID,
                'total_copy'    => 10,
                'avail_copy'    => 10,
                'borrowed_copy' => 0,
                'reserved_copy' => 0,
                'damaged_copy'  => 0,
                'lost_copy'     => 0
            ]);

            return $this->respondCreated([
                'status' => true,
                'pesan'  => 'Buku berhasil ditambahkan'
            ]);
        }

        return $this->respond([
            'status' => false,
            'errors' => $this->model->errors(),
            'data'   => $data
        ], 400);
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
            'kategoriID'   => $this->request->getPost('kategoriID') ?: $this->request->getPost('kategori'),
            'judul_buku'   => $this->request->getPost('judul'),
            'penulis'      => $this->request->getPost('pengarang'),
            'penerbit'     => $this->request->getPost('penerbit'),
            'tahun_terbit' => $this->request->getPost('thn_terbit'),
            'isbn'         => $this->request->getPost('isbn')
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

    // 6. Endpoint: POST /api/buku/(:num)/stok (Update Stok)
    public function updateStok($id = null)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('stok');
        
        $totalCopy = $this->request->getPost('total_copy');
        $availCopy = $this->request->getPost('avail_copy');

        if ($totalCopy === null || $availCopy === null) {
             return $this->fail('total_copy dan avail_copy harus diisi', 400);
        }

        $builder->where('bukuID', $id);
        if ($builder->update(['total_copy' => $totalCopy, 'avail_copy' => $availCopy])) {
            return $this->respond(['status' => 200, 'pesan' => 'Stok buku berhasil diperbarui']);
        }
        
        return $this->fail('Gagal memperbarui stok', 500);
    }
}
