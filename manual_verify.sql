-- Verifikasi manual untuk hakim.luk81@gmail.com
UPDATE users 
SET is_verified = 1, is_active = 1, verification_token = NULL 
WHERE email = 'hakim.luk81@gmail.com';

SELECT id, email, nama, is_verified, is_active FROM users WHERE email = 'hakim.luk81@gmail.com';
