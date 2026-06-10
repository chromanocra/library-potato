<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class ReservasiController extends ResourceController
{
    protected $modelName = 'App\Models\ReservasiModel';
    protected $format = 'json';

    public function index()
    {
        $db = \Config\Database::connect();

        $data = $db->query("
        SELECT
            r.reservasiID,
            r.userID,
            r.bukuID,
            r.tgl_reservasi,
            r.expired_at,
            r.status_reservasi,
            p.username,
            p.nomor_identitas,
            b.judul_buku,
            b.cover
        FROM reservasi r
        LEFT JOIN pengguna p ON p.userID=r.userID
        LEFT JOIN buku b ON b.bukuID=r.bukuID
        ORDER BY r.reservasiID DESC
    ")->getResultArray();

        return $this->respond([
            'status' => 200,
            'data' => $data
        ]);
    }

    public function create()
    {
        $data = $this->request->getJSON();

        $model = new \App\Models\ReservasiModel();

        $model->insert([
            'userID'            => $data->userID,
            'bukuID'            => $data->bukuID,
            'tgl_reservasi'     => date('Y-m-d H:i:s'),
            'expired_at'        => date('Y-m-d H:i:s', strtotime('+2 day')),
            'status_reservasi'  => 'pending'
        ]);

        return $this->respondCreated([
            'status' => 201,
            'pesan' => 'Reservasi berhasil dibuat'
        ]);
    }

    public function approve($id)
    {
        $reservasiModel = new \App\Models\ReservasiModel();

        $reservasi = $reservasiModel->find($id);

        if (!$reservasi) {
            return $this->failNotFound();
        }

        $pinjamModel = new \App\Models\PeminjamanModel();

        $pinjamModel->insert([
            'userID' => $reservasi['userID'],
            'tanggal_pinjam' => date('Y-m-d H:i:s'),
            'batas_kembali' => date('Y-m-d H:i:s', strtotime('+7 day')),
            'status' => 'Dipinjam',
            'total_denda' => 0
        ]);

        $pinjamID = $pinjamModel->getInsertID();

        $detailModel = new \App\Models\DetailModel();

        $detailModel->insert([
            'pinjamID' => $pinjamID,
            'bukuID' => $reservasi['bukuID'],
            'qty' => 1
        ]);

        $reservasiModel->update($id, [
            'status_reservasi' => 'approved'
        ]);

        return $this->respond([
            'status' => 200,
            'pesan' => 'Reservasi disetujui'
        ]);
    }

    public function reject($id)
    {
        $model = new \App\Models\ReservasiModel();

        $model->update($id, [
            'status_reservasi' => 'cancelled'
        ]);

        return $this->respond([
            'status' => 200,
            'pesan' => 'Reservasi ditolak'
        ]);
    }

    public function userHistory($userID)
    {
        $db = \Config\Database::connect();

        $data = $db->query("
        SELECT
            r.*,
            b.judul_buku,
            b.cover
        FROM reservasi r
        LEFT JOIN buku b
            ON b.bukuID = r.bukuID
        WHERE r.userID = ?
        ORDER BY r.reservasiID DESC
    ", [$userID])->getResultArray();

        return $this->respond([
            'status' => 200,
            'data' => $data
        ]);
    }
}