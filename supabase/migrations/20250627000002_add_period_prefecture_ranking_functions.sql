-- 期間別都道府県ランキング取得関数の追加

-- 期間別の都道府県ランキングを取得する関数
CREATE OR REPLACE FUNCTION get_period_prefecture_ranking(
    p_prefecture TEXT,
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    rank BIGINT,
    xp BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- 期間指定がない場合は既存の関数を使用
    IF p_start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            pr.user_id::UUID,
            pr.user_name::TEXT AS name,
            pr.rank::BIGINT,
            pr.xp::BIGINT
        FROM get_prefecture_ranking(p_prefecture, p_limit) pr;
    ELSE
        -- 期間指定がある場合は期間内のXPを集計
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            JOIN public_user_profiles pup ON pup.id = xt.user_id
            WHERE xt.created_at >= p_start_date
            AND pup.address_prefecture = p_prefecture
            GROUP BY xt.user_id
        ),
        ranked_users AS (
            SELECT 
                px.user_id,
                pup.name,
                ROW_NUMBER() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                px.period_xp_total AS xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            WHERE px.period_xp_total > 0
        )
        SELECT 
            ru.user_id::UUID,
            ru.name::TEXT,
            ru.rank::BIGINT,
            ru.xp::BIGINT
        FROM ranked_users ru
        ORDER BY ru.rank
        LIMIT p_limit;
    END IF;
END;
$$;

-- 特定ユーザーの期間別都道府県ランキング情報を取得する関数
CREATE OR REPLACE FUNCTION get_user_period_prefecture_ranking(
    p_prefecture TEXT,
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    level INTEGER,
    rank BIGINT,
    xp BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- 期間指定がない場合は既存の関数を使用
    IF p_start_date IS NULL THEN
        RETURN QUERY
        SELECT 
            upr.user_id::UUID,
            upr.user_name::TEXT AS name,
            ul.level::INTEGER,
            upr.rank::BIGINT,
            upr.xp::BIGINT
        FROM get_user_prefecture_ranking(p_prefecture, p_user_id) upr
        JOIN user_levels ul ON ul.user_id = upr.user_id;
    ELSE
        -- 期間指定がある場合
        RETURN QUERY
        WITH period_xp AS (
            SELECT 
                xt.user_id,
                SUM(xt.xp_amount) AS period_xp_total
            FROM xp_transactions xt
            JOIN public_user_profiles pup ON pup.id = xt.user_id
            WHERE xt.created_at >= p_start_date
            AND pup.address_prefecture = p_prefecture
            GROUP BY xt.user_id
        ),
        all_ranked_users AS (
            SELECT 
                px.user_id,
                pup.name,
                ul.level,
                ROW_NUMBER() OVER (ORDER BY px.period_xp_total DESC) AS rank,
                px.period_xp_total AS xp
            FROM period_xp px
            JOIN public_user_profiles pup ON pup.id = px.user_id
            JOIN user_levels ul ON ul.user_id = px.user_id
            WHERE px.period_xp_total > 0
        )
        SELECT 
            aru.user_id::UUID,
            aru.name::TEXT,
            aru.level::INTEGER,
            aru.rank::BIGINT,
            aru.xp::BIGINT
        FROM all_ranked_users aru
        WHERE aru.user_id = p_user_id;
    END IF;
END;
$$;

-- 関数の権限設定
GRANT EXECUTE ON FUNCTION get_period_prefecture_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_period_prefecture_ranking TO authenticated;

COMMENT ON FUNCTION get_period_prefecture_ranking IS '期間別の都道府県ランキングを取得する関数';
COMMENT ON FUNCTION get_user_period_prefecture_ranking IS '特定ユーザーの期間別都道府県ランキング情報を取得する関数';