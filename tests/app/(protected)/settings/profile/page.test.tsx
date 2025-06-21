import React from "react";
import ProfilePage from "../../../../../app/(protected)/settings/profile/page";

describe("Profile Page", () => {
  it("プロフィールページの正常レンダリング", async () => {
    const profilePage = await ProfilePage({
      searchParams: Promise.resolve({ success: "true" }),
    });
    expect(profilePage.type).toBe("div");
    expect(profilePage.props.className).toContain("flex");
  });

  it("プロフィールページユーザー情報表示", async () => {
    const profilePage = await ProfilePage({
      searchParams: Promise.resolve({}),
    });
    expect(profilePage.props.children).toBeDefined();
  });
});
