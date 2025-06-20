import { render } from "@testing-library/react";
import React from "react";
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

describe("Navbar", () => {
  it("ナビゲーションバーの正常レンダリング", async () => {
    const NavbarComponent = await Navbar();
    const { container } = render(NavbarComponent);
    expect(container.firstChild).toHaveClass("sticky");
  });

  it("ロゴリンクの存在確認", async () => {
    const NavbarComponent = await Navbar();
    const { container } = render(NavbarComponent);
    const logoLink = container.querySelector("a[href='/']");
    expect(logoLink).toBeInTheDocument();
  });
});
