-- Create pending_subscriptions table
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES subscription_plans(id),
  dodo_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_user_id ON pending_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_dodo_id ON pending_subscriptions(dodo_subscription_id);
