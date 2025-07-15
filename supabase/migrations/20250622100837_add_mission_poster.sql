-- ミッション「チームみらいの政党ポスターを貼ろう」を追加
INSERT INTO missions (
  id,
  title,
  icon_url,
  content,
  difficulty,
  event_date,
  required_artifact_type,
  max_achievement_count,
  ogp_image_url,
  artifact_label,
  is_featured,
  is_hidden
)
VALUES (
  gen_random_uuid(),
  'チームみらいの政党ポスターを貼ろう',
  '/img/mission_fallback.svg',
  'チームみらいの政党ポスターを貼って、地域の人々に政策を広めよう！<br><br>詳しいポスター貼りの方法や注意点については、こちらのページをご確認ください：<br><a href="https://team-mirai.notion.site/222f6f56bae1802aaed2c98f36e2c46a" target="_blank">政治ポスターを貼る</a>',
  4,
  NULL,
  'TEXT',
  NULL,
  '',
  'ポスターを貼った場所の郵便番号',
  FALSE,
  FALSE
)
;
