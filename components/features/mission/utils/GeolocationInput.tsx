"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import React, { useState } from "react";

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

type GeolocationInputProps = {
  disabled: boolean;
  onGeolocationChange: (data: GeolocationData | null) => void;
};

export function GeolocationInput({
  disabled,
  onGeolocationChange,
}: GeolocationInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("位置情報がサポートされていません");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const data: GeolocationData = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
        };
        setGeolocation(data);
        onGeolocationChange(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("位置情報の取得に失敗しました");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const clearLocation = () => {
    setGeolocation(null);
    onGeolocationChange(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          位置情報 (任意)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!geolocation ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={disabled || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  位置情報を取得中...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  現在地を取得
                </>
              )}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-green-600 font-medium">
              位置情報が取得されました
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>緯度: {geolocation.lat.toFixed(6)}</div>
              <div>経度: {geolocation.lon.toFixed(6)}</div>
              {geolocation.accuracy && (
                <div>精度: {Math.round(geolocation.accuracy)}m</div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearLocation}
              disabled={disabled}
            >
              位置情報をクリア
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
