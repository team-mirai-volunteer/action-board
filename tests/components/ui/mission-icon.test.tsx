const { MissionIcon } = require("../../../components/ui/mission-icon");

describe("MissionIcon", () => {
  it("サイズsmでアイコン表示", () => {
    const props = { size: "sm", type: "default" };
    const result = MissionIcon(props);
    expect(result).toBeDefined();
  });

  it("サイズlgでアイコン表示", () => {
    const props = { size: "lg", type: "special" };
    const result = MissionIcon(props);
    expect(result).toBeDefined();
  });
});
