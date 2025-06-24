import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select Components", () => {
  describe("Select", () => {
    it("基本的なセレクトが表示される", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">オプション1</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText("選択してください")).toBeInTheDocument();
    });

    it("値が選択された状態", () => {
      render(
        <Select value="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">選択されたオプション</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText("選択されたオプション")).toBeInTheDocument();
    });
  });

  describe("SelectTrigger", () => {
    it("トリガーボタンが表示される", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="クリックして選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">テスト</SelectItem>
          </SelectContent>
        </Select>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("SelectContent", () => {
    it("コンテンツが表示される", () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue placeholder="選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visible">表示されるオプション</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText("表示されるオプション")).toBeInTheDocument();
    });
  });

  describe("SelectItem", () => {
    it("アイテムが正しく表示される", () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">アイテム1</SelectItem>
            <SelectItem value="item2">アイテム2</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText("アイテム1")).toBeInTheDocument();
      expect(screen.getByText("アイテム2")).toBeInTheDocument();
    });
  });

  describe("SelectValue", () => {
    it("プレースホルダーが表示される", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="プレースホルダー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">テスト</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByText("プレースホルダー")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なrole属性が設定される", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">テスト</SelectItem>
          </SelectContent>
        </Select>,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
