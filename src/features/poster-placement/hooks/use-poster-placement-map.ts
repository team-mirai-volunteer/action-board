"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { submitPosterPlacement } from "../actions/poster-placement-actions";
import { fetchReverseGeocode } from "../loaders/poster-placement-loaders";

// オプション型（ファイル内定義）
type UsePosterPlacementMapOptions = {
  onSubmitSuccess?: () => void | Promise<void>;
};

type AddressInfo = {
  prefecture: string | null;
  city: string | null;
  address: string | null;
  postcode: string | null;
};

type UsePosterPlacementMapReturn = {
  selectedPosition: { lat: number; lng: number } | null;
  isFormOpen: boolean;
  isSubmitting: boolean;
  addressInfo: AddressInfo | null;
  isLoadingAddress: boolean;
  handlePinPlaced: (lat: number, lng: number) => void;
  handleSubmit: (count: number, address: string | null) => Promise<void>;
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
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const handlePinPlaced = useCallback((lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setIsFormOpen(true);
    setAddressInfo(null);
    setIsLoadingAddress(true);

    fetchReverseGeocode(lat, lng)
      .then((result) => {
        setAddressInfo(result);
      })
      .catch((error) => {
        console.error("Reverse geocoding failed:", error);
        setAddressInfo(null);
      })
      .finally(() => {
        setIsLoadingAddress(false);
      });
  }, []);

  const handleSubmit = useCallback(
    async (count: number, address: string | null) => {
      if (!selectedPosition) return;
      setIsSubmitting(true);
      try {
        const result = await submitPosterPlacement({
          lat: selectedPosition.lat,
          lng: selectedPosition.lng,
          count,
          address,
        });
        if (result.success) {
          toast.success("ポスター掲示を登録しました");
          setSelectedPosition(null);
          setIsFormOpen(false);
          setAddressInfo(null);
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
    setAddressInfo(null);
  }, []);

  return {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    addressInfo,
    isLoadingAddress,
    handlePinPlaced,
    handleSubmit,
    handleCancel,
  };
}
