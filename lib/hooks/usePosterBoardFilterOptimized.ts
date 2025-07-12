import type { Database } from "@/lib/types/supabase";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export type FilterStatus = BoardStatus;

export interface PosterBoardFilterState {
  statuses: Set<FilterStatus>;
  showOnlyMine: boolean;
  hideCurrentLocation: boolean;
}

interface UsePosterBoardFilterProps {
  boards: PosterBoard[];
  currentUserId?: string;
  userEditedBoardIds?: Set<string>;
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
  hideCurrentLocation: false,
};

// バッチ処理のサイズ
const BATCH_SIZE = 5000;

export function usePosterBoardFilterOptimized({
  boards,
  currentUserId,
  userEditedBoardIds,
}: UsePosterBoardFilterProps) {
  const [filterState, setFilterState] =
    useState<PosterBoardFilterState>(defaultFilterState);
  const [filteredBoards, setFilteredBoards] = useState<PosterBoard[]>(boards);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isPending, startTransition] = useTransition();
  const workerRef = useRef<Worker | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Web Workerの初期化（ブラウザがサポートしている場合）
  useEffect(() => {
    if (typeof Worker !== "undefined") {
      try {
        workerRef.current = new Worker(
          new URL("../workers/poster-filter.worker.ts", import.meta.url),
        );

        workerRef.current.onmessage = (event) => {
          if (event.data.type === "result") {
            startTransition(() => {
              setFilteredBoards(event.data.filteredBoards);
              setIsFiltering(false);
            });
          }
        };
      } catch (error) {
        console.warn("Web Worker initialization failed:", error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // 非同期フィルタリング処理
  const performFiltering = useCallback(async () => {
    // 前の処理をキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsFiltering(true);

    // Web Workerが利用可能な場合（10000件以上の場合のみ使用）
    if (workerRef.current && boards.length > 10000) {
      workerRef.current.postMessage({
        type: "filter",
        boards,
        selectedStatuses: Array.from(filterState.statuses),
        showOnlyMine: filterState.showOnlyMine,
        userEditedBoardIds: userEditedBoardIds
          ? Array.from(userEditedBoardIds)
          : [],
        currentUserId,
      });
      return;
    }

    // Web Workerが使えない場合は、バッチ処理で実行
    const result: PosterBoard[] = [];
    const statusSet = filterState.statuses;

    // バッチ処理でフィルタリング
    for (let i = 0; i < boards.length; i += BATCH_SIZE) {
      if (signal.aborted) break;

      const batch = boards.slice(i, i + BATCH_SIZE);
      const filteredBatch = batch.filter((board) => {
        // ステータスチェック
        if (!statusSet.has(board.status)) {
          return false;
        }

        // "自分のみ表示"チェック
        if (filterState.showOnlyMine && currentUserId) {
          if (!userEditedBoardIds || userEditedBoardIds.size === 0) {
            return false;
          }
          if (!userEditedBoardIds.has(board.id)) {
            return false;
          }
        }

        return true;
      });

      result.push(...filteredBatch);

      // UIを更新するために少し待機
      if (i + BATCH_SIZE < boards.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (!signal.aborted) {
      startTransition(() => {
        setFilteredBoards(result);
        setIsFiltering(false);
      });
    }
  }, [boards, filterState, userEditedBoardIds, currentUserId]);

  // フィルター状態が変更されたときに実行
  useEffect(() => {
    performFiltering();
  }, [performFiltering]);

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

  const toggleHideCurrentLocation = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      hideCurrentLocation: !prev.hideCurrentLocation,
    }));
  }, []);

  const selectAll = useCallback(() => {
    setFilterState((prev) => ({
      statuses: new Set<FilterStatus>(ALL_STATUSES),
      showOnlyMine: prev.showOnlyMine,
      hideCurrentLocation: prev.hideCurrentLocation,
    }));
  }, []);

  const deselectAll = useCallback(() => {
    setFilterState((prev) => ({
      statuses: new Set<FilterStatus>(),
      showOnlyMine: prev.showOnlyMine,
      hideCurrentLocation: prev.hideCurrentLocation,
    }));
  }, []);

  const activeFilterCount = useMemo(() => {
    return filterState.statuses.size;
  }, [filterState]);

  return {
    filterState,
    filteredBoards,
    toggleStatus,
    toggleShowOnlyMine,
    toggleHideCurrentLocation,
    selectAll,
    deselectAll,
    activeFilterCount,
    isFiltering: isFiltering || isPending,
  };
}
