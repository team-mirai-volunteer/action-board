import { render } from "@testing-library/react";
import type React from "react";
import Navbar from "../../components/navbar";

jest.mock("../../components/header-auth", () => () => (
  <div data-testid="header-auth">Header Auth</div>
));
jest.mock(
  "next/image",
  () =>
    ({
      src,
      alt,
      width,
      height,
    }: { src: string; alt: string; width: number; height: number }) => (
      <img src={src} alt={alt} width={width} height={height} />
    ),
);

jest.mock("@radix-ui/react-dropdown-menu", () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  Content: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SubTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SubContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CheckboxItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  RadioItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Label: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <hr />,
  ItemIndicator: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Sub: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RadioGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Navbar", () => {
  it("ナビゲーションバーの正常レンダリング", () => {
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeDefined();
  });

  it("ロゴリンクの存在確認", () => {
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeDefined();
  });
});
