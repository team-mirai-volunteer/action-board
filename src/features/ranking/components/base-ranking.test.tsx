import { render, screen } from "@testing-library/react";
import type React from "react";
import { BaseRanking } from "./base-ranking";
import "@testing-library/jest-dom";

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

jest.mock("lucide-react", () => ({
  ChevronRight: ({ className }: { className?: string }) => (
    <div className={className} data-testid="chevron-right" />
  ),
}));

describe("BaseRanking", () => {
  describe("基本的な表示", () => {
    it("タイトルが正しく表示される", () => {
      render(
        <BaseRanking title="テストランキング" detailsHref="/test">
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.getByText("テストランキング")).toBeInTheDocument();
    });

    it("子要素が正しくレンダリングされる", () => {
      render(
        <BaseRanking title="テストランキング" detailsHref="/test">
          <div data-testid="child-content1">子要素のコンテンツ1</div>
          <div data-testid="child-content2">子要素のコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.getByTestId("child-content1")).toBeInTheDocument();
      expect(screen.getByTestId("child-content2")).toBeInTheDocument();
      expect(screen.getByText("子要素のコンテンツ1")).toBeInTheDocument();
      expect(screen.getByText("子要素のコンテンツ2")).toBeInTheDocument();
    });

    it("Cardコンポーネントがレンダリングされる", () => {
      render(
        <BaseRanking title="テストランキング" detailsHref="/test">
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });
  });

  describe("詳細リンクの表示", () => {
    it("showDetailedInfoがtrueかつdetailsHrefがある場合、リンクが表示される", () => {
      render(
        <BaseRanking
          title="テストランキング"
          detailsHref="/test-details"
          showDetailedInfo={true}
        >
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      const link = screen.getByTestId("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test-details");
      expect(screen.getByText("トップ100を見る")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
    });

    it("showDetailedInfoがfalseの場合、リンクが表示されない", () => {
      render(
        <BaseRanking
          title="テストランキング"
          detailsHref="/test-details"
          showDetailedInfo={false}
        >
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
      expect(screen.queryByText("トップ100を見る")).not.toBeInTheDocument();
    });

    it("detailsHrefがない場合、showDetailedInfoがtrueでもリンクが表示されない", () => {
      render(
        <BaseRanking title="テストランキング" showDetailedInfo={true}>
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
    });

    it("showDetailedInfoのデフォルト値はfalse", () => {
      render(
        <BaseRanking title="テストランキング" detailsHref="/test-details">
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
    });

    it("カスタムリンクテキストが設定できる", () => {
      render(
        <BaseRanking
          title="テストランキング"
          detailsHref="/test-details"
          showDetailedInfo={true}
          detailsLinkText="すべて見る"
        >
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.getByText("すべて見る")).toBeInTheDocument();
    });
  });

  describe("propsの組み合わせ", () => {
    it("すべてのpropsを指定した場合", () => {
      render(
        <BaseRanking
          title="カスタムタイトル"
          detailsHref="/custom-link"
          showDetailedInfo={true}
          detailsLinkText="もっと見る"
        >
          <div data-testid="custom-child1">カスタム子要素1</div>
          <div data-testid="custom-child2">カスタム子要素2</div>
        </BaseRanking>,
      );

      expect(screen.getByText("カスタムタイトル")).toBeInTheDocument();
      expect(screen.getByTestId("custom-child1")).toBeInTheDocument();
      expect(screen.getByTestId("custom-child2")).toBeInTheDocument();
      expect(screen.getByText("もっと見る")).toBeInTheDocument();
      expect(screen.getByTestId("link")).toHaveAttribute(
        "href",
        "/custom-link",
      );
    });

    it("最小限のpropsのみ指定した場合", () => {
      render(
        <BaseRanking title="最小限のタイトル">
          <div>最小限のコンテンツ1</div>
          <div>最小限のコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.getByText("最小限のタイトル")).toBeInTheDocument();
      expect(screen.getByText("最小限のコンテンツ1")).toBeInTheDocument();
      expect(screen.getByText("最小限のコンテンツ2")).toBeInTheDocument();
      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("子要素が空の場合、空の状態メッセージが表示される", () => {
      render(<BaseRanking title="テストランキング">{[]}</BaseRanking>);

      expect(screen.getByText("まだ達成者がいません")).toBeInTheDocument();
      expect(screen.queryByTestId("child-content1")).not.toBeInTheDocument();
    });

    it("子要素がすべてnullの場合、空の状態メッセージが表示される", () => {
      render(
        <BaseRanking title="テストランキング">
          {null}
          {null}
        </BaseRanking>,
      );

      expect(screen.getByText("テストランキング")).toBeInTheDocument();
    });

    it("複数の子要素を渡してもレンダリングされる", () => {
      render(
        <BaseRanking title="テストランキング">
          <div data-testid="child-1">子要素1</div>
          <div data-testid="child-2">子要素2</div>
          <div data-testid="child-3">子要素3</div>
        </BaseRanking>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("空のdetailsHrefでもエラーにならない", () => {
      render(
        <BaseRanking
          title="テストランキング"
          detailsHref=""
          showDetailedInfo={true}
        >
          <div>テストコンテンツ1</div>
          <div>テストコンテンツ2</div>
        </BaseRanking>,
      );

      expect(screen.queryByTestId("link")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("タイトルが見出しとして適切に設定される", () => {
      render(
        <BaseRanking title="アクセシブルなタイトル">
          <div>コンテンツ1</div>
          <div>コンテンツ2</div>
        </BaseRanking>,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("アクセシブルなタイトル");
    });

    it("リンクに適切なテキストが含まれる", () => {
      render(
        <BaseRanking
          title="テストランキング"
          detailsHref="/test"
          showDetailedInfo={true}
        >
          <div>コンテンツ1</div>
          <div>コンテンツ2</div>
        </BaseRanking>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("トップ100を見る");
    });
  });
});
