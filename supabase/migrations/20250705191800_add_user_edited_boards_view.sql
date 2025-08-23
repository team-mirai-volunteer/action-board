-- ユーザーが最後に編集した掲示板を効率的に取得するためのビューとRPC関数

-- まず、各掲示板の最新の編集履歴を取得するビューを作成
CREATE OR REPLACE VIEW poster_board_latest_editors AS
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
  pb.lat,
  pb.long,
  pb.status,
  lh.user_id AS last_editor_id,
  lh.created_at AS last_edited_at,
  lh.new_status,
  lh.previous_status
FROM poster_boards pb
LEFT JOIN latest_history lh ON pb.id = lh.board_id;

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_poster_board_status_history_board_created 
ON poster_board_status_history(board_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_poster_board_status_history_user_created 
ON poster_board_status_history(user_id, created_at DESC);

-- ユーザーが編集した掲示板IDを都道府県別に取得するRPC関数
CREATE OR REPLACE FUNCTION get_user_edited_boards_by_prefecture(
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

-- より詳細な情報を含むバージョン（必要に応じて使用）
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

-- 統計情報を高速に取得するための関数（既存の関数を改善）
CREATE OR REPLACE FUNCTION get_poster_board_stats_optimized(
  target_prefecture poster_prefecture_enum
)
RETURNS TABLE(
  total_count bigint,
  status_counts jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH status_summary AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'not_yet') AS not_yet_count,
      COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_count,
      COUNT(*) FILTER (WHERE status = 'done') AS done_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_place') AS error_wrong_place_count,
      COUNT(*) FILTER (WHERE status = 'error_damaged') AS error_damaged_count,
      COUNT(*) FILTER (WHERE status = 'error_wrong_poster') AS error_wrong_poster_count,
      COUNT(*) FILTER (WHERE status = 'other') AS other_count,
      COUNT(*) AS total
    FROM poster_boards
    WHERE prefecture = target_prefecture
  )
  SELECT 
    total,
    jsonb_build_object(
      'not_yet', not_yet_count,
      'reserved', reserved_count,
      'done', done_count,
      'error_wrong_place', error_wrong_place_count,
      'error_damaged', error_damaged_count,
      'error_wrong_poster', error_wrong_poster_count,
      'other', other_count
    )
  FROM status_summary;
$$;

-- RLSポリシーをビューに適用（必要に応じて）
GRANT SELECT ON poster_board_latest_editors TO authenticated, anon;