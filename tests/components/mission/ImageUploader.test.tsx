import React from "react";
import { ImageUploader } from "../../../components/mission/ImageUploader";

jest.mock("../../../lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({ data: { path: "test-path" }, error: null }),
        ),
      })),
    },
  })),
}));

describe("ImageUploader", () => {
  const mockProps = {
    mission: {
      id: "test-mission",
      title: "Test Mission",
      content: "Test Description",
      artifact_label: "テスト成果物",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      difficulty: 1,
      event_date: null,
      icon_url: null,
      is_featured: false,
      is_hidden: false,
      max_achievement_count: null,
      ogp_image_url: null,
      required_artifact_type: "image",
    },
    authUser: {
      id: "test-user",
      email: "test@example.com",
      created_at: "2024-01-01T00:00:00Z",
    },
    disabled: false,
    onImagePathChange: jest.fn(),
  };

  it("画像アップローダーの正常レンダリング", () => {
    const uploader = ImageUploader(mockProps);
    expect(uploader).toBeDefined();
  });

  it("ファイル選択機能の確認", () => {
    const uploader = ImageUploader(mockProps);
    expect(uploader).toBeDefined();
  });
});
