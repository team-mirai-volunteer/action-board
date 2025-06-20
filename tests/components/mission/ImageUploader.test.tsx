import React from "react";
import ImageUploader from "../../../components/mission/ImageUploader";

describe("ImageUploader", () => {
  it("画像アップローダーの正常レンダリング", () => {
    const uploader = ImageUploader();
    expect(uploader.type).toBe("div");
    expect(uploader.props.className).toContain("space-y-4");
  });

  it("ファイル選択ボタンの存在確認", () => {
    const uploader = ImageUploader();
    expect(uploader.props.children[0].type).toBe("input");
  });
});
