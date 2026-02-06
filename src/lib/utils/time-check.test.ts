import {
  isMaintenanceActive,
  isMaintenancePreview,
  shouldShowMaintenance,
} from "./time-check";

describe("time-check", () => {
  it("JST 23:58:59 ではメンテナンス未開始", () => {
    const now = new Date("2026-02-07T14:58:59.000Z");
    expect(isMaintenanceActive(now)).toBe(false);
  });

  it("JST 23:59:00 でメンテナンス開始", () => {
    const now = new Date("2026-02-07T14:59:00.000Z");
    expect(isMaintenanceActive(now)).toBe(true);
  });

  it("開始前でも preview=maintenance なら表示する", () => {
    const url = new URL("https://example.com/?preview=maintenance");
    const now = new Date("2026-02-07T14:58:59.000Z");

    expect(isMaintenancePreview(url)).toBe(true);
    expect(shouldShowMaintenance(url, now)).toBe(true);
  });

  it("previewがmaintenance以外なら開始前は表示しない", () => {
    const url = new URL("https://example.com/?preview=1");
    const now = new Date("2026-02-07T14:58:59.000Z");

    expect(isMaintenancePreview(url)).toBe(false);
    expect(shouldShowMaintenance(url, now)).toBe(false);
  });
});
