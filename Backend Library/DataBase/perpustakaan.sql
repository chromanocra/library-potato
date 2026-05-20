-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: perpustakaan
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `buku`
--

DROP TABLE IF EXISTS `buku`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buku` (
  `bukuID` bigint NOT NULL AUTO_INCREMENT,
  `kategoriID` bigint DEFAULT NULL,
  `judul_buku` varchar(150) NOT NULL,
  `penulis` varchar(100) NOT NULL,
  `penerbit` varchar(100) NOT NULL,
  `tahun_terbit` year DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`bukuID`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `FK_buku_kategori` (`kategoriID`),
  CONSTRAINT `FK_buku_kategori` FOREIGN KEY (`kategoriID`) REFERENCES `kategori` (`kategoriID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buku`
--

LOCK TABLES `buku` WRITE;
/*!40000 ALTER TABLE `buku` DISABLE KEYS */;
/*!40000 ALTER TABLE `buku` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denda`
--

DROP TABLE IF EXISTS `denda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denda` (
  `dendaID` bigint NOT NULL AUTO_INCREMENT,
  `pinjamID` bigint DEFAULT NULL,
  `jumlah_denda` decimal(10,2) DEFAULT '0.00',
  `status_denda` enum('unpaid','paid') DEFAULT 'unpaid',
  `tanggal_bayar` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dendaID`),
  KEY `FK_denda_pinjam` (`pinjamID`),
  CONSTRAINT `FK_denda_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denda`
--

LOCK TABLES `denda` WRITE;
/*!40000 ALTER TABLE `denda` DISABLE KEYS */;
/*!40000 ALTER TABLE `denda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detail`
--

DROP TABLE IF EXISTS `detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detail` (
  `detailID` bigint NOT NULL AUTO_INCREMENT,
  `pinjamID` bigint DEFAULT NULL,
  `bukuID` bigint DEFAULT NULL,
  `qty` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`detailID`),
  KEY `FK_detail_pinjam` (`pinjamID`),
  KEY `FK_detail_buku` (`bukuID`),
  CONSTRAINT `FK_detail_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_detail_pinjam` FOREIGN KEY (`pinjamID`) REFERENCES `peminjaman` (`pinjamID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail`
--

LOCK TABLES `detail` WRITE;
/*!40000 ALTER TABLE `detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori` (
  `kategoriID` bigint NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(50) NOT NULL,
  `deskripsi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kategoriID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
/*!40000 ALTER TABLE `kategori` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peminjaman`
--

DROP TABLE IF EXISTS `peminjaman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `peminjaman` (
  `pinjamID` bigint NOT NULL AUTO_INCREMENT,
  `userID` bigint DEFAULT NULL,
  `tanggal_pinjam` datetime DEFAULT CURRENT_TIMESTAMP,
  `batas_kembali` datetime NOT NULL,
  `tanggal_kembali` datetime DEFAULT NULL,
  `status` enum('borrowed','returned','late') DEFAULT 'borrowed',
  `total_denda` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pinjamID`),
  KEY `FK_peminjaman_user` (`userID`),
  CONSTRAINT `FK_peminjaman_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peminjaman`
--

LOCK TABLES `peminjaman` WRITE;
/*!40000 ALTER TABLE `peminjaman` DISABLE KEYS */;
/*!40000 ALTER TABLE `peminjaman` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengguna`
--

DROP TABLE IF EXISTS `pengguna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengguna` (
  `userID` bigint NOT NULL AUTO_INCREMENT,
  `nomor_identitas` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` char(1) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `nomor_identitas` (`nomor_identitas`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengguna`
--

LOCK TABLES `pengguna` WRITE;
/*!40000 ALTER TABLE `pengguna` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengguna` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservasi`
--

DROP TABLE IF EXISTS `reservasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservasi` (
  `reservasiID` bigint NOT NULL AUTO_INCREMENT,
  `userID` bigint DEFAULT NULL,
  `bukuID` bigint DEFAULT NULL,
  `tgl_reservasi` datetime DEFAULT CURRENT_TIMESTAMP,
  `expired_at` datetime DEFAULT NULL,
  `status_reservasi` enum('pending','approved','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reservasiID`),
  KEY `FK_reservasi_user` (`userID`),
  KEY `FK_reservasi_buku` (`bukuID`),
  CONSTRAINT `FK_reservasi_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_reservasi_user` FOREIGN KEY (`userID`) REFERENCES `pengguna` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservasi`
--

LOCK TABLES `reservasi` WRITE;
/*!40000 ALTER TABLE `reservasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stok`
--

DROP TABLE IF EXISTS `stok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stok` (
  `stokID` bigint NOT NULL AUTO_INCREMENT,
  `bukuID` bigint DEFAULT NULL,
  `total_copy` int NOT NULL DEFAULT '0',
  `avail_copy` int NOT NULL DEFAULT '0',
  `borrowed_copy` int NOT NULL DEFAULT '0',
  `reserved_copy` int NOT NULL DEFAULT '0',
  `damaged_copy` int NOT NULL DEFAULT '0',
  `lost_copy` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stokID`),
  UNIQUE KEY `bukuID` (`bukuID`),
  CONSTRAINT `FK_stok_buku` FOREIGN KEY (`bukuID`) REFERENCES `buku` (`bukuID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stok`
--

LOCK TABLES `stok` WRITE;
/*!40000 ALTER TABLE `stok` DISABLE KEYS */;
/*!40000 ALTER TABLE `stok` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01 14:39:59
