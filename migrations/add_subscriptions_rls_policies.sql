-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;

-- Create comprehensive RLS policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
  ON subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON subscriptions FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
  ON subscriptions FOR DELETE 
  USING (auth.uid() = user_id);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscriptions';
