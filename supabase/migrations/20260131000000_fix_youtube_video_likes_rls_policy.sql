-- youtube_video_likesのRLSポリシーを修正
-- ALLポリシーに TO authenticated を追加

-- 既存のALLポリシーを削除
DROP POLICY IF EXISTS "Users can manage their own youtube video likes" ON youtube_video_likes;

-- TO authenticated を追加したALLポリシーを再作成
CREATE POLICY "Users can manage their own youtube video likes"
  ON youtube_video_likes
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  );
