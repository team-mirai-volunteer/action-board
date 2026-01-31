-- 未使用テーブルを削除するマイグレーション

-- mission_artifact_geolocations テーブルの削除 (依存関係があるため先に削除)
DROP TABLE IF EXISTS mission_artifact_geolocations CASCADE;

-- events テーブルの削除
DROP TABLE IF EXISTS events CASCADE;

-- daily_dashboard_registration_summary テーブルの削除
DROP TABLE IF EXISTS daily_dashboard_registration_summary CASCADE;

-- daily_dashboard_registration_by_prefecture_summary テーブルの削除
DROP TABLE IF EXISTS daily_dashboard_registration_by_prefecture_summary CASCADE;

-- weekly_event_count_summary テーブルの削除
DROP TABLE IF EXISTS weekly_event_count_summary CASCADE;

-- weekly_event_count_by_prefecture_summary テーブルの削除
DROP TABLE IF EXISTS weekly_event_count_by_prefecture_summary CASCADE;
