-- =====================================================
-- SQL untuk menambahkan kolom email verification
-- Jalankan di phpMyAdmin atau TiDB SQL Editor
-- =====================================================

USE huffadz_jatim;

-- Tambahkan kolom is_verified jika belum ada
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `is_verified` TINYINT(1) DEFAULT 0 COMMENT 'Status verifikasi email (0=belum, 1=sudah)';

-- Tambahkan kolom verification_token jika belum ada
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token untuk verifikasi email';

-- Update user yang sudah ada menjadi verified (untuk backward compatibility)
UPDATE `users` 
SET `is_verified` = 1 
WHERE `is_active` = 1 AND `is_verified` = 0;

-- Tampilkan struktur tabel users untuk verifikasi
DESCRIBE `users`;

SELECT 'Kolom verification berhasil ditambahkan!' AS status;
