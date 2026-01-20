-- =====================================================
-- FIX PRODUCTION SCHEMA
-- Menambahkan kolom yang kurang di production database
-- =====================================================

-- 1. Tambah kolom di tabel penguji
ALTER TABLE penguji 
ADD COLUMN IF NOT EXISTS lokasi_tes VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS periode_tes VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Tambah kolom di tabel hafiz (jika belum ada)
ALTER TABLE hafiz 
ADD COLUMN IF NOT EXISTS nama_bank VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS nomor_rekening VARCHAR(50) DEFAULT NULL;

-- =====================================================
-- SELESAI!
-- =====================================================
