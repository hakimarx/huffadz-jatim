-- Add bank account fields to hafiz table
-- Run this migration in TiDB Console SQL Editor

ALTER TABLE hafiz ADD COLUMN nama_bank VARCHAR(50) NULL AFTER email;
ALTER TABLE hafiz ADD COLUMN nomor_rekening VARCHAR(30) NULL AFTER nama_bank;

-- Verify the columns were added
DESCRIBE hafiz;
