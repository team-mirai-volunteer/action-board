-- EmailリストからまとめてユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION public.get_users_by_emails(email_list text[])
RETURNS TABLE (
  id uuid,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  normalized_emails text[];
BEGIN
  SELECT array_agg(DISTINCT lower(trim(value)))
  INTO normalized_emails
  FROM unnest(COALESCE(email_list, ARRAY[]::text[])) AS value
  WHERE trim(value) <> '';

  IF normalized_emails IS NULL OR array_length(normalized_emails, 1) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    lower(u.email) AS email
  FROM auth.users u
  WHERE lower(u.email) = ANY (normalized_emails);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_by_emails(text[]) TO service_role;

COMMENT ON FUNCTION public.get_users_by_emails(text[]) IS
'Fetches auth.users.id for a list of email addresses in a single query. Used for party membership sync.';
