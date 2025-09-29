-- Add referral_code column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_referral_code_idx ON user_profiles(referral_code);
