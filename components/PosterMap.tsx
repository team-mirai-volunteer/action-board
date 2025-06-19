"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

// デフォルトの表示位置（東京駅）
const defaultCenter: LatLngExpression = [35.681236, 139.767125];
const defaultZoom = 5; // 日本全体が少し見えるくらいのズームレベル

export function PosterMap() {
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
        {/* まだピンは表示しません */}
      </MapContainer>
    </div>
  );
}
