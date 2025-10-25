import { render, screen } from "@testing-library/react";
import { SocialBadge } from "./social-badge";

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="badge">{children}</div>
  ),
}));

describe("SocialBadge の URL 検証", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    warnSpy.mockRestore();
  });

  it("href が有効なら（特殊文字を含んでも）レンダリングされる", () => {
    const validHrefs = [
      "https://x.com/user name",
      "https://x.com/user+plus",
      "https://x.com/user/with/slash",
      "https://x.com/ユーザー名",
      "https://github.com/user?param=value",
      "https://x.com/user#fragment",
    ];

    for (const href of validHrefs) {
      const { unmount } = render(
        <SocialBadge
          title="@user"
          href={href}
          logoSrc="/img/x_logo.png"
          logoAlt="X logo"
          logoSize={16}
        />,
      );

      expect(screen.getByTestId("badge")).toBeInTheDocument();
      expect(screen.getByText("@user")).toBeInTheDocument();
      // 有効な URL では warn されない
      expect(warnSpy).not.toHaveBeenCalled();
      unmount();
      jest.clearAllMocks();
    }
  });

  it("href が無効なら null を返し warn を出す", () => {
    const invalidHrefs = [
      "", // empty
      "notaurl", // no scheme/host
      "x.com/user", // missing scheme
      "https://", // missing host
      "javascript:alert(1)", // disallowed scheme
      "ftp://example.com", // disallowed scheme
    ];

    for (const href of invalidHrefs) {
      const { container, unmount } = render(
        <SocialBadge
          title="@user"
          href={href}
          logoSrc="/img/x_logo.png"
          logoAlt="X logo"
          logoSize={16}
        />,
      );

      // 無効な URL ではコンポーネントは null
      expect(container.firstChild).toBeNull();
      // 無効な URL では warn が呼ばれる
      expect(warnSpy).toHaveBeenCalled();
      unmount();
      jest.clearAllMocks();
    }
  });
});
