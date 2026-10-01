-- 関数の実行権限を整理（service_role のみに限定）
REVOKE EXECUTE ON FUNCTION public.get_user_by_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_users_by_emails(text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_by_line_id(text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_users_by_emails(text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_by_line_id(text) TO service_role;
