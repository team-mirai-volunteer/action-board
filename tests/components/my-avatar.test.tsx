import React from "react";
import MyAvatar from "../../components/my-avatar";

jest.mock("../../lib/supabase/server", () => ({
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
            Promise.resolve({
              data: { name: "テストユーザー", avatar_url: null },
            }),
          ),
        })),
      })),
    })),
  })),
}));

describe("MyAvatar", () => {
  it("アバターコンポーネントの正常レンダリング", async () => {
    const myAvatarComponent = await MyAvatar({ className: "w-8 h-8" });
    expect(myAvatarComponent.type).toBeDefined();
    expect(myAvatarComponent.props.className).toContain("w-8 h-8");
  });

  it("クラス名の適用確認", async () => {
    const myAvatarComponent = await MyAvatar({ className: "custom-class" });
    expect(myAvatarComponent.props.className).toContain("custom-class");
  });
});
