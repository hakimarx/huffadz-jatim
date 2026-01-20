-- Menghapus user hakimarx@gmail.com agar bisa dipakai daftar ulang
DELETE FROM hafiz WHERE user_id IN (SELECT id FROM users WHERE email = 'hakimarx@gmail.com');
DELETE FROM users WHERE email = 'hakimarx@gmail.com';

SELECT 'Akun hakimarx@gmail.com berhasil dihapus. Silakan daftar ulang.' AS status;
