-- =====================================================
-- SUPABASE STORAGE CONFIGURATION
-- Untuk menyimpan foto kegiatan hafiz dan foto profil
-- =====================================================

-- Buat bucket 'uploads' untuk menyimpan semua file yang diupload
-- Jalankan di Supabase Dashboard -> Storage -> New Bucket

-- LANGKAH MANUAL DI SUPABASE DASHBOARD:
-- 1. Buka Supabase Dashboard -> Storage
-- 2. Klik "New Bucket" 
-- 3. Nama bucket: uploads
-- 4. Pilih "Public bucket" agar gambar bisa diakses langsung
-- 5. Klik "Create bucket"

-- ATAU jalankan SQL ini di SQL Editor:

-- Insert bucket configuration (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - Mengatur akses file
-- =====================================================

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- =====================================================
-- MENAMBAHKAN KOLOM foto_profil KE TABEL users
-- (jika belum ada)
-- =====================================================

-- Tambahkan kolom foto_profil ke tabel users jika belum ada
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS foto_profil TEXT;

-- =====================================================
-- STRUKTUR FOLDER DALAM BUCKET 'uploads'
-- =====================================================
-- /uploads
--   /profile-photos/      <- Foto profil user/hafiz
--   /activity-photos/     <- Foto kegiatan/laporan harian
--   /ktp-photos/          <- Foto KTP untuk verifikasi
--   /documents/           <- Dokumen lainnya

-- =====================================================
-- CONTOH PENGGUNAAN DALAM KODE:
-- =====================================================

-- Upload foto profil:
-- const filePath = `profile-photos/${userId}-${Date.now()}.jpg`;
-- await supabase.storage.from('uploads').upload(filePath, file);

-- Upload foto kegiatan:
-- const filePath = `activity-photos/${hafizId}-${Date.now()}.jpg`;
-- await supabase.storage.from('uploads').upload(filePath, file);

-- Mendapatkan public URL:
-- const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
-- const publicUrl = data.publicUrl;
