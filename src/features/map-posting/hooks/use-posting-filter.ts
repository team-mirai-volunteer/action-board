"use client";

import { useCallback, useState } from "react";
import type { MapShape } from "../types/posting-types";

/**
 * フィルター状態を管理するhook
 * 「自分のエリアのみ表示」フィルターを提供
 */
export function usePostingFilter(userId: string) {
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // シェイプが現在のユーザーのものかどうか判定
  const isOwnerOfShape = useCallback(
    (shape: MapShape | undefined): boolean => {
      if (!shape) return false;
      return shape.user_id === userId;
    },
    [userId],
  );

  // フィルター条件に基づいてシェイプを表示すべきか判定
  const shouldShowShape = useCallback(
    (shape: MapShape | undefined): boolean => {
      if (!showOnlyMine) return true;
      return isOwnerOfShape(shape);
    },
    [showOnlyMine, isOwnerOfShape],
  );

  // フィルターをトグル
  const toggleShowOnlyMine = useCallback(() => {
    setShowOnlyMine((prev) => !prev);
  }, []);

  return {
    showOnlyMine,
    setShowOnlyMine,
    isOwnerOfShape,
    shouldShowShape,
    toggleShowOnlyMine,
  };
}
