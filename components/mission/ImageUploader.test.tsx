import { ImageUploader } from "@/components/mission/ImageUploader";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { mockSupabaseClient } from "../../tests/__mocks__/supabase";

jest.mock("@/lib/supabase/client", () =>
  require("../../tests/__mocks__/supabase"),
);

const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  created_at: "2025-06-22T00:00:00Z",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  role: "authenticated",
};

const mockMission: Tables<"missions"> = {
  id: "test-mission-1",
  title: "テストミッション",
  content: "テストミッションの内容",
  difficulty: 1,
  icon_url: "/test-icon.svg",
  event_date: null,
  max_achievement_count: null,
  max_daily_achievement_count: null,
  is_featured: false,
  is_hidden: false,
  required_artifact_type: "IMAGE",
  artifact_label: null,
  ogp_image_url: null,
  created_at: "2025-06-22T00:00:00Z",
  updated_at: "2025-06-22T00:00:00Z",
};

describe("ImageUploader", () => {
  const mockOnImagePathChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.FileReader = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onloadend: null,
      result: "data:image/jpeg;base64,test-image-data",
    })) as any;

    global.Date.now = jest.fn(() => 1640995200000);
  });

  it("画像アップロードフォームが表示される", () => {
    render(
      <ImageUploader
        mission={mockMission}
        authUser={mockUser}
        disabled={false}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    expect(screen.getByText("画像ファイル")).toBeInTheDocument();
    expect(screen.getByText("最大ファイルサイズ: 10MB")).toBeInTheDocument();
  });

  it("ファイル選択時にアップロード処理が実行される", async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: "uploaded/file/path.jpg" },
      error: null,
    });

    mockSupabaseClient.storage.from.mockReturnValue({
      upload: mockUpload,
    });

    render(
      <ImageUploader
        mission={mockMission}
        authUser={mockUser}
        disabled={false}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    const fileInput = screen.getByLabelText(/画像ファイル/);
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        "test-user-id/test-mission-1/1640995200000_test.jpg",
        file,
      );
      expect(mockOnImagePathChange).toHaveBeenCalledWith(
        "uploaded/file/path.jpg",
      );
    });
  });

  it("アップロード失敗時にエラーメッセージが表示される", async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Upload failed" },
    });

    mockSupabaseClient.storage.from.mockReturnValue({
      upload: mockUpload,
    });

    render(
      <ImageUploader
        mission={mockMission}
        authUser={mockUser}
        disabled={false}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    const fileInput = screen.getByLabelText(/画像ファイル/);
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText("アップロードに失敗しました: Upload failed"),
      ).toBeInTheDocument();
      expect(mockOnImagePathChange).toHaveBeenCalledWith(undefined);
    });
  });

  it("ファイルが選択されていない場合はエラーメッセージが表示される", async () => {
    render(
      <ImageUploader
        mission={mockMission}
        authUser={mockUser}
        disabled={false}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    const fileInput = screen.getByLabelText(/画像ファイル/);
    fireEvent.change(fileInput, { target: { files: [] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          /ファイルが選択されていないか、ユーザーまたはミッション情報がありません/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("ユーザー情報がない場合はエラーメッセージが表示される", async () => {
    render(
      <ImageUploader
        mission={mockMission}
        authUser={null}
        disabled={false}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    const fileInput = screen.getByLabelText(/画像ファイル/);
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          /ファイルが選択されていないか、ユーザーまたはミッション情報がありません/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("disabledがtrueの場合は入力フィールドが無効化される", () => {
    render(
      <ImageUploader
        mission={mockMission}
        authUser={mockUser}
        disabled={true}
        onImagePathChange={mockOnImagePathChange}
      />,
    );

    const fileInput = screen.getByLabelText(/画像ファイル/);
    expect(fileInput).toBeDisabled();
  });
});
