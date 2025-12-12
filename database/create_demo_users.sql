
-- =================================================================
-- SCRIPT PEMBUATAN AKUN DEMO & RESET PASSWORD
-- =================================================================
-- Jalankan script ini di SQL Editor Supabase: https://supabase.com/dashboard/project/_/sql

-- 1. Pastikan ekstensi pgcrypto aktif untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Reset Password 'hakimarx@gmail.com' (jika user ada)
UPDATE auth.users
SET encrypted_password = crypt('g4yung4n', gen_salt('bf'))
WHERE email = 'hakimarx@gmail.com';

-- 3. Buat Akun Demo (Insert ke auth.users)
-- Password untuk semua akun demo: 'demo123'

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
-- Admin Provinsi Demo
(
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin.provinsi@demo.com',
    crypt('demo123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Provinsi Demo"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
),
-- Admin Kab/Ko Demo (Surabaya)
(
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin.surabaya@demo.com',
    crypt('demo123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Surabaya Demo"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
),
-- Hafiz Demo
(
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'hafiz.demo@demo.com',
    crypt('demo123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Hafiz Demo"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO NOTHING;

-- 4. Insert Profile ke public.users
-- Admin Provinsi
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_provinsi', 'Admin Provinsi Demo', 'Provinsi Jawa Timur'
FROM auth.users WHERE email = 'admin.provinsi@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin_provinsi';

-- Admin Kab/Ko
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_kabko', 'Admin Surabaya Demo', 'Kota Surabaya'
FROM auth.users WHERE email = 'admin.surabaya@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin_kabko';

-- Hafiz
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'hafiz', 'Hafiz Demo', 'Kota Surabaya'
FROM auth.users WHERE email = 'hafiz.demo@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'hafiz';

-- 5. Insert Profile Hafiz (Khusus role hafiz)
INSERT INTO public.hafiz (
    user_id,
    nik,
    nama,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    alamat,
    desa_kelurahan,
    kecamatan,
    kabupaten_kota,
    tahun_tes,
    status_kelulusan,
    nilai_tahfidz,
    nilai_wawasan
)
SELECT 
    id,
    '1234567890123456',
    'Hafiz Demo',
    'Surabaya',
    '2000-01-01',
    'L',
    'Jl. Demo No. 1',
    'Kelurahan Demo',
    'Kecamatan Demo',
    'Kota Surabaya',
    2024,
    'lulus',
    95.5,
    90.0
FROM auth.users WHERE email = 'hafiz.demo@demo.com'
ON CONFLICT (nik) DO NOTHING;
