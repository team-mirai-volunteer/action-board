import { expect, test } from "@playwright/test";

const INBUCKET_URL = "http://localhost:54324";

/**
 * Inbucketからメールボックスのメッセージ一覧を取得する
 */
async function getInbucketMessages(mailbox: string) {
  const response = await fetch(`${INBUCKET_URL}/api/v1/mailboxes/${mailbox}`);
  if (!response.ok) {
    throw new Error(`Inbucket API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Inbucketから特定のメッセージを取得する
 */
async function getInbucketMessage(mailbox: string, messageId: string) {
  const response = await fetch(
    `${INBUCKET_URL}/api/v1/mailboxes/${mailbox}/${messageId}`,
  );
  if (!response.ok) {
    throw new Error(`Inbucket API error: ${response.status}`);
  }
  return response.json();
}

/**
 * メール本文からリンクURLを抽出する
 */
function extractConfirmationUrl(htmlBody: string): string | null {
  // メールテンプレートのボタンリンクからURLを抽出
  const match = htmlBody.match(/href="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Inbucketにメールが届くまで待機する
 */
async function waitForEmail(
  mailbox: string,
  timeoutMs = 10000,
): Promise<{ id: string }[]> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const messages = await getInbucketMessages(mailbox);
    if (messages.length > 0) {
      return messages;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for email in mailbox: ${mailbox}`);
}

test.describe("新規登録フロー（メール確認含む）", () => {
  test("サインアップ → メール確認 → ログイン完了", async ({ page }) => {
    // ランダムなメールアドレスを生成
    const randomStr = Math.random().toString(36).substring(2, 10);
    const testEmail = `test-confirm-${randomStr}@example.com`;
    const mailbox = `test-confirm-${randomStr}`;

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

    // 6. Inbucketでメールを確認
    const messages = await waitForEmail(mailbox);
    expect(messages.length).toBeGreaterThan(0);

    // 7. メール本文を取得して確認URLを抽出
    const message = await getInbucketMessage(mailbox, messages[0].id);
    const htmlBody = message.body?.html || "";
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
    // PKCE成功 → ホームページ（/）にリダイレクト
    // PKCE失敗 → サインインページ（/sign-in）にリダイレクト（メール認証は完了している）
    await page.waitForURL(/^\/(sign-in)?(\?.*)?$/, { timeout: 15000 });

    const currentUrl = page.url();
    if (currentUrl.includes("/sign-in")) {
      // PKCE検証失敗のケース: メール認証は完了しているのでログインできる
      await expect(page.getByText("メール認証が完了しました")).toBeVisible();

      // ログイン情報を入力
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.getByRole("button", { name: "ログイン", exact: true }).click();

      // ホームページにリダイレクトされることを確認
      await page.waitForURL("/", { timeout: 15000 });
    }

    // 11. ログイン状態であることを確認（ユーザーメニューが表示される）
    await expect(page.getByTestId("usermenubutton")).toBeVisible({
      timeout: 10000,
    });
  });
});
