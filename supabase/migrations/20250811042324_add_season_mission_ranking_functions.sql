-- Fix return types for mission ranking functions to match expected types

-- 1. Fix get_period_mission_ranking return type
-- Drop all versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS get_period_mission_ranking(UUID, INTEGER, TIMESTAMPTZ, UUID);
DROP FUNCTION IF EXISTS get_period_mission_ranking(UUID, INTEGER, TIMESTAMPTZ);

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
        SELECT 
            p_mission_id as mission_id,
            a.user_id,
            pup.name::TEXT as user_name,
            pup.address_prefecture::TEXT,
            COUNT(a.id)::BIGINT as user_achievement_count,
            COALESCE(SUM(pa.posting_count * 10), COUNT(a.id) * 10)::BIGINT as total_points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC)::BIGINT as rank,
            ul.level,
            ul.xp::BIGINT,
            ul.updated_at
        FROM achievements a
        JOIN public_user_profiles pup ON a.user_id = pup.id
        LEFT JOIN user_levels ul ON a.user_id = ul.user_id AND ul.season_id = p_season_id
        LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
        LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
        WHERE a.mission_id = p_mission_id
        AND a.season_id = p_season_id
        AND (p_start_date IS NULL OR a.created_at >= p_start_date)
        GROUP BY a.user_id, pup.name, pup.address_prefecture, ul.level, ul.xp, ul.updated_at
        ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC
        LIMIT p_limit;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        SELECT 
            p_mission_id as mission_id,
            a.user_id,
            pup.name::TEXT as user_name,
            pup.address_prefecture::TEXT,
            COUNT(a.id)::BIGINT as user_achievement_count,
            COALESCE(SUM(pa.posting_count * 10), COUNT(a.id) * 10)::BIGINT as total_points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC)::BIGINT as rank,
            COALESCE(ul.level, 1) as level,
            COALESCE(ul.xp, 0)::BIGINT,
            COALESCE(ul.updated_at, now()) as updated_at
        FROM achievements a
        JOIN public_user_profiles pup ON a.user_id = pup.id
        LEFT JOIN user_levels ul ON a.user_id = ul.user_id
        LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
        LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
        WHERE a.mission_id = p_mission_id
        AND (p_start_date IS NULL OR a.created_at >= p_start_date)
        GROUP BY a.user_id, pup.name, pup.address_prefecture, ul.level, ul.xp, ul.updated_at
        ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC
        LIMIT p_limit;
    END IF;
END;
$$;

-- 2. Fix get_user_period_mission_ranking return type
-- Drop all versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS get_user_period_mission_ranking(UUID, UUID, TIMESTAMPTZ, UUID);
DROP FUNCTION IF EXISTS get_user_period_mission_ranking(UUID, UUID, TIMESTAMPTZ);

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
        WITH season_ranking AS (
            SELECT 
                p_mission_id as mission_id,
                a.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                COUNT(a.id)::BIGINT as user_achievement_count,
                COALESCE(SUM(pa.posting_count * 10), COUNT(a.id) * 10)::BIGINT as total_points,
                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC)::BIGINT as rank,
                ul.level,
                ul.xp::BIGINT,
                ul.updated_at
            FROM achievements a
            JOIN public_user_profiles pup ON a.user_id = pup.id
            LEFT JOIN user_levels ul ON a.user_id = ul.user_id AND ul.season_id = p_season_id
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            WHERE a.mission_id = p_mission_id
            AND a.season_id = p_season_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id, pup.name, pup.address_prefecture, ul.level, ul.xp, ul.updated_at
        )
        SELECT sr.*
        FROM season_ranking sr
        WHERE sr.user_id = p_user_id;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH period_ranking AS (
            SELECT 
                p_mission_id as mission_id,
                a.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                COUNT(a.id)::BIGINT as user_achievement_count,
                COALESCE(SUM(pa.posting_count * 10), COUNT(a.id) * 10)::BIGINT as total_points,
                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pa.posting_count), COUNT(a.id)) DESC)::BIGINT as rank,
                COALESCE(ul.level, 1) as level,
                COALESCE(ul.xp, 0)::BIGINT,
                COALESCE(ul.updated_at, now()) as updated_at
            FROM achievements a
            JOIN public_user_profiles pup ON a.user_id = pup.id
            LEFT JOIN user_levels ul ON a.user_id = ul.user_id
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            WHERE a.mission_id = p_mission_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id, pup.name, pup.address_prefecture, ul.level, ul.xp, ul.updated_at
        )
        SELECT pr.*
        FROM period_ranking pr
        WHERE pr.user_id = p_user_id;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_period_mission_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_mission_ranking TO authenticated;