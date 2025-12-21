-- Database Indexes for Performance Optimization
-- For handling 10,000+ users with fast query performance
-- Run this migration in Supabase SQL Editor

-- ============================================
-- HAFIZ TABLE INDEXES
-- ============================================

-- Index for regional queries (Admin Kab/Ko filtering)
CREATE INDEX IF NOT EXISTS idx_hafiz_kabupaten_kota 
ON hafiz(kabupaten_kota);

-- Index for year and status filtering (common dashboard queries)
CREATE INDEX IF NOT EXISTS idx_hafiz_tahun_status 
ON hafiz(tahun_tes, status_kelulusan);

-- Index for NIK lookups (unique constraint queries)
CREATE INDEX IF NOT EXISTS idx_hafiz_nik 
ON hafiz(nik);

-- Index for gender statistics
CREATE INDEX IF NOT EXISTS idx_hafiz_jenis_kelamin 
ON hafiz(jenis_kelamin);

-- Composite index for common dashboard filters
CREATE INDEX IF NOT EXISTS idx_hafiz_kabko_tahun 
ON hafiz(kabupaten_kota, tahun_tes);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_hafiz_nama_trgm 
ON hafiz USING gin(nama gin_trgm_ops);

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index for role-based queries (RLS policies)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- Index for regional admin filtering
CREATE INDEX IF NOT EXISTS idx_users_kabupaten_kota 
ON users(kabupaten_kota);

-- Composite index for RLS policies
CREATE INDEX IF NOT EXISTS idx_users_role_kabko 
ON users(role, kabupaten_kota);

-- ============================================
-- LAPORAN_HARIAN TABLE INDEXES
-- ============================================

-- Index for hafiz lookup (foreign key)
CREATE INDEX IF NOT EXISTS idx_laporan_hafiz_id 
ON laporan_harian(hafiz_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal 
ON laporan_harian(tanggal);

-- Composite index for hafiz + date queries
CREATE INDEX IF NOT EXISTS idx_laporan_hafiz_tanggal 
ON laporan_harian(hafiz_id, tanggal);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_laporan_status 
ON laporan_harian(status_verifikasi);

-- ============================================
-- KUOTA TABLE INDEXES
-- ============================================

-- Index for year queries
CREATE INDEX IF NOT EXISTS idx_kuota_tahun 
ON kuota(tahun);

-- Composite index for year + region
CREATE INDEX IF NOT EXISTS idx_kuota_tahun_kabko 
ON kuota(tahun, kabupaten_kota);

-- ============================================
-- PERIODE_TES TABLE INDEXES
-- ============================================

-- Index for year queries
CREATE INDEX IF NOT EXISTS idx_periode_tahun 
ON periode_tes(tahun);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_periode_status 
ON periode_tes(status);

-- ============================================
-- MUTASI TABLE INDEXES (if exists)
-- ============================================

-- Index for source region
CREATE INDEX IF NOT EXISTS idx_mutasi_dari 
ON mutasi_hafiz(dari_kabupaten_kota);

-- Index for destination region
CREATE INDEX IF NOT EXISTS idx_mutasi_ke 
ON mutasi_hafiz(ke_kabupaten_kota);

-- Index for created date
CREATE INDEX IF NOT EXISTS idx_mutasi_created 
ON mutasi_hafiz(created_at);

-- ============================================
-- EXTENSION FOR TEXT SEARCH (if not exists)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================
ANALYZE hafiz;
ANALYZE users;
ANALYZE laporan_harian;
ANALYZE kuota;
ANALYZE periode_tes;
