export function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return "未";
    case 1:
      return "完了";
    case 2:
      return "異常";
    case 4:
      return "要確認";
    case 5:
      return "異常対応中";
    case 6:
      return "削除";
    default:
      return "不明";
  }
}

export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return "#ff0000";
    case 1:
      return "#00ff00";
    case 2:
      return "#ff8c00";
    case 4:
      return "#ffff00";
    case 5:
      return "#ff69b4";
    case 6:
      return "#808080";
    default:
      return "#000000";
  }
}

export function createProgressBox(
  L: typeof import("leaflet"),
  percentage: number,
  position: L.ControlPosition,
) {
  const ProgressControl = L.Control.extend({
    onAdd: () => {
      const div = L.DomUtil.create("div", "info");
      div.innerHTML = `<p>進捗率</p><p class="progressValue">${percentage}%</p>`;
      return div;
    },
  });
  return new ProgressControl({ position });
}

export function createProgressBoxCountdown(
  L: typeof import("leaflet"),
  total: number,
  position: L.ControlPosition,
) {
  const ProgressControl = L.Control.extend({
    onAdd: () => {
      const div = L.DomUtil.create("div", "info");
      div.innerHTML = `<p>総数</p><p class="progressValue">${total}</p>`;
      return div;
    },
  });
  return new ProgressControl({ position });
}

export function createBaseLayers(L: typeof import("leaflet")) {
  return {
    osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    googleMap: L.tileLayer(
      "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
      {
        attribution: "&copy; Google",
      },
    ),
    japanBaseMap: L.tileLayer(
      "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      },
    ),
  };
}

export function createGrayIcon(L: typeof import("leaflet")) {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: "icon-gray",
  });
}
