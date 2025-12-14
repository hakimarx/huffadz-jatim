-- =====================================================
-- SETUP DEMO USERS FOR TESTING
-- Run this in Supabase SQL Editor
-- =====================================================

-- Note: Passwords must be set via Supabase Auth UI or API
-- This script only creates the user profiles in public.users table

-- First, you need to create these users in Supabase Auth Dashboard:
-- 1. admin.provinsi@lptq.jatimprov.go.id (password: admin123)
-- 2. admin.surabaya@lptq.jatimprov.go.id (password: admin123)
-- 3. hafiz@example.com (password: admin123)

-- After creating in Auth, get their UUIDs and insert into public.users

-- Example: Insert user profiles (replace UUIDs with actual ones from auth.users)
-- You can get UUIDs by running: SELECT id, email FROM auth.users;

/*
-- Admin Provinsi
INSERT INTO public.users (id, email, role, nama, kabupaten_kota, telepon, is_active)
VALUES (
  'YOUR-ADMIN-PROV-UUID-HERE',
  'admin.provinsi@lptq.jatimprov.go.id',
  'admin_provinsi',
  'Admin Provinsi LPTQ',
  'Jawa Timur',
  '081234567890',
  true
);

-- Admin Kab/Ko Surabaya
INSERT INTO public.users (id, email, role, nama, kabupaten_kota, telepon, is_active)
VALUES (
  'YOUR-ADMIN-SURABAYA-UUID-HERE',
  'admin.surabaya@lptq.jatimprov.go.id',
  'admin_kabko',
  'Admin Kab/Ko Surabaya',
  'Kota Surabaya',
  '081234567891',
  true
);

-- Hafiz User
INSERT INTO public.users (id, email, role, nama, kabupaten_kota, telepon, is_active)
VALUES (
  'YOUR-HAFIZ-UUID-HERE',
  'hafiz@example.com',
  'hafiz',
  'Muhammad Hafiz',
  'Kota Surabaya',
  '081234567892',
  true
);

-- Create Hafiz profile for the Hafiz user
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
  email,
  tahun_tes,
  status_kelulusan
) VALUES (
  'YOUR-HAFIZ-UUID-HERE',
  '3578010101990001',
  'Muhammad Hafiz',
  'Surabaya',
  '1990-01-01',
  'L',
  'Jl. Contoh No. 123',
  'Gubeng',
  'Gubeng',
  'Kota Surabaya',
  '081234567892',
  'hafiz@example.com',
  2024,
  'lulus'
);
*/

-- =====================================================
-- QUICK CHECK: View existing users
-- =====================================================
SELECT 
  u.id,
  u.email,
  u.role,
  u.nama,
  u.kabupaten_kota,
  u.is_active,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

-- =====================================================
-- Check if demo users exist
-- =====================================================
SELECT 
  email,
  CASE 
    WHEN email = 'admin.provinsi@lptq.jatimprov.go.id' THEN '✅ Admin Provinsi'
    WHEN email = 'admin.surabaya@lptq.jatimprov.go.id' THEN '✅ Admin Kab/Ko'
    WHEN email = 'hafiz@example.com' THEN '✅ Hafiz'
    ELSE '❓ Unknown'
  END as user_type,
  role,
  nama,
  is_active
FROM public.users
WHERE email IN (
  'admin.provinsi@lptq.jatimprov.go.id',
  'admin.surabaya@lptq.jatimprov.go.id',
  'hafiz@example.com'
);

-- =====================================================
-- INSTRUCTIONS FOR CREATING DEMO USERS
-- =====================================================
/*

STEP 1: Create users in Supabase Auth Dashboard
----------------------------------------
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" button
3. Create these 3 users:

   User 1:
   - Email: admin.provinsi@lptq.jatimprov.go.id
   - Password: admin123
   - Auto Confirm: YES

   User 2:
   - Email: admin.surabaya@lptq.jatimprov.go.id
   - Password: admin123
   - Auto Confirm: YES

   User 3:
   - Email: hafiz@example.com
   - Password: admin123
   - Auto Confirm: YES

STEP 2: Get User UUIDs
----------------------------------------
Run this query to get the UUIDs:

SELECT id, email FROM auth.users 
WHERE email IN (
  'admin.provinsi@lptq.jatimprov.go.id',
  'admin.surabaya@lptq.jatimprov.go.id',
  'hafiz@example.com'
);

STEP 3: Insert into public.users
----------------------------------------
Use the UUIDs from Step 2 and run the INSERT statements above
(uncomment and replace the UUIDs)

STEP 4: Test Login
----------------------------------------
1. Go to http://localhost:3000
2. Try logging in with each account
3. Verify role-based access control

*/
