-- 削除されたUPDATEポリシーを復活させる。
CREATE POLICY "poster_boards_update_policy" ON poster_boards
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
