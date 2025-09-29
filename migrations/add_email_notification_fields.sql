-- Add email notification fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add email notifications preference to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
