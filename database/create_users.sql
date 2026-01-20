-- =====================================================
-- SQL untuk menambah user admin dan hafiz
-- Jalankan di phpMyAdmin atau TiDB SQL Editor
-- =====================================================

-- Pilih database
USE huffadz_jatim;

-- 1. Admin Provinsi: hakimarx@gmail.com / g4yung4n
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('hakimarx@gmail.com', '$2b$12$6Ypou9wwWAaWnV.BfrChgedkFSwG.4sdgbZohMuLsr/PJp5sqfG9S', 'admin_provinsi', 'Hakim ARX', NULL, 1);

-- 2. Admin Kabupaten Surabaya: sby@mail.com / 123456
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('sby@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'admin_kabko', 'Admin Surabaya', 'Kota Surabaya', 1);

-- 3. Hafiz untuk login: hafiz123@mail.com / 123456
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('hafiz123@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'hafiz', 'Hafiz Demo', 'Kota Surabaya', 1);

-- 4. Data Hafiz dummy (untuk tabel hafiz)
INSERT INTO `hafiz` (`nik`, `nama`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `alamat`, `desa_kelurahan`, `kecamatan`, `kabupaten_kota`, `tahun_tes`, `status_kelulusan`, `mengajar`) VALUES
('3578012345678901', 'Hafiz Demo', 'Surabaya', '2000-01-01', 'L', 'Jl. Contoh No. 123', 'Ketabang', 'Genteng', 'Kota Surabaya', 2024, 'lulus', 1);

-- =====================================================
-- RINGKASAN AKUN:
-- =====================================================
-- 1. hakimarx@gmail.com    / g4yung4n   (Admin Provinsi)
-- 2. sby@mail.com          / 123456     (Admin Kab Surabaya)
-- 3. hafiz123@mail.com     / 123456     (Hafiz)
-- =====================================================
