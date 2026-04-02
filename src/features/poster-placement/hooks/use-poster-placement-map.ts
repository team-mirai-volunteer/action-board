"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { submitPosterPlacement } from "../actions/poster-placement-actions";

// オプション型（ファイル内定義）
type UsePosterPlacementMapOptions = {
  onSubmitSuccess?: () => void | Promise<void>;
};

type UsePosterPlacementMapReturn = {
  selectedPosition: { lat: number; lng: number } | null;
  isFormOpen: boolean;
  isSubmitting: boolean;
  handlePinPlaced: (lat: number, lng: number) => void;
  handleSubmit: (count: number) => Promise<void>;
  handleCancel: () => void;
};

export function usePosterPlacementMap(
  options?: UsePosterPlacementMapOptions,
): UsePosterPlacementMapReturn {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePinPlaced = useCallback((lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (count: number) => {
      if (!selectedPosition) return;
      setIsSubmitting(true);
      try {
        const result = await submitPosterPlacement({
          lat: selectedPosition.lat,
          lng: selectedPosition.lng,
          count,
        });
        if (result.success) {
          toast.success("ポスター掲示を登録しました");
          setSelectedPosition(null);
          setIsFormOpen(false);
          // 登録成功後のコールバック（集計データ再フェッチ等）
          await options?.onSubmitSuccess?.();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("登録に失敗しました");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedPosition, options],
  );

  const handleCancel = useCallback(() => {
    setSelectedPosition(null);
    setIsFormOpen(false);
  }, []);

  return {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    handlePinPlaced,
    handleSubmit,
    handleCancel,
  };
}
