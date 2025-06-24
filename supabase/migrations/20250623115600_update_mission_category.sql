-- mission-categoryを一度削除。
TRUNCATE mission_category_link, mission_category;

-- 正のカゴリ定義でINSRT。
insert into mission_category (id, category_title, sort_no, category_kbn)
values  
('0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 'チームみらいのことを知ろう', 100, 'DEFAULT'),
('8b36a669-3457-0b67-308b-b4b8b0a3356d', 'チームみらいをフォローしよう', 200, 'DEFAULT'),
('e8e9652f-bd9e-e726-918e-6ef914432f85', 'コミュニティに参加しよう', 300, 'DEFAULT'),
('504a2520-23e3-e49b-e3f8-9e97981a1d03', 'いいねで応援しよう', 400, 'DEFAULT'),
('07f654ee-d1da-328b-2443-fefa3c8d3a47', '発信・拡散しよう', 500, 'DEFAULT'),
('b2109f3b-2389-54e0-0cb9-2dcb4e421994', '地域で活動しよう', 600, 'DEFAULT'),
('720b511c-8be3-8e0c-e2ae-d95be1613281', 'クイズで学ぼう', 700, 'DEFAULT'),
('19bb0960-86af-4162-2351-530f664ac5b5', '政策を改善しよう', 800, 'DEFAULT'),
('373fe78b-9e63-96f7-40af-650120a599f1', 'YouTubeで応援しよう', 900, 'DEFAULT'),
('91a10bef-fab0-1a99-c8d5-4353cd39c402', 'Tiktokで応援しよう', 1000, 'DEFAULT'),
('089ed58c-9bbc-fb5d-8b51-e608906a965c', 'Xで応援しよう', 1100, 'DEFAULT'),
('6d4a5924-5411-277c-9c7d-911df2b717a1', 'noteで応援しよう', 1200, 'DEFAULT'),
('cb1da45e-740d-5ad9-55e8-40cb5c8446e1', '作って応援しよう', 1300, 'DEFAULT');

-- ミッションカテゴリ紐付テーブルへのデータ投入
-- missionsの一部のデータ生成時にuuidを随時採番しているため、タイトルからuuidを取得し登録
-- uuidが取得できなかった場合、FK違反を意図的に起こし気が付ける仕組みを設けている（coalesce）
insert into mission_category_link (mission_id, category_id, sort_no) values
-- 1. チームみらいのことを知ろう
--   (coalesce((select id from missions where title = 'チームみらいのホームページを見てみよう'), '00000000-0000-0000-0000-000000000000'), '0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 100),
--   (coalesce((select id from missions where title = 'チームみらいクイズ'), '00000000-0000-0000-0000-000000000000'), '0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 200),
  (coalesce((select id from missions where title = 'YouTube動画を視聴しよう'), '00000000-0000-0000-0000-000000000000'), '0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 300),
--   (colesce((select id from missions where title = 'いどばた政策サイトでAIとチャットしよう'), '00000000-0000-0000-0000-000000000000'), '0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 400),
--   (coalesce((select id from missions where title = 'チームみらいのマニフェスト(要約版)をみてみよう！'), '00000000-0000-0000-0000-000000000000'), '0cc2f4f9-ab0a-480c-c1e2-442513421dfc', 500),

-- 2. チームみらいをフォローしよう
  (coalesce((select id from missions where title = '公式LINEアカウントと友達になろう'), '00000000-0000-0000-0000-000000000000'), '8b36a669-3457-0b67-308b-b4b8b0a3356d', 100),
  (coalesce((select id from missions where title = '公式YouTubeチャンネルを登録しよう'), '00000000-0000-0000-0000-000000000000'), '8b36a669-3457-0b67-308b-b4b8b0a3356d', 200),
  (coalesce((select id from missions where title = 'チームみらいの公式Xをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '8b36a669-3457-0b67-308b-b4b8b0a3356d', 300),
--   (coalesce((select id from missions where title = '公式Tiktokをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '8b36a669-3457-0b67-308b-b4b8b0a3356d', 400),
  (coalesce((select id from missions where title = '公式noteをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '8b36a669-3457-0b67-308b-b4b8b0a3356d', 500),

-- 3. コミュニティに参加しよう
  (coalesce((select id from missions where title = 'サポーターSlackに入ろう'), '00000000-0000-0000-0000-000000000000'), 'e8e9652f-bd9e-e726-918e-6ef914432f85', 100),
  (coalesce((select id from missions where title = '都道府県別LINEオープンチャットに入ろう'), '00000000-0000-0000-0000-000000000000'), 'e8e9652f-bd9e-e726-918e-6ef914432f85', 200),
  (coalesce((select id from missions where title = 'イベントに参加しよう'), '00000000-0000-0000-0000-000000000000'), 'e8e9652f-bd9e-e726-918e-6ef914432f85', 300),
  (coalesce((select id from missions where title = 'イベント運営を手伝おう'), '00000000-0000-0000-0000-000000000000'), 'e8e9652f-bd9e-e726-918e-6ef914432f85', 400),

-- 4. いいねで応援しよう
--   (coalesce((select id from missions where title = 'YouTubeでチームみらい動画に高評価をつけよう'), '00000000-0000-0000-0000-000000000000'), '504a2520-23e3-e49b-e3f8-9e97981a1d03', 100),
--   (coalesce((select id from missions where title = 'Tiktokでチームみらい動画に♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '504a2520-23e3-e49b-e3f8-9e97981a1d03', 200),
--   (coalesce((select id from missions where title = 'Xでチームみらい投稿に♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '504a2520-23e3-e49b-e3f8-9e97981a1d03', 300),
--   (coalesce((select id from missions where title = 'noteでチームみらい記事にスキ♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '504a2520-23e3-e49b-e3f8-9e97981a1d03', 400),
--   (coalesce((select id from missions where title = 'Instagramでチームみらい投稿に♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '504a2520-23e3-e49b-e3f8-9e97981a1d03', 500),

-- 5. 発信・拡散しよう
--   (coalesce((select id from missions where title = 'アクションボードをSNSでシェアしよう'), '00000000-0000-0000-0000-000000000000'), '07f654ee-d1da-328b-2443-fefa3c8d3a47', 100),
  (coalesce((select id from missions where title = 'Xでチームみらいの投稿をリポストしよう'), '00000000-0000-0000-0000-000000000000'), '07f654ee-d1da-328b-2443-fefa3c8d3a47', 200),
  (coalesce((select id from missions where title = 'Xでチームみらいに関する投稿をしよう'), '00000000-0000-0000-0000-000000000000'), '07f654ee-d1da-328b-2443-fefa3c8d3a47', 300),
  (coalesce((select id from missions where title = 'チームみらいの仲間を増やそう'), '00000000-0000-0000-0000-000000000000'), '07f654ee-d1da-328b-2443-fefa3c8d3a47', 400),
  (coalesce((select id from missions where title = 'マニフェストの感想をSNSでシェアしよう'), '00000000-0000-0000-0000-000000000000'), '07f654ee-d1da-328b-2443-fefa3c8d3a47', 500),

-- 6. 地域で活動しよう
  (coalesce((select id from missions where title = 'チームみらいの機関誌をポスティングしよう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 100),
  (coalesce((select id from missions where title = '街頭演説に参加しよう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 200),
--   (coalesce((select id from missions where title = '政党ポスターを貼ろう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 300),
--   (coalesce((select id from missions where title = '選挙区ポスターを貼ろう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 400),
  (coalesce((select id from missions where title = 'イベントに参加しよう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 500),
  (coalesce((select id from missions where title = 'イベント運営を手伝おう'), '00000000-0000-0000-0000-000000000000'), 'b2109f3b-2389-54e0-0cb9-2dcb4e421994', 600),

-- 7. クイズで学ぼう
--   (coalesce((select id from missions where title = 'チームみらいクイズ'), '00000000-0000-0000-0000-000000000000'), '720b511c-8be3-8e0c-e2ae-d95be1613281', 100),
--   (coalesce((select id from missions where title = '公職選挙法クイズ'), '00000000-0000-0000-0000-000000000000'), '720b511c-8be3-8e0c-e2ae-d95be1613281', 200),
--   (coalesce((select id from missions where title = 'チームみらい政策クイズ'), '00000000-0000-0000-0000-000000000000'), '720b511c-8be3-8e0c-e2ae-d95be1613281', 300),

-- 8. 政策を改善しよう
--   (coalesce((select id from missions where title = 'いどばた政策サイトでAIとチャットしよう'), '00000000-0000-0000-0000-000000000000'), '19bb0960-86af-4162-2351-530f664ac5b5', 100),
--   (coalesce((select id from missions where title = 'チームみらいのマニフェスト(要約版)をみてみよう！'), '00000000-0000-0000-0000-000000000000'), '19bb0960-86af-4162-2351-530f664ac5b5', 200),
--   (coalesce((select id from missions where title = 'チームみらい政策クイズ'), '00000000-0000-0000-0000-000000000000'), '19bb0960-86af-4162-2351-530f664ac5b5', 300),
  (coalesce((select id from missions where title = 'いどばた政策サイトからマニフェストを提案しよう'), '00000000-0000-0000-0000-000000000000'), '19bb0960-86af-4162-2351-530f664ac5b5', 400),
  (coalesce((select id from missions where title = 'マニフェストの感想をSNSでシェアしよう'), '00000000-0000-0000-0000-000000000000'), '19bb0960-86af-4162-2351-530f664ac5b5', 500),

-- 9. YouTubeで応援しよう
  (coalesce((select id from missions where title = '公式YouTubeチャンネルを登録しよう'), '00000000-0000-0000-0000-000000000000'), '373fe78b-9e63-96f7-40af-650120a599f1', 100),
  (coalesce((select id from missions where title = 'YouTube動画を視聴しよう'), '00000000-0000-0000-0000-000000000000'), '373fe78b-9e63-96f7-40af-650120a599f1', 200),
--   (coalesce((select id from missions where title = 'YouTubeでチームみらい動画に高評価をつけよう'), '00000000-0000-0000-0000-000000000000'), '373fe78b-9e63-96f7-40af-650120a599f1', 300),
  (coalesce((select id from missions where title = 'YouTube動画を切り抜こう'), '00000000-0000-0000-0000-000000000000'), '373fe78b-9e63-96f7-40af-650120a599f1', 400),

-- 10. Tiktokで応援しよう
--   (coalesce((select id from missions where title = '公式Tiktokをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '91a10bef-fab0-1a99-c8d5-4353cd39c402', 100),
--   (coalesce((select id from missions where title = 'Tiktokでチームみらい動画に♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '91a10bef-fab0-1a99-c8d5-4353cd39c402', 200),

-- 11. Xで応援しよう
  (coalesce((select id from missions where title = 'チームみらいの公式Xをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '089ed58c-9bbc-fb5d-8b51-e608906a965c', 100),
  (coalesce((select id from missions where title = 'Xでチームみらいの投稿をリポストしよう'), '00000000-0000-0000-0000-000000000000'), '089ed58c-9bbc-fb5d-8b51-e608906a965c', 200),
  (coalesce((select id from missions where title = 'Xでチームみらいに関する投稿をしよう'), '00000000-0000-0000-0000-000000000000'), '089ed58c-9bbc-fb5d-8b51-e608906a965c', 300),
--   (coalesce((select id from missions where title = 'Xでチームみらい投稿に♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '089ed58c-9bbc-fb5d-8b51-e608906a965c', 400),

-- 12. noteで応援しよう
  (coalesce((select id from missions where title = '公式noteをフォローしよう'), '00000000-0000-0000-0000-000000000000'), '6d4a5924-5411-277c-9c7d-911df2b717a1', 100),
--   (coalesce((select id from missions where title = 'noteでチームみらい記事にスキ♡をつけよう'), '00000000-0000-0000-0000-000000000000'), '6d4a5924-5411-277c-9c7d-911df2b717a1', 200),

-- 13. 作って応援しよう
  (coalesce((select id from missions where title = 'YouTube動画を切り抜こう'), '00000000-0000-0000-0000-000000000000'), 'cb1da45e-740d-5ad9-55e8-40cb5c8446e1', 100),
  (coalesce((select id from missions where title = 'いどばた政策サイトからマニフェストを提案しよう'), '00000000-0000-0000-0000-000000000000'), 'cb1da45e-740d-5ad9-55e8-40cb5c8446e1', 200),
  (coalesce((select id from missions where title = '開発者向け: Githubでプルリクエストを出そう'), '00000000-0000-0000-0000-000000000000'), 'cb1da45e-740d-5ad9-55e8-40cb5c8446e1', 300);