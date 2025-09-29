-- Create a function to get column types for a table
CREATE OR REPLACE FUNCTION get_column_types(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES') AS is_nullable
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' AND
    c.table_name = table_name;
END;
$$ LANGUAGE plpgsql;
