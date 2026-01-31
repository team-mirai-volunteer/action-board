-- mission_category_view に slug を追加
DROP VIEW IF EXISTS mission_category_view;

CREATE OR REPLACE VIEW mission_category_view AS
SELECT
  c.id                   AS category_id,
  c.category_title       AS category_title,
  c.category_kbn         AS category_kbn,
  c.sort_no              AS category_sort_no,
  m.id                   AS mission_id,
  m.slug                 AS slug,
  m.title                AS title,
  m.icon_url             AS icon_url,
  m.difficulty           AS difficulty,
  m.content              AS content,
  m.created_at           AS created_at,
  m.artifact_label       AS artifact_label,
  m.max_achievement_count AS max_achievement_count,
  m.event_date           AS event_date,
  m.is_featured          AS is_featured,
  m.updated_at           AS updated_at,
  m.is_hidden            AS is_hidden,
  m.ogp_image_url        AS ogp_image_url,
  m.required_artifact_type AS required_artifact_type,
  l.sort_no              AS link_sort_no
FROM
  mission_category c
  INNER JOIN mission_category_link l ON c.id = l.category_id
  INNER JOIN missions m ON l.mission_id = m.id
WHERE
  c.del_flg = false
  AND l.del_flg = false
  AND m.is_hidden = false;
