-- 期間別ランキング取得関数の追加

-- 期間別の総合ランキングを取得する関数
CREATE OR REPLACE FUNCTION get_period_ranking(
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL
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
    -- 期間指定がない場合は全期間
    IF p_start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            urv.user_id::UUID,
            urv.address_prefecture::TEXT,
            urv.level::INTEGER,
            urv.name::TEXT,
            urv.rank::BIGINT,
            urv.updated_at::TIMESTAMPTZ,
            urv.xp::BIGINT
        FROM user_ranking_view urv
        ORDER BY urv.rank
        LIMIT p_limit;
    ELSE
        -- 期間指定がある場合は期間内のXPを集計
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE xt.created_at >= p_start_date
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                px.user_id,
                pup.address_prefecture,
                ul.level,
                pup.name,
                ROW_NUMBER() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                ul.updated_at,
                px.period_xp_total AS xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            JOIN user_levels ul ON ul.user_id = px.user_id
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
        ORDER BY ru.rank
        LIMIT p_limit;
    END IF;
END;
$$;

-- 特定ユーザーの期間別ランキング情報を取得する関数
CREATE OR REPLACE FUNCTION get_user_period_ranking(
    target_user_id UUID,
    start_date TIMESTAMPTZ DEFAULT NULL
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
    -- 期間指定がない場合は全期間
    IF start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            urv.user_id::UUID,
            urv.address_prefecture::TEXT,
            urv.level::INTEGER,
            urv.name::TEXT,
            urv.rank::BIGINT,
            urv.updated_at::TIMESTAMPTZ,
            urv.xp::BIGINT
        FROM user_ranking_view urv
        WHERE urv.user_id = target_user_id;
    ELSE
        -- 期間指定がある場合は期間内のXPを集計
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            WHERE xt.created_at >= start_date
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                px.user_id,
                pup.address_prefecture,
                ul.level,
                pup.name,
                ROW_NUMBER() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                ul.updated_at,
                px.period_xp_total AS xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            JOIN user_levels ul ON ul.user_id = px.user_id
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

-- 関数の権限設定
GRANT EXECUTE ON FUNCTION get_period_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_ranking TO authenticated;

COMMENT ON FUNCTION get_period_ranking IS '期間別の総合ランキングを取得する関数';
COMMENT ON FUNCTION get_user_period_ranking IS '特定ユーザーの期間別ランキング情報を取得する関数';