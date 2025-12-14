-- Migration: Memastikan kolom status_kelulusan ada di tabel hafiz
-- Tanggal: 13 Desember 2024

-- Cek apakah kolom status_kelulusan sudah ada
DO $$
BEGIN
    -- Tambahkan kolom status_kelulusan jika belum ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'status_kelulusan'
    ) THEN
        ALTER TABLE public.hafiz 
        ADD COLUMN status_kelulusan TEXT DEFAULT 'pending' 
        CHECK (status_kelulusan IN ('lulus', 'tidak_lulus', 'pending'));
        
        RAISE NOTICE 'Kolom status_kelulusan berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom status_kelulusan sudah ada';
    END IF;
    
    -- Tambahkan kolom tanggal_lulus jika belum ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tanggal_lulus'
    ) THEN
        ALTER TABLE public.hafiz 
        ADD COLUMN tanggal_lulus DATE;
        
        RAISE NOTICE 'Kolom tanggal_lulus berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tanggal_lulus sudah ada';
    END IF;
    
    -- Tambahkan kolom tempat_mengajar jika belum ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tempat_mengajar'
    ) THEN
        ALTER TABLE public.hafiz 
        ADD COLUMN tempat_mengajar TEXT;
        
        RAISE NOTICE 'Kolom tempat_mengajar berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom tempat_mengajar sudah ada';
    END IF;
    
    -- Tambahkan kolom created_at jika belum ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.hafiz 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Kolom created_at berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom created_at sudah ada';
    END IF;
    
    -- Tambahkan kolom updated_at jika belum ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.hafiz 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Kolom updated_at berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Kolom updated_at sudah ada';
    END IF;
END $$;

-- Update index untuk status_kelulusan jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'hafiz' 
        AND indexname = 'idx_hafiz_status'
    ) THEN
        CREATE INDEX idx_hafiz_status ON public.hafiz(status_kelulusan);
        RAISE NOTICE 'Index idx_hafiz_status berhasil ditambahkan';
    ELSE
        RAISE NOTICE 'Index idx_hafiz_status sudah ada';
    END IF;
END $$;

-- Verifikasi kolom yang ada di tabel hafiz
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;
