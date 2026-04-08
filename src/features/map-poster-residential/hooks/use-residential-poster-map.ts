"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  removePosterPlacement,
  submitPosterPlacement,
  updatePosterPlacement,
} from "../actions/residential-poster-actions";
import { fetchReverseGeocode } from "../loaders/residential-poster-loaders";
import type { ResidentialPosterPlacement } from "../types/residential-poster-types";

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
  count: number;
  mode: "create" | "edit";
  showMyPins: boolean;
  setAddress: (value: string) => void;
  setMemo: (value: string) => void;
  setCount: (value: number) => void;
  setShowMyPins: (value: boolean) => void;
  handlePinPlaced: (lat: number, lng: number) => void;
  handlePlacementClick: (placement: ResidentialPosterPlacement) => void;
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
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
  const [count, setCount] = useState(1);
  const [editingPlacement, setEditingPlacement] =
    useState<ResidentialPosterPlacement | null>(null);
  const [showMyPins, setShowMyPins] = useState(false);

  // 逆ジオコーディング結果が届いたら住所欄を自動入力
  useEffect(() => {
    if (addressInfo) {
      setAddress(formatAddress(addressInfo));
    }
  }, [addressInfo]);

  const resetForm = useCallback(() => {
    setSelectedPosition(null);
    setIsFormOpen(false);
    setAddressInfo(null);
    setAddress("");
    setMemo("");
    setCount(1);
    setEditingPlacement(null);
  }, []);

  const handlePinPlaced = useCallback((lat: number, lng: number) => {
    setEditingPlacement(null);
    setSelectedPosition({ lat, lng });
    setIsFormOpen(true);
    setAddressInfo(null);
    setAddress("");
    setMemo("");
    setCount(1);
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

  const handlePlacementClick = useCallback(
    (placement: ResidentialPosterPlacement) => {
      setEditingPlacement(placement);
      setSelectedPosition({
        lat: Number(placement.lat),
        lng: Number(placement.lng),
      });
      setAddress(placement.address ?? "");
      setMemo(placement.memo ?? "");
      setCount(placement.count);
      setIsLoadingAddress(false);
      setAddressInfo(null);
      setIsFormOpen(true);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (editingPlacement) {
        const result = await updatePosterPlacement(editingPlacement.id, {
          count,
          address: address || null,
          memo: memo || null,
        });
        if (result.success) {
          toast.success("掲示情報を更新しました");
          resetForm();
          await options?.onSubmitSuccess?.();
        } else {
          toast.error(result.error);
        }
      } else {
        if (!selectedPosition) return;
        const result = await submitPosterPlacement({
          lat: selectedPosition.lat,
          lng: selectedPosition.lng,
          count,
          address: address || null,
          memo: memo || null,
        });
        if (result.success) {
          toast.success("ポスター掲示を登録しました");
          resetForm();
          await options?.onSubmitSuccess?.();
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error(
        editingPlacement ? "更新に失敗しました" : "登録に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    editingPlacement,
    selectedPosition,
    count,
    address,
    memo,
    options,
    resetForm,
  ]);

  const handleDelete = useCallback(async () => {
    if (!editingPlacement) return;
    const confirmed = window.confirm("この掲示情報を削除しますか？");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const result = await removePosterPlacement(editingPlacement.id);
      if (result.success) {
        toast.success("掲示情報を削除しました");
        resetForm();
        await options?.onSubmitSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingPlacement, options, resetForm]);

  return {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    isLoadingAddress,
    address,
    memo,
    count,
    mode: editingPlacement ? "edit" : "create",
    showMyPins,
    setAddress,
    setMemo,
    setCount,
    setShowMyPins,
    handlePinPlaced,
    handlePlacementClick,
    handleSubmit,
    handleDelete,
    handleCancel: resetForm,
  };
}
