-- =================================================================
-- SCRIPT PERBAIKAN LOGIN & SEEDING USER
-- =================================================================
-- Jalankan script ini di SQL Editor Supabase (https://supabase.com/dashboard/project/_/sql)

-- 1. Perbaiki User 'hakimarx@gmail.com' (Jadikan Admin Provinsi)
-- Pastikan user ini sudah dibuat di menu Authentication -> Users
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_provinsi', 'Hakim Admin', 'Provinsi Jawa Timur'
FROM auth.users
WHERE email = 'hakimarx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin_provinsi', nama = 'Hakim Admin';

-- 2. Contoh User Admin Kab/Ko (Surabaya)
-- PENTING: Buat user ini dulu di Auth -> Users dengan email: admin.sby@demo.com
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_kabko', 'Admin Surabaya', 'Kota Surabaya'
FROM auth.users
WHERE email = 'admin.sby@demo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin_kabko', kabupaten_kota = 'Kota Surabaya';

-- 3. Contoh User Hafiz (Banyuwangi)
-- PENTING: Buat user ini dulu di Auth -> Users dengan email: hafiz.bwi@demo.com
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'hafiz', 'Abdullah Hafiz', 'Kabupaten Banyuwangi'
FROM auth.users
WHERE email = 'hafiz.bwi@demo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'hafiz';

-- 3b. Buat Profile Hafiz untuk user di atas (Wajib untuk role hafiz)
INSERT INTO public.hafiz (user_id, nik, nama, tanggal_lahir, jenis_kelamin, kabupaten_kota, tahun_tes)
SELECT 
    id, 
    '3510000000000001', 
    'Abdullah Hafiz', 
    '2000-01-01', 
    'L', 
    'Kabupaten Banyuwangi', 
    2025
FROM auth.users
WHERE email = 'hafiz.bwi@demo.com'
ON CONFLICT (nik) DO NOTHING;
