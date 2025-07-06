import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { PrefectureSelect } from "./prefecture-select";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("lucide-react", () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <div className={className} data-testid="chevron-down" />
  ),
}));

(window as any).location = undefined;
(window as any).location = { search: "" };

const mockPrefectures = [
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

describe("PrefectureSelect", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.location.search = "";
  });

  describe("基本的な表示", () => {
    it("ラベルが正しく表示される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      expect(screen.getByText("都道府県を選択")).toBeInTheDocument();
    });

    it("セレクトボックスが表示される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute("id", "prefecture-select");
    });

    it("ChevronDownアイコンが表示される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("都道府県オプションが表示される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      expect(screen.getByText("北海道")).toBeInTheDocument();
      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.getByText("大阪府")).toBeInTheDocument();
      expect(screen.getByText("沖縄県")).toBeInTheDocument();
    });
  });

  describe("初期値の設定", () => {
    it("selectedPrefectureが指定されていない場合は最初の都道府県が初期値", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("北海道");
    });

    it("selectedPrefectureが指定されている場合はその値が初期値", () => {
      render(
        <PrefectureSelect
          prefectures={mockPrefectures}
          selectedPrefecture="東京都"
        />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("東京都");
    });
  });

  describe("都道府県変更時の動作", () => {
    it("都道府県を変更するとrouterのpushが呼ばれる", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "愛知県" } });

      expect(mockPush).toHaveBeenCalledWith(
        "/ranking/ranking-prefecture?prefecture=%E6%84%9B%E7%9F%A5%E7%9C%8C",
      );
    });

    it("選択値が更新される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "福岡県" } });

      expect(select.value).toBe("福岡県");
    });
  });

  describe("エッジケース", () => {
    it("都道府県が空の場合でもエラーにならない", () => {
      render(<PrefectureSelect prefectures={[]} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("単一の都道府県の場合", () => {
      render(<PrefectureSelect prefectures={["東京都"]} />);

      expect(screen.getByText("東京都")).toBeInTheDocument();
      expect(screen.queryByText("大阪府")).not.toBeInTheDocument();
    });
  });

  describe("都道府県リスト", () => {
    it("47都道府県すべてが含まれている", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox");
      const options = select.querySelectorAll("option");
      expect(options).toHaveLength(47);
    });

    it("都道府県が正しい順序で表示される", () => {
      render(<PrefectureSelect prefectures={mockPrefectures} />);

      const select = screen.getByRole("combobox");
      const options = Array.from(select.querySelectorAll("option")).map(
        (option) => option.textContent,
      );

      expect(options[0]).toBe("北海道");
      expect(options[12]).toBe("東京都");
      expect(options[46]).toBe("沖縄県");
    });
  });
});
