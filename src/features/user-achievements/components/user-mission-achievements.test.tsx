import { render, screen, within } from "@testing-library/react";
import UserMissionAchievements from "./user-mission-achievements";

type MissionAchievementSummary = {
  mission_id: string;
  mission_title: string;
  achievement_count: number;
};

const mockAchievements: MissionAchievementSummary[] = [
  {
    mission_id: "mission-1",
    mission_title: "テストミッション1",
    achievement_count: 3,
  },
  {
    mission_id: "mission-2",
    mission_title: "テストミッション2",
    achievement_count: 5,
  },
  {
    mission_id: "mission-3",
    mission_title: "テストミッション3",
    achievement_count: 1,
  },
];

describe("UserMissionAchievements", () => {
  describe("基本的な表示", () => {
    it("タイトルが正しく表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      expect(screen.getByText("ミッション達成状況")).toBeInTheDocument();
    });

    it.each([
      { totalCount: 0 },
      { totalCount: 1 },
      { totalCount: 9 },
      { totalCount: 1000 },
    ])("総達成数カードが表示される: $totalCount", ({ totalCount }) => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={totalCount}
        />,
      );

      const totalTitle = screen.getByText("🏆総達成数");
      const totalCard = totalTitle.parentElement as HTMLElement; // Card 内のタイトル div
      expect(totalCard).toBeInTheDocument();
      expect(
        within(totalCard).getByText(String(totalCount)),
      ).toBeInTheDocument();
      expect(within(totalCard).getByText("回")).toBeInTheDocument();
    });
  });

  describe("ミッション達成カードの表示", () => {
    it("すべてのミッション達成リンクが表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      const missionLinks = screen.getAllByRole("link");
      expect(missionLinks).toHaveLength(mockAchievements.length);
    });

    it("各ミッションの情報が正しく表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      for (const a of mockAchievements) {
        const titleEl = screen.getByText(a.mission_title);
        expect(titleEl).toBeInTheDocument();

        // タイトルのカード（Link要素内）を起点に達成回数を検証
        const cardRoot = titleEl.parentElement?.parentElement as HTMLElement; // title div の親が Card ルート
        expect(
          within(cardRoot).getByText(String(a.achievement_count)),
        ).toBeInTheDocument();
        expect(within(cardRoot).getByText("回")).toBeInTheDocument();
      }
    });

    it("ミッションIDからリンク先が生成される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      const missionLinks = screen.getAllByRole("link");
      // 順序は map 順になる
      missionLinks.forEach((link, idx) => {
        expect(link).toHaveAttribute(
          "href",
          `/missions/${mockAchievements[idx].mission_id}`,
        );
      });
    });
  });

  describe("空の状態", () => {
    it("達成したミッションがない場合でも総達成数カードは表示される", () => {
      render(<UserMissionAchievements achievements={[]} totalCount={0} />);

      const totalTitle = screen.getByText("🏆総達成数");
      const totalCard = totalTitle.parentElement as HTMLElement;
      expect(within(totalCard).getByText("0")).toBeInTheDocument();
      expect(screen.queryAllByRole("link")).toHaveLength(0);
    });

    it("タイトルは常に表示される", () => {
      render(<UserMissionAchievements achievements={[]} totalCount={0} />);

      expect(screen.getByText("ミッション達成状況")).toBeInTheDocument();
    });
  });

  describe("単一のミッション", () => {
    it("1つのミッションのみの場合も正しく表示される", () => {
      const singleAchievement: MissionAchievementSummary[] = [
        {
          mission_id: "single-mission",
          mission_title: "単一ミッション",
          achievement_count: 7,
        },
      ];

      render(
        <UserMissionAchievements
          achievements={singleAchievement}
          totalCount={7}
        />,
      );

      const totalTitle = screen.getByText("🏆総達成数");
      const totalCard = totalTitle.parentElement as HTMLElement;
      expect(within(totalCard).getByText("7")).toBeInTheDocument();

      const missionLinks = screen.getAllByRole("link");
      expect(missionLinks).toHaveLength(1);
      expect(screen.getByText("単一ミッション")).toBeInTheDocument();
    });
  });

  describe("スタイル", () => {
    it("総達成数のカウントは text-3xl", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );
      const totalTitle = screen.getByText("🏆総達成数");
      const totalCard = totalTitle.parentElement as HTMLElement;
      const countEl = within(totalCard).getByText("9");
      expect(countEl).toHaveClass("text-3xl");
    });

    it("ミッションのカウントは text-2xl", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );
      const titleEl = screen.getByText("テストミッション1");
      const cardRoot = titleEl.parentElement?.parentElement as HTMLElement;
      const countEl = within(cardRoot).getByText("3");
      expect(countEl).toHaveClass("text-2xl");
    });
  });

  describe("境界値", () => {
    it.each([{ c: 0 }, { c: 999 }])(
      "ミッションの達成回数が $c の場合も表示",
      ({ c }) => {
        const single: MissionAchievementSummary[] = [
          {
            mission_id: `m-${c}`,
            mission_title: `count-${c}`,
            achievement_count: c,
          },
        ];
        render(
          <UserMissionAchievements achievements={single} totalCount={c} />,
        );
        const titleEl = screen.getByText(`count-${c}`);
        const cardRoot = titleEl.parentElement?.parentElement as HTMLElement;
        expect(within(cardRoot).getByText(String(c))).toBeInTheDocument();
        expect(within(cardRoot).getByText("回")).toBeInTheDocument();
      },
    );

    it("長いタイトルでも表示される", () => {
      const longTitle = "これは非常に長いミッションタイトルのテストです";
      const single: MissionAchievementSummary[] = [
        {
          mission_id: "m-long",
          mission_title: longTitle,
          achievement_count: 2,
        },
      ];
      render(<UserMissionAchievements achievements={single} totalCount={2} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe("classNameの正当性", () => {
    it("総達成カードで false が混入しない", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );
      const totalTitle = screen.getByText("🏆総達成数");
      const titleDiv = totalTitle as HTMLElement;
      const rootCard = titleDiv.parentElement as HTMLElement;
      expect(titleDiv.className).not.toMatch(/\bfalse\b/);
      expect(rootCard.className).not.toMatch(/\bfalse\b/);
      // isTotalCard のときは text-sm を持たない
      expect(titleDiv).not.toHaveClass("text-sm");
      // isTotalCard のときは border-2 を持つ
      expect(rootCard).toHaveClass("border-2");
    });

    it("ミッションカードで false が混入しない", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );
      const titleDiv = screen.getByText("テストミッション1") as HTMLElement;
      const rootCard = titleDiv.parentElement as HTMLElement;
      expect(titleDiv.className).not.toMatch(/\bfalse\b/);
      expect(rootCard.className).not.toMatch(/\bfalse\b/);
      // 通常カードは text-sm を持つが、border-2 は持たない
      expect(titleDiv).toHaveClass("text-sm");
      expect(rootCard).not.toHaveClass("border-2");
    });
  });
});
