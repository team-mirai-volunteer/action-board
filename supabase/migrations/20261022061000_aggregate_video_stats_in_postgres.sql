-- YouTube / TikTok のホーム指標と統計画面が、統計履歴を全行アプリへ転送して
-- JavaScript で合計していた。動画数は数千でも日次スナップショットは数十万行になり、
-- レスポンスが数十 MB になっていた。集計は Postgres で行い、行ではなく合計だけ返す。
--
-- 表示中の数字（合計・日次増加）は src/lib/utils/stats-calculator.ts の
-- calculateDailyViewsIncrease と、各サービスの公開日フィルタに合わせる。
--
-- 公開日の範囲は半開区間 [published_from, published_to)。
-- アプリ側が終了日のローカル翌日を published_to に入れる（従来の setDate(+1) と同じ）。
--
-- 日次増加の「今日」は JST。recorded_at は DATE で、従来の
-- toJstDateString(new Date("YYYY-MM-DD")) は同じ暦日のまま比較していた。
-- 公開日の「今日の投稿」は published_at を Asia/Tokyo の日付に直して数える。
-- 日別投稿数グラフだけは従来どおり published_at の UTC 日付で束ねる
-- （ISO 文字列の "T" より前）。
--
-- 実行は service_role のみ。アプリは createAdminClient から呼ぶ。

-- ---------------------------------------------------------------------------
-- YouTube
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_youtube_stats_summary(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  total_videos bigint,
  total_views bigint,
  total_likes bigint,
  total_comments bigint,
  daily_views_increase bigint,
  daily_videos_increase bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      (NOW() AT TIME ZONE 'Asia/Tokyo')::date AS today,
      ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - 1) AS yesterday,
      ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - 2) AS day_before
  ),
  filtered AS (
    SELECT v.video_id, v.published_at
    FROM public.youtube_videos v
    WHERE v.is_active IS TRUE
      AND (published_from IS NULL OR v.published_at >= published_from)
      AND (published_to IS NULL OR v.published_at < published_to)
  ),
  latest AS (
    SELECT
      f.video_id,
      ls.recorded_at,
      COALESCE(ls.view_count, 0) AS view_count,
      COALESCE(ls.like_count, 0) AS like_count,
      COALESCE(ls.comment_count, 0) AS comment_count
    FROM filtered f
    INNER JOIN LATERAL (
      SELECT s.recorded_at, s.view_count, s.like_count, s.comment_count
      FROM public.youtube_video_stats s
      WHERE s.video_id = f.video_id
      ORDER BY s.recorded_at DESC
      LIMIT 1
    ) ls ON TRUE
  ),
  enriched AS (
    SELECT
      l.view_count,
      l.like_count,
      l.comment_count,
      CASE
        -- 最新が今日 → 昨日の行があればそれ、なければ一昨日。行が NULL なら 0 で、さらに遡らない。
        WHEN l.recorded_at = b.today AND y.video_id IS NOT NULL THEN COALESCE(y.view_count, 0)
        WHEN l.recorded_at = b.today AND d.video_id IS NOT NULL THEN COALESCE(d.view_count, 0)
        -- 最新が昨日 → 一昨日のみ。
        WHEN l.recorded_at = b.yesterday AND d.video_id IS NOT NULL THEN COALESCE(d.view_count, 0)
        ELSE NULL
      END AS comparison_views
    FROM latest l
    CROSS JOIN bounds b
    LEFT JOIN public.youtube_video_stats y
      ON y.video_id = l.video_id
     AND y.recorded_at = b.yesterday
    LEFT JOIN public.youtube_video_stats d
      ON d.video_id = l.video_id
     AND d.recorded_at = b.day_before
  ),
  video_counts AS (
    SELECT
      COUNT(*)::bigint AS total_videos,
      COUNT(*) FILTER (
        WHERE (f.published_at AT TIME ZONE 'Asia/Tokyo')::date = b.today
      )::bigint AS today_videos,
      COUNT(*) FILTER (
        WHERE (f.published_at AT TIME ZONE 'Asia/Tokyo')::date = b.yesterday
      )::bigint AS yesterday_videos
    FROM filtered f
    CROSS JOIN bounds b
  ),
  stat_totals AS (
    SELECT
      COALESCE(SUM(e.view_count), 0)::bigint AS total_views,
      COALESCE(SUM(e.like_count), 0)::bigint AS total_likes,
      COALESCE(SUM(e.comment_count), 0)::bigint AS total_comments,
      COALESCE(SUM(e.comparison_views), 0)::bigint AS comparison_views
    FROM enriched e
  )
  SELECT
    vc.total_videos,
    st.total_views,
    st.total_likes,
    st.total_comments,
    (st.total_views - st.comparison_views)::bigint AS daily_views_increase,
    CASE
      WHEN vc.today_videos > 0 THEN vc.today_videos
      ELSE vc.yesterday_videos
    END AS daily_videos_increase
  FROM video_counts vc
  CROSS JOIN stat_totals st;
