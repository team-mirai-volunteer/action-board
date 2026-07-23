import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/types/supabase";

const CAMPAIGN_COOKIE = "campaign_code";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません",
    );
  }
  return createClient<Database>(url, serviceRoleKey);
}

/**
 * CampaignCodeHandler（クライアントコンポーネント）がハイドレーション後に
 * URL から ?cv= を除去するまで待つ
 */
async function waitForCampaignParamRemoval(
  page: import("@playwright/test").Page,
) {
  await page.waitForFunction(
    () => !window.location.search.includes("cv="),
    undefined,
    { timeout: 20000 },
  );
}

test.describe("キャンペーンコード（?cv=）アトリビューション", () => {
  test("?cv= 付きURLで着地するとcookieに保存され、URLからパラメータが消える", async ({
    page,
  }) => {
    await page.goto("/?cv=e2e-campaign-cookie", { timeout: 20000 });

    await waitForCampaignParamRemoval(page);

    const cookies = await page.context().cookies();
    const campaignCookie = cookies.find((c) => c.name === CAMPAIGN_COOKIE);
    expect(campaignCookie?.value).toBe("e2e-campaign-cookie");
  });

  test("形式が不正なコードはcookieに保存されない", async ({ page }) => {
    // 空白と記号を含む不正なコード
    await page.goto("/?cv=bad%20code%21", { timeout: 20000 });

    await waitForCampaignParamRemoval(page);

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === CAMPAIGN_COOKIE)).toBeUndefined();
  });

  test("?cv= 経由でサインアップするとuser_campaign_attributionに保存される", async ({
    page,
  }) => {
    const randomStr = Math.random().toString(36).substring(2, 10);
    const campaignCode = `e2e-cv-${randomStr}`;
    const testEmail = `test-campaign-${randomStr}@example.com`;

    // 1. キャンペーンコード付きURLで着地（cookieに保存される）
    await page.goto(`/?cv=${campaignCode}`, { timeout: 20000 });
    await waitForCampaignParamRemoval(page);

    // 2. サインアップ（メール/パスワード経路）
    await page.goto("/sign-up", { timeout: 20000 });
    await page.waitForLoadState("networkidle");

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
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    await expect(page).toHaveURL(/\/sign-up-success/, { timeout: 15000 });

    // 3. サインアップ時にキャンペーンコードが登録者本人に紐づけてDB保存されている
    //    （保存は signUp() 直後・メール認証前に行われる）
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_campaign_attribution")
      .select("user_id, campaign_code")
      .eq("campaign_code", campaignCode);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    // 4. 使用済みのcookieは削除されている
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === CAMPAIGN_COOKIE)).toBeUndefined();

    // 後片付け: テストユーザーを削除（attribution行はon delete cascadeで消える）
    if (data?.[0]?.user_id) {
      await admin.auth.admin.deleteUser(data[0].user_id);
    }
  });
});
