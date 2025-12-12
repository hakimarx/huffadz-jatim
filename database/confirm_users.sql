
-- =================================================================
-- SCRIPT AUTO-CONFIRM USERS
-- =================================================================
-- Jalankan script ini di SQL Editor Supabase untuk mengonfirmasi email user secara paksa.

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Opsional: Konfirmasi spesifik user jika ingin lebih aman
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email IN ('hakimarx@gmail.com', 'admin.provinsi@demo.com', 'admin.surabaya@demo.com', 'hafiz.demo@demo.com');
