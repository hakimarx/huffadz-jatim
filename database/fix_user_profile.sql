
-- =================================================================
-- SCRIPT FIX USER PROFILE
-- =================================================================
-- Jalankan script ini di SQL Editor Supabase untuk memastikan user hakimarx@gmail.com memiliki profile.

INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT 
    id, 
    email, 
    'admin_provinsi', 
    'Hakim Admin', 
    'Provinsi Jawa Timur'
FROM auth.users
WHERE email = 'hakimarx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin_provinsi', nama = 'Hakim Admin';

-- Cek hasilnya
SELECT * FROM public.users WHERE email = 'hakimarx@gmail.com';
