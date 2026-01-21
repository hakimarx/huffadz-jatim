-- =====================================================
-- HUFFADZ JATIM - PRODUCTION DATABASE SETUP
-- hafizjatim.my.id
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+07:00";

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin_provinsi', 'admin_kabko', 'hafiz') NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `kabupaten_kota` VARCHAR(100) DEFAULT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_verified` TINYINT(1) DEFAULT 0,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin123!)
-- Hash generated with bcryptjs
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `is_active`, `is_verified`) VALUES
('admin@hafizjatim.my.id', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4FKlvNS0M8d3rQPe', 'admin_provinsi', 'Admin Provinsi', 1, 1);

-- =====================================================
-- TABLE: kabupaten_kota
-- =====================================================
CREATE TABLE IF NOT EXISTS `kabupaten_kota` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL UNIQUE,
  `kode` VARCHAR(10) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert semua Kabupaten/Kota di Jawa Timur
INSERT INTO `kabupaten_kota` (`nama`, `kode`) VALUES
  ('Kota Surabaya', 'SBY'),
  ('Kota Malang', 'MLG'),
  ('Kota Kediri', 'KDR'),
  ('Kota Blitar', 'BLT'),
  ('Kota Mojokerto', 'MJK'),
  ('Kota Madiun', 'MDN'),
  ('Kota Pasuruan', 'PSR'),
  ('Kota Probolinggo', 'PBL'),
  ('Kota Batu', 'BTU'),
  ('Kabupaten Gresik', 'GRS'),
  ('Kabupaten Sidoarjo', 'SDA'),
  ('Kabupaten Mojokerto', 'KMJK'),
  ('Kabupaten Jombang', 'JBG'),
  ('Kabupaten Bojonegoro', 'BJN'),
  ('Kabupaten Tuban', 'TBN'),
  ('Kabupaten Lamongan', 'LMG'),
  ('Kabupaten Madiun', 'KMDN'),
  ('Kabupaten Magetan', 'MGT'),
  ('Kabupaten Ngawi', 'NGW'),
  ('Kabupaten Ponorogo', 'PNG'),
  ('Kabupaten Pacitan', 'PCT'),
  ('Kabupaten Kediri', 'KKDR'),
  ('Kabupaten Nganjuk', 'NJK'),
  ('Kabupaten Blitar', 'KBLT'),
  ('Kabupaten Tulungagung', 'TLA'),
  ('Kabupaten Trenggalek', 'TGK'),
  ('Kabupaten Malang', 'KMLG'),
  ('Kabupaten Pasuruan', 'KPSR'),
  ('Kabupaten Probolinggo', 'KPBL'),
  ('Kabupaten Lumajang', 'LMJ'),
  ('Kabupaten Jember', 'JBR'),
  ('Kabupaten Bondowoso', 'BDW'),
  ('Kabupaten Situbondo', 'STB'),
  ('Kabupaten Banyuwangi', 'BWI'),
  ('Kabupaten Sampang', 'SPG'),
  ('Kabupaten Pamekasan', 'PMK'),
  ('Kabupaten Sumenep', 'SMP'),
  ('Kabupaten Bangkalan', 'BKL');

-- =====================================================
-- TABLE: periode_tes
-- =====================================================
CREATE TABLE IF NOT EXISTS `periode_tes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tahun` INT NOT NULL,
  `nama_periode` VARCHAR(100) NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE NOT NULL,
  `kuota_total` INT DEFAULT 1000,
  `status` ENUM('draft', 'pendaftaran', 'tes', 'selesai') DEFAULT 'draft',
  `deskripsi` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `periode_tes` (`tahun`, `nama_periode`, `tanggal_mulai`, `tanggal_selesai`, `status`) VALUES
  (2025, 'Periode Tes 2025', '2025-06-01', '2025-08-31', 'selesai'),
  (2026, 'Periode Tes 2026', '2026-06-01', '2026-08-31', 'draft');

-- =====================================================
-- TABLE: kuota
-- =====================================================
CREATE TABLE IF NOT EXISTS `kuota` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `periode_tes_id` INT,
  `kabupaten_kota` VARCHAR(100) NOT NULL,
  `total_pendaftar` INT DEFAULT 0,
  `kuota_diterima` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_periode_kabko` (`periode_tes_id`, `kabupaten_kota`),
  FOREIGN KEY (`periode_tes_id`) REFERENCES `periode_tes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: hafiz
-- =====================================================
CREATE TABLE IF NOT EXISTS `hafiz` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `nik` VARCHAR(20) NOT NULL UNIQUE,
  `nama` VARCHAR(255) NOT NULL,
  `tempat_lahir` VARCHAR(100) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `alamat` TEXT NOT NULL,
  `rt` VARCHAR(5) DEFAULT NULL,
  `rw` VARCHAR(5) DEFAULT NULL,
  `desa_kelurahan` VARCHAR(100) NOT NULL,
  `kecamatan` VARCHAR(100) NOT NULL,
  `kabupaten_kota` VARCHAR(100) NOT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `nama_bank` VARCHAR(100) DEFAULT NULL,
  `nomor_rekening` VARCHAR(50) DEFAULT NULL,
  `sertifikat_tahfidz` VARCHAR(255) DEFAULT NULL,
  `mengajar` TINYINT(1) DEFAULT 0,
  `tmt_mengajar` DATE DEFAULT NULL,
  `tempat_mengajar` VARCHAR(255) DEFAULT NULL,
  `tempat_mengajar_2` VARCHAR(255) DEFAULT NULL,
  `tmt_mengajar_2` DATE DEFAULT NULL,
  `tahun_tes` INT NOT NULL,
  `periode_tes_id` INT DEFAULT NULL,
  `status_kelulusan` ENUM('lulus', 'tidak_lulus', 'pending') DEFAULT 'pending',
  `nilai_tahfidz` DECIMAL(5,2) DEFAULT NULL,
  `nilai_wawasan` DECIMAL(5,2) DEFAULT NULL,
  `foto_ktp` VARCHAR(255) DEFAULT NULL,
  `foto_profil` VARCHAR(255) DEFAULT NULL,
  `tanda_tangan` TEXT DEFAULT NULL,
  `nomor_piagam` VARCHAR(50) DEFAULT NULL,
  `tanggal_lulus` DATE DEFAULT NULL,
  `status_insentif` ENUM('aktif', 'tidak_aktif', 'suspend') DEFAULT 'tidak_aktif',
  `is_aktif` TINYINT(1) DEFAULT 1,
  `keterangan` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hafiz_kabupaten` (`kabupaten_kota`),
  INDEX `idx_hafiz_tahun` (`tahun_tes`),
  INDEX `idx_hafiz_status` (`status_kelulusan`),
  INDEX `idx_hafiz_nama` (`nama`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`periode_tes_id`) REFERENCES `periode_tes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: riwayat_mengajar
-- =====================================================
CREATE TABLE IF NOT EXISTS `riwayat_mengajar` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hafiz_id` INT NOT NULL,
  `tempat_mengajar` VARCHAR(255) NOT NULL,
  `alamat_mengajar` TEXT,
  `tmt_mulai` DATE NOT NULL,
  `tmt_selesai` DATE DEFAULT NULL,
  `is_current` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hafiz_id`) REFERENCES `hafiz`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: laporan_harian
