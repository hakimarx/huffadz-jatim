-- Add telepon column to users table
-- We use a stored procedure or block to handle "IF NOT EXISTS" logic for columns in MySQL < 8.0 friendly way, 
-- or simply ignore error if it exists. Since we want to be safe:

-- Simple approach: Attempt to add, if it fails it might be because it exists. 
-- Better approach for migrations: This file should ONLY be run once by the runner.
-- So we can just put the ALTER command.

ALTER TABLE users ADD COLUMN telepon VARCHAR(20) AFTER kabupaten_kota;
