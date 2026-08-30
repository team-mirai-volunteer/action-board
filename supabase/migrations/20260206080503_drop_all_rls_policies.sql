-- Drop all RLS policies from public schema tables
-- RLS remains enabled, so only service_role can bypass and access data
-- This prevents all client-side (anon/authenticated) direct access to Supabase
-- Related: https://github.com/team-mirai-volunteer/action-board/issues/1518

-- achievements
DROP POLICY IF EXISTS "delete_own_achievement" ON public.achievements;
DROP POLICY IF EXISTS "insert_own_achievement" ON public.achievements;
DROP POLICY IF EXISTS "select_all_achievements" ON public.achievements;

-- mission_artifacts
DROP POLICY IF EXISTS "Users can manage their own mission artifacts" ON public.mission_artifacts;

-- mission_category
DROP POLICY IF EXISTS "select_all_categories" ON public.mission_category;

-- mission_category_link
DROP POLICY IF EXISTS "select_all_links" ON public.mission_category_link;

-- mission_main_links
DROP POLICY IF EXISTS "select_all_mission_main_links" ON public.mission_main_links;

-- mission_quiz_links
DROP POLICY IF EXISTS "Anyone can read mission quiz links" ON public.mission_quiz_links;

-- missions
DROP POLICY IF EXISTS "select_all_missions" ON public.missions;

-- poster_activities
DROP POLICY IF EXISTS "Users can manage their own poster activities" ON public.poster_activities;

-- poster_board_status_history
DROP POLICY IF EXISTS "poster_board_status_history_insert_policy" ON public.poster_board_status_history;
DROP POLICY IF EXISTS "poster_board_status_history_select_policy" ON public.poster_board_status_history;

-- poster_board_totals
DROP POLICY IF EXISTS "Allow public read access to poster_board_totals" ON public.poster_board_totals;
DROP POLICY IF EXISTS "Allow service role to manage poster_board_totals" ON public.poster_board_totals;

-- poster_boards
DROP POLICY IF EXISTS "poster_boards_public_select" ON public.poster_boards;
DROP POLICY IF EXISTS "poster_boards_select_policy" ON public.poster_boards;
DROP POLICY IF EXISTS "poster_boards_update_policy" ON public.poster_boards;

-- posting_activities
DROP POLICY IF EXISTS "Authenticated users can view all posting activities" ON public.posting_activities;
DROP POLICY IF EXISTS "Users can manage their own posting activities" ON public.posting_activities;

-- posting_events
DROP POLICY IF EXISTS "Allow read access to all users" ON public.posting_events;

-- posting_shapes
DROP POLICY IF EXISTS "Anyone can view posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Authenticated users can create posting shapes" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can delete own posting shapes or admin" ON public.posting_shapes;
DROP POLICY IF EXISTS "Users can update own posting shapes or admin" ON public.posting_shapes;

-- private_users
DROP POLICY IF EXISTS "insert_own_user" ON public.private_users;
DROP POLICY IF EXISTS "select_own_user" ON public.private_users;
DROP POLICY IF EXISTS "update_own_user" ON public.private_users;

-- public_user_profiles
DROP POLICY IF EXISTS "insert_own_profile" ON public.public_user_profiles;
DROP POLICY IF EXISTS "select_all_public_user_profiles" ON public.public_user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.public_user_profiles;

-- quiz_categories
DROP POLICY IF EXISTS "Anyone can read quiz categories" ON public.quiz_categories;

-- quiz_questions
DROP POLICY IF EXISTS "Anyone can read quiz questions" ON public.quiz_questions;

-- seasons
DROP POLICY IF EXISTS "Anyone can view seasons" ON public.seasons;
DROP POLICY IF EXISTS "Only admins can delete seasons" ON public.seasons;
DROP POLICY IF EXISTS "Only admins can insert seasons" ON public.seasons;
DROP POLICY IF EXISTS "Only admins can update seasons" ON public.seasons;

-- tiktok_video_stats
DROP POLICY IF EXISTS "Allow read for anon users" ON public.tiktok_video_stats;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.tiktok_video_stats;

-- tiktok_videos
DROP POLICY IF EXISTS "Allow read for anon users" ON public.tiktok_videos;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.tiktok_videos;

-- user_activities
DROP POLICY IF EXISTS "insert_own_user_activity" ON public.user_activities;
DROP POLICY IF EXISTS "select_all_user_activities" ON public.user_activities;

-- user_badges
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON public.user_badges;

-- user_levels
DROP POLICY IF EXISTS "Anonymous users can view all user levels" ON public.user_levels;
DROP POLICY IF EXISTS "Authenticated users can view all user levels" ON public.user_levels;

-- user_referral
DROP POLICY IF EXISTS "Anyone can SELECT all referrals" ON public.user_referral;
DROP POLICY IF EXISTS "Users can INSERT their own referral" ON public.user_referral;

-- xp_transactions
DROP POLICY IF EXISTS "Anyone can view all xp transactions" ON public.xp_transactions;

-- youtube_user_comments
DROP POLICY IF EXISTS "Users can view their own youtube comments" ON public.youtube_user_comments;

-- youtube_video_comments
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.youtube_video_comments;

-- youtube_video_likes
DROP POLICY IF EXISTS "Users can view their own youtube video likes" ON public.youtube_video_likes;

-- youtube_video_stats
DROP POLICY IF EXISTS "youtube_video_stats_public_select" ON public.youtube_video_stats;

-- youtube_videos
DROP POLICY IF EXISTS "youtube_videos_public_select" ON public.youtube_videos;

-- Storage policies (storage.objects)
DROP POLICY IF EXISTS "Users can delete their own mission artifact files" ON storage.objects;
DROP POLICY IF EXISTS "Users can select their own mission artifact files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own mission artifact files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own mission artifact files" ON storage.objects;
DROP POLICY IF EXISTS "anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "users can view their own avatars" ON storage.objects;
