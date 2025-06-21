-- auth.usersテーブルにユーザーを追加（外部キー制約のため）
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, email_change, email_change_token_new, recovery_token, confirmation_token, confirmation_sent_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'authenticated', 'authenticated', 'takahiroanno@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'authenticated', 'authenticated', 'tanaka.hanako@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'authenticated', 'authenticated', 'sato.taro@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'suzuki.misaki@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'takahashi.ken@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'ito.aiko@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'yamada.jiro@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b814-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'nakamura.sakura@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b815-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'kobayashi.naoto@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b816-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'kato.miyuki@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b817-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'watanabe.yuichi@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', '6ba7b818-9dad-11d1-80b4-00c04fd430c8', 'authenticated', 'authenticated', 'matsumoto.kana@example.com', crypt('password123', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now());

-- ユーザー
INSERT INTO private_users (id, name, address_prefecture, date_of_birth, x_username, postcode)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '安野たかひろ', '東京都', '1990-12-01', 'takahiroanno', '1000001'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '田中花子', '大阪府', '1995-05-05', NULL, '5300001'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '佐藤太郎', '東京都', '1988-03-15', 'sato_taro', '1500012'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '鈴木美咲', '神奈川県', '1992-07-22', 'suzuki_misaki', '2200001'),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '高橋健一', '大阪府', '1985-11-08', 'takahashi_ken', '5600011'),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', '伊藤愛子', '愛知県', '1993-04-30', 'ito_aiko', '4600001'),
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', '山田次郎', '福岡県', '1991-09-12', 'yamada_jiro', '8100001'),
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', '中村さくら', '北海道', '1994-02-14', 'nakamura_sakura', '0600001'),
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', '小林直人', '京都府', '1987-06-05', 'kobayashi_naoto', '6020001'),
  ('6ba7b816-9dad-11d1-80b4-00c04fd430c8', '加藤みゆき', '宮城県', '1996-12-25', 'kato_miyuki', '9800001'),
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', '渡辺雄一', '広島県', '1989-08-18', 'watanabe_yuichi', '7300001'),
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', '松本かな', '沖縄県', '1998-01-03', 'matsumoto_kana', '9000001');

-- ユーザーレベル情報（XPとレベル設定）
INSERT INTO user_levels (user_id, xp, level, updated_at)
VALUES
  -- 1位: 安野たかひろ（レベル20）
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 3325, 20, '2025-06-04T10:00:00Z'),
  -- 2位: 佐藤太郎（レベル10）
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 900, 10, '2025-06-04T09:30:00Z'),
  -- 3位: 鈴木美咲（レベル9）
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 740, 9, '2025-06-04T09:00:00Z'),
  -- 4位: 高橋健一（レベル8）
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 595, 8, '2025-06-04T08:30:00Z'),
  -- 5位: 伊藤愛子（レベル7）
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 465, 7, '2025-06-04T08:00:00Z'),
  -- 6位: 山田次郎（レベル6）
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 350, 6, '2025-06-04T07:30:00Z'),
  -- 7位: 中村さくら（レベル5）
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', 250, 5, '2025-06-04T07:00:00Z'),
  -- 8位: 小林直人（レベル4）
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', 165, 4, '2025-06-04T06:30:00Z'),
  -- 9位: 田中花子（レベル3）
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 95, 3, '2025-06-04T06:00:00Z'),
  -- 10位: 加藤みゆき（レベル2）
  ('6ba7b816-9dad-11d1-80b4-00c04fd430c8', 40, 2, '2025-06-04T05:30:00Z'),
  -- 11位: 渡辺雄一（レベル1）
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-06-04T05:00:00Z'),
  -- 12位: 松本かな（レベル1、新規参加者）
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-06-04T04:30:00Z');

-- ミッション
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('e2898d7e-903f-4f9a-8b1b-93f783c9afac', '(seed) ゴミ拾いをしよう (成果物不要)', NULL, '近所のゴミを拾ってみよう！清掃活動の報告は任意です。', 1, NULL, 'NONE', NULL),
  ('2246205f-933f-4a86-83af-dbf6bb6cde90', '(seed) 活動ブログを書こう (リンク提出)', '/img/mission_fallback.svg', 'あなたの活動についてブログ記事を書き、URLを提出してください。', 2, NULL, 'LINK', 10),
  ('3346205f-933f-4a86-83af-dbf6bb6cde91', '(seed) 今日のベストショット (画像提出)', '/img/mission_fallback.svg', '今日の活動で見つけた素晴らしい瞬間を写真で共有してください。', 3, '2025-06-01', 'IMAGE', NULL),
  ('4446205f-933f-4a86-83af-dbf6bb6cde92', '(seed) 発見！地域の宝 (位置情報付き画像)', '/img/mission_fallback.svg', 'あなたの地域で見つけた素敵な場所や物を、位置情報付きの写真で教えてください。', 4, NULL, 'IMAGE_WITH_GEOLOCATION', 5),
  ('5546205f-933f-4a86-83af-dbf6bb6cde93', '(seed) 日付付きミッション１ (成果物不要, 上限1回)', '/img/mission_fallback.svg', 'テスト用のミッションです。<a href="/">link test</a>', 5, '2025-05-01', 'NONE', 1),
  ('e5348472-d054-4ef4-81af-772c6323b669', '(seed) Xのニックネームを入力しよう(テキスト提出)', NULL, 'Xのニックネームを入力しよう', 1, NULL, 'TEXT', NULL);  

