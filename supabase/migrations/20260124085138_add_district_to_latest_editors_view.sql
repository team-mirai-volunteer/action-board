-- ビューposter_board_latest_editorsに district カラムを追加します。
-- 1. ビューに依存している関数を先に削除します
DROP FUNCTION get_user_edited_boards_by_prefecture(poster_prefecture_enum, uuid);
DROP FUNCTION get_user_edited_boards_with_details(poster_prefecture_enum, uuid);

-- 2. ビュー自体を削除します
DROP VIEW poster_board_latest_editors;

-- 3. 新しい定義でビューを作成します（districtを追加）
CREATE VIEW poster_board_latest_editors AS
WITH latest_history AS (
  SELECT DISTINCT ON (board_id) 
    board_id,
    user_id,
    created_at,
    new_status,
    previous_status
  FROM poster_board_status_history
  ORDER BY board_id, created_at DESC
)
SELECT 
  pb.id AS board_id,
  pb.prefecture,
  pb.district, -- ★ここに追加
  pb.lat,
  pb.long,
  pb.status,
  lh.user_id AS last_editor_id,
  lh.created_at AS last_edited_at,
  lh.new_status,
  lh.previous_status
FROM poster_boards pb
LEFT JOIN latest_history lh ON pb.id = lh.board_id;

-- 4. 削除した関数を再定義します（中身は元のまま）
CREATE FUNCTION get_user_edited_boards_by_prefecture(
  target_prefecture poster_prefecture_enum,
  target_user_id uuid
)
RETURNS TABLE(board_id uuid)
LANGUAGE sql
STABLE
AS $$
  SELECT board_id
  FROM poster_board_latest_editors
  WHERE prefecture = target_prefecture
    AND last_editor_id = target_user_id
  ORDER BY last_edited_at DESC;
$$;

-- 必要に応じて詳細取得関数も復元
CREATE FUNCTION get_user_edited_boards_with_details(
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

-- 5. 権限を再設定（ビューを作り直すとリセットされるため）
GRANT SELECT ON poster_board_latest_editors TO authenticated, anon;
