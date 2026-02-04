"use client";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../styles/prefecture-map.css";
import type { PrefectureTeamRanking } from "../types/prefecture-team-types";
import { getColorForRank, NO_DATA_COLOR } from "../utils/color-scale";

interface PrefectureTeamMapProps {
  rankings: PrefectureTeamRanking[];
  userPrefecture?: string | null;
}

interface GeoJSONProperties {
  name: string;
}

// 日本の中心座標とズームレベル
const JAPAN_CENTER: [number, number] = [36.5, 138];
const DEFAULT_ZOOM = 5;
const MIN_ZOOM = 4;
const MAX_ZOOM = 8;

export default function PrefectureTeamMap({
  rankings,
  userPrefecture,
}: PrefectureTeamMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ランキングデータをマップで高速検索できるようにする
  const rankingMap = new Map(rankings.map((r) => [r.prefecture, r]));

  // biome-ignore lint/correctness/useExhaustiveDependencies: 初期化は一度だけ実行
  useEffect(() => {
    // マップの初期化
    if (!mapRef.current) {
      mapRef.current = L.map("prefecture-team-map", {
        center: JAPAN_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: true,
      });

      // 地理院タイル（淡色）を追加
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    // GeoJSONデータを読み込み
    loadGeoJSON();

    // クリーンアップ
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ランキングデータまたはユーザー都道府県が変わったらスタイルを更新
  // biome-ignore lint/correctness/useExhaustiveDependencies: getFeatureStyleはrankingsとuserPrefectureに依存
  useEffect(() => {
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.setStyle((feature) => {
        if (!feature) return {};
        return getFeatureStyle(feature as Feature<Geometry, GeoJSONProperties>);
      });
    }
  }, [rankings, userPrefecture]);

  const loadGeoJSON = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch("/geojson/japan-prefectures.geojson");
      if (!response.ok) {
        throw new Error("GeoJSONの読み込みに失敗しました");
      }
      const geojson: FeatureCollection<Geometry, GeoJSONProperties> =
        await response.json();

      // 既存のレイヤーを削除
      if (geojsonLayerRef.current && mapRef.current) {
        geojsonLayerRef.current.remove();
      }

      // GeoJSONレイヤーを作成
      if (mapRef.current) {
        geojsonLayerRef.current = L.geoJSON(geojson, {
          style: getFeatureStyle,
          onEachFeature: onEachFeature,
        }).addTo(mapRef.current);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  // 都道府県ポリゴンのスタイルを返す
  const getFeatureStyle = (
    feature?: Feature<Geometry, GeoJSONProperties>,
  ): L.PathOptions => {
    if (!feature) return {};
    const prefName = feature.properties?.name;
    const rankingData = rankingMap.get(prefName);

    return {
      fillColor: rankingData
        ? getColorForRank(rankingData.rank)
        : NO_DATA_COLOR,
      weight: 1,
      opacity: 1,
      color: "#666",
      fillOpacity: 1,
    };
  };

  // 各都道府県にイベントをバインド
  const onEachFeature = (
    feature: Feature<Geometry, GeoJSONProperties>,
    layer: L.Layer,
  ) => {
    const prefName = feature.properties?.name;
    const rankingData = rankingMap.get(prefName);

    // ポップアップ/ツールチップの内容
    const content = `
      <div class="prefecture-tooltip">
        <div class="tooltip-header">${prefName}</div>
        ${
          rankingData
            ? `
          <div class="tooltip-rank">${rankingData.rank}位</div>
          <div class="tooltip-stats">
            チームパワー: ${Math.round(rankingData.xpPerCapita).toLocaleString()}<br/>
            参加人数: ${rankingData.userCount.toLocaleString()}人<br/>
            合計XP: ${rankingData.totalXp.toLocaleString()}
          </div>
        `
            : '<div class="tooltip-stats">データなし</div>'
        }
      </div>
    `;

    // デスクトップ用: ホバーでツールチップ表示
    layer.bindTooltip(content, {
      permanent: false,
      direction: "top",
      className: "",
    });

    // モバイル用: タップでポップアップ表示
    layer.bindPopup(content, {
      className: "prefecture-popup",
    });

    // ホバーイベント
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 3,
          fillOpacity: 0.9,
        });
        target.bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 1,
          fillOpacity: 1,
        });
      },
    });
  };

  return (
    <div className="relative">
      <div id="prefecture-team-map" />

      {/* ローディング表示 */}
      {isLoading && (
        <div className="prefecture-map-loading">
          <div className="prefecture-map-loading-spinner" />
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-20">
          <div className="text-red-500 text-center">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadGeoJSON}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              再試行
            </button>
          </div>
        </div>
      )}

      {/* 凡例 */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <div className="prefecture-map-legend">
            <h4>チームパワー</h4>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#08306b" }}
              />
              <span className="legend-label">高</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{
                  background: "linear-gradient(to bottom, #4292c6, #c6dbef)",
                }}
              />
              <span className="legend-label" />
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#f7fbff" }}
              />
              <span className="legend-label">低</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
