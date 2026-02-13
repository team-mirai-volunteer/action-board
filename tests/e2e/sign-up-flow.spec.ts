import { expect, test } from "@playwright/test";

const MAILPIT_URL = "http://localhost:54324";

/**
 * Mailpitから特定の宛先へのメッセージを検索する
 */
async function searchMailpitMessages(toEmail: string) {
  const response = await fetch(
    `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${toEmail}`)}`,
  );
  if (!response.ok) {
    throw new Error(`Mailpit API error: ${response.status}`);
  }
  const data = await response.json();
  return data.messages || [];
}

/**
 * Mailpitから特定のメッセージを取得する
 */
async function getMailpitMessage(messageId: string) {
  const response = await fetch(`${MAILPIT_URL}/api/v1/message/${messageId}`);
  if (!response.ok) {
    throw new Error(`Mailpit API error: ${response.status}`);
  }
  return response.json();
}

/**
 * メール本文からリンクURLを抽出する
 */
function extractConfirmationUrl(htmlBody: string): string | null {
  const match = htmlBody.match(/href="([^"]+)"/);
  if (!match) return null;
  // HTMLエンティティをデコード（&amp; → &）
  return match[1].replace(/&amp;/g, "&");
}

/**
 * Mailpitにメールが届くまで待機する
 */
async function waitForEmail(
  toEmail: string,
  timeoutMs = 15000,
): Promise<{ ID: string }[]> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const messages = await searchMailpitMessages(toEmail);
    if (messages.length > 0) {
      return messages;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for email to: ${toEmail}`);
}

test.describe("新規登録フロー（メール確認含む）", () => {
  test("サインアップ → メール確認 → ログイン完了", async ({ page }) => {
    // ランダムなメールアドレスを生成
    const randomStr = Math.random().toString(36).substring(2, 10);
    const testEmail = `test-confirm-${randomStr}@example.com`;

    // 1. サインアップページに移動
    await page.goto("/sign-up");
    await page.waitForLoadState("networkidle");

    // 2. フェーズ1: 生年月日と同意情報を入力
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

    // 3. フェーズ2: Email + Password を選択
    await page
      .getByRole("button", { name: "メールアドレスとパスワードで作成" })
      .click();

    // 4. メールアドレスとパスワードを入力してアカウント作成
    await expect(page).toHaveURL("/sign-up-email");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    // 5. サインアップ成功ページが表示されることを確認
    await expect(page).toHaveURL(/\/sign-up-success/, { timeout: 10000 });
    await expect(
      page.getByText("ご登録頂きありがとうございます！"),
    ).toBeVisible();

    // 6. Mailpitでメールを確認
    const messages = await waitForEmail(testEmail);
    expect(messages.length).toBeGreaterThan(0);

    // 7. メール本文を取得して確認URLを抽出
    const message = await getMailpitMessage(messages[0].ID);
    const htmlBody = message.HTML || "";
    const confirmationUrl = extractConfirmationUrl(htmlBody);

    // 8. 確認URLの検証
    expect(confirmationUrl).not.toBeNull();
    expect(confirmationUrl).not.toContain("env(");
    expect(confirmationUrl).not.toContain("SITE_URL)");

    const parsedUrl = new URL(confirmationUrl as string);
    expect(parsedUrl.protocol).toMatch(/^https?:$/);

    // 9. 確認URLにアクセスしてメール認証を完了する
    // Supabaseが検証してアプリの /api/auth/callback にリダイレクトする
    await page.goto(confirmationUrl as string);

    // 10. 認証完了後の遷移を確認
    // PKCE成功 → プロフィール設定ページ（/settings/profile?new=true）またはホームページ（/）にリダイレクト
    // PKCE失敗 → サインインページ（/sign-in）にリダイレクト（メール認証は完了している）
    await page.waitForURL(/\/(sign-in|settings\/profile)/, { timeout: 15000 });

    const currentUrl = page.url();
    if (currentUrl.includes("/sign-in")) {
      // PKCE検証失敗のケース: メール認証は完了しているのでログインできる
      await expect(page.getByText("メール認証が完了しました")).toBeVisible();

      // ログイン情報を入力
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.getByRole("button", { name: "ログイン", exact: true }).click();

      // プロフィール設定ページにリダイレクトされることを確認
      await page.waitForURL(/\/settings\/profile/, { timeout: 15000 });
    }

    // 11. ログイン状態であることを確認（プロフィール設定ページが表示される）
    await expect(page.getByTestId("usermenubutton")).toBeVisible({
      timeout: 10000,
    });
  });
});
