const { Badge } = require("../../../components/ui/badge");

describe("Badge", () => {
  it("デフォルトバッジ表示", () => {
    const props = { children: "New" };
    const result = Badge(props);
    expect(result).toBeDefined();
  });

  it("バリアント付きバッジ表示", () => {
    const props = { children: "Success", variant: "success" };
    const result = Badge(props);
    expect(result).toBeDefined();
  });
});
