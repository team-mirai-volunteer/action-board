"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReverseGeocodingResult } from "@/features/map-posting/services/reverse-geocoding";

interface PosterPlacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  geocodedAddress: ReverseGeocodingResult | null;
  onSubmit: (data: {
    lat: number;
    lng: number;
    poster_count: number;
    address?: string;
    note?: string;
  }) => Promise<void>;
}

export function PosterPlacementDialog({
  open,
  onOpenChange,
  lat,
  lng,
  geocodedAddress,
  onSubmit,
}: PosterPlacementDialogProps) {
  const prefillAddress = [
    geocodedAddress?.prefecture,
    geocodedAddress?.city,
    geocodedAddress?.address,
  ]
    .filter(Boolean)
    .join("");

  const [address, setAddress] = useState(prefillAddress);
  const [posterCount, setPosterCount] = useState(1);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when geocodedAddress changes (new pin)
  const [lastPrefill, setLastPrefill] = useState(prefillAddress);
  if (prefillAddress !== lastPrefill) {
    setLastPrefill(prefillAddress);
    setAddress(prefillAddress);
    setPosterCount(1);
    setNote("");
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        lat,
        lng,
        poster_count: posterCount,
        address: address || undefined,
        note: note || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ポスター掲示を記録</DialogTitle>
          <DialogDescription>
            掲示した場所の情報を入力してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="住所を入力または修正"
            />
            <p className="text-xs text-muted-foreground mt-1">
              地図のピンから自動取得されます。必要に応じて修正してください。
            </p>
          </div>

          <div>
            <Label htmlFor="posterCount">掲示枚数</Label>
            <Input
              id="posterCount"
              type="number"
              min={1}
              value={posterCount}
              onChange={(e) =>
                setPosterCount(
                  Math.max(1, Number.parseInt(e.target.value) || 1),
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="note">メモ（任意）</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="備考があれば入力"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "記録する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
