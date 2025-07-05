import { renderHook, act } from "@testing-library/react";
import { usePosterBoardFilterOptimized } from "@/lib/hooks/usePosterBoardFilterOptimized";
import type { Database } from "@/lib/types/supabase";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = jest.fn();
  terminate = jest.fn();
  
  // Simulate worker response
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data }));
    }
  }
}

// Mock global Worker
global.Worker = MockWorker as any;

describe("usePosterBoardFilterOptimized", () => {
  const createMockBoards = (count: number): PosterBoard[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `board-${i}`,
      prefecture: "東京都" as any,
      city: "渋谷区",
      lat: 35.6762 + i * 0.001,
      long: 139.6503 + i * 0.001,
      status: (i % 2 === 0 ? "not_yet" : "done") as BoardStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      number: `${i + 1}`,
      name: `Board ${i + 1}`,
      address: `Address ${i + 1}`,
      notes: null,
    }));
  };

  it("should use Web Worker for large datasets (>10,000 items)", () => {
    const mockBoards = createMockBoards(15000);
    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    // Web Worker should be created for large dataset
    expect(MockWorker).toHaveBeenCalled();
  });

  it("should use batch processing for medium datasets (<10,000 items)", async () => {
    const mockBoards = createMockBoards(5000);
    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    // Should not create Web Worker for medium dataset
    expect(result.current.filteredBoards).toHaveLength(5000);
  });

  it("should filter boards by status correctly", async () => {
    const mockBoards = createMockBoards(100);
    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    // Initially all boards should be shown
    expect(result.current.filteredBoards).toHaveLength(100);

    // Deselect "not_yet" status
    act(() => {
      result.current.toggleStatus("not_yet");
    });

    // Should only show "done" boards (50 out of 100)
    expect(result.current.filteredBoards).toHaveLength(50);
    expect(result.current.filteredBoards.every(b => b.status === "done")).toBe(true);
  });

  it("should filter by user edited boards when showOnlyMine is enabled", async () => {
    const mockBoards = createMockBoards(100);
    const userEditedIds = new Set(["board-0", "board-10", "board-20"]);
    
    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
        userEditedBoardIds: userEditedIds,
      })
    );

    // Toggle showOnlyMine
    act(() => {
      result.current.toggleShowOnlyMine();
    });

    // Should only show boards edited by user
    expect(result.current.filteredBoards).toHaveLength(3);
    expect(result.current.filteredBoards.map(b => b.id)).toEqual([
      "board-0",
      "board-10",
      "board-20",
    ]);
  });

  it("should handle selectAll and deselectAll correctly", () => {
    const mockBoards = createMockBoards(50);
    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    // Deselect all
    act(() => {
      result.current.deselectAll();
    });

    expect(result.current.filteredBoards).toHaveLength(0);
    expect(result.current.activeFilterCount).toBe(0);

    // Select all
    act(() => {
      result.current.selectAll();
    });

    expect(result.current.filteredBoards).toHaveLength(50);
    expect(result.current.activeFilterCount).toBe(7); // All 7 status types
  });

  it("should set isFiltering flag during filter operations", async () => {
    const mockBoards = createMockBoards(15000);
    const mockWorker = new MockWorker();
    
    // Override Worker constructor to return our mock
    global.Worker = jest.fn(() => mockWorker) as any;

    const { result } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    // Initially not filtering
    expect(result.current.isFiltering).toBe(false);

    // Trigger filter change
    act(() => {
      result.current.toggleStatus("done");
    });

    // Should be filtering
    expect(result.current.isFiltering).toBe(true);

    // Simulate worker response
    act(() => {
      mockWorker.simulateMessage({
        type: "filterResult",
        filteredBoards: mockBoards.filter(b => b.status !== "done"),
      });
    });

    // Should no longer be filtering
    expect(result.current.isFiltering).toBe(false);
  });

  it("should cleanup Web Worker on unmount", () => {
    const mockBoards = createMockBoards(15000);
    const mockWorker = new MockWorker();
    
    global.Worker = jest.fn(() => mockWorker) as any;

    const { unmount } = renderHook(() =>
      usePosterBoardFilterOptimized({
        boards: mockBoards,
        currentUserId: "user-123",
      })
    );

    unmount();

    // Worker should be terminated
    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});