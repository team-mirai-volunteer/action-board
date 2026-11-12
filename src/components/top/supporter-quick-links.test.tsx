import { render, screen } from "@testing-library/react";
import {
  SUPPORTER_QUICK_LINKS,
  SupporterQuickLinks,
} from "./supporter-quick-links";

describe("SupporterQuickLinks", () => {
  it("サポーターポータルとイベントカレンダーのリンクを新しいタブで開く形で表示する", () => {
    render(<SupporterQuickLinks />);

    for (const link of SUPPORTER_QUICK_LINKS) {
      const anchor = screen.getByRole("link", { name: new RegExp(link.title) });
      expect(anchor).toHaveAttribute("href", link.href);
      expect(anchor).toHaveAttribute("target", "_blank");
      expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
      expect(screen.getByText(link.description)).toBeInTheDocument();
    }
  });
});
