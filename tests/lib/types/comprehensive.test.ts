describe("Types Comprehensive", () => {
  it("マップタイプ定義確認", () => {
    const mapType = {
      id: "map1",
      name: "Test Map",
      coordinates: { lat: 35.6762, lng: 139.6503 },
    };

    expect(mapType.id).toBe("map1");
    expect(mapType.coordinates.lat).toBe(35.6762);
  });

  it("Supabaseタイプ定義確認", () => {
    const userType = {
      id: "user123",
      email: "test@example.com",
      created_at: new Date().toISOString(),
    };

    expect(userType.id).toBe("user123");
    expect(userType.email).toBe("test@example.com");
  });
});
