"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

// このコンポーネントが受け取るPropsの型を定義
interface PosterMapProps {
  // この時点ではprefectureは使いませんが、将来のために定義しておきます
  prefecture: string;
}

// デフォルトの表示位置（東京駅）
const defaultCenter: LatLngExpression = [35.681236, 139.767125];
const defaultZoom = 5;

export function PosterMap({ prefecture }: PosterMapProps) {
  console.log("表示する都道府県:", prefecture); // 診断用のログ

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
}
