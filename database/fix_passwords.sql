-- =====================================================
-- FIX PASSWORD HASH (yang terpotong/tidak lengkap)
-- Jalankan di TiDB Cloud atau MySQL localhost
-- =====================================================

USE huffadz_jatim;

-- Update password untuk admin.provinsi@bpq.jatimprov.go.id (password: bpq123)
UPDATE users SET password = '$2b$12$LkioeEkkPm71t.pj31ItSutad2P.Skz1a7n9JvAulWM6ptHODILiy' 
WHERE email = 'admin.provinsi@bpq.jatimprov.go.id';

-- Update password untuk hakimarx@gmail.com (password: g4yung4n)
UPDATE users SET password = '$2b$12$cAs.Wz0JRl4E5E8iKahre.Imf3z8AzOfcSjzjMkdBw7vN4jUZGc.6' 
WHERE email = 'hakimarx@gmail.com';

-- Update password untuk sby@mail.com (password: 123456)
UPDATE users SET password = '$2b$12$LkioeEkkPm71t.pj31ItSutad2P.Skz1a7n9JvAulWM6ptHODILiy' 
WHERE email = 'sby@mail.com';

-- Update password untuk hafiz123@mail.com (password: 123456)
UPDATE users SET password = '$2b$12$LkioeEkkPm71t.pj31ItSutad2P.Skz1a7n9JvAulWM6ptHODILiy' 
WHERE email = 'hafiz123@mail.com';

-- Verifikasi hasil
SELECT id, email, nama, role, LEFT(password, 30) as password_preview, 
       LENGTH(password) as password_length, is_active 
FROM users;

-- Password harus 60 karakter untuk bcrypt hash yang valid
-- Jika password_length != 60, berarti hash tidak valid
