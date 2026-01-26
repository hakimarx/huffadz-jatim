-- Add reset password columns to users table
-- Run this SQL on your database

ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;

-- Add index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Show column status
DESCRIBE users;
