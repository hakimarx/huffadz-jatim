-- =====================================================
-- ADD MISSING COLUMNS TO HAFIZ TABLE
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- Tambahkan semua kolom yang mungkin hilang di tabel hafiz
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tempat_lahir TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS alamat TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS rt TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS rw TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS desa_kelurahan TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS kecamatan TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS telepon TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS sertifikat_tahfidz TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS mengajar BOOLEAN DEFAULT false;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tempat_mengajar TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS keterangan TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tmt_mengajar DATE;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS periode_tes_id UUID;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS status_kelulusan TEXT DEFAULT 'pending';
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS nilai_tahfidz DECIMAL(5,2);
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS nilai_wawasan DECIMAL(5,2);
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS foto_ktp TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS foto_profil TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS nomor_piagam TEXT;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS tanggal_lulus DATE;
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS status_insentif TEXT DEFAULT 'tidak_aktif';
ALTER TABLE public.hafiz ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Tambahkan kolom ke users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS foto_profil TEXT;

-- Tambahkan kolom ke laporan_harian
ALTER TABLE public.laporan_harian ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- =====================================================
-- BUAT TABEL PENGUJI (jika belum ada)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.penguji (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  gelar TEXT,
  institusi TEXT,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  foto TEXT,
  spesialisasi TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DROP DAN RECREATE FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS public.is_admin_provinsi() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_kabko(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_provinsi()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin_provinsi');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_kabko(kabko TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin_kabko' AND kabupaten_kota = kabko);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_provinsi() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_kabko(TEXT) TO authenticated, anon;

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penguji ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
    END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'hafiz' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.hafiz';
    END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'laporan_harian' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.laporan_harian';
    END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'penguji' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.penguji';
    END LOOP;
END $$;

-- =====================================================
-- CREATE PERMISSIVE POLICIES
-- =====================================================

-- USERS policies
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- HAFIZ policies (fully permissive for now)
CREATE POLICY "hafiz_select" ON public.hafiz FOR SELECT TO authenticated USING (true);
CREATE POLICY "hafiz_insert" ON public.hafiz FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "hafiz_update" ON public.hafiz FOR UPDATE TO authenticated USING (true);
CREATE POLICY "hafiz_delete" ON public.hafiz FOR DELETE TO authenticated USING (true);

-- LAPORAN_HARIAN policies
CREATE POLICY "laporan_select" ON public.laporan_harian FOR SELECT TO authenticated USING (true);
CREATE POLICY "laporan_insert" ON public.laporan_harian FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "laporan_update" ON public.laporan_harian FOR UPDATE TO authenticated USING (true);
CREATE POLICY "laporan_delete" ON public.laporan_harian FOR DELETE TO authenticated USING (true);

-- PENGUJI policies
CREATE POLICY "penguji_select" ON public.penguji FOR SELECT TO authenticated USING (true);
CREATE POLICY "penguji_insert" ON public.penguji FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "penguji_update" ON public.penguji FOR UPDATE TO authenticated USING (true);
CREATE POLICY "penguji_delete" ON public.penguji FOR DELETE TO authenticated USING (true);

-- Enable RLS for periode_tes
ALTER TABLE public.periode_tes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on periode_tes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'periode_tes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.periode_tes';
    END LOOP;
END $$;

-- PERIODE_TES policies
CREATE POLICY "periode_tes_select" ON public.periode_tes FOR SELECT TO authenticated USING (true);
CREATE POLICY "periode_tes_insert" ON public.periode_tes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "periode_tes_update" ON public.periode_tes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "periode_tes_delete" ON public.periode_tes FOR DELETE TO authenticated USING (true);

-- =====================================================
-- GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- VERIFY COLUMNS EXIST
-- =====================================================
SELECT 'Columns added successfully!' as result,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'hafiz' AND table_schema = 'public') as hafiz_columns;
