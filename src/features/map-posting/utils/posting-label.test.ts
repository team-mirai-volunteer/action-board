import { createPostingLabelIcon, getLabelIconWidth } from "./posting-label";

describe("getLabelIconWidth", () => {
  it("returns minimum width of 50 for single digit numbers", () => {
    expect(getLabelIconWidth(1)).toBe(50);
    expect(getLabelIconWidth(9)).toBe(50);
  });

  it("returns 50 for two digit numbers", () => {
    // 30 + 2 * 10 = 50
    expect(getLabelIconWidth(10)).toBe(50);
    expect(getLabelIconWidth(99)).toBe(50);
  });

  it("returns 60 for three digit numbers", () => {
    // 30 + 3 * 10 = 60
    expect(getLabelIconWidth(100)).toBe(60);
    expect(getLabelIconWidth(999)).toBe(60);
  });

  it("returns 70 for four digit numbers", () => {
    // 30 + 4 * 10 = 70
    expect(getLabelIconWidth(1000)).toBe(70);
    expect(getLabelIconWidth(9999)).toBe(70);
  });

  it("returns 80 for five digit numbers", () => {
    // 30 + 5 * 10 = 80
    expect(getLabelIconWidth(10000)).toBe(80);
  });

  it("enforces minimum width of 50", () => {
    // For 1 digit: 30 + 1 * 10 = 40, but Math.max(50, 40) = 50
    expect(getLabelIconWidth(5)).toBeGreaterThanOrEqual(50);
  });

  it("scales linearly with digit count above minimum", () => {
    const width3 = getLabelIconWidth(100); // 3 digits
    const width4 = getLabelIconWidth(1000); // 4 digits
    expect(width4 - width3).toBe(10);
  });
});

describe("createPostingLabelIcon", () => {
  it("divIconをHTML・className・iconSize・iconAnchor付きで生成する", () => {
    const mockDivIcon = jest.fn((opts) => ({ __kind: "divIcon", ...opts }));
    const L = { divIcon: mockDivIcon } as unknown as typeof import("leaflet");

    const icon = createPostingLabelIcon(L, 42);

    expect(mockDivIcon).toHaveBeenCalledTimes(1);
    const opts = mockDivIcon.mock.calls[0][0];
    expect(opts.html).toBe('<div class="posting-count-label">42枚</div>');
    expect(opts.className).toBe("posting-count-marker");
    expect(opts.iconSize).toEqual([50, 20]);
    expect(opts.iconAnchor).toEqual([25, 10]);
    // biome-ignore lint/suspicious/noExplicitAny: test object carries mock marker
    expect((icon as any).__kind).toBe("divIcon");
  });

  it("大きな枚数では幅が広がる", () => {
    const mockDivIcon = jest.fn((opts) => opts);
    const L = { divIcon: mockDivIcon } as unknown as typeof import("leaflet");

    createPostingLabelIcon(L, 12345);

    const opts = mockDivIcon.mock.calls[0][0];
    expect(opts.iconSize).toEqual([80, 20]);
    expect(opts.iconAnchor).toEqual([40, 10]);
    expect(opts.html).toContain("12345枚");
  });
});
