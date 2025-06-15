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
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 1 AND correct_answer <= 4),
    explanation TEXT,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
COMMENT ON COLUMN quiz_questions.difficulty IS '難易度 (1-5)';

-- ミッションクイズ問題関連テーブル（新規追加）
CREATE TABLE mission_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL CHECK (question_order >= 1 AND question_order <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(mission_id, question_id),
    UNIQUE(mission_id, question_order)
);

COMMENT ON TABLE mission_quiz_questions IS 'ミッションに紐づく固定のクイズ問題（3問）';
COMMENT ON COLUMN mission_quiz_questions.id IS 'ID';
COMMENT ON COLUMN mission_quiz_questions.mission_id IS 'ミッションID';
COMMENT ON COLUMN mission_quiz_questions.question_id IS '問題ID';
COMMENT ON COLUMN mission_quiz_questions.question_order IS '問題の順序（1-3）';
COMMENT ON COLUMN mission_quiz_questions.created_at IS '作成日時(UTC)';

-- クイズセッションテーブル
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) NOT NULL ON DELETE CASCADE,
    total_questions INTEGER NOT NULL DEFAULT 3,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE quiz_sessions IS 'クイズセッション';
COMMENT ON COLUMN quiz_sessions.id IS 'セッションID';
COMMENT ON COLUMN quiz_sessions.user_id IS 'ユーザーID';
COMMENT ON COLUMN quiz_sessions.mission_id IS 'ミッションID';
COMMENT ON COLUMN quiz_sessions.total_questions IS '総問題数';
COMMENT ON COLUMN quiz_sessions.correct_answers IS '正解数';
COMMENT ON COLUMN quiz_sessions.completed_at IS '完了日時(UTC)';
COMMENT ON COLUMN quiz_sessions.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN quiz_sessions.updated_at IS '更新日時(UTC)';

-- クイズ回答テーブル
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    user_answer INTEGER NOT NULL CHECK (user_answer >= 1 AND user_answer <= 4),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE quiz_answers IS 'クイズ回答';
COMMENT ON COLUMN quiz_answers.id IS '回答ID';
COMMENT ON COLUMN quiz_answers.session_id IS 'セッションID';
COMMENT ON COLUMN quiz_answers.question_id IS '問題ID';
COMMENT ON COLUMN quiz_answers.user_answer IS 'ユーザーの回答 (1-4)';
COMMENT ON COLUMN quiz_answers.is_correct IS '正解フラグ';
COMMENT ON COLUMN quiz_answers.answered_at IS '回答日時(UTC)';

-- インデックス作成
CREATE INDEX idx_quiz_questions_category_id ON quiz_questions(category_id);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_mission_quiz_questions_mission_id ON mission_quiz_questions(mission_id);
CREATE INDEX idx_mission_quiz_questions_question_id ON mission_quiz_questions(question_id);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_mission_id ON quiz_sessions(mission_id);
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);
CREATE INDEX idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);

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

-- mission_quiz_questions: 全ユーザー読み取り可能
ALTER TABLE mission_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read mission quiz questions"
  ON mission_quiz_questions FOR SELECT
  USING (true);

-- quiz_sessions: ユーザーは自分のセッションのみ読み取り・作成・更新可能
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own quiz sessions"
  ON quiz_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- quiz_answers: ユーザーは自分の回答のみ読み取り・作成可能
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own quiz answers"
  ON quiz_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE quiz_sessions.id = quiz_answers.session_id 
      AND quiz_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_sessions 
      WHERE quiz_sessions.id = quiz_answers.session_id 
      AND quiz_sessions.user_id = auth.uid()
    )
  );

-- mission_artifactsテーブルのartifact_type制約にQUIZタイプを追加
ALTER TABLE mission_artifacts 
DROP CONSTRAINT IF EXISTS check_artifact_type;

ALTER TABLE mission_artifacts 
ADD CONSTRAINT check_artifact_type 
CHECK (artifact_type IN ('LINK', 'TEXT', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'REFERRAL', 'POSTING', 'QUIZ'));

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
      AND (text_content IS NOT NULL)
    )
  )
);
