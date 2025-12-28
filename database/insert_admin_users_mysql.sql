-- =====================================================
-- ADMIN USERS untuk Huffadz Jawa Timur
-- Jalankan setelah import huffadz_jatim_mysql.sql
-- =====================================================

-- Hapus user admin yang ada (jika sudah ada)
DELETE FROM `users` WHERE `email` IN (
  'hakimarx@gmail.com',
  'adminsby@huffadz.jatim.go.id', 
  'admin.provinsi@lptq.jatimprov.go.id',
  'hafiz@test.com'
);

-- =====================================================
-- 1. Admin Provinsi
-- Email: hakimarx@gmail.com
-- Password: g4yung4n
-- =====================================================
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('hakimarx@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4edU3QxT.hxHdcYu', 'admin_provinsi', 'Admin Provinsi Jawa Timur', NULL, 1);

-- =====================================================
-- 2. Admin Kabupaten/Kota Surabaya
-- Email: adminsby@huffadz.jatim.go.id
-- Password: 123456
-- =====================================================
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('adminsby@huffadz.jatim.go.id', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin_kabko', 'Admin Kota Surabaya', 'Kota Surabaya', 1);

-- =====================================================
-- 3. Hafiz Test (untuk testing)
-- Email: hafiz@test.com
-- Password: 123456
-- =====================================================
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('hafiz@test.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Test Hafiz', 'Kota Surabaya', 1);

-- =====================================================
-- Verifikasi
-- =====================================================
SELECT id, email, role, nama, kabupaten_kota FROM users;
