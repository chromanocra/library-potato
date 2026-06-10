<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get("home", "Home::index");

$routes->post("api/register", "PenggunaController::register");
$routes->post("api/login", "PenggunaController::login");

$routes->group("api", function ($routes) {
    // ── Auth Endpoints ─────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────────────────────

    $routes->get("buku", "BukuController::index");
    $routes->get("buku/(:num)", 'BukuController::show/$1');
    $routes->post("buku", "BukuController::create");

    // UBAH BARIS INI: Gunakan method post() agar bisa menerima upload file edit cover
    $routes->post("buku/(:num)", 'BukuController::update/$1');

    $routes->delete("buku/(:num)", 'BukuController::delete/$1');

    $routes->get("kategori", "KategoriController::index"); // routes masuk ke method index() di KategoriController
    $routes->get("kategori/(:num)", 'KategoriController::show/$1'); // routes masuk ke method show($id) di KategoriController, $1 adalah parameter ID yang dikirim
    $routes->post("kategori", "KategoriController::create"); // routes masuk ke method create() di KategoriController untuk menambahkan kategori baru
    $routes->put("kategori/(:num)", 'KategoriController::update/$1'); // routes masuk ke method update($id) di KategoriController untuk update kategori berdasarkan ID
    $routes->delete("kategori/(:num)", 'KategoriController::delete/$1'); //routes masuk ke method delete($id) di KategoriController untuk delete kategori berdasarkan ID

    $routes->get("pengguna", "PenggunaController::index"); // routes masuk ke method index() di PenggunaController untuk menampilkan semua pengguna
    $routes->post("pengguna/register", "PenggunaController::register"); // routes masuk ke method register() di PenggunaController untuk registrasi pengguna baru
    $routes->post("pengguna/login", "PenggunaController::login"); // routes masuk ke method login() di PenggunaController untuk login pengguna
    // TAMBAHKAN DUA BARIS INI UNTUK EDIT DAN HAPUS
    $routes->put("pengguna/(:num)", "PenggunaController::update/$1");
    $routes->delete("pengguna/(:num)", "PenggunaController::delete/$1");
    // ── Suspend / Unsuspend user account ─────────────────────────────────────
    $routes->put(
        "pengguna/(:num)/suspend",
        "PenggunaController::toggleSuspend/$1",
    );

    $routes->get("denda", "DendaController::index"); // routes masuk ke method index() di DendaController untuk menampilkan semua denda
    $routes->post("denda", "DendaController::create"); // routes masuk ke method create() di DendaController untuk menambahkan denda baru

    // ── Peminjaman — basis ────────────────────────────────────────────────────
    $routes->get("peminjaman", "PeminjamanController::index");
    $routes->post("peminjaman", "PeminjamanController::create");

    // ── Peminjaman — Workflow Approval (letakkan SEBELUM :num generik) ────────
    $routes->get(
        "peminjaman/user/(:any)",
        "PeminjamanController::userHistory/$1",
    );
    $routes->put(
        "peminjaman/(:num)/approve",
        "PeminjamanController::approve/$1",
    );
    $routes->put("peminjaman/(:num)/reject", "PeminjamanController::reject/$1");

    // ── Laporan AI ────────────────────────────────────────────────────────────
    $routes->post("laporan/ai", "LaporanController::generateAI");

    $routes->get("stok", "StokController::index"); // routes masuk ke method index() di StokController untuk menampilkan semua stok
    $routes->post("stok", "StokController::create"); // routes masuk ke method create() di

    // ── FITUR 2: Analytics Dashboard ─────────────────────────────────────────
    $routes->get("analytics", "AnalyticsController::index");

    // ── FITUR 3: Reservasi Buku ───────────────────────────────────────────────
    $routes->get('api/reservasi', 'ReservasiController::index');

    $routes->post('api/reservasi', 'ReservasiController::create');

    $routes->put('api/reservasi/(:num)/approve', 'ReservasiController::approve/$1');

    $routes->put('api/reservasi/(:num)/reject', 'ReservasiController::reject/$1');

    $routes->get('api/reservasi/user/(:num)', 'ReservasiController::userHistory/$1');
});
