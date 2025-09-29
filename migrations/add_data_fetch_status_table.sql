-- Create a table to track data fetch status
CREATE TABLE IF NOT EXISTS data_fetch_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE data_fetch_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data fetch status"
  ON data_fetch_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data fetch status"
  ON data_fetch_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data fetch status"
  ON data_fetch_status FOR INSERT
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
