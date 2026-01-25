-- posting_activitiesを全認証ユーザーが閲覧可能にする
-- （ポスティングマップで他ユーザーの配布枚数を表示するため）

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can manage their own posting activities" ON posting_activities;

-- SELECT: 認証済みユーザーは全てのレコードを閲覧可能
CREATE POLICY "Authenticated users can view all posting activities"
  ON posting_activities
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE: 作成者のみ
CREATE POLICY "Users can manage their own posting activities"
  ON posting_activities
  FOR ALL
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
