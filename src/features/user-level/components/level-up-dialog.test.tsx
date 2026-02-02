import { fireEvent, render, screen } from "@testing-library/react";
import { LevelUpDialog } from "./level-up-dialog";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <button
        type="button"
        data-testid="dialog-root"
        onClick={() => onOpenChange(false)}
      >
        {children}
      </button>
    ) : null,
  DialogContent: ({ children, className, style }: any) => (
    <div data-testid="dialog-content" className={className} style={style}>
      {children}
    </div>
  ),
}));

jest.mock("@radix-ui/react-dialog", () => ({
  DialogTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
}));

jest.mock("next/image", () => {
  return ({ src, alt, width, height, style }: any) => (
    // biome-ignore lint/performance/noImgElement: テスト用モックのため<img>を使用
    <img src={src} alt={alt} width={width} height={height} style={style} />
  );
});

describe("LevelUpDialog", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    newLevel: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("ダイアログが正しく表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    it("レベルアップメッセージが表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByText(/サポーターレベルが/)).toBeInTheDocument();
      expect(screen.getByText(/アップしました！/)).toBeInTheDocument();
    });

    it("レベル数値が表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("LEVEL")).toBeInTheDocument();
    });

    it("パーティクル画像が表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      const particleImage = screen.getByAltText("particle");
      expect(particleImage).toBeInTheDocument();
      expect(particleImage).toHaveAttribute(
        "src",
        "/img/level-up-particle.png",
      );
      expect(particleImage).toHaveAttribute("width", "230");
      expect(particleImage).toHaveAttribute("height", "96");
    });
  });

  describe("ダイアログの開閉", () => {
    it("isOpenがfalseの場合はダイアログが表示されない", () => {
      render(<LevelUpDialog {...mockProps} isOpen={false} />);

      expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();
    });

    it("ダイアログが閉じられるときにonCloseが呼ばれる", () => {
      render(<LevelUpDialog {...mockProps} />);

      const dialog = screen.getByTestId("dialog-root");
      fireEvent.click(dialog);

      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe("様々なレベル値", () => {
    it("レベル1の場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={1} />);

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("高いレベルの場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={50} />);

      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("レベル10の場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={10} />);

      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("画像にalt属性が設定される", () => {
      render(<LevelUpDialog {...mockProps} />);

      const image = screen.getByAltText("particle");
      expect(image).toBeInTheDocument();
    });
  });
});
