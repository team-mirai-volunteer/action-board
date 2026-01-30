-- migration: fix_rls_security_definer
-- 自分の投稿のみフィルターがRLSで弾かれる問題を修正
-- 関数に SECURITY DEFINER と search_path = public を追加

-- 1. ボードIDのみを取得する関数
CREATE OR REPLACE FUNCTION get_user_edited_boards_by_prefecture(
  target_prefecture poster_prefecture_enum,
  target_user_id uuid
)
RETURNS TABLE(board_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER -- 管理者権限で実行
SET search_path = public -- セキュリティ対策
AS $$
  SELECT board_id
  FROM poster_board_latest_editors
  WHERE prefecture = target_prefecture
    AND last_editor_id = target_user_id
  ORDER BY last_edited_at DESC;
$$;

-- 2. 詳細情報も取得する関数（こちらも同様に修正推奨）
CREATE OR REPLACE FUNCTION get_user_edited_boards_with_details(
  target_prefecture poster_prefecture_enum,
  target_user_id uuid
)
RETURNS TABLE(
  board_id uuid,
  lat double precision,
  long double precision,
  status poster_board_status,
  last_edited_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER -- 管理者権限で実行
SET search_path = public -- セキュリティ対策
AS $$
  SELECT 
    board_id,
    lat,
    long,
    status,
    last_edited_at
  FROM poster_board_latest_editors
  WHERE prefecture = target_prefecture
    AND last_editor_id = target_user_id
  ORDER BY last_edited_at DESC;
$$;
