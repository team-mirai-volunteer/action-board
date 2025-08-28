INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    'サポーターSlackに入ろう',
    '/img/mission_fallback.svg',
    '<a href="https://join.slack.com/t/team-mirai-volunteer/shared_invite/zt-36k0jx72s-EUWYKNTYTjbZhUnNjCqduA" target="_blank" rel="noopener noreferrer">チームはやまサポーターのSlack</a>に参加しよう！開発・デザイン・動画編集・記事化・オフィスワークなどなど、実際に手を動かし、サポーター作業に関わることにご興味・関心があるチームサポーターの方は、ぜひ「Slack」にご参加ください。',
    1,
    NULL,
    'TEXT',
    1,
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//16_slack_join.png',
    '登録したメールアドレス'
  )
