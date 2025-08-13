-- Fix ranking function conflicts by replacing the existing functions

-- 1. Drop existing get_period_ranking functions to avoid conflicts
DROP FUNCTION IF EXISTS get_period_ranking(integer, timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS get_period_ranking(integer, timestamp with time zone, uuid);
DROP FUNCTION IF EXISTS get_period_ranking(integer, timestamp with time zone);

-- 2. Create unified get_period_ranking function with all parameters
CREATE OR REPLACE FUNCTION get_period_ranking(
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    address_prefecture TEXT,
    level INTEGER,
    name TEXT,
    rank BIGINT,
    updated_at TIMESTAMPTZ,
    xp BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    -- Season-based ranking takes priority
    IF p_season_id IS NOT NULL THEN
        RETURN QUERY
        WITH season_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS season_xp_total
            FROM xp_transactions xt
            WHERE xt.season_id = p_season_id
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                sx.user_id,
                pup.address_prefecture,
                ul.level,
                pup.name,
                RANK() OVER (ORDER BY sx.season_xp_total DESC) AS rank,
                ul.updated_at,
                sx.season_xp_total AS xp
            FROM season_xp sx
            JOIN public_user_profiles pup ON pup.id = sx.user_id
            JOIN user_levels ul ON ul.user_id = sx.user_id AND ul.season_id = p_season_id
            WHERE sx.season_xp_total > 0
        )
        SELECT 
            ru.user_id::UUID,
            ru.address_prefecture::TEXT,
            ru.level::INTEGER,
            ru.name::TEXT,
            ru.rank::BIGINT,
            ru.updated_at::TIMESTAMPTZ,
            ru.xp::BIGINT
        FROM ranked_users ru
        ORDER BY ru.rank
        LIMIT p_limit;
    ELSE
        -- Period-based ranking (legacy support with p_start_date and p_end_date)
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE 
                (p_start_date IS NULL OR xt.created_at >= p_start_date)
                AND (p_end_date IS NULL OR xt.created_at < p_end_date)
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                px.user_id,
                pup.address_prefecture::text,
                COALESCE(ul.level, 1)::integer as level,
                pup.name::text,
                RANK() OVER (ORDER BY px.period_xp_total DESC)::bigint as rank,
                COALESCE(ul.updated_at, now())::timestamptz as updated_at,
                px.period_xp_total::bigint as xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            LEFT JOIN user_levels ul ON ul.user_id = px.user_id
            WHERE px.period_xp_total > 0
        )
        SELECT 
            ru.user_id::UUID,
            ru.address_prefecture::TEXT,
            ru.level::INTEGER,
            ru.name::TEXT,
            ru.rank::BIGINT,
            ru.updated_at::TIMESTAMPTZ,
            ru.xp::BIGINT
        FROM ranked_users ru
        WHERE ru.rank <= p_limit
        ORDER BY ru.rank;
    END IF;
END;
$$;

-- 3. Drop existing get_user_period_ranking functions to avoid conflicts
DROP FUNCTION IF EXISTS get_user_period_ranking(uuid, timestamp with time zone, uuid);
DROP FUNCTION IF EXISTS get_user_period_ranking(uuid, timestamp with time zone);

-- 4. Create unified get_user_period_ranking function
CREATE OR REPLACE FUNCTION get_user_period_ranking(
    target_user_id UUID,
    start_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    address_prefecture TEXT,
    level INTEGER,
    name TEXT,
    rank BIGINT,
    updated_at TIMESTAMPTZ,
    xp BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Season-based ranking takes priority
    IF p_season_id IS NOT NULL THEN
        RETURN QUERY
        WITH season_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS season_xp_total
            FROM xp_transactions xt
            WHERE xt.season_id = p_season_id
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                sx.user_id,
                pup.address_prefecture,
                ul.level,
                pup.name,
                RANK() OVER (ORDER BY sx.season_xp_total DESC) AS rank,
                ul.updated_at,
                sx.season_xp_total AS xp
            FROM season_xp sx
            JOIN public_user_profiles pup ON pup.id = sx.user_id
            JOIN user_levels ul ON ul.user_id = sx.user_id AND ul.season_id = p_season_id
            WHERE sx.season_xp_total > 0
        )
        SELECT 
            aru.user_id::UUID,
            aru.address_prefecture::TEXT,
            aru.level::INTEGER,
            aru.name::TEXT,
            aru.rank::BIGINT,
            aru.updated_at::TIMESTAMPTZ,
            aru.xp::BIGINT
        FROM all_ranked_users aru
        WHERE aru.user_id = target_user_id;
    ELSE
        -- Period-based ranking (legacy support)
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE (start_date IS NULL OR xt.created_at >= start_date)
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                px.user_id,
                pup.address_prefecture::text,
                COALESCE(ul.level, 1)::integer as level,
                pup.name::text,
                RANK() OVER (ORDER BY px.period_xp_total DESC)::bigint as rank,
                COALESCE(ul.updated_at, now())::timestamptz as updated_at,
                px.period_xp_total::bigint as xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            LEFT JOIN user_levels ul ON ul.user_id = px.user_id
            WHERE px.period_xp_total > 0
        )
        SELECT 
            aru.user_id::UUID,
            aru.address_prefecture::TEXT,
            aru.level::INTEGER,
            aru.name::TEXT,
            aru.rank::BIGINT,
            aru.updated_at::TIMESTAMPTZ,
            aru.xp::BIGINT
        FROM all_ranked_users aru
        WHERE aru.user_id = target_user_id;
    END IF;
END;
$$;