-- Web Push通知サブスクリプションを管理するテーブル
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public_user_profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, endpoint)
);

COMMENT ON TABLE push_subscriptions IS 'Web Push通知のサブスクリプション情報';
COMMENT ON COLUMN push_subscriptions.user_id IS 'サブスクリプションを持つユーザーのID（NULLの場合は匿名）';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push ServiceのエンドポイントURL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'クライアントの公開鍵（Base64URL）';
COMMENT ON COLUMN push_subscriptions.auth IS '認証シークレット（Base64URL）';
COMMENT ON COLUMN push_subscriptions.created_at IS 'サブスクリプション登録日時(UTC)';
COMMENT ON COLUMN push_subscriptions.updated_at IS 'サブスクリプション更新日時(UTC)';

-- RLS設定
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは自分のサブスクリプションを登録・更新・削除可能
CREATE POLICY manage_own_push_subscriptions
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
