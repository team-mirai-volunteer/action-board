-- Function to efficiently find user by LINE user ID from auth.users table
-- Mirrors get_user_by_email but filters on raw_user_meta_data->>'line_user_id'

CREATE OR REPLACE FUNCTION public.get_user_by_line_id(line_user_id text)
RETURNS TABLE (
  id uuid,
  email character varying(255),
  user_metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with privileges of function owner (service role)
SET search_path = public, auth
AS $$
BEGIN
  -- Direct access to auth.users table with LINE user ID filter (O(1) operation)
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.raw_user_meta_data AS user_metadata
  FROM auth.users u
  WHERE u.raw_user_meta_data ->> 'line_user_id' = line_user_id
  LIMIT 1;
END;
$$;

-- Grant execution permission to service role ONLY (server-side only)
GRANT EXECUTE ON FUNCTION public.get_user_by_line_id(text) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_by_line_id(text) IS
'Efficiently finds a user by LINE user ID stored in raw_user_meta_data. Uses SECURITY DEFINER to access auth.users table directly for O(1) lookups. Used for LINE authentication and linking flows.';
