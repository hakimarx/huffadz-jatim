-- =====================================================
-- SCRIPT PERBAIKAN SCHEMA HAFIZ
-- Jalankan ini jika ada error "column does not exist"
-- =====================================================

-- 1. CEK APAKAH TABEL HAFIZ SUDAH ADA
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'hafiz'
);

-- 2. CEK KOLOM-KOLOM YANG ADA DI TABEL HAFIZ
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;

-- 3. JIKA TABEL BELUM ADA, BUAT TABEL HAFIZ
-- (Skip jika tabel sudah ada)
CREATE TABLE IF NOT EXISTS public.hafiz (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  nik TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  tempat_lahir TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  alamat TEXT NOT NULL,
  rt TEXT,
  rw TEXT,
  desa_kelurahan TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  kabupaten_kota TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  sertifikat_tahfidz TEXT,
  mengajar BOOLEAN DEFAULT false,
  tempat_mengajar TEXT,
  tmt_mengajar DATE,
  tahun_tes INTEGER NOT NULL,
  periode_tes_id UUID REFERENCES public.periode_tes(id),
  status_kelulusan TEXT DEFAULT 'pending' CHECK (status_kelulusan IN ('lulus', 'tidak_lulus', 'pending')),
  nilai_tahfidz DECIMAL(5,2),
  nilai_wawasan DECIMAL(5,2),
  foto_ktp TEXT,
  foto_profil TEXT,
  nomor_piagam TEXT,
  tanggal_lulus DATE,
  status_insentif TEXT DEFAULT 'tidak_aktif' CHECK (status_insentif IN ('aktif', 'tidak_aktif', 'suspend')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TAMBAHKAN KOLOM JIKA BELUM ADA (untuk backward compatibility)
DO $$ 
BEGIN
    -- Tambah kolom jenis_kelamin jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'jenis_kelamin'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P'));
    END IF;

    -- Tambah kolom kabupaten_kota jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'kabupaten_kota'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN kabupaten_kota TEXT NOT NULL DEFAULT 'Jawa Timur';
    END IF;

    -- Tambah kolom tempat_mengajar jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'tempat_mengajar'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN tempat_mengajar TEXT;
    END IF;

    -- Tambah kolom status_insentif jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'status_insentif'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN status_insentif TEXT DEFAULT 'tidak_aktif' CHECK (status_insentif IN ('aktif', 'tidak_aktif', 'suspend'));
    END IF;

    -- Tambah kolom keterangan jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hafiz' 
        AND column_name = 'keterangan'
    ) THEN
        ALTER TABLE public.hafiz ADD COLUMN keterangan TEXT;
    END IF;
END $$;

-- 5. BUAT INDEX UNTUK PERFORMA (jika belum ada)
CREATE INDEX IF NOT EXISTS idx_hafiz_kabupaten ON public.hafiz(kabupaten_kota);
CREATE INDEX IF NOT EXISTS idx_hafiz_tahun ON public.hafiz(tahun_tes);
CREATE INDEX IF NOT EXISTS idx_hafiz_status ON public.hafiz(status_kelulusan);
CREATE INDEX IF NOT EXISTS idx_hafiz_nik ON public.hafiz(nik);

-- 6. ENABLE RLS (jika belum)
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;

-- 7. DROP EXISTING POLICIES (untuk re-create)
DROP POLICY IF EXISTS "Hafiz can view own data" ON public.hafiz;
DROP POLICY IF EXISTS "Admin kabko can view hafiz in their region" ON public.hafiz;
DROP POLICY IF EXISTS "Admin provinsi can view all hafiz" ON public.hafiz;
DROP POLICY IF EXISTS "Admin can insert hafiz" ON public.hafiz;
DROP POLICY IF EXISTS "Admin can update hafiz" ON public.hafiz;

-- 8. CREATE RLS POLICIES
-- Policy untuk Hafiz melihat data sendiri
CREATE POLICY "Hafiz can view own data" ON public.hafiz
  FOR SELECT USING (user_id = auth.uid());

-- Policy untuk Admin Kab/Ko melihat hafiz di wilayahnya
CREATE POLICY "Admin kabko can view hafiz in their region" ON public.hafiz
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin_kabko' 
      AND kabupaten_kota = hafiz.kabupaten_kota
    )
  );

-- Policy untuk Admin Provinsi melihat semua hafiz
CREATE POLICY "Admin provinsi can view all hafiz" ON public.hafiz
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin_provinsi'
    )
  );

-- Policy untuk Admin insert hafiz
CREATE POLICY "Admin can insert hafiz" ON public.hafiz
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin_provinsi' OR role = 'admin_kabko')
    )
  );

-- Policy untuk Admin update hafiz
CREATE POLICY "Admin can update hafiz" ON public.hafiz
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin_provinsi' OR role = 'admin_kabko')
    )
  );

-- 9. GRANT PERMISSIONS
GRANT ALL ON public.hafiz TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. VERIFIKASI HASIL
SELECT 
    'Tabel hafiz berhasil dibuat/diupdate!' as status,
    COUNT(*) as jumlah_kolom
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz';

-- Tampilkan semua kolom
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'hafiz'
ORDER BY ordinal_position;
