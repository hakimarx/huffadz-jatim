-- SUPABASE INSERT USERS SCRIPT
-- Jalankan setelah supabase_setup.sql
-- Password untuk semua user: 123456

-- 1. Insert Admin Provinsi
INSERT INTO public.users (email, password, nama, role, is_active, is_verified)
VALUES (
    'hakimarx@gmail.com', 
    '$2b$10$MHjq38mopf4ZRTRjILIHTeHHnOULkvKlN6XnSdbrSR09kCLrILIwqm', 
    'Administrator Provinsi', 
    'admin_provinsi', 
    TRUE,
    TRUE
)
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = TRUE,
    is_verified = TRUE;

-- 2. Insert Admin Kabupaten/Kota (Contoh: Surabaya)
INSERT INTO public.users (email, password, nama, role, kabupaten_kota, is_active, is_verified)
VALUES (
    'admin.surabaya@lptq.jatim.go.id', 
    '$2b$10$MHjq38mopf4ZRTRjILIHTeHHnOULkvKlN6XnSdbrSR09kCLrILIwqm', 
    'Admin Kota Surabaya', 
    'admin_kabko',
    'Kota Surabaya',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Hafiz Test (untuk testing login hafiz)
INSERT INTO public.users (email, password, nama, role, kabupaten_kota, telepon, is_active, is_verified)
VALUES (
    'hafiz.test@gmail.com', 
    '$2b$10$MHjq38mopf4ZRTRjILIHTeHHnOULkvKlN6XnSdbrSR09kCLrILIwqm', 
    'Hafiz Test', 
    'hafiz',
    'Kota Surabaya',
    '081234567890',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 4. Insert data hafiz untuk user hafiz.test
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
    telepon, 
    tahun_tes, 
    status_kelulusan,
    is_active
)
SELECT 
    id,
    '3578012345678901',
    'Hafiz Test',
    'Surabaya',
    '2000-01-01',
    'L',
    'Jl. Test No. 1',
    'Kelurahan Test',
    'Kecamatan Test',
    'Kota Surabaya',
    '081234567890',
    2024,
    'pending',
    TRUE
FROM public.users 
WHERE email = 'hafiz.test@gmail.com'
ON CONFLICT (nik) DO NOTHING;

-- 5. Insert Kabupaten/Kota Jawa Timur
INSERT INTO public.kabupaten_kota (nama, kode) VALUES
    ('Kabupaten Bangkalan', '3526'),
    ('Kabupaten Banyuwangi', '3510'),
    ('Kabupaten Blitar', '3505'),
    ('Kabupaten Bojonegoro', '3522'),
    ('Kabupaten Bondowoso', '3511'),
    ('Kabupaten Gresik', '3525'),
    ('Kabupaten Jember', '3509'),
    ('Kabupaten Jombang', '3517'),
    ('Kabupaten Kediri', '3506'),
    ('Kabupaten Lamongan', '3524'),
    ('Kabupaten Lumajang', '3508'),
    ('Kabupaten Madiun', '3519'),
    ('Kabupaten Magetan', '3520'),
    ('Kabupaten Malang', '3507'),
    ('Kabupaten Mojokerto', '3516'),
    ('Kabupaten Nganjuk', '3518'),
    ('Kabupaten Ngawi', '3521'),
    ('Kabupaten Pacitan', '3501'),
    ('Kabupaten Pamekasan', '3528'),
    ('Kabupaten Pasuruan', '3514'),
    ('Kabupaten Ponorogo', '3502'),
    ('Kabupaten Probolinggo', '3513'),
    ('Kabupaten Sampang', '3527'),
    ('Kabupaten Sidoarjo', '3515'),
    ('Kabupaten Situbondo', '3512'),
    ('Kabupaten Sumenep', '3529'),
    ('Kabupaten Trenggalek', '3503'),
    ('Kabupaten Tuban', '3523'),
    ('Kabupaten Tulungagung', '3504'),
    ('Kota Batu', '3579'),
    ('Kota Blitar', '3572'),
    ('Kota Kediri', '3571'),
    ('Kota Madiun', '3577'),
    ('Kota Malang', '3573'),
    ('Kota Mojokerto', '3576'),
    ('Kota Pasuruan', '3575'),
    ('Kota Probolinggo', '3574'),
    ('Kota Surabaya', '3578')
ON CONFLICT (kode) DO NOTHING;

-- 6. Verifikasi data
SELECT 'Users:' as info, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Hafiz:', COUNT(*) FROM public.hafiz
UNION ALL
SELECT 'Kabupaten/Kota:', COUNT(*) FROM public.kabupaten_kota;
