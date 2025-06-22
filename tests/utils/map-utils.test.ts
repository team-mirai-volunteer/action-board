import {
  createBaseLayers,
  createGrayIcon,
  createProgressBox,
  createProgressBoxCountdown,
  getPrefectureCoordinates,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/map-utils";

describe("地図ユーティリティ関数", () => {
  describe("getStatusText関数", () => {
    describe("正常なステータス値", () => {
      test("ステータス0は「未」を返す", () => {
        expect(getStatusText(0)).toBe("未");
      });

      test("ステータス1は「完了」を返す", () => {
        expect(getStatusText(1)).toBe("完了");
      });

      test("ステータス2は「異常」を返す", () => {
        expect(getStatusText(2)).toBe("異常");
      });

      test("ステータス4は「要確認」を返す", () => {
        expect(getStatusText(4)).toBe("要確認");
      });

      test("ステータス5は「異常対応中」を返す", () => {
        expect(getStatusText(5)).toBe("異常対応中");
      });

      test("ステータス6は「削除」を返す", () => {
        expect(getStatusText(6)).toBe("削除");
      });
    });

    describe("無効なステータス値", () => {
      test("未定義のステータス値は「不明」を返す", () => {
        expect(getStatusText(3)).toBe("不明");
        expect(getStatusText(7)).toBe("不明");
        expect(getStatusText(999)).toBe("不明");
      });

      test("負の値は「不明」を返す", () => {
        expect(getStatusText(-1)).toBe("不明");
        expect(getStatusText(-999)).toBe("不明");
      });

      test("非数値は「不明」を返す", () => {
        expect(getStatusText(Number.NaN)).toBe("不明");
        expect(getStatusText(Number.POSITIVE_INFINITY)).toBe("不明");
      });
    });
  });

  describe("getStatusColor関数", () => {
    describe("正常なステータス値", () => {
      test("ステータス0は赤色を返す", () => {
        expect(getStatusColor(0)).toBe("#ff0000");
      });

      test("ステータス1は緑色を返す", () => {
        expect(getStatusColor(1)).toBe("#00ff00");
      });

      test("ステータス2はオレンジ色を返す", () => {
        expect(getStatusColor(2)).toBe("#ff8c00");
      });

      test("ステータス4は黄色を返す", () => {
        expect(getStatusColor(4)).toBe("#ffff00");
      });

      test("ステータス5はピンク色を返す", () => {
        expect(getStatusColor(5)).toBe("#ff69b4");
      });

      test("ステータス6はグレー色を返す", () => {
        expect(getStatusColor(6)).toBe("#808080");
      });
    });

    describe("無効なステータス値", () => {
      test("未定義のステータス値は黒色を返す", () => {
        expect(getStatusColor(3)).toBe("#000000");
        expect(getStatusColor(7)).toBe("#000000");
        expect(getStatusColor(999)).toBe("#000000");
      });

      test("負の値は黒色を返す", () => {
        expect(getStatusColor(-1)).toBe("#000000");
      });
    });
  });

  describe("getPrefectureCoordinates関数", () => {
    describe("正常な都道府県名", () => {
      test("東京都の座標を正しく返す", () => {
        const [lat, lng] = getPrefectureCoordinates("東京都");
        expect(lat).toBe(35.6762);
        expect(lng).toBe(139.6503);
      });

      test("北海道の座標を正しく返す", () => {
        const [lat, lng] = getPrefectureCoordinates("北海道");
        expect(lat).toBe(43.0642);
        expect(lng).toBe(141.3469);
      });

      test("沖縄県の座標を正しく返す", () => {
        const [lat, lng] = getPrefectureCoordinates("沖縄県");
        expect(lat).toBe(26.2124);
        expect(lng).toBe(127.6792);
      });

      test("大阪府の座標を正しく返す", () => {
        const [lat, lng] = getPrefectureCoordinates("大阪府");
        expect(lat).toBe(34.6937);
        expect(lng).toBe(135.5023);
      });
    });

    describe("全47都道府県の座標マッピング", () => {
      const allPrefectures = [
        "北海道",
        "青森県",
        "岩手県",
        "宮城県",
        "秋田県",
        "山形県",
        "福島県",
        "茨城県",
        "栃木県",
        "群馬県",
        "埼玉県",
        "千葉県",
        "東京都",
        "神奈川県",
        "新潟県",
        "富山県",
        "石川県",
        "福井県",
        "山梨県",
        "長野県",
        "岐阜県",
        "静岡県",
        "愛知県",
        "三重県",
        "滋賀県",
        "京都府",
        "大阪府",
        "兵庫県",
        "奈良県",
        "和歌山県",
        "鳥取県",
        "島根県",
        "岡山県",
        "広島県",
        "山口県",
        "徳島県",
        "香川県",
        "愛媛県",
        "高知県",
        "福岡県",
        "佐賀県",
        "長崎県",
        "熊本県",
        "大分県",
        "宮崎県",
        "鹿児島県",
        "沖縄県",
      ];

      test("全47都道府県の座標が定義されている", () => {
        for (const prefecture of allPrefectures) {
          const [lat, lng] = getPrefectureCoordinates(prefecture);
          expect(typeof lat).toBe("number");
          expect(typeof lng).toBe("number");
          expect(lat).toBeGreaterThan(20);
          expect(lat).toBeLessThan(50);
          expect(lng).toBeGreaterThan(120);
          expect(lng).toBeLessThan(150);
        }
      });

      test("各都道府県の座標が有効な範囲内にある", () => {
        for (const prefecture of allPrefectures) {
          const [lat, lng] = getPrefectureCoordinates(prefecture);
          expect(lat).not.toBeNaN();
          expect(lng).not.toBeNaN();
          expect(lat).toBeGreaterThan(0);
          expect(lng).toBeGreaterThan(0);
        }
      });
    });

    describe("フォールバック機能", () => {
      test("存在しない都道府県名は東京都の座標を返す", () => {
        const [lat, lng] = getPrefectureCoordinates("存在しない県");
        expect(lat).toBe(35.6762);
        expect(lng).toBe(139.6503);
      });

      test("空文字列は東京都の座標を返す", () => {
        const [lat, lng] = getPrefectureCoordinates("");
        expect(lat).toBe(35.6762);
        expect(lng).toBe(139.6503);
      });

      test("nullやundefinedでもエラーにならない", () => {
        const [lat1, lng1] = getPrefectureCoordinates(
          null as unknown as string,
        );
        const [lat2, lng2] = getPrefectureCoordinates(
          undefined as unknown as string,
        );

        expect(lat1).toBe(35.6762);
        expect(lng1).toBe(139.6503);
        expect(lat2).toBe(35.6762);
        expect(lng2).toBe(139.6503);
      });
    });
  });

  describe("createBaseLayers関数", () => {
    const mockLeaflet = {
      tileLayer: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockLeaflet.tileLayer.mockReturnValue({});
    });

    test("OpenStreetMapレイヤーが正しく作成される", () => {
      createBaseLayers(mockLeaflet);

      expect(mockLeaflet.tileLayer).toHaveBeenCalledWith(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      );
    });

    test("Googleマップレイヤーが正しく作成される", () => {
      createBaseLayers(mockLeaflet);

      expect(mockLeaflet.tileLayer).toHaveBeenCalledWith(
        "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
        {
          attribution: "&copy; Google",
        },
      );
    });

    test("国土地理院レイヤーが正しく作成される", () => {
      createBaseLayers(mockLeaflet);

      expect(mockLeaflet.tileLayer).toHaveBeenCalledWith(
        "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
        },
      );
    });

    test("3つのベースレイヤーが返される", () => {
      const layers = createBaseLayers(mockLeaflet);

      expect(layers).toHaveProperty("osm");
      expect(layers).toHaveProperty("googleMap");
      expect(layers).toHaveProperty("japanBaseMap");
      expect(Object.keys(layers)).toHaveLength(3);
    });
  });

  describe("createGrayIcon関数", () => {
    const mockLeaflet = {
      icon: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockLeaflet.icon.mockReturnValue({});
    });

    test("グレーアイコンが正しい設定で作成される", () => {
      createGrayIcon(mockLeaflet);

      expect(mockLeaflet.icon).toHaveBeenCalledWith({
        iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: "icon-gray",
      });
    });
  });

  describe("createProgressBox関数", () => {
    const mockLeaflet = {
      Control: {
        extend: jest.fn(),
      },
      DomUtil: {
        create: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockLeaflet.DomUtil.create.mockReturnValue({});

      const mockConstructor = jest.fn().mockImplementation(function (this: {
        onAdd: () => unknown;
      }) {
        this.onAdd = () => mockLeaflet.DomUtil.create("div", "info");
      });
      mockLeaflet.Control.extend.mockReturnValue(mockConstructor);
    });

    test("進捗ボックスが正しい割合で作成される", () => {
      const percentage = 75;
      const position = "topright";

      const result = createProgressBox(mockLeaflet, percentage, position);

      expect(mockLeaflet.Control.extend).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test("0%の進捗でも正常に作成される", () => {
      const percentage = 0;
      const position = "topleft";

      const result = createProgressBox(mockLeaflet, percentage, position);
      expect(result).toBeDefined();
    });

    test("100%の進捗でも正常に作成される", () => {
      const percentage = 100;
      const position = "bottomright";

      const result = createProgressBox(mockLeaflet, percentage, position);
      expect(result).toBeDefined();
    });
  });

  describe("createProgressBoxCountdown関数", () => {
    const mockLeaflet = {
      Control: {
        extend: jest.fn(),
      },
      DomUtil: {
        create: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockLeaflet.DomUtil.create.mockReturnValue({});

      const mockConstructor = jest.fn().mockImplementation(function (this: {
        onAdd: () => unknown;
      }) {
        this.onAdd = () => mockLeaflet.DomUtil.create("div", "info");
      });
      mockLeaflet.Control.extend.mockReturnValue(mockConstructor);
    });

    test("総数ボックスが正しい数値で作成される", () => {
      const total = 150;
      const position = "topright";

      const result = createProgressBoxCountdown(mockLeaflet, total, position);

      expect(mockLeaflet.Control.extend).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test("0の総数でも正常に作成される", () => {
      const total = 0;
      const position = "topleft";

      const result = createProgressBoxCountdown(mockLeaflet, total, position);
      expect(result).toBeDefined();
    });

    test("大きな数値でも正常に作成される", () => {
      const total = 9999;
      const position = "bottomleft";

      const result = createProgressBoxCountdown(mockLeaflet, total, position);
      expect(result).toBeDefined();
    });
  });
});