$$;

CREATE OR REPLACE FUNCTION public.get_youtube_overall_stats_history(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  date date,
  total_views bigint,
  total_likes bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  -- 従来は recorded_at 昇順の先頭 10,000 行（db-max-rows）だけを日別に足していた。
  -- ここでは期間内のアクティブ動画のスナップショットをすべて日別に合計する。
  -- 本日（JST）以降はグラフに出さない。
  SELECT
    s.recorded_at AS date,
    COALESCE(SUM(s.view_count), 0)::bigint AS total_views,
    COALESCE(SUM(s.like_count), 0)::bigint AS total_likes
  FROM public.youtube_video_stats s
  INNER JOIN public.youtube_videos v ON v.video_id = s.video_id
  WHERE v.is_active IS TRUE
    AND (published_from IS NULL OR v.published_at >= published_from)
    AND (published_to IS NULL OR v.published_at < published_to)
    AND s.recorded_at < (NOW() AT TIME ZONE 'Asia/Tokyo')::date
  GROUP BY s.recorded_at
  ORDER BY s.recorded_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_youtube_video_count_by_date(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  date date,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (v.published_at AT TIME ZONE 'UTC')::date AS date,
    COUNT(*)::bigint AS count
  FROM public.youtube_videos v
  WHERE v.is_active IS TRUE
    AND v.published_at IS NOT NULL
    AND (published_from IS NULL OR v.published_at >= published_from)
    AND (published_to IS NULL OR v.published_at < published_to)
  GROUP BY 1
  ORDER BY 1 ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_youtube_videos_with_latest_stats(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL,
  sort_by text DEFAULT 'published_at',
  result_limit integer DEFAULT 40,
  result_offset integer DEFAULT 0
)
RETURNS TABLE (
  channel_id text,
  channel_title text,
  comments_synced_at timestamptz,
  created_at timestamptz,
  description text,
  duration text,
  is_active boolean,
  published_at timestamptz,
  tags text[],
  thumbnail_url text,
  title text,
  updated_at timestamptz,
  video_id text,
  video_url text,
  latest_view_count bigint,
  latest_like_count bigint,
  latest_comment_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT
      v.channel_id,
      v.channel_title,
      v.comments_synced_at,
      v.created_at,
      v.description,
      v.duration,
      v.is_active,
      v.published_at,
      v.tags,
      v.thumbnail_url,
      v.title,
      v.updated_at,
      v.video_id,
      v.video_url
    FROM public.youtube_videos v
    WHERE v.is_active IS TRUE
      AND (published_from IS NULL OR v.published_at >= published_from)
      AND (published_to IS NULL OR v.published_at < published_to)
  ),
  with_latest AS (
    SELECT
      f.channel_id,
      f.channel_title,
      f.comments_synced_at,
      f.created_at,
      f.description,
      f.duration,
      f.is_active,
      f.published_at,
      f.tags,
      f.thumbnail_url,
      f.title,
      f.updated_at,
      f.video_id,
      f.video_url,
      ls.view_count AS latest_view_count,
      ls.like_count AS latest_like_count,
      ls.comment_count AS latest_comment_count
    FROM filtered f
    LEFT JOIN LATERAL (
      SELECT s.view_count, s.like_count, s.comment_count
      FROM public.youtube_video_stats s
      WHERE s.video_id = f.video_id
      ORDER BY s.recorded_at DESC
      LIMIT 1
    ) ls ON TRUE
  )
  SELECT
    q.channel_id,
    q.channel_title,
    q.comments_synced_at,
    q.created_at,
    q.description,
    q.duration,
    q.is_active,
    q.published_at,
    q.tags,
    q.thumbnail_url,
    q.title,
    q.updated_at,
    q.video_id,
    q.video_url,
    q.latest_view_count,
    q.latest_like_count,
    q.latest_comment_count
  FROM with_latest q
  ORDER BY
    CASE
      WHEN sort_by = 'view_count' THEN COALESCE(q.latest_view_count, 0)
    END DESC,
    CASE
      WHEN sort_by = 'like_count' THEN COALESCE(q.latest_like_count, 0)
    END DESC,
    q.published_at DESC NULLS LAST,
    q.video_id ASC
  LIMIT GREATEST(COALESCE(result_limit, 40), 0)
  OFFSET GREATEST(COALESCE(result_offset, 0), 0);
$$;

-- ---------------------------------------------------------------------------
-- TikTok
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_tiktok_stats_summary(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  total_videos bigint,
  total_views bigint,
  total_likes bigint,
  total_comments bigint,
  total_shares bigint,
  daily_views_increase bigint,
  daily_videos_increase bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      (NOW() AT TIME ZONE 'Asia/Tokyo')::date AS today,
      ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - 1) AS yesterday,
      ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - 2) AS day_before
  ),
  filtered AS (
    SELECT v.id, v.published_at
    FROM public.tiktok_videos v
    WHERE v.is_active IS TRUE
      AND (published_from IS NULL OR v.published_at >= published_from)
      AND (published_to IS NULL OR v.published_at < published_to)
  ),
  latest AS (
    SELECT
      f.id,
      ls.recorded_at,
      COALESCE(ls.view_count, 0) AS view_count,
      COALESCE(ls.like_count, 0) AS like_count,
      COALESCE(ls.comment_count, 0) AS comment_count,
      COALESCE(ls.share_count, 0) AS share_count
    FROM filtered f
    INNER JOIN LATERAL (
      SELECT
        s.recorded_at,
        s.view_count,
        s.like_count,
        s.comment_count,
        s.share_count
      FROM public.tiktok_video_stats s
      WHERE s.tiktok_video_id = f.id
      ORDER BY s.recorded_at DESC
      LIMIT 1
    ) ls ON TRUE
  ),
  enriched AS (
    SELECT
      l.view_count,
      l.like_count,
      l.comment_count,
      l.share_count,
      CASE
        WHEN l.recorded_at = b.today AND y.tiktok_video_id IS NOT NULL THEN COALESCE(y.view_count, 0)
        WHEN l.recorded_at = b.today AND d.tiktok_video_id IS NOT NULL THEN COALESCE(d.view_count, 0)
        WHEN l.recorded_at = b.yesterday AND d.tiktok_video_id IS NOT NULL THEN COALESCE(d.view_count, 0)
        ELSE NULL
      END AS comparison_views
    FROM latest l
    CROSS JOIN bounds b
    LEFT JOIN public.tiktok_video_stats y
      ON y.tiktok_video_id = l.id
     AND y.recorded_at = b.yesterday
    LEFT JOIN public.tiktok_video_stats d
      ON d.tiktok_video_id = l.id
     AND d.recorded_at = b.day_before
  ),
  video_counts AS (
    SELECT
      COUNT(*)::bigint AS total_videos,
      COUNT(*) FILTER (
        WHERE (f.published_at AT TIME ZONE 'Asia/Tokyo')::date = b.today
      )::bigint AS today_videos,
      COUNT(*) FILTER (
        WHERE (f.published_at AT TIME ZONE 'Asia/Tokyo')::date = b.yesterday
      )::bigint AS yesterday_videos
    FROM filtered f
    CROSS JOIN bounds b
  ),
  stat_totals AS (
    SELECT
      COALESCE(SUM(e.view_count), 0)::bigint AS total_views,
      COALESCE(SUM(e.like_count), 0)::bigint AS total_likes,
      COALESCE(SUM(e.comment_count), 0)::bigint AS total_comments,
      COALESCE(SUM(e.share_count), 0)::bigint AS total_shares,
      COALESCE(SUM(e.comparison_views), 0)::bigint AS comparison_views
    FROM enriched e
  )
  SELECT
    vc.total_videos,
    st.total_views,
    st.total_likes,
    st.total_comments,
    st.total_shares,
    (st.total_views - st.comparison_views)::bigint AS daily_views_increase,
    CASE
      WHEN vc.today_videos > 0 THEN vc.today_videos
      ELSE vc.yesterday_videos
    END AS daily_videos_increase
  FROM video_counts vc
  CROSS JOIN stat_totals st;
