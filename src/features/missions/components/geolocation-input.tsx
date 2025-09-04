"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

type GeolocationInputProps = {
  disabled: boolean;
  onGeolocationChange: (geolocation: GeolocationData | null) => void;
};

export function GeolocationInput({
  disabled,
  onGeolocationChange,
}: GeolocationInputProps) {
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  const handleGetGeolocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }
    setIsFetchingGeo(true);
    setGeolocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newGeolocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
        };
        setGeolocation(newGeolocation);
        onGeolocationChange(newGeolocation);
        setIsFetchingGeo(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeolocationError(`位置情報の取得に失敗しました: ${error.message}`);
        setGeolocation(null);
        onGeolocationChange(null);
        setIsFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetGeolocation}
        disabled={disabled || isFetchingGeo}
      >
        {isFetchingGeo ? "位置情報取得中..." : "位置情報を取得する"}
      </Button>
      {geolocationError && (
        <p className="text-xs text-destructive">{geolocationError}</p>
      )}
      {geolocation && (
        <p className="text-xs text-green-600">
          位置情報取得完了: Lat: {geolocation.lat.toFixed(4)}, Lon:{" "}
          {geolocation.lon.toFixed(4)}
        </p>
      )}
    </div>
  );
}
