-- =====================================================
-- SISTEM PENDATAAN HUFFADZ JAWA TIMUR
-- Database Schema untuk Supabase
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

-- Insert periode tes historis
INSERT INTO public.periode_tes (tahun, nama_periode, tanggal_mulai, tanggal_selesai, status) VALUES
  (2015, 'Periode Tes 2015', '2015-06-01', '2015-08-31', 'selesai'),
  (2016, 'Periode Tes 2016', '2016-06-01', '2016-08-31', 'selesai'),
  (2018, 'Periode Tes 2018', '2018-06-01', '2018-08-31', 'selesai'),
  (2019, 'Periode Tes 2019', '2019-06-01', '2019-08-31', 'selesai'),
  (2021, 'Periode Tes 2021', '2021-06-01', '2021-08-31', 'selesai'),
  (2022, 'Periode Tes 2022', '2022-06-01', '2022-08-31', 'selesai'),
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

-- Index untuk performa
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

-- Index untuk performa
CREATE INDEX idx_laporan_hafiz ON public.laporan_harian(hafiz_id);
CREATE INDEX idx_laporan_tanggal ON public.laporan_harian(tanggal);
CREATE INDEX idx_laporan_status ON public.laporan_harian(status_verifikasi);

-- =====================================================
-- TABLE: penguji
-- =====================================================
CREATE TABLE public.penguji (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  gelar TEXT,
  institusi TEXT,
  telepon TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: jadwal_tes
-- =====================================================
CREATE TABLE public.jadwal_tes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  periode_tes_id UUID REFERENCES public.periode_tes(id) ON DELETE CASCADE,
  kabupaten_kota TEXT NOT NULL,
  tanggal_tes DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME NOT NULL,
  lokasi TEXT NOT NULL,
  alamat_lengkap TEXT,
  kapasitas INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: absensi_tes
-- =====================================================
CREATE TABLE public.absensi_tes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jadwal_tes_id UUID REFERENCES public.jadwal_tes(id) ON DELETE CASCADE,
  hafiz_id UUID REFERENCES public.hafiz(id) ON DELETE CASCADE,
  hadir BOOLEAN DEFAULT false,
  waktu_absen TIMESTAMP WITH TIME ZONE,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: penugasan_penguji
-- =====================================================
CREATE TABLE public.penugasan_penguji (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jadwal_tes_id UUID REFERENCES public.jadwal_tes(id) ON DELETE CASCADE,
  penguji_id UUID REFERENCES public.penguji(id) ON DELETE CASCADE,
  role_penguji TEXT CHECK (role_penguji IN ('ketua', 'anggota')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(jadwal_tes_id, penguji_id)
);

-- =====================================================
-- TABLE: dokumen
-- =====================================================
CREATE TABLE public.dokumen (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  periode_tes_id UUID REFERENCES public.periode_tes(id) ON DELETE CASCADE,
  jenis_dokumen TEXT NOT NULL CHECK (jenis_dokumen IN ('spj', 'berita_acara', 'piagam', 'lainnya')),
  nama_file TEXT NOT NULL,
  file_url TEXT NOT NULL,
  keterangan TEXT,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota ENABLE ROW LEVEL SECURITY;

-- Policies untuk users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin provinsi can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin_provinsi'
    )
  );

-- Policies untuk hafiz
CREATE POLICY "Hafiz can view own data" ON public.hafiz
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin kabko can view hafiz in their region" ON public.hafiz
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin_kabko' 
      AND kabupaten_kota = hafiz.kabupaten_kota
    )
  );

CREATE POLICY "Admin provinsi can view all hafiz" ON public.hafiz
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin_provinsi'
    )
  );

-- Policies untuk laporan_harian
CREATE POLICY "Hafiz can manage own laporan" ON public.laporan_harian
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hafiz 
      WHERE id = laporan_harian.hafiz_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view laporan in their region" ON public.laporan_harian
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.hafiz h ON h.kabupaten_kota = u.kabupaten_kota
      WHERE u.id = auth.uid() 
      AND (u.role = 'admin_kabko' OR u.role = 'admin_provinsi')
      AND h.id = laporan_harian.hafiz_id
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers untuk auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hafiz_updated_at BEFORE UPDATE ON public.hafiz
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laporan_updated_at BEFORE UPDATE ON public.laporan_harian
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kuota_updated_at BEFORE UPDATE ON public.kuota
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS untuk Reporting
-- =====================================================

-- View: Statistik per Kabupaten/Kota
CREATE OR REPLACE VIEW v_statistik_kabko AS
SELECT 
  kabupaten_kota,
  COUNT(*) as total_hafiz,
  COUNT(CASE WHEN status_kelulusan = 'lulus' THEN 1 END) as total_lulus,
  COUNT(CASE WHEN status_insentif = 'aktif' THEN 1 END) as penerima_insentif_aktif,
  COUNT(CASE WHEN tahun_tes = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as pendaftar_tahun_ini
FROM public.hafiz
GROUP BY kabupaten_kota;

-- View: Laporan Harian Summary
CREATE OR REPLACE VIEW v_laporan_summary AS
SELECT 
  h.kabupaten_kota,
  h.nama as nama_hafiz,
  COUNT(l.id) as total_laporan,
  COUNT(CASE WHEN l.status_verifikasi = 'disetujui' THEN 1 END) as laporan_disetujui,
  COUNT(CASE WHEN l.status_verifikasi = 'pending' THEN 1 END) as laporan_pending,
  MAX(l.tanggal) as laporan_terakhir
FROM public.hafiz h
LEFT JOIN public.laporan_harian l ON h.id = l.hafiz_id
GROUP BY h.id, h.kabupaten_kota, h.nama;

-- =====================================================
-- SAMPLE DATA (untuk testing)
-- =====================================================

-- Insert sample admin provinsi
-- Password: admin123 (akan di-hash oleh Supabase Auth)
-- Email: admin.provinsi@lptq.jatimprov.go.id

-- Insert sample admin kabko
-- Email: admin.surabaya@lptq.jatimprov.go.id
-- Password: admin123

-- =====================================================
-- INDEXES untuk Optimasi
-- =====================================================
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_kabko ON public.users(kabupaten_kota);
CREATE INDEX idx_periode_tahun ON public.periode_tes(tahun);
CREATE INDEX idx_periode_status ON public.periode_tes(status);

-- =====================================================
-- GRANTS (Permissions)
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMPLETED
-- =====================================================
-- Database schema untuk Sistem Pendataan Huffadz Jawa Timur
-- Total Tables: 12
-- Total Views: 2
-- Total Functions: 1
-- RLS: Enabled untuk security
-- =====================================================
