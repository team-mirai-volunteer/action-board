import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { MissionSelect } from "./mission-select";

type Mission = {
  id: string;
  title: string;
  description: string;
};

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

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

const mockMissions = [
  {
    id: "mission-1",
    title: "テストミッション1",
    description: "テスト用のミッション1",
  },
  {
    id: "mission-2",
    title: "テストミッション2",
    description: "テスト用のミッション2",
  },
  {
    id: "mission-3",
    title: "テストミッション3",
    description: "テスト用のミッション3",
  },
] as any;

describe("MissionSelect", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.location.search = "";
  });

  describe("基本的な表示", () => {
    it("ラベルが正しく表示される", () => {
      render(<MissionSelect missions={mockMissions} />);

      expect(screen.getByText("ミッションを選択")).toBeInTheDocument();
    });

    it("セレクトボックスが表示される", () => {
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute("id", "mission-select");
    });

    it("ChevronDownアイコンが表示される", () => {
      render(<MissionSelect missions={mockMissions} />);

      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("すべてのミッションオプションが表示される", () => {
      render(<MissionSelect missions={mockMissions} />);

      expect(screen.getByText("テストミッション1")).toBeInTheDocument();
      expect(screen.getByText("テストミッション2")).toBeInTheDocument();
      expect(screen.getByText("テストミッション3")).toBeInTheDocument();
    });
  });

  describe("初期値の設定", () => {
    it("URLパラメータがない場合は最初のミッションが選択される", () => {
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("mission-1");
    });

    it("URLパラメータがある場合はそのミッションが選択される", () => {
      window.location.search = "?missionId=mission-2";
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("mission-2");
    });
  });

  describe("ミッション変更時の動作", () => {
    it("ミッションを変更するとrouterのpushが呼ばれる", () => {
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "mission-3" } });

      expect(mockPush).toHaveBeenCalledWith(
        "/ranking/ranking-mission?missionId=mission-3",
      );
    });

    it("選択値が更新される", () => {
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: "mission-2" } });

      expect(select.value).toBe("mission-2");
    });
  });

  describe("エッジケース", () => {
    it("ミッションが空の場合でもエラーにならない", () => {
      render(<MissionSelect missions={[]} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("単一のミッションの場合", () => {
      const singleMission = [mockMissions[0]];
      render(<MissionSelect missions={singleMission} />);

      expect(screen.getByText("テストミッション1")).toBeInTheDocument();
      expect(screen.queryByText("テストミッション2")).not.toBeInTheDocument();
    });

    it("無効なmissionIdがURLにある場合は最初のミッションが選択される", () => {
      window.location.search = "?missionId=invalid-mission";
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("mission-1");
    });
  });

  describe("CSSクラス", () => {
    it("適切なCSSクラスが設定される", () => {
      render(<MissionSelect missions={mockMissions} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "w-full",
        "p-3",
        "pl-4",
        "pr-10",
        "text-base",
        "border",
        "border-gray-300",
        "rounded-lg",
        "bg-white",
        "appearance-none",
        "cursor-pointer",
      );
    });
  });
});