-- =====================================================
CREATE TABLE IF NOT EXISTS `laporan_harian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hafiz_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `jenis_kegiatan` ENUM('mengajar', 'murojah', 'khataman', 'lainnya') NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `lokasi` VARCHAR(255) DEFAULT NULL,
  `durasi_menit` INT DEFAULT NULL,
  `jam` TIME DEFAULT NULL,
  `status_verifikasi` ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
  `verified_by` INT DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `catatan_verifikasi` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_laporan_hafiz` (`hafiz_id`),
  INDEX `idx_laporan_tanggal` (`tanggal`),
  INDEX `idx_laporan_status` (`status_verifikasi`),
  FOREIGN KEY (`hafiz_id`) REFERENCES `hafiz`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: penguji
-- =====================================================
CREATE TABLE IF NOT EXISTS `penguji` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `gelar` VARCHAR(50) DEFAULT NULL,
  `institusi` VARCHAR(255) DEFAULT NULL,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: jadwal_tes
-- =====================================================
CREATE TABLE IF NOT EXISTS `jadwal_tes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `periode_tes_id` INT,
  `kabupaten_kota` VARCHAR(100) NOT NULL,
  `tanggal_tes` DATE NOT NULL,
  `waktu_mulai` TIME NOT NULL,
  `waktu_selesai` TIME NOT NULL,
  `lokasi` VARCHAR(255) NOT NULL,
  `alamat_lengkap` TEXT DEFAULT NULL,
  `kapasitas` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`periode_tes_id`) REFERENCES `periode_tes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: absensi_tes
