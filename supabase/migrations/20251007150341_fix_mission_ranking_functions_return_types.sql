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
    mission_difficulty INTEGER,
    posting_total BIGINT,
    user_achievement_count BIGINT,
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
        SELECT
            data.mission_id,
            data.user_id,
            data.user_name,
            data.address_prefecture,
            data.mission_difficulty,
            data.posting_total,
            data.user_achievement_count,
            RANK() OVER (ORDER BY data.calculated_points DESC)::BIGINT as rank,
            data.level,
            data.xp,
            data.updated_at
        FROM (
            SELECT
                p_mission_id as mission_id,
                a.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                m.difficulty as mission_difficulty,
                COALESCE(SUM(pa.posting_count), 0)::BIGINT as posting_total,
                COUNT(DISTINCT a.id)::BIGINT as user_achievement_count,
                (
                    (COUNT(DISTINCT a.id) * CASE m.difficulty
                        WHEN 1 THEN 50
                        WHEN 2 THEN 100
                        WHEN 3 THEN 200
                        WHEN 4 THEN 400
                        WHEN 5 THEN 800
                        ELSE 50
                    END)
                    + CASE
                        WHEN m.required_artifact_type = 'POSTING'
                            THEN COALESCE(SUM(pa.posting_count), 0) * 50
                        ELSE 0
                    END
                    + CASE
                        WHEN m.required_artifact_type = 'POSTER'
                            THEN COUNT(DISTINCT a.id) * 400
                        ELSE 0
                    END
                ) AS calculated_points,
                ul.level,
                ul.xp::BIGINT as xp,
                ul.updated_at
            FROM achievements a
            JOIN missions m ON m.id = a.mission_id
            JOIN public_user_profiles pup ON a.user_id = pup.id
            LEFT JOIN user_levels ul ON a.user_id = ul.user_id AND ul.season_id = p_season_id
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            WHERE a.mission_id = p_mission_id
            AND a.season_id = p_season_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id, pup.name, pup.address_prefecture, m.difficulty, m.required_artifact_type, ul.level, ul.xp, ul.updated_at
        ) data
        ORDER BY data.calculated_points DESC
        LIMIT p_limit;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        SELECT
            data.mission_id,
            data.user_id,
            data.user_name,
            data.address_prefecture,
            data.mission_difficulty,
            data.posting_total,
            data.user_achievement_count,
            RANK() OVER (ORDER BY data.calculated_points DESC)::BIGINT as rank,
            data.level,
            data.xp,
            data.updated_at
        FROM (
            SELECT
                p_mission_id as mission_id,
                a.user_id,
                pup.name::TEXT as user_name,
                pup.address_prefecture::TEXT,
                m.difficulty as mission_difficulty,
                COALESCE(SUM(pa.posting_count), 0)::BIGINT as posting_total,
                COUNT(DISTINCT a.id)::BIGINT as user_achievement_count,
                (
                    (COUNT(DISTINCT a.id) * CASE m.difficulty
                        WHEN 1 THEN 50
                        WHEN 2 THEN 100
                        WHEN 3 THEN 200
                        WHEN 4 THEN 400
                        WHEN 5 THEN 800
                        ELSE 50
                    END)
                    + CASE
                        WHEN m.required_artifact_type = 'POSTING'
                            THEN COALESCE(SUM(pa.posting_count), 0) * 50
                        ELSE 0
                    END
                    + CASE
                        WHEN m.required_artifact_type = 'POSTER'
                            THEN COUNT(DISTINCT a.id) * 400
                        ELSE 0
                    END
                ) AS calculated_points,
                COALESCE(ul.level, 1) as level,
                COALESCE(ul.xp, 0)::BIGINT as xp,
                COALESCE(ul.updated_at, now()) as updated_at
            FROM achievements a
            JOIN missions m ON m.id = a.mission_id
            JOIN public_user_profiles pup ON a.user_id = pup.id
            LEFT JOIN user_levels ul ON a.user_id = ul.user_id
            LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
            LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
            WHERE a.mission_id = p_mission_id
            AND (p_start_date IS NULL OR a.created_at >= p_start_date)
            GROUP BY a.user_id, pup.name, pup.address_prefecture, m.difficulty, m.required_artifact_type, ul.level, ul.xp, ul.updated_at
        ) data
        ORDER BY data.calculated_points DESC
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
    mission_difficulty INTEGER,
    posting_total BIGINT,
    user_achievement_count BIGINT,
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
                raw.mission_id,
                raw.user_id,
                raw.user_name,
                raw.address_prefecture,
                raw.mission_difficulty,
                raw.posting_total,
                raw.user_achievement_count,
                RANK() OVER (ORDER BY raw.calculated_points DESC)::BIGINT as rank,
                raw.level,
                raw.xp,
                raw.updated_at
            FROM (
                SELECT
                    p_mission_id as mission_id,
                    a.user_id,
                    pup.name::TEXT as user_name,
                    pup.address_prefecture::TEXT,
                    m.difficulty as mission_difficulty,
                    COALESCE(SUM(pa.posting_count), 0)::BIGINT as posting_total,
                    COUNT(DISTINCT a.id)::BIGINT as user_achievement_count,
                    (
                        (COUNT(DISTINCT a.id) * CASE m.difficulty
                            WHEN 1 THEN 50
                            WHEN 2 THEN 100
                            WHEN 3 THEN 200
                            WHEN 4 THEN 400
                            WHEN 5 THEN 800
                            ELSE 50
                        END)
                        + CASE
                            WHEN m.required_artifact_type = 'POSTING'
                                THEN COALESCE(SUM(pa.posting_count), 0) * 50
                            ELSE 0
                        END
                        + CASE
                            WHEN m.required_artifact_type = 'POSTER'
                                THEN COUNT(DISTINCT a.id) * 400
                            ELSE 0
                        END
                    ) AS calculated_points,
                    ul.level,
                    ul.xp::BIGINT as xp,
                    ul.updated_at
                FROM achievements a
                JOIN missions m ON m.id = a.mission_id
                JOIN public_user_profiles pup ON a.user_id = pup.id
                LEFT JOIN user_levels ul ON a.user_id = ul.user_id AND ul.season_id = p_season_id
                LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
                LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
                WHERE a.mission_id = p_mission_id
                AND a.season_id = p_season_id
                AND (p_start_date IS NULL OR a.created_at >= p_start_date)
                GROUP BY a.user_id, pup.name, pup.address_prefecture, m.difficulty, m.required_artifact_type, ul.level, ul.xp, ul.updated_at
            ) raw
        )
        SELECT
            sr.mission_id,
            sr.user_id,
            sr.user_name,
            sr.address_prefecture,
            sr.mission_difficulty,
            sr.posting_total,
            sr.user_achievement_count,
            sr.rank,
            sr.level,
            sr.xp,
            sr.updated_at
        FROM season_ranking sr
        WHERE sr.user_id = p_user_id;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH period_ranking AS (
            SELECT
                raw.mission_id,
                raw.user_id,
                raw.user_name,
                raw.address_prefecture,
                raw.mission_difficulty,
                raw.posting_total,
                raw.user_achievement_count,
                RANK() OVER (ORDER BY raw.calculated_points DESC)::BIGINT as rank,
                raw.level,
                raw.xp,
                raw.updated_at
            FROM (
                SELECT
                    p_mission_id as mission_id,
                    a.user_id,
                    pup.name::TEXT as user_name,
                    pup.address_prefecture::TEXT,
                    m.difficulty as mission_difficulty,
                    COALESCE(SUM(pa.posting_count), 0)::BIGINT as posting_total,
                    COUNT(DISTINCT a.id)::BIGINT as user_achievement_count,
                    (
                        (COUNT(DISTINCT a.id) * CASE m.difficulty
                            WHEN 1 THEN 50
                            WHEN 2 THEN 100
                            WHEN 3 THEN 200
                            WHEN 4 THEN 400
                            WHEN 5 THEN 800
                            ELSE 50
                        END)
                        + CASE
                            WHEN m.required_artifact_type = 'POSTING'
                                THEN COALESCE(SUM(pa.posting_count), 0) * 50
                            ELSE 0
                        END
                        + CASE
                            WHEN m.required_artifact_type = 'POSTER'
                                THEN COUNT(DISTINCT a.id) * 400
                            ELSE 0
                        END
                    ) AS calculated_points,
                    COALESCE(ul.level, 1) as level,
                    COALESCE(ul.xp, 0)::BIGINT as xp,
                    COALESCE(ul.updated_at, now()) as updated_at
                FROM achievements a
                JOIN missions m ON m.id = a.mission_id
                JOIN public_user_profiles pup ON a.user_id = pup.id
                LEFT JOIN user_levels ul ON a.user_id = ul.user_id
                LEFT JOIN mission_artifacts ma ON a.id = ma.achievement_id
                LEFT JOIN posting_activities pa ON ma.id = pa.mission_artifact_id
                WHERE a.mission_id = p_mission_id
                AND (p_start_date IS NULL OR a.created_at >= p_start_date)
                GROUP BY a.user_id, pup.name, pup.address_prefecture, m.difficulty, m.required_artifact_type, ul.level, ul.xp, ul.updated_at
            ) raw
        )
        SELECT
            pr.mission_id,
            pr.user_id,
            pr.user_name,
            pr.address_prefecture,
            pr.mission_difficulty,
            pr.posting_total,
            pr.user_achievement_count,
            pr.rank,
            pr.level,
            pr.xp,
            pr.updated_at
        FROM period_ranking pr
        WHERE pr.user_id = p_user_id;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_period_mission_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_mission_ranking TO authenticated;
