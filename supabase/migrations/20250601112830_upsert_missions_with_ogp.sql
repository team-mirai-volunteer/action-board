-- 既存ミッションデータのupsertおよび新しいミッションの追加（ogp_image_url、artifact_label含む）

-- missionsテーブルにartifact_labelカラムを追加
ALTER TABLE missions
ADD COLUMN artifact_label VARCHAR(100);

COMMENT ON COLUMN missions.artifact_label IS '成果物の入力欄のラベル表示用テキスト';

-- 全ミッションのupsert（既存ミッション更新 + 新しいミッション追加）
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  -- 既存のミッションデータ（初期データから取得し、更新内容を反映）
  ('05814416-9cd8-4582-a940-ced9a832efee', 'Youtube動画を切り抜こう', '/img/mission_fallback.svg', '推し候補の魅力を、もっと多くの人に届けよう。<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw">チームみらいの公式Youtube動画</a>や、チームみらいの候補者が出演している動画から、心に響いたワンシーンを切り抜いてショート動画にしてみよう。<br />SNSでの拡散や、仲間との共有も大歓迎！あなたの編集が、新しい支持を生み出すかもしれません。', 3, NULL, 'LINK', NULL, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//6_clip_youtube_video.png', 'YouTubeショートのURL'),
  ('41dedf9a-2290-4609-bb73-5469ee8dd909', 'いどばた政策サイトからマニフェストを提案しよう', '/img/mission_fallback.svg', 'AIと一緒に、あなたの意見を政策にしよう。<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>は、AIとチャットしながら政策に意見を出せる新しい仕組みです。気になるテーマに質問したり、自分の考えを提案としてまとめると、実際に「チームみらい」へ提出されます。提案にはURLが付き、どう検討されたかも追跡できます。', 3, NULL, 'LINK', NULL, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//9_propose_manifest_policy.png', '提案したページのURL'),
  ('56c03661-8243-42c6-bf81-9dba56c5abfe', 'マニフェストの感想をSNSでシェアしよう', '/img/mission_fallback.svg', '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>でマニフェストを読み、気になった政策や共感した提案について、あなたの言葉でSNSに感想を発信してみよう。難しく考えなくてOK。「ここがいいな」「もっとこうしてほしい」など、素直な声が広がることで、政治はもっと身近になります。', 2, NULL, 'LINK', NULL, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//10_share_manifest_feedback.png', 'シェアした投稿のURL'),
  ('2c5f7173-48be-4989-9d1b-c749fd56ae44', 'チームみらいの公式Xをフォローしよう', '/img/mission_fallback.svg', '最新の政策情報やイベント情報、サポーターの動きなどをチェックするなら、まずは<a href="https://x.com/team_mirai_jp">公式X（旧Twitter）</a>をフォロー！参加者の投稿や注目の提案も流れてきます。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//11_follow_teammirai_x.png', 'あなたのXアカウント名'),
  ('0f4f16e5-35eb-4756-a966-607895a61b0e', '安野たかひろの公式Xをフォローしよう', '/img/mission_fallback.svg', '新党チームみらい党首・<a href="https://x.com/takahiroanno">安野たかひろの公式X（旧Twitter）</a>をフォローして発信をチェック！政策への想いや、未来を描く視点が日々の投稿から伝わってきます。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//5_follow_anno_x.png', 'あなたのXアカウント名'),
  ('9071a1eb-e272-43be-9c6b-e08b258a41c3', '公式Youtubeチャンネルを登録しよう', '/img/mission_fallback.svg', 'AIや政治の話をもっとわかりやすく。<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw">チームみらいの公式YouTubeチャンネル</a>を登録して、政策解説、候補者のトーク、生配信アーカイブなど、多彩な動画をチェックしよう！難しそうな話題もわかりやすく解説しています。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//8_subscribe_official_youtube.png', 'あなたのYouTubeアカウント名'),
  ('e7a03d8b-ef29-406f-b2fb-065285855997', '公式LINEアカウントと友達になろう', '/img/mission_fallback.svg', '<a href="https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204">チームみらいのLINEアカウント</a>を友達に追加して、最新情報をLINEでサクッと受け取ろう。イベント情報や動画の更新もLINEでお届けします。登録しておくと見逃しがありません！', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//7_add_official_line.png', 'あなたのLINEアカウント名'),
  ('1776d950-34f4-44e6-a5c5-2e40fa9038a3', '公式noteをフォローしよう', '/img/mission_fallback.svg', '<a href="https://note.com/annotakahiro24">公式note</a>をフォローして、チームみらいの活動の裏側や候補者の考え、政策に込めた想いをもっと深く知ろう！政治活動ストーリーや解説記事など、SNSでは語りきれない情報が満載です。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//1_follow_note.png', 'あなたのnoteアカウント名'),
  ('fd9da44a-d5ba-4bbf-a1c0-98a0142ee029', '都道府県別LINEオープンチャットに入ろう', '/img/mission_fallback.svg', '<a href="https://silent-tent-c92.notion.site/1f9f6f56bae180d19ebcf176d8338ba3">チームみらいの都道府県別LINEオープンチャット</a>に参加してあなたの地域で、政治や政策について気軽に話せる仲間を見つけよう！ イベント情報の共有や、地域ならではの課題を話し合える場として活用されています。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//2_join_prefecture_openchat.png', '参加したオープンチャット名とあなたのLINEアカウント名'),
  ('6b6190c7-909d-4188-a2dc-039a68bbbe64', 'サポーター目的別LINEオープンチャットに入ろう', '/img/mission_fallback.svg', 'あなたの得意や関心にあわせて、チームみらいの<a href="https://silent-tent-c92.notion.site/1f9f6f56bae1802aa4e9ff90f1308062">目的別LINEオープンチャット</a>に参加しよう！ ポスター掲示、SNS発信、マニフェスト改善、動画の切り抜きなど、テーマごとのチャットで、仲間とつながって活動を深められます。', 1, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//3_join_purpose_openchat.png', '参加したオープンチャット名とあなたのLINEアカウント名'),
  ('f95c8971-af0d-4192-bf51-986781fcbb0e', 'イベントに参加しよう', '/img/mission_fallback.svg', 'チームみらいでは、オンライン・オフライン両方で、サポーター向けのイベントを<a href="https://www.notion.so/1f8f6f56bae180fd96e2f809bf1ca0bf?v=1f8f6f56bae181239689000c7e1d858e&source=copy_link#1fef6f56bae1800ab385f544ea22062a">多数開催中</a>！ 全国各地の交流会、政策トーク、新メンバー説明会など、初めての方でも安心して参加できます。仲間とつながり、リアルな場や画面越しで未来を語ろう！<br />成果物として、イベント内で公開されるイベントコードを入力ください。', 3, NULL, 'TEXT', 1, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//4_join_event.png', 'イベントコード')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  icon_url = EXCLUDED.icon_url,
  content = EXCLUDED.content,
  difficulty = EXCLUDED.difficulty,
  event_date = EXCLUDED.event_date,
  required_artifact_type = EXCLUDED.required_artifact_type,
  max_achievement_count = EXCLUDED.max_achievement_count,
  ogp_image_url = EXCLUDED.ogp_image_url,
  artifact_label = EXCLUDED.artifact_label;