"use client";

import { useCallback, useEffect, useState } from "react";
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

function formatAddress(info: AddressInfo): string {
  return [info.prefecture, info.city, info.address].filter(Boolean).join(" ");
}

type UsePosterPlacementMapReturn = {
  selectedPosition: { lat: number; lng: number } | null;
  isFormOpen: boolean;
  isSubmitting: boolean;
  isLoadingAddress: boolean;
  address: string;
  memo: string;
  setAddress: (value: string) => void;
  setMemo: (value: string) => void;
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
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");

  // 逆ジオコーディング結果が届いたら住所欄を自動入力
  useEffect(() => {
    if (addressInfo) {
      setAddress(formatAddress(addressInfo));
    }
  }, [addressInfo]);

  const handlePinPlaced = useCallback((lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setIsFormOpen(true);
    setAddressInfo(null);
    setAddress("");
    setMemo("");
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
    async (count: number) => {
      if (!selectedPosition) return;
      setIsSubmitting(true);
      try {
        const result = await submitPosterPlacement({
          lat: selectedPosition.lat,
          lng: selectedPosition.lng,
          count,
          address: address || null,
          memo: memo || null,
        });
        if (result.success) {
          toast.success("ポスター掲示を登録しました");
          setSelectedPosition(null);
          setIsFormOpen(false);
          setAddressInfo(null);
          setAddress("");
          setMemo("");
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
    [selectedPosition, address, memo, options],
  );

  const handleCancel = useCallback(() => {
    setSelectedPosition(null);
    setIsFormOpen(false);
    setAddressInfo(null);
    setAddress("");
    setMemo("");
  }, []);

  return {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    isLoadingAddress,
    address,
    memo,
    setAddress,
    setMemo,
    handlePinPlaced,
    handleSubmit,
    handleCancel,
  };
}
