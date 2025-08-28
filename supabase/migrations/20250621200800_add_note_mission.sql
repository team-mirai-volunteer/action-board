INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label, is_featured, is_hidden)
VALUES (
  gen_random_uuid(),
  'note でチームはやま記事にスキ♡をつけよう',
  '/img/mission_fallback.svg',
  'チームはやま関連のnote記事を見つけて「スキ」で応援しましょう！<br><br><a href="https://note.com/search?q=チームはやま" target="_blank" rel="noopener noreferrer">「チームはやま」で検索</a>',
  1,
  NULL,
  'LINK',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/note_mission.png',
  'スキを押した記事のURL',
  false,
  false)
