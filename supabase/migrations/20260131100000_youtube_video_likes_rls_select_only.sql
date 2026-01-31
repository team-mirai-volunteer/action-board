-- youtube_video_likesのRLSポリシーを変更
-- 認証ユーザーは自分のレコードのみ閲覧可能、その他の操作はservice roleのみ

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own youtube video likes" ON youtube_video_likes;
DROP POLICY IF EXISTS "Users can insert their own youtube video likes" ON youtube_video_likes;
DROP POLICY IF EXISTS "Users can delete their own youtube video likes" ON youtube_video_likes;
DROP POLICY IF EXISTS "Users can manage their own youtube video likes" ON youtube_video_likes;
DROP POLICY IF EXISTS "Authenticated users can view youtube video likes" ON youtube_video_likes;

-- 新しいポリシー: 自分のレコードのみ閲覧可能
CREATE POLICY "Users can view their own youtube video likes"
  ON youtube_video_likes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETEはservice roleのみ（ポリシーなし = service roleのみ操作可能）
