import type { Database } from "@/lib/types/supabase";
import {
  createMarkerIconHtml,
  createPieSegments,
  statusColors,
} from "./marker-icons";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

function makeStatusCounts(
  overrides: Partial<Record<BoardStatus, number>> = {},
): Record<BoardStatus, number> {
  return {
    not_yet: 0,
    not_yet_dangerous: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
    ...overrides,
  };
}

describe("createMarkerIconHtml", () => {
  it("returns HTML with the correct color for 'done' status", () => {
    const html = createMarkerIconHtml("done");
    expect(html).toContain(`background-color: ${statusColors.done}`);
    expect(html).toContain("border-radius: 50%");
  });

  it("returns HTML with the correct color for 'reserved' status", () => {
    const html = createMarkerIconHtml("reserved");
    expect(html).toContain(`background-color: ${statusColors.reserved}`);
  });

  it("returns HTML with the correct color for 'not_yet' status", () => {
    const html = createMarkerIconHtml("not_yet");
    expect(html).toContain(`background-color: ${statusColors.not_yet}`);
  });

  it("returns HTML with the correct color for error statuses", () => {
    const html = createMarkerIconHtml("error_wrong_place");
    expect(html).toContain(
      `background-color: ${statusColors.error_wrong_place}`,
    );
  });
});

describe("createPieSegments", () => {
  it("returns a full circle when only one status has all counts", () => {
    const counts = makeStatusCounts({ done: 10 });
    const result = createPieSegments(counts, 10, 40);

    expect(result).toContain("<circle");
    expect(result).toContain(`fill="${statusColors.done}"`);
    // Should be a filled circle, not a stroke-based segment
    expect(result).not.toContain("stroke-dasharray");
  });

  it("returns segments for multiple statuses", () => {
    const counts = makeStatusCounts({ done: 5, reserved: 3, not_yet: 2 });
    const result = createPieSegments(counts, 10, 40);

    expect(result).toContain(`stroke="${statusColors.done}"`);
    expect(result).toContain(`stroke="${statusColors.reserved}"`);
    expect(result).toContain(`stroke="${statusColors.not_yet}"`);
    expect(result).toContain("stroke-dasharray");
  });

  it("returns empty string when all counts are zero", () => {
    const counts = makeStatusCounts();
    const result = createPieSegments(counts, 0, 40);

    expect(result).toBe("");
  });

  it("calculates correct radius and center for given size", () => {
    const size = 50;
    const counts = makeStatusCounts({ done: 10 });
    const result = createPieSegments(counts, 10, size);

    const expectedRadius = (size - 6) / 2; // 22
    const expectedCenter = size / 2; // 25
    expect(result).toContain(`cx="${expectedCenter}"`);
    expect(result).toContain(`cy="${expectedCenter}"`);
    expect(result).toContain(`r="${expectedRadius}"`);
  });

  it("skips statuses with zero counts", () => {
    const counts = makeStatusCounts({ done: 5, other: 5 });
    const result = createPieSegments(counts, 10, 40);

    // Should not contain colors for statuses with 0 count
    expect(result).not.toContain(`stroke="${statusColors.reserved}"`);
    expect(result).not.toContain(`stroke="${statusColors.not_yet}"`);
  });
});
