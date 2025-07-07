import {
  assertAuthState,
  expect,
  test,
} from '../e2e-test-helpers';

test.describe('アクションボード（Web版）のe2eテスト', () => {
  test('ログイン済み状態からトップページ確認', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // 自身のステータス表示を確認
    await expect(signedInPage.locator('section').getByText('テストユーザーLV.1東京都次のレベルまで40ポイント')).toBeVisible({ timeout: 10000 });
    await expect(signedInPage.getByRole('link', { name: 'テストユーザーさんのプロフィールへ' })).toBeVisible();

    // 活動状況の表示を確認
    await expect(signedInPage.getByRole('heading', { name: /チームみらいの活動状況/ })).toBeVisible();
    await expect(signedInPage.getByText('みんなで達成したアクション数')).toBeVisible();
    await expect(signedInPage.getByText('0件', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText('1日で 0件')).toBeVisible();
    await expect(signedInPage.getByText(/チームみらい.+サポーター数/)).toBeVisible();
    await expect(signedInPage.getByText('0件', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText('1日で 0件')).toBeVisible();
    
    // ランキングの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /アクションリーダー/ })).toBeVisible();
    await expect(signedInPage.getByRole('heading', { name: /今日/ })).toBeVisible();
    await expect(signedInPage.getByRole('heading', { name: /全期間/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /安野たかひろ 東京都 Lv.20 3,325pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /佐藤太郎 東京都 Lv.10 900pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /鈴木美咲 神奈川県 Lv.9 740pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /高橋健一 大阪府 Lv.8 595pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: /伊藤愛子 愛知県 Lv.7 465pt/ })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'トップ100を見る' })).toBeVisible();

    // 重要ミッションの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /重要ミッション/ })).toBeVisible();

    // 活動タイムラインの表示を確認
    await expect(signedInPage.getByRole('heading', { name: /活動タイムライン/ })).toBeVisible();

    // 問い合わせフォームの表示を確認
    await expect(signedInPage.getByRole('heading', { name: 'ご意見箱' })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'ポスターマップへのご意見フォーム' })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'アクションボードへのご意見フォーム' })).toBeVisible();

    // フッターの表示を確認
    await expect(signedInPage.getByRole('link', { name: '運営組織' })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: '利用規約' })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'プライバシーポリシー' })).toBeVisible();
    await expect(signedInPage.getByRole('link', { name: 'ご意見箱' })).toBeVisible();

  });

  test('アカウントページ遷移が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // アカウントページに遷移
    await signedInPage.getByTestId('usermenubutton').click();
    await signedInPage.getByRole('menuitem', { name: 'アカウント' }).click();
    await expect(signedInPage).toHaveURL(/\/settings\/profile/, { timeout: 10000 });

    // アカウントページの表示内容を確認
    await expect(signedInPage.getByText('プロフィール設定')).toBeVisible();
    await expect(signedInPage.getByText('ニックネーム')).toBeVisible();
    // 生年月日
    await expect(signedInPage.getByText('生年月日', { exact: true })).toBeVisible();
    await expect(signedInPage.getByRole('button', { name: '生年月日が必要な理由' })).toBeVisible();
    await expect(signedInPage.getByTestId('year_select')).toBeVisible();
    await expect(signedInPage.getByTestId('month_select')).toBeVisible();
    await expect(signedInPage.getByTestId('day_select')).toBeVisible();
    // 都道府県
    await expect(signedInPage.getByText('都道府県')).toBeVisible();
    await expect(signedInPage.getByRole('combobox', { name: '都道府県' })).toBeVisible();
    // 郵便番号
    await expect(signedInPage.getByText('郵便番号(ハイフンなし半角7桁)')).toBeVisible();
    await expect(signedInPage.getByRole('button', { name: 'なぜ郵便番号が必要ですか？' })).toBeVisible();
    await expect(signedInPage.getByRole('textbox', { name: '郵便番号(ハイフンなし半角7桁)' })).toBeVisible();
    // アカウント
    await expect(signedInPage.getByText('X(旧Twitter)のユーザー名')).toBeVisible();
    await expect(signedInPage.getByText('GitHubのユーザー名', { exact: true })).toBeVisible();
    await expect(signedInPage.getByRole('button', { name: '更新する' })).toBeVisible();
  });

  test('ユーザーページ遷移が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // 自身のユーザーページに遷移
    await signedInPage.getByRole('link', { name: 'テストユーザーさんのプロフィールへ' }).click();
    await expect(signedInPage).toHaveURL(/\/users\/[^\/]+$/, { timeout: 10000 });

    // 自身のユーザーページの表示内容を確認
    await expect(signedInPage.getByText('テストユーザー')).toBeVisible();
    await expect(signedInPage.getByText('Lv.1')).toBeVisible();
    await expect(signedInPage.getByText('東京都')).toBeVisible();
    await expect(signedInPage.getByText('活動タイムライン')).toBeVisible();
  });

  test('任意のユーザーページ遷移が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // 任意のユーザーページに遷移（ランキングから佐藤太郎のページへ）
    await signedInPage.getByRole('link').filter({ hasText: '佐藤太郎' }).click();
    await expect(signedInPage).toHaveURL(/\/users\/[^\/]+$/, { timeout: 10000 });

    // 任意のユーザーページの表示内容を確認
    await expect(signedInPage.getByText('佐藤太郎')).toBeVisible();
    await expect(signedInPage.getByText('Lv.10')).toBeVisible();
    await expect(signedInPage.getByText('東京都')).toBeVisible();
    await expect(signedInPage.getByText('活動タイムライン')).toBeVisible();
  });

  test('ミッションページ遷移 → ミッション完了 → ミッション取消が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // ミッションページに遷移（ゴミ拾いミッションをクリック）
    await signedInPage.getByRole('button', { name: '詳細を見る →' }).first().click();
    await expect(signedInPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 10000 });

    // ミッションページの表示内容を確認
    await expect(signedInPage.getByText('(seed) ゴミ拾いをしよう (成果物不要)', { exact: true })).toBeVisible();
    await expect(signedInPage.getByText('近所のゴミを拾ってみよう！清掃活動の報告は任意です。')).toBeVisible();
    await expect(signedInPage.getByText('実行したら記録しよう！')).toBeVisible();
    await expect(signedInPage.getByRole('button', { name: 'ミッション完了を記録する' })).toBeVisible();
    await expect(signedInPage.getByText('※ 成果物の内容が認められない場合、ミッションの達成が取り消される場合があります。正確な内容をご記入ください。')).toBeVisible();
    await expect(signedInPage.getByRole('heading', { name: '「(seed) ゴミ拾いをしよう (成果物不要)」トップ10' })).toBeVisible();

    // ミッション完了ページに遷移
    await signedInPage.getByRole('button', { name: 'ミッション完了を記録する' }).click();
    await expect(signedInPage.getByText('おめでとうございます！')).toBeVisible({ timeout: 10000 });
    await expect(signedInPage.getByText('「(seed) ゴミ拾いをしよう (成果物不要)」を達成しました！')).toBeVisible();
    await signedInPage.getByRole('button', { name: 'このまま閉じる' }).click();

    await expect(signedInPage.getByText('このミッションは達成済みです。')).toBeVisible();
    await expect(signedInPage.getByText('50ポイント獲得しました！')).toBeVisible({ timeout: 10000 });

    // ミッション完了後のポイントの変動を確認
    await signedInPage.goto('/');
    await expect(signedInPage.getByRole('dialog', { name: 'サポーターレベルが アップしました！' })).toBeVisible();
    await signedInPage.getByRole('button', { name: 'Close' }).click();
    await expect(signedInPage.locator('section').getByText('テストユーザーLV.2東京都次のレベルまで45ポイント')).toBeVisible({ timeout: 10000 });

    // ミッション取消後のポイントの変動を確認
    await signedInPage.getByRole('button', { name: '詳細を見る →' }).first().click();
    await expect(signedInPage).toHaveURL(/\/missions\/[^\/]+$/, { timeout: 10000 });

    await expect(signedInPage.getByText('あなたの達成履歴')).toBeVisible({ timeout: 10000 });
    await signedInPage.getByRole('button', { name: '取り消す' }).click();

    await expect(signedInPage.getByText('達成履歴を削除しますか？')).toBeVisible({ timeout: 10000 });
    await signedInPage.getByRole('button', { name: '削除する' }).click();

    await signedInPage.waitForTimeout(2000);

    await signedInPage.goto('/');
    await expect(signedInPage.locator('section').getByText('テストユーザーLV.1東京都次のレベルまで40ポイント')).toBeVisible({ timeout: 10000 });
  });

  test('TOP100ランキング - 全タブ遷移が正常に動作する', async ({
    signedInPage,
  }) => {
    await assertAuthState(signedInPage, true);

    // ランキングページに遷移
    await signedInPage.getByRole('link', { name: 'トップ100を見る' }).click();
    await expect(signedInPage).toHaveURL('/ranking', { timeout: 10000 });

    await expect(signedInPage.getByRole('heading', { name: 'アクションリーダー' })).toBeVisible();
    await expect(signedInPage.getByText('安野たかひろ')).toBeVisible();
    await expect(signedInPage.getByText('佐藤太郎')).toBeVisible();
    await expect(signedInPage.getByText('渡辺雄一')).toBeVisible();

    await signedInPage.getByText('都道府県別').click();
    await expect(signedInPage).toHaveURL('/ranking/ranking-prefecture', { timeout: 10000 });
    await expect(signedInPage.getByText('都道府県を選択')).toBeVisible();
    await expect(signedInPage.getByRole('heading', { name: '東京都トップ' })).toBeVisible();
    await expect(signedInPage.getByText('安野たかひろ')).toBeVisible();
    await expect(signedInPage.getByText('佐藤太郎')).toBeVisible();

    await signedInPage.getByText('ミッション別').click();
    await expect(signedInPage).toHaveURL('/ranking/ranking-mission', { timeout: 10000 });
    await expect(signedInPage.getByText('ミッションを選択')).toBeVisible();
    await expect(signedInPage.getByRole('heading', { name: '「(seed) ゴミ拾いをしよう (成果物不要)」トップ100' })).toBeVisible();

    await signedInPage.getByText('全体').click();
    await expect(signedInPage).toHaveURL('/ranking', { timeout: 10000 });
    await expect(signedInPage.getByRole('heading', { name: 'アクションリーダー' })).toBeVisible();
  });
});
