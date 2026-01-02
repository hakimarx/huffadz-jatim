-- =====================================================
-- POPULATE DATABASE WITH SAMPLE DATA (MySQL Version)
-- =====================================================

-- 1. Insert Sample Hafiz Users
INSERT INTO `users` (`email`, `password`, `role`, `nama`, `kabupaten_kota`, `is_active`) VALUES
('hafiz1@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Muhammad Ridwan', 'Kota Surabaya', 1),
('hafiz2@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Ahmad Hakim', 'Kota Surabaya', 1),
('hafiz3@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Fatimah Zahra', 'Kota Surabaya', 1),
('hafiz4@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Abdullah Aziz', 'Kota Malang', 1),
('hafiz5@example.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hafiz', 'Siti Aminah', 'Kabupaten Sidoarjo', 1);

-- 2. Insert Hafiz Data
-- Note: Assuming IDs 1-5 for the above users if table was empty, but better to use subqueries or just hardcode if we just reset.
-- Since we just re-created tables, IDs should start from 1 (admin), 2 (admin sby), 3 (hafiz test).
-- So the above users will be 4, 5, 6, 7, 8.

INSERT INTO `hafiz` (
  `user_id`, `nik`, `nama`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`,
  `alamat`, `desa_kelurahan`, `kecamatan`, `kabupaten_kota`,
  `telepon`, `email`, `sertifikat_tahfidz`, `mengajar`, `tahun_tes`,
  `status_kelulusan`, `status_insentif`
) VALUES
((SELECT id FROM users WHERE email='hafiz1@example.com'), '3578010101900001', 'Muhammad Ridwan', 'Surabaya', '1990-01-01', 'L', 'Jl. Ahmad Yani No. 1', 'Gayungan', 'Gayungan', 'Kota Surabaya', '081234567801', 'hafiz1@example.com', '30 Juz', 1, 2025, 'pending', 'tidak_aktif'),
((SELECT id FROM users WHERE email='hafiz2@example.com'), '3578010101900002', 'Ahmad Hakim', 'Surabaya', '1992-05-15', 'L', 'Jl. Darmo No. 10', 'Wonokromo', 'Wonokromo', 'Kota Surabaya', '081234567802', 'hafiz2@example.com', '20 Juz', 0, 2025, 'pending', 'tidak_aktif'),
((SELECT id FROM users WHERE email='hafiz3@example.com'), '3578010101900003', 'Fatimah Zahra', 'Surabaya', '1995-08-20', 'P', 'Jl. Tunjungan No. 5', 'Genteng', 'Genteng', 'Kota Surabaya', '081234567803', 'hafiz3@example.com', '30 Juz', 1, 2025, 'pending', 'tidak_aktif'),
((SELECT id FROM users WHERE email='hafiz4@example.com'), '3573010101900001', 'Abdullah Aziz', 'Malang', '1993-03-10', 'L', 'Jl. Ijen No. 2', 'Klojen', 'Klojen', 'Kota Malang', '081234567804', 'hafiz4@example.com', '10 Juz', 0, 2025, 'pending', 'tidak_aktif'),
((SELECT id FROM users WHERE email='hafiz5@example.com'), '3515010101900001', 'Siti Aminah', 'Sidoarjo', '1994-12-01', 'P', 'Jl. Pahlawan No. 3', 'Sidoarjo', 'Sidoarjo', 'Kabupaten Sidoarjo', '081234567805', 'hafiz5@example.com', '30 Juz', 1, 2025, 'pending', 'tidak_aktif');

-- 3. Insert Penguji
INSERT INTO `penguji` (`nama`, `gelar`, `institusi`, `telepon`, `email`, `is_active`) VALUES
('Prof. Dr. H. Ahmad Syaifuddin', 'Profesor', 'UIN Sunan Ampel', '081234567900', 'ahmad@uin.ac.id', 1),
('Dr. Hj. Fatimah', 'Doktor', 'IAIN Jember', '081234567901', 'fatimah@iain.ac.id', 1);

