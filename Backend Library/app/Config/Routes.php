<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get("home", "Home::index");

#Router api untuk pengguna (auth)
$routes->post('api/register', 'PenggunaController::register');// routes masuk ke method register() di PenggunaController untuk registrasi pengguna baru
$routes->post('api/login', 'PenggunaController::login');// routes masuk ke method register() di PenggunaController untuk registrasi pengguna baru

#Router api untuk buku
$routes->get('api/buku', 'BukuController::index');// routes masuk ke method index() di BukuController untuk menampilkan semua buku
$routes-> get ('api/buku/(:num)', 'BukuController::show/$1'); // routes masuk ke method show($id) di BukuController, $1 adalah parameter ID yang dikirim
$routes->post('api/buku', 'BukuController::create');// routes masuk ke method create() di BukuController untuk menambahkan buku baru
$routes->put('api/buku/(:num)', 'BukuController::update/$1'); // routes masuk ke method update($id) di BukuController untuk update buku berdasarkan ID
$routes->delete('api/buku/(:num)', 'BukuController::delete/$1'); // routes masuk ke method delete($id) di BukuController untuk delete buku berdasarkan ID

#router api untuk reservasi
$routes-> post("api/reservasi", "ReservasiController::create"); // routes masuk ke method create() di ReservasiController untuk menambahkan reservasi baru
$routes->get("api/reservasi", "ReservasiController::index"); // routes masuk ke method index() di ReservasiController untuk menampilkan semua reservasi

#router api untuk kategori
$routes->get("api/kategori", "KategoriController::index"); // routes masuk ke method index() di KategoriController
$routes->get("api/kategori/(:num)", 'KategoriController::show/$1'); // routes masuk ke method show($id) di KategoriController, $1 adalah parameter ID yang dikirim
$routes->post("api/kategori", "KategoriController::create"); // routes masuk ke method create() di KategoriController untuk menambahkan kategori baru
$routes->put("api/kategori/(:num)", 'KategoriController::update/$1'); // routes masuk ke method update($id) di KategoriController untuk update kategori berdasarkan ID
$routes->delete("api/kategori/(:num)", 'KategoriController::delete/$1'); //routes masuk ke method delete($id) di KategoriController untuk delete kategori berdasarkan ID

#router api untuk pengguna (auth)
$routes->get("api/pengguna", "PenggunaController::index"); // routes masuk ke method index() di PenggunaController untuk menampilkan semua pengguna
$routes->post("api/pengguna/register", "PenggunaController::register"); // routes masuk ke method register() di PenggunaController untuk registrasi pengguna baru
$routes->post("api/pengguna/login", "PenggunaController::login"); // routes masuk ke method login() di PenggunaController untuk login pengguna

#router api untuk denda
$routes->get("api/denda", "DendaController::index"); // routes masuk ke method index() di DendaController untuk menampilkan semua denda
$routes->post("api/denda", "DendaController::create"); // routes masuk ke method create() di DendaController untuk menambahkan denda baru

#router api untuk peminjaman
$routes->get("api/peminjaman", "PeminjamanController::index"); // routes masuk ke method index() di PeminjamanController untuk menampilkan semua peminjaman
$routes->post("api/peminjaman", "PeminjamanController::create"); // routes masuk ke method create() di Peminjaman

#router api untuk stok
$routes->get("api/stok", "StokController::index"); // routes masuk ke method index() di StokController untuk menampilkan semua stok
$routes->post("api/stok", "StokController::create"); // routes masuk ke method create() di
