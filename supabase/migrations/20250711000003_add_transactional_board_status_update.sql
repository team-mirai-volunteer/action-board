-- Issue #1054: トランザクション処理によるポスター掲示板ステータス更新の改善
-- poster_boards のステータス更新と poster_board_status_history の作成を同一トランザクションで実行

-- 1. トランザクション処理用のRPC関数を作成
CREATE OR REPLACE FUNCTION update_board_status_with_history(
    board_id UUID,
    new_status poster_board_status,
    user_id UUID,
    previous_status poster_board_status,
    note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- トランザクション開始（この関数内で自動的にトランザクション処理される）
    
    -- 1. ポスター掲示板のステータスを更新
    UPDATE poster_boards 
    SET status = new_status, updated_at = now()
    WHERE id = board_id;
    
    -- 更新対象が存在しなかった場合のエラー
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Poster board not found: %', board_id;
    END IF;
    
    -- 2. ステータス履歴を作成
    INSERT INTO poster_board_status_history (
        board_id, user_id, previous_status, new_status, note, created_at
    ) VALUES (
        board_id, user_id, previous_status, new_status, note, now()
    );
    
    -- 3. 成功時のレスポンス
    result := json_build_object(
        'success', true,
        'board_id', board_id,
        'previous_status', previous_status,
        'new_status', new_status,
        'user_id', user_id,
        'updated_at', now()
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- エラーが発生した場合は自動的にロールバック
        RAISE EXCEPTION 'Failed to update board status: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC関数のコメント
COMMENT ON FUNCTION update_board_status_with_history(UUID, poster_board_status, UUID, poster_board_status, TEXT) IS 
'ポスター掲示板のステータス更新と履歴作成を同一トランザクションで実行する関数。どちらかが失敗した場合は両方ともロールバックされる。';

-- 3. 権限設定（認証済みユーザーのみ実行可能）
GRANT EXECUTE ON FUNCTION update_board_status_with_history(UUID, poster_board_status, UUID, poster_board_status, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_board_status_with_history(UUID, poster_board_status, UUID, poster_board_status, TEXT) TO service_role;