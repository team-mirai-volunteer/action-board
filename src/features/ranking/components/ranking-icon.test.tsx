import { render, screen } from "@testing-library/react";
import { getRankIcon } from "./ranking-icon";

jest.mock("lucide-react", () => ({
  Crown: ({ className }: { className?: string }) => (
    <div className={className} data-testid="crown-icon" />
  ),
  Trophy: ({ className }: { className?: string }) => (
    <div className={className} data-testid="trophy-icon" />
  ),
  Medal: ({ className }: { className?: string }) => (
    <div className={className} data-testid="medal-icon" />
  ),
}));

describe("getRankIcon", () => {
  it("1位の場合はクラウンアイコンが返される", () => {
    const result = getRankIcon(1);
    render(result);

    expect(screen.getByTestId("crown-icon")).toBeInTheDocument();
  });

  it("2位の場合はトロフィーアイコンが返される", () => {
    const result = getRankIcon(2);
    render(result);

    expect(screen.getByTestId("trophy-icon")).toBeInTheDocument();
  });

  it("3位の場合はメダルアイコンが返される", () => {
    const result = getRankIcon(3);
    render(result);

    expect(screen.getByTestId("medal-icon")).toBeInTheDocument();
  });

  it("4位以下の場合は数字が表示される", () => {
    const result = getRankIcon(4);
    render(result);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("10位の場合は数字が表示される", () => {
    const result = getRankIcon(10);
    render(result);

    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("100位の場合は数字が表示される", () => {
    const result = getRankIcon(100);
    render(result);

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("4位以下の場合は数字のみが表示される", () => {
    const result = getRankIcon(5);
    render(result);

    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
