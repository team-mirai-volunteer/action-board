-- キャンペーンコード（?cv=）別の新規登録数を集計する関数
--
-- 用途: 全国キャラバン2026の会場別登録数など、流入元別の成果測定。
-- 組織活動本部・広報からの「会場別の登録数を見たい」に応えるため、
-- 問い合わせ対応ボット（みらいいぬ）向けMCPツール get_campaign_attribution_stats から
-- service_role で呼ばれる。集計値のみを返し、個人（user_id）は返さない。
--
-- 集計はDB側でGROUP BYする（全行をアプリに転送しないため）。
-- 期間は半開区間 [registered_from, registered_before) で受ける。
-- created_at はマイクロ秒精度なので「その日の 23:59:59.999 まで」と包含比較すると
-- 23:59:59.999001〜.999999 の登録を取りこぼすため、上限は翌日 0 時の排他境界にする。
CREATE OR REPLACE FUNCTION public.get_campaign_attribution_stats(
  campaign_code_prefix text DEFAULT NULL,
  registered_from timestamptz DEFAULT NULL,
  registered_before timestamptz DEFAULT NULL
)
RETURNS TABLE (
  campaign_code text,
  registrations bigint,
  first_registered_at timestamptz,
  last_registered_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    uca.campaign_code,
    count(*)::bigint AS registrations,
    min(uca.created_at) AS first_registered_at,
    max(uca.created_at) AS last_registered_at
  FROM public.user_campaign_attribution uca
  WHERE (
      -- 前方一致（大文字小文字を区別しない）。LIKEではなくstarts_withを使い、
      -- コードに含まれうる _ や % がワイルドカードとして解釈されるのを避ける
      campaign_code_prefix IS NULL
      OR starts_with(lower(uca.campaign_code), lower(campaign_code_prefix))
    )
    AND (registered_from IS NULL OR uca.created_at >= registered_from)
    AND (registered_before IS NULL OR uca.created_at < registered_before)
  GROUP BY uca.campaign_code
  ORDER BY count(*) DESC, uca.campaign_code ASC;
$$;

-- SECURITY INVOKER なのでRLS（本人のみSELECT可）は効くが、
-- 集計用途の関数をアプリのロールから呼べる必要はないため明示的に遮断する
REVOKE ALL ON FUNCTION public.get_campaign_attribution_stats(text, timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_campaign_attribution_stats(text, timestamptz, timestamptz) TO service_role;

COMMENT ON FUNCTION public.get_campaign_attribution_stats(text, timestamptz, timestamptz) IS
'キャンペーンコード（?cv=）別の新規登録数・初回/最終登録日時を集計する。期間は半開区間 [registered_from, registered_before)。会場別アトリビューション計測のMCPツールから service_role で呼ばれる。';
