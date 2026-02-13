import { adminClient, cleanupTestUser } from "./utils";

describe("メール確認URLの検証", () => {
  const createdUserIds: string[] = [];

  afterEach(async () => {
    for (const id of createdUserIds) {
      await cleanupTestUser(id);
    }
    createdUserIds.length = 0;
  });

  test("確認URLにenv(SITE_URL)がリテラルとして含まれない", async () => {
    const email = `test-confirm-${Date.now()}@example.com`;

    // generateLinkはsite_url設定を使って確認URLを構築する
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      password: "TestPassword123!",
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    if (data.user) {
      createdUserIds.push(data.user.id);
    }

    const actionLink = data.properties?.action_link;
    expect(actionLink).toBeDefined();

    // env(SITE_URL)がリテラルとして含まれていないこと
    expect(actionLink).not.toContain("env(");
    expect(actionLink).not.toContain("SITE_URL");

    // 正しいURLフォーマットであること
    expect(() => new URL(actionLink!)).not.toThrow();
  });

  test("メール変更の確認URLにenv(SITE_URL)がリテラルとして含まれない", async () => {
    const email = `test-email-change-${Date.now()}@example.com`;

    // テストユーザーを作成
    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: "TestPassword123!",
        email_confirm: true,
      });

    expect(createError).toBeNull();
    expect(userData.user).not.toBeNull();
    createdUserIds.push(userData.user!.id);

    // メール変更リンクを生成
    const newEmail = `test-new-${Date.now()}@example.com`;
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "email_change_new",
      email,
      newEmail,
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const actionLink = data.properties?.action_link;
    expect(actionLink).toBeDefined();

    // env(SITE_URL)がリテラルとして含まれていないこと
    expect(actionLink).not.toContain("env(");
    expect(actionLink).not.toContain("SITE_URL");

    // 正しいURLフォーマットであること
    expect(() => new URL(actionLink!)).not.toThrow();
  });
});
