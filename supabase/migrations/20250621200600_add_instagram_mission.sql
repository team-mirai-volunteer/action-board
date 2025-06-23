INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label, is_featured, is_hidden)
VALUES (
  gen_random_uuid(),
  'Instagram でチームみらい投稿に♡をつけよう',
  '/img/mission_fallback.svg',
  'チームみらい関連のInstagram投稿を見つけて「いいね」で応援しましょう！<br><br><a href="https://www.instagram.com/explore/tags/チームみらい/" target="_blank" rel="noopener noreferrer">「#チームみらい」で検索</a>',
  1,
  NULL,
  'LINK',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/instagram_mission.png',
  '一番応援したくなった投稿のURL',
  false,
  false)
