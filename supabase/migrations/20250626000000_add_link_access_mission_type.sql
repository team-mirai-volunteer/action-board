-- mission_main_linksテーブルの作成
CREATE TABLE mission_main_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    label VARCHAR(200) NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_mission_main_link UNIQUE (mission_id)
);

COMMENT ON TABLE mission_main_links IS 'ミッションのメインリンク情報（1:1関係）';
COMMENT ON COLUMN mission_main_links.id IS 'レコードの一意識別子';
COMMENT ON COLUMN mission_main_links.mission_id IS '関連するミッションのID';
COMMENT ON COLUMN mission_main_links.label IS 'リンクボタンのラベルテキスト';
COMMENT ON COLUMN mission_main_links.link IS 'リンク先URL';
COMMENT ON COLUMN mission_main_links.created_at IS 'レコード作成日時';
COMMENT ON COLUMN mission_main_links.updated_at IS 'レコード更新日時';

-- RLSポリシーの設定
ALTER TABLE mission_main_links ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY select_all_mission_main_links
  ON mission_main_links FOR SELECT
  USING (true);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX idx_mission_main_links_mission_id ON mission_main_links(mission_id);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_mission_main_links_updated_at
    BEFORE UPDATE ON mission_main_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- mission_artifactsテーブルのartifact_type制約を更新してLINK_ACCESSを追加
ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts
ADD CONSTRAINT check_artifact_type
CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'QUIZ', 'LINK_ACCESS'));