-- Add membership fields to users table
USE dbemb;

-- Add columns for membership information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS instrument VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS identity_proof VARCHAR(255);

-- Display updated table structure
DESCRIBE users;
