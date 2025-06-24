-- クイズカテゴリの整理とミッションの再紐付け

-- 1. 既存のクイズカテゴリに紐づくmission_category_linkを削除
DELETE FROM mission_category_link
WHERE category_id = 'b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f';

-- 2. mission_categoryから古いクイズカテゴリを削除
DELETE FROM mission_category
WHERE id = 'b8f24e3d-1a9b-4c5d-8e2f-9a3b4c5d6e7f';

-- 3. クイズ系のミッションを新しいカテゴリに紐付け
-- カテゴリID '720b511c-8be3-8e0c-e2ae-d95be1613281' に紐付ける
-- DO $$
-- DECLARE
--     new_quiz_category_id UUID := '720b511c-8be3-8e0c-e2ae-d95be1613281';
-- BEGIN
--     -- チームみらいクイズ（初級）
--     INSERT INTO mission_category_link (mission_id, category_id, sort_no)
--     SELECT
--         id,
--         new_quiz_category_id,
--         1
--     FROM missions
--     WHERE slug = 'quiz-teammirai-beginner'
--         AND required_artifact_type = 'QUIZ'
--     ON CONFLICT (mission_id, category_id) DO NOTHING;
    
--     -- 政策・マニフェストクイズ（中級）
--     INSERT INTO mission_category_link (mission_id, category_id, sort_no)
--     SELECT
--         id,
--         new_quiz_category_id,
--         2
--     FROM missions
--     WHERE slug = 'quiz-policy-intermediate'
--         AND required_artifact_type = 'QUIZ'
--     ON CONFLICT (mission_id, category_id) DO NOTHING;
    
--     -- 政策・マニフェストクイズ（中級2）
--     INSERT INTO mission_category_link (mission_id, category_id, sort_no)
--     SELECT
--         id,
--         new_quiz_category_id,
--         3
--     FROM missions
--     WHERE slug = 'quiz-policy-intermediate-2'
--         AND required_artifact_type = 'QUIZ'
--     ON CONFLICT (mission_id, category_id) DO NOTHING;
    
--     -- 将来追加されるクイズミッションも自動的に紐付ける
--     -- （既に紐付けられていないクイズタイプのミッションがあれば）
--     INSERT INTO mission_category_link (mission_id, category_id, sort_no)
--     SELECT 
--         m.id,
--         new_quiz_category_id,
--         (SELECT COALESCE(MAX(sort_no), 0) + 1 FROM mission_category_link WHERE category_id = new_quiz_category_id)
--     FROM missions m
--     WHERE m.required_artifact_type = 'QUIZ'
--         AND m.is_hidden = false
--         AND NOT EXISTS (
--             SELECT 1 
--             FROM mission_category_link mcl 
--             WHERE mcl.mission_id = m.id 
--                 AND mcl.category_id = new_quiz_category_id
--         )
--     ORDER BY
--         CASE
--             WHEN m.slug LIKE '%beginner%' THEN 1
--             WHEN m.slug LIKE '%intermediate%' THEN 2
--             WHEN m.slug LIKE '%advanced%' THEN 3
--             ELSE 4
--         END,
--         m.slug;
-- END $$;