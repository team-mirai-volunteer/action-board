-- クイズ用のミッションカテゴリを追加

-- クイズカテゴリをmission_categoryテーブルに追加
INSERT INTO mission_category (id, category_title, sort_no, category_kbn)
VALUES
  ('b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f', 'クイズに挑戦する', 6, 'QUIZ');

-- クイズミッションとカテゴリの紐付けを追加
-- クイズミッションのタイトルから動的にIDを取得して紐付け
INSERT INTO mission_category_link (mission_id, category_id, sort_no) 
SELECT 
    m.id,
    'b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f' AS category_id,
    ROW_NUMBER() OVER (ORDER BY 
        CASE 
            WHEN m.title LIKE '%初級%' THEN 1
            WHEN m.title LIKE '%中級%' THEN 2
            WHEN m.title LIKE '%上級%' THEN 3
            ELSE 4
        END,
        m.title
    )::INTEGER AS sort_no
FROM missions m
WHERE m.required_artifact_type = 'QUIZ'
    AND m.is_hidden = false
    AND NOT EXISTS (
        SELECT 1 
        FROM mission_category_link mcl 
        WHERE mcl.mission_id = m.id 
            AND mcl.category_id = 'b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f'
    );

-- クイズカテゴリ用のミッションをより詳細に紐付け（タイトルベース）
-- 既存のクイズミッションが特定できる場合
DO $$
DECLARE
    quiz_category_id UUID := 'b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f';
BEGIN
    -- 既存のクイズミッションを削除して再挿入
    DELETE FROM mission_category_link 
    WHERE category_id = quiz_category_id;
    
    -- 政策・マニフェストクイズ
    INSERT INTO mission_category_link (mission_id, category_id, sort_no)
    SELECT 
        id, 
        quiz_category_id,
        1
    FROM missions 
    WHERE title = '政策・マニフェストクイズ（中級）に挑戦しよう'
        AND required_artifact_type = 'QUIZ';
    
    INSERT INTO mission_category_link (mission_id, category_id, sort_no)
    SELECT 
        id, 
        quiz_category_id,
        2
    FROM missions 
    WHERE title = '政策・マニフェストクイズ（中級2）に挑戦しよう'
        AND required_artifact_type = 'QUIZ';
    
    -- チームみらいクイズ
    INSERT INTO mission_category_link (mission_id, category_id, sort_no)
    SELECT 
        id, 
        quiz_category_id,
        3
    FROM missions 
    WHERE title = 'チームみらいクイズ（初級）に挑戦しよう'
        AND required_artifact_type = 'QUIZ';
END $$;