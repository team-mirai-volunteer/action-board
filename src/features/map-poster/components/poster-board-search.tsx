"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PosterBoard } from "../types/poster-types";
import {
  POSTER_SEARCH_MIN_QUERY_LENGTH,
  searchPosterBoards,
} from "../utils/poster-search-logic";

interface PosterBoardSearchProps {
  boards: PosterBoard[];
  onSelect: (board: PosterBoard) => void;
}

/**
 * ポスター掲示板マップ上のテキスト検索ボックス。
 * 番号・名前・住所・市区町村・ID で部分一致検索し、結果をドロップダウンで表示する。
 * 結果を選択すると {@link PosterBoardSearchProps.onSelect} が呼ばれ、
 * 呼び出し側で該当掲示板へ地図を移動する。
 */
export function PosterBoardSearch({
  boards,
  onSelect,
}: PosterBoardSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(
    () => searchPosterBoards(boards, query),
    [boards, query],
  );

  const showDropdown =
    isOpen && query.trim().length >= POSTER_SEARCH_MIN_QUERY_LENGTH;

  const handleSelect = (board: PosterBoard) => {
    onSelect(board);
    setIsOpen(false);
  };

  return (
    <div className="absolute left-4 top-4 z-1000 w-64 max-w-[calc(100%-2rem)]">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="番号・名前・住所で検索"
          className="bg-white pl-8 pr-8 shadow-lg"
          aria-label="掲示板を検索"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            aria-label="検索をクリア"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray-500">
              該当する掲示板がありません
            </li>
          ) : (
            results.map((board) => (
              <li key={board.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(board)}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-gray-100"
                >
                  <span className="text-xs font-medium text-gray-900">
                    {board.number ? `#${board.number} ` : ""}
                    {board.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {board.address}
                    {board.city ? ` (${board.city})` : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
