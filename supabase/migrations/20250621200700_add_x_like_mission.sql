INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label, is_featured, is_hidden)
VALUES (
  gen_random_uuid(),
  'X でチームみらい投稿に♡をつけよう',
  '/img/mission_fallback.svg',
  'チームみらい関連のX投稿を見つけて「いいね」で応援しましょう。<br><br>&lt;a href="https://x.com/search?q=%23チームみらい" target="_blank" rel="noopener noreferrer"&gt;「#チームみらい」で検索&lt;/a&gt;<br><br>気に入った投稿に「いいね」をつけて、その投稿のURLを貼り付けてください。',
  1,
  NULL,
  'LINK',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/x_like_mission.png',
  '一番応援したい投稿のURL',
  false,
  false)
