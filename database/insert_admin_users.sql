-- Insert Admin Users
-- Note: Passwords will be hashed by Supabase Auth
-- You need to run this through Supabase Dashboard or use Supabase Auth API

-- First, create the users in auth.users table (this should be done via Supabase Dashboard or API)
-- Then insert into public.users table

-- Insert Admin Provinsi
INSERT INTO public.users (id, email, nama, role, kabupaten_kota_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'hakimarx@gmail.com',
  'Admin Provinsi Jawa Timur',
  'admin_provinsi',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  nama = EXCLUDED.nama,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert Admin Kab/Ko Surabaya
INSERT INTO public.users (id, email, nama, role, kabupaten_kota_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'adminsby@huffadz.jatim.go.id',
  'Admin Kota Surabaya',
  'admin_kabko',
  (SELECT id FROM kabupaten_kota WHERE nama = 'KOTA SURABAYA' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  nama = EXCLUDED.nama,
  role = EXCLUDED.role,
  kabupaten_kota_id = EXCLUDED.kabupaten_kota_id,
  updated_at = NOW();

-- Note: To create the actual auth users with passwords, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create:
--    - Email: hakimarx@gmail.com, Password: g4yung4n
--    - Email: adminsby@huffadz.jatim.go.id, Password: 123456
-- 3. Copy the UUID from auth.users
-- 4. Update the public.users table with the correct UUID

-- OR use this SQL to create auth users (run in Supabase SQL Editor with proper permissions):
-- This requires admin privileges and may need to be run separately

-- For hakimarx@gmail.com
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = 'hakimarx@gmail.com';
  
  IF user_id IS NULL THEN
    -- Insert into auth.users (simplified - actual implementation may vary)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'hakimarx@gmail.com',
      crypt('g4yung4n', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_id;
  END IF;
  
  -- Update or insert into public.users
  INSERT INTO public.users (id, email, nama, role, kabupaten_kota_id, created_at, updated_at)
  VALUES (
    user_id,
    'hakimarx@gmail.com',
    'Admin Provinsi Jawa Timur',
    'admin_provinsi',
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nama = EXCLUDED.nama,
    role = EXCLUDED.role,
    updated_at = NOW();
END $$;

-- For adminsby@huffadz.jatim.go.id
DO $$
DECLARE
  user_id uuid;
  kota_id uuid;
BEGIN
  -- Get Surabaya ID
  SELECT id INTO kota_id FROM kabupaten_kota WHERE nama = 'KOTA SURABAYA' LIMIT 1;
  
  -- Check if user exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = 'adminsby@huffadz.jatim.go.id';
  
  IF user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'adminsby@huffadz.jatim.go.id',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO user_id;
  END IF;
  
  -- Update or insert into public.users
  INSERT INTO public.users (id, email, nama, role, kabupaten_kota_id, created_at, updated_at)
  VALUES (
    user_id,
    'adminsby@huffadz.jatim.go.id',
    'Admin Kota Surabaya',
    'admin_kabko',
    kota_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nama = EXCLUDED.nama,
    role = EXCLUDED.role,
    kabupaten_kota_id = EXCLUDED.kabupaten_kota_id,
    updated_at = NOW();
END $$;
