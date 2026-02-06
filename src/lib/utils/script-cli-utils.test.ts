import { parseArgs, toISOTimestamp } from "./script-cli-utils";

describe("toISOTimestamp", () => {
  it("returns string unchanged when it ends with Z", () => {
    expect(toISOTimestamp("2024-01-15T10:30:00Z")).toBe("2024-01-15T10:30:00Z");
  });

  it("returns string unchanged when it has positive timezone offset", () => {
    expect(toISOTimestamp("2024-01-15T10:30:00+09:00")).toBe(
      "2024-01-15T10:30:00+09:00",
    );
  });

  it("returns string unchanged when it has negative timezone offset", () => {
    expect(toISOTimestamp("2024-01-15T10:30:00-05:00")).toBe(
      "2024-01-15T10:30:00-05:00",
    );
  });

  it("appends T00:00:00Z to YYYY-MM-DD format", () => {
    expect(toISOTimestamp("2024-01-15")).toBe("2024-01-15T00:00:00Z");
  });

  it("appends T00:00:00Z to end-of-year date", () => {
    expect(toISOTimestamp("2023-12-31")).toBe("2023-12-31T00:00:00Z");
  });

  it("converts other date formats via Date object", () => {
    const result = toISOTimestamp("January 15, 2024");
    expect(result).toBe(new Date("January 15, 2024").toISOString());
  });

  it("returns Invalid Date string for unparseable date", () => {
    expect(() => toISOTimestamp("not-a-date")).toThrow();
  });
});

describe("parseArgs", () => {
  it("returns defaults when no arguments provided", () => {
    const result = parseArgs([]);
    expect(result).toEqual({
      isDryRun: false,
      isBackfill: false,
      maxResults: undefined,
      publishedAfter: undefined,
      publishedBefore: undefined,
    });
  });

  it("parses --dry-run flag", () => {
    const result = parseArgs(["--dry-run"]);
    expect(result.isDryRun).toBe(true);
    expect(result.isBackfill).toBe(false);
  });

  it("parses --backfill flag", () => {
    const result = parseArgs(["--backfill"]);
    expect(result.isBackfill).toBe(true);
    expect(result.isDryRun).toBe(false);
  });

  it("parses --max-results with numeric value", () => {
    const result = parseArgs(["--max-results", "50"]);
    expect(result.maxResults).toBe(50);
  });

  it("parses --published-after with YYYY-MM-DD format", () => {
    const result = parseArgs(["--published-after", "2024-01-01"]);
    expect(result.publishedAfter).toBe("2024-01-01T00:00:00Z");
  });

  it("parses --published-before with ISO format", () => {
    const result = parseArgs(["--published-before", "2024-06-30T23:59:59Z"]);
    expect(result.publishedBefore).toBe("2024-06-30T23:59:59Z");
  });

  it("parses combination of --dry-run and --max-results", () => {
    const result = parseArgs(["--dry-run", "--max-results", "25"]);
    expect(result.isDryRun).toBe(true);
    expect(result.maxResults).toBe(25);
  });

  it("parses all options combined", () => {
    const result = parseArgs([
      "--dry-run",
      "--backfill",
      "--max-results",
      "100",
      "--published-after",
      "2024-01-01",
      "--published-before",
      "2024-12-31",
    ]);
    expect(result).toEqual({
      isDryRun: true,
      isBackfill: true,
      maxResults: 100,
      publishedAfter: "2024-01-01T00:00:00Z",
      publishedBefore: "2024-12-31T00:00:00Z",
    });
  });

  it("returns undefined for --max-results without a following value", () => {
    const result = parseArgs(["--max-results"]);
    expect(result.maxResults).toBeUndefined();
  });
});
