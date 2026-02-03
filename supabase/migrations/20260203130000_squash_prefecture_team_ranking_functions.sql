-- Squashed migration: prefecture team ranking functions

DROP FUNCTION IF EXISTS get_prefecture_team_ranking(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_prefecture_contribution(UUID, UUID);

CREATE OR REPLACE FUNCTION get_prefecture_team_ranking(
    p_season_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 47
)
RETURNS TABLE (
    prefecture TEXT,
    total_xp BIGINT,
    user_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT
        pup.address_prefecture AS prefecture,
        COALESCE(SUM(xt.xp_amount), 0)::BIGINT AS total_xp,
        COUNT(DISTINCT xt.user_id)::BIGINT AS user_count
    FROM public_user_profiles pup
    LEFT JOIN xp_transactions xt ON xt.user_id = pup.id
        AND (p_season_id IS NULL OR xt.season_id = p_season_id)
    WHERE pup.address_prefecture IS NOT NULL
      AND pup.address_prefecture != '海外'
    GROUP BY pup.address_prefecture
    ORDER BY total_xp DESC
    LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_user_prefecture_contribution(
    p_user_id UUID,
    p_season_id UUID DEFAULT NULL
)
RETURNS TABLE (
    prefecture TEXT,
    user_xp BIGINT,
    prefecture_total_xp BIGINT,
    user_rank_in_prefecture BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_prefecture TEXT;
BEGIN
    SELECT address_prefecture INTO v_prefecture
    FROM public_user_profiles
    WHERE id = p_user_id;

    IF v_prefecture IS NULL OR v_prefecture = '海外' THEN
        RETURN;
    END IF;

    IF p_season_id IS NOT NULL THEN
        RETURN QUERY
        WITH user_xp_data AS (
            SELECT
                xt.user_id,
                SUM(xt.xp_amount) AS xp_total
            FROM xp_transactions xt
            JOIN public_user_profiles pup ON pup.id = xt.user_id
            WHERE xt.season_id = p_season_id
              AND pup.address_prefecture = v_prefecture
            GROUP BY xt.user_id
        ),
        ranked AS (
            SELECT
                uxd.user_id,
                uxd.xp_total,
                RANK() OVER (ORDER BY uxd.xp_total DESC) AS rank_in_pref
            FROM user_xp_data uxd
        ),
        prefecture_total AS (
            SELECT COALESCE(SUM(xp_total), 0) AS total
            FROM user_xp_data
        )
        SELECT
            v_prefecture AS prefecture,
            COALESCE(r.xp_total, 0)::BIGINT AS user_xp,
            pt.total::BIGINT AS prefecture_total_xp,
            COALESCE(r.rank_in_pref, 0)::BIGINT AS user_rank_in_prefecture
        FROM prefecture_total pt
        LEFT JOIN ranked r ON r.user_id = p_user_id;
    ELSE
        RETURN QUERY
        WITH user_xp_data AS (
            SELECT
                xt.user_id,
                SUM(xt.xp_amount) AS xp_total
            FROM xp_transactions xt
            JOIN public_user_profiles pup ON pup.id = xt.user_id
            WHERE pup.address_prefecture = v_prefecture
            GROUP BY xt.user_id
        ),
        ranked AS (
            SELECT
                uxd.user_id,
                uxd.xp_total,
                RANK() OVER (ORDER BY uxd.xp_total DESC) AS rank_in_pref
            FROM user_xp_data uxd
        ),
        prefecture_total AS (
            SELECT COALESCE(SUM(xp_total), 0) AS total
            FROM user_xp_data
        )
        SELECT
            v_prefecture AS prefecture,
            COALESCE(r.xp_total, 0)::BIGINT AS user_xp,
            pt.total::BIGINT AS prefecture_total_xp,
            COALESCE(r.rank_in_pref, 0)::BIGINT AS user_rank_in_prefecture
        FROM prefecture_total pt
        LEFT JOIN ranked r ON r.user_id = p_user_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_prefecture_team_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_prefecture_contribution TO authenticated;
