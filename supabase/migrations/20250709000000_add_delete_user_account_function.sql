-- 退会機能用のストアドプロシージャを作成
-- トランザクションを使用してデータの整合性を確保

CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- トランザクション開始（関数内で自動的に開始される）
  
  -- 外部キー制約を考慮した削除順序
  -- 1. mission_artifacts テーブル（user_id参照）
  DELETE FROM mission_artifacts WHERE user_id = target_user_id;
  
  -- 2. poster_activities テーブル（user_id参照）
  DELETE FROM poster_activities WHERE user_id = target_user_id;
  
  -- 3. poster_board_status_history テーブル（user_id参照）
  DELETE FROM poster_board_status_history WHERE user_id = target_user_id;
  
  -- 4. user_badges テーブル（user_id参照）
  DELETE FROM user_badges WHERE user_id = target_user_id;
  
  -- 5. achievements テーブル（user_id参照）
  DELETE FROM achievements WHERE user_id = target_user_id;
  
  -- 6. xp_transactions テーブル（user_id参照）
  DELETE FROM xp_transactions WHERE user_id = target_user_id;
  
  -- 7. user_levels テーブル（user_id参照）
  DELETE FROM user_levels WHERE user_id = target_user_id;
  
  -- 8. user_referral テーブル（user_id参照）
  DELETE FROM user_referral WHERE user_id = target_user_id;
  
  -- 9. public_user_profiles テーブル（id参照）
  DELETE FROM public_user_profiles WHERE id = target_user_id;
  
  -- 10. private_users テーブル（id参照、メインテーブル）
  DELETE FROM private_users WHERE id = target_user_id;
  
  -- 成功した場合、トランザクションがコミットされる
  -- エラーが発生した場合、自動的にロールバックされる
  
EXCEPTION
  WHEN OTHERS THEN
    -- エラーログ出力
    RAISE LOG 'Error deleting user account %: %', target_user_id, SQLERRM;
    -- エラーを再スロー（ロールバックを発生させる）
    RAISE;
END;
$$;

-- セキュリティ設定：認証されたユーザーのみ実行可能
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO service_role;

-- 関数の説明を追加
COMMENT ON FUNCTION delete_user_account(UUID) IS 'ユーザーアカウントと関連するすべてのデータをトランザクション内で安全に削除する';