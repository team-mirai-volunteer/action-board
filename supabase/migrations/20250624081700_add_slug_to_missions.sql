-- Add slug column to missions table
ALTER TABLE missions ADD COLUMN slug TEXT;

-- Add unique constraint to slug
ALTER TABLE missions ADD CONSTRAINT missions_slug_unique UNIQUE (slug);

-- Update existing missions with slugs based on their titles
UPDATE missions SET slug = CASE
  -- YouTube関連
  WHEN title = 'YouTube動画を切り抜こう' THEN 'youtube-clip'
  WHEN title = 'YouTube動画を視聴しよう' THEN 'youtube-watch'
  WHEN title = '公式YouTubeチャンネルを登録しよう' THEN 'youtube-subscribe'
  
  -- X (Twitter)関連
  WHEN title = '安野たかひろの公式Xをフォローしよう' THEN 'follow-anno-x'
  WHEN title = 'チームはやまの公式Xをフォローしよう' THEN 'follow-teammirai-x'
  WHEN title = 'Xでチームはやまに関する投稿をしよう' THEN 'x-post'
  WHEN title = 'Xでチームはやまの投稿をリポストしよう' THEN 'x-repost'
  WHEN title = 'X でチームはやま投稿に♡をつけよう' THEN 'x-like'
  
  -- SNS関連
  WHEN title = 'Instagram でチームはやま投稿に♡をつけよう' THEN 'instagram-like'
  WHEN title = 'note でチームはやま記事にスキ♡をつけよう' THEN 'note-like'
  WHEN title = '公式noteをフォローしよう' THEN 'follow-note'
  WHEN title = 'マニフェストの感想をSNSでシェアしよう' THEN 'share-manifest-sns'
  
  -- コミュニティ参加
  WHEN title = 'サポーターSlackに入ろう' THEN 'join-slack'
  WHEN title = '都道府県別LINEオープンチャットに入ろう' THEN 'join-prefecture-openchat'
  WHEN title = 'サポーター目的別LINEオープンチャットに入ろう' THEN 'join-purpose-openchat'
  WHEN title = '公式LINEアカウントと友達になろう' THEN 'add-line-friend'
  
  -- いどばた政策関連
  WHEN title = 'いどばた政策サイトからマニフェストを提案しよう' THEN 'propose-manifest-idobata'
  WHEN title = 'いどばた政策サイトでAIとチャットしよう' THEN 'chat-idobata-ai'
  
  -- イベント・活動関連
  WHEN title = 'イベントに参加しよう' THEN 'join-event'
  WHEN title = 'イベント運営を手伝おう' THEN 'help-event-operation'
  WHEN title = '街頭演説に参加しよう' THEN 'join-street-speech'
  WHEN title = 'チームはやまの機関誌をポスティングしよう' THEN 'posting-magazine'
  WHEN title = 'チームはやまの政党ポスターを貼ろう' THEN 'put-up-poster'
  
  -- 開発・技術関連
  WHEN title = '開発者向け: GitHubでプルリクエストを出そう' THEN 'github-pull-request'
  
  -- クイズ関連
  WHEN title = 'チームはやまクイズ（初級）に挑戦しよう' THEN 'quiz-teammirai-beginner'
  WHEN title = '政策・マニフェストクイズ（中級）に挑戦しよう' THEN 'quiz-policy-intermediate'
  WHEN title = '政策・マニフェストクイズ（中級2）に挑戦しよう' THEN 'quiz-policy-intermediate-2'
  
  -- その他
  WHEN title = 'チームはやまの仲間を増やそう' THEN 'referral'
  
  ELSE NULL
END
WHERE slug IS NULL;

UPDATE missions
SET slug = 'dummy-slug-' || id
WHERE slug IS NULL;

-- Make slug column NOT NULL after updating all existing records
ALTER TABLE missions ALTER COLUMN slug SET NOT NULL;

-- Create index on slug for better query performance
CREATE INDEX idx_missions_slug ON missions(slug);