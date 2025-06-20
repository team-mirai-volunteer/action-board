import React from "react";
import ProfilePage from "../../../../../app/(protected)/settings/profile/page";

jest.mock("../../../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } } }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({ data: { name: "Test User" } }),
          ),
        })),
      })),
    })),
  })),
}));

describe("Profile Page", () => {
  it("プロフィールページの正常レンダリング", async () => {
    const profilePage = await ProfilePage();
    expect(profilePage.type).toBe("div");
    expect(profilePage.props.className).toContain("container");
  });

  it("プロフィールページユーザー情報表示", async () => {
    const profilePage = await ProfilePage();
    expect(profilePage.props.children).toBeDefined();
  });
});
