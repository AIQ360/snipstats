-- Test script to verify RLS is working correctly
-- This will help debug any remaining RLS issues

-- Check if RLS is enabled on subscriptions table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'subscriptions';

-- List all policies on subscriptions table
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;

-- Check if there are any conflicting policies
SELECT 
  t.schemaname,
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename = 'subscriptions'
GROUP BY t.schemaname, t.tablename, t.rowsecurity;
