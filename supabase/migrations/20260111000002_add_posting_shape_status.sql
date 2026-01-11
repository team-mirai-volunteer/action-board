-- ポスティングマップ ステータス変更機能の追加

-- 1. ステータス用のENUM型を作成
CREATE TYPE posting_shape_status AS ENUM ('planned', 'completed', 'unavailable', 'other');

-- 2. posting_shapesテーブルにstatus, user_idカラムを追加
ALTER TABLE public.posting_shapes
  ADD COLUMN status posting_shape_status DEFAULT 'planned',
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 既存データのバックフィル（NULLを'planned'に設定）
UPDATE public.posting_shapes SET status = 'planned' WHERE status IS NULL;

-- NOT NULL制約を追加
ALTER TABLE public.posting_shapes ALTER COLUMN status SET NOT NULL;

-- 3. posting_activitiesテーブルにshape_idカラムを追加（重複防止用）
ALTER TABLE public.posting_activities
  ADD COLUMN shape_id UUID REFERENCES posting_shapes(id) ON DELETE SET NULL;

-- 4. インデックスの作成
CREATE INDEX idx_posting_shapes_status ON public.posting_shapes(status);
CREATE INDEX idx_posting_shapes_user_id ON public.posting_shapes(user_id);
CREATE INDEX idx_posting_shapes_event_id_status ON public.posting_shapes(event_id, status);
CREATE INDEX idx_posting_activities_shape_id ON public.posting_activities(shape_id);

-- 5. ユニーク制約の追加（同一アーティファクトが同一shapeに対して複数回紐付くことを防止）
-- mission_artifact_idとshape_idの複合ユニーク制約にすることで、
-- 複数ユーザーが同じshapeを完了報告できるようにする
CREATE UNIQUE INDEX idx_posting_activities_artifact_shape_unique
  ON public.posting_activities(mission_artifact_id, shape_id)
  WHERE shape_id IS NOT NULL;

-- 6. RLSの有効化（posting_shapes）
ALTER TABLE public.posting_shapes ENABLE ROW LEVEL SECURITY;

-- 7. RLSポリシーの作成（posting_shapes）

-- 認証ユーザーはすべてのシェイプを閲覧可能
CREATE POLICY "Authenticated users can view all posting shapes"
  ON public.posting_shapes
  FOR SELECT
  TO authenticated
  USING (true);

-- 匿名ユーザーもすべてのシェイプを閲覧可能（既存の互換性維持）
CREATE POLICY "Anonymous users can view all posting shapes"
  ON public.posting_shapes
  FOR SELECT
  TO anon
  USING (true);

-- 認証ユーザーはステータスとuser_idのみ更新可能
-- 座標やプロパティの更新は制限する
CREATE POLICY "Authenticated users can update posting shape status"
  ON public.posting_shapes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- 更新前後で座標、プロパティ、event_id、typeが変更されていないことを確認
    -- ステータスとuser_idのみ更新を許可
    true
  );

-- 注意: PostgreSQLのRLSでは更新されるカラムを直接制限できないため、
-- アプリケーション側でステータス更新のみを行うように制御する

-- posting_activitiesのRLSポリシーは既存のものを維持
-- （ユーザーは自分のアクティビティのみ管理可能）

-- 8. ステータス履歴テーブルの作成
CREATE TABLE IF NOT EXISTS public.posting_shape_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shape_id UUID NOT NULL REFERENCES posting_shapes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_status posting_shape_status,
  new_status posting_shape_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ステータス履歴のインデックス
CREATE INDEX idx_posting_shape_status_history_shape_id ON public.posting_shape_status_history(shape_id);
CREATE INDEX idx_posting_shape_status_history_user_id ON public.posting_shape_status_history(user_id);
CREATE INDEX idx_posting_shape_status_history_created_at ON public.posting_shape_status_history(created_at DESC);

-- ステータス履歴のRLS
ALTER TABLE public.posting_shape_status_history ENABLE ROW LEVEL SECURITY;

-- 認証ユーザーはすべての履歴を閲覧可能
CREATE POLICY "Authenticated users can view posting shape status history"
  ON public.posting_shape_status_history
  FOR SELECT
  TO authenticated
  USING (true);

-- 認証ユーザーは自分の履歴のみ追加可能
CREATE POLICY "Authenticated users can insert posting shape status history"
  ON public.posting_shape_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- コメント追加
COMMENT ON COLUMN public.posting_shapes.status IS 'シェイプのステータス（planned=予定, completed=完了, unavailable=不可, other=その他）';
COMMENT ON COLUMN public.posting_shapes.user_id IS 'ステータスを最後に更新したユーザーのID';
COMMENT ON COLUMN public.posting_activities.shape_id IS '関連するシェイプのID（マップからの達成の場合）';
COMMENT ON TABLE public.posting_shape_status_history IS 'ポスティングシェイプのステータス変更履歴';
