-- =====================================================
-- STORAGE SETUP - Jalankan TERPISAH dari script lain
-- Jika error, setup manual di Dashboard
-- =====================================================

-- 1. Cek apakah bucket sudah ada, jika tidak buat baru
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Hapus existing storage policies jika ada (dengan nama yang mungkin ada)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;
DROP POLICY IF EXISTS "uploads_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_delete_policy" ON storage.objects;

-- 3. Create policies dengan nama unik
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'huffadz_uploads_insert'
  ) THEN
    CREATE POLICY "huffadz_uploads_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'uploads');
  END IF;

  -- Select policy (public read)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'huffadz_uploads_select'
  ) THEN
    CREATE POLICY "huffadz_uploads_select"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'uploads');
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'huffadz_uploads_update'
  ) THEN
    CREATE POLICY "huffadz_uploads_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'uploads');
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'huffadz_uploads_delete'
  ) THEN
    CREATE POLICY "huffadz_uploads_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'uploads');
  END IF;
END $$;

-- =====================================================
-- SELESAI
-- =====================================================
-- Jika script ini error, buat bucket secara manual:
-- 1. Buka Supabase Dashboard > Storage
-- 2. Klik "New bucket"
-- 3. Nama: uploads
-- 4. Centang "Public bucket"
-- 5. Klik Create bucket
-- =====================================================
