-- Function to efficiently find user by email from auth.users table
-- This bypasses PostgREST schema restrictions by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
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
  -- Direct access to auth.users table with email filter (O(1) operation)
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data as user_metadata
  FROM auth.users u
  WHERE u.email = user_email
  LIMIT 1;
END;
$$;

-- Grant execution permission to service role ONLY (server-side only)
-- This prevents authenticated users from calling this function directly from client-side
GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_by_email(text) IS 
'Efficiently finds a user by email address. Uses SECURITY DEFINER to access auth.users table directly, providing O(1) lookup instead of O(n) listUsers() iteration. Used for LINE authentication and password reset flows.';