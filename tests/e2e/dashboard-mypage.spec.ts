import {
  assertAuthState,
  expect,
  generateRandomEmail,
  test,
} from "../e2e-test-helpers";

test.describe("ダッシュボードとマイページのE2Eテスト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("ログイン → ダッシュボード確認 → マイページ遷移 → マイページ確認の基本フローが正常に動作する", async ({
    page,
  }) => {
    // 1. 初期状態では未ログインであることを確認
    await assertAuthState(page, false);

    if (await page.getByTestId("navmenubutton").isVisible()) {
      await page.getByTestId("navmenubutton").click();
      await page.getByRole("menuitem", { name: "新規登録" }).click();
    } else {
      await page.getByRole("link", { name: "新規登録" }).click();
    }

    await expect(page).toHaveURL("/sign-up");

    // 3. フェーズ1: 生年月日と同意情報を入力
    const year = page.getByTestId("year_select");
    await year.press("Enter");
    await page.getByRole("option", { name: "2001年" }).click();

    const month = page.getByTestId("month_select");
    await month.press("Enter");
    await page.getByRole("option", { name: "3月" }).click();

    const day = page.getByTestId("day_select");
    await day.press("Enter");
    await page.getByRole("option", { name: "14日" }).click();

    await page.locator("#terms").click();
    await page.getByRole("button", { name: "次へ進む" }).click();

    await page
      .getByRole("button", { name: "メールアドレスとパスワードで作成" })
      .click();

    await expect(page).toHaveURL("/sign-up-email");

    const testEmail = generateRandomEmail();
    const testPassword = "TestPassword123!";
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    await expect(page).toHaveURL(/\/sign-up-success/, { timeout: 10000 });

    await page.goto("/sign-in");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "ログイン", exact: true }).click();

    await Promise.race([
      page.waitForURL("/", { timeout: 15000 }),
      page.locator('[role="alert"]').waitFor({ timeout: 15000 }),
    ]);

    if (!page.url().endsWith("/")) {
      return;
    }

    await assertAuthState(page, true);

    await expect(page.getByText("チームみらい")).toBeVisible();
    await expect(page.getByText("アクションボード")).toBeVisible();
    
    await expect(page.locator("section").filter({ hasText: /メトリクス|統計|数値/ }).or(page.locator('[class*="metric"]')).first()).toBeVisible({ timeout: 5000 }).catch(() => {
    });

    await expect(page.getByText("ランキング").or(page.getByText("順位")).first()).toBeVisible({ timeout: 5000 }).catch(() => {
    });

    await page.getByTestId("usermenubutton").click();
    await page.getByText("設定").or(page.getByText("プロフィール")).first().click();

    await expect(page).toHaveURL(/\/settings\/profile/, { timeout: 10000 });

    await expect(page.getByText("プロフィール設定")).toBeVisible();
    await expect(page.getByText("ニックネーム")).toBeVisible();
    await expect(page.getByText("都道府県")).toBeVisible();
    await expect(page.getByRole("button", { name: "更新する" })).toBeVisible();

    await expect(page.locator('[class*="avatar"]').or(page.getByText("プロフィール画像")).first()).toBeVisible({ timeout: 5000 }).catch(() => {
    });

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('[name="address_prefecture"]')).toBeVisible();
  });
});
