-- =====================================================
-- PART 2: INSERT DATA (Jalankan SETELAH Part 1 sukses)
-- =====================================================

USE huffadz_jatim;

-- Insert Kabupaten/Kota
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

-- Insert Periode Tes
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

-- Insert Users
INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('hakimarx@gmail.com', '$2b$12$6Ypou9wwWAaWnV.BfrChgedkFSwG.4sdgbZohMuLsr/PJp5sqfG9S', 'admin_provinsi', 'Hakim ARX', NULL, 1);

INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('sby@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'admin_kabko', 'Admin Surabaya', 'Kota Surabaya', 1);

INSERT INTO users (email, password, role, nama, kabupaten_kota, is_active) VALUES
('hafiz123@mail.com', '$2b$12$1rNRV8M2S8NkOxl/I36xNjVWisb7quhgbHnygvt4t0ScYI6', 'hafiz', 'Hafiz Demo', 'Kota Surabaya', 1);

-- Insert Hafiz dummy
INSERT INTO hafiz (nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, desa_kelurahan, kecamatan, kabupaten_kota, tahun_tes, status_kelulusan, mengajar) VALUES
('3578012345678901', 'Hafiz Demo', 'Surabaya', '2000-01-01', 'L', 'Jl. Contoh No. 123', 'Ketabang', 'Genteng', 'Kota Surabaya', 2024, 'lulus', 1);

-- SELESAI!
-- Akun: hakimarx@gmail.com / g4yung4n
-- Akun: sby@mail.com / 123456  
-- Akun: hafiz123@mail.com / 123456
