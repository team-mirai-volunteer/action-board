-- posting_shapes の UPDATE/DELETE ポリシーから "OR user_id IS NULL" を除去する。
--
-- user_id 列は 20260111154119 で後から追加された（nullable）。それ以前に作られた
-- シェイプは user_id IS NULL のため、従来のポリシーでは「所有者でない認証ユーザー」でも
-- それらの行を編集・削除できてしまっていた（RLS の過剰許可）。
-- NULL owner の行は管理者（is_admin / is_posting_admin）のみが編集・削除できるように絞る。
-- 通常の所有者による自分のシェイプの編集・削除、管理者操作には影響しない。

DROP POLICY IF EXISTS "Users can update own posting shapes or admin" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can delete own posting shapes or admin" ON public.posting_shapes;

CREATE POLICY "Users can update own posting shapes or admin"
  ON public.posting_shapes
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_posting_admin());

CREATE POLICY "Users can delete own posting shapes or admin"
  ON public.posting_shapes
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_posting_admin());
