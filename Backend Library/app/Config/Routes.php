<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get("home", "Home::index");

$routes->post("api/register", "PenggunaController::register");
$routes->post("api/login", "PenggunaController::login");

$routes->group("api", function ($routes) {
    $routes->get("buku", "BukuController::index");
    $routes->get("buku/(:num)", 'BukuController::show/$1');
    $routes->post("buku", "BukuController::create");
    $routes->post("buku/(:num)", 'BukuController::update/$1');
    $routes->delete("buku/(:num)", 'BukuController::delete/$1');
    $routes->post('buku/(:num)/stok', 'BukuController::updateStok/$1');


    $routes->get("kategori", "KategoriController::index"); // routes masuk ke method index() di KategoriController
    $routes->get("kategori/(:num)", 'KategoriController::show/$1'); // routes masuk ke method show($id) di KategoriController, $1 adalah parameter ID yang dikirim
    $routes->post("kategori", "KategoriController::create"); // routes masuk ke method create() di KategoriController untuk menambahkan kategori baru
    $routes->put("kategori/(:num)", 'KategoriController::update/$1'); // routes masuk ke method update($id) di KategoriController untuk update kategori berdasarkan ID
    $routes->delete("kategori/(:num)", 'KategoriController::delete/$1'); //routes masuk ke method delete($id) di KategoriController untuk delete kategori berdasarkan ID

    $routes->get('rak', 'RakController::index');
    $routes->get('rak/(:num)', 'RakController::show/$1');
    $routes->post('rak', 'RakController::create');
    $routes->put('rak/(:num)', 'RakController::update/$1');
    $routes->delete('rak/(:num)', 'RakController::delete/$1');

    $routes->get("pengguna", "PenggunaController::index"); // routes masuk ke method index() di PenggunaController untuk menampilkan semua pengguna
    $routes->post("pengguna/register", "PenggunaController::register"); // routes masuk ke method register() di PenggunaController untuk registrasi pengguna baru
    $routes->post("pengguna/login", "PenggunaController::login"); // routes masuk ke method login() di PenggunaController untuk login pengguna
    $routes->put("pengguna/(:num)", "PenggunaController::update/$1");
    $routes->delete("pengguna/(:num)", "PenggunaController::delete/$1");
    // ── Suspend / Unsuspend user account ─────────────────────────────────────
    $routes->put(
        "pengguna/(:num)/suspend",
        "PenggunaController::toggleSuspend/$1",
    );

    $routes->get("denda", "DendaController::index"); // routes masuk ke method index() di DendaController untuk menampilkan semua denda
    $routes->post("denda", "DendaController::create"); // routes masuk ke method create() di DendaController untuk menambahkan denda baru

    // ─────────────────────────────────────────────────────────────────────────
    // Modul Peminjaman
    // ─────────────────────────────────────────────────────────────────────────
    $routes->get("peminjaman", "PeminjamanController::index");
    $routes->post("peminjaman", "PeminjamanController::create");
    $routes->post("peminjaman/manual", "PeminjamanController::manual");

    // Rute dengan parameter spesifik diletakkan sebelum :num generik
    $routes->get(
        "peminjaman/user/(:any)",
        "PeminjamanController::userHistory/$1",
    );
    $routes->put(
        "peminjaman/(:num)/approve",
        "PeminjamanController::approve/$1",
    );
    $routes->put("peminjaman/(:num)/reject", "PeminjamanController::reject/$1");
    $routes->put("peminjaman/(:num)/kembali", "PeminjamanController::kembalikan/$1");

    // ── Laporan AI & Export ───────────────────────────────────────────────────
    $routes->post("laporan/ai", "LaporanController::generateAI");
    $routes->get("laporan/export", "LaporanController::exportCSV");
    $routes->post("laporan/archive", "LaporanController::archive");

    $routes->get("stok", "StokController::index");
    $routes->get("stok/(:num)", "StokController::show/$1");  // <-- WAJIB untuk buka modal edit
    $routes->post("stok", "StokController::create");
    $routes->put("stok/(:num)", "StokController::update/$1"); // <-- WAJIB untuk simpan perubahan

    // ── FITUR 2: Analytics Dashboard ─────────────────────────────────────────
    $routes->get("analytics", "AnalyticsController::index");
});
