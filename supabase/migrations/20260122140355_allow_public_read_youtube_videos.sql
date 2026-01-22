-- 既存のauthenticated専用ポリシーを削除
DROP POLICY IF EXISTS "youtube_videos_select_policy" ON youtube_videos;
DROP POLICY IF EXISTS "youtube_video_stats_select_policy" ON youtube_video_stats;

-- 公開アクセス可能なポリシーを作成（anon + authenticated）
CREATE POLICY "youtube_videos_public_select" ON youtube_videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "youtube_video_stats_public_select" ON youtube_video_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- anonロールへのSELECT権限を付与
GRANT SELECT ON youtube_videos TO anon;
GRANT SELECT ON youtube_video_stats TO anon;
