import { test as setup } from "@playwright/test";

/**
 * テスト前のセットアップを行うためのフィクスチャ
 * 必要に応じて特定のテスト用データを作成する
 */

// テスト用アカウント情報
const TEST_ACCOUNT = {
  email: "setup-test@example.com",
  password: "TestSetup123!",
};

// 初期セットアップ - 認証状態をリセット
setup("テスト実行前のセットアップ", async ({ context }) => {
  // すべてのブラウザコンテキストでストレージをクリア
  await context.clearCookies();

  const page = await context.newPage();

  // ローカルストレージとセッションストレージをクリア
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.close();
});

setup("テスト用アカウントのセットアップ", async ({ page }) => {
  // サインアップページを開く
  await page.goto("/sign-up");

  // 新規アカウントを作成（すでに存在する場合はエラーになるが無視）
  await page.fill('input[name="email"]', TEST_ACCOUNT.email);
  await page.fill('input[name="password"]', TEST_ACCOUNT.password);
  await page.getByRole("button", { name: "Sign up" }).click();

  // 利用規約に同意する
  await page.locator("#terms").click();
  // プライバシーポリシーに同意する
  await page.locator("#privacy").click();

  // 結果に関わらず進める（既存アカウントの場合はエラーになるが、テスト自体は進行させる）
  try {
    await page.waitForSelector("text=Thanks for signing up!", {
      timeout: 5000,
    });
    console.log("テスト用アカウントを作成しました");
  } catch (_e) {
    console.log("テスト用アカウントはすでに存在しているかもしれません");
  }
});