--★#278対応にて、achievementsとmission_artifactsのuser_idのFKをpublic_user_profileからauth.usersへ変更
--★seed.sql実行時点でauth.usersデータを作れず、上記2テーブルがFK違反になることから、INSERT処理はコメントアウト

-- (オプション) mission_artifacts と mission_artifact_geolocations のサンプルデータ
-- これらはアプリケーションロジック経由で作成されるのが主だが、テスト用に直接挿入も可能
--INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, description) VALUES ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'LINK', 'https://example.com/my-activity-blog', '活動報告ブログです');

-- ミッション達成（複数ユーザーの多様な達成パターン）
--INSERT INTO achievements (id, mission_id, user_id)
--VALUES
  -- 安野たかひろの達成（トップユーザーらしく多数達成）
--  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
--  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '2246205f-933f-4a86-83af-dbf6bb6cde90', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
--  ('37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '3346205f-933f-4a86-83af-dbf6bb6cde91', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
  
  -- 田中花子の達成
-- ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2246205f-933f-4a86-83af-dbf6bb6cde90', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f'),
  
  -- 佐藤太郎の達成（2位らしく積極的）
--  ('47ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
--  ('57ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'e5348472-d054-4ef4-81af-772c6323b669', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  
  -- 鈴木美咲の達成
--  ('67ea2e6e-9ccf-4d2d-a3b4-f34d1a612444', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
--  ('77ea2e6e-9ccf-4d2d-a3b4-f34d1a612445', '3346205f-933f-4a86-83af-dbf6bb6cde91', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
  
  -- 高橋健一の達成
--  ('87ea2e6e-9ccf-4d2d-a3b4-f34d1a612446', 'e5348472-d054-4ef4-81af-772c6323b669', '6ba7b811-9dad-11d1-80b4-00c04fd430c8'),
  
  -- 山田次郎の達成
--  ('97ea2e6e-9ccf-4d2d-a3b4-f34d1a612447', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '6ba7b813-9dad-11d1-80b4-00c04fd430c8'),
  
  -- 小林直人の達成
--  ('a7ea2e6e-9ccf-4d2d-a3b4-f34d1a612448', 'e5348472-d054-4ef4-81af-772c6323b669', '6ba7b815-9dad-11d1-80b4-00c04fd430c8');

-- XPトランザクション履歴（ミッション達成に対応）
INSERT INTO xp_transactions (id, user_id, xp_amount, source_type, source_id, description, created_at)
VALUES
  -- 安野たかひろのXP履歴（合計3325 XP）
  ('11ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 50, 'MISSION_COMPLETION', '17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'ミッション「ゴミ拾いをしよう」達成', '2025-06-01T10:00:00Z'),
  ('22ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 100, 'MISSION_COMPLETION', '27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', 'ミッション「活動ブログを書こう」達成', '2025-06-02T14:30:00Z'),
  ('33ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 200, 'MISSION_COMPLETION', '37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', 'ミッション「今日のベストショット」達成', '2025-06-03T16:45:00Z'),
  ('44ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 2975, 'BONUS', NULL, '初期ボーナスXP', '2025-05-15T09:00:00Z'),
  
  -- 佐藤太郎のXP履歴（合計900 XP）
  ('55ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50, 'MISSION_COMPLETION', '47ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', 'ミッション「ゴミ拾いをしよう」達成', '2025-06-01T11:00:00Z'),
  ('66ea2e6e-9ccf-4d2d-a3b4-f34d1a612444', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50, 'MISSION_COMPLETION', '57ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'ミッション「Xのニックネーム」達成', '2025-06-02T13:00:00Z'),
  ('77ea2e6e-9ccf-4d2d-a3b4-f34d1a612445', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 800, 'BONUS', NULL, '初期ボーナスXP', '2025-05-16T10:00:00Z'),
  
  -- 田中花子のXP履歴（合計95 XP）
  ('88ea2e6e-9ccf-4d2d-a3b4-f34d1a612446', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 100, 'MISSION_COMPLETION', '953bcc49-56c4-4913-8ce4-f6d721e3c4ef', 'ミッション「活動ブログを書こう」達成', '2025-06-01T15:00:00Z'),
  ('99ea2e6e-9ccf-4d2d-a3b4-f34d1a612447', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 5, 'BONUS', NULL, '調整', '2025-05-20T12:00:00Z');
  
-- ミッション成果物のサンプルデータ
--INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, description) 
--VALUES 
--  ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'LINK', 'https://example.com/my-activity-blog', '活動報告ブログです'),
--  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'LINK', 'https://example.com/anno-blog', '政治活動についての考察記事');

-- イベント
INSERT INTO events (id, title, url, starts_at)
VALUES
  ('d8314e09-6647-44ca-93c1-08c51707982b', '地域清掃イベント', 'https://example.com/event1', '2025-05-01T10:00:00Z');

-- 日次アクション数
INSERT INTO daily_action_summary (date, count) VALUES
  ('2025-05-01', 10);

-- 日次ダッシュボード登録人数
INSERT INTO daily_dashboard_registration_summary (date, count) VALUES
  ('2025-05-01', 12);

-- 都道府県別登録人数
INSERT INTO daily_dashboard_registration_by_prefecture_summary (date, prefecture, count) VALUES
  ('2025-05-01', '東京都', 3),
  ('2025-05-01', '大阪府', 2),
  ('2025-05-01', '神奈川県', 1),
  ('2025-05-01', '愛知県', 1),
  ('2025-05-01', '福岡県', 1),
  ('2025-05-01', '北海道', 1),
  ('2025-05-01', '京都府', 1),
  ('2025-05-01', '宮城県', 1),
  ('2025-05-01', '広島県', 1),
  ('2025-05-01', '沖縄県', 1);


-- missionsテーブルのフューチャードフラグをON
update public.missions
set is_featured = true
where id in (
  'e2898d7e-903f-4f9a-8b1b-93f783c9afac',
  '4446205f-933f-4a86-83af-dbf6bb6cde92'
);

INSERT INTO cities (prefecture, city) VALUES
  ('東京都', '千代田区'),
  ('東京都', '中央区'),
  ('東京都', '港区'),
  ('東京都', '新宿区'),
  ('東京都', '文京区'),
  ('東京都', '台東区'),
  ('東京都', '墨田区'),
  ('東京都', '江東区'),
  ('東京都', '品川区'),
  ('東京都', '目黒区'),
  ('東京都', '大田区'),
  ('東京都', '世田谷区'),
  ('東京都', '渋谷区'),
  ('東京都', '中野区');

INSERT INTO pins (number, address, place_name, lat, long, status, note, city_id) VALUES
  ('001', '東京都千代田区丸の内1-1-1', '東京駅前掲示板', 35.6812, 139.7671, 0, '東京駅丸の内南口前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '千代田区')),
  ('002', '東京都新宿区新宿3-38-1', '新宿駅東口掲示板', 35.6896, 139.7006, 1, '新宿駅東口ルミネ前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '新宿区')),
  ('003', '東京都渋谷区道玄坂2-1-1', '渋谷駅前掲示板', 35.6580, 139.7016, 0, '渋谷駅ハチ公前広場の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '渋谷区')),
  ('004', '東京都港区六本木6-10-1', '六本木ヒルズ掲示板', 35.6606, 139.7298, 2, '六本木ヒルズ森タワー前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '港区')),
  ('005', '東京都台東区上野7-1-1', '上野駅前掲示板', 35.7141, 139.7774, 1, '上野駅公園口前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '台東区')),
  ('006', '東京都墨田区押上1-1-2', '東京スカイツリー掲示板', 35.7101, 139.8107, 0, 'スカイツリータウン入口の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '墨田区')),
  ('007', '東京都江東区豊洲2-4-9', '豊洲市場掲示板', 35.6542, 139.7967, 3, '豊洲市場正門前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '江東区')),
  ('008', '東京都品川区高輪3-13-1', '品川駅前掲示板', 35.6284, 139.7387, 1, '品川駅高輪口前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '品川区')),
  ('009', '東京都世田谷区北沢2-1-1', '下北沢駅前掲示板', 35.6617, 139.6681, 0, '下北沢駅北口前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '世田谷区')),
  ('010', '東京都中野区中野5-52-15', '中野駅前掲示板', 35.7056, 139.6659, 2, '中野駅北口サンモール前の掲示板', (SELECT id FROM cities WHERE prefecture = '東京都' AND city = '中野区'));