-- =====================================================
CREATE TABLE IF NOT EXISTS `absensi_tes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `jadwal_tes_id` INT,
  `hafiz_id` INT,
  `hadir` TINYINT(1) DEFAULT 0,
  `waktu_absen` DATETIME DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`jadwal_tes_id`) REFERENCES `jadwal_tes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`hafiz_id`) REFERENCES `hafiz`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: penugasan_penguji
-- =====================================================
CREATE TABLE IF NOT EXISTS `penugasan_penguji` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `jadwal_tes_id` INT,
  `penguji_id` INT,
  `role_penguji` ENUM('ketua', 'anggota') DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_jadwal_penguji` (`jadwal_tes_id`, `penguji_id`),
  FOREIGN KEY (`jadwal_tes_id`) REFERENCES `jadwal_tes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`penguji_id`) REFERENCES `penguji`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: dokumen
-- =====================================================
CREATE TABLE IF NOT EXISTS `dokumen` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `periode_tes_id` INT,
  `jenis_dokumen` ENUM('spj', 'berita_acara', 'piagam', 'lainnya') NOT NULL,
  `nama_file` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `uploaded_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`periode_tes_id`) REFERENCES `periode_tes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: mutasi_hafiz
-- =====================================================
CREATE TABLE IF NOT EXISTS `mutasi_hafiz` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hafiz_id` INT NOT NULL,
  `kabupaten_kota_asal` VARCHAR(100) NOT NULL,
  `kabupaten_kota_tujuan` VARCHAR(100) NOT NULL,
  `tanggal_mutasi` DATE NOT NULL,
  `alasan` TEXT DEFAULT NULL,
  `disetujui_oleh` INT DEFAULT NULL,
  `status` ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`hafiz_id`) REFERENCES `hafiz`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`disetujui_oleh`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: settings
-- =====================================================
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(50) NOT NULL PRIMARY KEY,
  `value` LONGTEXT DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`key`, `value`, `description`) VALUES
('app_logo', NULL, 'Logo aplikasi (Base64)'),
('app_name', 'LPTQ Jawa Timur', 'Nama aplikasi'),
('app_address', 'Jl. Pahlawan No. 110 Surabaya', 'Alamat instansi');

-- =====================================================
-- TABLE: absensi (untuk laporan harian)
-- =====================================================
CREATE TABLE IF NOT EXISTS `absensi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hafiz_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `jam_masuk` TIME DEFAULT NULL,
  `jam_keluar` TIME DEFAULT NULL,
  `lokasi` VARCHAR(255) DEFAULT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`hafiz_id`) REFERENCES `hafiz`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS untuk Reporting
-- =====================================================

CREATE OR REPLACE VIEW `v_statistik_kabko` AS
SELECT 
  `kabupaten_kota`,
  COUNT(*) as `total_hafiz`,
  SUM(CASE WHEN `status_kelulusan` = 'lulus' THEN 1 ELSE 0 END) as `total_lulus`,
  SUM(CASE WHEN `status_insentif` = 'aktif' THEN 1 ELSE 0 END) as `penerima_insentif_aktif`,
  SUM(CASE WHEN `tahun_tes` = YEAR(CURRENT_DATE) THEN 1 ELSE 0 END) as `pendaftar_tahun_ini`
FROM `hafiz`
GROUP BY `kabupaten_kota`;

CREATE OR REPLACE VIEW `v_laporan_summary` AS
SELECT 
  h.`kabupaten_kota`,
  h.`nama` as `nama_hafiz`,
  COUNT(l.`id`) as `total_laporan`,
  SUM(CASE WHEN l.`status_verifikasi` = 'disetujui' THEN 1 ELSE 0 END) as `laporan_disetujui`,
  SUM(CASE WHEN l.`status_verifikasi` = 'pending' THEN 1 ELSE 0 END) as `laporan_pending`,
  MAX(l.`tanggal`) as `laporan_terakhir`
FROM `hafiz` h
LEFT JOIN `laporan_harian` l ON h.`id` = l.`hafiz_id`
GROUP BY h.`id`, h.`kabupaten_kota`, h.`nama`;

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================
CREATE INDEX `idx_users_role` ON `users`(`role`);
CREATE INDEX `idx_users_kabko` ON `users`(`kabupaten_kota`);
CREATE INDEX `idx_periode_tahun` ON `periode_tes`(`tahun`);
CREATE INDEX `idx_periode_status` ON `periode_tes`(`status`);

COMMIT;

-- =====================================================
-- PRODUCTION DATABASE READY!
-- Admin login: admin@hafizjatim.my.id / Admin123!
-- =====================================================
