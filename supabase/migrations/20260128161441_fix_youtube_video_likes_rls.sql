-- youtube_video_likesのRLSポリシーを修正
-- user_idを直接チェックするように変更（重複チェックが正しく機能するように）

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own youtube video likes" ON youtube_video_likes;
DROP POLICY IF EXISTS "Users can manage their own youtube video likes" ON youtube_video_likes;

-- 新しいポリシー: user_idで直接チェック
CREATE POLICY "Users can view their own youtube video likes"
  ON youtube_video_likes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own youtube video likes"
  ON youtube_video_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own youtube video likes"
  ON youtube_video_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
