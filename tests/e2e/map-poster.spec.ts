import type { Page } from "@playwright/test";
import { assertAuthState, expect, test } from "../e2e-test-helpers";

async function testPrefectureNavigation(page: Page, name: string, url: RegExp) {
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
    await expect(signedInPage).toHaveURL(/\/map\/poster\/elections/, {
      timeout: 10000,
    });
    await expect(
      signedInPage.locator("h1").getByText("選挙一覧"),
    ).toBeVisible();
    await signedInPage
      .getByRole("link", { name: "参院選 期間: 2025/7/2 - 2025/7/20" })
      .click();
    await expect(signedInPage).toHaveURL(/\/map\/poster\/elections\//, {
      timeout: 10000,
    });

    // 各都道府県マップに遷移（簡潔化）
    const prefectureTests = [
      { name: "北海道", url: /\/hokkaido$/ },
      { name: "宮城県", url: /\/miyagi$/ },
      { name: "埼玉県", url: /\/saitama$/ },
      { name: "千葉県", url: /\/chiba$/ },
      { name: "東京都", url: /\/tokyo$/ },
      { name: "神奈川県", url: /\/kanagawa$/ },
      { name: "長野県", url: /\/nagano$/ },
      { name: "愛知県", url: /\/aichi$/ },
      { name: "大阪府", url: /\/osaka$/ },
      { name: "兵庫県", url: /\/hyogo$/ },
      { name: "愛媛県", url: /\/ehime$/ },
      { name: "福岡県", url: /\/fukuoka$/ },
    ];

    const electionUrl = signedInPage.url();
    for (const { name, url } of prefectureTests) {
      await testPrefectureNavigation(signedInPage, name, url);
      await signedInPage.goto(electionUrl);
      await expect(signedInPage).toHaveURL(electionUrl, { timeout: 10000 });
    }

    // ミッション一覧に戻る
    await signedInPage
      .getByRole("link", { name: "ミッション一覧に戻る" })
      .click();
    await expect(signedInPage).toHaveURL(/\/#featured-missions/, {
      timeout: 10000,
    });
  });
});
