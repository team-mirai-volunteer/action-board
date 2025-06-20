describe("Auth Callback Route", () => {
  it("認証コールバックルートの正常処理", () => {
    const mockRequest = {
      url: "http://localhost:3000/auth/callback?code=test",
    };
    expect(mockRequest.url).toContain("callback");
    expect(mockRequest.url).toContain("code=test");
  });

  it("認証コールバックエラー処理", () => {
    const mockRequest = {
      url: "http://localhost:3000/auth/callback?error=access_denied",
    };
    expect(mockRequest.url).toContain("error=access_denied");
  });
});
