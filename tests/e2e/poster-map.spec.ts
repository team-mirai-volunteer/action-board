import {
  assertAuthState,
  expect,
  test,
} from "../e2e-test-helpers";

test.describe("ポスター掲示板マップ機能", () => {
  // 既存のダミーユーザーでログイン
  test.beforeEach(async ({ page }) => {
    // seed.sqlで作成済みのユーザーでログイン
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', "takahiroanno@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.getByRole("button", { name: "ログイン", exact: true }).click();
    
    // ログイン成功を確認
    await page.waitForURL("/", { timeout: 15000 });
    await assertAuthState(page, true);
    
    // ナビゲーションが完了するまで少し待つ
    await page.waitForTimeout(1000);
  });

  test("ポスター掲示板マップで東京の掲示板ステータスを更新できる", async ({ page }) => {
    // 1. ポスター掲示板マップページに移動
    await page.goto("/map/poster");
    
    // ページが読み込まれるのを待つ
    await expect(page.getByRole("heading", { name: "ポスター掲示板マップ" })).toBeVisible();
    
    // 2. 東京都のカードを探してクリック
    await page.getByText("東京都").click();
    
    // 東京都のポスター掲示板ページに遷移することを確認
    await expect(page).toHaveURL("/map/poster/tokyo");
    await expect(page.getByRole("heading", { name: "東京都のポスター掲示板" })).toBeVisible();
    
    // 地図が読み込まれるのを待つ
    await page.waitForTimeout(2000); // 地図の読み込みを待つ
    
    // 3. 地図上の最初のマーカーをクリック
    // Leafletマーカーはカスタムdivアイコンとして実装されているため、その要素を探す
    const marker = page.locator('.custom-marker').first();
    await expect(marker).toBeVisible({ timeout: 10000 });
    await marker.click();
    
    // ステータス更新ダイアログが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "ステータスを更新" })).toBeVisible();
    
    // 現在のステータスが「予約」でないことを確認
    const initialStatus = await page.getByRole("combobox").textContent();
    expect(initialStatus).toContain("未貼付");
    
    // 4. ステータスを変更（現在のステータスに関わらず「予約」に変更）
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "予約" }).click();
    
    // メモを入力（オプション）
    await page.fill('textarea[id="note"]', 'E2Eテストで予約しました');
    
    // 更新ボタンをクリック
    await page.getByRole("button", { name: "更新" }).click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.getByText("ステータスを更新しました")).toBeVisible({ timeout: 5000 });
    
    // ダイアログが閉じるのを待つ
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    
    // 5. 同じマーカーを再度クリックして変更が反映されていることを確認
    await marker.click();
    
    // ダイアログが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // ステータスが "予約" になっていることを確認
    const updatedStatus = await page.getByRole("combobox").textContent();
    expect(updatedStatus).toContain("予約");
    
    // ダイアログを閉じる
    await page.keyboard.press('Escape');
  });

  test("ポスター掲示板マップの都道府県一覧が正しく表示される", async ({ page }) => {
    // ポスター掲示板マップページに移動
    await page.goto("/map/poster");
    
    // ページタイトルが表示されることを確認
    await expect(page.getByRole("heading", { name: "ポスター掲示板マップ" })).toBeVisible();
    
    // 全体の進捗状況カードが表示されることを確認
    await expect(page.getByText("全体の進捗状況")).toBeVisible();
    await expect(page.getByText("総掲示板数")).toBeVisible();
    await expect(page.getByText("貼付完了")).toBeVisible();
    await expect(page.getByText("達成率")).toBeVisible();
    
    // 都道府県リストが表示されることを確認
    const prefectures = [
      "北海道", "宮城県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "長野県", "愛知県", "大阪府", "兵庫県", "愛媛県", "福岡県"
    ];
    
    for (const prefecture of prefectures) {
      await expect(page.getByText(prefecture)).toBeVisible();
    }
  });

  test("都道府県詳細ページでステータス凡例が表示される", async ({ page }) => {
    // ポスター掲示板マップページに移動
    await page.goto("/map/poster");
    
    // 東京都をクリック
    await page.getByText("東京都").click();
    
    // 東京都のページに遷移することを確認
    await expect(page).toHaveURL("/map/poster/tokyo");
    
    // ステータス凡例が表示されることを確認
    await expect(page.getByText("ステータス凡例")).toBeVisible();
    
    // 各ステータスが表示されることを確認
    const statuses = ["未貼付", "予約", "貼付済", "確認済", "損傷", "エラー", "その他"];
    for (const status of statuses) {
      // 凡例内のステータステキストを正確に選択
      await expect(page.getByText(status, { exact: true }).last()).toBeVisible();
    }
  });

  test("再度マップに戻ると状態が保存されている", async ({ page }) => {
    // 東京都の詳細ページに直接移動
    await page.goto("/map/poster/tokyo");
    
    // ページが読み込まれるのを待つ
    await expect(page.getByRole("heading", { name: "東京都のポスター掲示板" })).toBeVisible();
    
    // 地図が読み込まれるのを待つ
    await page.waitForTimeout(2000);
    
    // 最初のマーカーが「予約」ステータスになっていることを確認
    // (前のテストで更新したマーカーが予約状態であることを確認)
    const firstMarker = page.locator('.custom-marker').first();
    await expect(firstMarker).toBeVisible({ timeout: 10000 });
    
    // マーカーの色が予約ステータスの色（黄色/オレンジ）であることを視覚的に確認
    // 予約ステータスの色は #F59E0B
    const markerStyle = await firstMarker.locator('div').getAttribute('style');
    expect(markerStyle).toContain('background-color: #F59E0B');
    
    // テストクリーンアップ: マーカーをクリックしてステータスを「未貼付」に戻す
    await firstMarker.click();
    
    // ステータス更新ダイアログが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // ステータスを「未貼付」に変更
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "未貼付" }).click();
    
    // 更新ボタンをクリック
    await page.getByRole("button", { name: "更新" }).click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.getByText("ステータスを更新しました")).toBeVisible({ timeout: 5000 });
    
    // ダイアログが閉じるのを待つ
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    
    // マーカーが「未貼付」ステータスに戻ったことを確認
    // 未貼付ステータスの色は #6B7280 (gray)
    const updatedMarkerStyle = await firstMarker.locator('div').getAttribute('style');
    expect(updatedMarkerStyle).toContain('background-color: #6B7280');
  });

  test("都道府県詳細ページから一覧に戻れる", async ({ page }) => {
    // 東京都の詳細ページに直接移動
    await page.goto("/map/poster/tokyo");
    
    // ページが読み込まれるのを待つ
    await expect(page.getByRole("heading", { name: "東京都のポスター掲示板" })).toBeVisible();
    
    // 戻るボタンをクリック（左矢印アイコンのボタン）
    await page.getByRole("button").first().click();
    
    // ポスター掲示板マップ一覧ページに戻ることを確認
    await expect(page).toHaveURL("/map/poster");
    await expect(page.getByRole("heading", { name: "ポスター掲示板マップ" })).toBeVisible();
  });
});
