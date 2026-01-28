-- シーズンデータを作成（user_levelsで参照するため先に作成）
INSERT INTO seasons (slug, name, start_date, end_date, is_active)
VALUES 
  ('season1', 'シーズン１', '2025-06-01 00:00:00+09', '2025-07-19 23:59:59+09', false),
  ('season2', 'シーズン２', '2025-07-20 00:00:00+09', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- auth.usersテーブルにユーザーを追加（外部キー制約のため）
-- 管理者ユーザー（admin@example.com / admin123456）
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, email_change, email_change_token_new, recovery_token, confirmation_token, confirmation_sent_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@example.com', crypt('admin123456', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"], "roles": ["admin"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ポスティング管理者ユーザー（posting-admin@example.com / postingadmin123456）
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, email_change, email_change_token_new, recovery_token, confirmation_token, confirmation_sent_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'posting-admin@example.com', crypt('postingadmin123456', gen_salt('bf')), now(), now(), '{"provider": "email", "providers": ["email"], "roles": ["posting-admin"]}', '{"email_verified": true}', '', '', '', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

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

-- private usersテーブルにデータを追加
-- 管理者ユーザー
INSERT INTO private_users (id, date_of_birth, postcode)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '1985-01-01', '1000000')
ON CONFLICT (id) DO NOTHING;

-- ポスティング管理者ユーザー
INSERT INTO private_users (id, date_of_birth, postcode)
VALUES
  ('a0000000-0000-0000-0000-000000000002', '1990-06-15', '1000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO private_users (id, date_of_birth, postcode)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '1990-12-01', '1000001'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '1995-05-05', '5300001'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '1988-03-15', '1500012'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '1992-07-22', '2200001'),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '1985-11-08', '5600011'),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', '1993-04-30', '4600001'),
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', '1991-09-12', '8100001'),
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', '1994-02-14', '0600001'),
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', '1987-06-05', '6020001'),
  ('6ba7b816-9dad-11d1-80b4-00c04fd430c8', '1996-12-25', '9800001'),
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', '1989-08-18', '7300001'),
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', '1998-01-03', '9000001');

-- public_user_profilesテーブルにデータを追加
-- 管理者ユーザー
INSERT INTO public_user_profiles (id, name, address_prefecture, x_username, github_username)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '管理者', '東京都', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ポスティング管理者ユーザー
INSERT INTO public_user_profiles (id, name, address_prefecture, x_username, github_username)
VALUES
  ('a0000000-0000-0000-0000-000000000002', 'ポスティング管理者', '東京都', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public_user_profiles (id, name, address_prefecture, x_username, github_username)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '安野たかひろ', '東京都', 'takahiroanno', 'takahiroanno'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '田中花子', '大阪府', NULL, NULL),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '佐藤太郎', '東京都', 'sato_taro', 'sato_taro'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '鈴木美咲', '神奈川県', 'suzuki_misaki', 'suzuki_misaki'),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', '高橋健一', '大阪府', 'takahashi_ken', NULL),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', '伊藤愛子', '愛知県', 'ito_aiko', NULL),
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', '山田次郎', '福岡県', 'yamada_jiro', NULL),
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', '中村さくら', '北海道', 'nakamura_sakura', NULL),
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', '小林直人', '京都府', 'kobayashi_naoto', NULL),
  ('6ba7b816-9dad-11d1-80b4-00c04fd430c8', '加藤みゆき', '宮城県', 'kato_miyuki', NULL),
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', '渡辺雄一', '広島県', 'watanabe_yuichi', NULL),
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', '松本かな', '沖縄県', 'matsumoto_kana', NULL);

-- ユーザーレベル情報（XPとレベル設定）
-- season1のIDを取得してuser_levelsに使用
INSERT INTO user_levels (user_id, xp, level, season_id, updated_at)
SELECT 
  ul.user_id::uuid,
  ul.xp,
  ul.level,
  s.id as season_id,
  ul.updated_at::timestamptz
FROM (VALUES
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
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-06-04T04:30:00Z')
) AS ul(user_id, xp, level, updated_at)
CROSS JOIN seasons s
WHERE s.slug = 'season2';

