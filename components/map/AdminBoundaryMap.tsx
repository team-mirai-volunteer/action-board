"use client";

import type { Database } from "@/lib/types/supabase";
import type { Layer, Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

type AdminBoundary = Database["public"]["Tables"]["admin_boundaries"]["Row"];

interface AdminBoundaryMapProps {
  adminBoundary: AdminBoundary | null;
  className?: string;
  height?: number;
}

export function AdminBoundaryMap({
  adminBoundary,
  className = "",
  height = 400,
}: AdminBoundaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const boundaryLayerRef = useRef<Layer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // マップの初期化（動的インポート）
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Leafletを動的にインポート
        const L = (await import("leaflet")).default;

        // CSSの読み込みを確実にする
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);

          // CSSの読み込み完了を待つ
          await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 1000); // タイムアウト
          });
        }

        if (!isMounted) return;

        // コンテナの高さと幅が設定されるまで待つ
        let attempts = 0;
        while (
          mapRef.current &&
          (mapRef.current.offsetHeight === 0 ||
            mapRef.current.offsetWidth === 0) &&
          attempts < 30
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!mapRef.current || !isMounted) return;

        // まだサイズが0の場合は、強制的にサイズを設定
        if (
          mapRef.current.offsetWidth === 0 ||
          mapRef.current.offsetHeight === 0
        ) {
          console.warn(
            "マップコンテナのサイズが0です。サイズを強制設定します。",
            {
              width: mapRef.current.offsetWidth,
              height: mapRef.current.offsetHeight,
            },
          );

          // 親要素とマップコンテナに最小サイズを設定
          const parent = mapRef.current.parentElement;
          if (parent) {
            parent.style.width = "100%";
            parent.style.height = "100%";
            parent.style.minWidth = "400px";
            parent.style.minHeight = "300px";
            parent.style.display = "block";
            parent.style.position = "relative";
          }

          mapRef.current.style.width = "100%";
          mapRef.current.style.height = "100%";
          mapRef.current.style.minWidth = "400px";
          mapRef.current.style.minHeight = "300px";
          mapRef.current.style.display = "block";
          mapRef.current.style.position = "absolute";
          mapRef.current.style.top = "0";
          mapRef.current.style.left = "0";

          // 再度待機
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Leafletアイコンの設定
        // biome-ignore lint/performance/noDelete: Leafletライブラリの要求により必要
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
          ._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        console.log(
          "マップコンテナサイズ:",
          mapRef.current.offsetWidth,
          "x",
          mapRef.current.offsetHeight,
        );

        // マップの初期化
        const map = L.map(mapRef.current, {
          center: [35.6762, 139.6503], // 東京の座標
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // タイルレイヤーの追加
        const tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          },
        );

        tileLayer.addTo(map);

        // タイル読み込みの確認
        tileLayer.on("loading", () => {
          console.log("タイル読み込み開始");
        });

        tileLayer.on("load", () => {
          console.log("タイル読み込み完了");
        });

        tileLayer.on("tileerror", (e) => {
          console.error("タイル読み込みエラー:", e);
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // マップのサイズを段階的に調整
        const adjustMapSize = () => {
          if (mapInstanceRef.current && isMounted && mapRef.current) {
            const containerWidth = mapRef.current.offsetWidth;
            const containerHeight = mapRef.current.offsetHeight;

            console.log("マップサイズ調整:", {
              width: containerWidth,
              height: containerHeight,
              parent: mapRef.current.parentElement?.offsetWidth,
              parentHeight: mapRef.current.parentElement?.offsetHeight,
            });

            // サイズが小さすぎる場合は再設定
            if (containerWidth < 300 || containerHeight < 200) {
              console.warn("マップサイズが小さすぎます。再設定します。");
              if (mapRef.current.parentElement) {
                mapRef.current.parentElement.style.minWidth = "400px";
                mapRef.current.parentElement.style.minHeight = "300px";
              }
              mapRef.current.style.minWidth = "400px";
              mapRef.current.style.minHeight = "300px";

              // 少し遅延してから再調整
              setTimeout(() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.invalidateSize();
                }
              }, 200);
            }

            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }
        };

        // 複数回サイズ調整を実行
        setTimeout(adjustMapSize, 100);
        setTimeout(adjustMapSize, 300);
        setTimeout(adjustMapSize, 500);
        setTimeout(adjustMapSize, 1000);
        setTimeout(adjustMapSize, 2000);
      } catch (error) {
        console.error("マップの初期化に失敗しました:", error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // ウィンドウリサイズ時のマップサイズ調整
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && isMapReady) {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      }
    };

    // ResizeObserverでコンテナサイズの変更を監視
    let resizeObserver: ResizeObserver | null = null;

    if (mapRef.current && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (mapInstanceRef.current && isMapReady) {
            console.log("ResizeObserver: マップコンテナサイズ変更", {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
              }
            }, 50);
          }
        }
      });

      resizeObserver.observe(mapRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isMapReady]);

  // 行政区域データの表示
  useEffect(() => {
    if (!mapInstanceRef.current || !adminBoundary || !isMapReady) return;

    setIsLoading(true);

    const displayBoundary = async () => {
      try {
        // Leafletを動的にインポート
        const L = (await import("leaflet")).default;

        // 既存のレイヤーを削除
        if (boundaryLayerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
        }

        // GeoJSONデータの検証
        if (
          !adminBoundary.geojson ||
          typeof adminBoundary.geojson !== "object"
        ) {
          console.error("無効なGeoJSONデータ:", adminBoundary.geojson);
          return;
        }

        // MultiPolygon対応のデバッグ情報
        const geojsonObj =
          adminBoundary.geojson as unknown as GeoJSON.GeoJsonObject;
        if ("type" in geojsonObj && "coordinates" in geojsonObj) {
          console.log(`Geometry型: ${geojsonObj.type}`, {
            coordinatesLength: Array.isArray(geojsonObj.coordinates)
              ? geojsonObj.coordinates.length
              : "N/A",
            isMultiPolygon: geojsonObj.type === "MultiPolygon",
          });
        }

        // GeoJSONレイヤーの作成
        const geoJsonLayer = L.geoJSON(
          adminBoundary.geojson as unknown as GeoJSON.GeoJsonObject,
          {
            style: {
              color: "#3B82F6",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.2,
              fillColor: "#3B82F6",
            },
            onEachFeature: (feature, layer) => {
              // ポップアップの設定
              const popupContent = `
              <div class="p-2">
                <h3 class="font-semibold text-sm mb-2">${adminBoundary.full_address}</h3>
                <div class="space-y-1 text-xs">
                  <div><strong>都道府県:</strong> ${adminBoundary.prefecture_name}</div>
                  ${adminBoundary.city_name ? `<div><strong>市区町村:</strong> ${adminBoundary.city_name}</div>` : ""}
                  ${adminBoundary.district_name ? `<div><strong>地区:</strong> ${adminBoundary.district_name}</div>` : ""}
                  ${adminBoundary.area_name ? `<div><strong>エリア:</strong> ${adminBoundary.area_name}</div>` : ""}
                  ${adminBoundary.additional_code ? `<div><strong>行政区域コード:</strong> ${adminBoundary.additional_code}</div>` : ""}
                </div>
              </div>
            `;
              layer.bindPopup(popupContent);
            },
          },
        );

        // レイヤーをマップに追加
        if (mapInstanceRef.current) {
          geoJsonLayer.addTo(mapInstanceRef.current);
          boundaryLayerRef.current = geoJsonLayer as unknown as Layer;

          // 表示範囲を調整
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid() && mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      } catch (error) {
        console.error("GeoJSON表示エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    displayBoundary();
  }, [adminBoundary, isMapReady]);

  return (
    <div
      className={`relative w-full h-full min-w-[400px] min-h-[300px] ${className}`}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: height > 0 ? `${height}px` : "100%",
          minWidth: "400px",
          minHeight: "300px",
          position: "relative",
          zIndex: 0,
        }}
        className="w-full h-full"
      />
      {(isLoading || !isMapReady) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded z-10">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              {!isMapReady ? "マップを初期化中..." : "地図を読み込み中..."}
            </div>
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
      {!adminBoundary && isMapReady && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg border p-4 shadow-sm z-10">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">🗺️</div>
            <div className="text-sm">住所を選択してください</div>
          </div>
        </div>
      )}
    </div>
  );
}
