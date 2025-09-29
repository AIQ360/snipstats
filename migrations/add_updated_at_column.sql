-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name = $2
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s DEFAULT NOW()', 
                   table_name, column_name, column_type);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to daily_analytics if it doesn't exist
SELECT add_column_if_not_exists('daily_analytics', 'updated_at', 'timestamp with time zone');
