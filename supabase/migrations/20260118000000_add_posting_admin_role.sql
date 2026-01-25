-- ポスティング管理者ロール向け posting_shapes RLS ポリシー追加
-- posting-admin ロールを持つユーザーがポスティングマップでシェイプを管理できるようにする

-- ヘルパー関数: ユーザーがポスティング管理者かどうかをチェック
CREATE OR REPLACE FUNCTION public.is_posting_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT (auth.jwt() -> 'app_metadata' -> 'roles')::jsonb ? 'posting-admin'
    ),
    false
  );
$$;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can update own posting shapes or admin" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can delete own posting shapes or admin" ON public.posting_shapes;

-- 更新ポリシー: 作成者、管理者、またはポスティング管理者が更新可能
CREATE POLICY "Users can update own posting shapes or admin"
  ON public.posting_shapes
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin() OR public.is_posting_admin());

-- 削除ポリシー: 作成者、管理者、またはポスティング管理者が削除可能
CREATE POLICY "Users can delete own posting shapes or admin"
  ON public.posting_shapes
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin() OR public.is_posting_admin());
