"use client";

import type { Database } from "@/lib/types/supabase";
import { Search, X } from "lucide-react";
import { forwardRef } from "react";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];

interface PosterSearchBoxProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: PosterBoard[];
  onSearchResultSelect: (board: PosterBoard) => void;
  showSearchDropdown: boolean;
  onSearchDropdownChange: (show: boolean) => void;
  selectedSearchIndex: number;
  onSelectedSearchIndexChange: (index: number) => void;
  isComposing: boolean;
  onComposingChange: (composing: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isMobile: boolean;
}

export const PosterSearchBox = forwardRef<HTMLDivElement, PosterSearchBoxProps>(
  (
    {
      searchQuery,
      onSearchQueryChange,
      searchResults,
      onSearchResultSelect,
      showSearchDropdown,
      onSearchDropdownChange,
      selectedSearchIndex,
      onSelectedSearchIndexChange,
      isComposing,
      onComposingChange,
      onKeyDown,
      isMobile,
    },
    ref,
  ) => {
    return (
      <div
        className={`bg-white rounded-lg shadow-lg border border-gray-200 ${
          isMobile ? "w-24" : "w-60"
        } flex-shrink-0`}
        ref={ref}
      >
        <div className="relative">
          <div
            className={`flex items-center gap-2 ${
              isMobile ? "px-2 py-2" : "px-3 py-1.5"
            } rounded-lg`}
          >
            <Search
              className={`${
                isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
              } flex-shrink-0`}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={isMobile ? "検索" : "検索..."}
              className={`${
                isMobile ? "text-xs" : "text-sm font-medium"
              } bg-transparent border-none outline-none flex-1 ${
                isMobile ? "w-16" : "w-48"
              }`}
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value);
                onSearchDropdownChange(true);
              }}
              onFocus={() => onSearchDropdownChange(true)}
              onKeyDown={onKeyDown}
              onCompositionStart={() => onComposingChange(true)}
              onCompositionEnd={() => onComposingChange(false)}
              aria-label="ポスター掲示板を検索"
              aria-expanded={showSearchDropdown}
              aria-controls="search-results"
              aria-activedescendant={
                selectedSearchIndex >= 0
                  ? `search-result-${selectedSearchIndex}`
                  : undefined
              }
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchQueryChange("");
                  onSelectedSearchIndexChange(-1);
                  onSearchDropdownChange(false);
                }}
                aria-label="検索をクリア"
              >
                <X
                  className={`${
                    isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                  } text-gray-400 hover:text-gray-600`}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* 検索結果ドロップダウン */}
          {showSearchDropdown &&
            searchResults &&
            (searchResults.length > 0 ||
              (searchQuery &&
                searchQuery.length >= 2 &&
                searchResults.length === 0)) && (
              <div
                id="search-results"
                className={`absolute ${
                  isMobile ? "left-auto right-0 w-64" : "left-0 right-0"
                } mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg`}
                aria-label="検索結果"
                tabIndex={-1}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((board, index) => (
                    <button
                      type="button"
                      key={board.id}
                      id={`search-result-${index}`}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        index === selectedSearchIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => onSearchResultSelect(board)}
                      onMouseEnter={() => onSelectedSearchIndexChange(index)}
                      aria-selected={index === selectedSearchIndex}
                    >
                      <div className="text-sm">
                        {board.number && (
                          <span className="font-medium">#{board.number}</span>
                        )}
                        {board.name && (
                          <span className="ml-2">{board.name}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {board.address} {board.city}
                      </div>
                    </button>
                  ))
                ) : (
                  <div
                    className="p-3 text-sm text-gray-500 text-center"
                    aria-live="polite"
                  >
                    検索結果がありません
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    );
  },
);

PosterSearchBox.displayName = "PosterSearchBox";
