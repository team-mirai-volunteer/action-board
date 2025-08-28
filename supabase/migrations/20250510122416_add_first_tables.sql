-- ユーザー登録時に情報を保存するテーブル。ユーザー本人のみ追加・閲覧・更新可能
CREATE TABLE private_users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address_prefecture VARCHAR(4) NOT NULL,
    date_of_birth DATE NOT NULL,
    x_username VARCHAR(200),
    avatar_url VARCHAR(500),
    postcode VARCHAR(7) NOT NULL,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE private_users IS '認証済みユーザーが登録・更新する個人情報(センシティブ情報を含む)';
COMMENT ON COLUMN private_users.id IS 'ユーザーのUUID。主キー';
COMMENT ON COLUMN private_users.name IS 'ユーザーの氏名';
COMMENT ON COLUMN private_users.address_prefecture IS '都道府県(例：東京都)';
COMMENT ON COLUMN private_users.date_of_birth IS '生年月日。年齢確認のために必要';
COMMENT ON COLUMN private_users.x_username IS 'X(旧Twitter)のユーザー名。NULL可能';
COMMENT ON COLUMN private_users.avatar_url IS 'ユーザープロフィール画像のURL。NULL可能';
COMMENT ON COLUMN private_users.postcode IS '郵便番号。ハイフンなしの7桁(例:1000001) サービス上に露出させない';
COMMENT ON COLUMN private_users.created_at IS 'レコード作成日時(UTC)';
COMMENT ON COLUMN private_users.updated_at IS 'レコード更新日時(UTC)';

-- RLS設定
ALTER TABLE private_users ENABLE ROW LEVEL SECURITY;
-- private_usersへの追加は、認証したユーザーのみが行える
CREATE POLICY insert_own_user
  ON private_users FOR INSERT
  WITH CHECK (auth.uid() = id);
-- private_usersからの読み込みは、認証したユーザーのみが行える
CREATE POLICY select_own_user
  ON private_users FOR SELECT
  USING (auth.uid() = id);
-- private_usersへの更新は、認証したユーザーのみが行える
CREATE POLICY update_own_user
  ON private_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ユーザーの公開プロフィールテーブル、カラム定義はprivate_usersの一部を取り出した形
create table public_user_profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address_prefecture VARCHAR(4) NOT NULL,
  x_username VARCHAR(200),
  avatar_url VARCHAR(500),
  created_at timestamptz not null
);

COMMENT ON COLUMN public_user_profiles.id IS 'ユーザーのUUID。主キー。private_users.idと同じ値がセットされる';
COMMENT ON COLUMN public_user_profiles.avatar_url IS 'ユーザープロフィール画像のURL。NULL可能';

-- RLS設定
ALTER TABLE public_user_profiles ENABLE ROW LEVEL SECURITY;
-- すべてのユーザーに読み込みは許可
CREATE POLICY select_all_public_user_profiles
  ON public_user_profiles FOR SELECT
  USING (true);

-- アプリケーション経由からの直接書き込みを禁止し、トリガー関数からのみ更新可能にするポリシー
CREATE POLICY insert_trigger_only_public_user_profiles
  ON public_user_profiles FOR INSERT
  WITH CHECK (current_setting('my.is_trigger', true)::boolean = true);

CREATE POLICY update_trigger_only_public_user_profiles
  ON public_user_profiles FOR UPDATE
  USING (current_setting('my.is_trigger', true)::boolean = true);

-- プロフィール画像用のストレージバケットを作成
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- パブリックアクセス可能に変更
  false, -- avif自動検出無効
  5242880, -- ファイルサイズ制限 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- 許可するMIMEタイプ
);

-- プロフィール画像用のRLSポリシーを設定
-- 認証ユーザーのみアップロード可能、かつ自分のIDをパスに含むものだけ
CREATE POLICY "authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text -- ユーザー自身のIDディレクトリのみ
  );

