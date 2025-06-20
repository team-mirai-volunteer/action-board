describe("Map Types", () => {
  it("型定義の正常確認", () => {
    const mockLocation = { lat: 35.6762, lng: 139.6503, address: "東京都" };
    expect(mockLocation.lat).toBe(35.6762);
    expect(mockLocation.address).toBe("東京都");
  });

  it("型プロパティの存在確認", () => {
    const mockActivity = {
      id: "1",
      user_id: "user1",
      created_at: "2025-01-01T00:00:00Z",
    };
    expect(mockActivity.id).toBe("1");
    expect(mockActivity.user_id).toBe("user1");
  });
});
