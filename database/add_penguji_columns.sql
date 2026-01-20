-- SQL Script untuk menambahkan kolom lokasi_tes dan periode_tes pada tabel penguji
-- Jalankan di Supabase SQL Editor

-- Tambahkan kolom lokasi_tes
ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS lokasi_tes TEXT;

-- Tambahkan kolom periode_tes
ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS periode_tes TEXT;

-- Komentar untuk kolom
COMMENT ON COLUMN penguji.lokasi_tes IS 'Lokasi tempat pelaksanaan tes';
COMMENT ON COLUMN penguji.periode_tes IS 'Periode/waktu tes dilaksanakan';