-- ユーザー自身のプロフィール画像は参照（SELECT）が可能
CREATE POLICY "users can view their own avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text -- ユーザー自身のIDディレクトリのみ
  );

-- URLを知っていれば誰でも参照可能にする（プロフィール画面表示などのため）
CREATE POLICY "anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 自分のプロフィール画像のみ更新（上書きアップロード）可能
CREATE POLICY "authenticated users can update their own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text -- ユーザー自身のIDディレクトリのみ
  );

-- 自分のプロフィール画像のみ削除可能
CREATE POLICY "authenticated users can delete their own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text -- ユーザー自身のIDディレクトリのみ
  );

-- トリガーで更新
create or replace function sync_public_user_profile()
returns trigger as $$
begin
  -- トリガーからの実行であることを示すカスタム設定を追加
  PERFORM set_config('my.is_trigger', 'true', true);
  
  -- INSERT or UPDATE の場合は upsert
  insert into public_user_profiles (id, name, address_prefecture, x_username, avatar_url, created_at)
  values (new.id, new.name, new.address_prefecture, new.x_username, new.avatar_url, new.created_at)
  on conflict (id) do update
  set name = excluded.name,
      address_prefecture = excluded.address_prefecture,
      x_username = excluded.x_username,
      avatar_url = excluded.avatar_url,
      created_at = excluded.created_at;

  -- カスタム設定をリセット
  PERFORM set_config('my.is_trigger', 'false', true);
  
  return new;
end;
$$ language plpgsql security definer;  -- SECURITY DEFINERに変更

create trigger trg_sync_public_user_profile
after insert or update on private_users
for each row
execute function sync_public_user_profile();


-- ミッションを保持するテーブル。
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    icon_url VARCHAR(500),
    content TEXT,
    difficulty INTEGER NOT NULL,
    event_date DATE,
    required_artifact_type TEXT DEFAULT 'NONE' NOT NULL,
    max_achievement_count INTEGER, -- 追加: 最大達成回数 (NULLの場合は無制限)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE missions IS '達成可能なミッション情報';
COMMENT ON COLUMN missions.id IS 'ミッションID';
COMMENT ON COLUMN missions.title IS 'ミッションのタイトル';
COMMENT ON COLUMN missions.icon_url IS 'アイコン画像URL(NULL可能)';
COMMENT ON COLUMN missions.content IS '説明文(Markdown対応)';
COMMENT ON COLUMN missions.required_artifact_type IS 'ミッション達成に必要な成果物の種類 (LINK, IMAGE, NONE)';
COMMENT ON COLUMN missions.max_achievement_count IS 'ミッションの最大達成可能回数。NULLの場合は無制限。'; -- 追加
COMMENT ON COLUMN missions.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN missions.updated_at IS '更新日時(UTC)';

-- RLS設定
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_missions
  ON missions FOR SELECT
  USING (true);
-- それ以外は許可しない


-- ミッション達成を保持するテーブル。
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id),
    user_id UUID REFERENCES public_user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE achievements IS 'ユーザーによるミッション達成の記録';
COMMENT ON COLUMN achievements.mission_id IS '達成したミッションのID';
COMMENT ON COLUMN achievements.user_id IS 'ミッションを達成したユーザーのID';
COMMENT ON COLUMN achievements.created_at IS '記録日時(UTC)';

-- RLS設定
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
-- ミッション達成は、その本人だけが追加できる
CREATE POLICY insert_own_achievement
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_achievements
  ON achievements FOR SELECT
  USING (true);
-- ミッション達成は、その本人だけが削除できる
CREATE POLICY delete_own_achievement
  ON achievements FOR DELETE
  USING (auth.uid() = user_id);


