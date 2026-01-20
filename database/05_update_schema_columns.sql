-- Add tempat_mengajar column if it doesn't exist
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tempat_mengajar TEXT;

-- Verify columns for import
-- TAHUN SELEKSI -> tahun_tes (exists)
-- DAERAH -> kabupaten_kota (exists)
-- NIK -> nik (exists)
-- NAMA -> nama (exists)
-- TEMPAT LAHIR -> tempat_lahir (exists)
-- TANGGAL LAHIR -> tanggal_lahir (exists)
-- JK -> jenis_kelamin (exists)
-- ALAMAT -> alamat (exists)
-- RT -> rt (exists)
-- RW -> rw (exists)
-- DESA/KELURAHAN -> desa_kelurahan (exists)
-- KECAMATAN -> kecamatan (exists)
-- KABUPATEN/KOTA -> kabupaten_kota (exists - redundant with DAERAH but fine)
-- SERTIFIKAT TAHFIDZ -> sertifikat_tahfidz (exists)
-- MENGAJAR -> tempat_mengajar (NEW COLUMN) & mengajar (boolean)
-- TMT MENGAJAR -> tmt_mengajar (exists)
-- TELEPON -> telepon (exists)
-- KETERANGAN -> keterangan (added in 04)
-- LULUS -> status_kelulusan (exists) & tanggal_lulus (exists)

-- Fix any tight constraints that might fail import
ALTER TABLE public.hafiz ALTER COLUMN alamat DROP NOT NULL;
ALTER TABLE public.hafiz ALTER COLUMN tempat_lahir DROP NOT NULL;
ALTER TABLE public.hafiz ALTER COLUMN desa_kelurahan DROP NOT NULL;
ALTER TABLE public.hafiz ALTER COLUMN kecamatan DROP NOT NULL;
