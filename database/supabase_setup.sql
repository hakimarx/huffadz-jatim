-- SUPABASE SETUP SCRIPT FOR HUFFADZ JATIM
-- Run this in Supabase SQL Editor

-- 1. Create Enum Types
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin_provinsi', 'admin_kabko', 'hafiz');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('L', 'P');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'graduation_status') THEN
        CREATE TYPE graduation_status AS ENUM ('lulus', 'tidak_lulus', 'pending');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incentive_status') THEN
        CREATE TYPE incentive_status AS ENUM ('aktif', 'tidak_aktif', 'suspend');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'periode_status') THEN
        CREATE TYPE periode_status AS ENUM ('draft', 'pendaftaran', 'tes', 'selesai');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kegiatan_type') THEN
        CREATE TYPE kegiatan_type AS ENUM ('mengajar', 'murojah', 'khataman', 'lainnya');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'disetujui', 'ditolak');
    END IF;
END $$;

-- 2. Create Tables

-- users
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'hafiz',
    nama VARCHAR(255) NOT NULL,
    kabupaten_kota VARCHAR(100),
    telepon VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- kabupaten_kota
CREATE TABLE IF NOT EXISTS public.kabupaten_kota (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- periode_tes
CREATE TABLE IF NOT EXISTS public.periode_tes (
    id SERIAL PRIMARY KEY,
    tahun INT NOT NULL,
    nama_periode VARCHAR(100) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    kuota_total INT DEFAULT 0,
    status periode_status DEFAULT 'draft',
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- hafiz
CREATE TABLE IF NOT EXISTS public.hafiz (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    nik VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin gender,
    alamat TEXT,
    rt VARCHAR(10),
    rw VARCHAR(10),
    desa_kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kabupaten_kota VARCHAR(100),
    telepon VARCHAR(20),
    email VARCHAR(255),
    nama_bank VARCHAR(100),
    nomor_rekening VARCHAR(50),
    sertifikat_tahfidz VARCHAR(255),
    mengajar BOOLEAN DEFAULT FALSE,
    tmt_mengajar DATE,
    tempat_mengajar VARCHAR(255),
    tempat_mengajar_2 VARCHAR(255),
    tmt_mengajar_2 DATE,
    tahun_tes INT,
    periode_tes_id INT REFERENCES public.periode_tes(id) ON DELETE SET NULL,
    status_kelulusan graduation_status DEFAULT 'pending',
    nilai_tahfidz DECIMAL(5,2),
    nilai_wawasan DECIMAL(5,2),
    foto_ktp VARCHAR(255),
    foto_profil VARCHAR(255),
    tanda_tangan TEXT,
    nomor_piagam VARCHAR(100),
    tanggal_lulus DATE,
    status_insentif incentive_status DEFAULT 'aktif',
    keterangan TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- laporan_harian
CREATE TABLE IF NOT EXISTS public.laporan_harian (
    id SERIAL PRIMARY KEY,
    hafiz_id INT NOT NULL REFERENCES public.hafiz(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jenis_kegiatan kegiatan_type NOT NULL,
    deskripsi TEXT NOT NULL,
    foto VARCHAR(255),
    lokasi VARCHAR(255),
    durasi_menit INT,
    status_verifikasi verification_status DEFAULT 'pending',
    verified_by INT REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    catatan_verifikasi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- penguji
CREATE TABLE IF NOT EXISTS public.penguji (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telepon VARCHAR(20),
    lokasi_tes VARCHAR(255),
    periode_tes VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- jadwal_tes
CREATE TABLE IF NOT EXISTS public.jadwal_tes (
    id SERIAL PRIMARY KEY,
    periode_tes_id INT REFERENCES public.periode_tes(id) ON DELETE CASCADE,
    kabupaten_kota VARCHAR(100) NOT NULL,
    tanggal_tes DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT,
    kapasitas INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- penilaian
CREATE TABLE IF NOT EXISTS public.penilaian (
    id SERIAL PRIMARY KEY,
    hafiz_id INT REFERENCES public.hafiz(id) ON DELETE CASCADE,
    jadwal_tes_id INT REFERENCES public.jadwal_tes(id) ON DELETE SET NULL,
    nilai_tahfidz DECIMAL(5,2),
    nilai_wawasan DECIMAL(5,2),
    keterangan TEXT,
    penguji_id INT REFERENCES public.penguji(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hafiz_id, jadwal_tes_id)
);

-- settings
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT,
    group_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert Initial Data (Admin)
-- Password for 123456 (bcrypt $2a$10$...)
-- Replace with actual hash if needed, but for now we'll use a placeholder or skip
INSERT INTO public.users (email, password, nama, role, is_active)
VALUES ('hakimarx@gmail.com', '$2a$10$iIpx7Y/7WscdY.1.vMTD/.K0fX8rX/e.vM/N.fM.rX.vM/N.fM.rX.', 'Administrator', 'admin_provinsi', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
    -- Add more triggers as needed
END $$;