-- ミッション成果物を保持するテーブル (新規追加)
CREATE TABLE mission_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public_user_profiles(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL, -- 'LINK', 'IMAGE', 'IMAGE_WITH_GEOLOCATION'
    link_url TEXT,
    image_storage_path TEXT, -- Supabase Storage内のパス
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_artifact_type CHECK (artifact_type IN ('LINK', 'IMAGE', 'IMAGE_WITH_GEOLOCATION')), -- 変更
    CONSTRAINT ensure_link_or_image CHECK ( -- 変更: IMAGE_WITH_GEOLOCATION も image_storage_path が必須
        (artifact_type = 'LINK' AND link_url IS NOT NULL AND image_storage_path IS NULL) OR
        (artifact_type = 'IMAGE' AND image_storage_path IS NOT NULL AND link_url IS NULL) OR
        (artifact_type = 'IMAGE_WITH_GEOLOCATION' AND image_storage_path IS NOT NULL AND link_url IS NULL)
    )
);

COMMENT ON TABLE mission_artifacts IS 'ミッション達成時に提出された成果物';
COMMENT ON COLUMN mission_artifacts.id IS '成果物ID';
COMMENT ON COLUMN mission_artifacts.achievement_id IS '関連するミッション達成記録のID';
COMMENT ON COLUMN mission_artifacts.user_id IS '成果物を提出したユーザーのID';
COMMENT ON COLUMN mission_artifacts.artifact_type IS '提出された成果物の種類 (LINK, IMAGE)';
COMMENT ON COLUMN mission_artifacts.link_url IS '成果物がリンクの場合のURL';
COMMENT ON COLUMN mission_artifacts.image_storage_path IS '成果物が画像の場合のStorageパス';
COMMENT ON COLUMN mission_artifacts.description IS '成果物に関する補足説明';
COMMENT ON COLUMN mission_artifacts.created_at IS 'レコード作成日時(UTC)';
COMMENT ON COLUMN mission_artifacts.updated_at IS 'レコード更新日時(UTC)';

-- mission_artifacts テーブルのRLS設定 (新規追加)
ALTER TABLE mission_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mission artifacts"
  ON mission_artifacts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- インデックス作成 (新規追加)
CREATE INDEX idx_mission_artifacts_achievement_id ON mission_artifacts(achievement_id);
CREATE INDEX idx_mission_artifacts_user_id ON mission_artifacts(user_id);

