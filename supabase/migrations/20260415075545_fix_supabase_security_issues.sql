-- Supabaseセキュリティリンターの指摘事項を修正
-- ref: https://github.com/team-mirai-volunteer/action-board/issues/2201

-- =============================================================================
-- 1. SECURITY DEFINER ビューを SECURITY INVOKER に変更
-- =============================================================================
-- ビューがビュー作成者（postgres）の権限ではなく、クエリ実行者の権限で
-- 動作するようにする。これにより基底テーブルのRLSポリシーが正しく適用される。

ALTER VIEW public.activity_timeline_view SET (security_invoker = true);
ALTER VIEW public.mission_category_view SET (security_invoker = true);
ALTER VIEW public.mission_achievement_count_view SET (security_invoker = true);
ALTER VIEW public.user_ranking_view SET (security_invoker = true);
ALTER VIEW public.quiz_questions_with_category SET (security_invoker = true);
ALTER VIEW public.mission_quiz_with_links SET (security_invoker = true);
ALTER VIEW public.poster_board_latest_editors SET (security_invoker = true);

-- =============================================================================
-- 2. staging_poster_boards テーブルにRLSを有効化
-- =============================================================================
-- このテーブルは poster_data/load-csv.ts からpostgresロールで直接DB接続して
-- TRUNCATE/INSERTされる中継用テーブル。ユーザーやアプリケーションコードからは
-- アクセスされないため、ポリシーを作成せずRLSのみ有効化することで全アクセスを
-- 拒否する（postgresロール・service_roleはRLSをバイパスするため動作に影響なし）。

ALTER TABLE public.staging_poster_boards ENABLE ROW LEVEL SECURITY;
