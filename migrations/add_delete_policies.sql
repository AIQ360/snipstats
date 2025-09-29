DO $$
BEGIN
  -- Check if DELETE policy exists for daily_analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daily_analytics' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Users can delete their own analytics data" 
    ON "public"."daily_analytics" FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;

  -- Check if DELETE policy exists for referrers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'referrers' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Users can delete their own referrers data" 
    ON "public"."referrers" FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;

  -- Check if DELETE policy exists for top_pages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'top_pages' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Users can delete their own top_pages data" 
    ON "public"."top_pages" FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;

  -- Check if DELETE policy exists for events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND cmd = 'DELETE'
  ) THEN
    CREATE POLICY "Users can delete their own events data" 
    ON "public"."events" FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;
