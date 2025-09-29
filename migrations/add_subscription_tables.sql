-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  interval TEXT NOT NULL,
  dodo_product_id TEXT
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  dodo_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price, interval)
VALUES 
  ('monthly', 'Monthly Plan', 'Full access to all features', 500, 'month'),
  ('annual', 'Annual Plan', 'Full access to all features for a year', 4900, 'year')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read subscription plans
CREATE POLICY read_subscription_plans ON subscription_plans
  FOR SELECT USING (true);

-- Allow users to read their own subscriptions
CREATE POLICY read_own_subscriptions ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage all subscriptions
CREATE POLICY manage_subscriptions ON subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
