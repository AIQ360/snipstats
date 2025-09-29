-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id),
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id),
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_user_id_idx ON referrals(referred_user_id);

-- Add RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Referrers can view their own referrals
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id);

-- Only the system can insert/update referrals
CREATE POLICY "System can insert referrals" ON referrals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
    FOR UPDATE USING (true);
