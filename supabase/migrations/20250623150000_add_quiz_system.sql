-- クイズ機能のためのテーブル作成とミッション更新

-- クイズカテゴリテーブル
CREATE TABLE quiz_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE quiz_categories IS 'クイズのカテゴリ管理';
COMMENT ON COLUMN quiz_categories.id IS 'カテゴリID';
COMMENT ON COLUMN quiz_categories.name IS 'カテゴリ名';
COMMENT ON COLUMN quiz_categories.description IS 'カテゴリの説明';
COMMENT ON COLUMN quiz_categories.display_order IS '表示順序';
COMMENT ON COLUMN quiz_categories.is_active IS 'アクティブフラグ';
COMMENT ON COLUMN quiz_categories.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN quiz_categories.updated_at IS '更新日時(UTC)';

-- クイズ問題テーブル
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES quiz_categories(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 1 AND correct_answer <= 4),
    explanation TEXT,
    question_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT quiz_questions_mission_or_category CHECK (
        (mission_id IS NOT NULL AND question_order IS NOT NULL) OR 
        (mission_id IS NULL AND question_order IS NULL)
    )
);

COMMENT ON TABLE quiz_questions IS 'クイズ問題';
COMMENT ON COLUMN quiz_questions.id IS '問題ID';
COMMENT ON COLUMN quiz_questions.category_id IS 'カテゴリID';
COMMENT ON COLUMN quiz_questions.question IS '問題文';
COMMENT ON COLUMN quiz_questions.option1 IS '選択肢1';
COMMENT ON COLUMN quiz_questions.option2 IS '選択肢2';
COMMENT ON COLUMN quiz_questions.option3 IS '選択肢3';
COMMENT ON COLUMN quiz_questions.option4 IS '選択肢4';
COMMENT ON COLUMN quiz_questions.correct_answer IS '正解の選択肢番号 (1-4)';
COMMENT ON COLUMN quiz_questions.explanation IS '解説';
COMMENT ON COLUMN quiz_questions.mission_id IS 'ミッションID（ミッション専用問題の場合）';
COMMENT ON COLUMN quiz_questions.question_order IS '問題の順序（ミッション内での表示順）';

-- ミッションクイズリンクテーブル
CREATE TABLE mission_quiz_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    link TEXT NOT NULL,
    remark TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE mission_quiz_links IS 'ミッションの参考リンク';
COMMENT ON COLUMN mission_quiz_links.id IS 'リンクID';
COMMENT ON COLUMN mission_quiz_links.mission_id IS 'ミッションID';
COMMENT ON COLUMN mission_quiz_links.link IS '参考リンクURL';
COMMENT ON COLUMN mission_quiz_links.remark IS 'リンクに関する備考';
COMMENT ON COLUMN mission_quiz_links.display_order IS '表示順序';
COMMENT ON COLUMN mission_quiz_links.created_at IS '作成日時(UTC)';


-- インデックス作成
CREATE INDEX idx_quiz_questions_category_id ON quiz_questions(category_id);
CREATE INDEX idx_quiz_questions_mission_id ON quiz_questions(mission_id);
CREATE INDEX idx_quiz_questions_mission_order ON quiz_questions(mission_id, question_order);
CREATE INDEX idx_mission_quiz_links_mission_id ON mission_quiz_links(mission_id);

-- RLS設定

-- quiz_categories: 全ユーザー読み取り可能
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quiz categories"
  ON quiz_categories FOR SELECT
  USING (true);

-- quiz_questions: 全ユーザー読み取り可能
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);


-- mission_quiz_links: 全ユーザー読み取り可能
ALTER TABLE mission_quiz_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read mission quiz links"
  ON mission_quiz_links FOR SELECT
  USING (true);

-- mission_artifactsテーブルのartifact_type制約にQUIZタイプを追加
ALTER TABLE mission_artifacts 
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts 
ADD CONSTRAINT check_artifact_type 
CHECK (artifact_type IN ('LINK', 'TEXT', 'EMAIL', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'QUIZ'));

-- ensure_artifact_data制約にQUIZタイプを追加
ALTER TABLE mission_artifacts
DROP CONSTRAINT IF EXISTS ensure_artifact_data;

ALTER TABLE mission_artifacts
ADD CONSTRAINT ensure_artifact_data CHECK (
  (
    (
      (artifact_type = 'LINK'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'TEXT'::text)
      AND (text_content IS NOT NULL)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
    )
    OR (
      (artifact_type = 'EMAIL'::text)
      AND (text_content IS NOT NULL)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE_WITH_GEOLOCATION'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'REFERRAL'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'POSTING'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'QUIZ'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
  )
);
