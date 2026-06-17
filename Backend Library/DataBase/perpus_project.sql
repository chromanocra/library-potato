-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 17 Jun 2026 pada 15.00
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `perpus_project`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `buku`
--

CREATE TABLE `buku` (
  `bukuID` bigint(20) NOT NULL,
  `kategoriID` bigint(20) DEFAULT NULL,
  `rakID` int(11) DEFAULT NULL,
  `judul_buku` varchar(150) NOT NULL,
  `sinopsis` text DEFAULT NULL,
  `penulis` varchar(100) NOT NULL,
  `penerbit` varchar(100) NOT NULL,
  `tahun_terbit` year(4) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `status_buku` varchar(20) NOT NULL DEFAULT 'Tersedia',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cover` varchar(255) DEFAULT 'default.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `buku`
--

INSERT INTO `buku` (`bukuID`, `kategoriID`, `rakID`, `judul_buku`, `sinopsis`, `penulis`, `penerbit`, `tahun_terbit`, `isbn`, `status_buku`, `created_at`, `updated_at`, `cover`) VALUES
(7, 3, 3, 'Bumi Manusia', 'Novel ini menceritakan kisah cinta antara Minke, seorang pemuda pribumi, dengan Annelies, putri dari tuan tanah Belanda. Kunjungan Minke ke rumah Annelies mengubah hidupnya selamanya. Meskipun mendapat dukungan dari ibunda Annelies, banyak rintangan yang dihadapi karena perbedaan status sosial mereka. Novel ini menggambarkan perjuangan rakyat pribumi melawan penjajahan Belanda di awal abad ke-20.', 'Pramoedya Ananta Toer', 'Gramedia', '1980', '9798659120 ', 'Tersedia', '2026-06-16 21:43:21', '2026-06-16 21:43:21', '1781671401_0f833510f563f0a770f1.png'),
(8, 3, 4, 'Laut Bercerita', 'mengisahkan kekejaman rezim Orde Baru dan perjuangan para aktivis mahasiswa. Cerita ini berfokus pada Biru Laut, seorang mahasiswa yang diculik dan disiksa akibat aktivitas pergerakannya, serta perjuangan keluarga dan kekasihnya yang tak kenal lelah mencari keadilan.', ' Leila S. Chudori', 'Gramedia', '2017', '9786024246945', 'Tersedia', '2026-06-16 22:11:45', '2026-06-16 22:11:45', '1781673105_07a9b2dcb988daa5119e.png');

-- --------------------------------------------------------

--
-- Struktur dari tabel `denda`
--

CREATE TABLE `denda` (
  `dendaID` bigint(20) NOT NULL,
  `pinjamID` bigint(20) DEFAULT NULL,
  `jumlah_denda` decimal(10,2) DEFAULT 0.00,
  `status_denda` enum('unpaid','paid') DEFAULT 'unpaid',
  `tanggal_bayar` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail`
--

CREATE TABLE `detail` (
  `detailID` bigint(20) NOT NULL,
  `pinjamID` bigint(20) DEFAULT NULL,
  `bukuID` bigint(20) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `detail`
--

INSERT INTO `detail` (`detailID`, `pinjamID`, `bukuID`, `qty`, `created_at`, `updated_at`) VALUES
(18, 18, 7, 1, '2026-06-16 21:54:29', '2026-06-16 21:54:29'),
(19, 19, 7, 1, '2026-06-16 22:57:57', '2026-06-16 22:57:57'),
(20, 20, 8, 1, '2026-06-17 00:12:56', '2026-06-17 00:12:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori`
--

CREATE TABLE `kategori` (
  `kategoriID` bigint(20) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `deskripsi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori`
--

INSERT INTO `kategori` (`kategoriID`, `nama_kategori`, `deskripsi`, `created_at`, `updated_at`) VALUES
(2, 'Sains', 'Buku sains', '2026-06-09 22:42:34', '2026-06-09 22:42:34'),
(3, 'Novel', NULL, '2026-06-10 21:08:58', '2026-06-10 21:08:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `peminjaman`
--

CREATE TABLE `peminjaman` (
  `pinjamID` bigint(20) NOT NULL,
  `userID` bigint(20) DEFAULT NULL,
  `tanggal_pinjam` datetime DEFAULT current_timestamp(),
  `batas_kembali` datetime NOT NULL,
  `tanggal_kembali` datetime DEFAULT NULL,
  `status` enum('Pending','Dipinjam','Dikembalikan','Ditolak','Late') DEFAULT 'Pending',
  `total_denda` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `peminjaman`
--

INSERT INTO `peminjaman` (`pinjamID`, `userID`, `tanggal_pinjam`, `batas_kembali`, `tanggal_kembali`, `status`, `total_denda`, `created_at`, `updated_at`) VALUES
(18, 11, '2026-06-17 11:54:00', '2026-06-24 11:54:00', '2026-06-17 06:26:03', 'Dikembalikan', 0.00, '2026-06-16 21:54:29', '2026-06-16 23:26:03'),
(19, 11, '2026-06-17 12:57:00', '2026-06-24 12:57:00', '2026-06-17 06:26:07', 'Dikembalikan', 0.00, '2026-06-16 22:57:57', '2026-06-16 23:26:07'),
(20, 11, '2026-06-17 14:12:00', '2026-06-24 14:12:00', '2026-06-17 07:13:30', 'Dikembalikan', 0.00, '2026-06-17 00:12:56', '2026-06-17 00:13:30');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengguna`
--

CREATE TABLE `pengguna` (
  `userID` bigint(20) NOT NULL,
  `nomor_identitas` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` char(1) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pengguna`
--

INSERT INTO `pengguna` (`userID`, `nomor_identitas`, `role`, `username`, `email`, `gender`, `phone`, `status`, `created_at`, `updated_at`, `password`) VALUES
(11, '1', 'user', 'Fatih', 'jugobodrex@gmail.com', 'L', '085692569477', 'active', '2026-06-15 22:48:39', '2026-06-15 22:52:56', '$2y$10$IANVJoMM3Nklo2bb6CNETuG1VYhHv0G2TVLjDSxUCee0zkXoF9ia.'),
(13, '2', 'admin', 'admin', '15240673@bsi.ac.id', 'L', '081519547287', 'active', '2026-06-15 22:49:35', '2026-06-16 05:49:46', '$2y$10$ejpjEuFcO4u2uejAhIOhQOlWLqxYF6prA33lRClV52L/5y9FCUuCm');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rak`
--

CREATE TABLE `rak` (
  `id` int(11) NOT NULL,
  `nama_rak` varchar(255) NOT NULL,
  `lokasi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rak`
--

INSERT INTO `rak` (`id`, `nama_rak`, `lokasi`) VALUES
(3, 'Novel-01-A', 'Lt 1, Dekat Tangga Menuju Lt 2'),
(4, 'Novel-01-B', 'Lt 1, Toilet Laki-laki');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reservasi`
--

CREATE TABLE `reservasi` (
  `reservasiID` bigint(20) NOT NULL,
  `userID` bigint(20) DEFAULT NULL,
  `bukuID` bigint(20) DEFAULT NULL,
  `tgl_reservasi` datetime DEFAULT current_timestamp(),
  `expired_at` datetime DEFAULT NULL,
  `status_reservasi` enum('pending','approved','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `stok`
--

CREATE TABLE `stok` (
  `stokID` bigint(20) NOT NULL,
  `bukuID` bigint(20) DEFAULT NULL,
  `total_copy` int(11) NOT NULL DEFAULT 0,
  `avail_copy` int(11) NOT NULL DEFAULT 0,
  `borrowed_copy` int(11) NOT NULL DEFAULT 0,
  `reserved_copy` int(11) NOT NULL DEFAULT 0,
  `damaged_copy` int(11) NOT NULL DEFAULT 0,
  `lost_copy` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `stok`
--

INSERT INTO `stok` (`stokID`, `bukuID`, `total_copy`, `avail_copy`, `borrowed_copy`, `reserved_copy`, `damaged_copy`, `lost_copy`, `created_at`, `updated_at`) VALUES
(8, 7, 5, 5, 0, 0, 0, 0, '2026-06-17 04:43:21', '2026-06-16 23:26:07'),
(9, 8, 5, 5, 0, 0, 0, 0, '2026-06-17 05:11:45', '2026-06-17 00:13:30');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `buku`
--
ALTER TABLE `buku`
  ADD PRIMARY KEY (`bukuID`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD UNIQUE KEY `rakID` (`rakID`),
  ADD KEY `FK_buku_kategori` (`kategoriID`);

--
-- Indeks untuk tabel `denda`
--
ALTER TABLE `denda`
  ADD PRIMARY KEY (`dendaID`),
  ADD KEY `FK_denda_pinjam` (`pinjamID`);

--
-- Indeks untuk tabel `detail`
--
ALTER TABLE `detail`
  ADD PRIMARY KEY (`detailID`),
  ADD KEY `FK_detail_pinjam` (`pinjamID`),
  ADD KEY `FK_detail_buku` (`bukuID`);

--
-- Indeks untuk tabel `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`kategoriID`);

--
-- Indeks untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`pinjamID`),
  ADD KEY `FK_peminjaman_user` (`userID`);

--
-- Indeks untuk tabel `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `nomor_identitas` (`nomor_identitas`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indeks untuk tabel `rak`
--
ALTER TABLE `rak`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `reservasi`
--
ALTER TABLE `reservasi`
  ADD PRIMARY KEY (`reservasiID`),
  ADD KEY `FK_reservasi_user` (`userID`),
  ADD KEY `FK_reservasi_buku` (`bukuID`);

--
-- Indeks untuk tabel `stok`
--
ALTER TABLE `stok`
  ADD PRIMARY KEY (`stokID`),
  ADD UNIQUE KEY `bukuID` (`bukuID`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `buku`
--
ALTER TABLE `buku`
  MODIFY `bukuID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `denda`
--
ALTER TABLE `denda`
  MODIFY `dendaID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `detail`
--
ALTER TABLE `detail`
  MODIFY `detailID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `kategori`
--
ALTER TABLE `kategori`
  MODIFY `kategoriID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `pinjamID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `userID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `rak`
--
ALTER TABLE `rak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `reservasi`
--
ALTER TABLE `reservasi`
  MODIFY `reservasiID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stok`
--
ALTER TABLE `stok`
  MODIFY `stokID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `buku`
--
ALTER TABLE `buku`
  ADD CONSTRAINT `FK_buku_kategori` FOREIGN KEY (`kategoriID`) REFERENCES `kategori` (`kategoriID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_buku_rak` FOREIGN KEY (`rakID`) REFERENCES `rak` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `denda`
--
ALTER TABLE `denda`
  ADD CONSTRAINT `FK_denda_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `detail`
--
ALTER TABLE `detail`
  ADD CONSTRAINT `FK_detail_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_detail_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `FK_peminjaman_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reservasi`
--
ALTER TABLE `reservasi`
  ADD CONSTRAINT `FK_reservasi_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_reservasi_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `stok`
--
ALTER TABLE `stok`
  ADD CONSTRAINT `FK_stok_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
