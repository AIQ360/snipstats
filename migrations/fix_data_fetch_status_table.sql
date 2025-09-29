-- Check if the data_fetch_status table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'data_fetch_status'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.data_fetch_status (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      started_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    -- Add RLS policies
    ALTER TABLE public.data_fetch_status ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own fetch status"
      ON public.data_fetch_status
      FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own fetch status"
      ON public.data_fetch_status
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own fetch status"
      ON public.data_fetch_status
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    -- Create index for faster lookups
    CREATE INDEX idx_data_fetch_status_user_id ON public.data_fetch_status(user_id);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON public.data_fetch_status TO authenticated;
    GRANT SELECT ON public.data_fetch_status TO service_role;
  ELSE
    -- Table exists, check if columns need to be added
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_fetch_status' AND column_name = 'message') THEN
      ALTER TABLE public.data_fetch_status ADD COLUMN message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_fetch_status' AND column_name = 'started_at') THEN
      ALTER TABLE public.data_fetch_status ADD COLUMN started_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_fetch_status' AND column_name = 'updated_at') THEN
      ALTER TABLE public.data_fetch_status ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'data_fetch_status' AND column_name = 'completed_at') THEN
      ALTER TABLE public.data_fetch_status ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- Create a function to reset stuck statuses
CREATE OR REPLACE FUNCTION reset_stuck_fetch_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is 'fetching' or 'processing' and hasn't been updated in 10 minutes, reset to 'error'
  IF (NEW.status IN ('fetching', 'processing') AND 
      NEW.updated_at < NOW() - INTERVAL '10 minutes') THEN
    NEW.status := 'error';
    NEW.message := 'Fetch process timed out';
    NEW.completed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_reset_stuck_fetch_status ON public.data_fetch_status;

-- Create the trigger
CREATE TRIGGER trigger_reset_stuck_fetch_status
BEFORE UPDATE ON public.data_fetch_status
FOR EACH ROW
EXECUTE FUNCTION reset_stuck_fetch_status();
