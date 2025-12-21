-- Database Indexes for Performance Optimization
-- For handling 10,000+ users with fast query performance
-- Run this migration in Supabase SQL Editor
-- Note: Uses IF NOT EXISTS to avoid errors on existing indexes

-- ============================================
-- EXTENSION FOR TEXT SEARCH (if not exists)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- HAFIZ TABLE INDEXES
-- ============================================

-- Index for regional queries (Admin Kab/Ko filtering)
CREATE INDEX IF NOT EXISTS idx_hafiz_kabupaten_kota 
ON public.hafiz(kabupaten_kota);

-- Index for year filtering (common dashboard queries)
CREATE INDEX IF NOT EXISTS idx_hafiz_tahun_tes
ON public.hafiz(tahun_tes);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_hafiz_status_kelulusan
ON public.hafiz(status_kelulusan);

-- Index for NIK lookups (unique constraint queries)
CREATE INDEX IF NOT EXISTS idx_hafiz_nik 
ON public.hafiz(nik);

-- Index for gender statistics
CREATE INDEX IF NOT EXISTS idx_hafiz_jenis_kelamin 
ON public.hafiz(jenis_kelamin);

-- Composite index for common dashboard filters
CREATE INDEX IF NOT EXISTS idx_hafiz_kabko_tahun 
ON public.hafiz(kabupaten_kota, tahun_tes);

-- Composite index for year and status
CREATE INDEX IF NOT EXISTS idx_hafiz_tahun_status 
ON public.hafiz(tahun_tes, status_kelulusan);

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index for role-based queries (RLS policies)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users(role);

-- Index for regional admin filtering
CREATE INDEX IF NOT EXISTS idx_users_kabupaten_kota 
ON public.users(kabupaten_kota);

-- Composite index for RLS policies
CREATE INDEX IF NOT EXISTS idx_users_role_kabko 
ON public.users(role, kabupaten_kota);

-- ============================================
-- LAPORAN_HARIAN TABLE INDEXES
-- ============================================

-- Index for hafiz lookup (foreign key)
CREATE INDEX IF NOT EXISTS idx_laporan_hafiz_id 
ON public.laporan_harian(hafiz_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal 
ON public.laporan_harian(tanggal);

-- Composite index for hafiz + date queries
CREATE INDEX IF NOT EXISTS idx_laporan_hafiz_tanggal 
ON public.laporan_harian(hafiz_id, tanggal);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_laporan_status_verifikasi 
ON public.laporan_harian(status_verifikasi);

-- ============================================
-- KUOTA TABLE INDEXES
-- ============================================

-- Index for kabupaten queries
CREATE INDEX IF NOT EXISTS idx_kuota_kabko 
ON public.kuota(kabupaten_kota);

-- ============================================
-- PERIODE_TES TABLE INDEXES
-- ============================================

-- Index for year queries
CREATE INDEX IF NOT EXISTS idx_periode_tes_tahun 
ON public.periode_tes(tahun);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_periode_tes_status 
ON public.periode_tes(status);

-- ============================================
-- MUTASI TABLE INDEXES (if table exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mutasi_hafiz') THEN
        CREATE INDEX IF NOT EXISTS idx_mutasi_dari ON public.mutasi_hafiz(dari_kabupaten_kota);
        CREATE INDEX IF NOT EXISTS idx_mutasi_ke ON public.mutasi_hafiz(ke_kabupaten_kota);
        CREATE INDEX IF NOT EXISTS idx_mutasi_created ON public.mutasi_hafiz(created_at);
    END IF;
END $$;

-- ============================================
-- ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================
ANALYZE public.hafiz;
ANALYZE public.users;
ANALYZE public.laporan_harian;
ANALYZE public.kuota;
ANALYZE public.periode_tes;
