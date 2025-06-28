CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  is_visible boolean NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_id) -- 重複防止
);

COMMENT ON TABLE user_badges IS 'ユーザー取得済みバッジ';
COMMENT ON COLUMN user_badges.user_id IS 'ユーザーID';
COMMENT ON COLUMN user_badges.badge_id IS 'バッジID';
COMMENT ON COLUMN user_badges.is_visible IS '表示・非表示設定';
COMMENT ON COLUMN user_badges.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

