-- Seed data for poster boards
-- This creates sample poster boards across different prefectures

INSERT INTO poster_boards (name, lat, lon, prefecture, status) VALUES
-- Tokyo boards
('東京駅前掲示板', 35.6812, 139.7671, '東京都', 'not_yet'),
('新宿駅南口掲示板', 35.6896, 139.7006, '東京都', 'posted'),
('渋谷駅ハチ公前掲示板', 35.6590, 139.7005, '東京都', 'checked'),
('池袋駅東口掲示板', 35.7295, 139.7104, '東京都', 'not_yet'),
('上野駅公園口掲示板', 35.7141, 139.7774, '東京都', 'posted'),

-- Osaka boards
('大阪駅前掲示板', 34.7024, 135.4959, '大阪府', 'not_yet'),
('なんば駅前掲示板', 34.6666, 135.5011, '大阪府', 'posted'),
('天王寺駅前掲示板', 34.6465, 135.5133, '大阪府', 'damaged'),

-- Kyoto boards
('京都駅前掲示板', 34.9859, 135.7585, '京都府', 'posted'),
('四条河原町掲示板', 35.0034, 135.7689, '京都府', 'checked'),

-- Hokkaido boards
('札幌駅前掲示板', 43.0687, 141.3507, '北海道', 'not_yet'),
('すすきの交差点掲示板', 43.0556, 141.3529, '北海道', 'posted'),

-- Fukuoka boards
('博多駅前掲示板', 33.5903, 130.4208, '福岡県', 'posted'),
('天神駅前掲示板', 33.5911, 130.3983, '福岡県', 'not_yet')
ON CONFLICT DO NOTHING;