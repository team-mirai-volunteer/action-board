-- YouTube同期ステータステーブル（全体共通）
-- search.list APIは100ユニット/回と高コストのため、レート制限用
CREATE TABLE youtube_sync_status (
  id VARCHAR PRIMARY KEY DEFAULT 'videos',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 初期レコードを挿入（3時間前に設定して、すぐに同期可能にする）
INSERT INTO youtube_sync_status (id, last_synced_at) VALUES ('videos', now() - INTERVAL '3 hours');

COMMENT ON TABLE youtube_sync_status IS 'YouTube同期のレート制限管理用テーブル';
COMMENT ON COLUMN youtube_sync_status.id IS '同期タイプ（videos等）';
COMMENT ON COLUMN youtube_sync_status.last_synced_at IS '最終同期日時';