-- ミッション
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, slug)
VALUES
  ('e2898d7e-903f-4f9a-8b1b-93f783c9afac', '(seed) ゴミ拾いをしよう (成果物不要)', NULL, '近所のゴミを拾ってみよう！清掃活動の報告は任意です。', 4, NULL, 'NONE', NULL, 'seed-cleanup'),
  ('2246205f-933f-4a86-83af-dbf6bb6cde90', '(seed) 活動ブログを書こう (リンク提出)', '/img/mission_fallback.svg', 'あなたの活動についてブログ記事を書き、URLを提出してください。', 2, NULL, 'LINK', 10, 'seed-activity-blog'),
  ('3346205f-933f-4a86-83af-dbf6bb6cde91', '(seed) 今日のベストショット (画像提出)', '/img/mission_fallback.svg', '今日の活動で見つけた素晴らしい瞬間を写真で共有してください。', 3, '2025-06-01', 'IMAGE', NULL, 'seed-best-shot'),
  ('4446205f-933f-4a86-83af-dbf6bb6cde92', '(seed) 発見！地域の宝 (位置情報付き画像)', '/img/mission_fallback.svg', 'あなたの地域で見つけた素敵な場所や物を、位置情報付きの写真で教えてください。', 4, NULL, 'IMAGE_WITH_GEOLOCATION', 5, 'seed-local-treasure'),
  ('5546205f-933f-4a86-83af-dbf6bb6cde93', '(seed) 日付付きミッション１ (成果物不要, 上限1回)', '/img/mission_fallback.svg', 'テスト用のミッションです。<a href="/">link test</a>', 5, '2025-05-01', 'NONE', 1, 'seed-date-mission-1'),
  ('e5348472-d054-4ef4-81af-772c6323b669', '(seed) Xのニックネームを入力しよう(テキスト提出)', NULL, 'Xのニックネームを入力しよう', 1, NULL, 'TEXT', NULL, 'seed-x-nickname');



-- シーズン1用のミッション達成データ（過去のシーズン）
INSERT INTO achievements (id, mission_id, user_id, season_id, created_at)
SELECT 
  a.id::uuid,
  a.mission_id::uuid,
  a.user_id::uuid,
  s.id as season_id,
  a.created_at::timestamptz
FROM (VALUES
  -- 安野たかひろの達成（シーズン1でも活躍）
  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a000001', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2025-06-05T10:00:00Z'),
  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a000002', '2246205f-933f-4a86-83af-dbf6bb6cde90', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2025-06-10T14:30:00Z'),
  
  -- 田中花子の達成
  ('953bcc49-56c4-4913-8ce4-f6d721e00001', '2246205f-933f-4a86-83af-dbf6bb6cde90', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '2025-06-08T15:00:00Z'),
  
  -- 佐藤太郎の達成
  ('47ea2e6e-9ccf-4d2d-a3b4-f34d1a000003', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '2025-06-06T11:00:00Z')
) AS a(id, mission_id, user_id, created_at)
CROSS JOIN seasons s
WHERE s.slug = 'season1';

-- シーズン1用のXPトランザクション履歴
INSERT INTO xp_transactions (id, user_id, xp_amount, source_type, source_id, description, created_at, season_id)
SELECT 
  xt.id::uuid,
  xt.user_id::uuid,
  xt.xp_amount,
  xt.source_type,
  xt.source_id::uuid,
  xt.description,
  xt.created_at::timestamptz,
  s.id as season_id
