-- Create tables
CREATE TABLE IF NOT EXISTS ga_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ga_account_id TEXT NOT NULL,
    ga_property_id TEXT NOT NULL,
    property_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP WITH TIME ZONE,
    data_consent BOOLEAN DEFAULT TRUE,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sessions INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    bounce_rate NUMERIC(5,2) DEFAULT 0,
    avg_session_duration NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS traffic_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    source TEXT NOT NULL,
    medium TEXT,
    sessions INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_path TEXT NOT NULL,
    pageviews INTEGER DEFAULT 0,
    unique_pageviews INTEGER DEFAULT 0,
    avg_time_on_page NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    device_category TEXT NOT NULL,
    sessions INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE ga_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view their own GA accounts" ON ga_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GA accounts" ON ga_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GA accounts" ON ga_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GA accounts" ON ga_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Daily analytics policies
CREATE POLICY "Users can view their own daily analytics" ON daily_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily analytics" ON daily_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily analytics" ON daily_analytics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily analytics" ON daily_analytics
    FOR DELETE USING (auth.uid() = user_id);

-- Traffic sources policies
CREATE POLICY "Users can view their own traffic sources" ON traffic_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own traffic sources" ON traffic_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own traffic sources" ON traffic_sources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own traffic sources" ON traffic_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Page paths policies
CREATE POLICY "Users can view their own page paths" ON page_paths
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page paths" ON page_paths
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page paths" ON page_paths
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page paths" ON page_paths
    FOR DELETE USING (auth.uid() = user_id);

-- Devices policies
CREATE POLICY "Users can view their own devices" ON devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" ON devices
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS ga_accounts_user_id_idx ON ga_accounts(user_id);
CREATE INDEX IF NOT EXISTS daily_analytics_user_id_idx ON daily_analytics(user_id);
CREATE INDEX IF NOT EXISTS daily_analytics_date_idx ON daily_analytics(date);
CREATE INDEX IF NOT EXISTS traffic_sources_user_id_idx ON traffic_sources(user_id);
CREATE INDEX IF NOT EXISTS traffic_sources_date_idx ON traffic_sources(date);
CREATE INDEX IF NOT EXISTS page_paths_user_id_idx ON page_paths(user_id);
CREATE INDEX IF NOT EXISTS page_paths_date_idx ON page_paths(date);
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices(user_id);
CREATE INDEX IF NOT EXISTS devices_date_idx ON devices(date);
