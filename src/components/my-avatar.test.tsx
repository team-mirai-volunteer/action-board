import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import MyAvatar from "./my-avatar";

jest.mock("@/components/user-avatar", () => ({
  UserAvatar: ({ url, size, onUpload }: any) => (
    <div data-testid="user-avatar">
      <img src={url} width={size} height={size} alt="avatar" />
      {onUpload && (
        <button type="button" onClick={() => onUpload("new-url")}>
          Upload
        </button>
      )}
    </div>
  ),
}));

describe("MyAvatar", () => {
  const mockProps = {
    className: "test-avatar",
  };

  describe("基本的な表示", () => {
    it("アバターコンポーネントが正しく表示される", async () => {
      render(await MyAvatar(mockProps));

      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("デフォルト表示", async () => {
      render(await MyAvatar({}));

      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });
  });

  describe("認証状態", () => {
    it("ユーザーがログインしていない場合", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({ data: { user: null }, error: null }),
          ),
        },
      });

      render(await MyAvatar({}));

      expect(screen.getByText("ユ")).toBeInTheDocument();
    });

    it("ユーザーがログインしている場合", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: { user: { id: "test-user" } },
              error: null,
            }),
          ),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { name: "テストユーザー", avatar_url: null },
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      render(await MyAvatar({}));

      expect(screen.getByText("テ")).toBeInTheDocument();
    });
  });

  describe("プロフィール情報", () => {
    it("プロフィール名からフォールバックが生成される", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: { user: { id: "test-user" } },
              error: null,
            }),
          ),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { name: "田中太郎", avatar_url: null },
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      render(await MyAvatar({}));

      expect(screen.getByText("田")).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    it("Supabaseエラー時の処理", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: { user: null },
              error: { message: "認証エラー" },
            }),
          ),
        },
      });

      render(await MyAvatar({}));

      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });
  });
});
