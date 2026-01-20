-- =====================================================
-- FIX: Add 'id' column to hafiz table if missing
-- Run this in Supabase SQL Editor
-- =====================================================

-- Check if id column exists
DO $$
BEGIN
    -- Check if 'id' column exists in hafiz table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'id'
    ) THEN
        -- Add id column as primary key
        ALTER TABLE public.hafiz 
        ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
        
        RAISE NOTICE 'Added id column to hafiz table';
    ELSE
        RAISE NOTICE 'id column already exists in hafiz table';
    END IF;
END $$;

-- Verify the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;

-- Alternative: If table doesn't have proper id column, recreate with id
-- WARNING: This will backup and recreate the table

-- Backup existing data
-- CREATE TABLE hafiz_backup AS SELECT * FROM hafiz;

-- If you need to add id to existing rows, use this:
-- UPDATE public.hafiz SET id = uuid_generate_v4() WHERE id IS NULL;

-- Verify table structure
SELECT 
    'hafiz' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'hafiz' AND table_schema = 'public') as column_count
FROM public.hafiz;
