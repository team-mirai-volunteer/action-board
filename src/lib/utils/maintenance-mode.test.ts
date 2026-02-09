import {
  isMaintenanceActive,
  isMaintenancePreview,
  shouldShowMaintenance,
} from "./maintenance-mode";

const SAMPLE_START_AT = new Date("2026-02-07T14:59:00.000Z");

describe("maintenance-mode", () => {
  it("開始時刻前ではメンテナンス未開始", () => {
    const now = new Date("2026-02-07T14:58:59.000Z");
    expect(isMaintenanceActive(now, SAMPLE_START_AT)).toBe(false);
  });

  it("開始時刻でメンテナンス開始", () => {
    const now = new Date("2026-02-07T14:59:00.000Z");
    expect(isMaintenanceActive(now, SAMPLE_START_AT)).toBe(true);
  });

  it("開始時刻がnullならメンテナンスは無効", () => {
    const now = new Date("2026-02-07T14:59:00.000Z");
    expect(isMaintenanceActive(now, null)).toBe(false);
  });

  it("デフォルト（MAINTENANCE_START_AT=null）ではメンテナンス無効", () => {
    const now = new Date();
    expect(isMaintenanceActive(now)).toBe(false);
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

  it("開始時刻がnullでも preview=maintenance なら表示する", () => {
    const url = new URL("https://example.com/?preview=maintenance");
    const now = new Date("2026-02-07T14:59:00.000Z");

    expect(shouldShowMaintenance(url, now, null)).toBe(true);
  });
});
