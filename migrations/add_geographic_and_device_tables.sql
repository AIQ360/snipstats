-- Add geographic analytics table
CREATE TABLE IF NOT EXISTS geographic_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_analytics_id UUID NOT NULL REFERENCES daily_analytics(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  city TEXT,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add device analytics table
CREATE TABLE IF NOT EXISTS device_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_analytics_id UUID NOT NULL REFERENCES daily_analytics(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  device_category TEXT NOT NULL, -- Mobile, Desktop, Tablet
  browser TEXT,
  operating_system TEXT,
  visitors INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_user_date ON geographic_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_country ON geographic_analytics(country);
CREATE INDEX IF NOT EXISTS idx_device_analytics_user_date ON device_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_device_analytics_device_category ON device_analytics(device_category);

-- Enable RLS
ALTER TABLE geographic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_analytics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own geographic analytics" ON geographic_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own geographic analytics" ON geographic_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own geographic analytics" ON geographic_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own geographic analytics" ON geographic_analytics
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own device analytics" ON device_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device analytics" ON device_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device analytics" ON device_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device analytics" ON device_analytics
  FOR DELETE USING (auth.uid() = user_id);
