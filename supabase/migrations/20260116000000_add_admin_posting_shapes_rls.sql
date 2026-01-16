-- 管理者ユーザー向け posting_shapes RLS ポリシー追加
-- Issue #1619: 管理者が全てのシェイプを管理できるようにする

-- ヘルパー関数: ユーザーが管理者かどうかをチェック
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT (auth.jwt() -> 'app_metadata' -> 'roles')::jsonb ? 'admin'
    ),
    false
  );
$$;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can update own posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can delete own posting shapes" ON public.posting_shapes;

-- 更新ポリシー: 作成者または管理者が更新可能
CREATE POLICY "Users can update own posting shapes or admin"
  ON public.posting_shapes
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- 削除ポリシー: 作成者または管理者が削除可能
CREATE POLICY "Users can delete own posting shapes or admin"
  ON public.posting_shapes
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());
