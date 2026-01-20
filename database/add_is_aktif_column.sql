-- =====================================================
-- ADD is_aktif COLUMN TO HAFIZ TABLE
-- =====================================================
-- Kolom untuk menandai apakah hafiz masih aktif atau tidak
-- Jalankan di Supabase SQL Editor
-- =====================================================

-- Add is_aktif column if not exists
ALTER TABLE public.hafiz 
ADD COLUMN IF NOT EXISTS is_aktif BOOLEAN DEFAULT true;

-- Add tempat_mengajar_history column to store multiple teaching locations
-- Format: JSON array of objects with tempat, tmt_mulai, tmt_selesai
ALTER TABLE public.hafiz 
ADD COLUMN IF NOT EXISTS tempat_mengajar_history JSONB DEFAULT '[]'::jsonb;

-- Update existing records to set is_aktif based on status_insentif
UPDATE public.hafiz 
SET is_aktif = true 
WHERE is_aktif IS NULL;

-- Verify
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'hafiz' 
AND column_name IN ('is_aktif', 'tempat_mengajar_history')
ORDER BY column_name;
