-- Add property_name column to ga_accounts table
ALTER TABLE ga_accounts ADD COLUMN IF NOT EXISTS property_name TEXT;

-- Update existing records to have a default property name if missing
UPDATE ga_accounts 
SET property_name = 'Google Analytics Property' 
WHERE property_name IS NULL;
