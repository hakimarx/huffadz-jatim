-- Database Indexes for Performance Optimization (Safe Version)
-- For handling 10,000+ users with fast query performance
-- Run this migration in Supabase SQL Editor
-- This version only creates indexes for columns that are most likely to exist

-- ============================================
-- EXTENSION FOR TEXT SEARCH (if not exists)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- HAFIZ TABLE INDEXES (Core columns only)
-- ============================================

-- Index for regional queries (Admin Kab/Ko filtering)
CREATE INDEX IF NOT EXISTS idx_hafiz_kabupaten_kota 
ON public.hafiz(kabupaten_kota);

-- Index for NIK lookups (unique constraint queries)
CREATE INDEX IF NOT EXISTS idx_hafiz_nik 
ON public.hafiz(nik);

-- Index for gender statistics
CREATE INDEX IF NOT EXISTS idx_hafiz_jenis_kelamin 
ON public.hafiz(jenis_kelamin);

-- Index for status filtering (if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hafiz' AND column_name = 'status_kelulusan') THEN
        CREATE INDEX IF NOT EXISTS idx_hafiz_status_kelulusan ON public.hafiz(status_kelulusan);
    END IF;
END $$;

-- Index for year filtering (if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hafiz' AND column_name = 'tahun_tes') THEN
        CREATE INDEX IF NOT EXISTS idx_hafiz_tahun_tes ON public.hafiz(tahun_tes);
    END IF;
END $$;

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index for role-based queries (RLS policies)
CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users(role);

-- Index for regional admin filtering
CREATE INDEX IF NOT EXISTS idx_users_kabupaten_kota 
ON public.users(kabupaten_kota);

-- ============================================
-- LAPORAN_HARIAN TABLE INDEXES
-- ============================================

-- Index for hafiz lookup (foreign key)
CREATE INDEX IF NOT EXISTS idx_laporan_hafiz_id 
ON public.laporan_harian(hafiz_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal 
ON public.laporan_harian(tanggal);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_laporan_status_verifikasi 
ON public.laporan_harian(status_verifikasi);

-- ============================================
-- KUOTA TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_kuota_kabko 
ON public.kuota(kabupaten_kota);

-- ============================================
-- PERIODE_TES TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_periode_tes_tahun 
ON public.periode_tes(tahun);

CREATE INDEX IF NOT EXISTS idx_periode_tes_status 
ON public.periode_tes(status);

-- ============================================
-- ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================
ANALYZE public.hafiz;
ANALYZE public.users;
ANALYZE public.laporan_harian;
ANALYZE public.kuota;
ANALYZE public.periode_tes;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Indexes created successfully!';
END $$;
