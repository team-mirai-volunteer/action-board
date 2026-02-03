import { render, screen } from "@testing-library/react";
import type React from "react";
import { RankingTabs } from "./ranking-tabs";

const mockPathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value, className }: any) => (
    <div className={className} data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div className={className} data-testid="tabs-list">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <div data-testid="tabs-trigger" data-value={value}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
}));

describe("RankingTabs", () => {
  beforeEach(() => {
    mockPathname.mockClear();
  });

  describe("基本的な表示", () => {
    it("タブリストが表示される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
      expect(screen.getByTestId("tabs-content")).toBeInTheDocument();
    });

    it("すべてのタブが表示される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      expect(screen.getByText("全体")).toBeInTheDocument();
      expect(screen.getByText("都道府県別")).toBeInTheDocument();
      expect(screen.getByText("ミッション別")).toBeInTheDocument();
    });

    it("リンクが正しく設定される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const links = screen.getAllByTestId("link");
      expect(links[0]).toHaveAttribute("href", "/ranking");
      expect(links[1]).toHaveAttribute("href", "/ranking/ranking-prefecture");
      expect(links[2]).toHaveAttribute("href", "/ranking/ranking-mission");
    });

    it("子要素が表示される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
    });
  });

  describe("タブ値の決定", () => {
    it("全体ランキングページの場合はoverallが選択される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "overall");

      const tabsContent = screen.getByTestId("tabs-content");
      expect(tabsContent).toHaveAttribute("data-value", "overall");
    });

    it("ミッション別ランキングページの場合はmissionが選択される", () => {
      mockPathname.mockReturnValue("/ranking/ranking-mission");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "mission");

      const tabsContent = screen.getByTestId("tabs-content");
      expect(tabsContent).toHaveAttribute("data-value", "mission");
    });

    it("都道府県別ランキングページの場合はprefectureが選択される", () => {
      mockPathname.mockReturnValue("/ranking/ranking-prefecture");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "prefecture");

      const tabsContent = screen.getByTestId("tabs-content");
      expect(tabsContent).toHaveAttribute("data-value", "prefecture");
    });

    it("ミッション別ランキングページのサブパスでもmissionが選択される", () => {
      mockPathname.mockReturnValue("/ranking/ranking-mission/some-mission");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "mission");
    });

    it("都道府県別ランキングページのサブパスでもprefectureが選択される", () => {
      mockPathname.mockReturnValue("/ranking/ranking-prefecture/tokyo");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "prefecture");
    });

    it("その他のパスの場合はoverallが選択される", () => {
      mockPathname.mockReturnValue("/other-page");

      render(
        <RankingTabs>
          <div>テストコンテンツ</div>
        </RankingTabs>,
      );

      const tabs = screen.getByTestId("tabs");
      expect(tabs).toHaveAttribute("data-value", "overall");
    });
  });

  describe("複数の子要素", () => {
    it("複数の子要素が表示される", () => {
      mockPathname.mockReturnValue("/ranking");

      render(
        <RankingTabs>
          <div>コンテンツ1</div>
          <div>コンテンツ2</div>
        </RankingTabs>,
      );

      expect(screen.getByText("コンテンツ1")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ2")).toBeInTheDocument();
    });
  });
});
