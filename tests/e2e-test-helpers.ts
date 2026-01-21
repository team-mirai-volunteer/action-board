import { type Page, test as base, expect } from "@playwright/test";
import {
  type TestUser,
  cleanupTestUser,
  createTestUser,
} from "./supabase/rls/utils";

// カスタムテストフィクスチャを定義
type TestFixtures = {
  signedInPage: Page;
  testUser: TestUser;
};

// テストヘルパー関数を拡張したテストオブジェクト
export const test = base.extend<TestFixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: playwrightで First argument must use the object destructuring pattern とでるのを防ぐため.
  testUser: async ({}, use) => {
    const { user } = await createTestUser();
    await use(user);
    await cleanupTestUser(user.userId);
  },

  signedInPage: async ({ page, testUser }, use) => {
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // ログイン完了を確認（ホームページにリダイレクトされることを想定）
    await page.waitForURL("/");

    // ログイン済みのページを渡す
    await use(page);
  },
});

export { expect };

/**
 * テスト用にランダムなメールアドレスを生成する
 * @returns {string} ランダムなメールアドレス
 */
export function generateRandomEmail(): string {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `test-${randomString}@example.com`;
}

/**
 * 認証関連の要素が存在するか確認する
 * @param page Playwrightのページオブジェクト
 * @param isLoggedIn ログイン状態の場合はtrue
 */
export async function assertAuthState(
  page: Page,
  isLoggedIn: boolean,
): Promise<void> {
  if (isLoggedIn) {
    // ログイン時はアバターアイコンが表示されること
    await expect(page.getByTestId("usermenubutton")).toBeVisible();
  } else {
    // 未ログイン時はログインとサインアップリンクが表示されること
    await expect(page.getByTestId("usermenubutton")).not.toBeVisible();
  }
}
