-- 修正内容: public_user_profiles テーブルとのJOIN条件を pup.user_id から pup.id に変更

-- 既存の関数を削除
DROP FUNCTION IF EXISTS get_user_period_ranking(UUID, TIMESTAMPTZ);


-- 特定ユーザーの期間別ランキング情報を取得する関数（修正版）
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
GRANT EXECUTE ON FUNCTION get_user_period_ranking TO authenticated;

COMMENT ON FUNCTION get_user_period_ranking IS '特定ユーザーの期間別ランキング情報を取得する関数';