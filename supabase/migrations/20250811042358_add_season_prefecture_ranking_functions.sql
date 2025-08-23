-- Add season-aware prefecture ranking functions

-- 1. Update get_period_prefecture_ranking to support seasons
DROP FUNCTION IF EXISTS get_period_prefecture_ranking(TEXT, INTEGER, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION get_period_prefecture_ranking(
    p_prefecture TEXT,
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    address_prefecture TEXT,
    rank BIGINT,
    level INTEGER,
    xp BIGINT,
    updated_at TIMESTAMPTZ
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
            AND (p_start_date IS NULL OR xt.created_at >= p_start_date)
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                sx.user_id,
                pup.name,
                pup.address_prefecture,
                RANK() OVER (ORDER BY sx.season_xp_total DESC) AS rank,
                ul.level,
                sx.season_xp_total AS xp,
                ul.updated_at
            FROM season_xp sx
            JOIN public_user_profiles pup ON pup.id = sx.user_id
            JOIN user_levels ul ON ul.user_id = sx.user_id AND ul.season_id = p_season_id
            WHERE pup.address_prefecture = p_prefecture
            AND sx.season_xp_total > 0
        )
        SELECT 
            ru.user_id::UUID,
            ru.name::TEXT,
            ru.address_prefecture::TEXT,
            ru.rank::BIGINT,
            ru.level::INTEGER,
            ru.xp::BIGINT,
            ru.updated_at::TIMESTAMPTZ
        FROM ranked_users ru
        ORDER BY ru.rank
        LIMIT p_limit;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE (p_start_date IS NULL OR xt.created_at >= p_start_date)
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                px.user_id,
                pup.name,
                pup.address_prefecture,
                RANK() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                COALESCE(ul.level, 1) as level,
                px.period_xp_total as xp,
                COALESCE(ul.updated_at, now()) as updated_at
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            LEFT JOIN user_levels ul ON ul.user_id = px.user_id
            WHERE pup.address_prefecture = p_prefecture
            AND px.period_xp_total > 0
        )
        SELECT 
            ru.user_id::UUID,
            ru.name::TEXT,
            ru.address_prefecture::TEXT,
            ru.rank::BIGINT,
            ru.level::INTEGER,
            ru.xp::BIGINT,
            ru.updated_at::TIMESTAMPTZ
        FROM ranked_users ru
        WHERE ru.rank <= p_limit
        ORDER BY ru.rank;
    END IF;
END;
$$;

-- 2. Update get_user_period_prefecture_ranking to support seasons
DROP FUNCTION IF EXISTS get_user_period_prefecture_ranking(TEXT, UUID, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION get_user_period_prefecture_ranking(
    p_prefecture TEXT,
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    address_prefecture TEXT,
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
        WITH season_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS season_xp_total
            FROM xp_transactions xt
            WHERE xt.season_id = p_season_id
            AND (p_start_date IS NULL OR xt.created_at >= p_start_date)
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                sx.user_id,
                pup.name,
                pup.address_prefecture,
                RANK() OVER (ORDER BY sx.season_xp_total DESC) AS rank,
                ul.level,
                sx.season_xp_total AS xp,
                ul.updated_at
            FROM season_xp sx
            JOIN public_user_profiles pup ON pup.id = sx.user_id
            JOIN user_levels ul ON ul.user_id = sx.user_id AND ul.season_id = p_season_id
            WHERE pup.address_prefecture = p_prefecture
            AND sx.season_xp_total > 0
        )
        SELECT 
            aru.user_id::UUID,
            aru.name::TEXT,
            aru.address_prefecture::TEXT,
            aru.rank::BIGINT,
            aru.level::INTEGER,
            aru.xp::BIGINT,
            aru.updated_at::TIMESTAMPTZ
        FROM all_ranked_users aru
        WHERE aru.user_id = p_user_id;
    ELSE
        -- Legacy period-based ranking (for backward compatibility)
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE (p_start_date IS NULL OR xt.created_at >= p_start_date)
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                px.user_id,
                pup.name,
                pup.address_prefecture,
                RANK() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                COALESCE(ul.level, 1) as level,
                px.period_xp_total as xp,
                COALESCE(ul.updated_at, now()) as updated_at
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            LEFT JOIN user_levels ul ON ul.user_id = px.user_id
            WHERE pup.address_prefecture = p_prefecture
            AND px.period_xp_total > 0
        )
        SELECT 
            aru.user_id::UUID,
            aru.name::TEXT,
            aru.address_prefecture::TEXT,
            aru.rank::BIGINT,
            aru.level::INTEGER,
            aru.xp::BIGINT,
            aru.updated_at::TIMESTAMPTZ
        FROM all_ranked_users aru
        WHERE aru.user_id = p_user_id;
    END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_period_prefecture_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_prefecture_ranking TO authenticated;