import { render } from "@testing-library/react";
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
      description: "Test Description",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
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
    const { container } = render(<ImageUploader {...mockProps} />);
    expect(container.firstChild).toHaveClass("space-y-2");
  });

  it("ファイル選択ボタンの存在確認", () => {
    const { getByLabelText } = render(<ImageUploader {...mockProps} />);
    expect(getByLabelText(/画像ファイル/)).toBeInTheDocument();
  });
});
