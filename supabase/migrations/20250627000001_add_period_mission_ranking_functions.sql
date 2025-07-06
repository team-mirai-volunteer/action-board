-- 期間別ミッションランキング取得関数の追加

-- 期間別のミッションランキングを取得する関数
CREATE OR REPLACE FUNCTION get_period_mission_ranking(
    p_mission_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    mission_id UUID,
    user_id UUID,
    name TEXT,
    address_prefecture TEXT,
    user_achievement_count BIGINT,
    total_points BIGINT,
    rank BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- 期間指定がない場合は既存の関数を使用
    IF p_start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            p_mission_id AS mission_id,
            mr.user_id::UUID,
            mr.user_name::TEXT AS name,
            mr.address_prefecture::TEXT,
            mr.clear_count::BIGINT AS user_achievement_count,
            mr.total_points::BIGINT,
            mr.rank::BIGINT
        FROM get_mission_ranking(p_mission_id, p_limit) mr;
    ELSE
        -- 期間指定がある場合
        -- POSTINGタイプのミッションかどうか確認
        IF EXISTS (
            SELECT 1 FROM missions m 
            WHERE m.id = p_mission_id 
            AND m.required_artifact_type = 'POSTING'
        ) THEN
            -- POSTINGミッションの場合は posting_activities テーブルから集計
            RETURN QUERY
            WITH period_posting AS (
                SELECT 
                    ma.user_id,
                    COALESCE(SUM(pa.posting_count), 0) AS posting_count
                FROM mission_artifacts ma
                JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
                JOIN achievements a ON a.id = ma.achievement_id
                WHERE pa.created_at >= p_start_date
                AND a.mission_id = p_mission_id
                GROUP BY ma.user_id
            ),
            period_xp AS (
                SELECT
                    xt.user_id,
                    COALESCE(SUM(xt.xp_amount), 0) AS total_xp
                FROM xp_transactions xt
                WHERE xt.created_at >= p_start_date
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
                GROUP BY xt.user_id
            ),
            ranked_users AS (
                SELECT 
                    p_mission_id AS mission_id,
                    pp.user_id,
                    pup.name,
                    pup.address_prefecture,
                    pp.posting_count AS user_achievement_count,
                    COALESCE(px.total_xp, 0) AS total_points,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            COALESCE(px.total_xp, 0) DESC,
                            pp.posting_count DESC,
                            pup.name ASC
                    ) AS rank
                FROM period_posting pp
                JOIN public_user_profiles pup ON pup.id = pp.user_id
                LEFT JOIN period_xp px ON px.user_id = pp.user_id
            )
            SELECT 
                ru.mission_id::UUID,
                ru.user_id::UUID,
                ru.name::TEXT,
                ru.address_prefecture::TEXT,
                ru.user_achievement_count::BIGINT,
                ru.total_points::BIGINT,
                ru.rank::BIGINT
            FROM ranked_users ru
            ORDER BY ru.rank
            LIMIT p_limit;
        ELSE
            -- 通常のミッションの場合は achievements テーブルから集計
            RETURN QUERY
            WITH period_achievements AS (
                SELECT 
                    a.user_id,
                    a.id as achievement_id,
                    a.created_at
                FROM achievements a
                WHERE a.mission_id = p_mission_id
                AND a.created_at >= p_start_date
            ),
            period_stats AS (
                SELECT
                    pa.user_id,
                    COUNT(DISTINCT pa.achievement_id) AS achievement_count,
                    COALESCE(SUM(xt.xp_amount), 0) AS total_mission_points
                FROM period_achievements pa
                LEFT JOIN xp_transactions xt ON
                    xt.user_id = pa.user_id AND
                    xt.source_id = pa.achievement_id AND
                    xt.source_type IN ('MISSION_COMPLETION', 'BONUS') AND
                    xt.created_at >= p_start_date
                GROUP BY pa.user_id
            ),
            ranked_users AS (
                SELECT 
                    p_mission_id AS mission_id,
                    ps.user_id,
                    pup.name,
                    pup.address_prefecture,
                    ps.achievement_count AS user_achievement_count,
                    ps.total_mission_points AS total_points,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            ps.total_mission_points DESC,
                            ps.achievement_count DESC,
                            pup.name ASC
                    ) AS rank
                FROM period_stats ps
                JOIN public_user_profiles pup ON pup.id = ps.user_id
            )
            SELECT 
                ru.mission_id::UUID,
                ru.user_id::UUID,
                ru.name::TEXT,
                ru.address_prefecture::TEXT,
                ru.user_achievement_count::BIGINT,
                ru.total_points::BIGINT,
                ru.rank::BIGINT
            FROM ranked_users ru
            ORDER BY ru.rank
            LIMIT p_limit;
        END IF;
    END IF;
END;
$$;

