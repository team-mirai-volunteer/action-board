INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    '街頭演説に参加しよう',
    '/img/mission_fallback.svg',
    '「チームはやま」の街頭演説を一緒に盛り上げよう！あなたの声援が力になります。<br/><a href="https://team-mirai.notion.site/1fef6f56bae180fe9560d8ef50d3e44a?v=1fef6f56bae1802c8f15000c3f0195e0" target="_blank" rel="noopener noreferrer">イベントスケジュールはこちら</a>',
    1,
    NULL,
    'TEXT',
    1,
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//17_street_speech.png',
    '参加した街頭演説の場所と日付'
  )