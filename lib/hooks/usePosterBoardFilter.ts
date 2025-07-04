import type { Database } from "@/lib/types/supabase";
import { useCallback, useMemo, useState } from "react";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export type FilterStatus = BoardStatus;

export interface PosterBoardFilterState {
  statuses: Set<FilterStatus>;
  showOnlyMine: boolean;
}

interface UsePosterBoardFilterProps {
  boards: PosterBoard[];
  currentUserId?: string;
  boardsWithLatestEditor?: Map<string, string | null>; // boardId -> userId of latest editor
}

const ALL_STATUSES: FilterStatus[] = [
  "not_yet",
  "reserved",
  "done",
  "error_wrong_place",
  "error_damaged",
  "error_wrong_poster",
  "other",
];

const defaultFilterState: PosterBoardFilterState = {
  statuses: new Set<FilterStatus>(ALL_STATUSES),
  showOnlyMine: false,
};

export function usePosterBoardFilter({
  boards,
  currentUserId,
  boardsWithLatestEditor,
}: UsePosterBoardFilterProps) {
  const [filterState, setFilterState] =
    useState<PosterBoardFilterState>(defaultFilterState);

  const toggleStatus = useCallback((status: FilterStatus) => {
    setFilterState((prev) => {
      const newStatuses = new Set(prev.statuses);
      if (newStatuses.has(status)) {
        newStatuses.delete(status);
      } else {
        newStatuses.add(status);
      }

      return {
        ...prev,
        statuses: newStatuses,
      };
    });
  }, []);

  const toggleShowOnlyMine = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      showOnlyMine: !prev.showOnlyMine,
    }));
  }, []);

  const selectAll = useCallback(() => {
    setFilterState((prev) => ({
      statuses: new Set<FilterStatus>(ALL_STATUSES),
      showOnlyMine: prev.showOnlyMine, // Preserve this setting
    }));
  }, []);

  const deselectAll = useCallback(() => {
    setFilterState((prev) => ({
      statuses: new Set<FilterStatus>(),
      showOnlyMine: prev.showOnlyMine, // Preserve this setting
    }));
  }, []);

  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      // Check if the board's status is enabled
      if (!filterState.statuses.has(board.status)) {
        return false;
      }

      // If "show only mine" is enabled, filter by latest editor
      if (filterState.showOnlyMine && currentUserId && boardsWithLatestEditor) {
        const latestEditorId = boardsWithLatestEditor.get(board.id);
        if (latestEditorId !== currentUserId) {
          return false;
        }
      }

      return true;
    });
  }, [boards, filterState, boardsWithLatestEditor, currentUserId]);

  const activeFilterCount = useMemo(() => {
    return filterState.statuses.size;
  }, [filterState]);

  return {
    filterState,
    filteredBoards,
    toggleStatus,
    toggleShowOnlyMine,
    selectAll,
    deselectAll,
    activeFilterCount,
  };
}