-- 特定ユーザーの期間別ミッションランキング情報を取得する関数
CREATE OR REPLACE FUNCTION get_user_period_mission_ranking(
    p_mission_id UUID,
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    mission_id UUID,
    user_id UUID,
    name TEXT,
    address_prefecture TEXT,
    user_achievement_count BIGINT,
    total_points BIGINT,
    rank BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- 期間指定がない場合は既存の関数を使用
    IF p_start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            p_mission_id AS mission_id,
            umr.user_id::UUID,
            umr.user_name::TEXT AS name,
            umr.address_prefecture::TEXT,
            umr.clear_count::BIGINT AS user_achievement_count,
            umr.total_points::BIGINT,
            umr.rank::BIGINT
        FROM get_user_mission_ranking(p_mission_id, p_user_id) umr;
    ELSE
        -- 期間指定がある場合
        -- POSTINGタイプのミッションかどうか確認
        IF EXISTS (
            SELECT 1 FROM missions m 
            WHERE m.id = p_mission_id 
            AND m.required_artifact_type = 'POSTING'
        ) THEN
            -- POSTINGミッションの場合
            RETURN QUERY
            WITH period_posting AS (
                SELECT 
                    ma.user_id,
                    COALESCE(SUM(pa.posting_count), 0) AS posting_count
                FROM mission_artifacts ma
                JOIN posting_activities pa ON pa.mission_artifact_id = ma.id
                JOIN achievements a ON a.id = ma.achievement_id
                WHERE pa.created_at >= p_start_date
                AND a.mission_id = p_mission_id
                GROUP BY ma.user_id
            ),
            period_xp AS (
                SELECT
                    xt.user_id,
                    COALESCE(SUM(xt.xp_amount), 0) AS total_xp
                FROM xp_transactions xt
                WHERE xt.created_at >= p_start_date
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
                GROUP BY xt.user_id
            ),
            all_ranked_users AS (
                SELECT 
                    p_mission_id AS mission_id,
                    pp.user_id,
                    pup.name,
                    pup.address_prefecture,
                    pp.posting_count AS user_achievement_count,
                    COALESCE(px.total_xp, 0) AS total_points,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            COALESCE(px.total_xp, 0) DESC,
                            pp.posting_count DESC,
                            pup.name ASC
                    ) AS rank
                FROM period_posting pp
                JOIN public_user_profiles pup ON pup.id = pp.user_id
                LEFT JOIN period_xp px ON px.user_id = pp.user_id
            )
            SELECT 
                aru.mission_id::UUID,
                aru.user_id::UUID,
                aru.name::TEXT,
                aru.address_prefecture::TEXT,
                aru.user_achievement_count::BIGINT,
                aru.total_points::BIGINT,
                aru.rank::BIGINT
            FROM all_ranked_users aru
            WHERE aru.user_id = p_user_id;
        ELSE
            -- 通常のミッションの場合
            RETURN QUERY
            WITH period_achievements AS (
                SELECT 
                    a.user_id,
                    a.id as achievement_id,
                    a.created_at
                FROM achievements a
                WHERE a.mission_id = p_mission_id
                AND a.created_at >= p_start_date
            ),
            period_stats AS (
                SELECT
                    pa.user_id,
                    COUNT(DISTINCT pa.achievement_id) AS achievement_count,
                    COALESCE(SUM(xt.xp_amount), 0) AS total_mission_points
                FROM period_achievements pa
                LEFT JOIN xp_transactions xt ON
                    xt.user_id = pa.user_id AND
                    xt.source_id = pa.achievement_id AND
                    xt.source_type IN ('MISSION_COMPLETION', 'BONUS') AND
                    xt.created_at >= p_start_date
                GROUP BY pa.user_id
            ),
            all_ranked_users AS (
                SELECT 
                    p_mission_id AS mission_id,
                    ps.user_id,
                    pup.name,
                    pup.address_prefecture,
                    ps.achievement_count AS user_achievement_count,
                    ps.total_mission_points AS total_points,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            ps.total_mission_points DESC,
                            ps.achievement_count DESC,
                            pup.name ASC
                    ) AS rank
                FROM period_stats ps
                JOIN public_user_profiles pup ON pup.id = ps.user_id
            )
            SELECT 
                aru.mission_id::UUID,
                aru.user_id::UUID,
                aru.name::TEXT,
                aru.address_prefecture::TEXT,
                aru.user_achievement_count::BIGINT,
                aru.total_points::BIGINT,
                aru.rank::BIGINT
            FROM all_ranked_users aru
            WHERE aru.user_id = p_user_id;
        END IF;
    END IF;
END;
$$;

-- 関数の権限設定
GRANT EXECUTE ON FUNCTION get_period_mission_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_mission_ranking TO authenticated;

COMMENT ON FUNCTION get_period_mission_ranking IS '期間別のミッションランキングを取得する関数';
COMMENT ON FUNCTION get_user_period_mission_ranking IS '特定ユーザーの期間別ミッションランキング情報を取得する関数';