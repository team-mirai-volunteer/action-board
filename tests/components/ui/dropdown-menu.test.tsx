import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

describe("DropdownMenu", () => {
  it("ドロップダウンメニューコンポーネント存在確認", () => {
    expect(typeof DropdownMenu).toBe("function");
    expect(typeof DropdownMenuContent).toBe("object");
  });

  it("ドロップダウンメニューアイテム存在確認", () => {
    expect(typeof DropdownMenuItem).toBe("object");
    expect(typeof DropdownMenuTrigger).toBe("object");
  });
});
