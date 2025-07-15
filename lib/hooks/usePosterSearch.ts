import type { Database } from "@/lib/types/supabase";
import { useEffect, useMemo, useState } from "react";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

export interface UsePosterSearchProps {
  boards: PosterBoard[];
}

export interface UsePosterSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: PosterBoard[];
  selectedSearchIndex: number;
  setSelectedSearchIndex: (index: number) => void;
  showSearchDropdown: boolean;
  setShowSearchDropdown: (show: boolean) => void;
  isComposing: boolean;
  setIsComposing: (composing: boolean) => void;
  handleSearchResultSelect: (board: PosterBoard) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function usePosterSearch({
  boards,
}: UsePosterSearchProps): UsePosterSearchResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // 検索結果の計算
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const results = boards.filter((board) => {
      const number = board.number?.toLowerCase() || "";
      const name = board.name?.toLowerCase() || "";
      const address = board.address?.toLowerCase() || "";
      const city = board.city?.toLowerCase() || "";

      return (
        number.includes(query) ||
        name.includes(query) ||
        address.includes(query) ||
        city.includes(query)
      );
    });

    // 最大10件まで表示
    return results.slice(0, 10);
  }, [boards, searchQuery]);

  // 検索結果が変更されたときに選択インデックスをリセット
  // useMemoの外で副作用として処理
  const searchResultsLength = searchResults.length;
  const searchResultsIds = searchResults.map((r) => r.id).join(",");

  useEffect(() => {
    if (
      selectedSearchIndex !== -1 &&
      (searchResultsLength === 0 || selectedSearchIndex >= searchResultsLength)
    ) {
      setSelectedSearchIndex(-1);
    }
  }, [searchResultsLength, selectedSearchIndex]);

  const handleSearchResultSelect = (board: PosterBoard) => {
    // 選択後の処理は親コンポーネントで実装
    setSelectedSearchIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSearchIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        // IME変換中の場合は何もしない
        if (isComposing) return;

        e.preventDefault();
        if (
          selectedSearchIndex >= 0 &&
          selectedSearchIndex < searchResults.length
        ) {
          handleSearchResultSelect(searchResults[selectedSearchIndex]);
        } else if (searchResults.length > 0) {
          handleSearchResultSelect(searchResults[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSearchQuery("");
        setSelectedSearchIndex(-1);
        break;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedSearchIndex,
    setSelectedSearchIndex,
    showSearchDropdown,
    setShowSearchDropdown,
    isComposing,
    setIsComposing,
    handleSearchResultSelect,
    handleSearchKeyDown,
  };
}
