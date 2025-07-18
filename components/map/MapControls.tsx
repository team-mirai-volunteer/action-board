"use client";

import { Expand, Minimize } from "lucide-react";

interface MapControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onLocate: () => void;
  currentPos: [number, number] | null;
}

export function MapControls({
  isFullscreen,
  onToggleFullscreen,
  onLocate,
  currentPos,
}: MapControlsProps) {
  return (
    <>
      {/* フルスクリーンボタン */}
      {!isFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="absolute left-4 bottom-4 rounded-full shadow px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          style={{ zIndex: 1000 }}
          aria-label="フルスクリーン表示"
          title="フルスクリーン表示"
        >
          <Expand size={20} />
        </button>
      )}

      {/* フルスクリーン解除ボタン */}
      {isFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="absolute left-4 bottom-4 rounded-full shadow px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          style={{ zIndex: 1000 }}
          aria-label="フルスクリーン解除"
          title="フルスクリーン解除 (ESC)"
        >
          <Minimize size={20} />
        </button>
      )}

      {/* 現在地ボタン */}
      <button
        type="button"
        onClick={onLocate}
        disabled={!currentPos}
        className={`absolute right-4 bottom-4 rounded-full shadow px-4 py-2 font-bold border transition-colors ${
          currentPos
            ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
        style={{ zIndex: 1000 }}
        aria-label="現在地を表示"
        aria-disabled={!currentPos}
      >
        📍 現在地
      </button>
    </>
  );
}
