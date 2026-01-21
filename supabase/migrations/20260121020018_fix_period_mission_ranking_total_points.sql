-- Fix total_points calculation in get_period_mission_ranking
-- The previous implementation used hardcoded values (posting_count * 10 or count * 10)
-- instead of fetching actual XP from xp_transactions table

-- Drop existing functions
DROP FUNCTION IF EXISTS get_period_mission_ranking(UUID, INTEGER, TIMESTAMPTZ, UUID);
DROP FUNCTION IF EXISTS get_user_period_mission_ranking(UUID, UUID, TIMESTAMPTZ, UUID);

-- Recreate get_period_mission_ranking with correct total_points calculation
CREATE OR REPLACE FUNCTION get_period_mission_ranking(
    p_mission_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    mission_id UUID,
    user_id UUID,
    user_name TEXT,
    address_prefecture TEXT,
    user_achievement_count BIGINT,
    total_points BIGINT,
    rank BIGINT,
    level INTEGER,
    xp BIGINT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Season-based ranking takes priority
    IF p_season_id IS NOT NULL THEN
        RETURN QUERY
        WITH achievement_stats AS (
            SELECT
                a.user_id,
                COUNT(DISTINCT a.id) AS achievement_count,
                COALESCE(SUM(pa.posting_count), 0) AS total_posting_count,
                COALESCE(SUM(xt.xp_amount), 0) AS total_xp
            FROM achievements a
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            LEFT JOIN xp_transactions xt ON xt.source_id = a.id
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
            WHERE a.mission_id = p_mission_id
            AND a.season_id = p_season_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id
        )
        SELECT
            p_mission_id as mission_id,
            ast.user_id,
            pup.name::TEXT as user_name,
            pup.address_prefecture::TEXT,
            CASE
                WHEN ast.total_posting_count > 0 THEN ast.total_posting_count
                ELSE ast.achievement_count
            END::BIGINT as user_achievement_count,
            ast.total_xp::BIGINT as total_points,
            RANK() OVER (ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC)::BIGINT as rank,
            ul.level,
            ul.xp::BIGINT,
            ul.updated_at
        FROM achievement_stats ast
        JOIN public_user_profiles pup ON ast.user_id = pup.id
        LEFT JOIN user_levels ul ON ast.user_id = ul.user_id AND ul.season_id = p_season_id
        ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC
        LIMIT p_limit;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH achievement_stats AS (
            SELECT
                a.user_id,
                COUNT(DISTINCT a.id) AS achievement_count,
                COALESCE(SUM(pa.posting_count), 0) AS total_posting_count,
                COALESCE(SUM(xt.xp_amount), 0) AS total_xp
            FROM achievements a
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            LEFT JOIN xp_transactions xt ON xt.source_id = a.id
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
            WHERE a.mission_id = p_mission_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id
        ),
        latest_user_levels AS (
            SELECT DISTINCT ON (ul.user_id)
                ul.user_id,
                ul.level,
                ul.xp,
                ul.updated_at
            FROM user_levels ul
            ORDER BY ul.user_id, ul.updated_at DESC
        )
        SELECT
            p_mission_id as mission_id,
            ast.user_id,
            pup.name::TEXT as user_name,
            pup.address_prefecture::TEXT,
            CASE
                WHEN ast.total_posting_count > 0 THEN ast.total_posting_count
                ELSE ast.achievement_count
            END::BIGINT as user_achievement_count,
            ast.total_xp::BIGINT as total_points,
            RANK() OVER (ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC)::BIGINT as rank,
            COALESCE(lul.level, 1) as level,
            COALESCE(lul.xp, 0)::BIGINT,
            COALESCE(lul.updated_at, now()) as updated_at
        FROM achievement_stats ast
        JOIN public_user_profiles pup ON ast.user_id = pup.id
        LEFT JOIN latest_user_levels lul ON ast.user_id = lul.user_id
        ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC
        LIMIT p_limit;
    END IF;
END;
$$;

-- Recreate get_user_period_mission_ranking with correct total_points calculation
CREATE OR REPLACE FUNCTION get_user_period_mission_ranking(
    p_mission_id UUID,
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    mission_id UUID,
    user_id UUID,
    user_name TEXT,
    address_prefecture TEXT,
    user_achievement_count BIGINT,
    total_points BIGINT,
    rank BIGINT,
    level INTEGER,
    xp BIGINT,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Season-based ranking takes priority
    IF p_season_id IS NOT NULL THEN
        RETURN QUERY
        WITH achievement_stats AS (
            SELECT
                a.user_id,
                COUNT(DISTINCT a.id) AS achievement_count,
                COALESCE(SUM(pa.posting_count), 0) AS total_posting_count,
                COALESCE(SUM(xt.xp_amount), 0) AS total_xp
            FROM achievements a
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            LEFT JOIN xp_transactions xt ON xt.source_id = a.id
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
            WHERE a.mission_id = p_mission_id
            AND a.season_id = p_season_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id
        ),
        ranked_stats AS (
            SELECT
                p_mission_id as mission_id,
                ast.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                CASE
                    WHEN ast.total_posting_count > 0 THEN ast.total_posting_count
                    ELSE ast.achievement_count
                END::BIGINT as user_achievement_count,
                ast.total_xp::BIGINT as total_points,
                RANK() OVER (ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC)::BIGINT as rank,
                ul.level,
                ul.xp::BIGINT,
                ul.updated_at
            FROM achievement_stats ast
            JOIN public_user_profiles pup ON ast.user_id = pup.id
            LEFT JOIN user_levels ul ON ast.user_id = ul.user_id AND ul.season_id = p_season_id
        )
        SELECT rs.*
        FROM ranked_stats rs
        WHERE rs.user_id = p_user_id;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH achievement_stats AS (
            SELECT
                a.user_id,
                COUNT(DISTINCT a.id) AS achievement_count,
                COALESCE(SUM(pa.posting_count), 0) AS total_posting_count,
                COALESCE(SUM(xt.xp_amount), 0) AS total_xp
            FROM achievements a
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            LEFT JOIN xp_transactions xt ON xt.source_id = a.id
                AND xt.source_type IN ('MISSION_COMPLETION', 'BONUS')
            WHERE a.mission_id = p_mission_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id
        ),
        latest_user_levels AS (
            SELECT DISTINCT ON (ul.user_id)
                ul.user_id,
                ul.level,
                ul.xp,
                ul.updated_at
            FROM user_levels ul
            ORDER BY ul.user_id, ul.updated_at DESC
        ),
        ranked_stats AS (
            SELECT
                p_mission_id as mission_id,
                ast.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                CASE
                    WHEN ast.total_posting_count > 0 THEN ast.total_posting_count
                    ELSE ast.achievement_count
                END::BIGINT as user_achievement_count,
                ast.total_xp::BIGINT as total_points,
                RANK() OVER (ORDER BY ast.total_xp DESC, ast.achievement_count DESC, pup.name ASC)::BIGINT as rank,
                COALESCE(lul.level, 1) as level,
                COALESCE(lul.xp, 0)::BIGINT,
                COALESCE(lul.updated_at, now()) as updated_at
            FROM achievement_stats ast
            JOIN public_user_profiles pup ON ast.user_id = pup.id
            LEFT JOIN latest_user_levels lul ON ast.user_id = lul.user_id
        )
        SELECT rs.*
        FROM ranked_stats rs
        WHERE rs.user_id = p_user_id;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_period_mission_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_mission_ranking TO authenticated;
