import {
  assertAuthState,
  expect,
  generateRandomEmail,
  test,
} from "../e2e-test-helpers";

test.describe("ポスター掲示板マップ機能", () => {
  // テスト用のユーザーを作成してログイン
  test.beforeEach(async ({ page }) => {
    // 1. テスト用ユーザーを作成
    await page.goto("/sign-up");
    
    // 年齢情報を入力
    await page.getByTestId("year_select").press("Enter");
    await page.getByRole("option", { name: "2001年" }).click();
    await page.getByTestId("month_select").press("Enter");
    await page.getByRole("option", { name: "3月" }).click();
    await page.getByTestId("day_select").press("Enter");
    await page.getByRole("option", { name: "14日" }).click();
    
    // 利用規約に同意
    await page.locator("#terms").click();
    await page.getByRole("button", { name: "次へ進む" }).click();
    
    // メールアドレスとパスワードで作成を選択
    await page.getByRole("button", { name: "メールアドレスとパスワードで作成" }).click();
    
    // メールアドレスとパスワードを入力
    const testEmail = generateRandomEmail();
    const testPassword = "TestPassword123!";
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "アカウントを作成" }).click();
    
    // サインアップ成功を確認
    await expect(page).toHaveURL(/\/sign-up-success/, { timeout: 10000 });
    
    // 2. ログイン
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "ログイン", exact: true }).click();
    
    // ログイン成功を確認
    await page.waitForURL("/", { timeout: 15000 });
    await assertAuthState(page, true);
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
    await expect(page.getByText("ステータスを更新")).toBeVisible();
    
    // 4. ステータスを "未貼付" から "予約" に変更
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "予約" }).click();
    
    // メモを入力（オプション）
    await page.fill('textarea[id="note"]', 'E2Eテストで予約しました');
    
    // 更新ボタンをクリック
    await page.getByRole("button", { name: "更新" }).click();
    
    // 成功メッセージが表示されることを確認
    await expect(page.getByText("ステータスを更新しました")).toBeVisible({ timeout: 5000 });
    
    // 5. ページをリロードして変更が保持されていることを確認
    await page.reload();
    
    // 地図が再度読み込まれるのを待つ
    await page.waitForTimeout(2000);
    
    // 同じマーカーをクリック
    const reloadedMarker = page.locator('.custom-marker').first();
    await expect(reloadedMarker).toBeVisible({ timeout: 10000 });
    await reloadedMarker.click();
    
    // ダイアログが表示され、ステータスが "予約" になっていることを確認
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // コンボボックスの現在の値を確認
    const comboboxValue = await page.getByRole("combobox").textContent();
    expect(comboboxValue).toContain("予約");
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
      await expect(page.getByText(status)).toBeVisible();
    }
  });

  test("都道府県詳細ページから一覧に戻れる", async ({ page }) => {
    // 東京都の詳細ページに直接移動
    await page.goto("/map/poster/tokyo");
    
    // 戻るボタンをクリック
    await page.getByRole("button", { name: "" }).filter({ has: page.locator('[class*="ArrowLeft"]') }).click();
    
    // ポスター掲示板マップ一覧ページに戻ることを確認
    await expect(page).toHaveURL("/map/poster");
    await expect(page.getByRole("heading", { name: "ポスター掲示板マップ" })).toBeVisible();
  });
});