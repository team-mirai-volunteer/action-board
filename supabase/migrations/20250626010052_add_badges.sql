CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200),
  icon_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE badges IS 'バッジ定義マスター';
COMMENT ON COLUMN badges.code IS 'バッジのコード';  -- TOP10_DAILY, TOP100_OVERALL, ..
COMMENT ON COLUMN badges.name IS 'バッジ名';    -- like Github badge
COMMENT ON COLUMN badges.description IS 'バッジ説明'; -- like Github badge
COMMENT ON COLUMN badges.icon_url IS 'バッジアイコンのURL';
COMMENT ON COLUMN badges.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
-- すべてのユーザーに読み込みは許可
CREATE POLICY select_all_badges
  ON badges FOR SELECT
  USING (true);

