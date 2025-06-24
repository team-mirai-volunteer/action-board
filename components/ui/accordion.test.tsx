import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

describe("Accordion Components", () => {
  describe("Accordion", () => {
    it("基本的なアコーディオンが表示される", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>テストタイトル</AccordionTrigger>
            <AccordionContent>テストコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText("テストタイトル")).toBeInTheDocument();
    });

    it("複数のアイテムを持つアコーディオン", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>タイトル1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>タイトル2</AccordionTrigger>
            <AccordionContent>コンテンツ2</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText("タイトル1")).toBeInTheDocument();
      expect(screen.getByText("タイトル2")).toBeInTheDocument();
    });
  });

  describe("AccordionItem", () => {
    it("アイテムが正しく表示される", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="test-item">
            <AccordionTrigger>テストアイテム</AccordionTrigger>
            <AccordionContent>アイテムコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText("テストアイテム")).toBeInTheDocument();
    });
  });

  describe("AccordionTrigger", () => {
    it("トリガーボタンが表示される", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="test">
            <AccordionTrigger>クリック可能なトリガー</AccordionTrigger>
            <AccordionContent>隠されたコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent("クリック可能なトリガー");
    });

    it("トリガーをクリックするとコンテンツが表示される", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="test">
            <AccordionTrigger>トリガー</AccordionTrigger>
            <AccordionContent>表示されるコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      expect(screen.getByText("表示されるコンテンツ")).toBeInTheDocument();
    });
  });

  describe("AccordionContent", () => {
    it("コンテンツが正しく表示される", () => {
      render(
        <Accordion type="single" collapsible defaultValue="test">
          <AccordionItem value="test">
            <AccordionTrigger>トリガー</AccordionTrigger>
            <AccordionContent>表示されるコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText("表示されるコンテンツ")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なARIA属性が設定される", () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="test">
            <AccordionTrigger>アクセシブルなトリガー</AccordionTrigger>
            <AccordionContent>アクセシブルなコンテンツ</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-expanded");
    });
  });
});
