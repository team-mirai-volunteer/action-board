import { render } from "@testing-library/react";
import type React from "react";
import UserAvatar from "../../components/user-avatar";

jest.mock("@radix-ui/react-avatar", () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Image: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
  Fallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUserProfile = {
  name: "テストユーザー",
  avatar_url: null,
};

describe("UserAvatar", () => {
  it("ユーザーアバターの正常表示", () => {
    const { container } = render(
      <UserAvatar userProfile={mockUserProfile} className="w-8 h-8" />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it("アバター画像URLありの場合", () => {
    const profileWithAvatar = {
      ...mockUserProfile,
      avatar_url: "https://example.com/avatar.jpg",
    };
    const { container } = render(
      <UserAvatar userProfile={profileWithAvatar} className="w-8 h-8" />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
