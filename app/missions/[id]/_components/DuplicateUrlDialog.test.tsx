import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DuplicateUrlDialog } from "./DuplicateUrlDialog";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: { children: React.ReactNode; open: boolean }) => (
    <div data-testid="dialog" style={{ display: open ? "block" : "none" }}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: { children: React.ReactNode; onClick: () => void }) => (
    <button type="button" onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe("DuplicateUrlDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    duplicateUrl: "https://www.youtube.com/watch?v=3D0djcN6aWo",
    missionTitle: "YouTube動画切り抜きミッション",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("モーダルが開いている時に表示される", () => {
    render(<DuplicateUrlDialog {...defaultProps} />);

    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveStyle({ display: "block" });
  });

  it("モーダルが閉じている時に非表示になる", () => {
    render(<DuplicateUrlDialog {...defaultProps} isOpen={false} />);

    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveStyle({ display: "none" });
  });

  it("重複URLのタイトルが表示される", () => {
    render(<DuplicateUrlDialog {...defaultProps} />);

    expect(screen.getByText("重複したURLです")).toBeInTheDocument();
  });

  it("ミッションタイトルを含む説明文が表示される", () => {
    render(<DuplicateUrlDialog {...defaultProps} />);

    expect(
      screen.getByText(
        `このYouTube動画のURLは、「${defaultProps.missionTitle}」ミッションで既に提出済みです。`,
      ),
    ).toBeInTheDocument();
  });

  it("重複したURLが表示される", () => {
    render(<DuplicateUrlDialog {...defaultProps} />);

    expect(screen.getByText(defaultProps.duplicateUrl)).toBeInTheDocument();
  });

  it("アラートアイコンが表示される", () => {
    render(<DuplicateUrlDialog {...defaultProps} />);

    expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
  });

  it("閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<DuplicateUrlDialog {...defaultProps} />);

    const closeButton = screen.getByText("別の動画を選択する");
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("異なるYouTube URL形式でも正しく表示される", () => {
    const youtuBeUrl = "https://youtu.be/3D0djcN6aWo";
    render(<DuplicateUrlDialog {...defaultProps} duplicateUrl={youtuBeUrl} />);

    expect(screen.getByText(youtuBeUrl)).toBeInTheDocument();
  });

  it("長いURLでも正しく表示される", () => {
    const longUrl =
      "https://www.youtube.com/watch?v=3D0djcN6aWo&t=123s&list=PLrAXtmRdnEQy4QnTqXRadJ6P-bQn_88n1";
    render(<DuplicateUrlDialog {...defaultProps} duplicateUrl={longUrl} />);

    expect(screen.getByText(longUrl)).toBeInTheDocument();
  });
});
