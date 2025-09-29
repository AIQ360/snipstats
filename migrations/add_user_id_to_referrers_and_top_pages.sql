-- Add user_id column to referrers table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE referrers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Update existing records with user_id from daily_analytics
    UPDATE referrers r
    SET user_id = da.user_id
    FROM daily_analytics da
    WHERE r.daily_analytics_id = da.id;
    
    -- Make user_id NOT NULL after updating
    ALTER TABLE referrers ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add user_id column to top_pages table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'top_pages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE top_pages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Update existing records with user_id from daily_analytics
    UPDATE top_pages tp
    SET user_id = da.user_id
    FROM daily_analytics da
    WHERE tp.daily_analytics_id = da.id;
    
    -- Make user_id NOT NULL after updating
    ALTER TABLE top_pages ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add RLS policies for user_id
CREATE POLICY IF NOT EXISTS "Users can view their own referrers"
  ON referrers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own top_pages"
  ON top_pages FOR SELECT
  USING (auth.uid() = user_id);
