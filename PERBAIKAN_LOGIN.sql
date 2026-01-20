-- =================================================================
-- SCRIPT PERBAIKAN AKUN (JALANKAN INI DI SUPABASE)
-- =================================================================

-- 1. KONFIRMASI EMAIL (Agar tidak perlu klik link di email)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'hakimarx@gmail.com';

-- 2. RESET PASSWORD JADI '123456'
-- Password diubah ke 123456 agar Anda mudah masuk dulu.
-- Nanti bisa diganti lagi.
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'hakimarx@gmail.com';

-- 3. PERBAIKI DATA PROFIL (Agar dashboard muncul)
INSERT INTO public.users (id, email, role, nama, kabupaten_kota)
SELECT id, email, 'admin_provinsi', 'Hakim Admin', 'Provinsi Jawa Timur'
FROM auth.users
WHERE email = 'hakimarx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin_provinsi', nama = 'Hakim Admin';

-- 4. KONFIRMASI SEMUA USER LAIN (Opsional, agar akun demo juga bisa masuk)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
