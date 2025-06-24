-- クイズ関連のビューを作成

-- クイズ問題とカテゴリ情報を結合したビュー
CREATE OR REPLACE VIEW quiz_questions_with_category AS
SELECT 
    qq.*,
    qc.name AS category_name,
    qc.description AS category_description,
    qc.display_order AS category_display_order
FROM quiz_questions qq
INNER JOIN quiz_categories qc ON qq.category_id = qc.id
WHERE qq.is_active = true AND qc.is_active = true;

-- ミッションのクイズ問題とミッションリンクを取得するビュー
CREATE OR REPLACE VIEW mission_quiz_with_links AS
SELECT 
    qq.mission_id,
    qq.id AS question_id,
    qq.question_order,
    qq.category_id,
    qq.question,
    qq.option1,
    qq.option2,
    qq.option3,
    qq.option4,
    qq.correct_answer,
    qq.explanation,
    qc.name AS category_name,
    qc.description AS category_description,
    COALESCE(
        json_agg(
            json_build_object(
                'link', ml.link,
                'remark', ml.remark,
                'display_order', ml.display_order
            ) ORDER BY ml.display_order
        ) FILTER (WHERE ml.id IS NOT NULL),
        '[]'::json
    ) AS mission_links
FROM quiz_questions qq
INNER JOIN quiz_categories qc ON qq.category_id = qc.id
LEFT JOIN mission_quiz_links ml ON qq.mission_id = ml.mission_id
WHERE qq.is_active = true 
  AND qc.is_active = true
  AND qq.mission_id IS NOT NULL
GROUP BY 
    qq.mission_id,
    qq.id,
    qq.question_order,
    qq.category_id,
    qq.question,
    qq.option1,
    qq.option2,
    qq.option3,
    qq.option4,
    qq.correct_answer,
    qq.explanation,
    qc.name,
    qc.description;

-- ミッションごとのリンク一覧を取得する関数
CREATE OR REPLACE FUNCTION get_mission_links(p_mission_id UUID)
RETURNS TABLE (
    link TEXT,
    remark TEXT,
    display_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ml.link,
        ml.remark,
        ml.display_order
    FROM mission_quiz_links ml
    WHERE ml.mission_id = p_mission_id
    ORDER BY ml.display_order;
END;
$$ LANGUAGE plpgsql;

-- ミッションのクイズ問題を順番に取得する関数
CREATE OR REPLACE FUNCTION get_mission_quiz_questions(p_mission_id UUID)
RETURNS TABLE (
    question_id UUID,
    question_order INTEGER,
    category_id UUID,
    category_name VARCHAR(100),
    category_description TEXT,
    mission_links JSON,
    question TEXT,
    option1 TEXT,
    option2 TEXT,
    option3 TEXT,
    option4 TEXT,
    correct_answer INTEGER,
    explanation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mqw.question_id,
        mqw.question_order,
        mqw.category_id,
        mqw.category_name,
        mqw.category_description,
        mqw.mission_links,
        mqw.question,
        mqw.option1,
        mqw.option2,
        mqw.option3,
        mqw.option4,
        mqw.correct_answer,
        mqw.explanation
    FROM mission_quiz_with_links mqw
    WHERE mqw.mission_id = p_mission_id
    ORDER BY mqw.question_order;
END;
$$ LANGUAGE plpgsql;

-- RLS設定
-- ビューは自動的に基になるテーブルのRLSポリシーを継承するため、追加の設定は不要

COMMENT ON VIEW quiz_questions_with_category IS 'クイズ問題とカテゴリ情報を結合したビュー';
COMMENT ON VIEW mission_quiz_with_links IS 'ミッションのクイズ問題とカテゴリリンク情報を含むビュー';
COMMENT ON FUNCTION get_mission_links IS '指定されたミッションのリンク一覧を取得する関数';
COMMENT ON FUNCTION get_mission_quiz_questions IS '指定されたミッションのクイズ問題を順番に取得する関数';