
CREATE POLICY "Users can update their own user levels"
    ON user_levels FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user levels"
    ON user_levels FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update their own user levels" ON user_levels IS 'ユーザーは自分のレベル情報を更新可能（通知確認用）';
COMMENT ON POLICY "Users can insert their own user levels" ON user_levels IS 'ユーザーは自分のレベル情報を作成可能（初回登録用）';
