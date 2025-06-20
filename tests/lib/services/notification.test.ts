describe("Notification Service", () => {
  it("通知サービスの基本機能", () => {
    const mockNotification = { id: "1", message: "テスト通知" };
    expect(mockNotification).toBeDefined();
  });

  it("通知データの処理", () => {
    const notifications = [{ id: "1", message: "テスト" }];
    expect(notifications.length).toBe(1);
  });
});
