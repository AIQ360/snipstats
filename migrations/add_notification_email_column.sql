-- Add notification_email column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_email TEXT;
