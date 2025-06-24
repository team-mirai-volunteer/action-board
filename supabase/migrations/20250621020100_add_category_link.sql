--#398　カテゴリマスタテーブルを追加

create table public.mission_category (
  id UUID PRIMARY KEY, -- UUID自動生成
  category_title text,                   -- カテゴリ名称（表示用）
  sort_no integer not null default 0,            -- 表示順
  category_kbn varchar(20) not null default 'DEFAULT', -- 区分（将来の拡張用）
  del_flg boolean not null default false,        -- 削除フラグ
  created_at timestamptz not null default now(), -- 作成日時
  updated_at timestamptz not null default now()  -- 更新日時
);

--RLS設定
alter table mission_category enable row level security;

--SELECTは許可
create policy select_all_categories
  on mission_category
  for select
  using (true);

--ミッションカテゴリ紐付マスタテーブルを追加

create table public.mission_category_link (
  mission_id uuid not null references missions(id) on delete cascade,
  category_id uuid not null references mission_category(id) on delete cascade,
  sort_no integer not null default 0,             -- カテゴリ内のミッション表示順
  del_flg boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (mission_id, category_id)
);

alter table mission_category_link enable row level security;

create policy select_all_links
  on mission_category_link
  for select
  using (true);

-- カテゴリテーブルへのデータ投入
insert into mission_category (id, category_title, sort_no, category_kbn)
values
  ('e9b4504d-3281-8337-22d4-9c9f2faab54c', 'フォロー・登録する', 1, 'DEFAULT'),
  ('7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', '発信・拡散する', 2, 'DEFAULT'),
  ('a1e44661-c95a-8541-8fc4-55b942cce3a3', 'コミュニティ・イベントに参加する', 3, 'DEFAULT'),
  ('089285df-f73d-55e6-e426-6e623095cf26', 'リアルで参加する', 4, 'DEFAULT'),
  ('fdfe421f-9145-e73f-7000-53ab53d23f49', ' 作って参加する', 5, 'DEFAULT');


-- ミッションカテゴリ紐付テーブルへのデータ投入
-- missionsの一部でたーた生成時にuuidを随時採番しているため、タイトルからuuidを取得し登録
-- uuidが取得できなかった場合、FK違反を意図的に起こし気が付ける仕組みを設けている（clalesce）
insert into mission_category_link (mission_id, category_id, sort_no) values
-- フォロー・登録する
  (coalesce((select id from missions where title = '安野たかひろの公式Xをフォローしよう' ), '00000000-0000-0000-0000-000000000000'), 'e9b4504d-3281-8337-22d4-9c9f2faab54c', 1),
  (coalesce((select id from missions where title = 'チームみらいの公式Xをフォローしよう' ), '00000000-0000-0000-0000-000000000000'), 'e9b4504d-3281-8337-22d4-9c9f2faab54c', 2),
  (coalesce((select id from missions where title = '公式noteをフォローしよう' ), '00000000-0000-0000-0000-000000000000'), 'e9b4504d-3281-8337-22d4-9c9f2faab54c', 3),
  (coalesce((select id from missions where title = '公式YouTubeチャンネルを登録しよう' ), '00000000-0000-0000-0000-000000000000'), 'e9b4504d-3281-8337-22d4-9c9f2faab54c', 4),
  (coalesce((select id from missions where title = '公式LINEアカウントと友達になろう' ), '00000000-0000-0000-0000-000000000000'), 'e9b4504d-3281-8337-22d4-9c9f2faab54c', 5),

-- 発信・拡散する
  (coalesce((select id from missions where title = 'チームみらいの仲間を増やそう' ), '00000000-0000-0000-0000-000000000000'), '7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', 1),
  (coalesce((select id from missions where title = 'Xでチームみらいの投稿をリポストしよう' ), '00000000-0000-0000-0000-000000000000'), '7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', 2),
  (coalesce((select id from missions where title = 'Xでチームみらいに関する投稿をしよう' ), '00000000-0000-0000-0000-000000000000'), '7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', 3),
  (coalesce((select id from missions where title = 'マニフェストの感想をSNSでシェアしよう' ), '00000000-0000-0000-0000-000000000000'), '7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', 4),
  (coalesce((select id from missions where title = 'YouTube動画を視聴しよう' ), '00000000-0000-0000-0000-000000000000'), '7530768f-e78b-1ecd-9fdd-96c0a42a5f4d', 5),

-- コミュニティ・イベントに参加する
  (coalesce((select id from missions where title = 'サポーターSlackに入ろう' ), '00000000-0000-0000-0000-000000000000'), 'a1e44661-c95a-8541-8fc4-55b942cce3a3', 1),
  (coalesce((select id from missions where title = '都道府県別LINEオープンチャットに入ろう' ), '00000000-0000-0000-0000-000000000000'), 'a1e44661-c95a-8541-8fc4-55b942cce3a3', 2),
  (coalesce((select id from missions where title = 'イベントに参加しよう' ), '00000000-0000-0000-0000-000000000000'), 'a1e44661-c95a-8541-8fc4-55b942cce3a3', 3),

-- リアルで参加する
  (coalesce((select id from missions where title = '街頭演説に参加しよう' ), '00000000-0000-0000-0000-000000000000'), '089285df-f73d-55e6-e426-6e623095cf26', 1),
  (coalesce((select id from missions where title = 'イベント運営を手伝おう' ), '00000000-0000-0000-0000-000000000000'), '089285df-f73d-55e6-e426-6e623095cf26', 2),
  (coalesce((select id from missions where title = 'チームみらいの機関誌をポスティングしよう' ), '00000000-0000-0000-0000-000000000000'), '089285df-f73d-55e6-e426-6e623095cf26', 3),

-- 作って参加する
  (coalesce((select id from missions where title = 'いどばた政策サイトからマニフェストを提案しよう' ), '00000000-0000-0000-0000-000000000000'), 'fdfe421f-9145-e73f-7000-53ab53d23f49', 1),
  (coalesce((select id from missions where title = '開発者向け: Githubでプルリクエストを出そう' ), '00000000-0000-0000-0000-000000000000'), 'fdfe421f-9145-e73f-7000-53ab53d23f49', 2),
  (coalesce((select id from missions where title = 'YouTube動画を切り抜こう' ), '00000000-0000-0000-0000-000000000000'), 'fdfe421f-9145-e73f-7000-53ab53d23f49', 3);


-- viewを作成
create or replace view mission_category_view as
select
  c.id                   as category_id,
  c.category_title       as category_title,
  c.category_kbn         as category_kbn,
  c.sort_no              as category_sort_no,
  m.id                   as mission_id,
  m.title                as title,                    
  m.icon_url             as icon_url,                 
  m.difficulty           as difficulty,               
  m.content              as content,                  
  m.created_at           as created_at,               
  m.artifact_label       as artifact_label,           
  m.max_achievement_count as max_achievement_count,   
  m.event_date           as event_date,               
  m.is_featured          as is_featured,              
  m.updated_at           as updated_at,      
  m.is_hidden            as is_hidden,
  m.ogp_image_url        as ogp_image_url,
  m.required_artifact_type as required_artifact_type,
  l.sort_no              as link_sort_no
from
  mission_category c
  inner join mission_category_link l on c.id = l.category_id
  inner join missions m on l.mission_id = m.id
where
  c.del_flg = false
  and l.del_flg = false
  and m.is_hidden = false;
