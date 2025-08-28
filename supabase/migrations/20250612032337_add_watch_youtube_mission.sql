INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    'YouTube動画を視聴しよう',
    '/img/mission_fallback.svg',
    '<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw" target="_blank" rel="noopener noreferrer">チームはやまの公式Youtubeチャンネル</a>でチームはやまの活動や政策解説、候補者のトーク、生配信アーカイブを視聴しよう！政治のことをわかりやすく解説してお届けしています。日本の政治を考えるヒントがきっと見つかるはず。まずは気になる動画から、ぜひご覧ください。動画の内容が気に入ったら高評価をお願いします！',
    1,
    NULL,
    'LINK',
    NULL,
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//20_youtube_view.png',
    'あなたが視聴したYouTube動画のURL'
  )