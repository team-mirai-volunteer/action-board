-- 既存ミッションデータの更新および新しいミッションの追加

-- 既存ミッションの更新
UPDATE missions SET 
  title = 'Youtube動画を切り抜こう',
  content = 'チームはやまのYoutube動画を切り抜いてYoutubeショートにアップロードしてください。成果物として、そのURLを入力してください。'
WHERE id = '05814416-9cd8-4582-a940-ced9a832efee';

UPDATE missions SET 
  content = '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>サイトにアクセスし、マニフェストについて提案してみてください。成果物として、そのURLを入力してください。'
WHERE id = '41dedf9a-2290-4609-bb73-5469ee8dd909';

UPDATE missions SET 
  content = '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>にアクセスし、マニフェストを読んだ感想をSNSでシェアしてください。成果物としてシェアしたURLを教えてください。'
WHERE id = '56c03661-8243-42c6-bf81-9dba56c5abfe';

UPDATE missions SET 
  content = '<a href="https://x.com/team_mirai_jp">チームはやま</a>の公式Xをフォローしてください。成果物として、あなたのXのアカウント名を入力してください。',
  required_artifact_type = 'TEXT',
  max_achievement_count = 1
WHERE id = '2c5f7173-48be-4989-9d1b-c749fd56ae44';

UPDATE missions SET 
  content = '<a href="https://x.com/takahiroanno">安野たかひろ</a>の公式Xをフォローしてください。成果物として、あなたのXのアカウント名を入力してください。',
  required_artifact_type = 'TEXT',
  max_achievement_count = 1
WHERE id = '0f4f16e5-35eb-4756-a966-607895a61b0e';

UPDATE missions SET 
  content = '<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw">チームはやまの公式Youtubeチャンネル</a>をチャンネル登録してください。成果物として、あなたのYoutubeのアカウント名を入力してください。',
  required_artifact_type = 'TEXT',
  max_achievement_count = 1
WHERE id = '9071a1eb-e272-43be-9c6b-e08b258a41c3';

UPDATE missions SET 
  title = '公式LINEアカウントと友達になろう',
  content = '<a href="https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204">チームはやまのLINEアカウント</a>を友達に追加してください。成果物として、あなたのLINEのアカウント名を入力してください。',
  required_artifact_type = 'TEXT',
  max_achievement_count = 1
WHERE id = 'e7a03d8b-ef29-406f-b2fb-065285855997';

-- 新しいミッションの追加
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('1776d950-34f4-44e6-a5c5-2e40fa9038a3', '公式noteをフォローしよう', '/img/mission_fallback_icon.png', '<a href="https://note.com/annotakahiro24">チームはやまの公式note</a>をフォローしてください。成果物として、あなたのnoteのアカウント名を入力してください。', 1, NULL, 'TEXT', 1),
  ('fd9da44a-d5ba-4bbf-a1c0-98a0142ee029', '都道府県別オープンチャットに入ろう', '/img/mission_fallback_icon.png', '<a href="https://silent-tent-c92.notion.site/1f9f6f56bae180d19ebcf176d8338ba3">チームはやまの都道府県別LINEオープンチャット</a>に参加してください。成果物として、あなたLINEのアカウント名を入力してください。', 1, NULL, 'TEXT', 1),
  ('6b6190c7-909d-4188-a2dc-039a68bbbe64', 'サポーター目的別オープンチャットに入ろう', '/img/mission_fallback_icon.png', '<a href="https://silent-tent-c92.notion.site/1f9f6f56bae1802aa4e9ff90f1308062">チームはやまのサポーター目的別LINEオープンチャット</a>に参加してください。成果物として、参加したオープンチャット名と、あなたLINEのアカウント名を入力してください。', 1, NULL, 'TEXT', 1),
  ('f95c8971-af0d-4192-bf51-986781fcbb0e', '6/1 交流会@仙台に参加しよう', '/img/mission_fallback_icon.png', '<a href="https://forms.gle/9zY5SDFpr7oLEWRv5">仙台会場で開催される安野たかひろとみなさまの交流会への参加フォーム</a>から参加してください。成果物として、参加したイベントで付与されるイベントコードを入力ください。', 1, NULL, 'TEXT', 1);