export function getStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: "未",
    1: "完了",
    2: "異常",
    4: "要確認",
    5: "異常対応中",
    6: "削除",
  };
  return statusMap[status] || "不明";
}

export function getStatusColor(status: number): string {
  const colorMap: Record<number, string> = {
    0: "#ff0000",
    1: "#00ff00",
    2: "#ff8c00",
    4: "#ffff00",
    5: "#ff69b4",
    6: "#808080",
  };
  return colorMap[status] || "#000000";
}

export function getPrefectureCoordinates(prefecture: string): [number, number] {
  const coordinates: Record<string, [number, number]> = {
    北海道: [43.0642, 141.3469],
    青森県: [40.8244, 140.74],
    岩手県: [39.7036, 141.1527],
    宮城県: [38.2682, 140.8721],
    秋田県: [39.7186, 140.1024],
    山形県: [38.2404, 140.3633],
    福島県: [37.7503, 140.4676],
    茨城県: [36.3418, 140.4468],
    栃木県: [36.5657, 139.8836],
    群馬県: [36.3911, 139.0608],
    埼玉県: [35.8569, 139.6489],
    千葉県: [35.6074, 140.1065],
    東京都: [35.6762, 139.6503],
    神奈川県: [35.4478, 139.6425],
    新潟県: [37.9026, 139.0232],
    富山県: [36.6959, 137.2113],
    石川県: [36.5946, 136.6256],
    福井県: [36.0652, 136.2217],
    山梨県: [35.6642, 138.5683],
    長野県: [36.6513, 138.1811],
    岐阜県: [35.3912, 136.7223],
    静岡県: [34.9769, 138.3831],
    愛知県: [35.1802, 136.9066],
    三重県: [34.7303, 136.5086],
    滋賀県: [35.0045, 135.8686],
    京都府: [35.0211, 135.7556],
    大阪府: [34.6937, 135.5023],
    兵庫県: [34.6913, 134.9001],
    奈良県: [34.6851, 135.8048],
    和歌山県: [34.2261, 135.1675],
    鳥取県: [35.5038, 134.2384],
    島根県: [35.4723, 133.0505],
    岡山県: [34.6617, 133.9341],
    広島県: [34.3963, 132.4596],
    山口県: [34.1859, 131.4706],
    徳島県: [34.0658, 134.5594],
    香川県: [34.3401, 134.0434],
    愛媛県: [33.8416, 132.7657],
    高知県: [33.5597, 133.5311],
    福岡県: [33.6064, 130.4181],
    佐賀県: [33.2494, 130.2989],
    長崎県: [32.7503, 129.8677],
    熊本県: [32.7898, 130.7417],
    大分県: [33.2382, 131.6126],
    宮崎県: [31.9077, 131.4202],
    鹿児島県: [31.5602, 130.5581],
    沖縄県: [26.2124, 127.6792],
  };

  return coordinates[prefecture] || [35.6762, 139.6503];
}

export function createBaseLayers(L: {
  tileLayer: (url: string, options: Record<string, string>) => unknown;
}) {
  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  );

  const googleMap = L.tileLayer(
    "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
    {
      attribution: "&copy; Google",
    },
  );

  const japanBaseMap = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
    },
  );

  return {
    osm,
    googleMap,
    japanBaseMap,
  };
}

export function createGrayIcon(L: {
  icon: (options: Record<string, unknown>) => unknown;
}) {
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

export function createProgressBox(
  L: {
    Control: {
      extend: (
        options: Record<string, unknown>,
      ) => new (
        options: Record<string, unknown>,
      ) => unknown;
    };
    DomUtil: {
      create: (tag: string, className: string) => { innerHTML: string };
    };
  },
  percentage: number,
  position: string,
) {
  const ProgressControl = L.Control.extend({
    onAdd: () => {
      const div = L.DomUtil.create("div", "info");
      div.innerHTML = `<h4>進捗状況</h4><b>${percentage}%</b>`;
      return div;
    },
  });

  return new ProgressControl({ position });
}

export function createProgressBoxCountdown(
  L: {
    Control: {
      extend: (
        options: Record<string, unknown>,
      ) => new (
        options: Record<string, unknown>,
      ) => unknown;
    };
    DomUtil: {
      create: (tag: string, className: string) => { innerHTML: string };
    };
  },
  total: number,
  position: string,
) {
  const CountdownControl = L.Control.extend({
    onAdd: () => {
      const div = L.DomUtil.create("div", "info");
      div.innerHTML = `<h4>総数</h4><b>${total}件</b>`;
      return div;
    },
  });

  return new CountdownControl({ position });
}
