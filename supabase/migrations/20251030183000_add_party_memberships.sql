-- 党員バッジ表示のためのメンバーシップ情報を保持するテーブル
CREATE TABLE IF NOT EXISTS public.party_memberships (
  user_id UUID PRIMARY KEY REFERENCES public_user_profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'regular', 'premium')),
  badge_visibility BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.party_memberships IS 'チームみらい党員のプランとバッジ表示設定を保持する';
COMMENT ON COLUMN public.party_memberships.user_id IS 'public_user_profiles.id と紐付くユーザーID';
COMMENT ON COLUMN public.party_memberships.plan IS '党員プラン(starter/regular/premium)';
COMMENT ON COLUMN public.party_memberships.badge_visibility IS 'ユーザー名のバッジ表示フラグ（デフォルト表示）';
COMMENT ON COLUMN public.party_memberships.synced_at IS 'スプレッドシート連携で最終同期した日時';
COMMENT ON COLUMN public.party_memberships.metadata IS '同期元の補足情報';

-- プラン絞り込み用のインデックス
CREATE INDEX IF NOT EXISTS idx_party_memberships_plan ON public.party_memberships(plan);

-- updated_at を自動で更新
CREATE TRIGGER update_party_memberships_updated_at
  BEFORE UPDATE ON public.party_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS を有効化（Service Role 以外のクライアントからのアクセスをデフォルト拒否）
ALTER TABLE public.party_memberships ENABLE ROW LEVEL SECURITY;
