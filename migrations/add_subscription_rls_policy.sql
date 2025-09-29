-- Function to add RLS policy for subscriptions table
CREATE OR REPLACE FUNCTION add_subscription_rls_policy()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
  
  -- Create policies
  CREATE POLICY "Users can view their own subscriptions" 
    ON subscriptions FOR SELECT 
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own subscriptions" 
    ON subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own subscriptions" 
    ON subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);
    
  -- Enable RLS on the table if not already enabled
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
END;
$$;