-- 位置情報を保持するテーブル (新規追加)
CREATE TABLE mission_artifact_geolocations (
    id BIGSERIAL PRIMARY KEY,
    mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
    lat DECIMAL(9,6) NOT NULL,
    lon DECIMAL(9,6) NOT NULL,
    accuracy DOUBLE PRECISION,
    altitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE mission_artifact_geolocations IS '成果物の位置情報';
COMMENT ON COLUMN mission_artifact_geolocations.id IS '位置情報ID';
COMMENT ON COLUMN mission_artifact_geolocations.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN mission_artifact_geolocations.lat IS '緯度';
COMMENT ON COLUMN mission_artifact_geolocations.lon IS '経度';
COMMENT ON COLUMN mission_artifact_geolocations.accuracy IS '位置精度(メートル)';
COMMENT ON COLUMN mission_artifact_geolocations.altitude IS '高度(メートル)';
COMMENT ON COLUMN mission_artifact_geolocations.created_at IS '記録日時(UTC)';

-- mission_artifact_geolocations テーブルのRLS設定 (新規追加)
-- 基本的には mission_artifacts のRLSに依存するが、直接アクセスされる可能性も考慮
ALTER TABLE mission_artifact_geolocations ENABLE ROW LEVEL SECURITY;

-- 成果物の所有者のみが関連する位置情報を参照・操作可能 (mission_artifacts経由でのアクセスを主とする)
CREATE POLICY "Users can manage geolocations linked to their artifacts"
  ON mission_artifact_geolocations
  FOR ALL
  USING (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  );

CREATE INDEX idx_mission_artifact_geolocations_mission_artifact_id ON mission_artifact_geolocations(mission_artifact_id);


-- 活動タイムラインに表示するためのView
CREATE VIEW activity_timeline_view AS
SELECT
  a.id,
  p.id as user_id,
  p.name,
  p.address_prefecture,
  p.avatar_url,
  m.title,
  a.created_at
FROM achievements a
JOIN public_user_profiles p ON a.user_id = p.id
JOIN missions m ON a.mission_id = m.id;

-- ミッション達成数を取得するView
CREATE VIEW mission_achievement_count_view AS
SELECT
  m.id as mission_id,
  COUNT(a.id) as achievement_count
FROM missions m
LEFT JOIN achievements a ON m.id = a.mission_id
GROUP BY m.id;

-- イベント
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE events IS 'イベント情報(外部API取得の可能性あり)';
COMMENT ON COLUMN events.id IS 'イベントID';
COMMENT ON COLUMN events.title IS 'イベント名';
COMMENT ON COLUMN events.url IS '外部イベントURL';
COMMENT ON COLUMN events.starts_at IS '開催日時(UTC)';
COMMENT ON COLUMN events.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN events.updated_at IS '更新日時(UTC)';

-- RLS設定
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_events
  ON events FOR SELECT
  USING (true);


-- 日次アクション数
CREATE TABLE daily_action_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE daily_action_summary IS '日単位のアクション件数';
COMMENT ON COLUMN daily_action_summary.date IS '集計日';
COMMENT ON COLUMN daily_action_summary.count IS '累計アクション数';
COMMENT ON COLUMN daily_action_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_action_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_action_summary
  ON daily_action_summary FOR SELECT
  USING (true);


-- 日次ダッシュボード登録人数
CREATE TABLE daily_dashboard_registration_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE daily_dashboard_registration_summary IS '日単位のダッシュボード登録人数';
COMMENT ON COLUMN daily_dashboard_registration_summary.date IS '集計日';
COMMENT ON COLUMN daily_dashboard_registration_summary.count IS '累計登録人数';
COMMENT ON COLUMN daily_dashboard_registration_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_dashboard_registration_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_dashboard_registration_summary
  ON daily_dashboard_registration_summary FOR SELECT
  USING (true);


-- 週次イベント開催数
CREATE TABLE weekly_event_count_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE weekly_event_count_summary IS '週単位のイベント開催数';
COMMENT ON COLUMN weekly_event_count_summary.date IS '集計日(週単位)';
COMMENT ON COLUMN weekly_event_count_summary.count IS '累計イベント開催数';
COMMENT ON COLUMN weekly_event_count_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE weekly_event_count_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_weekly_event_count_summary
  ON weekly_event_count_summary FOR SELECT
  USING (true);


-- 日次都道府県ごとのダッシュボード登録人数
CREATE TABLE daily_dashboard_registration_by_prefecture_summary (
    date DATE,
    prefecture VARCHAR(4),
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (date, prefecture)
);

COMMENT ON TABLE daily_dashboard_registration_by_prefecture_summary IS '日単位の都道府県別ダッシュボード登録人数';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.date IS '集計日';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.prefecture IS '都道府県名';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.count IS '登録人数';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_dashboard_registration_by_prefecture_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_dashboard_registration_by_prefecture_summary
  ON daily_dashboard_registration_by_prefecture_summary FOR SELECT
  USING (true);


-- 週次都道府県ごとのイベント開催数
CREATE TABLE weekly_event_count_by_prefecture_summary (
    date DATE,
    prefecture VARCHAR(4),
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (date, prefecture)
);

COMMENT ON TABLE weekly_event_count_by_prefecture_summary IS '週単位の都道府県別イベント開催数';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.date IS '集計日';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.prefecture IS '都道府県名';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.count IS 'イベント開催数';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE weekly_event_count_by_prefecture_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_weekly_event_count_by_prefecture_summary
  ON weekly_event_count_by_prefecture_summary FOR SELECT
  USING (true);

-- ミッション成果物ファイル用のストレージバケットを作成 (新規追加)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'mission_artifact_files', -- 変更
  'mission_artifact_files', -- 変更
  false, -- 非公開バケットとして作成 (RLSで制御)
  false,
  10485760, -- ファイルサイズ制限 10MB (例)
  NULL -- 全てのMIMEタイプを許可 (または必要に応じて指定)
) ON CONFLICT (id) DO NOTHING; -- 既に存在する場合は何もしない

