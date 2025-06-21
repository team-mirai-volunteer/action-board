"use client";

import { updatePin } from "@/lib/services/poster-map";
import type { PinData } from "@/lib/types/poster-map";
import {
  createBaseLayers,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/map-utils";
import type { User } from "@supabase/supabase-js";
import type { Control, Layer, LayerGroup, Map as LeafletMap } from "leaflet";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useRef } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

interface PosterMapProps {
  prefecture: string;
  user: { id: string; email: string | undefined };
  pins: PinData[];
}

function getPinNote(note: string | null): string {
  return note || "なし";
}

async function loadBoardPins(
  pins: PinData[],
  layer: LayerGroup,
  L: typeof import("leaflet"),
  setSelectedPin: (pin: PinData) => void,
  status: number | null = null,
) {
  layer.clearLayers();
  const filteredPins =
    status !== null ? pins.filter((item) => item.status === status) : pins;

  console.log(
    `Loading pins for status ${status}:`,
    filteredPins.length,
    "pins",
  );

  for (const pin of filteredPins) {
    if (pin.lat === null || pin.long === null) {
      console.log(
        `Skipping pin ${pin.number} - invalid coordinates:`,
        pin.lat,
        pin.long,
      );
      continue;
    }
    console.log(
      `Creating marker for pin ${pin.number} at [${pin.lat}, ${pin.long}] with status ${pin.status}`,
    );
    const marker = L.marker([pin.lat, pin.long], {
      icon: L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: ${getStatusColor(pin.status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(layer);

    console.log(
      `Added marker for pin ${pin.number} to layer. Layer now has ${layer.getLayers().length} markers`,
    );

    marker.on("click", () => {
      setSelectedPin(pin);
    });
    marker.bindPopup(`
      <div style="font-size: 14px; line-height: 1.6;">
        <b>${pin.place_name || "名称未設定"}</b><br><hr style="margin: 4px 0;">
        <strong>住所:</strong> ${pin.address}<br>
        <strong>掲示板番号:</strong> ${pin.number}<br>
        <strong>ステータス:</strong> ${getStatusText(pin.status)}<br>
        <strong>備考:</strong> ${getPinNote(pin.note)}<br>
        <a href="https://www.google.com/maps?q=${pin.lat},${pin.long}" target="_blank" rel="noopener noreferrer">Google Mapで開く</a>
      </div>
    `);
  }
}

export default function PosterMap({
  prefecture,
  user,
  pins: initialPins,
}: PosterMapProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const layerControlRef = useRef<Control.Layers | null>(null);
  const overlaysRef = useRef<{ [key: string]: LayerGroup }>({});

  const [pins, setPins] = useState<PinData[]>(initialPins);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setPins(initialPins);
  }, [initialPins]);

  useEffect(() => {
    if (selectedPin) {
      setCurrentStatus(selectedPin.status);
      setNoteText(selectedPin.note || "");
    }
  }, [selectedPin]);

  const handleSubmit = async () => {
    if (!selectedPin || currentStatus === null) return;

    setIsSubmitting(true);

    try {
      const success = await updatePin({
        id: selectedPin.id || "",
        status: currentStatus,
        note: noteText || null,
      });

      if (success) {
        setPins((prevPins) =>
          prevPins.map((pin) =>
            pin.id === selectedPin.id
              ? { ...pin, status: currentStatus, note: noteText || null }
              : pin,
          ),
        );
        setSelectedPin({
          ...selectedPin,
          status: currentStatus,
          note: noteText || null,
        });
      } else {
        alert("更新に失敗しました");
      }
    } catch (error) {
      console.error("Error updating pin:", error);
      alert("更新中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!mapInstance) return;

    if (mapInstance.getZoom() === undefined) {
      mapInstance.setView([35.681236, 139.767125], 11);
    }

    const drawPins = async () => {
      console.log(
        "Drawing pins:",
        pins.length,
        "pins for prefecture:",
        prefecture,
      );
      if (pins.length === 0 && prefecture) {
        console.log("No pins to draw, returning early");
        return;
      }

      const L = (await import("leaflet")).default;

      if (layerControlRef.current)
        mapInstance.removeControl(layerControlRef.current);
      for (const layer of Object.values(overlaysRef.current)) {
        if (mapInstance.hasLayer(layer as unknown as Layer))
          mapInstance.removeLayer(layer as unknown as Layer);
      }

      const newOverlays = {
        未: L.layerGroup(),
        完了: L.layerGroup(),
        異常: L.layerGroup(),
        要確認: L.layerGroup(),
        異常対応中: L.layerGroup(),
        削除: L.layerGroup(),
      };
      overlaysRef.current = newOverlays;
      for (const [name, layer] of Object.entries(overlaysRef.current)) {
        layer.addTo(mapInstance);
        console.log(`Added layer ${name} to map`);
      }

      const baseLayers = createBaseLayers(L);
      const newControl = L.control
        .layers(
          {
            OpenStreetMap: baseLayers.osm,
            "Google Map": baseLayers.googleMap,
            国土地理院地図: baseLayers.japanBaseMap,
          },
          overlaysRef.current as unknown as { [key: string]: Layer },
        )
        .addTo(mapInstance);
      layerControlRef.current = newControl;

      await loadBoardPins(pins, overlaysRef.current.未, L, setSelectedPin, 0);
      await loadBoardPins(pins, overlaysRef.current.完了, L, setSelectedPin, 1);
      await loadBoardPins(pins, overlaysRef.current.異常, L, setSelectedPin, 2);
      await loadBoardPins(
        pins,
        overlaysRef.current.要確認,
        L,
        setSelectedPin,
        4,
      );
      await loadBoardPins(
        pins,
        overlaysRef.current.異常対応中,
        L,
        setSelectedPin,
        5,
      );
      await loadBoardPins(pins, overlaysRef.current.削除, L, setSelectedPin, 6);

      console.log("All layers loaded. Checking layer contents...");
      for (const [name, layer] of Object.entries(overlaysRef.current)) {
        console.log(`Layer ${name} has ${layer.getLayers().length} markers`);
      }
    };

    drawPins();
  }, [mapInstance, pins, prefecture]);

  const statusButtons = [
    { value: 0, label: "未", color: "#ff0000" },
    { value: 1, label: "完了", color: "#00ff00" },
    { value: 2, label: "異常", color: "#ff8c00" },
    { value: 4, label: "要確認", color: "#ffff00" },
    { value: 5, label: "異常対応中", color: "#ff69b4" },
    { value: 6, label: "削除", color: "#808080" },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div style={{ height: "100vh", width: "100%" }}>
        <MapContainer
          center={[35.681236, 139.767125]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          ref={(mapRef: LeafletMap | null) => {
            if (mapRef) {
              setMapInstance(mapRef);
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </MapContainer>
      </div>

      {selectedPin && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            minWidth: "300px",
            maxWidth: "400px",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {selectedPin.place_name || "名称未設定"}
          </h3>

          <div
            style={{
              marginBottom: "15px",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            <div>
              <strong>住所:</strong> {selectedPin.address}
            </div>
            <div>
              <strong>掲示板番号:</strong> {selectedPin.number}
            </div>
            <div>
              <strong>現在のステータス:</strong>{" "}
              {getStatusText(selectedPin.status)}
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="status-buttons"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              新しいステータス:
            </label>
            <div
              id="status-buttons"
              style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
            >
              {statusButtons.map((button) => (
                <button
                  key={button.value}
                  type="button"
                  onClick={() => setCurrentStatus(button.value)}
                  style={{
                    padding: "6px 12px",
                    border:
                      currentStatus === button.value
                        ? "2px solid #333"
                        : "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: button.color,
                    color: button.value === 4 ? "#000" : "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="note-textarea"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              備考:
            </label>
            <textarea
              id="note-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{
                width: "100%",
                height: "60px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "vertical",
              }}
              placeholder="備考を入力してください"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || currentStatus === null}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: isSubmitting ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "更新中..." : "更新"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  );
}
