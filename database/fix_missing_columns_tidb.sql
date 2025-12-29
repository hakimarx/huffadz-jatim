-- =====================================================
-- Migration: Tambahkan kolom yang hilang untuk TiDB/MySQL
-- =====================================================
-- Jalankan script ini di TiDB Cloud Console

-- Tambahkan kolom lokasi_tes dan periode_tes pada tabel penguji
ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS lokasi_tes VARCHAR(255) DEFAULT NULL;

ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS periode_tes VARCHAR(100) DEFAULT NULL;

ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Tambahkan kolom nama_bank dan nomor_rekening pada tabel hafiz jika belum ada
ALTER TABLE hafiz
ADD COLUMN IF NOT EXISTS nama_bank VARCHAR(100) DEFAULT NULL;

ALTER TABLE hafiz
ADD COLUMN IF NOT EXISTS nomor_rekening VARCHAR(50) DEFAULT NULL;

-- Tambahkan kolom jam pada tabel laporan_harian jika belum ada
ALTER TABLE laporan_harian
ADD COLUMN IF NOT EXISTS jam VARCHAR(10) DEFAULT NULL;

-- Verifikasi struktur tabel penguji
DESCRIBE penguji;

-- Verifikasi struktur tabel hafiz 
DESCRIBE hafiz;
