-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2026 at 06:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `perpus_adspl`
--

-- --------------------------------------------------------

--
-- Table structure for table `buku`
--

CREATE TABLE `buku` (
  `bukuID` bigint(20) NOT NULL,
  `kategoriID` bigint(20) DEFAULT NULL,
  `judul_buku` varchar(150) NOT NULL,
  `cover` varchar(255) NOT NULL DEFAULT 'default.jpg',
  `penulis` varchar(100) NOT NULL,
  `penerbit` varchar(100) NOT NULL,
  `tahun_terbit` year(4) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buku`
--

INSERT INTO `buku` (`bukuID`, `kategoriID`, `judul_buku`, `cover`, `penulis`, `penerbit`, `tahun_terbit`, `isbn`, `created_at`, `updated_at`) VALUES
(2, 1, 'Bumi Manusia', '1781099628_111d42c3b05773db74c5.png', 'Pramoedya Ananta Toer', 'Gramedia', '1980', '9798659120 ', '2026-06-10 06:53:48', '2026-06-10 06:53:48');

-- --------------------------------------------------------

--
-- Table structure for table `denda`
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
-- Table structure for table `detail`
--

CREATE TABLE `detail` (
  `detailID` bigint(20) NOT NULL,
  `pinjamID` bigint(20) DEFAULT NULL,
  `bukuID` bigint(20) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `kategoriID` bigint(20) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`kategoriID`, `nama_kategori`, `created_at`, `updated_at`) VALUES
(1, 'Novel', '2026-06-10 05:02:30', '2026-06-10 05:02:30'),
(2, 'Light Novel', '2026-06-10 05:03:24', '2026-06-10 05:03:24');

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `pinjamID` bigint(20) NOT NULL,
  `userID` bigint(20) DEFAULT NULL,
  `tanggal_pinjam` datetime DEFAULT current_timestamp(),
  `batas_kembali` datetime NOT NULL,
  `tanggal_kembali` datetime DEFAULT NULL,
  `status` enum('borrowed','returned','late') DEFAULT 'borrowed',
  `total_denda` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `userID` bigint(20) NOT NULL,
  `nomor_identitas` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` char(1) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengguna`
--

INSERT INTO `pengguna` (`userID`, `nomor_identitas`, `role`, `username`, `password`, `email`, `gender`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(5, 'FatihAdmin', 'admin', 'Rai', '$2y$10$DegKkg3YpQRipYceQ1KWheLgPkEOR9QMFuui/KKyOtg3.U4boeWeK', 'fathh.hh27@gmail.com', 'L', '081519547287', 'active', '2026-06-10 04:59:21', '2026-06-10 11:59:33'),
(6, 'Fatih27', 'user', 'Fatih', '$2y$10$LJBzwThfarTdhTYrrrGNA.h.pqjTR46a98w10ku5kIpx1KnLF8zDm', '15240673@bsi.ac.id', 'L', '085692569477', 'active', '2026-06-10 06:55:31', '2026-06-10 06:55:31');

-- --------------------------------------------------------

--
-- Table structure for table `reservasi`
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
-- Table structure for table `stok`
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
-- Dumping data for table `stok`
--

INSERT INTO `stok` (`stokID`, `bukuID`, `total_copy`, `avail_copy`, `borrowed_copy`, `reserved_copy`, `damaged_copy`, `lost_copy`, `created_at`, `updated_at`) VALUES
(1, NULL, 10, 10, 0, 0, 0, 0, '2026-06-10 13:27:37', '2026-06-10 13:27:37'),
(2, 2, 10, 9, 1, 0, 0, 0, '2026-06-10 13:53:48', '2026-06-10 06:55:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `buku`
--
ALTER TABLE `buku`
  ADD PRIMARY KEY (`bukuID`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `FK_buku_kategori` (`kategoriID`);

--
-- Indexes for table `denda`
--
ALTER TABLE `denda`
  ADD PRIMARY KEY (`dendaID`),
  ADD KEY `FK_denda_pinjam` (`pinjamID`);

--
-- Indexes for table `detail`
--
ALTER TABLE `detail`
  ADD PRIMARY KEY (`detailID`),
  ADD KEY `FK_detail_pinjam` (`pinjamID`),
  ADD KEY `FK_detail_buku` (`bukuID`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`kategoriID`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`pinjamID`),
  ADD KEY `FK_peminjaman_user` (`userID`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `nomor_identitas` (`nomor_identitas`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD PRIMARY KEY (`reservasiID`),
  ADD KEY `FK_reservasi_user` (`userID`),
  ADD KEY `FK_reservasi_buku` (`bukuID`);

--
-- Indexes for table `stok`
--
ALTER TABLE `stok`
  ADD PRIMARY KEY (`stokID`),
  ADD UNIQUE KEY `bukuID` (`bukuID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `buku`
--
ALTER TABLE `buku`
  MODIFY `bukuID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `denda`
--
ALTER TABLE `denda`
  MODIFY `dendaID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `detail`
--
ALTER TABLE `detail`
  MODIFY `detailID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `kategoriID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `pinjamID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `userID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reservasi`
--
ALTER TABLE `reservasi`
  MODIFY `reservasiID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stok`
--
ALTER TABLE `stok`
  MODIFY `stokID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `buku`
--
ALTER TABLE `buku`
  ADD CONSTRAINT `FK_buku_kategori` FOREIGN KEY (`kategoriID`) REFERENCES `kategori` (`kategoriID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `denda`
--
ALTER TABLE `denda`
  ADD CONSTRAINT `FK_denda_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `detail`
--
ALTER TABLE `detail`
  ADD CONSTRAINT `FK_detail_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_detail_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `FK_peminjaman_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reservasi`
--
ALTER TABLE `reservasi`
  ADD CONSTRAINT `FK_reservasi_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_reservasi_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stok`
--
ALTER TABLE `stok`
  ADD CONSTRAINT `FK_stok_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
