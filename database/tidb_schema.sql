-- =====================================================
-- SISTEM PENDATAAN HUFFADZ JAWA TIMUR - TiDB Cloud
-- =====================================================

-- Buat database
CREATE DATABASE IF NOT EXISTS huffadz_jatim;
USE huffadz_jatim;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  kabupaten_kota VARCHAR(100) DEFAULT NULL,
  telepon VARCHAR(20) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: kabupaten_kota
-- =====================================================
CREATE TABLE IF NOT EXISTS kabupaten_kota (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  kode VARCHAR(10) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert semua Kabupaten/Kota di Jawa Timur
INSERT INTO kabupaten_kota (nama, kode) VALUES
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
CREATE TABLE IF NOT EXISTS periode_tes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tahun INT NOT NULL,
  nama_periode VARCHAR(100) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  kuota_total INT DEFAULT 1000,
  status VARCHAR(20) DEFAULT 'draft',
  deskripsi TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert periode tes historis
INSERT INTO periode_tes (tahun, nama_periode, tanggal_mulai, tanggal_selesai, status) VALUES
  (2015, 'Periode Tes 2015', '2015-06-01', '2015-08-31', 'selesai'),
  (2016, 'Periode Tes 2016', '2016-06-01', '2016-08-31', 'selesai'),
  (2018, 'Periode Tes 2018', '2018-06-01', '2018-08-31', 'selesai'),
  (2019, 'Periode Tes 2019', '2019-06-01', '2019-08-31', 'selesai'),
  (2021, 'Periode Tes 2021', '2021-06-01', '2021-08-31', 'selesai'),
  (2022, 'Periode Tes 2022', '2022-06-01', '2022-08-31', 'selesai'),
  (2023, 'Periode Tes 2023', '2023-06-01', '2023-08-31', 'selesai'),
  (2024, 'Periode Tes 2024', '2024-06-01', '2024-08-31', 'selesai'),
  (2025, 'Periode Tes 2025', '2025-06-01', '2025-08-31', 'draft');

-- =====================================================
-- TABLE: kuota
-- =====================================================
CREATE TABLE IF NOT EXISTS kuota (
  id INT AUTO_INCREMENT PRIMARY KEY,
  periode_tes_id INT,
  kabupaten_kota VARCHAR(100) NOT NULL,
  total_pendaftar INT DEFAULT 0,
  kuota_diterima INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: hafiz
-- =====================================================
CREATE TABLE IF NOT EXISTS hafiz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  nik VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin VARCHAR(1) NOT NULL,
  alamat TEXT NOT NULL,
  rt VARCHAR(5) DEFAULT NULL,
  rw VARCHAR(5) DEFAULT NULL,
  desa_kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kabupaten_kota VARCHAR(100) NOT NULL,
  telepon VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  sertifikat_tahfidz VARCHAR(255) DEFAULT NULL,
  mengajar TINYINT(1) DEFAULT 0,
  tmt_mengajar DATE DEFAULT NULL,
  tempat_mengajar VARCHAR(255) DEFAULT NULL,
  tempat_mengajar_2 VARCHAR(255) DEFAULT NULL,
  tmt_mengajar_2 DATE DEFAULT NULL,
  tahun_tes INT NOT NULL,
  periode_tes_id INT DEFAULT NULL,
  status_kelulusan VARCHAR(20) DEFAULT 'pending',
  nilai_tahfidz DECIMAL(5,2) DEFAULT NULL,
  nilai_wawasan DECIMAL(5,2) DEFAULT NULL,
  foto_ktp VARCHAR(255) DEFAULT NULL,
  foto_profil VARCHAR(255) DEFAULT NULL,
  nomor_piagam VARCHAR(50) DEFAULT NULL,
  tanggal_lulus DATE DEFAULT NULL,
  status_insentif VARCHAR(20) DEFAULT 'tidak_aktif',
  keterangan TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: laporan_harian
-- =====================================================
CREATE TABLE IF NOT EXISTS laporan_harian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hafiz_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jenis_kegiatan VARCHAR(20) NOT NULL,
  deskripsi TEXT NOT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  lokasi VARCHAR(255) DEFAULT NULL,
  durasi_menit INT DEFAULT NULL,
  status_verifikasi VARCHAR(20) DEFAULT 'pending',
  verified_by INT DEFAULT NULL,
  verified_at DATETIME DEFAULT NULL,
  catatan_verifikasi TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: penguji
-- =====================================================
CREATE TABLE IF NOT EXISTS penguji (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  gelar VARCHAR(50) DEFAULT NULL,
  institusi VARCHAR(255) DEFAULT NULL,
  telepon VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: jadwal_tes
-- =====================================================
CREATE TABLE IF NOT EXISTS jadwal_tes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  periode_tes_id INT,
  kabupaten_kota VARCHAR(100) NOT NULL,
  tanggal_tes DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  alamat_lengkap TEXT DEFAULT NULL,
  kapasitas INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: absensi_tes
-- =====================================================
CREATE TABLE IF NOT EXISTS absensi_tes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jadwal_tes_id INT,
  hafiz_id INT,
  hadir TINYINT(1) DEFAULT 0,
  waktu_absen DATETIME DEFAULT NULL,
  catatan TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: penugasan_penguji
-- =====================================================
CREATE TABLE IF NOT EXISTS penugasan_penguji (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jadwal_tes_id INT,
  penguji_id INT,
  role_penguji VARCHAR(20) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: dokumen
-- =====================================================
CREATE TABLE IF NOT EXISTS dokumen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  periode_tes_id INT,
  jenis_dokumen VARCHAR(20) NOT NULL,
  nama_file VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  keterangan TEXT DEFAULT NULL,
  uploaded_by INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: mutasi_hafiz
-- =====================================================
CREATE TABLE IF NOT EXISTS mutasi_hafiz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hafiz_id INT NOT NULL,
  kabupaten_kota_asal VARCHAR(100) NOT NULL,
  kabupaten_kota_tujuan VARCHAR(100) NOT NULL,
  tanggal_mutasi DATE NOT NULL,
  alasan TEXT DEFAULT NULL,
  disetujui_oleh INT DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERT USERS (Admin & Hafiz)
-- =====================================================

-- Admin Provinsi: hakimarx@gmail.com / g4yung4n
INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('hakimarx@gmail.com', '$2b$12$6Ypou9wwWAaWnV.BfrChgedkFSwG.4sdgbZohMuLsr/PJp5sqfG9S', 'admin_provinsi', 'Hakim ARX', NULL, 1);

-- Admin Kabupaten Surabaya: sby@mail.com / 123456
INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('sby@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'admin_kabko', 'Admin Surabaya', 'Kota Surabaya', 1);

-- Hafiz: hafiz123@mail.com / 123456
INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('hafiz123@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'hafiz', 'Hafiz Demo', 'Kota Surabaya', 1);

-- Data Hafiz dummy
INSERT INTO hafiz (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, desa_kelurahan, kecamatan, kabupaten_kota, tahun_tes, status_kelulusan, mengajar) VALUES
('3578012345678901', 'Hafiz Demo', 'Surabaya', '2000-01-01', 'L', 'Jl. Contoh No. 123', 'Ketabang', 'Genteng', 'Kota Surabaya', 2024, 'lulus', 1);

-- =====================================================
-- SELESAI!
-- =====================================================
-- Akun yang dibuat:
-- 1. hakimarx@gmail.com    / g4yung4n   (Admin Provinsi)
-- 2. sby@mail.com          / 123456     (Admin Kab Surabaya)
-- 3. hafiz123@mail.com     / 123456     (Hafiz)
-- =====================================================
