CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(50) NOT NULL PRIMARY KEY,
  `value` LONGTEXT DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`key`, `value`, `description`) VALUES
('app_logo', NULL, 'Logo aplikasi (Base64)'),
('app_name', 'LPTQ Jawa Timur', 'Nama aplikasi'),
('app_address', 'Jl. Pahlawan No. 110 Surabaya', 'Alamat instansi');