$$;

CREATE OR REPLACE FUNCTION public.get_tiktok_overall_stats_history(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  date date,
  total_views bigint,
  total_likes bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.recorded_at AS date,
    COALESCE(SUM(s.view_count), 0)::bigint AS total_views,
    COALESCE(SUM(s.like_count), 0)::bigint AS total_likes
  FROM public.tiktok_video_stats s
  INNER JOIN public.tiktok_videos v ON v.id = s.tiktok_video_id
  WHERE v.is_active IS TRUE
    AND (published_from IS NULL OR v.published_at >= published_from)
    AND (published_to IS NULL OR v.published_at < published_to)
    AND s.recorded_at < (NOW() AT TIME ZONE 'Asia/Tokyo')::date
  GROUP BY s.recorded_at
  ORDER BY s.recorded_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_tiktok_video_count_by_date(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL
)
RETURNS TABLE (
  date date,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (v.published_at AT TIME ZONE 'UTC')::date AS date,
    COUNT(*)::bigint AS count
  FROM public.tiktok_videos v
  WHERE v.is_active IS TRUE
    AND v.published_at IS NOT NULL
    AND (published_from IS NULL OR v.published_at >= published_from)
    AND (published_to IS NULL OR v.published_at < published_to)
  GROUP BY 1
  ORDER BY 1 ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_tiktok_videos_with_latest_stats(
  published_from timestamptz DEFAULT NULL,
  published_to timestamptz DEFAULT NULL,
  sort_by text DEFAULT 'published_at',
  result_limit integer DEFAULT 40,
  result_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  video_id text,
  user_id uuid,
  creator_id text,
  creator_username text,
  title text,
  description text,
  thumbnail_url text,
  video_url text,
  published_at timestamptz,
  duration integer,
  tags text[],
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  latest_view_count bigint,
  latest_like_count bigint,
  latest_comment_count bigint,
  latest_share_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT
      v.id,
      v.video_id,
      v.user_id,
      v.creator_id,
      v.creator_username,
      v.title,
      v.description,
      v.thumbnail_url,
      v.video_url,
      v.published_at,
      v.duration,
      v.tags,
      v.is_active,
      v.created_at,
      v.updated_at
    FROM public.tiktok_videos v
    WHERE v.is_active IS TRUE
      AND (published_from IS NULL OR v.published_at >= published_from)
      AND (published_to IS NULL OR v.published_at < published_to)
  ),
  with_latest AS (
    SELECT
      f.id,
      f.video_id,
      f.user_id,
      f.creator_id,
      f.creator_username,
      f.title,
      f.description,
      f.thumbnail_url,
      f.video_url,
      f.published_at,
      f.duration,
      f.tags,
      f.is_active,
      f.created_at,
      f.updated_at,
      ls.view_count AS latest_view_count,
      ls.like_count AS latest_like_count,
      ls.comment_count AS latest_comment_count,
      ls.share_count AS latest_share_count
    FROM filtered f
    LEFT JOIN LATERAL (
      SELECT s.view_count, s.like_count, s.comment_count, s.share_count
      FROM public.tiktok_video_stats s
      WHERE s.tiktok_video_id = f.id
      ORDER BY s.recorded_at DESC
      LIMIT 1
    ) ls ON TRUE
  )
  SELECT
    q.id,
    q.video_id,
    q.user_id,
    q.creator_id,
    q.creator_username,
    q.title,
    q.description,
    q.thumbnail_url,
    q.video_url,
    q.published_at,
    q.duration,
    q.tags,
    q.is_active,
    q.created_at,
    q.updated_at,
    q.latest_view_count,
    q.latest_like_count,
    q.latest_comment_count,
    q.latest_share_count
  FROM with_latest q
  ORDER BY
    CASE
      WHEN sort_by = 'view_count' THEN COALESCE(q.latest_view_count, 0)
    END DESC,
    CASE
      WHEN sort_by = 'like_count' THEN COALESCE(q.latest_like_count, 0)
    END DESC,
    q.published_at DESC NULLS LAST,
    q.video_id ASC
  LIMIT GREATEST(COALESCE(result_limit, 40), 0)
  OFFSET GREATEST(COALESCE(result_offset, 0), 0);
$$;

REVOKE ALL ON FUNCTION public.get_youtube_stats_summary(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_youtube_overall_stats_history(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_youtube_video_count_by_date(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_youtube_videos_with_latest_stats(timestamptz, timestamptz, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_tiktok_stats_summary(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_tiktok_overall_stats_history(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_tiktok_video_count_by_date(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_tiktok_videos_with_latest_stats(timestamptz, timestamptz, text, integer, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_youtube_stats_summary(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_youtube_overall_stats_history(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_youtube_video_count_by_date(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_youtube_videos_with_latest_stats(timestamptz, timestamptz, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_tiktok_stats_summary(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_tiktok_overall_stats_history(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_tiktok_video_count_by_date(timestamptz, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_tiktok_videos_with_latest_stats(timestamptz, timestamptz, text, integer, integer) TO service_role;

COMMENT ON FUNCTION public.get_youtube_stats_summary(timestamptz, timestamptz) IS
  'アクティブな YouTube 動画の再生数・いいね・コメントと日次増加を DB 側で集計する。統計履歴は返さない。';
COMMENT ON FUNCTION public.get_tiktok_stats_summary(timestamptz, timestamptz) IS
  'アクティブな TikTok 動画の再生数・いいね・コメント・シェアと日次増加を DB 側で集計する。統計履歴は返さない。';
