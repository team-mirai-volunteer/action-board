-- ポスティングミッションのOGP画像URLを修正

UPDATE missions 
SET ogp_image_url = 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//15_posting.png'
WHERE title = 'チームはやまの機関誌をポスティングしよう'
  AND required_artifact_type = 'POSTING';
