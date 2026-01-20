-- =====================================================
-- Migration Script: Add Missing Columns to hafiz Table
-- =====================================================
-- Purpose: Menambahkan kolom yang missing di tabel hafiz
-- Date: 14 Desember 2024
-- Error: PGRST204 - Column not found in schema cache
-- =====================================================

-- Add email column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN email TEXT;
        RAISE NOTICE 'Kolom email berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom email sudah ada';
    END IF;
END $$;

-- Add tempat_mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tempat_mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN tempat_mengajar TEXT;
        RAISE NOTICE 'Kolom tempat_mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tempat_mengajar sudah ada';
    END IF;
END $$;

-- Add sertifikat_tahfidz column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'sertifikat_tahfidz'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN sertifikat_tahfidz TEXT;
        RAISE NOTICE 'Kolom sertifikat_tahfidz berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom sertifikat_tahfidz sudah ada';
    END IF;
END $$;

-- Add mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN mengajar BOOLEAN DEFAULT false;
        RAISE NOTICE 'Kolom mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom mengajar sudah ada';
    END IF;
END $$;

-- Add tmt_mengajar column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tmt_mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN tmt_mengajar DATE;
        RAISE NOTICE 'Kolom tmt_mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tmt_mengajar sudah ada';
    END IF;
END $$;

-- Add rt column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'rt'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN rt TEXT;
        RAISE NOTICE 'Kolom rt berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom rt sudah ada';
    END IF;
END $$;

-- Add rw column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'rw'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN rw TEXT;
        RAISE NOTICE 'Kolom rw berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom rw sudah ada';
    END IF;
END $$;

-- Add keterangan column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'keterangan'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN keterangan TEXT;
        RAISE NOTICE 'Kolom keterangan berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom keterangan sudah ada';
    END IF;
END $$;

-- Refresh schema cache (important!)
NOTIFY pgrst, 'reload schema';

-- Verify all columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;

-- Summary
DO $$ 
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Semua kolom yang diperlukan sudah ditambahkan';
    RAISE NOTICE 'Schema cache sudah di-refresh';
    RAISE NOTICE '==============================================';
END $$;
