INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label, is_featured, is_hidden)
VALUES (
  gen_random_uuid(),
  'X でチームはやま投稿に♡をつけよう',
  '/img/mission_fallback.svg',
  'チームはやま関連のX投稿を見つけて「いいね」で応援しましょう！<br><br><a href="https://x.com/search?q=%23チームはやま" target="_blank" rel="noopener noreferrer">「#チームはやま」で検索</a>',
  1,
  NULL,
  'LINK',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/x_like_mission.png',
  '一番応援したい投稿のURL',
  false,
  false)
