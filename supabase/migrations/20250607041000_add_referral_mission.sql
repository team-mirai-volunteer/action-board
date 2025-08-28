-- referralミッションの追加
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url)
VALUES (
  'f570446b-b1fd-f456-fc4b-935c2b493089',
  'チームはやまの仲間を増やそう',
  '/img/mission_fallback.svg',
  'あなたの紹介で、新しい仲間がアクションボードに参加！紹介専用URLと、<a href="https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/assets//magazine_1.pdf" target="_blank" rel="noopener noreferrer">チームはやま紹介PDF（ビラ）</a>や<a href="https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/assets//contents_list.pdf" target="_blank" rel="noopener noreferrer">おすすめコンテンツ集</a>を活用して、活動の魅力を伝えよう。',
  3,
  NULL,
  'REFERRAL',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//12_referral.png')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  icon_url = EXCLUDED.icon_url,
  content = EXCLUDED.content,
  difficulty = EXCLUDED.difficulty,
  event_date = EXCLUDED.event_date,
  required_artifact_type = EXCLUDED.required_artifact_type,
  max_achievement_count = EXCLUDED.max_achievement_count,
  ogp_image_url = EXCLUDED.ogp_image_url;