FROM (VALUES
  -- 安野たかひろのXP履歴（シーズン1）
  ('11ea2e6e-9ccf-4d2d-a3b4-f34d1a000001', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 50, 'MISSION_COMPLETION', '17ea2e6e-9ccf-4d2d-a3b4-f34d1a000001', 'ミッション「ゴミ拾いをしよう」達成', '2025-06-05T10:00:00Z'),
  ('22ea2e6e-9ccf-4d2d-a3b4-f34d1a000002', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 100, 'MISSION_COMPLETION', '27ea2e6e-9ccf-4d2d-a3b4-f34d1a000002', 'ミッション「活動ブログを書こう」達成', '2025-06-10T14:30:00Z'),
  ('44ea2e6e-9ccf-4d2d-a3b4-f34d1a000003', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 1000, 'BONUS', NULL, 'シーズン1初期ボーナスXP', '2025-06-01T09:00:00Z'),
  
  -- 佐藤太郎のXP履歴（シーズン1）
  ('55ea2e6e-9ccf-4d2d-a3b4-f34d1a000004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50, 'MISSION_COMPLETION', '47ea2e6e-9ccf-4d2d-a3b4-f34d1a000003', 'ミッション「ゴミ拾いをしよう」達成', '2025-06-06T11:00:00Z'),
  ('77ea2e6e-9ccf-4d2d-a3b4-f34d1a000005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 500, 'BONUS', NULL, 'シーズン1初期ボーナスXP', '2025-06-01T10:00:00Z'),
  
  -- 田中花子のXP履歴（シーズン1）
  ('88ea2e6e-9ccf-4d2d-a3b4-f34d1a000006', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 100, 'MISSION_COMPLETION', '953bcc49-56c4-4913-8ce4-f6d721e00001', 'ミッション「活動ブログを書こう」達成', '2025-06-08T15:00:00Z'),
  ('99ea2e6e-9ccf-4d2d-a3b4-f34d1a000007', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 200, 'BONUS', NULL, 'シーズン1初期ボーナスXP', '2025-06-01T12:00:00Z')
) AS xt(id, user_id, xp_amount, source_type, source_id, description, created_at)
CROSS JOIN seasons s
WHERE s.slug = 'season1';

-- シーズン1用のユーザーレベル情報（過去のシーズン記録）
INSERT INTO user_levels (user_id, xp, level, season_id, updated_at)
SELECT 
  ul.user_id::uuid,
  ul.xp,
  ul.level,
  s.id as season_id,
  ul.updated_at::timestamptz
FROM (VALUES
  -- シーズン1終了時のレベル
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 1150, 11, '2025-07-19T23:59:59Z'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 550, 7, '2025-07-19T23:59:59Z'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 300, 5, '2025-07-19T23:59:59Z'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 200, 4, '2025-07-19T23:59:59Z'),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 100, 3, '2025-07-19T23:59:59Z'),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 50, 2, '2025-07-19T23:59:59Z'),
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z'),
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z'),
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z'),
  ('6ba7b816-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z'),
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z'),
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', 0, 1, '2025-07-19T23:59:59Z')
) AS ul(user_id, xp, level, updated_at)
CROSS JOIN seasons s
WHERE s.slug = 'season1';

-- シーズン2用のミッション達成データ
INSERT INTO achievements (id, mission_id, user_id, season_id, created_at)
SELECT 
  a.id::uuid,
  a.mission_id::uuid,
  a.user_id::uuid,
  s.id as season_id,
  a.created_at::timestamptz
