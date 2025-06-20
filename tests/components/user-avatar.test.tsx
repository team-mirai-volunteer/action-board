import React from "react";
import UserAvatar from "../../components/user-avatar";

const mockUserProfile = {
  name: "テストユーザー",
  avatar_url: null,
};

describe("UserAvatar", () => {
  it("ユーザーアバターの正常表示", () => {
    const avatar = UserAvatar({
      userProfile: mockUserProfile,
      className: "w-8 h-8",
    });
    expect(avatar.type).toBeDefined();
    expect(avatar.props.className).toContain("w-8 h-8");
  });

  it("アバター画像URLありの場合", () => {
    const profileWithAvatar = {
      ...mockUserProfile,
      avatar_url: "https://example.com/avatar.jpg",
    };
    const avatar = UserAvatar({
      userProfile: profileWithAvatar,
      className: "w-8 h-8",
    });
    expect(avatar.props.userProfile.avatar_url).toBe(
      "https://example.com/avatar.jpg",
    );
  });
});
