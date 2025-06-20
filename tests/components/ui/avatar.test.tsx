import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

describe("Avatar", () => {
  it("アバターコンポーネント存在確認", () => {
    expect(typeof Avatar).toBe("object");
    expect(typeof AvatarImage).toBe("object");
  });

  it("アバターフォールバック存在確認", () => {
    expect(typeof AvatarFallback).toBe("object");
    expect(Avatar.displayName).toBeDefined();
  });
});