FROM (VALUES
  -- 安野たかひろの達成（トップユーザーらしく多数達成）
  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2025-07-21T10:00:00Z'),
  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '2246205f-933f-4a86-83af-dbf6bb6cde90', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2025-07-22T14:30:00Z'),
  ('37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '3346205f-933f-4a86-83af-dbf6bb6cde91', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '2025-07-23T16:45:00Z'),
  
  -- 田中花子の達成
  ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2246205f-933f-4a86-83af-dbf6bb6cde90', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '2025-07-21T15:00:00Z'),
  
  -- 佐藤太郎の達成（2位らしく積極的）
  ('47ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '2025-07-21T11:00:00Z'),
  ('57ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'e5348472-d054-4ef4-81af-772c6323b669', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '2025-07-22T13:00:00Z'),
  
  -- 鈴木美咲の達成
  ('67ea2e6e-9ccf-4d2d-a3b4-f34d1a612444', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '2025-07-21T12:00:00Z'),
  ('77ea2e6e-9ccf-4d2d-a3b4-f34d1a612445', '3346205f-933f-4a86-83af-dbf6bb6cde91', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '2025-07-22T09:00:00Z')
) AS a(id, mission_id, user_id, created_at)
CROSS JOIN seasons s
WHERE s.slug = 'season2';

-- XPトランザクション履歴（シーズン2のミッション達成に対応）
INSERT INTO xp_transactions (id, user_id, xp_amount, source_type, source_id, description, created_at, season_id)
SELECT 
  xt.id::uuid,
  xt.user_id::uuid,
  xt.xp_amount,
  xt.source_type,
  xt.source_id::uuid,
  xt.description,
  xt.created_at::timestamptz,
  s.id as season_id
FROM (VALUES
  -- 安野たかひろのXP履歴（シーズン2で合計3325 XP）
  ('11ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 50, 'MISSION_COMPLETION', '17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'ミッション「ゴミ拾いをしよう」達成', '2025-07-21T10:00:00Z'),
  ('22ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 100, 'MISSION_COMPLETION', '27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', 'ミッション「活動ブログを書こう」達成', '2025-07-22T14:30:00Z'),
  ('33ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 200, 'MISSION_COMPLETION', '37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', 'ミッション「今日のベストショット」達成', '2025-07-23T16:45:00Z'),
  ('44ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 2975, 'BONUS', NULL, '初期ボーナスXP', '2025-07-20T09:00:00Z'),
  
  -- 佐藤太郎のXP履歴（シーズン2で合計900 XP）
  ('55ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50, 'MISSION_COMPLETION', '47ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', 'ミッション「ゴミ拾いをしよう」達成', '2025-07-21T11:00:00Z'),
  ('66ea2e6e-9ccf-4d2d-a3b4-f34d1a612444', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 50, 'MISSION_COMPLETION', '57ea2e6e-9ccf-4d2d-a3b4-f34d1a612443', 'ミッション「Xのニックネーム」達成', '2025-07-22T13:00:00Z'),
  ('77ea2e6e-9ccf-4d2d-a3b4-f34d1a612445', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 800, 'BONUS', NULL, '初期ボーナスXP', '2025-07-20T10:00:00Z'),
  
  -- 田中花子のXP履歴（シーズン2で合計95 XP）
  ('88ea2e6e-9ccf-4d2d-a3b4-f34d1a612446', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 100, 'MISSION_COMPLETION', '953bcc49-56c4-4913-8ce4-f6d721e3c4ef', 'ミッション「活動ブログを書こう」達成', '2025-07-21T15:00:00Z'),
  ('99ea2e6e-9ccf-4d2d-a3b4-f34d1a612447', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', -5, 'BONUS', NULL, '調整', '2025-07-20T12:00:00Z'),
  
  -- 鈴木美咲のXP履歴（シーズン2で合計740 XP）
  ('aa2e2e6e-9ccf-4d2d-a3b4-f34d1a612450', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 50, 'MISSION_COMPLETION', '67ea2e6e-9ccf-4d2d-a3b4-f34d1a612444', 'ミッション「ゴミ拾いをしよう」達成', '2025-07-21T12:00:00Z'),
  ('bb2e2e6e-9ccf-4d2d-a3b4-f34d1a612451', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 200, 'MISSION_COMPLETION', '77ea2e6e-9ccf-4d2d-a3b4-f34d1a612445', 'ミッション「今日のベストショット」達成', '2025-07-22T09:00:00Z'),
  ('cc2e2e6e-9ccf-4d2d-a3b4-f34d1a612452', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 490, 'BONUS', NULL, '初期ボーナスXP', '2025-07-20T08:00:00Z')
) AS xt(id, user_id, xp_amount, source_type, source_id, description, created_at)
CROSS JOIN seasons s
WHERE s.slug = 'season2';
  
-- ミッション成果物のサンプルデータ
--INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, description) 
--VALUES 
--  ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'LINK', 'https://example.com/my-activity-blog', '活動報告ブログです'),
--  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'LINK', 'https://example.com/anno-blog', '政治活動についての考察記事');

-- missionsテーブルのフューチャードフラグをON
update public.missions
set is_featured = true
where id in (
  'e2898d7e-903f-4f9a-8b1b-93f783c9afac',
  '4446205f-933f-4a86-83af-dbf6bb6cde92'
);

-- ポスティングイベントのサンプルデータ
INSERT INTO posting_events (id, slug, title, description, is_active, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'default', 'デフォルトイベント', '初期イベント', true, '2025-06-01 00:00:00.000', '2025-06-01 00:00:00.000')
ON CONFLICT (slug) DO NOTHING;

-- ポスティングシェイプのサンプルデータ
INSERT INTO posting_shapes (id, type, coordinates, properties, event_id, created_at, updated_at)
VALUES
  -- 東京エリア（新宿区全域をカバーする大きなポリゴン）
  ('c04bdb2e-053c-4b9c-95c3-83db26492d7b', 'polygon',
   '{"type":"Polygon","coordinates":[[[139.6917,35.7020],[139.7317,35.7020],[139.7317,35.6620],[139.6917,35.6620],[139.6917,35.7020]]]}',
   '{"_shapeId":"c04bdb2e-053c-4b9c-95c3-83db26492d7b","originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-02 07:37:29.534', '2025-06-02 07:37:29.534'),

  -- 東京エリア（世田谷区全域をカバーする大きなポリゴン）
  ('a0bd1c29-5be9-480a-85e1-6823f232939a', 'polygon',
   '{"type":"Polygon","coordinates":[[[139.6117,35.6620],[139.6617,35.6620],[139.6617,35.6120],[139.6117,35.6120],[139.6117,35.6620]]]}',
   '{"originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-11 21:29:03.136', '2025-06-11 21:29:03.136'),

  -- 福岡エリア（博多区周辺の大きなポリゴン）
  ('98388127-ea99-4659-acba-80b61b44fe23', 'polygon',
   '{"type":"Polygon","coordinates":[[[130.3900,33.6100],[130.4300,33.6100],[130.4300,33.5700],[130.3900,33.5700],[130.3900,33.6100]]]}',
   '{"originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-10 14:06:46.592', '2025-06-10 14:06:46.592'),

  -- 岡山エリア（岡山市中心部の大きなポリゴン）
  ('74aa7806-69e4-4380-a642-ce31f47ecad9', 'polygon',
   '{"type":"Polygon","coordinates":[[[133.8900,34.6900],[133.9400,34.6900],[133.9400,34.6400],[133.8900,34.6400],[133.8900,34.6900]]]}',
   '{"originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-11 13:51:46.686', '2025-06-11 13:51:46.686'),

  -- 大阪エリア（梅田周辺の大きなポリゴン）
  ('b1234567-89ab-cdef-0123-456789abcdef', 'polygon',
   '{"type":"Polygon","coordinates":[[[135.4800,34.7200],[135.5200,34.7200],[135.5200,34.6800],[135.4800,34.6800],[135.4800,34.7200]]]}',
   '{"originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-12 10:15:00.000', '2025-06-12 10:15:00.000'),

  -- 名古屋エリア（名古屋駅周辺の大きなポリゴン）
  ('c2345678-90bc-def0-1234-567890bcdef0', 'polygon',
   '{"type":"Polygon","coordinates":[[[136.8600,35.1900],[136.9000,35.1900],[136.9000,35.1500],[136.8600,35.1500],[136.8600,35.1900]]]}',
   '{"originalType":"Polygon"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-13 15:30:45.123', '2025-06-13 15:30:45.123'),

  -- テキストタイプのエントリ（東京エリア）
  ('f5678901-23ef-0123-4567-890123ef0123', 'text',
   '{"type":"Point","coordinates":[139.6950,35.6950]}',
   '{"text":"新宿エリア","originalType":"Text"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-14 09:30:00.000', '2025-06-14 09:30:00.000'),

  ('17890123-4501-2345-6789-012345012345', 'text',
   '{"type":"Point","coordinates":[139.6350,35.6350]}',
   '{"text":"世田谷区","originalType":"Text"}',
   'a0000000-0000-0000-0000-000000000001',
   '2025-06-14 10:00:00.000', '2025-06-14 10:00:00.000');

-- ポスター掲示板の情報

INSERT INTO poster_boards (name, lat, long, prefecture, status, number, address, city, election_term) VALUES
-- Tokyo boards
('東京駅前掲示板', 35.6812, 139.7671, '東京都', 'not_yet', '10-1', '千代田区丸の内1-9-1', '千代田区', 'shugin-2026'),
('新宿駅南口掲示板', 35.6896, 139.7006, '東京都', 'done', '10-2', '新宿区新宿3-38-1', '新宿区', 'shugin-2026'),
('渋谷駅ハチ公前掲示板', 35.6590, 139.7005, '東京都', 'done', '10-3', '渋谷区道玄坂2-1', '渋谷区', 'shugin-2026'),
('池袋駅東口掲示板', 35.7295, 139.7104, '東京都', 'not_yet', '10-4', '豊島区南池袋1-28-2', '豊島区', 'shugin-2026'),
('上野駅公園口掲示板', 35.7141, 139.7774, '東京都', 'reserved', '10-5', '台東区上野7-1-1', '台東区', 'shugin-2026'),

-- Osaka boards
('大阪駅前掲示板', 34.7024, 135.4959, '大阪府', 'not_yet', '27-1', '北区梅田3-1-1', '大阪市北区', 'shugin-2026'),
('なんば駅前掲示板', 34.6666, 135.5011, '大阪府', 'done', '27-2', '中央区難波5-1-60', '大阪市中央区', 'shugin-2026'),
('天王寺駅前掲示板', 34.6465, 135.5133, '大阪府', 'error_damaged', '27-3', '天王寺区悲田院町10-45', '大阪市天王寺区', 'shugin-2026'),

-- Kyoto boards (Note: Kyoto is not in the prefecture_enum, using nearby osaka)
('京都駅前掲示板', 34.9859, 135.7585, '大阪府', 'done', '27-4', '下京区烏丸通塩小路下る', '京都市下京区', 'shugin-2026'),
('四条河原町掲示板', 35.0034, 135.7689, '大阪府', 'done', '27-5', '中京区河原町四条上る', '京都市中京区', 'shugin-2026'),

-- Hokkaido boards
('札幌駅前掲示板', 43.0687, 141.3507, '北海道', 'not_yet', '01-1', '北区北七条西4丁目', '札幌市北区', 'shugin-2026'),
('すすきの交差点掲示板', 43.0556, 141.3529, '北海道', 'reserved', '01-2', '中央区南四条西4丁目', '札幌市中央区', 'shugin-2026'),

-- Fukuoka boards
('博多駅前掲示板', 33.5903, 130.4208, '福岡県', 'done', '40-1', '博多区博多駅中央街1-1', '福岡市博多区', 'shugin-2026'),
('天神駅前掲示板', 33.5911, 130.3983, '福岡県', 'not_yet', '40-2', '中央区天神2丁目11-1', '福岡市中央区', 'shugin-2026')
ON CONFLICT DO NOTHING;

-- バッジデータ（各シーズンごとにバッジを付与）
INSERT INTO user_badges (user_id, badge_type, sub_type, rank, season_id, achieved_at, is_notified)
SELECT 
  b.user_id::uuid,
  b.badge_type,
  b.sub_type,
  b.rank,
  s.id as season_id,
  b.achieved_at::timestamptz,
  b.is_notified
FROM (VALUES
  -- シーズン1のバッジ（過去シーズン）
  -- 安野たかひろ - 総合1位、デイリー1位、東京都1位
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'ALL', NULL, 1, 'season1', '2025-07-18T10:00:00Z', true),
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'DAILY', NULL, 1, 'season1', '2025-07-18T10:00:00Z', true),
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'PREFECTURE', '東京都', 1, 'season1', '2025-07-18T10:00:00Z', true),
  
  -- 佐藤太郎 - 総合2位、東京都2位
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ALL', NULL, 2, 'season1', '2025-07-18T09:30:00Z', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'PREFECTURE', '東京都', 2, 'season1', '2025-07-18T09:30:00Z', true),
  
  -- 田中花子 - 大阪府1位
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'PREFECTURE', '大阪府', 1, 'season1', '2025-07-18T06:00:00Z', true),
  
  -- 鈴木美咲 - 総合3位、神奈川県1位
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'ALL', NULL, 3, 'season1', '2025-07-18T09:00:00Z', true),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '神奈川県', 1, 'season1', '2025-07-18T09:00:00Z', true),

  -- シーズン2のバッジ（現在のシーズン）
  -- 安野たかひろ - 総合1位、デイリー3位、東京都1位、ミッション「ゴミ拾い」1位
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'ALL', NULL, 1, 'season2', '2025-08-10T10:00:00Z', false),
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'DAILY', NULL, 3, 'season2', '2025-08-12T10:00:00Z', false),
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'PREFECTURE', '東京都', 1, 'season2', '2025-08-10T10:00:00Z', false),
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'MISSION', 'seed-cleanup', 1, 'season2', '2025-08-11T10:00:00Z', false),
  
  -- 佐藤太郎 - 総合2位、デイリー1位、東京都2位
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ALL', NULL, 2, 'season2', '2025-08-10T09:30:00Z', false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'DAILY', NULL, 1, 'season2', '2025-08-13T09:30:00Z', false),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'PREFECTURE', '東京都', 2, 'season2', '2025-08-10T09:30:00Z', false),
  
  -- 鈴木美咲 - 総合3位、神奈川県1位、ミッション「活動ブログ」2位
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'ALL', NULL, 3, 'season2', '2025-08-10T09:00:00Z', false),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '神奈川県', 1, 'season2', '2025-08-10T09:00:00Z', false),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'MISSION', 'seed-activity-blog', 2, 'season2', '2025-08-11T09:00:00Z', false),
  
  -- 高橋健一 - 総合4位、大阪府1位
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'ALL', NULL, 4, 'season2', '2025-08-10T08:30:00Z', false),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '大阪府', 1, 'season2', '2025-08-10T08:30:00Z', false),
  
  -- 伊藤愛子 - 総合5位、愛知県1位、デイリー2位
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'ALL', NULL, 5, 'season2', '2025-08-10T08:00:00Z', false),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '愛知県', 1, 'season2', '2025-08-10T08:00:00Z', false),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'DAILY', NULL, 2, 'season2', '2025-08-13T08:00:00Z', false),
  
  -- 田中花子 - 大阪府2位、ミッション「ベストショット」3位
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'PREFECTURE', '大阪府', 2, 'season2', '2025-08-10T06:00:00Z', false),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'MISSION', 'seed-best-shot', 3, 'season2', '2025-08-11T06:00:00Z', false),
  
  -- 山田次郎 - 福岡県1位
  ('6ba7b813-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '福岡県', 1, 'season2', '2025-08-10T07:30:00Z', false),
  
  -- 中村さくら - 北海道1位
  ('6ba7b814-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '北海道', 1, 'season2', '2025-08-10T07:00:00Z', false),
  
  -- 小林直人 - 京都府1位
  ('6ba7b815-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '京都府', 1, 'season2', '2025-08-10T06:30:00Z', false),
  
  -- 渡辺雄一 - 広島県1位
  ('6ba7b817-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '広島県', 1, 'season2', '2025-08-10T05:00:00Z', false),
  
  -- 松本かな - 沖縄県1位
  ('6ba7b818-9dad-11d1-80b4-00c04fd430c8', 'PREFECTURE', '沖縄県', 1, 'season2', '2025-08-10T04:30:00Z', false)
) AS b(user_id, badge_type, sub_type, rank, slug, achieved_at, is_notified)
CROSS JOIN seasons s
WHERE s.slug = b.slug;

-- 直近90日分のachievementsテストデータ（アクション数ダッシュボード動作確認用）
-- 日別に5〜20件程度のアクションを生成
INSERT INTO achievements (id, mission_id, user_id, season_id, created_at)
SELECT
  gen_random_uuid() as id,
  (ARRAY[
    'e2898d7e-903f-4f9a-8b1b-93f783c9afac',
    '2246205f-933f-4a86-83af-dbf6bb6cde90',
    '3346205f-933f-4a86-83af-dbf6bb6cde91',
    '4446205f-933f-4a86-83af-dbf6bb6cde92',
    'e5348472-d054-4ef4-81af-772c6323b669'
  ])[1 + (i % 5)]::uuid as mission_id,
  (ARRAY[
    '622d6984-2f8a-41df-9ac3-cd4dcceb8d19',
    '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b815-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b816-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b817-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b818-9dad-11d1-80b4-00c04fd430c8'
  ])[1 + (i % 12)]::uuid as user_id,
  (SELECT id FROM seasons WHERE slug = 'season2') as season_id,
  -- 各日の9:00〜21:00の間のランダムな時刻
  (CURRENT_DATE - ((i / 15) || ' days')::interval) +
  ((9 + (i % 12)) || ' hours')::interval +
  ((i * 7 % 60) || ' minutes')::interval as created_at
FROM generate_series(1, 1350) as i;  -- 90日 × 15件/日 = 1350件
