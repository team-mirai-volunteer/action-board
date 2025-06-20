import type { TileLayer } from "leaflet";
import type L from "leaflet";

export function getStatusText(status: number): string {
  const statusDict: { [key: number]: string } = {
    0: "未",
    1: "完了",
    2: "異常",
    3: "予約",
    4: "要確認",
    5: "異常対応中",
    6: "削除",
    7: "貼付確認済",
  };
  return statusDict[status] || "不明";
}

export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return "#3498DB"; // 青
    case 1:
      return "#2ECC71"; // 緑
    case 7:
      return "#F4D03F"; // 黄色
    case 2:
      return "#E74C3C"; // 赤
    case 4:
      return "#F39C12"; // オレンジ
    case 5:
      return "#9B59B6"; // 紫
    case 6:
      return "#95A5A6"; // グレー
    default:
      return "#FFFFFF"; // 不明
  }
}

export function createBaseLayers(L: typeof import("leaflet")): {
  [key: string]: TileLayer;
} {
  return {
    osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    japanBaseMap: L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      },
    ),
  };
}
