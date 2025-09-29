-- Add avg_engagement_time column to top_pages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'top_pages'
        AND column_name = 'avg_engagement_time'
    ) THEN
        ALTER TABLE top_pages
        ADD COLUMN avg_engagement_time FLOAT;
    END IF;
END $$;
