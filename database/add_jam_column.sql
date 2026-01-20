-- =====================================================
-- ADD JAM COLUMN TO LAPORAN_HARIAN TABLE
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- Tambahkan kolom jam ke tabel laporan_harian
ALTER TABLE public.laporan_harian ADD COLUMN IF NOT EXISTS jam TEXT;

-- Verifikasi perubahan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'laporan_harian' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Kolom jam berhasil ditambahkan ke tabel laporan_harian!' as result;
