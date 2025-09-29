-- Add token_status column to ga_accounts table
ALTER TABLE ga_accounts ADD COLUMN IF NOT EXISTS token_status TEXT DEFAULT 'valid';

-- Update existing rows to have a default status
UPDATE ga_accounts SET token_status = 'valid' WHERE token_status IS NULL;
