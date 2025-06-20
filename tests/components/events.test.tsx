import React from "react";
import Events from "../../components/events";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [] })),
      })),
    })),
  })),
}));

describe("Events", () => {
  it("イベントコンポーネントの正常レンダリング", async () => {
    const eventsComponent = await Events();
    expect(eventsComponent.type).toBe("div");
    expect(eventsComponent.props.className).toContain("flex flex-col");
  });

  it("空のイベントリスト処理", async () => {
    const eventsComponent = await Events();
    expect(eventsComponent.props.children[0].props.children).toBe(
      "今後のイベント",
    );
  });
});