-- mission_artifact_files バケットのRLSポリシー (新規追加)
-- 認証ユーザーは、自身のuser_idをパスに含むオブジェクトのみ挿入可能
CREATE POLICY "Users can upload their own mission artifact files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'mission_artifact_files' AND -- 変更
    (storage.foldername(name))[1] = auth.uid()::text -- パスの第一階層がuser_id
    -- 必要に応じて、(storage.foldername(name))[2] で achievement_id もチェック
  );

-- 認証ユーザーは、自身のuser_idをパスに含むオブジェクトのみ参照可能
CREATE POLICY "Users can select their own mission artifact files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'mission_artifact_files' AND -- 変更
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 認証ユーザーは、自身のuser_idをパスに含むオブジェクトのみ更新可能
CREATE POLICY "Users can update their own mission artifact files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'mission_artifact_files' AND -- 変更
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'mission_artifact_files' AND -- 変更
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 認証ユーザーは、自身のuser_idをパスに含むオブジェクトのみ削除可能
CREATE POLICY "Users can delete their own mission artifact files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'mission_artifact_files' AND -- 変更
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- 本番データ
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('05814416-9cd8-4582-a940-ced9a832efee', '動画を切り抜いてYoutubeショートにアップロードしよう', '/img/mission_fallback_icon.png', '動画を切り抜いてYoutubeショートにアップロードしてください。そのURLを教えてください。', 2, NULL, 'LINK', NULL),
  ('41dedf9a-2290-4609-bb73-5469ee8dd909', 'いどばた政策サイトからマニフェストに提案しよう', '/img/mission_fallback_icon.png', '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>サイトにアクセスし、マニフェストについて提案してみてください。提案できたURLを教えてください。', 3, NULL, 'LINK', NULL),
  ('56c03661-8243-42c6-bf81-9dba56c5abfe', 'マニフェストの感想をSNSでシェアしよう', '/img/mission_fallback_icon.png', '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>にアクセスし、マニフェストを読んだ感想をSNSでシェアしてください。シェアしたURLを教えてください。', 3, NULL, 'LINK', NULL),
  ('2c5f7173-48be-4989-9d1b-c749fd56ae44', 'チームはやまの公式Xをフォローしよう', '/img/mission_fallback_icon.png', '<a href="https://x.com/team_mirai_jp">チームはやま</a>の公式Xをフォローしてください。', 1, NULL, 'NONE', NULL),
  ('0f4f16e5-35eb-4756-a966-607895a61b0e', '安野たかひろの公式Xをフォローしよう', '/img/mission_fallback_icon.png', '<a href="https://x.com/takahiroanno">安野たかひろ</a>の公式Xをフォローしてください。', 1, NULL, 'NONE', NULL),  
  ('9071a1eb-e272-43be-9c6b-e08b258a41c3', '公式Youtubeチャンネルを登録しよう', '/img/mission_fallback_icon.png', '<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw">チームはやまの公式Youtubeチャンネル</a>をチャンネル登録してください。', 1, NULL, 'NONE', NULL),
  ('e7a03d8b-ef29-406f-b2fb-065285855997', '公式LINEアカウントを友達申請しよう', '/img/mission_fallback_icon.png', '<a href="https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204">チームはやまのLINEアカウント</a>に友達申請してください。', 1, NULL, 'NONE', NULL);
