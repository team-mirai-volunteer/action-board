import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HorizontalScrollContainer } from "./horizontal-scroll-container";

describe("HorizontalScrollContainer コンポーネント - 追加テスト", () => {
  beforeEach(() => {
    // ResizeObserver をモック
    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      value: MockResizeObserver,
    });
  });

  it("ドラッグ操作でスクロール位置とカーソル/選択状態が切り替わる", () => {
    const { container } = render(
      <HorizontalScrollContainer>
        <div />
      </HorizontalScrollContainer>,
    );

    const scroller = container.querySelector(
      ".custom-scrollbar",
    ) as HTMLDivElement;
    expect(scroller).toBeTruthy();

    // 横スクロール可能な状態にセット + 初期スクロール位置
    Object.defineProperty(scroller, "scrollLeft", {
      value: 100,
      writable: true,
      configurable: true,
    });

    // 初期はドラッグ前: cursor-grab, userSelect は auto（inline style の空文字）
    expect(scroller.className).toContain("cursor-grab");
    expect(
      scroller.style.userSelect === "" || scroller.style.userSelect === "auto",
    ).toBeTruthy();

    // ドラッグ開始（clientX=200）
    fireEvent.mouseDown(scroller, { clientX: 200 });
    // ドラッグ中は cursor-grabbing, userSelect=none
    expect(scroller.className).toContain("cursor-grabbing");
    expect(scroller.style.userSelect).toBe("none");

    // 右方向に 50px ドラッグ（clientX: 250） => scrollLeft は 100 - (250-200) = 50
    fireEvent.mouseMove(scroller, { clientX: 250 });
    expect(scroller.scrollLeft).toBe(50);

    // ドラッグ終了
    fireEvent.mouseUp(scroller);
    expect(scroller.className).toContain("cursor-grab");
    expect(
      scroller.style.userSelect === "" || scroller.style.userSelect === "auto",
    ).toBeTruthy();
  });

  it("リサイズでボタンの表示とカーソル状態が切り替わる", async () => {
    const { container } = render(
      <HorizontalScrollContainer>
        <div />
      </HorizontalScrollContainer>,
    );

    const scroller = container.querySelector(
      ".custom-scrollbar",
    ) as HTMLDivElement;
    Object.defineProperty(scroller, "scrollWidth", {
      value: 1000,
      configurable: true,
    });

    // デスクトップ時は右ボタンが表示され、カーソルは grab
    expect(
      await screen.findByRole("button", { name: "次のミッションを表示" }),
    ).toBeInTheDocument();
    expect(scroller.className).toContain("cursor-grab");

    // モバイル幅に変更
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 600,
    });
    window.dispatchEvent(new Event("resize"));

    // ボタン非表示、カーソル状態もドラッグ向けクラスが外れる
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "次のミッションを表示" }),
      ).toBeNull();
    });
    expect(scroller.className).not.toContain("cursor-grab");
    expect(scroller.className).not.toContain("cursor-grabbing");

    // 再びデスクトップに戻す
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));

    // 条件を満たせば右ボタンが再表示
    expect(
      await screen.findByRole("button", { name: "次のミッションを表示" }),
    ).toBeInTheDocument();
  });

  it("className がマージされ、ドラッグ中も保持される", () => {
    const { container } = render(
      <HorizontalScrollContainer className="my-custom">
        <div />
      </HorizontalScrollContainer>,
    );

    const scroller = container.querySelector(
      ".custom-scrollbar",
    ) as HTMLDivElement;
    expect(scroller).toBeTruthy();

    // マージ確認（custom-scrollbar と my-custom が共存）
    expect(scroller.className).toContain("custom-scrollbar");
    expect(scroller.className).toContain("my-custom");

    // ドラッグで状態が変わっても my-custom は保持される
    fireEvent.mouseDown(scroller, { clientX: 10 });
    expect(scroller.className).toContain("cursor-grabbing");
    expect(scroller.className).toContain("my-custom");
    fireEvent.mouseUp(scroller);
    expect(scroller.className).toContain("cursor-grab");
    expect(scroller.className).toContain("my-custom");
  });
});
