-- =====================================================
-- SISTEM PENDATAAN HUFFADZ JAWA TIMUR
-- Complete Database Schema (Consolidated)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin_provinsi', 'admin_kabko', 'hafiz')),
  nama TEXT NOT NULL,
  kabupaten_kota TEXT,
  telepon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: kabupaten_kota
-- =====================================================
CREATE TABLE public.kabupaten_kota (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT UNIQUE NOT NULL,
  kode TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert semua Kabupaten/Kota di Jawa Timur
INSERT INTO public.kabupaten_kota (nama, kode) VALUES
  ('Kota Surabaya', 'SBY'),
  ('Kota Malang', 'MLG'),
  ('Kota Kediri', 'KDR'),
  ('Kota Blitar', 'BLT'),
  ('Kota Mojokerto', 'MJK'),
  ('Kota Madiun', 'MDN'),
  ('Kota Pasuruan', 'PSR'),
  ('Kota Probolinggo', 'PBL'),
  ('Kota Batu', 'BTU'),
  ('Kabupaten Gresik', 'GRS'),
  ('Kabupaten Sidoarjo', 'SDA'),
  ('Kabupaten Mojokerto', 'KMJK'),
  ('Kabupaten Jombang', 'JBG'),
  ('Kabupaten Bojonegoro', 'BJN'),
  ('Kabupaten Tuban', 'TBN'),
  ('Kabupaten Lamongan', 'LMG'),
  ('Kabupaten Madiun', 'KMDN'),
  ('Kabupaten Magetan', 'MGT'),
  ('Kabupaten Ngawi', 'NGW'),
  ('Kabupaten Ponorogo', 'PNG'),
  ('Kabupaten Pacitan', 'PCT'),
  ('Kabupaten Kediri', 'KKDR'),
  ('Kabupaten Nganjuk', 'NJK'),
  ('Kabupaten Blitar', 'KBLT'),
  ('Kabupaten Tulungagung', 'TLA'),
  ('Kabupaten Trenggalek', 'TGK'),
  ('Kabupaten Malang', 'KMLG'),
  ('Kabupaten Pasuruan', 'KPSR'),
  ('Kabupaten Probolinggo', 'KPBL'),
  ('Kabupaten Lumajang', 'LMJ'),
  ('Kabupaten Jember', 'JBR'),
  ('Kabupaten Bondowoso', 'BDW'),
  ('Kabupaten Situbondo', 'STB'),
  ('Kabupaten Banyuwangi', 'BWI'),
  ('Kabupaten Sampang', 'SPG'),
  ('Kabupaten Pamekasan', 'PMK'),
  ('Kabupaten Sumenep', 'SMP'),
  ('Kabupaten Bangkalan', 'BKL');

-- =====================================================
-- TABLE: periode_tes
-- =====================================================
CREATE TABLE public.periode_tes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tahun INTEGER NOT NULL,
  nama_periode TEXT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  kuota_total INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pendaftaran', 'tes', 'selesai')),
  deskripsi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.periode_tes (tahun, nama_periode, tanggal_mulai, tanggal_selesai, status) VALUES
  (2015, 'Periode Tes 2015', '2015-06-01', '2015-08-31', 'selesai'),
  (2023, 'Periode Tes 2023', '2023-06-01', '2023-08-31', 'selesai'),
  (2024, 'Periode Tes 2024', '2024-06-01', '2024-08-31', 'selesai');

-- =====================================================
-- TABLE: kuota
-- =====================================================
CREATE TABLE public.kuota (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  periode_tes_id UUID REFERENCES public.periode_tes(id) ON DELETE CASCADE,
  kabupaten_kota TEXT NOT NULL,
  total_pendaftar INTEGER DEFAULT 0,
  kuota_diterima INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(periode_tes_id, kabupaten_kota)
);

-- =====================================================
-- TABLE: hafiz
-- =====================================================
CREATE TABLE public.hafiz (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  nik TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  -- Relaxed constraints for constraints as per updates
  tempat_lahir TEXT, 
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  alamat TEXT,
  rt TEXT,
  rw TEXT,
  desa_kelurahan TEXT,
  kecamatan TEXT,
  kabupaten_kota TEXT NOT NULL,
  telepon TEXT,
  email TEXT,
  sertifikat_tahfidz TEXT,
  mengajar BOOLEAN DEFAULT false,
  -- Added columns from updates
  tempat_mengajar TEXT,
  keterangan TEXT,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hafiz_kabupaten ON public.hafiz(kabupaten_kota);
CREATE INDEX idx_hafiz_tahun ON public.hafiz(tahun_tes);
CREATE INDEX idx_hafiz_status ON public.hafiz(status_kelulusan);

-- =====================================================
-- TABLE: laporan_harian
-- =====================================================
CREATE TABLE public.laporan_harian (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hafiz_id UUID REFERENCES public.hafiz(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL,
  jenis_kegiatan TEXT NOT NULL CHECK (jenis_kegiatan IN ('mengajar', 'murojah', 'khataman', 'lainnya')),
  deskripsi TEXT NOT NULL,
  foto TEXT,
  lokasi TEXT,
  durasi_menit INTEGER,
  status_verifikasi TEXT DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'disetujui', 'ditolak')),
  verified_by UUID REFERENCES public.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  catatan_verifikasi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS FOR RLS (Security Definer)
-- =====================================================
-- These functions bypass RLS to check roles safely
CREATE OR REPLACE FUNCTION public.is_admin_provinsi()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin_provinsi'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_kabko(kabko TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin_kabko'
    AND kabupaten_kota = kabko
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_harian ENABLE ROW LEVEL SECURITY;

-- USERS Table Policies
CREATE POLICY "Users view own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin prov view all users" ON public.users
  FOR SELECT USING (public.is_admin_provinsi());

CREATE POLICY "Users insert own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- HAFIZ Table Policies
CREATE POLICY "Admin prov manage hafiz" ON public.hafiz
  FOR ALL USING (public.is_admin_provinsi());

CREATE POLICY "Admin kabko view region hafiz" ON public.hafiz
  FOR SELECT USING (public.is_admin_kabko(kabupaten_kota));

CREATE POLICY "Admin kabko update region hafiz" ON public.hafiz
  FOR UPDATE USING (public.is_admin_kabko(kabupaten_kota));

CREATE POLICY "Hafiz manage own data" ON public.hafiz
  FOR ALL USING (user_id = auth.uid());

-- LAPORAN HARIAN Table Policies
CREATE POLICY "Hafiz manage own laporan" ON public.laporan_harian
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hafiz 
      WHERE id = laporan_harian.hafiz_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admin view laporan region" ON public.laporan_harian
  FOR SELECT USING (
    public.is_admin_provinsi() 
    OR 
    EXISTS (
      SELECT 1 FROM public.hafiz h
      WHERE h.id = laporan_harian.hafiz_id
      AND public.is_admin_kabko(h.kabupaten_kota)
    )
  );

-- =====================================================
-- GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
