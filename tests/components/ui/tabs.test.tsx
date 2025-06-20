import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

describe("Tabs", () => {
  it("タブコンポーネント存在確認", () => {
    expect(typeof Tabs).toBe("object");
    expect(typeof TabsContent).toBe("object");
  });

  it("タブリスト存在確認", () => {
    expect(typeof TabsList).toBe("object");
    expect(typeof TabsTrigger).toBe("object");
  });
});
