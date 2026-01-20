-- =====================================================
-- FIX DATABASE PERFORMANCE ISSUES
-- Tanggal: 13 Januari 2026
-- Masalah: Loading terus setelah penghapusan user
-- =====================================================

USE huffadz_jatim;

-- =====================================================
-- STEP 1: BERSIHKAN ORPHANED DATA
-- =====================================================

-- 1.1 Hapus laporan dari hafiz yang tidak ada atau user_id null
DELETE FROM laporan_harian 
WHERE hafiz_id NOT IN (SELECT id FROM hafiz WHERE hafiz.id IS NOT NULL);

-- 1.2 Hapus absensi dari hafiz yang tidak ada
DELETE FROM absensi_tes 
WHERE hafiz_id NOT IN (SELECT id FROM hafiz WHERE hafiz.id IS NOT NULL);

-- 1.3 Set user_id = NULL untuk hafiz yang usernya sudah dihapus
UPDATE hafiz SET user_id = NULL 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM users);

-- =====================================================
-- STEP 2: TAMBAH MISSING INDEXES
-- =====================================================

-- 2.1 Index untuk hafiz table
ALTER TABLE hafiz ADD INDEX IF NOT EXISTS `idx_hafiz_user_id` (`user_id`);
ALTER TABLE hafiz ADD INDEX IF NOT EXISTS `idx_hafiz_nik` (`nik`);
ALTER TABLE hafiz ADD INDEX IF NOT EXISTS `idx_hafiz_email` (`email`);
ALTER TABLE hafiz ADD INDEX IF NOT EXISTS `idx_hafiz_created` (`created_at`);

-- 2.2 Index untuk laporan_harian table
ALTER TABLE laporan_harian ADD INDEX IF NOT EXISTS `idx_laporan_verified_by` (`verified_by`);
ALTER TABLE laporan_harian ADD INDEX IF NOT EXISTS `idx_laporan_created` (`created_at`);

-- 2.3 Index untuk users table
ALTER TABLE users ADD INDEX IF NOT EXISTS `idx_users_role` (`role`);
ALTER TABLE users ADD INDEX IF NOT EXISTS `idx_users_kabko` (`kabupaten_kota`);
ALTER TABLE users ADD INDEX IF NOT EXISTS `idx_users_active` (`is_active`);

-- 2.4 Index untuk absensi_tes table  
ALTER TABLE absensi_tes ADD INDEX IF NOT EXISTS `idx_absensi_created` (`created_at`);

-- =====================================================
-- STEP 3: OPTIMIZE TABLES
-- =====================================================

OPTIMIZE TABLE hafiz;
OPTIMIZE TABLE laporan_harian;
OPTIMIZE TABLE users;
OPTIMIZE TABLE absensi_tes;
OPTIMIZE TABLE periode_tes;
OPTIMIZE TABLE kuota;
OPTIMIZE TABLE jadwal_tes;

-- =====================================================
-- STEP 4: ANALYZE TABLES (untuk query optimizer)
-- =====================================================

ANALYZE TABLE hafiz;
ANALYZE TABLE laporan_harian;
ANALYZE TABLE users;
ANALYZE TABLE absensi_tes;

-- =====================================================
-- STEP 5: CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Verify foreign key integrity
SELECT COUNT(*) as orphaned_hafiz_records
FROM hafiz h
WHERE h.user_id IS NOT NULL 
AND h.user_id NOT IN (SELECT id FROM users);

SELECT COUNT(*) as orphaned_laporan_records
FROM laporan_harian l
WHERE l.hafiz_id NOT IN (SELECT id FROM hafiz);

SELECT COUNT(*) as orphaned_absensi_records
FROM absensi_tes a
WHERE a.hafiz_id NOT IN (SELECT id FROM hafiz);

-- =====================================================
-- STEP 6: VERIFY DATA INTEGRITY
-- =====================================================

-- Check stats
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM hafiz) as total_hafiz,
    (SELECT COUNT(*) FROM laporan_harian) as total_laporan,
    (SELECT COUNT(*) FROM absensi_tes) as total_absensi,
    (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users;

-- =====================================================
-- COMPLETE
-- =====================================================
-- Script execution selesai. Database sudah dioptimasi!
-- Jika masih loading, cek:
-- 1. Network connection ke database
-- 2. Database server status
-- 3. Memory/CPU usage
