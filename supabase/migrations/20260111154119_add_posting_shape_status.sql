-- postingマップ ステータス変更機能 + ミッション自動連動
-- Issue #1586

-- 1. posting_shape_status enum を作成
CREATE TYPE public.posting_shape_status AS ENUM (
  'planned',      -- 配布予定
  'completed',    -- 配布完了
  'unavailable',  -- 配布不可
  'other'         -- その他
);

-- 2. posting_shapes テーブルにカラム追加（status, user_id のみ）
ALTER TABLE public.posting_shapes
ADD COLUMN status public.posting_shape_status DEFAULT 'planned' NOT NULL,
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. インデックス追加
CREATE INDEX idx_posting_shapes_status ON public.posting_shapes(status);
CREATE INDEX idx_posting_shapes_user_id ON public.posting_shapes(user_id);

-- 4. RLSポリシー追加（自分の図形のみ編集可能）
ALTER TABLE public.posting_shapes ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員可能
CREATE POLICY "Anyone can view posting shapes"
  ON public.posting_shapes
  FOR SELECT
  USING (true);

-- 作成は認証ユーザーのみ
CREATE POLICY "Authenticated users can create posting shapes"
  ON public.posting_shapes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 更新は作成者のみ（または user_id が NULL の既存データ）
CREATE POLICY "Users can update own posting shapes"
  ON public.posting_shapes
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 削除は作成者のみ（または user_id が NULL の既存データ）
CREATE POLICY "Users can delete own posting shapes"
  ON public.posting_shapes
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. posting_activities テーブルに shape_id カラムを追加
ALTER TABLE public.posting_activities
ADD COLUMN shape_id UUID REFERENCES public.posting_shapes(id) ON DELETE SET NULL;

CREATE INDEX idx_posting_activities_shape_id ON public.posting_activities(shape_id);
