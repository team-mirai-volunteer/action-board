import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs Components", () => {
  describe("Tabs", () => {
    it("基本的なタブが表示される", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">タブ1のコンテンツ</TabsContent>
          <TabsContent value="tab2">タブ2のコンテンツ</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("タブ1")).toBeInTheDocument();
      expect(screen.getByText("タブ2")).toBeInTheDocument();
      expect(screen.getByText("タブ1のコンテンツ")).toBeInTheDocument();
    });

    it("デフォルト値が正しく設定される", () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">タブ1のコンテンツ</TabsContent>
          <TabsContent value="tab2">タブ2のコンテンツ</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("タブ2のコンテンツ")).toBeInTheDocument();
      expect(screen.queryByText("タブ1のコンテンツ")).not.toBeInTheDocument();
    });
  });

  describe("TabsList", () => {
    it("タブリストが正しく表示される", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">リストタブ1</TabsTrigger>
            <TabsTrigger value="tab2">リストタブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>,
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("適切なCSSクラスが設定される", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
        </Tabs>,
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass("inline-flex", "h-9", "items-center");
    });
  });

  describe("TabsTrigger", () => {
    it("タブトリガーが正しく表示される", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">クリック可能タブ</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>,
      );

      const tab = screen.getByRole("tab", { name: "クリック可能タブ" });
      expect(tab).toBeInTheDocument();
    });

    it("タブをクリックするとコンテンツが切り替わる", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>,
      );

      const tab2 = screen.getByRole("tab", { name: "タブ2" });
      fireEvent.click(tab2);

      expect(screen.getByText("コンテンツ2")).toBeInTheDocument();
      expect(screen.queryByText("コンテンツ1")).not.toBeInTheDocument();
    });
  });

  describe("TabsContent", () => {
    it("コンテンツが正しく表示される", () => {
      render(
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger value="test">テストタブ</TabsTrigger>
          </TabsList>
          <TabsContent value="test">テストコンテンツ</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なrole属性が設定される", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">アクセシブルタブ</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">アクセシブルコンテンツ</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getByRole("tab")).toBeInTheDocument();
    });

    it("キーボードナビゲーションが機能する", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>,
      );

      const tab1 = screen.getByRole("tab", { name: "タブ1" });
      const tab2 = screen.getByRole("tab", { name: "タブ2" });

      tab1.focus();
      fireEvent.keyDown(tab1, { key: "ArrowRight" });

      expect(tab2).toHaveFocus();
    });
  });
});
