-- xp_transactionsテーブルのRLSポリシーを更新
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own xp transactions" ON xp_transactions;

-- 全てのユーザー（匿名ユーザー含む）が閲覧可能にする新しいポリシーを作成
CREATE POLICY "Anyone can view all xp transactions"
    ON xp_transactions FOR SELECT
    USING (true);

-- コメントを追加
COMMENT ON POLICY "Anyone can view all xp transactions" ON xp_transactions
IS '全てのユーザー（匿名ユーザー含む）は全てのXPトランザクションを閲覧可能（ランキング機能のため）';