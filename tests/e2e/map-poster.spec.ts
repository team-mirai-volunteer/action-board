import type { Page } from "@playwright/test";
import { assertAuthState, expect, test } from "../e2e-test-helpers";

async function testDistrictNavigation(page: Page, name: string, url: string) {
  const link = page.getByRole("link", { name });
  await expect(link).toBeVisible({ timeout: 10000 });
  await link.click();

  await expect(page).toHaveURL(url, { timeout: 10000 });
}

test.describe("ポスター掲示板マップのe2eテスト", () => {
  test("ポスター掲示板マップ遷移が正常に動作する", async ({ signedInPage }) => {
    await assertAuthState(signedInPage, true);

    // ポスター掲示板マップに遷移
    await signedInPage.getByTestId("usermenubutton").click();
    await signedInPage.getByText("ポスター掲示板マップ").click();
    await expect(signedInPage).toHaveURL(/\/map\/poster/, { timeout: 10000 });
    await expect(
      signedInPage.locator("h1").getByText("ポスター掲示板マップ"),
    ).toBeVisible();
    await expect(signedInPage.getByText("選挙区から選択")).toBeVisible();

    // 各選挙区マップに遷移（区割り対応版）
    const districtTests = [{ name: "東京1区", url: "/map/poster/tokyo-1" }];

    for (const { name, url } of districtTests) {
      await signedInPage.goto("/map/poster");
      await testDistrictNavigation(signedInPage, name, url);
    }

    // 一覧に戻って「ミッション一覧に戻る」を確認
    await signedInPage.goto("/map/poster");

    // ミッション一覧に戻る
    await signedInPage
      .getByRole("link", { name: "ミッション一覧に戻る" })
      .click();
    await expect(signedInPage).toHaveURL(/\/#featured-missions/, {
      timeout: 10000,
    });
  });
});
